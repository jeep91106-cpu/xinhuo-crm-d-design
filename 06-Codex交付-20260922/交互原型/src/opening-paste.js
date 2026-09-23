import {isOpeningBatchEditable,openingRowDraft} from './opening-batch.js';
import {platformFor,supplierEligible} from './model.js';

const clean=value=>String(value??'').trim();
const columns=['externalId','name','zonghengId','supplier'];
const labels={externalId:'广告账户 ID',name:'账户名称',zonghengId:'纵横 ID',supplier:'供应商'};
const aliases={广告账户id:'externalId',账户id:'externalId',账号id:'externalId',广告账号id:'externalId',广告账户名称:'name',账户名称:'name',账户名:'name',纵横id:'zonghengId',供应商:'supplier',开户供应商:'supplier'};
const header=value=>aliases[clean(value).replace(/\s/g,'').toLowerCase()];
const invalidId=value=>/^[=+@-]/.test(value)||/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)[eE][+-]?\d+$/.test(value);

// Excel 剪贴板是制表符分列文本。全程保留字符串，不经数字转换。
export function parseOpeningTsv(input){
  const text=String(input??'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const rows=[];let cells=[],cell='',quoted=false,closed=false,line=1,start=1;
  const pushCell=()=>{cells.push(cell);cell='';closed=false;};
  const pushRow=()=>{pushCell();rows.push({sourceRow:start,cells});cells=[];start=line+1;};
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else{cell+=ch;if(ch==='\n')line++;}continue;}
    if(ch==='"'&&!cell&&!closed){quoted=true;continue;}
    if(ch==='\t'){pushCell();continue;}
    if(ch==='\n'){pushRow();line++;continue;}
    if(closed)throw Error('粘贴第 '+line+' 行的引号格式不完整，请从 Excel 重新复制单元格。');
    cell+=ch;
  }
  if(quoted)throw Error('粘贴内容有未闭合的引号，请重新复制完整单元格。');
  pushRow();
  while(rows.length&&!rows[rows.length-1].cells.some(v=>clean(v)))rows.pop();
  if(!rows.length)throw Error('请先粘贴 Excel 中的账户数据。');
  const hasHeader=rows[0].cells.some(v=>header(v));
  let fields=columns;
  if(hasHeader){
    fields=rows.shift().cells.map(v=>{const key=header(v);if(!key)throw Error('无法识别列名“'+clean(v)+'”，请使用广告账户 ID、账户名称、纵横 ID、供应商。');return key;});
    if(new Set(fields).size!==fields.length)throw Error('表头包含重复列，请每个字段只保留一列。');
    if(!fields.includes('externalId'))throw Error('表头必须包含“广告账户 ID”。');
    if(!rows.length)throw Error('只有表头，没有需要填入的账户数据。');
  }
  return rows.map(row=>{
    if(row.cells.length>fields.length)throw Error('粘贴第 '+row.sourceRow+' 行列数超过 '+fields.length+' 列，请核对复制范围。');
    return {sourceRow:row.sourceRow,values:Object.fromEntries(fields.map((key,index)=>[key,clean(row.cells[index])]))};
  });
}

