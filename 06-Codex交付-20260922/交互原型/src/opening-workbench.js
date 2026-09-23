import {canHandleOpening} from './model.js';
const nameOf=(rows,id)=>rows.find(r=>r.id===id)?.name||'未登记';
export function openingWorkbenchRecords(db){
 return (db.applications||[]).map(app=>{
  const rows=app.rows||[],flow=app.flowSnapshot||[],closed=['全部完成','已取消'].includes(app.status),manualPending=app.completionMode==='manual'&&!app.completionConfirmedAt;
  const success=rows.filter(r=>r.status==='成功').length,cancelled=rows.filter(r=>r.status==='已取消').length,remaining=rows.length-success-cancelled;
  const stage=!app.assignee?'s2':remaining||manualPending?'s3':'s4',index=flow.findIndex(s=>s.id===stage);
  const step=flow.find((s,i)=>!['s1','s2','s3','s4'].includes(s.id)&&!app.configApprovals?.[s.id]&&(index<0||i<index));
  const role=step?.role||(!app.assignee?'媒介主管':'开户媒介');
  const supplement=app.product==='本地推'?rows.filter(r=>r.status==='成功'&&!(db.accounts.find(a=>a.id===r.accountId)?.zonghengId||r.zonghengId)).length:0;
  return {id:'M06:'+app.id,recordId:app.id,name:nameOf(db.customers,app.customerId)+' · 开户',customer:nameOf(db.customers,app.customerId),subject:nameOf(db.subjects,app.subjectId),shop:nameOf(db.shops,app.shopId),product:app.product,node:closed?(app.status==='全部完成'?'开户已完成':'已取消'):step?.name||app.status,step,roles:[role],role,creator:app.submittedBy,businessOwnerId:app.businessOwnerId,businessOwnerName:app.businessOwnerName,assignee:app.assignee,assigneeId:app.assigneeId,at:app.createdAt,target:'M06',params:{applicationId:app.id},closed,total:app.requestedCount??rows.length,success,cancelled,remaining,supplement,next:closed?'查看开户申请':step?'办理审批':!app.assignee?'指派开户媒介':!remaining?'确认完成开户':'继续办理'};
 });
}
export function relatedOpeningRecord(record,session){
 if(record.target!=='M06')return false;
 if(session.role==='系统管理员')return true;
 if(session.role==='开户媒介')return canHandleOpening(session,record);
 if(['商务','渠道商务'].includes(session.role))return record.creator===session.name||record.businessOwnerId===session.businessId;
 if(['商务主管','媒介主管'].includes(session.role))return true;
 return record.roles.includes(session.role)||record.creator===session.name;
}
