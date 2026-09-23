import {canHandleOpening} from './opening-access.js';
import {openingWorkbenchRecords} from './opening-workbench.js';
import {canOperate} from './operations-specs.js';
import {canReadOperation} from './operations-controls.js';

const businessRoles=['商务','渠道商务'];
const supervisors=['商务主管','媒介主管','系统管理员'];
const text=value=>String(value??'').trim();
const same=(left,right)=>!!text(left)&&text(left)===text(right);
const personId=session=>session.employeeId||session.userId||session.id||(businessRoles.includes(session.role)?session.businessId:null);

// businessId also exists on media sessions in the prototype; it is not their identity.
export function notificationIdentityKey(session={}){
  const id=personId(session);
  if(id)return JSON.stringify(['person',String(id)]);
  return JSON.stringify(['role-person',session.role||'',session.name||'']);
}

function canSeeOpening(session,app,record){
  if(supervisors.includes(session.role))return true;
  if(session.role==='开户媒介')return canHandleOpening(session,app);
  if(businessRoles.includes(session.role))return same(app.businessOwnerId,session.businessId)||same(app.submittedBy,session.name);
  return !!record?.step&&record.step.role===session.role;
}

function openingLink(db,message){
  const explicit=message.params?.applicationId||message.params?.appId||message.applicationId;
  if(explicit)return {applicationId:explicit,app:(db.applications||[]).find(app=>app.id===explicit)};
  const accountId=message.accountId||message.params?.accountId;
  if(!accountId)return {};
  const account=(db.accounts||[]).find(item=>item.id===accountId);
  if(account?.applicationId)return {account,applicationId:account.applicationId,app:(db.applications||[]).find(app=>app.id===account.applicationId)};
  const candidates=(db.applications||[]).filter(app=>(app.rows||[]).some(row=>row.accountId===accountId));
  return {account,...(candidates.length===1?{app:candidates[0],applicationId:candidates[0].id}:{})};
}

function canSeeLegacyOpening(session,message,link){
  if(supervisors.includes(session.role))return true;
  // Orphaned historical notices never grant access based on a customer/subject name.
  if(message.recipientId)return same(message.recipientId,personId(session));
  if(businessRoles.includes(session.role))return same(link.account?.businessOwnerId,session.businessId)||same(message.businessOwnerId,session.businessId)||same(message.submittedBy,session.name);
  return false;
}

function ordinaryRevision(message){
  return JSON.stringify(['notice-v1',message.title||'',message.moduleId||'',message.businessVersion??null,message.requestId??null,message.status??null,message.resolvedAt??null]);
}

function personalRead(db,session,message,legacyRead=false){
  const reads=db.notificationReads?.[notificationIdentityKey(session)];
  return reads&&Object.hasOwn(reads,message.id)?reads[message.id]===message.revision:legacyRead;
}

function openingSummary(db,app,record){
  const rows=app.rows||[],count=status=>rows.filter(row=>row.status===status).length;
  const state=record.node||app.status||'待办理';
  const revision=JSON.stringify(['opening-v1',app.status||'',state,record.total,record.success,record.cancelled,record.remaining,record.supplement,count('失败'),count('未知'),count('待同步'),app.assigneeId||'',app.assignee||'',app.businessOwnerId||'',app.submittedBy||'',!!app.completionConfirmedAt,record.step?.id||'']);
  return {id:'opening-summary:'+app.id,kind:'opening-summary',moduleId:'M06',params:{applicationId:app.id},applicationId:app.id,title:record.customer+' · '+record.shop+' · '+state,customer:record.customer,shop:record.shop,product:record.product,status:state,total:record.total,success:record.success,remaining:record.remaining,supplement:record.supplement,cancelled:record.cancelled,assignee:app.assignee||'',at:app.completionConfirmedAt||app.createdAt,revision};
}

// Projection only: rendering never migrates data, changes shared read flags or emits events.
export function getVisibleNotifications(db,session={}){
  if(!canOperate(session,['*']))return [];
  const records=openingWorkbenchRecords({...db,customers:db.customers||[],subjects:db.subjects||[],shops:db.shops||[],accounts:db.accounts||[]});
  const byId=new Map(records.map(record=>[record.recordId,record]));
  const summaries=(db.applications||[]).filter(app=>canSeeOpening(session,app,byId.get(app.id))).map(app=>openingSummary(db,app,byId.get(app.id)));
  const ordinary=[];
  for(const message of db.notifications||[]){
    if(message.recipientId&&!same(message.recipientId,personId(session)))continue;
    const record=(db.operations?.[message.moduleId]||[]).find(item=>item.id===(message.params?.recordId||message.businessId));
    if(!canReadOperation(session,message.moduleId,record))continue;
    const link=openingLink(db,message),supplement=message.kind==='zongheng-pending'||message.title?.includes('纵横待补');
    if(link.app){
      if(!canSeeOpening(session,link.app,byId.get(link.app.id)))continue;
      if(message.moduleId==='M06'||supplement)continue;
    }else if((message.moduleId==='M06'||supplement||link.applicationId)&&!canSeeLegacyOpening(session,message,link))continue;
    const projected={...message,revision:ordinaryRevision(message)};
    if(link.app)Object.assign(projected,{moduleId:'M06',params:{applicationId:link.app.id}});
    else if(link.applicationId&&message.moduleId==='M06')projected.params={...message.params,applicationId:link.applicationId};
    else if(message.accountId)projected.params={...message.params,accountId:message.accountId};
    if(message.moduleId==='M06'&&!link.app)projected.status='历史通知，原单待核对';
    ordinary.push({...projected,read:personalRead(db,session,projected,!!message.read)});
  }
  return [...summaries.map(message=>({...message,read:personalRead(db,session,message)})),...ordinary]
    .sort((a,b)=>(Date.parse(b.at)||0)-(Date.parse(a.at)||0)||a.id.localeCompare(b.id));
}

// Re-project at the write boundary so stale IDs cannot mark someone else's messages.
export function markNotificationsRead(db,session,notificationId){
  const visible=getVisibleNotifications(db,session).filter(message=>!notificationId||message.id===notificationId);
  if(!visible.length)return 0;
  db.notificationReads||={};
  const key=notificationIdentityKey(session),reads=db.notificationReads[key]||={};
  for(const message of visible)reads[message.id]=message.revision;
  return visible.length;
}
