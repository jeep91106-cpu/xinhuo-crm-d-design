import test from 'node:test';
import assert from 'node:assert/strict';
import {parseOpeningTsv,previewOpeningPaste} from '../src/opening-paste.js';

function fixture(count=3){const app={id:'app',product:'本地推',rows:Array.from({length:count},(_,i)=>({id:'r'+(i+1),status:'待办理'}))};return {app,db:{applications:[app],accounts:[],suppliers:[{id:'sp',name:'本地推供应商',products:['本地推']},{id:'off',name:'停用供应商',products:['本地推'],active:false},{id:'wrong',name:'其他产品',products:['腾讯K4']}]},selected:app.rows.map(row=>row.id)};}
const preview=(text,extra={})=>previewOpeningPaste({...fixture(),text,...extra});
test('Excel 引号转义、制表符、换行和19位前导零均按字符串保留',()=>{
 const rows=parseOpeningTsv('\uFEFF广告账户 ID\t账户名称\r\n0001234567890123456\t"名称\t带""引号""\n第二行"\r\n\t\r\n');
 assert.deepEqual(rows,[{sourceRow:2,values:{externalId:'0001234567890123456',name:'名称\t带"引号"\n第二行'}}]);
 assert.throws(()=>parseOpeningTsv('123\t"abc'),/未闭合/);assert.throws(()=>parseOpeningTsv('123\t"a"b'),/引号格式/);
});
test('支持部分表头任意列顺序和无表头1到4列',()=>{
 assert.deepEqual(parseOpeningTsv('供应商\t账号ID\n本地推供应商\t0001')[0].values,{supplier:'本地推供应商',externalId:'0001'});
 for(let n=1;n<=4;n++)assert.equal(Object.keys(parseOpeningTsv(['001','账户','ZH','本地推供应商'].slice(0,n).join('\t'))[0].values).length,4);
 for(const text of ['账户名称\n名称','广告账户ID\t广告账户ID\n1\t2','广告账户ID\t无效列\n1\t2','广告账户ID','1\t2\t3\t4\t5',''])assert.throws(()=>parseOpeningTsv(text));
});
test('按原申请顺序匹配选中行，少量只填前N行；超出不截断不填入',()=>{
 const f=fixture(4),out=previewOpeningPaste({...f,selected:['r4','r2','r3'],text:'001\n002'});
 assert.deepEqual(out.errors,[]);assert.deepEqual(out.rows.map(row=>row.rowNumber),[2,3]);assert.deepEqual(Object.keys(out.patch),['r2','r3']);
 const over=previewOpeningPaste({...f,selected:['r1'],text:'1\n2'});assert.match(over.errors[0].message,/粘贴了 2 行/);assert.deepEqual(over.patch,{});
 for(const selected of [[],['missing'],['r1','r1']])assert.ok(previewOpeningPaste({...f,selected,text:'1'}).errors.length);
 f.app.rows[0].status='成功';assert.ok(previewOpeningPaste({...f,text:'1'}).errors.length);
});
test('默认只填空白并报告保留项，显式替换也不清空未粘贴的值',()=>{
 const f=fixture(),edits={r1:{supplierId:'sp',externalId:'001',name:'原账户',zonghengId:'原纵横'}};
 let out=previewOpeningPaste({...f,edits,text:'002\t新名称\t\t'});
 assert.deepEqual(out.errors,[]);assert.equal(out.changedCells,0);assert.equal(out.skippedCells,2);assert.deepEqual(out.patch,{});
 out=previewOpeningPaste({...f,edits,text:'002\t新名称\t\t',mode:'replace'});
 assert.equal(out.changedCells,2);assert.deepEqual(out.patch.r1,{supplierId:'sp',externalId:'002',name:'新名称',zonghengId:'原纵横'});
});
test('科学计数法和公式编号被拒绝；整批不生成补丁',()=>{
 for(const value of ['1.234E+18','1e5','=123','+123','@SUM(A1)','-SUM(A1:A2)']){const out=preview('123\n'+value);assert.ok(out.errors.some(e=>e.rowNumber===2&&e.field==='externalId'));assert.deepEqual(out.patch,{});}
 assert.ok(preview('1\t名称\t2E+12').errors.some(e=>e.field==='zonghengId'));
 assert.equal(preview('0001234567890123456').patch.r1.externalId,'0001234567890123456');
});
test('同批重复、原申请未选中草稿、已开户和在途结果全部查重',()=>{
 const same=preview('001\n001');assert.equal(same.errors.filter(e=>e.field==='externalId').length,2);assert.deepEqual(same.patch,{});
 const f=fixture();f.app.rows[2].pendingValues={externalId:'001'};
 assert.ok(previewOpeningPaste({...f,selected:['r1'],text:'001'}).errors.some(e=>e.message.includes('第 3 行')));
 f.db.accounts.push({id:'a',externalId:'999',zonghengId:'ZH',product:'本地推'});
 assert.ok(previewOpeningPaste({...f,text:'999'}).errors.length);assert.ok(previewOpeningPaste({...f,text:'002\t\tZH'}).errors.length);
 f.db.applications.push({id:'other',product:'本地推',rows:[{status:'未知',externalId:'888'}]});
 assert.ok(previewOpeningPaste({...f,text:'888'}).errors.length);
});
test('供应商按完整名称唯一匹配，不可用或重名时要求用户选择',()=>{
 assert.equal(preview('001\t\t\t本地推供应商').patch.r1.supplierId,'sp');
 for(const supplier of ['不存在','停用供应商','其他产品'])assert.ok(preview('001\t\t\t'+supplier).errors.some(e=>e.field==='supplierId'));
 const f=fixture();f.db.suppliers.push({id:'dup',name:'本地推供应商',products:['本地推']});assert.ok(previewOpeningPaste({...f,text:'001\t\t\t本地推供应商'}).errors.some(e=>e.message.includes('重复')));
});
test('粘贴预览只读，不创建账户、不修改申请或已输入草稿',()=>{
 const f=fixture(),edits={r1:{name:'已输入'}},before=structuredClone({f,edits});
 const out=previewOpeningPaste({...f,edits,text:'001\n002'});assert.deepEqual(out.errors,[]);assert.equal(out.rows.length,2);assert.deepEqual({f,edits},before);assert.equal(f.db.accounts.length,0);
});
test('其他产品不接收纵横字段；空ID和已完成申请不能确认填入',()=>{
 const f=fixture();f.app.product='腾讯K4';assert.ok(previewOpeningPaste({...f,text:'001\t账户\tZH'}).errors.length);
 assert.ok(preview('\t只有名称').errors.some(e=>e.field==='externalId'));
 f.app.completionConfirmedAt='2026-09-22';assert.ok(previewOpeningPaste({...f,text:'1'}).errors.length);
});
test('中间空行不压缩映射；已预览目标状态变化不转填下一行',()=>{
 const f=fixture(),out=previewOpeningPaste({...f,text:'001\t账户甲\n\t\n003\t账户丙\n\t'});
 assert.equal(out.rows[2].rowId,'r3');assert.equal(out.rows[2].values.externalId,'003');assert.ok(out.errors.some(e=>e.rowNumber===2&&e.field==='externalId'));assert.deepEqual(out.patch,{});
 const selected=[...f.selected];f.app.rows[0].status='成功';const stale=previewOpeningPaste({...f,selected,text:'001\n002'});assert.deepEqual(stale.patch,{});assert.ok(stale.errors.some(e=>e.message.includes('状态已变化')));
});
