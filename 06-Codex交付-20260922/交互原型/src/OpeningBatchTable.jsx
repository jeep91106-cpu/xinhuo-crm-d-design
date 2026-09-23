import React,{useId,useState,useRef,useEffect} from 'react';
import {createPortal} from 'react-dom';
import {Badge,Notice} from './ui.jsx';
import {supplierEligible} from './model.js';
import {isOpeningBatchEditable,openingRowDraft} from './opening-batch.js';
import OpeningPasteDialog from './OpeningPasteDialog.jsx';

export function SupplierPicker({options,value,onChange,label,invalid,disabled=false}){
 const id=useId(),inputRef=useRef(null),[position,setPosition]=useState(null),[open,setOpen]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(0);
 const locate=()=>{const r=inputRef.current?.getBoundingClientRect();if(!r)return;const height=Math.min(220,Math.max(120,window.innerHeight-100)),above=window.innerHeight-r.bottom<Math.min(height,180)&&r.top>height;setPosition({position:'fixed',left:Math.max(8,Math.min(r.left,window.innerWidth-Math.max(r.width,210)-8)),width:Math.max(r.width,210),minWidth:0,top:above?'auto':r.bottom+4,bottom:above?window.innerHeight-r.top+4:'auto',maxHeight:height,zIndex:80})};
 useEffect(()=>{if(!open)return;locate();window.addEventListener('scroll',locate,true);window.addEventListener('resize',locate);return()=>{window.removeEventListener('scroll',locate,true);window.removeEventListener('resize',locate)}},[open]);
 const selected=options.find(s=>s.id===value),matches=options.filter(s=>s.name.toLowerCase().includes(query.trim().toLowerCase()));
 const choose=s=>{onChange(s?.id||'');setOpen(false);setQuery('');setActive(0)};
 return <div className="supplier-picker">
  <input ref={inputRef} role="combobox" aria-label={label} aria-expanded={open} aria-controls={id} aria-autocomplete="list" aria-invalid={invalid||undefined} aria-activedescendant={open&&matches[active]?id+'-'+active:undefined} disabled={disabled} value={open?query:selected?.name||''} placeholder="搜索选择供应商" onClick={()=>{locate();setOpen(true)}} onFocus={()=>{locate();setOpen(true);setQuery('');setActive(0)}} onBlur={()=>setOpen(false)} onChange={e=>{setQuery(e.target.value);setActive(0);setOpen(true)}} onKeyDown={e=>{
   if(e.key==='ArrowDown'){e.preventDefault();if(!open){setOpen(true);setQuery('');setActive(0)}else setActive(n=>Math.min(n+1,matches.length-1));}
   if(e.key==='ArrowUp'){e.preventDefault();setActive(n=>Math.max(n-1,0))}
   if(e.key==='Enter'&&open){e.preventDefault();if(matches[active])choose(matches[active])}
   if(e.key==='Escape'){e.preventDefault();setOpen(false)}
  }}/>
  {!!value&&!disabled&&<button type="button" className="supplier-clear" tabIndex={-1} aria-label={'清空'+label} onClick={()=>choose(null)}>×</button>}
  {open&&!disabled&&position&&createPortal(<div style={position} className="supplier-options" role="listbox" id={id} aria-label={label+'选项'} onMouseDown={e=>e.preventDefault()}>{matches.length?matches.map((s,i)=><button type="button" role="option" id={id+'-'+i} aria-selected={value===s.id} className={i===active?'active':''} key={s.id} onClick={()=>choose(s)}>{s.name}</button>):<p>没有匹配的可用供应商</p>}</div>,document.body)}
 </div>;
}