// 仅生成待确认的表单补丁；无论成功或失败都不修改 db、原申请或输入草稿。
export function previewOpeningPaste({db,app,selected,edits={},text,mode='empty'}){
  const result={rows:[],errors:[],patch:{},changedCells:0,skippedCells:0};
  const fail=(message,extra={})=>result.errors.push({message,...extra});
  let incoming;
  try{incoming=parseOpeningTsv(text);}catch(cause){fail(cause.message);return result;}
  const ids=new Set(selected||[]),targets=(app.rows||[]).filter(row=>ids.has(row.id));
  if(!ids.size)fail('请先选择需要填写的账户。');
  if(ids.size!==targets.length||ids.size!==(selected||[]).length)fail('选择的申请行不存在或重复，请重新选择。');
  if(targets.some(row=>!isOpeningBatchEditable(row)))fail('选中账户的状态已变化，请关闭窗口后重新选择可填写账户。');
  if(app.completionConfirmedAt)fail('本次开户已完成，不能继续填入。');
  if(!['empty','replace'].includes(mode))fail('请选择有效的填入方式。');
  if(incoming.length>targets.length)fail('粘贴了 '+incoming.length+' 行，但只选中 '+targets.length+' 个账户，请调整复制范围或增加选择。');
  if(result.errors.length)return result;
  const get=row=>({...openingRowDraft(row),...edits[row.id]});
  for(let i=0;i<incoming.length;i++){
    const source=incoming[i],row=targets[i],values=get(row),changes=[],skipped=[];
    const rowNumber=app.rows.indexOf(row)+1,detail={rowId:row.id,rowNumber,sourceRow:source.sourceRow};
    for(const [column,value] of Object.entries(source.values)){
      if(!value)continue;
      if(['externalId','zonghengId'].includes(column)&&invalidId(value)){fail(labels[column]+' 使用了公式或科学计数法，请在 Excel 中改为完整文本编号后重新复制。',{...detail,field:column});continue;}
      if(column==='zonghengId'&&app.product!=='本地推'){fail('当前产品不使用纵横 ID，请移除此列内容。',{...detail,field:column});continue;}
      const field=column==='supplier'?'supplierId':column;
      let next=value;
      if(column==='supplier'){
        const matches=(db.suppliers||[]).filter(s=>clean(s.name)===value);
        if(matches.length!==1){fail(matches.length?'供应商名称重复，请在表格中手动选择供应商。':'找不到供应商“'+value+'”，请使用系统中的完整名称。',{...detail,field});continue;}
        if(!supplierEligible(db,matches[0].id,app.product)){fail('供应商“'+value+'”已停用或不支持当前产品。',{...detail,field});continue;}
        next=matches[0].id;
      }
      if(mode==='empty'&&clean(values[field])){if(clean(values[field])!==next)skipped.push(field);continue;}
      if(values[field]!==next){values[field]=next;changes.push(field);}
    }
    if(!clean(values.externalId))fail('广告账户 ID 为空，请补充完整编号。',{...detail,field:'externalId'});
    result.rows.push({...detail,values,changes,skipped});
    result.changedCells+=changes.length;result.skippedCells+=skipped.length;
  }
  const effective=new Map(result.rows.map(row=>[row.rowId,row.values]));
  for(const item of result.rows){
    for(const field of ['externalId','zonghengId']){
      const value=clean(item.values[field]);if(!value)continue;
      if(invalidId(value))fail(labels[field]+' 不是完整文本编号，请更正。',{...item,field});
      const conflicts=app.rows.filter(row=>row.id!==item.rowId&&row.status!=='已取消'&&clean((effective.get(row.id)||get(row))[field])===value);
      if(conflicts.length)fail(labels[field]+' 与本申请第 '+conflicts.map(row=>app.rows.indexOf(row)+1).join('、')+' 行重复。',{rowId:item.rowId,rowNumber:item.rowNumber,sourceRow:item.sourceRow,field});
      const samePlatform=product=>field==='zonghengId'||platformFor(product)===platformFor(app.product);
      const accountConflict=(db.accounts||[]).some(account=>samePlatform(account.product)&&clean(account[field])===value);
      const pendingConflict=(db.applications||[]).some(other=>other.id!==app.id&&samePlatform(other.product)&&(other.rows||[]).some(row=>['成功','待同步','未知'].includes(row.status)&&clean(row[field])===value));
      if(accountConflict||pendingConflict)fail(labels[field]+' 已被其他账户或在途开户结果使用，请核对。',{rowId:item.rowId,rowNumber:item.rowNumber,sourceRow:item.sourceRow,field});
    }
  }
  if(!result.errors.length)result.patch=Object.fromEntries(result.rows.filter(row=>row.changes.length).map(row=>[row.rowId,row.values]));
  return result;
}
