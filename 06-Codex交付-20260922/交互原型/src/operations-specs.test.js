import test from 'node:test';
import assert from 'node:assert/strict';
import {operationSpecs,validateRecord,toCents,canOperate,roles,WORKFLOW_CORE_ROLES,WORKFLOW_REGIONS,normalizeWorkflowBuiltinFields,validateWorkflowConfig,workflowHistorySnapshot} from './operations-specs.js';

test('运营模块覆盖与专属字段契约完整',()=>{
 const expected=['M23','M24','M25','M26','M27','M28','M29','M30','M31','M32','M37','M38','M40'];
 assert.deepEqual(Object.keys(operationSpecs),expected);
 const signatures=new Set();
 for(const [id,spec] of Object.entries(operationSpecs)){
  assert.ok(spec.fields.length>=6,id);
  assert.equal(new Set(spec.fields.map(f=>f.key)).size,spec.fields.length,id);
  assert.deepEqual(validateRecord(spec,Object.fromEntries(spec.fields.map(f=>[f.key,f.value]))),{},id);
  signatures.add(spec.fields.map(f=>f.key).join(','));
  for(const [state,actions] of Object.entries(spec.actions)){
   assert.ok(spec.states.includes(state),id+' '+state);
   for(const action of actions){assert.ok(spec.states.includes(action.to),id+' '+action.to);assert.ok(action.roles.every(r=>r==='*'||roles.includes(r)));}
  }
 }
 assert.equal(signatures.size,expected.length,'不能全部使用同一份假字段表');
});
test('金额以整分解析且拒绝隐式舍入',()=>{
 assert.equal(toCents('950.52'),95052);assert.equal(toCents('950'),95000);assert.equal(toCents('0.01'),1);
 for(const invalid of ['-1','1.234','1e8','','abc','9007199254740991'])assert.equal(toCents(invalid),null,invalid);
});
test('未授权角色不能办理付款',()=>{
 const action=operationSpecs.M23.actions.已批待付[0];
 assert.equal(canOperate({role:'财务'},action.roles),true);
 assert.equal(canOperate({role:'商务主管'},action.roles),false);
 assert.equal(canOperate({role:'系统管理员'},action.roles),false);
});
test('素材与工资输入边界',()=>{
 const m=operationSpecs.M28,v=Object.fromEntries(m.fields.map(f=>[f.key,f.value]));
 assert.ok(validateRecord(m,{...v,valid:'101'}).valid);
 const s=operationSpecs.M31,p=Object.fromEntries(s.fields.map(f=>[f.key,f.value]));
 assert.ok(validateRecord(s,{...p,deduct:'9000.00'}).deduct);
 assert.ok(validateRecord(s,{...p,employee:'真实姓名'}).employee);
});
test('考勤起止时间不合法须拦截',()=>{
 const s=operationSpecs.M30,p=Object.fromEntries(s.fields.map(f=>[f.key,f.value]));
 assert.ok(validateRecord(s,{...p,end:p.start}).end);
});
test('未知执行结果没有盲目重试路径',()=>{
 const actions=operationSpecs.M40.actions.待核实;
 assert.ok(actions.every(a=>!a.label.includes('重试')));
 assert.deepEqual(actions.map(a=>a.to),['外部成功待同步','部分失败']);
 assert.ok(operationSpecs.M40.actions.外部成功待同步[0].label.includes('只补'));
});

