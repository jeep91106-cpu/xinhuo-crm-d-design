const BUSINESS_ROLES=new Set(['商务','渠道商务']);
const CREATOR_ROLES=new Set([...BUSINESS_ROLES,'商务主管','系统管理员']);
const value=input=>String(input??'').trim();
const clone=input=>structuredClone(input);
const legacyId=db=>value(db.openingDraft?.draftId)||'legacy-opening-draft';

// 人员身份与本次申请的负责商务分开；演示主管/管理员是固定演示席位。
export function openingDraftActorKey(session){
  if(!CREATOR_ROLES.has(session?.role))return '';
  for(const [field,prefix] of [['employeeId','employee'],['userId','user'],['id','person']])if(value(session[field]))return prefix+':'+value(session[field]);
  if(BUSINESS_ROLES.has(session.role)&&value(session.businessId))return 'business:'+value(session.businessId);
  if(['商务主管','系统管理员'].includes(session.role)&&session.name==='演示'+session.role)return 'demo-role:'+session.role;
  return '';
}
function actor(session){
  const key=openingDraftActorKey(session);
  if(!key)throw Error('当前人员缺少可保存开户草稿的稳定身份，请先选择商务身份。');
  return key;
}
function records(db){return Array.isArray(db.openingDrafts)?db.openingDrafts:[];}
function legacyOwned(db,session){
  return !!db.openingDraft&&BUSINESS_ROLES.has(session?.role)&&!!value(db.openingDraft.businessOwnerId)&&value(db.openingDraft.businessOwnerId)===value(session.businessId);
}
function legacyRecord(db,session){
  const form=clone(db.openingDraft),id=legacyId(db);
  return {id,creatorKey:actor(session),creatorName:session.name||session.role,createdAt:form.createdAt||'',updatedAt:form.updatedAt||form.savedAt||'',legacy:true,form:{...form,draftId:id}};
}
export function hasUnassignedOpeningDraft(db){return !!db.openingDraft&&!value(db.openingDraft.businessOwnerId)&&!records(db).some(record=>record.id===legacyId(db));}
export function listOpeningDrafts(db,session,{includeDeleted=false}={}){
  const key=openingDraftActorKey(session);if(!key)return [];
  const stored=records(db),mine=stored.filter(record=>record.creatorKey===key&&!record.submittedAt&&(includeDeleted||!record.deletedAt));
  if(legacyOwned(db,session)&&!stored.some(record=>record.id===legacyId(db)))mine.push(legacyRecord(db,session));
  return clone(mine).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')||a.id.localeCompare(b.id));
}
export function getOpeningDraft(db,id,session,{includeDeleted=false}={}){
  const key=actor(session),record=records(db).find(item=>item.id===id);
  if(record){if(record.creatorKey!==key||record.submittedAt||(!includeDeleted&&record.deletedAt))throw Error('草稿不存在或不属于当前人员，请返回我的草稿箱。');return clone(record);}
  if(db.openingDraft&&id===legacyId(db)&&legacyOwned(db,session))return legacyRecord(db,session);
  throw Error('草稿不存在或不属于当前人员，请返回我的草稿箱。');
}
function exists(db,id){return records(db).some(record=>record.id===id)||!!db.openingDraft&&id===legacyId(db);}
function uniqueId(db){let id;do{id='DRAFT-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}while(exists(db,id));return id;}
function put(db,record){const next=[...records(db)],index=next.findIndex(item=>item.id===record.id);if(index<0)next.unshift(record);else next[index]=record;db.openingDrafts=next;return clone(record);}

export function saveOpeningDraft(db,form,session,{draftId=form?.draftId,asNew=false}={}){
  const creatorKey=actor(session),sourceId=value(draftId);
  const previous=sourceId&&exists(db,sourceId)?getOpeningDraft(db,sourceId,session):null;
  const id=asNew?uniqueId(db):sourceId||uniqueId(db),at=new Date().toISOString();
  const record={id,creatorKey,creatorName:previous?.creatorName||session.name||session.role,createdAt:!asNew&&previous?.createdAt||at,updatedAt:at,form:{...clone(form||{}),draftId:id}};
  if(!asNew&&previous?.legacy)record.legacy=true;
  return put(db,record);
}
export function deleteOpeningDraft(db,id,session){const record=getOpeningDraft(db,id,session);return put(db,{...record,deletedAt:new Date().toISOString()});}
export function restoreOpeningDraft(db,id,session){const record=getOpeningDraft(db,id,session,{includeDeleted:true});delete record.deletedAt;return put(db,record);}
// 未保存的新表单可直接提交；已保存/历史草稿始终复核创建人，提交后不再复活旧全局草稿。
export function consumeOpeningDraft(db,id,session,applicationId){
  actor(session);if(!exists(db,id))return null;
  const record=getOpeningDraft(db,id,session);
  return put(db,{...record,submittedAt:new Date().toISOString(),applicationId});
}
export function assertOpeningDraftSubmission(db,id,session,{mustExist=false}={}){
  actor(session);
  if(mustExist||exists(db,id))return getOpeningDraft(db,id,session);
  return null;
}
