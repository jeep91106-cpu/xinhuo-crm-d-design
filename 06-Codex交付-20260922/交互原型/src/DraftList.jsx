import React,{useState} from 'react';
import {PageHeader,Section,Notice,DataTable,Empty} from './ui.jsx';
import {openingDraftActorKey,listOpeningDrafts,hasUnassignedOpeningDraft,saveOpeningDraft,deleteOpeningDraft,restoreOpeningDraft} from './opening-drafts.js';

export default function DraftList({db,session,update,go,toast}){
  const [deleted,setDeleted]=useState(false),[lastDeleted,setLastDeleted]=useState('');
  const all=listOpeningDrafts(db,session,{includeDeleted:true}),mine=all.filter(row=>!row.deletedAt),removed=all.filter(row=>row.deletedAt);
  const rows=(deleted?removed:mine).map(record=>({...record,customer:db.customers.find(c=>c.id===record.form.customerId)?.name||'未选择客户',subject:db.subjects.find(s=>s.id===record.form.subjectId)?.name||'未选择主体',count:record.form.rows?.length||record.form.requestedCount||1}));
  const run=(action,label)=>{try{update(action,label);return true;}catch(error){toast(error.message,'error');return false;}};
  const restore=id=>{if(run(d=>restoreOpeningDraft(d,id,session),'恢复本人开户草稿')){setLastDeleted('');toast('草稿已恢复，可继续填写。');}};
  if(!openingDraftActorKey(session))return <><PageHeader title="我的开户草稿"/><Notice>当前身份不能访问开户草稿箱，请选择具有稳定身份的商务、主管或管理员。</Notice></>;
  return <><PageHeader eyebrow="开户申请 / 未提交草稿" title="我的开户草稿" description="草稿仅创建人可查看和继续填写；负责商务在申请中单独指定。" actions={<><button className="btn" onClick={()=>go('M06')}>返回申请列表</button><button className="btn primary" onClick={()=>go('M06',{mode:'new'})}>新增开户</button></>}/>
    <div className="tabs"><button className={!deleted?'active':''} onClick={()=>setDeleted(false)}>未提交草稿（{mine.length}）</button><button className={deleted?'active':''} onClick={()=>setDeleted(true)}>已删除（{removed.length}）</button></div>
    {lastDeleted&&<Notice>草稿已移入“已删除”。<button className="text-btn" onClick={()=>restore(lastDeleted)}>撤销删除</button></Notice>}
    {hasUnassignedOpeningDraft(db)&&<Notice tone="amber">有一份历史草稿的创建人待核对，原内容已保留，暂不归入任何人的草稿箱。</Notice>}
    <Section title={deleted?'本人已删除草稿':'本人未提交草稿'}>{rows.length?<DataTable rows={rows} viewKey="my-opening-drafts" columns={[
      {key:'customer',label:'客户',render:row=><strong>{row.customer}</strong>},
      {key:'subject',label:'主体 / 产品',render:row=><div className="relation-cell"><span>{row.subject}</span><small>{row.form.product||'未选择产品'}</small></div>},
      {key:'count',label:'开户数量',render:row=>row.count+' 个'},
      {key:'updatedAt',label:'更新时间',render:row=>row.updatedAt?new Date(row.updatedAt).toLocaleString('zh-CN'):'历史保存时间未记录'},
      {key:'action',label:'操作',render:row=>deleted?<button className="btn" onClick={()=>restore(row.id)}>恢复草稿</button>:<div className="actions"><button className="btn primary" onClick={()=>go('M06',{mode:'resumeDraft',draftId:row.id})}>继续填写</button><button className="btn" onClick={()=>{let saved;if(run(d=>{saved=saveOpeningDraft(d,row.form,session,{draftId:row.id,asNew:true})},'另存本人开户草稿')){go('M06',{mode:'resumeDraft',draftId:saved.id});toast('已另存为新草稿，原草稿保留。');}}}>另存为新草稿</button><button className="btn danger" onClick={()=>{if(run(d=>deleteOpeningDraft(d,row.id,session),'删除本人开户草稿')){setLastDeleted(row.id);toast('草稿已删除，可撤销或在已删除中恢复。');}}}>删除草稿</button></div>}
    ]}/>:<Empty title={deleted?'暂无已删除草稿':'暂无未提交草稿'} detail={deleted?'删除后的草稿可在这里恢复。':'可以先保存空白草稿，稍后再补充开户资料。'}/>}</Section>
  </>;
}