function workflow(){return {version:2,scopeMode:'global',product:'',region:'全局默认',fields:[{id:'remark',label:'申请说明',required:false},{id:'region',label:'办理区域',required:true},{id:'attachments',label:'开户资料',required:false}],steps:Object.entries(WORKFLOW_CORE_ROLES).map(([id,role])=>({id,name:id,role}))};}
test('内置区域和附件保留固定采集控件，旧无类型配置继续有效',()=>{
 assert.deepEqual(validateWorkflowConfig(workflow()),[]);
 const fixed=normalizeWorkflowBuiltinFields(workflow());assert.deepEqual(validateWorkflowConfig(fixed),[]);
 const mutations={region:[{required:false},{visible:false},{label:'假区域'},{type:'number'},{type:'date'},{type:'select',options:['华南']},{options:['任意值']},{allowedRoles:['商务']},{collectAt:'s3'}],attachments:[{visible:false},{label:'假附件'},{type:'text'},{type:'number'},{type:'date'},{type:'select',options:['资料']},{options:[]},{allowedRoles:['商务']},{collectAt:'s3'}]};
 for(const [id,patches] of Object.entries(mutations)){
  const missing=workflow();missing.fields=missing.fields.filter(field=>field.id!==id);assert.ok(validateWorkflowConfig(missing).length,id+' 缺失必须拦截');
  for(const patch of patches){const bad=workflow();Object.assign(bad.fields.find(field=>field.id===id),patch);assert.ok(validateWorkflowConfig(bad).length,id+' '+JSON.stringify(patch));}
 }
 const required=workflow();required.fields.find(field=>field.id==='attachments').required=true;assert.deepEqual(validateWorkflowConfig(required),[]);
 fixed.fields.find(field=>field.id==='region').options=[...WORKFLOW_REGIONS].reverse();assert.deepEqual(validateWorkflowConfig(fixed),[]);
});
test('修复内置字段只生成新草稿，不改已发布配置或在途历史快照',()=>{
 const bad=workflow();Object.assign(bad.fields.find(field=>field.id==='region'),{type:'number',required:false,visible:false});Object.assign(bad.fields.find(field=>field.id==='attachments'),{type:'select',options:['资料'],required:true,visible:false});bad.history=[workflowHistorySnapshot(bad)];
 const before=JSON.stringify(bad),fixed=normalizeWorkflowBuiltinFields(bad);
 assert.equal(JSON.stringify(bad),before);assert.deepEqual(fixed.history,bad.history);assert.deepEqual(validateWorkflowConfig(fixed),[]);
 assert.deepEqual(fixed.fields.find(field=>field.id==='region'),{id:'region',label:'办理区域',required:true,visible:true,type:'select',options:WORKFLOW_REGIONS});
 assert.deepEqual(fixed.fields.find(field=>field.id==='attachments'),{id:'attachments',label:'开户资料',required:true,visible:true,type:'file'});
 assert.deepEqual(fixed.fields.find(field=>field.id==='remark'),bad.fields[0]);
 const missing={...bad,fields:[bad.fields[0]]};assert.deepEqual(validateWorkflowConfig(normalizeWorkflowBuiltinFields(missing)),[]);
});
test('核心流程节点唯一、齐全、有序且角色固定',()=>{
 assert.deepEqual(validateWorkflowConfig(workflow()),[]);
 for(const id of Object.keys(WORKFLOW_CORE_ROLES)){
  const missing=workflow();missing.steps=missing.steps.filter(s=>s.id!==id);assert.ok(validateWorkflowConfig(missing).some(e=>e.includes('核心节点')),id);
  const duplicate=workflow();duplicate.steps.push({...duplicate.steps.find(s=>s.id===id)});assert.ok(validateWorkflowConfig(duplicate).some(e=>e.includes('不能重复')),id);
  const changed=workflow();changed.steps.find(s=>s.id===id).role='Boss';assert.ok(validateWorkflowConfig(changed).some(e=>e.includes('处理角色必须')),id);
 }
 const swapped=workflow();[swapped.steps[1],swapped.steps[2]]=[swapped.steps[2],swapped.steps[1]];assert.ok(validateWorkflowConfig(swapped).some(e=>e.includes('顺序')));
});
test('额外节点可以置于核心之间但不能超出申请与归档边界',()=>{
 for(const index of [1,2,3]){const c=workflow();c.steps.splice(index,0,{id:'extra',name:'补充核验',role:'开户媒介'});assert.deepEqual(validateWorkflowConfig(c),[]);}
 const before=workflow();before.steps.unshift({id:'extra',name:'越界',role:'开户媒介'});assert.ok(validateWorkflowConfig(before).some(e=>e.includes('开始于')));
 const after=workflow();after.steps.push({id:'extra',name:'越界',role:'开户媒介'});assert.ok(validateWorkflowConfig(after).some(e=>e.includes('结束于')));
});
test('范围必须显式声明，产品与区域组合必须相符',()=>{
 const c=workflow();delete c.scopeMode;assert.ok(validateWorkflowConfig(c).some(e=>e.includes('显式选择')));
 assert.deepEqual(validateWorkflowConfig({...workflow(),scopeMode:'product',product:'本地推'}),[]);
 assert.deepEqual(validateWorkflowConfig({...workflow(),scopeMode:'product-region',product:'本地推',region:'华南'}),[]);
 assert.ok(validateWorkflowConfig({...workflow(),scopeMode:'product-region',product:'本地推'}).some(e=>e.includes('具体区域')));
 assert.ok(validateWorkflowConfig({...workflow(),product:'本地推'}).some(e=>e.includes('全局默认必须')));
 assert.ok(validateWorkflowConfig({...workflow(),scopeMode:'product',product:'产品待核验'}).length);
});
test('历史完整保留范围且不把缺失范围升级成全局',()=>{
 const c={...workflow(),scopeMode:'product-region',product:'本地推',region:'华南',customRule:{retain:true},history:[{version:1}]};
 const snapshot=workflowHistorySnapshot(c);
 assert.equal(snapshot.scopeMode,'product-region');assert.equal(snapshot.product,'本地推');assert.equal(snapshot.region,'华南');assert.deepEqual(snapshot.customRule,{retain:true});assert.equal(snapshot.history,undefined);
 snapshot.fields[0].label='changed';assert.equal(c.fields[0].label,'申请说明');
 const missing=workflowHistorySnapshot({version:1,fields:[],steps:[]});assert.equal(missing.scopeMode,'unverified');assert.equal(missing.product,null);assert.equal(missing.region,null);
});
