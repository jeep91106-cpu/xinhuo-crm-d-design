import {canOperate,toCents,roles} from './operations-specs.js';

export const operationEditors={M23:['*'],M24:['运营','充值媒介','财务','商务主管'],M25:['商务','渠道商务','运营','商务主管','Boss','财务'],M26:['财务'],M27:['商务','渠道商务','商务主管'],M28:['剪辑','运营','商务主管'],M29:['人事'],M30:['*'],M31:['人事','财务'],M32:['商务主管','人事'],M37:['系统管理员','财务'],M38:['商务','渠道商务','商务主管'],M40:['系统管理员']};
export const canCreateOperation=(session,id)=>canOperate(session,operationEditors[id]||[]);
export function canReadOperation(session,id,record){
 if(!canOperate(session,['*']))return false;
 if(!['M26','M29','M31'].includes(id))return true;
 if(canOperate(session,id==='M26'?['财务']:['人事','财务']))return true;
 const own=!!record?.employeeId&&record.employeeId===(session.employeeId||session.businessId);
 return own&&(id==='M29'||['发布','已发布','部分发放','已发'].includes(record.status));
}
export const importRoles=['商务','渠道商务','商务主管','开户媒介','充值媒介','媒介主管','运营','剪辑','财务','人事','系统管理员'];
export function canAccessBatch(session,batch){return canOperate(session,importRoles)&&(canOperate(session,['系统管理员','财务'])||batch.actor===session.name);}
export function inspectImport(text,records=[],scope=''){
 const seen=new Set(),existing=new Set(records.filter(b=>b.scope===scope).flatMap(b=>(b.rows||[]).filter(r=>r.status==='演示已导入').map(r=>r.externalId)));
 return text.trim().split(/\r?\n/).filter(Boolean).map((line,i)=>{
  const parts=line.split(',').map(s=>s.trim()),[externalId='',name='',amount='']=parts;
  let status=parts.length!==3?'需恰好三列；此文本模板不支持引号或内嵌逗号':!externalId||!name?'缺少 ID 或名称':/[eE][+-]?\d/.test(externalId)?'ID 不能使用科学计数法':!/^\d+$/.test(externalId)?'演示模板要求数字字符串 ID':toCents(amount)===null?'金额格式不正确':seen.has(externalId)?'同批重复 ID':existing.has(externalId)?'范围内已导入；引用原批次':'可导入';
  seen.add(externalId);return {id:'row-'+i,row:i+1,externalId,name,amount,status};
 });
}
export function validateAuthorization(form){
 const issues=[];
 if(!form.name?.startsWith('演示')||!form.externalId?.trim())issues.push('填写演示人员与稳定外部 ID');
 if(!form.roles?.length||form.roles.some(r=>!roles.includes(r)))issues.push('至少选择一个有效角色');
 if(!form.job?.trim()||!form.appointmentRef?.trim())issues.push('岗位与有效任职引用必填，独立于角色');
 if(!form.scope?.trim()||!form.scopeRef?.trim())issues.push('明确数据范围及其人员、部门、区域或对象 ID');
 if(!form.effectiveAt||!Number.isFinite(Date.parse(form.effectiveAt)))issues.push('填写授权生效时间');
 if(form.expiresAt&&(!Number.isFinite(Date.parse(form.expiresAt))||form.expiresAt<=form.effectiveAt))issues.push('授权截止须晚于生效');
 if(form.assistRef?.trim()&&(!form.assistActions?.trim()||!form.expiresAt))issues.push('协办需明确账户、受控动作和截止时间');
 return issues;
}
export function authorizationStatus(record,at=new Date().toISOString()){
 if(record.status==='停用')return '停用';
 if(record.expiresAt&&Date.parse(record.expiresAt)<=Date.parse(at))return '授权过期';
 if(record.effectiveAt&&Date.parse(record.effectiveAt)>Date.parse(at))return '待生效';
 return '有效';
}
export function findPayrollAppointment(employees,record){return employees.find(employee=>employee.employeeId===record.employeeId&&employee.appointmentRef===record.appointmentRef&&employee.effective?.slice(0,7)<=record.period&&(!employee.appointmentEnd||employee.appointmentEnd.slice(0,7)>=record.period));}
export function approvedBalance(record,id){const approved=id==='M31'?record.netCents:(record.approvedCents??0);return Math.max(0,(approved||0)-(record.paidCents||0));}
export function paymentPatch(record,id,payment,proof){
 const cents=toCents(payment),remaining=approvedBalance(record,id);
 if(!proof?.trim())return {error:'必须填写本次付款凭证'};
 if(cents===null||cents<=0||cents>remaining)return {error:'付款必须大于零且不超过剩余已批准金额'};
 const paidCents=(record.paidCents||0)+cents;
 return {patch:{paidCents,paymentProof:proof,payments:[...(record.payments||[]),{amountCents:cents,proof,version:record.approvedVersion??record.version}]},status:cents===remaining?(id==='M31'?'已发':'已付'):(id==='M31'?'部分发放':'部分付')};
}
