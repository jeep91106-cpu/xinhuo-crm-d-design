import {finishOpening,platformFor,supplierEligible} from './model.js';
import {canHandleOpening} from './opening-access.js';

const DRAFT_FIELDS=['supplierId','name','externalId','zonghengId'];
const text=value=>String(value??'');
const clean=value=>text(value).trim();
const error=(rowId,field,message)=>({rowId:rowId||'',field,message});

export const isOpeningBatchEditable=row=>!!row&&['待办理','失败'].includes(row.status);

export function openingRowDraft(row={}){
  const pending=row.pendingValues||{};
  return Object.fromEntries(DRAFT_FIELDS.map(field=>[field,text(Object.hasOwn(pending,field)?pending[field]:row[field])]));
}

function batchContext(db,appId,entries,session){
  const app=(db.applications||[]).find(item=>item.id===appId),errors=[];
  if(!app)return {errors:[error('','general','找不到原开户申请。')],entries:[]};
  if(!canHandleOpening(session,app))errors.push(error('','general','仅本单被指派的开户媒介或系统管理员可以批量办理。'));
  if(!app.assignee)errors.push(error('','general','请先由媒介主管派单。'));
  if(app.completionConfirmedAt||['全部完成','已取消','开户已完成，流程待复核'].includes(app.status))errors.push(error('','general','本申请已确认完成，不能覆盖原开户结果。'));
  if(!Array.isArray(app.rows)||!app.rows.length)errors.push(error('','general','原申请没有可办理的账户明细。'));
  else if(app.requestedCount!==undefined&&(!Number.isInteger(app.requestedCount)||app.requestedCount<1||app.requestedCount!==app.rows.length))errors.push(error('','general','原申请数量与账户明细不一致，请核对原单。'));
  if(!Array.isArray(entries)||!entries.length)errors.push(error('','general','请选择需要保存的开户行。'));
  if(errors.length)return {app,errors,entries:[]};
  const normalized=entries.map(entry=>({id:text(entry?.id),...Object.fromEntries(DRAFT_FIELDS.map(field=>[field,text(entry?.[field])]))}));
  const seen=new Set();
  for(const entry of normalized){
    const matches=app.rows.filter(row=>row.id===entry.id);
    if(!entry.id||matches.length!==1)errors.push(error(entry.id,'general','申请行不存在或标识冲突，请重新打开原申请。'));
    else if(!isOpeningBatchEditable(matches[0]))errors.push(error(entry.id,'general','本行已锁定，只有待办理或明确失败行可以批量编辑；未知、待同步需核实原请求。'));
    if(seen.has(entry.id))errors.push(error(entry.id,'general','本批重复包含同一申请行。'));
    seen.add(entry.id);
  }
  return {app,errors,entries:normalized};
}

function duplicateErrors(entries,field,label,rows){
  const groups=new Map();
  for(const entry of entries){const value=clean(entry[field]);if(value)groups.set(value,[...(groups.get(value)||[]),entry.id]);}
  return [...groups.values()].filter(ids=>ids.length>1).flatMap(ids=>{
    const numbers=ids.map(id=>rows.findIndex(row=>row.id===id)+1).sort((a,b)=>a-b);
    return ids.map(id=>error(id,field,'第'+numbers.join('、')+'行的'+label+'重复，请核对。'));
  });
}

function executionField(message){
  if(message.includes('纵横'))return 'zonghengId';
  if(/账户\s*ID|结果\s*ID/.test(message))return 'externalId';
  if(message.includes('供应商'))return 'supplierId';
  return 'general';
}

