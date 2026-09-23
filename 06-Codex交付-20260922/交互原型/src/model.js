import {directConflict,getSubjectDirect,subjectSnapshot,supplierValues} from './core-fields.js';
import {canHandleOpening} from './opening-access.js';
export {canHandleOpening} from './opening-access.js';
import {validateOpeningAttachments} from './opening-attachments.js';
export const STORE_KEY='xinhuo-review-prototype-20260921-v1';
export const ROLES=['商务','渠道商务','商务主管','媒介主管','开户媒介','充值媒介','财务','Boss','人事','系统管理员'];
export const PRODUCTS=['本地推','巨量AD','腾讯K4','快手'];
export const platformFor=p=>p?.includes('腾讯')?'tencent':p?.includes('快手')?'kuaishou':p?.includes('本地推')||p?.includes('巨量')?'ocean':null;
export const supplierEligible=(db,id,product)=>{const s=db.suppliers.find(x=>x.id===id);return !!s&&s.active!==false&&(db.supplierCapabilities?.[id]||s.products||[]).includes(product)};
export function workflowFor(db,product,region){
  const specificity=c=>c.scopeMode==='product-region'&&c.product===product&&c.region===region?3:c.scopeMode==='product'&&c.product===product?2:c.scopeMode==='global'?1:0;
  return [db.config,...(db.config.history||[])].filter(c=>specificity(c)>0).sort((a,b)=>specificity(b)-specificity(a)||b.version-a.version)[0]||null;
}
export const normalizeName=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
export const uid=p=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
export function freshState(seed){
  const db=structuredClone(seed);
  db.applications=[];db.audit=[];db.operations={};db.finance={wallets:[],receipts:[],orders:[],events:[],credits:[],records:{}};
  db.config={version:1,draftVersion:2,scopeMode:'global',product:'',region:'全局默认',fields:[{id:'region',label:'办理区域',required:true},{id:'attachments',label:'开户资料',required:false}],steps:[{id:'s1',name:'商务申请',role:'商务'},{id:'s2',name:'主管派单',role:'媒介主管'},{id:'s3',name:'媒介办理',role:'开户媒介'},{id:'s4',name:'完成归档',role:'系统'}]};
  db.notifications=[{id:'welcome',title:'新一轮原型评审：真实历史样本与本地演示已分开',moduleId:'M01',read:false,at:new Date().toISOString()}];
  db.directCandidates=[];db.supplierCapabilities={};db.provenanceVersion=2;
  return db;
}
export function customerAccounts(db,id){return db.accounts.filter(a=>a.customerId===id)}
export function sharedAccounts(db,id,shopId,subjectId){
  const subjectIds=db.subjects.filter(s=>s.customerIds.includes(id)).map(s=>s.id);
  return db.accounts.filter(a=>a.customerId!==id&&subjectIds.includes(a.subjectId)&&(!shopId||a.shopId===shopId)&&(!subjectId||a.subjectId===subjectId));
}
export function allowed(session,action){
  const map={create:['商务','渠道商务','商务主管','系统管理员'],assign:['媒介主管','系统管理员'],execute:['开户媒介','系统管理员'],edit:['开户媒介','媒介主管','系统管理员'],transfer:['商务主管','系统管理员'],supplier:['媒介主管','系统管理员']};
  return (map[action]||[]).includes(session.role);
}
export function canAccount(session,a){return ['商务主管','Boss','系统管理员'].includes(session.role)||a.businessOwnerId===session.businessId||a.collaborators?.some(c=>c.id===session.businessId)}
export function validateOpening(db,form){
  const errors=[],rows=Array.isArray(form.rows)?form.rows:[];
  if(!db.customers.some(c=>c.id===form.customerId))errors.push('请选择已登记客户。');
  if(!form.product)errors.push('请选择产品。');
  if(form.product!=='本地推'&&rows.some(r=>r.directId||r.directName))errors.push('当前产品不适用直客，请清除其他产品残留字段。');
  const subject=db.subjects.find(s=>s.id===form.subjectId);
  if(!subject?.customerIds.includes(form.customerId))errors.push('主体尚未关联到本次客户。');
  const shop=db.shops.find(s=>s.id===form.shopId);
  if(!shop||shop.subjectId!==form.subjectId)errors.push('请选择本主体下的店铺或业务档案。');
  if(db.shops.filter(s=>s.subjectId===form.subjectId).length>1)errors.push('该主体存在历史多店关系冲突，请核对后办理；不会自动合并或选择第一项。');
  if(!form.region)errors.push('请选择办理区域。');
  if(!rows.length)errors.push('开户数量至少为 1。');
  if(form.requestedCount!==undefined&&(!Number.isInteger(form.requestedCount)||form.requestedCount<1||form.requestedCount!==rows.length))errors.push('开户数量必须为正整数，并与本次生成的账户任务数量一致。');
  if(form.product==='本地推'){
    const direct=getSubjectDirect(db,form.subjectId),conflict=directConflict(db,direct.directId,{subjectId:form.subjectId});
    if(conflict)errors.push(conflict);
    if(rows.some(row=>row.directId&&String(row.directId).trim()!==direct.directId))errors.push('直客资料由主体统一维护，不允许申请行使用不同直客；请刷新主体资料。');
  }
  for(const row of rows){
    if(row.supplierId&&!supplierEligible(db,row.supplierId,form.product))errors.push('供应商已停用或不适用于本产品，请重新选择。');
  }
  return [...new Set(errors)];
}
const CORE_STEPS=['s1','s2','s3','s4'];
const openingRowsHandled=app=>app.rows.length>0&&app.rows.every(r=>['成功','已取消'].includes(r.status));
const pendingOpeningSteps=app=>(app.flowSnapshot||[]).filter(s=>!CORE_STEPS.includes(s.id)&&!app.configApprovals?.[s.id]);
function updateOpeningStatus(app){
  const states=app.rows.map(r=>r.status);
  if(openingRowsHandled(app)){
    if(app.completionMode==='manual'&&!app.completionConfirmedAt)app.status='待确认完成';
    else if(pendingOpeningSteps(app).length&&(app.completionMode==='manual'||states.includes('成功')))app.status='开户已完成，流程待复核';
    else app.status=states.every(s=>s==='已取消')?'已取消':'全部完成';
  }else app.status=states.includes('未知')?'有未知待核查':states.includes('待同步')?'待同步':states.includes('成功')?'部分完成':states.length&&states.every(s=>s==='失败')?'全部失败':'办理中';
  return app.status;
}
export function completeOpeningApplication(db,appId,session,{note}={}){
  const app=db.applications.find(a=>a.id===appId);
  if(!app)throw Error('找不到申请单。');
  if(!canHandleOpening(session,app))throw Error('仅本单被指派的开户媒介或系统管理员可以完成本次开户。');
  if(app.completionConfirmedAt||['全部完成','已取消'].includes(app.status))throw Error('本申请已经完成，不能重复确认。');
  if(!openingRowsHandled(app))throw Error('请先处理全部申请行；未办、失败、未知或待同步行不能完成本次开户。');
  if(app.requestedCount!==undefined&&(!Number.isInteger(app.requestedCount)||app.requestedCount!==app.rows.length))throw Error('申请数量与开户明细数量不一致，请核对原单。');
  if(app.rows.some(r=>r.status==='成功'&&!db.accounts.some(a=>a.id===r.accountId&&a.applicationId===app.id&&a.externalId===r.externalId)))throw Error('成功行缺少对应广告账户，请先核对同步结果。');
  const executeIndex=(app.flowSnapshot||[]).findIndex(s=>s.id==='s3');
  const missing=(app.flowSnapshot||[]).find((s,i)=>(executeIndex<0||i<executeIndex)&&!CORE_STEPS.includes(s.id)&&!app.configApprovals?.[s.id]);
  if(missing)throw Error('请先完成前序配置步骤：'+missing.name);
  const at=new Date().toISOString(),actor=session.name||session.role;
  app.completionConfirmedAt=at;app.completionConfirmedBy=actor;app.completionNote=String(note||'').trim();
  app.events.push({at,actor,text:'完成本次开户：成功 '+app.rows.filter(r=>r.status==='成功').length+' 户，取消 '+app.rows.filter(r=>r.status==='已取消').length+' 户'+(app.completionNote?'；说明：'+app.completionNote:'')+'（本地演示）'});
  updateOpeningStatus(app);
  db.notifications||=[];
  for(const message of db.notifications)if(message.moduleId==='M06'&&message.params?.applicationId===app.id&&!message.resolvedAt){message.read=true;message.resolvedAt=at;message.resolvedBy=actor;}
  db.notifications.unshift({id:uid('NOTE'),kind:'opening-completion',title:'开户申请 '+app.id+' · '+app.status,moduleId:'M06',params:{applicationId:app.id},read:false,at});
  return app;
}
export function assignOpening(db,appId,assignee,role){
  const app=db.applications.find(a=>a.id===appId);
  if(!app)throw Error('找不到申请单。');
  if(app.rows.every(r=>['成功','已取消'].includes(r.status)))throw Error('已终结申请不能重新派单。');
  if(!allowed({role},'assign'))throw Error('请由媒介主管指派。');
  if(!assignee?.trim())throw Error('请选择办理媒介。');
  const flow=app.flowSnapshot||[],index=flow.findIndex(s=>s.id==='s2');
  const missing=flow.slice(0,index<0?0:index).find(s=>!CORE_STEPS.includes(s.id)&&!app.configApprovals?.[s.id]);
  if(missing)throw Error('请先办理前序步骤：'+missing.name);
  if(app.rows.some(r=>['未知','待同步'].includes(r.status)))throw Error('先由当前办理人核查未知或待同步结果，再调整派单。');
  app.assignee=assignee.trim();app.status=app.rows.some(r=>r.status==='成功')?'部分完成':'待媒介办理';
  app.events.push({at:new Date().toISOString(),text:'媒介主管派单：'+app.assignee+'（演示）'});
}
export function approveOpeningStep(db,appId,stepId,role,session){
  const app=db.applications.find(a=>a.id===appId),flow=app?.flowSnapshot||[],index=flow.findIndex(s=>s.id===stepId),step=flow[index];
  if(!step||CORE_STEPS.includes(stepId))throw Error('找不到可手动办理的额外步骤。');
  if(role!==step.role&&role!=='系统管理员')throw Error('该节点需要 '+step.role+' 办理。');
  if(session&&session.role!==role)throw Error('当前办理身份与角色不一致。');
  if(role==='开户媒介'&&session&&!canHandleOpening(session,app))throw Error('只能办理指派给自己的开户申请。');
  if(app.configApprovals?.[stepId])throw Error('该步骤已经完成。');
  for(const previous of flow.slice(0,index)){
    if(previous.id==='s2'&&!app.assignee)throw Error('请先完成主管派单。');
    if(previous.id==='s3'&&!app.rows.every(r=>['成功','失败','已取消'].includes(r.status)))throw Error('请先核实并处理全部开户结果。');
    if(previous.id==='s3'&&app.completionMode==='manual'&&!app.completionConfirmedAt)throw Error('请先由本单媒介点击“完成本次开户”，再办理后置配置步骤。');
    if(!CORE_STEPS.includes(previous.id)&&!app.configApprovals?.[previous.id])throw Error('请先办理前序步骤：'+previous.name);
  }
  app.configApprovals={...app.configApprovals,[stepId]:true};
  app.events.push({at:new Date().toISOString(),text:'完成配置步骤：'+step.name+'；办理角色：'+role+'（演示）'});
  if(openingRowsHandled(app))updateOpeningStatus(app);
}
export function cancelOpeningRow(db,appId,rowId,reason,session){
  const app=db.applications.find(a=>a.id===appId),row=app?.rows.find(r=>r.id===rowId);
  if(!row)throw Error('找不到申请行。');
  if(!['商务','渠道商务','商务主管','开户媒介','媒介主管','系统管理员'].includes(session.role))throw Error('当前角色不能取消开户行。');
  if(session.role==='开户媒介'&&!canHandleOpening(session,app))throw Error('仅本单被指派的开户媒介可以取消申请行。');
  if(!['待办理','失败','未提交'].includes(row.status))throw Error('外部处理中、未知、待同步或成功行不能直接取消。');
  if(!String(reason||'').trim())throw Error('取消需要填写原因。');
  row.status='已取消';row.cancelReason=String(reason).trim();app.events.push({at:new Date().toISOString(),text:(session.name||session.role)+'取消申请行 '+row.id+'；原因：'+row.cancelReason});
  updateOpeningStatus(app);
}
export const OPENING_REGIONS=['华南','华北','华东','西北','西南','华中'];
function attachmentSubjectErrors(files,subjectId){
  return files.filter(file=>file.subjectId&&file.subjectId!==subjectId).map(file=>'附件「'+file.name+'」属于其他主体，请重新上传当前主体资料。');
}
export function openingFieldErrors(workflow,form){
  const fields=workflow?.fields||[],errors=[];
  // 内置采集控件有固定业务语义；兼容曾发布的错误类型，不改写历史配置。
  const region=String(form.region??'').trim();
  if(!region)errors.push('请选择办理区域。');
  else if(!OPENING_REGIONS.includes(region))errors.push('请选择有效的办理区域。');
  errors.push(...validateOpeningAttachments(form.attachments||[],workflow,form.product,'submit'));
  errors.push(...attachmentSubjectErrors(form.attachments||[],form.subjectId));
  return errors.concat(fields.filter(f=>!['region','attachments'].includes(f.id)&&f.visible!==false).flatMap(f=>{
    const value=form.subjectSnapshot?.[f.id]??form.customValues?.[f.id];
    const text=String(value??'').trim();
    if(!text)return f.required?['请填写配置必填资料：'+f.label]:[];
    if(f.type==='number'&&!Number.isFinite(Number(text)))return ['配置字段需填写有效数字：'+f.label];
    if(f.type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(text)||Number.isNaN(Date.parse(text))||new Date(text).toISOString().slice(0,10)!==text))return ['配置字段需填写有效日期：'+f.label];
    if(f.type==='select'&&!(f.options||[]).includes(text))return ['请从配置选项选择：'+f.label];
    return [];
  }));
}
export function finishOpening(db,appId,rowId,outcome,values={},session){
  const app=db.applications.find(a=>a.id===appId),row=app?.rows.find(r=>r.id===rowId);
  if(!row)throw Error('找不到原申请行。');
  if(session&&!canHandleOpening(session,app))throw Error('仅本单被指派的开户媒介或系统管理员可以办理。');
  if(row.status==='成功')throw Error('成功行不能重复执行。');
  if(row.status==='已取消')throw Error('已取消行不能执行，请另行发起申请。');
  if(!app.assignee)throw Error('请先由媒介主管派单。');
  if(row.status==='待同步'&&outcome!=='成功')throw Error('已确认外部成功的行只能补同步，不能重新执行或改成未知。');
  if(!['成功','待同步','未知','失败','核实未发生'].includes(outcome))throw Error('无效的开户结果。');
  const reconciling=['待同步','未知'].includes(row.status);
  if(reconciling&&!row.requestSnapshot)throw Error('缺少原请求身份快照，请先核查原请求，不能用当前资料重建历史。');
  if(!reconciling&&!row.supplierId)throw Error('媒介执行前必须确认本行供应商。');
  if(!reconciling&&!supplierEligible(db,row.supplierId,app.product))throw Error('该供应商已停用或不支持本产品。');
  if(!reconciling&&['成功','待同步','未知'].includes(outcome)){
    const attachmentErrors=[...validateOpeningAttachments(app.attachments||[],{fields:app.fieldSnapshot||[],attachmentPolicies:app.attachmentPolicySnapshot||null},app.product,'execution'),...attachmentSubjectErrors(app.attachments||[],app.subjectId)];
    if(attachmentErrors.length)throw Error(attachmentErrors.join('；'));
  }
  const currentDirect=app.product==='本地推'?getSubjectDirect(db,app.subjectId):{directId:'',directName:'',directEvidence:''};
  if(!reconciling){
    if(!db.subjects.some(s=>s.id===app.subjectId))throw Error('开户主体已不存在，请核对原申请。');
    if(!db.shops.some(s=>s.id===app.shopId&&s.subjectId===app.subjectId))throw Error('店铺与主体关系不一致，请核对原申请。');
    if(db.shops.filter(s=>s.subjectId===app.subjectId).length>1)throw Error('该主体存在历史多店关系冲突，请核对后办理；不会自动合并或选择第一项。');
    const conflict=directConflict(db,currentDirect.directId,{subjectId:app.subjectId,applicationId:app.id,rowId:row.id});if(conflict)throw Error('执行前直客复核：'+conflict);
  }
  const executeIndex=(app.flowSnapshot||[]).findIndex(s=>s.id==='s3');
  const incomplete=(app.flowSnapshot||[]).filter((s,i)=>(executeIndex<0||i<executeIndex)&&!['s1','s2','s3','s4'].includes(s.id)&&!app.configApprovals?.[s.id]);
  if(incomplete.length)throw Error('请先完成配置的额外流程步骤：'+incomplete.map(s=>s.name).join('、'));
  if(outcome==='失败'&&row.status==='未知')throw Error('未知结果需核实原请求，不能直接宣布失败。');
  if(outcome==='核实未发生'){
    if(row.status!=='未知')throw Error('仅未知结果可核实为未发生。');
    if(!values.verificationReason?.trim())throw Error('请填写核实未发生的依据。');
    row.verifications=[...(row.verifications||[]),{at:new Date().toISOString(),requestId:row.requestId,reason:values.verificationReason.trim(),conclusion:'未发生'}];
    app.events.push({at:new Date().toISOString(),text:'核实原请求 '+row.requestId+' 未发生；依据：'+values.verificationReason.trim()});
    outcome='失败';
  }
  const shop=db.shops.find(s=>s.id===app.shopId);
  // New requests take the subject's current shared direct ID. Locked requests keep exact values, including null.
  const requestId=reconciling?row.requestId:uid('LOCAL-REQ');
  const requestSnapshot=reconciling?row.requestSnapshot:{supplierId:row.supplierId,supplierSnapshot:{id:row.supplierId,...supplierValues(db.suppliers.find(s=>s.id===row.supplierId))},subjectSnapshot:subjectSnapshot(db,app.subjectId),directId:currentDirect.directId||null,directName:currentDirect.directName||null,directEvidence:currentDirect.directEvidence||null,directSource:app.product==='本地推'?'主体当前资料，平台未联机核验':null,shopId:app.shopId,laikeId:shop?.laikeId||null,laikeName:shop?.name||null,at:new Date().toISOString()};
  let result=null;
  if(outcome==='成功'||outcome==='待同步'){
    const snapshot=row.status==='待同步'?row.externalResult:null;
    if(row.status==='待同步'&&!snapshot)throw Error('缺少原成功结果快照，请核查原请求后补录。');
    if(snapshot&&((Object.hasOwn(values,'externalId')&&String(values.externalId??'').trim()!==snapshot.externalId)||(Object.hasOwn(values,'name')&&String(values.name??'').trim()!==snapshot.name)))throw Error('待同步结果已锁定，不能修改账户身份。');
    const id=String(snapshot?.externalId??values.externalId??row.externalId??'').trim();
    const name=String(snapshot?.name??values.name??row.name??'').trim();
    if(!id)throw Error('成功结果必须填写完整广告账户 ID；账户名称可空。');
    const same=db.accounts.find(a=>a.externalId===id&&platformFor(a.product)===platformFor(app.product));
    if(same)throw Error('广告账户 ID 重复，已关联 '+same.name+'，不能跨供应商重建。');
    if(db.applications.some(a=>a.id!==app.id&&platformFor(a.product)===platformFor(app.product)&&a.rows.some(r=>r.externalId===id&&['待同步','未知','成功'].includes(r.status))))throw Error('该结果 ID 已存在其他在途或成功申请。');
    if(app.rows.some(r=>r.id!==row.id&&r.externalId===id&&['待同步','未知','成功'].includes(r.status)))throw Error('同一申请内账户 ID 重复。');
    const effectiveZh=String(values.zonghengId??snapshot?.zonghengId??row.zonghengId??'').trim()||null;
    if(snapshot?.zonghengId&&effectiveZh!==snapshot.zonghengId)throw Error('待同步纵横身份已锁定，不能覆盖原成功结果。');
    const effectiveDirect=snapshot?snapshot.directId:requestSnapshot.directId;
    const zhConflict=zonghengConflict(db,effectiveZh,{applicationId:app.id,rowId:row.id});if(zhConflict)throw Error(zhConflict);
    const conflict=directConflict(db,effectiveDirect,{subjectId:app.subjectId,applicationId:app.id,rowId:row.id});if(conflict)throw Error('直客关系复核：'+conflict);
    result={id,name,zonghengId:effectiveZh,externalResult:snapshot||{...structuredClone(requestSnapshot),externalId:id,name,zonghengId:effectiveZh,requestId,at:new Date().toISOString()}};
  }
  if(!reconciling){
    row.requestHistory=[...(row.requestHistory||[]),...(row.requestId?[{requestId:row.requestId,status:row.status,requestSnapshot:structuredClone(row.requestSnapshot)}]:[])];
    row.requestId=requestId;row.requestSnapshot=requestSnapshot;
  }
  if(result){
    const {id,name,zonghengId,externalResult}=result;row.externalId=id;row.name=name;row.zonghengId=zonghengId;row.externalResult=externalResult;
    if(outcome==='成功'){
      const account={id:uid('LOCAL-AC'),externalId:id,name,customerId:app.customerId,subjectId:app.subjectId,shopId:row.externalResult.shopId,product:app.product,productCode:'LOCAL',supplierId:row.externalResult.supplierId,businessOwnerId:app.businessOwnerId,businessOwnerName:app.businessOwnerName,directId:row.externalResult.directId,zonghengId:row.zonghengId,status:'开户完成',source:'本地原型演示，未提交媒体平台',demo:true,applicationId:app.id,openingIdentitySnapshot:structuredClone(row.externalResult)};
      account.directName=row.externalResult.directName||null;account.directEvidence=row.externalResult.directEvidence||null;account.directSource=row.externalResult.directSource||null;account.handlingPath=app.handlingPath||'人工办理';account.objectType=app.objectType||'普通广告账户';account.channelId=app.channelId||null;
      db.accounts.unshift(account);row.accountId=account.id;
      if(app.product==='本地推'&&!account.zonghengId)db.notifications.unshift({id:uid('NOTE'),kind:'zongheng-pending',title:(account.name||account.externalId)+' · 纵横待补',moduleId:'M05',accountId:account.id,params:{accountId:account.id},read:false,at:new Date().toISOString()});
    }
  }
  row.status=outcome;
  app.events.push({at:new Date().toISOString(),text:'申请行 '+row.id+'：'+outcome+'（本地演示）'});
  updateOpeningStatus(app);
}
function zonghengConflict(db,value,{accountId,applicationId,rowId}={}){
  const id=String(value||'').trim();if(!id)return '';
  if(db.accounts.some(a=>a.id!==accountId&&String(a.zonghengId||'').trim()===id))return '纵横 ID 已绑定其他账户。';
  const conflict=db.applications.some(app=>app.rows.some(row=>{
    if(app.id===applicationId&&row.id===rowId||accountId&&row.accountId===accountId)return false;
    if(!['成功','待同步','未知'].includes(row.status))return false;
    // 已落库账户以当前资料为准；原执行快照只保留历史，不继续占用更正前的编号。
    if(row.status==='成功'&&db.accounts.some(a=>a.id===row.accountId))return false;
    return String(row.externalResult?.zonghengId??row.zonghengId??row.requestSnapshot?.zonghengId??'').trim()===id;
  }));
  return conflict?'纵横 ID 已被其他账户的有效结果使用。':'';
}
export function saveAccountZongheng(db,accountId,value,{session,note}={}){
  const account=db.accounts.find(a=>a.id===accountId);
  if(!account)throw Error('找不到广告账户。');
  if(!session||!allowed(session,'edit'))throw Error('当前角色没有媒介资料维护权限。');
  const application=db.applications.find(app=>app.id===account.applicationId||app.rows.some(row=>row.accountId===accountId));
  if(session.role==='开户媒介'&&application&&!canHandleOpening(session,application))throw Error('只能维护本人开户申请的账户资料。');
  if(account.product!=='本地推')throw Error('当前产品不适用纵横资料。');
  const id=String(value??'').trim();if(!id)throw Error('请输入纵横 ID。');
  const conflict=zonghengConflict(db,id,{accountId});if(conflict)throw Error(conflict);
  const at=new Date().toISOString(),actor=session.name||session.role,before=account.zonghengId||null,remark=String(note||'').trim();
  account.zonghengId=id;account.localChange=true;
  if(before!==id)account.changes=[...(account.changes||[]),{at,actor,before:{zonghengId:before},after:{zonghengId:id},text:'纵横更正：'+(before||'未登记')+' → '+id+(remark?'；备注：'+remark:'')}];
  for(const app of db.applications)for(const row of app.rows)if(row.accountId===accountId){row.zonghengId=id;if(before!==id)app.events.push({at,actor,text:'账户 '+account.externalId+' 补充 / 更正纵横：'+id+(remark?'；备注：'+remark:'')});}
  for(const message of db.notifications||[])if((message.accountId===accountId||message.params?.accountId===accountId)&&(message.kind==='zongheng-pending'||message.title?.includes('纵横待补'))){message.read=true;message.resolvedAt=at;message.resolvedBy=actor;}
  return account;
}
export function addCustomer(db,name){
  const clean=String(name||'').trim();
  if(!clean)throw Error('请输入客户名称。');
  const found=db.customers.find(c=>normalizeName(c.name)===normalizeName(clean));
  if(found)throw Error('客户名称重复，请复用：'+found.name+'（'+found.id+'）');
  const c={id:uid('LOCAL-C'),name:clean,kind:null,kindVerified:false,source:'本地演示新建',demo:true};db.customers.push(c);return c;
}
