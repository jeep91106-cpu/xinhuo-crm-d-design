import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {createRouteHistory,parseRoute} from '../src/navigation.js';
import {freshState,openingFieldErrors} from '../src/model.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const bundled=buildSync({absWorkingDir:root,stdin:{contents:"export {createModalDirtyRegistry} from './src/UiV2.jsx';export {createOpeningDemoDraft} from './src/CoreModule.jsx';",resolveDir:root},bundle:true,platform:'node',format:'esm',write:false,loader:{'.css':'empty'},logLevel:'silent'});
const {createModalDirtyRegistry,createOpeningDemoDraft}=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].contents).toString('base64'));

test('两个弹窗的脏标记独立，保存子弹窗不会清除父弹窗未保存输入',()=>{
 let changes=0,parentReset=0,childReset=0;const registry=createModalDirtyRegistry(()=>changes++),parent=Symbol(),child=Symbol();
 registry.mark(parent,()=>parentReset++);registry.mark(child,()=>childReset++);registry.mark(child,()=>childReset++);
 assert.equal(changes,2);registry.remove(child);assert.equal(registry.hasDirty(),true);assert.equal(parentReset,0);
 registry.clear();assert.equal(registry.hasDirty(),false);assert.equal(parentReset,1);assert.equal(childReset,0);
 registry.remove(parent);assert.equal(changes,4);
});

test('页面与弹窗脏标记取并集，关闭一类不清除另一类的未保存保护',()=>{
 let pageDirty=true,combined=true;const registry=createModalDirtyRegistry(()=>{combined=pageDirty||registry.hasDirty()}),token=Symbol();
 registry.mark(token,()=>{});pageDirty=false;combined=pageDirty||registry.hasDirty();assert.equal(combined,true);
 pageDirty=true;registry.remove(token);assert.equal(combined,true);
 pageDirty=false;combined=pageDirty||registry.hasDirty();assert.equal(combined,false);
});

test('仅弹窗脏时浏览器后退被恢复，取消保留输入，放弃后精确恢复后退且不循环',()=>{
 const entries=[{url:'#M01',state:null}],pending=[];let position=0,blocked=null,applied=null,resets=0;
 const registry=createModalDirtyRegistry(),token=Symbol();
 const history={get state(){return entries[position].state},replaceState(state,_title,url){entries[position]={state,url}},pushState(state,_title,url){entries.splice(position+1);entries.push({state,url});position++},go(delta){pending.push(delta)}};
 const controller=createRouteHistory({history,readRoute:()=>parseRoute(entries[position].url),isDirty:()=>registry.hasDirty(),onBlocked:value=>blocked=value,onApply:next=>applied=next});
 const flush=()=>{let limit=20;while(pending.length&&limit--){position+=pending.shift();controller.onPop()}assert.ok(limit>0,'后退不应被重复阻断')};
 controller.navigate({id:'M05'});registry.mark(token,()=>resets++);history.go(-1);flush();
 assert.equal(position,1);assert.equal(applied.id,'M05');assert.equal(blocked.next.id,'M01');assert.equal(registry.hasDirty(),true);assert.equal(resets,0);
 // 继续填写只关闭导航提示，不清理 registry；随后再次发起后退仍保护。
 history.go(-1);flush();assert.equal(position,1);assert.equal(registry.hasDirty(),true);
 registry.clear();controller.navigate(blocked.next,{...blocked.options,committed:true});flush();
 assert.equal(position,0);assert.equal(applied.id,'M01');assert.equal(resets,1);assert.equal(registry.hasDirty(),false);assert.equal(entries.length,2);
});

test('工作台只生成草稿，不假造动态字段或直接创建申请，正常提交仍需通过配置校验',()=>{
 const db=freshState({customers:[{id:'c',name:'允城'}],subjects:[{id:'s',customerIds:['c']}],shops:[{id:'t',subjectId:'s',name:'真实来源店铺',laikeId:'LK'}],suppliers:[],accounts:[]});
 db.config.fields.push({id:'amount',label:'数字资料',type:'number',required:true},{id:'date',label:'日期资料',type:'date',required:true},{id:'choice',label:'选项资料',type:'select',options:['甲'],required:true});
 const before=structuredClone(db),draft=createOpeningDemoDraft(db,{businessId:'demo-sales-b'});
 assert.deepEqual(db,before);assert.equal(draft.businessOwnerId,'demo-sales-b');assert.equal(draft.rows.length,3);assert.deepEqual(draft.customValues,{});assert.ok(draft.rows.every(row=>!row.directId&&!row.externalId));
 assert.equal(openingFieldErrors(db.config,draft).length,3);
 assert.deepEqual(openingFieldErrors(db.config,{...draft,customValues:{amount:'0',date:'2026-09-22',choice:'甲'}}),[]);
});