export default function OpeningBatchTable({db,app,canEdit,busy,edits,onEdit,selected,onSelect,errors,onDraft,onRegister,onException,onSupplier,onAccount,onZongheng,canEditZongheng,toast}){
 const [bulkSupplier,setBulkSupplier]=useState(''),[overwrite,setOverwrite]=useState(false),[filter,setFilter]=useState('全部'),[pasteSelection,setPasteSelection]=useState(null);
 useEffect(()=>{if(filter==='有问题'&&!errors.length||filter==='待填写'&&!app.rows.some(isOpeningBatchEditable))setFilter('全部')},[filter,errors.length,app.rows]);
 const options=db.suppliers.filter(s=>supplierEligible(db,s.id,app.product));
 const editable=canEdit?app.rows.filter(isOpeningBatchEditable):[],editableIds=new Set(editable.map(r=>r.id)),chosen=selected.filter(id=>editableIds.has(id));
 const get=r=>edits[r.id]||openingRowDraft(r),fieldErrors=(id,field)=>errors.filter(e=>e.rowId===id&&e.field===field),shown=app.rows.filter(r=>filter==='全部'||filter==='待填写'&&isOpeningBatchEditable(r)||filter==='有问题'&&errors.some(e=>e.rowId===r.id)||filter==='已成功'&&r.status==='成功');
 const selectedRows=editable.filter(r=>chosen.includes(r.id)),targets=selectedRows.filter(r=>overwrite||!get(r).supplierId);
 const errorText=(id,field)=>fieldErrors(id,field).map((e,i)=><small className="batch-field-error" role="alert" key={i}>{e.message}</small>);
 const cellInput=(r,field,label,placeholder)=>canEdit&&isOpeningBatchEditable(r)?<><input disabled={busy} aria-label={'第'+(app.rows.indexOf(r)+1)+'行'+label} aria-invalid={fieldErrors(r.id,field).length>0||undefined} value={get(r)[field]||''} placeholder={placeholder} onChange={e=>onEdit({[r.id]:{...get(r),[field]:e.target.value}})}/>{errorText(r.id,field)}</>:<span className={field==='name'?'':'mono'}>{field==='zonghengId'?(db.accounts.find(a=>a.id===r.accountId)?.zonghengId||r.zonghengId||'未填写'):r[field]||'未填写'}</span>;
 const applySupplier=()=>{const patch=Object.fromEntries(targets.map(r=>[r.id,{...get(r),supplierId:bulkSupplier}]));onEdit(patch);toast('已填入 '+targets.length+' 个账户，请保存草稿或登记结果')};
 return <>
  {canEdit&&editable.length>0&&<div className="batch-toolbar">
   <div><label>批量设置供应商</label><SupplierPicker options={options} value={bulkSupplier} onChange={setBulkSupplier} label="批量供应商" disabled={busy}/></div>
   <label className="batch-fill-mode">填充方式<select aria-label="供应商填充方式" value={overwrite?'replace':'empty'} onChange={e=>setOverwrite(e.target.value==='replace')}><option value="empty">只填未选择的供应商</option><option value="replace">替换选中行的供应商</option></select></label>
   <button className="btn" disabled={busy||!bulkSupplier||!targets.length} onClick={applySupplier}>{overwrite?'替换':'应用到'}选中账户（{targets.length}）</button>
   <button className="btn" disabled={busy||!chosen.length} onClick={()=>setPasteSelection([...chosen])}>粘贴 Excel 多行账户</button>
   <p>已选 {chosen.length} / {editable.length} 个可填写账户 · 填写后可保存草稿，登记成功后再完成整单。</p>
  </div>}
  <div className="batch-filter"><label>显示账户<select aria-label="显示账户" value={filter} onChange={e=>setFilter(e.target.value)}>{['全部','待填写','有问题','已成功'].map(v=><option key={v}>{v}</option>)}</select></label>{canEdit&&editable.length>0&&<><button className="text-btn" onClick={()=>onSelect(editable.map(r=>r.id))}>选择全部可填写账户（{editable.length}）</button><button className="text-btn" onClick={()=>onSelect([])}>清空选择</button></>}<span>显示 {shown.length} / {app.rows.length} 个账户</span></div>
  {errors.length>0&&<div className="batch-error-summary"><Notice tone="error">本次未登记任何账户，请修改标红项，或取消勾选有问题的账户后重试。{errors.filter(e=>!e.rowId).map(e=><p key={e.message}>{e.message}</p>)}</Notice></div>}
  <div className="batch-table-wrap"><table className="batch-table" aria-label="开户账户批量录入表"><thead><tr>{canEdit&&<th className="batch-check"><input type="checkbox" aria-label="选择全部可填写账户" checked={!!editable.length&&chosen.length===editable.length} disabled={!editable.length||busy} onChange={e=>onSelect(e.target.checked?editable.map(r=>r.id):[])}/></th>}<th className="batch-index">序号</th><th>开户供应商 <span aria-hidden="true">*</span></th><th>广告账户 ID <span aria-hidden="true">*</span></th><th>账户名称（选填）</th>{app.product==='本地推'&&<th>纵横 ID（选填）</th>}<th className="batch-state">开户结果</th><th className="batch-actions">操作</th></tr></thead>
   <tbody>{shown.map(r=>{const index=app.rows.indexOf(r)+1,rowEditable=canEdit&&isOpeningBatchEditable(r),value=get(r),supplier=db.suppliers.find(s=>s.id===(rowEditable?value.supplierId:r.supplierId)),rowOptions=options.some(s=>s.id===value.supplierId)?options:[...options,...db.suppliers.filter(s=>s.id===value.supplierId)],status={成功:'开户成功',失败:'开户失败',未知:'结果待核实',待同步:'待同步账户结果'}[r.status]||r.status;return <tr key={r.id} className={errors.some(e=>e.rowId===r.id)?'batch-row-error':''}>
    {canEdit&&<td className="batch-check"><input type="checkbox" aria-label={'选择第'+index+'个账户'} checked={chosen.includes(r.id)} disabled={!rowEditable||busy} onChange={e=>onSelect(e.target.checked?[...chosen,r.id]:chosen.filter(id=>id!==r.id))}/></td>}
    <td>{index}</td><td>{rowEditable?<SupplierPicker options={rowOptions} value={value.supplierId} onChange={id=>onEdit({[r.id]:{...value,supplierId:id}})} label={'第'+index+'行供应商'} invalid={fieldErrors(r.id,'supplierId').length>0} disabled={busy}/>:<span>{supplier?.name||'未选择'}</span>}{errorText(r.id,'supplierId')}{supplier&&<button className="text-btn batch-supplier-link" onClick={()=>onSupplier(supplier.id)}>查看供应商</button>}</td>
    <td>{cellInput(r,'externalId','广告账户ID','填写完整账户 ID')}</td><td>{cellInput(r,'name','账户名称','可不填')}</td>{app.product==='本地推'&&<td>{cellInput(r,'zonghengId','纵横ID','可后补')}</td>}
    <td><Badge tone={r.status==='成功'?'green':r.status==='失败'?'red':'amber'}>{status}</Badge>{rowEditable&&<small className="batch-save-state">{edits[r.id]?'未保存修改':r.pendingValues?'草稿已保存':'尚未登记'}</small>}{errorText(r.id,'general')}</td>
    <td><div className="opening-row-actions">{r.status==='成功'?<>{app.product==='本地推'&&canEditZongheng&&<button className="text-btn" onClick={()=>onZongheng(r.accountId)}>{db.accounts.find(a=>a.id===r.accountId)?.zonghengId?'修改纵横 ID':'补充纵横 ID'}</button>}<button className="text-btn" onClick={()=>onAccount(r.accountId)}>查看账户</button></>:r.status==='已取消'?<span>{r.cancelReason||'已取消'}</span>:canEdit?<button className="text-btn" disabled={busy} onClick={()=>onException(r)}>{r.status==='未知'?'核实结果':r.status==='待同步'?'同步结果':'异常处理'}</button>:<span className="muted">{app.assignee?'等待办理':'等待指派'}</span>}</div></td>
   </tr>})}</tbody></table>{!shown.length&&<p className="batch-empty">没有符合当前筛选的账户。</p>}</div>
  {canEdit&&editable.length>0&&<div className="batch-save-bar"><div><strong>已选 {chosen.length} 个账户</strong><span>批量登记会校验所有选中行；全部通过后一次保存。</span></div><button className="btn" disabled={busy} onClick={onDraft}>保存全部草稿</button><button className="btn primary" disabled={busy||!chosen.length} onClick={onRegister}>登记选中账户成功（{chosen.length}）</button></div>}
  {pasteSelection&&canEdit&&!busy&&<OpeningPasteDialog db={db} app={app} selected={pasteSelection} edits={edits} onClose={()=>setPasteSelection(null)} onApply={(patch,count)=>{onEdit(patch);setPasteSelection(null);toast('已填入 '+count+' 行，请核对后保存草稿或登记结果')}}/>}
 </>;
}
