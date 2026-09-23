import test from 'node:test';
import assert from 'node:assert/strict';
import {operationSpecs,validateRecord,canOperate,validateWorkflowConfig,WORKFLOW_CORE_ROLES} from './operations-specs.js';
import {paymentPatch,approvedBalance,inspectImport,canAccessBatch,canReadOperation,canCreateOperation,validateAuthorization,authorizationStatus,findPayrollAppointment} from './operations-controls.js';
const values=id=>structuredClone(Object.fromEntries(operationSpecs[id].fields.map(f=>[f.key,f.value])));

test('组合角色按能力并集判定，停用、过期、待生效仍拒绝动作',()=>{
 assert.equal(canOperate({role:'商务',roles:['财务']},['财务']),true);
 assert.equal(canOperate({role:'系统管理员'},['财务']),false);
 for(const patch of [{disabled:true},{status:'离职'},{expiresAt:'2000-01-01'},{effectiveAt:'2999-01-01'}])assert.equal(canOperate({role:'财务',...patch},['*']),false);
 assert.equal(canCreateOperation({role:'员工'},'M38'),false);
 assert.equal(canCreateOperation({role:'剪辑'},'M28'),true);
});
test('费用按批准版本分次付款，申请额不能成为未批准的可付余额',()=>{
 const draft={amount:'1000.00',version:2};assert.equal(approvedBalance(draft,'M23'),0);
 assert.ok(paymentPatch(draft,'M23','1.00','P1').error);
 const approved={...draft,approvedCents:100000,approvedVersion:2};
 const first=paymentPatch(approved,'M23','900.00','P1');assert.equal(first.status,'部分付');
 assert.equal(approvedBalance({...approved,...first.patch},'M23'),10000);
 assert.ok(paymentPatch({...approved,...first.patch},'M23','100.01','P2').error);
 const last=paymentPatch({...approved,...first.patch},'M23','100.00','P2');assert.equal(last.status,'已付');assert.equal(last.patch.payments.length,2);assert.equal(last.patch.payments[0].proof,'P1');
 assert.ok(paymentPatch(approved,'M23','900.00','').error);
});
test('工资发布不等于发放，分次工资付款保留未付部分',()=>{
 const salary={version:1,netCents:780000};const first=paymentPatch(salary,'M31','7000.00','DEMO-PAY-1');
 assert.equal(first.status,'部分发放');assert.equal(approvedBalance({...salary,...first.patch},'M31'),80000);
 assert.equal(paymentPatch({...salary,...first.patch},'M31','800.00','DEMO-PAY-2').status,'已发');
});
test('工资任职匹配按员工ID、任职版本、有效期间，不能按同名或当前角色',()=>{
 const employee={employeeId:'EMP-1',appointmentRef:'JOB-1',name:'演示同名',effective:'2026-09-21',appointmentEnd:'2026-10-01'};
 const salary={employeeId:'EMP-1',appointmentRef:'JOB-1',period:'2026-09'};
 assert.equal(findPayrollAppointment([employee],salary),employee);
 for(const patch of [{employeeId:'EMP-2'},{appointmentRef:'JOB-2'},{period:'2026-08'},{period:'2026-11'}])assert.equal(findPayrollAppointment([employee],{...salary,...patch}),undefined);
});
test('稳定人员ID控制本人敏感记录，不通过同名或普通主管权限泄露',()=>{
 const record={employeeId:'EMP-1',employee:'演示同名',status:'已发布'};
 assert.equal(canReadOperation({role:'员工',employeeId:'EMP-1'},'M31',record),true);
 assert.equal(canReadOperation({role:'员工',employeeId:'EMP-2',name:'演示同名'},'M31',record),false);
 assert.equal(canReadOperation({role:'商务主管'},'M31',record),false);
 assert.equal(canReadOperation({role:'员工',employeeId:'EMP-1'},'M31',{...record,status:'待匹配'}),false);
});
test('费用明细与消耗分摊都要守恒，不能重复占用同一来源',()=>{
 assert.ok(validateRecord(operationSpecs.M23,{...values('M23'),amount:'999.00'}).items);
 const v=values('M24');v.allocations=[{sourceId:'A',capacity:'500.00',allocated:'300.00',rebate:'R1'},{sourceId:'B',capacity:'600.00',allocated:'500.00',rebate:'R2'}];
 assert.deepEqual(validateRecord(operationSpecs.M24,v),{});
 v.allocations[1].capacity='499.00';assert.ok(validateRecord(operationSpecs.M24,v).allocations);
 v.allocations[1].capacity='600.00';v.allocations[1].sourceId='A';assert.ok(validateRecord(operationSpecs.M24,v).allocations);
});
test('未知迁移金额保留空值，核对完成后必须有金额；素材数量不能小数',()=>{
 const v=values('M37');assert.deepEqual(validateRecord(operationSpecs.M37,v),{});
 assert.ok(validateRecord(operationSpecs.M37,{...v,fundingStatus:'已核对演示数'}).fundingStatus);
 assert.deepEqual(validateRecord(operationSpecs.M37,{...v,fundingStatus:'已核对演示数',openingAmount:'0.00',unsettledAmount:'0.00'}),{});
 assert.ok(validateRecord(operationSpecs.M28,{...values('M28'),total:'100.5'}).total);
});
test('导入预检保留19位ID，同批、跨批、科学计数和多余列分别标错',()=>{
 const id='7669638049290012726',text=`${id},演示甲,100.00\n${id},重复,100.00\n7.6696e18,错误,100.00\n123,错误,1.00,多列`;
 const rows=inspectImport(text,[],'A');assert.equal(rows[0].externalId,id);assert.equal(rows[0].status,'可导入');assert.equal(rows[1].status,'同批重复 ID');assert.match(rows[2].status,/科学计数/);assert.match(rows[3].status,/三列/);
 assert.match(inspectImport(`${id},演示甲,100.00`,[{scope:'A',rows:[{externalId:id,status:'演示已导入'}]}],'A')[0].status,/已导入/);
 assert.equal(JSON.parse(JSON.stringify({externalId:id})).externalId,id);
 assert.equal(canAccessBatch({role:'商务',name:'B'},{actor:'A'}),false);
 assert.equal(canAccessBatch({role:'财务',disabled:true},{actor:'财务'}),false);
});
test('授权范围任职与期限需明确，协办不能无期限授予',()=>{
 const form={name:'演示员工',externalId:'WX-1',roles:['商务','财务'],scope:'指定对象',scopeRef:'DEMO-A1',job:'商务岗',appointmentRef:'JOB-1',effectiveAt:'2026-01-01T00:00'};
 assert.deepEqual(validateAuthorization(form),[]);
 assert.ok(validateAuthorization({...form,scopeRef:''}).length);
 assert.ok(validateAuthorization({...form,assistRef:'A-1'}).length);
 assert.equal(authorizationStatus({...form,expiresAt:'2026-01-02T00:00'},'2026-01-03T00:00'),'授权过期');
 assert.equal(authorizationStatus({...form,status:'停用'},'2026-01-01T00:00'),'停用');
});
test('工作流必填字段必须有真实采集入口，拒绝隐藏、保留ID或空选项',()=>{
 const config={scopeMode:'global',product:'',region:'全局默认',fields:[{id:'custom',label:'资料',type:'text',required:true,visible:true,collectAt:'s1',allowedRoles:['商务','系统管理员']},{id:'region',label:'办理区域',required:true},{id:'attachments',label:'开户资料',required:false}],steps:Object.entries(WORKFLOW_CORE_ROLES).map(([id,role])=>({id,role,name:id}))};
 assert.deepEqual(validateWorkflowConfig(config),[]);
 for(const patch of [{visible:false},{collectAt:'s3'},{allowedRoles:['财务']},{type:'select',options:[]},{id:'creditCode'}])assert.ok(validateWorkflowConfig({...config,fields:[{...config.fields[0],...patch},...config.fields.slice(1)]}).length);
});
