import {canHandleOpening} from './opening-access.js';
import {validateSubjectIndustry} from './industry-dictionary.js';
// Public records and application snapshots are deliberately separate.
const clean=v=>String(v??'').trim();
const normal=v=>clean(v).normalize('NFKC').replace(/\s+/g,'').toLowerCase();
const nextId=p=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
const now=()=>new Date().toISOString();
export const SUBJECT_FIELDS=[['name','主体名称'],['directId','直客 ID（非必填）'],['creditCode','统一社会信用代码'],['industry','行业'],['bankName','主体开户银行名称'],['bankAccount','主体银行账号'],['registeredAddress','主体住所'],['contactName','联系人'],['contactPhone','联系电话'],['licenseName','营业执照 / 证照名称'],['licenseEvidence','证照来源 / 核对依据']];
export const SUPPLIER_FIELDS=[['agentName','代理商名称'],['agentId','代理商 ID'],['platformScope','平台范围'],['bankAccount','供应商银行账号'],['bankName','开户行 / 支行名称'],['bankAddress','开户行地址']];
export const canMaintainPublic=session=>['商务','渠道商务','商务主管','开户媒介','媒介主管','系统管理员'].includes(session.role);
export const canMaintainSupplier=session=>['开户媒介','媒介主管','系统管理员'].includes(session.role);
function requirePublic(session){if(!canMaintainPublic(session))throw Error('当前角色无权维护公共资料。');}
function version(record,before,after,reason,session){record.versions=[...(record.versions||[]),{at:now(),before,after,reason:clean(reason),actor:session.name||session.role}];record.localChange=true;record.recordVersion=(record.recordVersion||0)+1;record.updatedAt=now();}
function applicationContext(db,applicationId,{subjectId,shopId,session}={}){
  if(!applicationId)return null;
  const app=(db.applications||[]).find(item=>item.id===applicationId);
  if(!app)throw Error('开户申请已不存在，请重新打开原单。');
  if(!subjectId||app.subjectId!==subjectId||shopId&&app.shopId!==shopId)throw Error('资料与当前申请不一致，请重新打开原单。');
  if(session?.role==='开户媒介'&&!canHandleOpening(session,app))throw Error('只能维护指派给自己的开户申请资料。');
  return app;
}
function appendApplicationNote(application,note,session,source){
  if(!application||!clean(note))return;
  application.events=[...(application.events||[]),{at:now(),actor:session.name||session.role,type:'flow-note',source,text:'流转备注：'+clean(note)}];
}
export function subjectValues(subject={}){return Object.fromEntries(SUBJECT_FIELDS.map(([key])=>[key,clean(subject[key])]));}
export function saveSubject(db,values,{id,customerId,reason,session,applicationId}={}){
  requirePublic(session);const data=subjectValues(values);data.creditCode=data.creditCode.replace(/\s+/g,'').toUpperCase();
  const existing=id?db.subjects.find(s=>s.id===id):null;
  const application=applicationContext(db,applicationId,{subjectId:id,session});
  if(existing){data.licenseEvidence=clean(existing.licenseEvidence);if(!Object.hasOwn(values,'industry'))data.industry=clean(existing.industry);}
  validateSubjectIndustry(db,data.industry,existing?.industry);
  // Older callers editing other public fields must not silently clear the subject's direct ID.
  if(existing&&!Object.hasOwn(values,'directId'))data.directId=clean(existing.directId);
  if(!data.name)throw Error('请填写法律主体名称。');
  if(data.contactPhone&&!/^[+\d\s()（）-]+$/.test(data.contactPhone))throw Error('联系电话请填写数字、区号及合理的连接符。');
  const codeHit=data.creditCode&&db.subjects.find(s=>s.id!==id&&clean(s.creditCode).replace(/\s+/g,'').toUpperCase()===data.creditCode);
  if(codeHit)throw Error('信用代码已登记在主体「'+codeHit.name+'」，请关联已有主体 #'+codeHit.id+'。');
  const nameHit=db.subjects.find(s=>s.id!==id&&normal(s.name)===normal(data.name));
  if(nameHit)throw Error('同名主体已存在，请先核验证照并关联「'+nameHit.name+'」 #'+nameHit.id+'。');
  let record=id?db.subjects.find(s=>s.id===id):null;if(id&&!record)throw Error('主体已不存在，请重新选择。');
  const conflict=directConflict(db,data.directId,{subjectId:id,session});if(conflict)throw Error(conflict);
  const directChanged=clean(record?.directId)!==data.directId;
  const directEvidence=Object.hasOwn(values,'directEvidence')?clean(values.directEvidence):clean(record?.directEvidence);
  if(!record){record={id:nextId('LOCAL-S'),customerIds:[],source:'本地原型新建公共主体，未提交生产',demo:true};db.subjects.push(record);}
  const before={...subjectValues(record),directEvidence:clean(record.directEvidence)};Object.assign(record,data,{directEvidence});if(customerId&&!record.customerIds.includes(customerId))record.customerIds.push(customerId);
  version(record,before,{...data,directEvidence},reason||'主体资料更新',session);
  if(directChanged||before.name!==data.name)syncSubjectDirect(db,record,'主体资料更新',session,clean(reason)?applicationId:undefined);
  appendApplicationNote(application,reason,session,'主体资料');
  return record;
}
export function linkSubject(db,subjectId,customerId,session){requirePublic(session);const subject=db.subjects.find(s=>s.id===subjectId);if(!subject||!db.customers.some(c=>c.id===customerId))throw Error('请选择有效客户和公共主体。');if(!subject.customerIds.includes(customerId)){const before=[...subject.customerIds];subject.customerIds.push(customerId);version(subject,{customerIds:before},{customerIds:[...subject.customerIds]},'关联已有主体，不复制资料',session);}return subject;}
export function saveShop(db,values,{id,subjectId,reason,session,applicationId}={}){
  const application=applicationContext(db,applicationId,{subjectId,shopId:id,session});
  requirePublic(session);const data=Object.fromEntries(['name','businessAddress','laikeName','laikeId'].map(k=>[k,clean(values[k])]));
  data.laikeName=data.name;
  if(!data.name)throw Error('请填写店铺 / 业务档案名称。');if(!db.subjects.some(s=>s.id===subjectId))throw Error('请先选择主体。');
  if(db.shops.some(s=>s.id!==id&&s.subjectId===subjectId&&normal(s.name)===normal(data.name)))throw Error('同主体已有同名店铺 / 档案，请复用。');
  let record=id?db.shops.find(s=>s.id===id):null;if(id&&!record)throw Error('店铺已不存在。');
  if(record&&record.subjectId!==subjectId)throw Error('店铺主体关系不允许通过资料编辑改挂，请核对原始关系。');
  if(!record&&db.shops.some(s=>s.subjectId===subjectId))throw Error('一个主体只能对应一个店铺；该主体已有店铺，请复用。历史多店须核对，不自动合并或选择第一项。');
  const changedLaike=clean(record?.laikeId)!==data.laikeId||clean(record?.laikeName)!==data.laikeName;
  // 来客名称就是店铺名称；来客 ID 可空，不另造平台名称或编号。
  const cross=data.laikeId&&db.shops.filter(s=>s.id!==id&&s.laikeId===data.laikeId);
  if(cross?.length&&!values.crossShopAcknowledged)throw Error('该来客出现在其他店铺，请勾选已核对跨店冲突；不会自动合并资料。');
  if(!record){record={id:nextId('LOCAL-T'),subjectId,legacyNo:null,source:'本地原型新建店铺 / 业务档案',demo:true};db.shops.push(record);}
  const before=Object.fromEntries(Object.keys(data).map(k=>[k,record[k]||'']));Object.assign(record,data);version(record,before,data,reason||'店铺资料更新',session);
  if(changedLaike){record.laikeVerified=false;record.laikeSource='人工维护，平台尚未联机核验';for(const app of db.applications||[])if(app.shopId===record.id&&!['全部完成','已取消'].includes(app.status)){if(app.id!==applicationId||!clean(reason))app.events=[...(app.events||[]),{at:now(),text:'店铺资料已更新',actor:session.name||session.role}];db.notifications?.unshift({id:nextId('N'),title:'开户申请店铺资料更正，执行前请核验',moduleId:'M06',params:{applicationId:app.id},read:false,at:now()});}}
  appendApplicationNote(application,reason,session,'店铺资料');
  return record;
}
export function supplierValues(s={}){return Object.fromEntries(SUPPLIER_FIELDS.map(([key])=>[key,clean(s[key])]));}
export function saveSupplier(db,id,values,{reason,session}={}){if(!canMaintainSupplier(session))throw Error('供应商平台与银行资料需授权媒介维护。');const record=db.suppliers.find(s=>s.id===id);if(!record)throw Error('找不到供应商。');if(!clean(reason))throw Error('请填写供应商资料来源 / 更正依据。');const data=supplierValues(values);if(data.agentId&&!data.platformScope)throw Error('填写代理商 ID 时需要同时说明平台范围。');const before=supplierValues(record);Object.assign(record,data);version(record,before,data,reason,session);return record;}
export function getSubjectDirect(db,subjectId){const subject=db.subjects.find(s=>s.id===subjectId);return {directId:clean(subject?.directId),directName:clean(subject?.name),directEvidence:clean(subject?.directEvidence)};}
export function directConflict(db,id,{subjectId,applicationId,rowId,accountId}={}){
  id=clean(id);if(!id)return '';
  const subject=db.subjects.find(s=>s.id!==subjectId&&clean(s.directId)===id);
  if(subject)return '直客 ID 已关联其他主体「'+subject.name+'」，请核对主体关系。';
  // Historical account references and locked requests remain evidence. Never guess their subject.
  const account=(db.accounts||[]).find(a=>a.id!==accountId&&(!subjectId||a.subjectId!==subjectId)&&clean(a.directId)===id);
  if(account)return '直客 ID 已在其他主体或主体待核对的广告账户 '+account.externalId+' 登记，请核对原关系。';
  for(const app of db.applications||[]){
    if(subjectId&&app.subjectId===subjectId)continue;
    for(const row of app.rows||[]){
      if((app.id===applicationId&&row.id===rowId)||['失败','已取消'].includes(row.status))continue;
      const directId=['未知','待同步','成功'].includes(row.status)&&row.requestSnapshot?row.requestSnapshot.directId:row.directId;
      if(clean(directId)===id)return '直客 ID 已被其他主体的在途申请 '+app.id+' 使用，请核对主体关系。';
    }
  }
  return '';
}
const editableDirectRow=row=>['待办理','失败','未提交'].includes(row.status);
function syncSubjectDirect(db,subject,reason,session,noteApplicationId){
  const after=getSubjectDirect(db,subject.id),actor=session.name||session.role;
  for(const account of db.accounts||[]){
    if(account.subjectId!==subject.id||account.product!=='本地推')continue;
    const before={directId:clean(account.directId),directName:clean(account.directName),directEvidence:clean(account.directEvidence)};
    if(JSON.stringify(before)===JSON.stringify(after))continue;
    Object.assign(account,after,{directSource:'主体当前资料，平台未联机核验',localChange:true});
    account.changes=[...(account.changes||[]),{at:now(),actor,before,after:{...after},reason:clean(reason),text:'主体直客资料更正；当前展示同步，账户归属和开户历史快照保留'}];
  }
  for(const app of db.applications||[]){
    if(app.subjectId!==subject.id||app.product!=='本地推')continue;
    for(const row of app.rows||[]){
      if(!editableDirectRow(row))continue;
      const before={directId:clean(row.directId),directName:clean(row.directName),directEvidence:clean(row.directEvidence)};
      Object.assign(row,after,{directSource:'主体当前资料，平台未联机核验'});
      row.directChanges=[...(row.directChanges||[]),{at:now(),before,after:{...after},actor,reason:clean(reason)}];
    }
    if(app.id!==noteApplicationId)app.events=[...(app.events||[]),{at:now(),actor,text:'主体直客资料已更新'}];
    if(!['全部完成','已取消'].includes(app.status))db.notifications?.unshift({id:nextId('N'),title:'开户主体直客资料已更正，请核对当前资料与原请求',moduleId:'M06',params:{applicationId:app.id},read:false,at:now()});
  }
}
export function saveSubjectDirect(db,subjectId,values,{reason,session,applicationId}={}){
  requirePublic(session);const subject=db.subjects.find(s=>s.id===subjectId);if(!subject)throw Error('请选择有效主体。');
  const note=clean(reason)||clean(values.evidence),application=applicationContext(db,applicationId,{subjectId,session});
  const id=Object.hasOwn(values,'id')?clean(values.id):clean(subject.directId);
  const conflict=directConflict(db,id,{subjectId});if(conflict)throw Error(conflict);
  const before=getSubjectDirect(db,subjectId);subject.directId=id;
  const after=getSubjectDirect(db,subjectId);version(subject,before,after,note,session);syncSubjectDirect(db,subject,'主体直客资料更新',session,note?applicationId:undefined);appendApplicationNote(application,note,session,'主体直客资料');return after;
}
export function bindDirect(db,form,rowId,values,session){
  if(form.product!=='本地推')throw Error('本产品不适用直客资料。');const row=form.rows?.find(r=>r.id===rowId);if(!row)throw Error('请先选择有效申请行。');
  const direct=saveSubjectDirect(db,form.subjectId,values,{reason:values.evidence,session});
  // Compatibility only: the returned fields are a projection of the shared subject, never per-row ownership.
  return {...row,...direct,directSource:'主体当前资料，平台未联机核验'};
}
export function subjectSnapshot(db,id){const s=db.subjects.find(x=>x.id===id);return s?{id:s.id,...subjectValues(s),recordVersion:s.recordVersion||0,source:s.source,localChange:!!s.localChange}:null;}

export function editApplicationDirect(db,applicationId,rowId,values,session){
  if(!canMaintainPublic(session))throw Error('当前角色无权补全平台资料。');
  const app=db.applications.find(a=>a.id===applicationId),row=app?.rows.find(r=>r.id===rowId);if(!row)throw Error('找不到开户申请行。');
  if(!['待办理','失败','未提交'].includes(row.status))throw Error('该行身份已被外部请求锁定；请核实原请求或到成功账户按更正流程办理。');
  if(app.product!=='本地推')throw Error('该产品不适用直客。');
  saveSubjectDirect(db,app.subjectId,values,{reason:values.evidence,session,applicationId});return row;
}
export function editAccountDirect(db,accountId,values,session){
  if(!canMaintainPublic(session))throw Error('当前角色无权补全平台资料。');const account=db.accounts.find(a=>a.id===accountId);if(!account||account.product!=='本地推')throw Error('找不到适用的本地推账户。');
  saveSubjectDirect(db,account.subjectId,values,{reason:values.evidence,session,applicationId:account.applicationId});return account;
}
