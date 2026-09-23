import React,{useEffect,useRef,useState} from 'react';
import {Field,Modal,Notice} from './ui.jsx';
import {ATTACHMENT_PRODUCTS,ATTACHMENT_EXTENSIONS,attachmentPolicies,applicableAttachmentPolicies,attachmentFileError} from './opening-attachments.js';
import {loadAttachment,storeAttachment} from './attachment-store.js';
import './attachments.css';

export default function OpeningAttachments({files=[],onChange,onBusyChange,product,workflow,subjectId,readOnly=false}){
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[preview,setPreview]=useState(null);
  const policies=applicableAttachmentPolicies(workflow,product),latest=useRef(files);latest.current=files;
  const mounted=useRef(true),context=useRef('');
  context.current=JSON.stringify([subjectId,product,workflow?.version,policies]);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;}},[]);
  useEffect(()=>()=>{if(preview?.url)URL.revokeObjectURL(preview.url);},[preview]);
  async function upload(event,policy){
    const selected=Array.from(event.target.files||[]);event.target.value='';if(!selected.length)return;
    setError('');setBusy(true);onBusyChange?.(true);const added=[],startedContext=context.current;
    try{for(const file of selected){const error=attachmentFileError(file,policy);if(error)throw Error(file.name+'：'+error);added.push(await storeAttachment(file,{policyId:policy.id,subjectId}));}}
    catch(error){if(mounted.current)setError(error.message);}finally{
      if(mounted.current){
        if(context.current===startedContext){if(added.length)onChange?.([...latest.current,...added]);}
        else setError('资料上下文已变更，本次文件未关联到新申请，请重新选择上传。');
        setBusy(false);onBusyChange?.(false);
      }
    }
  }
  async function open(file){try{const blob=await loadAttachment(file);setError('');setPreview({file,url:URL.createObjectURL(blob)});}catch(error){setError(error.message);}}
  return <div className="opening-attachments">
    {!readOnly&&<div className="attachment-actions">{policies.map(policy=><label className={'btn attachment-upload '+(busy?'disabled':'')} key={policy.id}>
      <span>＋ 上传{policy.label}</span><input aria-label={'上传'+policy.label} type="file" multiple accept={(policy.accept||ATTACHMENT_EXTENSIONS).map(ext=>'.'+ext).join(',')} disabled={busy} onChange={event=>upload(event,policy)}/>
    </label>)}</div>}
    {!readOnly&&<p className="muted attachment-hint">{busy?'正在保存文件，请稍候…':policies.map(p=>p.label+'：'+(p.required?(p.requiredAt==='execution'?'媒介执行前补齐':'提交时必需'):'可选')+'，单文件 '+p.maxSizeMB+' MB').join('；')}。支持 PDF、图片，已选文件可预览。</p>}
    {error&&<Notice tone="error">{error}</Notice>}
    {files.length?<ul className="attachment-list">{files.map(file=><li key={file.id}><span className="attachment-file-icon">{file.name.split('.').pop().toUpperCase()}</span><div><strong>{file.name}</strong><small>{attachmentPolicies(workflow).find(p=>p.id===file.policyId)?.label||'历史材料'} · {(file.size/1024).toFixed(0)} KB · 已保存到本机浏览器</small></div><button type="button" className="text-btn" onClick={()=>open(file)}>预览</button>{!readOnly&&<button type="button" className="text-btn" disabled={busy} onClick={()=>onChange?.(files.filter(f=>f.id!==file.id))}>移除</button>}</li>)}</ul>:<p className="attachment-empty">暂无已上传材料</p>}
    {preview&&<Modal title={preview.file.name} wide onClose={()=>setPreview(null)} footer={<a className="btn primary" href={preview.url} download={preview.file.name}>下载原文件</a>}>
      {/\.pdf$/i.test(preview.file.name)?<object className="attachment-preview" data={preview.url} type="application/pdf"><a href={preview.url} download={preview.file.name}>下载 PDF 查看</a></object>:<img className="attachment-preview" src={preview.url} alt={preview.file.name}/>}
    </Modal>}
  </div>;
}

export function AttachmentPolicyEditor({workflow,onChange,disabled=false}){
  const policies=attachmentPolicies(workflow);
  const change=(id,patch)=>onChange(policies.map(p=>p.id===id?{...p,...patch}:p));
  return <div className="attachment-policy-editor"><Notice>按产品和材料类型配置。默认可选；需要时可设为申请提交必需，或允许商务先提交、媒介执行前补齐。发布后新单使用新版本。</Notice>
    <fieldset disabled={disabled}>{policies.map(p=><div className="attachment-policy" key={p.id}>
      <Field label="材料类型"><input aria-label={'材料名称 '+p.id} value={p.label} onChange={e=>change(p.id,{label:e.target.value})}/></Field>
      <Field label="适用产品"><select aria-label={'材料适用产品 '+p.id} value={p.product} onChange={e=>change(p.id,{product:e.target.value})}>{ATTACHMENT_PRODUCTS.map(product=><option key={product}>{product}</option>)}</select></Field>
      <Field label="收集要求"><select aria-label={'材料收集要求 '+p.id} value={!p.required?'optional':p.requiredAt} onChange={e=>change(p.id,{required:e.target.value!=='optional',requiredAt:e.target.value==='execution'?'execution':'submit',visible:e.target.value==='optional'?p.visible:true})}><option value="optional">可选，允许后补</option><option value="submit">商务提交时必需</option><option value="execution">媒介执行前补齐</option></select></Field>
      <Field label="单文件上限（MB）"><input aria-label={'材料大小上限 '+p.id} type="number" min="1" max="20" value={p.maxSizeMB} onChange={e=>change(p.id,{maxSizeMB:Number(e.target.value)})}/></Field>
      <label className="attachment-visible"><input aria-label={'材料显示 '+p.id} type="checkbox" checked={p.visible!==false} onChange={e=>change(p.id,{visible:e.target.checked,required:e.target.checked?p.required:false})}/>显示上传入口</label>
      <button className="text-btn" type="button" onClick={()=>onChange(policies.filter(rule=>rule.id!==p.id))}>移除此材料类型</button>
    </div>)}<button className="btn" type="button" onClick={()=>onChange([...policies,{id:'material-'+Date.now().toString(36),label:'补充资质',product:'全部产品',visible:true,required:false,requiredAt:'submit',accept:[...ATTACHMENT_EXTENSIONS],maxSizeMB:10}])}>＋ 添加资质类型</button></fieldset>
  </div>;
}