function prepareRegistration(db,appId,entries,session){
  const context=batchContext(db,appId,entries,session),{app}=context,errors=[...context.errors];
  if(errors.length)return {errors};
  const values=context.entries.map(entry=>Object.fromEntries(Object.entries(entry).map(([field,value])=>[field,field==='id'?value:clean(value)])));
  errors.push(...duplicateErrors(values,'externalId','广告账户 ID',app.rows),...duplicateErrors(values,'zonghengId','纵横 ID',app.rows));
  for(const entry of values){
    if(!entry.supplierId||!supplierEligible(db,entry.supplierId,app.product))errors.push(error(entry.id,'supplierId','请选择有效且适用于当前产品的供应商。'));
    if(!entry.externalId)errors.push(error(entry.id,'externalId','请填写完整广告账户 ID。'));
    else if(db.accounts.some(account=>account.externalId===entry.externalId&&platformFor(account.product)===platformFor(app.product))||db.applications.some(other=>platformFor(other.product)===platformFor(app.product)&&other.rows.some(row=>!(other.id===app.id&&row.id===entry.id)&&['成功','待同步','未知'].includes(row.status)&&row.externalId===entry.externalId)))errors.push(error(entry.id,'externalId','广告账户 ID 已存在于同平台账户或在途结果，不能重复登记。'));
  }
  // 所有执行都先发生在克隆中；即使后续行失败，也不会把前面的成功写回原单。
  const draft=structuredClone(db),draftApp=draft.applications.find(item=>item.id===appId);
  draftApp.completionMode='manual';
  for(const entry of values){
    if(errors.some(item=>item.rowId===entry.id))continue;
    const row=draftApp.rows.find(item=>item.id===entry.id);
    row.supplierId=entry.supplierId;
    try{
      finishOpening(draft,appId,entry.id,'成功',{name:entry.name,externalId:entry.externalId,zonghengId:entry.zonghengId},session);
      delete row.pendingValues;
    }catch(cause){const message=cause.message||'本行开户结果校验失败。';errors.push(error(entry.id,executionField(message),message));}
  }
  return {errors,draft};
}

function throwRows(errors){
  const failure=new Error([...new Set(errors.map(item=>item.message))].join('；'));
  failure.rowErrors=errors;
  throw failure;
}

export function validateOpeningBatch(db,appId,entries,session){
  return prepareRegistration(db,appId,entries,session).errors;
}

export function saveOpeningBatchDraft(db,appId,entries,session){
  const context=batchContext(db,appId,entries,session);
  if(context.errors.length)throwRows(context.errors);
  const draft=structuredClone(db),app=draft.applications.find(item=>item.id===appId),at=new Date().toISOString();
  for(const entry of context.entries){
    const row=app.rows.find(item=>item.id===entry.id);
    row.pendingValues=Object.fromEntries(DRAFT_FIELDS.map(field=>[field,entry[field]]));
    row.draftSavedAt=at;
  }
  Object.assign(db,draft);
  return db.applications.find(item=>item.id===appId);
}

export function registerOpeningBatchSuccess(db,appId,entries,session){
  const {errors,draft}=prepareRegistration(db,appId,entries,session);
  if(errors.length)throwRows(errors);
  Object.assign(db,draft);
  return db.applications.find(item=>item.id===appId);
}

// 单行异常与批量表共用草稿；未成功的输入仍可回原单核实或重试。
export function recordOpeningRowResult(db,appId,rowId,outcome,values,session){
  const draft=structuredClone(db),app=draft.applications.find(item=>item.id===appId),row=app?.rows.find(item=>item.id===rowId);
  if(!row)throw Error('找不到原开户申请行。');
  const input={...openingRowDraft(row),...values};
  if(isOpeningBatchEditable(row))row.supplierId=input.supplierId||'';
  finishOpening(draft,appId,rowId,outcome,input,session);
  if(['失败','未知'].includes(row.status)){
    row.pendingValues=Object.fromEntries(DRAFT_FIELDS.map(field=>[field,text(input[field])]));
    row.draftSavedAt=new Date().toISOString();
  }else delete row.pendingValues;
  Object.assign(db,draft);
  return db.applications.find(item=>item.id===appId).rows.find(item=>item.id===rowId);
}
