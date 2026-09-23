import React,{useState} from 'react';
import {Field,Modal,Notice,Section} from './ui.jsx';
import {IndustrySelect} from './IndustryFields.jsx';
import {SUBJECT_FIELDS,SUPPLIER_FIELDS,subjectValues,supplierValues,saveSubject,saveShop,saveSupplier,linkSubject,canMaintainPublic,canMaintainSupplier,getSubjectDirect,saveSubjectDirect} from './core-fields.js';
const text=value=>value||'未填写';
const subjectFormFields=SUBJECT_FIELDS.filter(([key])=>key!=='licenseEvidence');
export function SubjectSummary({subject,session,onEdit}){
  if(!subject)return null;
  return <Section title="主体资料" actions={onEdit&&<button className="btn" disabled={!canMaintainPublic(session)} onClick={onEdit}>编辑主体</button>}><dl className="kv">{subjectFormFields.map(([key,label])=><React.Fragment key={key}><dt>{label}</dt><dd className={['creditCode','bankAccount','directId'].includes(key)?'mono':''}>{text(subject[key])}</dd></React.Fragment>)}</dl></Section>;
}
export function SubjectEditor({db,subjectId,customerId,applicationId,initialName='',session,update,onClose,onSaved}){
  const [dirtySignal,setDirtySignal]=useState(0);
  const original=db.subjects.find(subject=>subject.id===subjectId),[form,setForm]=useState(()=>({...subjectValues(original),...(!original?{name:initialName}:{})})),[reason,setReason]=useState(''),[error,setError]=useState('');
  const set=(key,value)=>setForm(previous=>({...previous,[key]:value}));
  const hits=db.subjects.filter(subject=>subject.id!==subjectId&&(form.creditCode&&subject.creditCode?.replace(/\s+/g,'').toUpperCase()===form.creditCode.replace(/\s+/g,'').toUpperCase()||form.name.trim()&&subject.name.replace(/\s+/g,'')===form.name.replace(/\s+/g,'')));
  const save=()=>{try{let id;update(d=>{id=saveSubject(d,form,{id:subjectId,customerId,applicationId,reason,session}).id},'保存主体资料');onSaved?.(id,{note:reason.trim()});onClose();}catch(cause){setError(cause.message);}};
  return <Modal title={original?'编辑主体':'新增主体'} onClose={onClose} dirtySignal={dirtySignal} wide footer={<><button className="btn" data-modal-close>取消</button><button className="btn primary" disabled={!canMaintainPublic(session)} onClick={save}>保存主体</button></>}>
    {error&&<Notice tone="error">{error}</Notice>}
    <div className="form-grid">{subjectFormFields.map(([key,label])=>key==='industry'?<IndustrySelect key={key} db={db} value={form.industry} onChange={value=>{if(value!==form.industry){set('industry',value);setDirtySignal(signal=>signal+1);}}}/>:<Field key={key} label={label} required={key==='name'}><input value={form[key]||''} onChange={event=>set(key,event.target.value)} autoComplete="off"/></Field>)}</div>
    <Field label="直客名称"><input readOnly value={form.name||''} placeholder="与主体名称一致"/></Field>
    <Field label="流转备注（选填）"><textarea value={reason} onChange={event=>setReason(event.target.value)} placeholder="可补充本次办理说明"/></Field>
    {hits.length>0&&<Notice tone="amber">已有相同主体，请核对后选择：{hits.map(subject=><div key={subject.id}><strong>{subject.name}</strong> · {subject.creditCode||'信用代码未填写'}{customerId&&!applicationId&&<button className="btn" onClick={()=>{try{update(d=>linkSubject(d,subject.id,customerId,session),'关联已有主体');onSaved?.(subject.id,{note:reason.trim()});onClose();}catch(cause){setError(cause.message);}}}>选择已有主体</button>}</div>)}</Notice>}
  </Modal>;
}
export function LinkSubjectEditor({db,customerId,session,update,onSaved,onClose}){
  const [query,setQuery]=useState(''),[selected,setSelected]=useState(''),[error,setError]=useState('');
  const list=db.subjects.filter(subject=>(subject.name+' '+(subject.creditCode||'')).includes(query));
  return <Modal title="关联已有主体" onClose={onClose} footer={<button className="btn primary" onClick={()=>{try{update(d=>linkSubject(d,selected,customerId,session),'关联已有主体');onSaved?.(selected);onClose();}catch(cause){setError(cause.message);}}}>确认关联</button>}><Field label="主体名称 / 信用代码"><input value={query} onChange={event=>setQuery(event.target.value)}/></Field><Field label="已有主体" required><select value={selected} onChange={event=>setSelected(event.target.value)}><option value="">请选择</option>{list.map(subject=><option key={subject.id} value={subject.id}>{subject.name} · {subject.creditCode||'信用代码未填写'}</option>)}</select></Field>{error&&<Notice tone="error">{error}</Notice>}</Modal>;
}
export function ShopEditor({db,shopId,subjectId,applicationId,product='本地推',session,update,onSaved,onClose}){
  const original=db.shops.find(shop=>shop.id===shopId),[form,setForm]=useState(()=>({name:original?.name||'',businessAddress:original?.businessAddress||'',laikeId:original?.laikeId||'',crossShopAcknowledged:false})),[reason,setReason]=useState(''),[error,setError]=useState('');
  const set=(key,value)=>setForm(previous=>({...previous,[key]:value})),conflict=db.shops.filter(shop=>shop.id!==shopId&&form.laikeId&&shop.laikeId===form.laikeId);
  const save=()=>{try{let id;update(d=>{id=saveShop(d,form,{id:shopId,subjectId,applicationId,reason,session}).id},'保存店铺资料');onSaved?.(id,{note:reason.trim()});onClose();}catch(cause){setError(cause.message);}};
  return <Modal title={original?'编辑店铺':'新增店铺'} onClose={onClose} footer={<><button className="btn" data-modal-close>取消</button><button className="btn primary" disabled={!canMaintainPublic(session)} onClick={save}>保存店铺</button></>}>
    <Field label={product==='本地推'?'店铺名称（来客名称）':'业务档案名称'} required><input value={form.name} onChange={event=>set('name',event.target.value)}/></Field>
    <Field label="店铺经营地址"><input value={form.businessAddress} onChange={event=>set('businessAddress',event.target.value)}/></Field>
    {product==='本地推'&&<Field label="来客 ID（选填）"><input value={form.laikeId} onChange={event=>set('laikeId',event.target.value)}/></Field>}
    <Field label="流转备注（选填）"><textarea value={reason} onChange={event=>setReason(event.target.value)} placeholder="可补充本次办理说明"/></Field>
    {conflict.length>0&&<Notice tone="amber">相同来客 ID 已用于：{conflict.map(shop=>shop.name).join('、')}。<label><input type="checkbox" checked={form.crossShopAcknowledged} onChange={event=>set('crossShopAcknowledged',event.target.checked)}/>已核对，保留独立店铺</label></Notice>}{error&&<Notice tone="error">{error}</Notice>}
  </Modal>;
}
export function SupplierEditor({db,supplierId,session,update,onClose,readOnly=false}){
  const supplier=db.suppliers.find(item=>item.id===supplierId),[form,setForm]=useState(()=>supplierValues(supplier)),[reason,setReason]=useState(''),[error,setError]=useState(''),editable=!readOnly&&canMaintainSupplier(session);
  const fields=SUPPLIER_FIELDS.filter(([key])=>key!=='bankAddress'&&(!readOnly||!key.startsWith('bank'))),products=db.supplierCapabilities?.[supplierId]||supplier?.products||[];
  return <Modal title={supplier?.name||'供应商资料'} onClose={onClose} wide={!readOnly} footer={<><button className="btn" data-modal-close>关闭</button>{editable&&<button className="btn primary" onClick={()=>{try{update(d=>saveSupplier(d,supplierId,form,{reason,session}),'保存供应商资料');onClose();}catch(cause){setError(cause.message);}}}>保存供应商</button>}</>}>
    {error&&<Notice tone="error">{error}</Notice>}
    <dl className="kv"><dt>供应商名称</dt><dd>{text(supplier?.name)}</dd><dt>支持产品</dt><dd>{products.join(' / ')||'未配置'}</dd></dl>
    {readOnly?<dl className="kv">{fields.map(([key,label])=><React.Fragment key={key}><dt>{label}</dt><dd>{text(form[key])}</dd></React.Fragment>)}</dl>:<div className="form-grid">{fields.map(([key,label])=><Field key={key} label={label}><input readOnly={!editable} value={form[key]||''} onChange={event=>setForm(previous=>({...previous,[key]:event.target.value}))}/></Field>)}</div>}
    {editable&&<Field label="修改说明" required><textarea value={reason} onChange={event=>setReason(event.target.value)}/></Field>}
    {!readOnly&&!!supplier?.versions?.length&&<details className="public-history-note"><summary>修改记录</summary>{supplier.versions.map((record,index)=><p key={index}>{new Date(record.at).toLocaleString('zh-CN')} · {record.actor} · {record.reason||'资料更新'}</p>)}</details>}
  </Modal>;
}
export function DirectEditor({db,subjectId,applicationId,rowId,accountId,session,update,onClose}){
  const account=db.accounts.find(item=>item.id===accountId),app=db.applications.find(item=>item.id===applicationId),resolvedSubjectId=subjectId||account?.subjectId||app?.subjectId,subject=db.subjects.find(item=>item.id===resolvedSubjectId),direct=getSubjectDirect(db,resolvedSubjectId);
  const [form,setForm]=useState({id:direct.directId||'',evidence:''}),[error,setError]=useState('');
  const save=()=>{try{update(d=>saveSubjectDirect(d,resolvedSubjectId,{id:form.id},{reason:form.evidence,session,applicationId:applicationId||account?.applicationId}),'保存主体直客资料');onClose();}catch(cause){setError(cause.message);}};
  return <Modal title="编辑主体直客" onClose={onClose} footer={<><button className="btn" data-modal-close>取消</button><button className="btn primary" disabled={!subject||!canMaintainPublic(session)} onClick={save}>保存直客资料</button></>}>
    <Field label="直客名称"><input readOnly value={subject?.name||''}/></Field><Field label="直客 ID（选填）"><input value={form.id} onChange={event=>setForm(previous=>({...previous,id:event.target.value}))}/></Field><Field label="流转备注（选填）"><textarea value={form.evidence} onChange={event=>setForm(previous=>({...previous,evidence:event.target.value}))} placeholder="可补充本次办理说明"/></Field>{error&&<Notice tone="error">{error}</Notice>}
  </Modal>;
}
