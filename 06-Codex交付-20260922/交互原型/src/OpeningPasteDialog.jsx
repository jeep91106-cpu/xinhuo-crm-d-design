import React,{useState} from 'react';
import {Modal,Notice} from './ui.jsx';
import {previewOpeningPaste} from './opening-paste.js';

export default function OpeningPasteDialog({db,app,selected,edits,onClose,onApply}){
 const [text,setText]=useState(''),[mode,setMode]=useState('empty'),[preview,setPreview]=useState(null),[stale,setStale]=useState(false);
 const prepare=()=>previewOpeningPaste({db,app,selected,edits,text,mode});
 const confirm=()=>{const current=prepare();if(JSON.stringify(current)!==JSON.stringify(preview)){setStale(true);setPreview(null);return;}if(current.errors.length||!current.changedCells)return;onApply(current.patch,current.rows.length);};
 return <Modal title="粘贴 Excel 多行账户" wide onClose={onClose} footer={<><button className="btn" onClick={onClose}>取消</button><button className="btn" onClick={()=>{setPreview(prepare());setStale(false)}}>预览粘贴内容</button><button className="btn primary" disabled={!preview||!!preview.errors.length||!preview.changedCells} onClick={confirm}>确认填入{preview?.rows.length?' '+preview.rows.length+' 行':''}</button></>}>
  <div className="opening-paste">
   <p>已选择 {selected.length} 个账户。数据按原申请行顺序填入，少于选中数量时只填前面的账户。</p>
   <label htmlFor="opening-paste-text">Excel 账户数据</label>
   <textarea id="opening-paste-text" rows={7} value={text} onChange={e=>{setText(e.target.value);setPreview(null);setStale(false)}} placeholder={'广告账户 ID\t账户名称\t纵横 ID\t供应商\n0012345678901234567\t门店推广账户\t\t供应商完整名称'}/>
   <p className="muted">有表头时按列名匹配，必须包含广告账户 ID；无表头时依次为广告账户 ID、账户名称、纵横 ID、供应商。可只复制前 1–4 列。请先将 Excel 的 ID 列设为文本，保留完整编号。</p>
   <label className="opening-paste-mode">填入方式<select aria-label="粘贴填入方式" value={mode} onChange={e=>{setMode(e.target.value);setPreview(null);setStale(false)}}><option value="empty">只填空白项</option><option value="replace">替换对应项（空白不覆盖）</option></select></label>
   {stale&&<Notice tone="amber">原申请或表格内容已更新。本次尚未填入，请重新预览；若选中账户已办理，请关闭后重新选择。</Notice>}
   {preview&&<>
    {preview.errors.length>0?<Notice tone="error"><strong>请修改以下问题，本次还没有填入任何数据。</strong><ul>{preview.errors.map((error,index)=><li key={index}>{error.sourceRow?'粘贴第 '+error.sourceRow+' 行 → 原申请第 '+error.rowNumber+' 行：':''}{error.message}</li>)}</ul></Notice>:<Notice>{preview.changedCells?'可填入 '+preview.rows.length+' 行，共 '+preview.changedCells+' 项修改。':'数据与现有内容一致，没有需要填入的修改。'}{preview.skippedCells>0?' 已保留 '+preview.skippedCells+' 项非空内容；如需替换，请切换填入方式。':''}</Notice>}
    {preview.rows.length>0&&<div className="opening-paste-preview"><table aria-label="Excel 粘贴预览"><thead><tr><th>原申请行号</th><th>广告账户 ID</th><th>账户名称</th>{app.product==='本地推'&&<th>纵横 ID</th>}<th>供应商</th><th>填入情况</th></tr></thead><tbody>{preview.rows.map(row=><tr key={row.rowId}><td>第 {row.rowNumber} 行</td><td className="mono">{row.values.externalId||'未填写'}</td><td>{row.values.name||'未填写'}</td>{app.product==='本地推'&&<td className="mono">{row.values.zonghengId||'未填写'}</td>}<td>{db.suppliers.find(s=>s.id===row.values.supplierId)?.name||'未选择'}</td><td>{row.changes.length} 项修改{row.skipped.length?' · '+row.skipped.length+' 项保留':''}</td></tr>)}</tbody></table></div>}
   </>}
   <p className="muted">确认后会填入当前表格，尚未保存或登记开户结果。核对后可保存草稿，或登记选中账户成功。</p>
  </div>
 </Modal>;
}
