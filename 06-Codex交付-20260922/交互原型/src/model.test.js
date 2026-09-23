import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,customerAccounts,sharedAccounts,addCustomer,validateOpening,finishOpening,supplierEligible,workflowFor,approveOpeningStep,assignOpening,openingFieldErrors,canHandleOpening,completeOpeningApplication,cancelOpeningRow,saveAccountZongheng} from './model.js';
const seed={customers:[{id:'c1',name:'允城'},{id:'c2',name:'合作方'}],subjects:[{id:'s1',name:'主体',customerIds:['c1','c2']}],shops:[{id:'t1',subjectId:'s1',name:'店铺',laikeId:'LK1'}],accounts:[{id:'a1',customerId:'c1',subjectId:'s1',shopId:'t1',externalId:'1873296142902524',product:'本地推',directId:'Z1'},{id:'a2',customerId:'c2',subjectId:'s1',shopId:'t1',externalId:'A2',product:'本地推'}],suppliers:[{id:'sp1',products:['本地推']},{id:'sp2',products:['腾讯K4']}]};
const savedAttachment={name:'license.pdf',size:128,policyId:'license',storageKey:'local-test-license',storedLocally:true};
function fixture(){const d=freshState(seed);d.applications=[{id:'o1',customerId:'c1',subjectId:'s1',shopId:'t1',product:'本地推',businessOwnerId:'A',businessOwnerName:'商务A',assignee:'媒介',events:[],rows:[{id:'r1',name:'新户',supplierId:'sp1',status:'待办理'}]}];return d;}
test('共享主体不把另一个客户账户归入本客户业务',()=>{const d=fixture();assert.deepEqual(customerAccounts(d,'c1').map(a=>a.id),['a1']);assert.deepEqual(sharedAccounts(d,'c1').map(a=>a.id),['a2']);});
test('规范化同名客户拦截，原资料不复制',()=>{const d=fixture();assert.throws(()=>addCustomer(d,' 允 城 '),/重复/);assert.equal(d.customers.length,2)});
test('直客按主体共用，旧行独立直客必须先更正到主体',()=>{const d=fixture();let f={customerId:'c1',subjectId:'s1',shopId:'t1',product:'本地推',region:'华南',rows:[{directId:'Z1'},{directId:'Z1'}]};assert.match(validateOpening(d,f).join(),/主体统一维护/);d.subjects[0].directId='Z1';d.applications[0].rows[0].directId='Z1';assert.deepEqual(validateOpening(d,f),[]);d.subjects.push({id:'s2',name:'另一主体',directId:'Z1',customerIds:['c2']});assert.match(validateOpening(d,f).join(),/其他主体/);});
test('供应商按产品过滤，不把观察为空当全部支持',()=>{const d=fixture();assert.ok(supplierEligible(d,'sp1','本地推'));assert.equal(supplierEligible(d,'sp2','本地推'),false);});
test('成功建立账户归属来自申请，纵横可后补',()=>{const d=fixture();finishOpening(d,'o1','r1','成功',{name:'新户',externalId:'NEW'});assert.equal(d.accounts[0].businessOwnerId,'A');assert.equal(d.accounts[0].zonghengId,null);assert.equal(d.notifications.length,2);assert.throws(()=>finishOpening(d,'o1','r1','成功',{externalId:'NEW'}),/不能重复/);});
test('同平台账号不能换供应商重建',()=>{const d=fixture();assert.throws(()=>finishOpening(d,'o1','r1','成功',{externalId:'1873296142902524'}),/重复/);assert.equal(d.accounts.length,2)});
test('外部成功仅补同步，不变为未知，不重复建户',()=>{const d=fixture();finishOpening(d,'o1','r1','待同步',{externalId:'SYNC'});assert.equal(d.accounts.length,2);assert.throws(()=>finishOpening(d,'o1','r1','未知'),/只能补同步/);finishOpening(d,'o1','r1','成功',{});assert.equal(d.accounts.length,3)});
test('未知不能直接转为确定失败',()=>{const d=fixture();finishOpening(d,'o1','r1','未知');assert.throws(()=>finishOpening(d,'o1','r1','失败'),/核实/);});
test('额外流程节点完成前不得执行',()=>{const d=fixture();d.applications[0].flowSnapshot=[{id:'extra',name:'资料复核'}];assert.throws(()=>finishOpening(d,'o1','r1','成功',{externalId:'NEW'}),/额外/);d.applications[0].configApprovals={extra:true};finishOpening(d,'o1','r1','成功',{externalId:'NEW'});assert.equal(d.accounts.length,3)});
test('匹配配置按明确范围择优，缺范围历史不是全局模板',()=>{const d=fixture(),global=structuredClone(d.config);d.config={...global,version:4,scopeMode:'product-region',product:'本地推',region:'华南',history:[global,{version:2,scopeMode:'product',product:'本地推'},{version:3}]};assert.equal(workflowFor(d,'本地推','华南').version,4);assert.equal(workflowFor(d,'本地推','华北').version,2);assert.equal(workflowFor(d,'腾讯K4','华南').version,1);});
test('待同步锁定外部身份；停用供应商仍能记回已经成功的事实',()=>{const d=fixture();finishOpening(d,'o1','r1','待同步',{externalId:'SYNC',name:'最终户'});assert.throws(()=>finishOpening(d,'o1','r1','成功',{externalId:'WRONG'}),/锁定/);d.suppliers[0].active=false;d.shops[0].laikeId=null;finishOpening(d,'o1','r1','成功',{});assert.equal(d.accounts[0].externalId,'SYNC');assert.equal(d.accounts[0].openingIdentitySnapshot.laikeId,'LK1');assert.equal(d.accounts[0].supplierId,'sp1');});
test('未知经有依据核实未发生后才能重办，原请求留痕',()=>{const d=fixture();finishOpening(d,'o1','r1','未知');const first=d.applications[0].rows[0].requestId;assert.throws(()=>finishOpening(d,'o1','r1','核实未发生'),/依据/);finishOpening(d,'o1','r1','核实未发生',{verificationReason:'原请求查询未创建，媒介核查'});finishOpening(d,'o1','r1','成功',{externalId:'RETRY'});const r=d.applications[0].rows[0];assert.equal(r.verifications[0].requestId,first);assert.notEqual(r.requestId,first);assert.equal(r.requestHistory.length,1);assert.equal(d.accounts.length,3);});
test('配置审批按快照顺序与角色；前置审批完成才可派单',()=>{const d=fixture(),a=d.applications[0];a.assignee=null;a.flowSnapshot=[{id:'s1'},{id:'e1',role:'财务',name:'资料核验'},{id:'e2',role:'Boss',name:'复核'},{id:'s2'},{id:'s3'},{id:'e3',role:'财务',name:'归档复核'},{id:'s4'}];assert.throws(()=>assignOpening(d,a.id,'媒介','媒介主管'),/前序/);assert.throws(()=>approveOpeningStep(d,a.id,'e2','Boss'),/前序/);assert.throws(()=>approveOpeningStep(d,a.id,'e1','商务'),/需要/);approveOpeningStep(d,a.id,'e1','财务');approveOpeningStep(d,a.id,'e2','Boss');assignOpening(d,a.id,'媒介','媒介主管');assert.throws(()=>approveOpeningStep(d,a.id,'e3','财务'),/全部开户结果/);finishOpening(d,a.id,'r1','成功',{externalId:'FLOW'});assert.equal(a.status,'开户已完成，流程待复核');approveOpeningStep(d,a.id,'e3','财务');assert.equal(a.status,'全部完成');});
test('全部成功申请不能重新派单而退回待办',()=>{const d=fixture();finishOpening(d,'o1','r1','成功',{externalId:'CLOSED'});assert.throws(()=>assignOpening(d,'o1','新媒介','媒介主管'),/已终结/);assert.equal(d.applications[0].status,'全部完成');});
test('配置附件必填要求已保存文件，文件名不冒充上传',()=>{const flow={fields:[{id:'region',required:true,label:'区域'},{id:'attachments',required:true,label:'开户资料'},{id:'custom',required:true,label:'说明'}]};assert.equal(openingFieldErrors(flow,{region:'华南'}).length,2);assert.match(openingFieldErrors(flow,{region:'华南',attachmentName:'license.pdf',customValues:{custom:'已核验'}}).join(),/上传/);assert.equal(openingFieldErrors(flow,{region:'华南',attachments:[savedAttachment],customValues:{custom:'已核验'}}).length,0);});

test('数量为正整数且与媒介任务数一致，不要求商务逐行填资料',()=>{
  const d=fixture(),form={customerId:'c1',subjectId:'s1',shopId:'t1',product:'本地推',region:'华南',requestedCount:2,rows:[{id:'one'},{id:'two'}]};
  assert.deepEqual(validateOpening(d,form),[]);
  for(const requestedCount of [0,-1,1,1.5,'2'])assert.match(validateOpening(d,{...form,requestedCount}).join(),/数量/);
  assert.deepEqual(validateOpening(d,{...form,requestedCount:undefined}),[]);
  assert.match(validateOpening(d,{...form,rows:undefined}).join(),/数量/);
});
test('同主体多个账户共用一个直客，名称可空且责任分别保存',()=>{
  const d=fixture(),app=d.applications[0];d.subjects[0].directId='Z1';app.rows.push({id:'r2',supplierId:'sp1',status:'待办理'});
  finishOpening(d,app.id,'r1','成功',{externalId:'N1',name:''});finishOpening(d,app.id,'r2','成功',{externalId:'N2',name:''});
  assert.equal(app.status,'全部完成');assert.deepEqual(d.accounts.slice(0,2).map(a=>[a.directId,a.directName,a.name,a.businessOwnerId]),[['Z1','主体','','A'],['Z1','主体','','A']]);
});
test('未知请求锁定空直客和原主体快照，当前补资料不补写外部历史',()=>{
  const d=fixture(),row=d.applications[0].rows[0];finishOpening(d,'o1','r1','未知');
  d.subjects[0].directId='NEW-D';d.subjects[0].name='更名主体';row.directId='NEW-D';d.shops[0].name='新店铺名';
  finishOpening(d,'o1','r1','成功',{externalId:'LOCKED-EMPTY',name:''});
  const account=d.accounts[0];assert.equal(account.directId,null);assert.equal(account.openingIdentitySnapshot.directId,null);assert.equal(account.openingIdentitySnapshot.subjectSnapshot.name,'主体');assert.equal(account.openingIdentitySnapshot.laikeName,'店铺');assert.equal(account.businessOwnerId,'A');
});
test('待同步的空账户名称也被锁定，补同步不回填当前行名称',()=>{
  const d=fixture(),row=d.applications[0].rows[0];finishOpening(d,'o1','r1','待同步',{externalId:'BLANK',name:''});row.name='错误的新名称';
  assert.throws(()=>finishOpening(d,'o1','r1','成功',{name:'错误的新名称'}),/锁定/);finishOpening(d,'o1','r1','成功',{});assert.equal(d.accounts[0].name,'');
});
test('纵横非空一对一覆盖待同步结果，空编号不占用',()=>{
  const d=fixture(),app=d.applications[0];app.rows.push({id:'r2',supplierId:'sp1',status:'待办理'});
  finishOpening(d,app.id,'r1','待同步',{externalId:'ZH1',zonghengId:'ZH-1'});
  assert.throws(()=>finishOpening(d,app.id,'r2','成功',{externalId:'ZH2',zonghengId:'ZH-1'}),/纵横 ID/);assert.equal(app.rows[1].requestId,undefined);
  finishOpening(d,app.id,'r2','成功',{externalId:'ZH2'});assert.equal(d.accounts[0].zonghengId,null);
  assert.throws(()=>finishOpening(d,app.id,'r1','成功',{zonghengId:'ZH-CHANGED'}),/锁定/);finishOpening(d,app.id,'r1','成功');assert.equal(d.accounts[0].zonghengId,'ZH-1');
});
test('执行采用申请绑定的附件规则，核实已受理请求不被当前材料缺失阻断',()=>{
  const d=fixture(),app=d.applications[0];app.fieldSnapshot=[];app.attachmentPolicySnapshot=[{id:'license',label:'营业执照',product:'本地推',visible:true,required:true,requiredAt:'execution',accept:['pdf'],maxSizeMB:10}];
  assert.throws(()=>finishOpening(d,app.id,'r1','未知'),/营业执照/);assert.equal(app.rows[0].requestId,undefined);
  app.attachments=[savedAttachment];finishOpening(d,app.id,'r1','未知');app.attachments=[];
  finishOpening(d,app.id,'r1','成功',{externalId:'ALREADY-ACCEPTED'});assert.equal(d.accounts[0].externalId,'ALREADY-ACCEPTED');
});
test('历史多店不自动合并或默认选第一店，已受理的原结果仍可核实',()=>{
  const d=fixture(),app=d.applications[0];finishOpening(d,app.id,'r1','未知');
  d.shops.push({id:'historical-second',subjectId:'s1',name:'历史另一店'});const before=structuredClone(d.shops);
  const errors=validateOpening(d,{customerId:'c1',subjectId:'s1',shopId:'t1',product:'本地推',region:'华南',rows:[{}]});assert.match(errors.join(),/历史多店/);assert.deepEqual(d.shops,before);
  finishOpening(d,app.id,'r1','成功',{externalId:'BEFORE-CONFLICT'});assert.equal(d.accounts[0].shopId,'t1');
  app.rows.push({id:'new-request',supplierId:'sp1',status:'待办理'});assert.throws(()=>finishOpening(d,app.id,'new-request','成功',{externalId:'AFTER-CONFLICT'}),/历史多店/);
});
test('切换主体后旧主体已存附件不能提交，匹配主体及历史未标主体材料分别处理',()=>{
  const d=fixture(),form={region:'华南',product:'本地推',subjectId:'s1',attachments:[{...savedAttachment,subjectId:'s1'}]};
  assert.deepEqual(openingFieldErrors(d.config,form),[]);
  assert.match(openingFieldErrors(d.config,{...form,subjectId:'s2'}).join(),/属于其他主体/);
  assert.match(openingFieldErrors(d.config,{...form,subjectId:''}).join(),/属于其他主体/);
  assert.deepEqual(openingFieldErrors(d.config,{...form,attachments:[savedAttachment]}),[]);
});
test('新执行拒绝不同主体附件，已受理未知和待同步仍核实原请求',()=>{
  for(const acceptedStatus of ['未知','待同步']){
    const d=fixture(),app=d.applications[0],row=app.rows[0];app.attachments=[{...savedAttachment,subjectId:'other-subject'}];
    for(const outcome of ['成功','待同步','未知'])assert.throws(()=>finishOpening(d,app.id,row.id,outcome,{externalId:'ATTACHMENT-SUBJECT'}),/属于其他主体/);
    assert.equal(row.status,'待办理');assert.equal(row.requestId,undefined);assert.equal(d.accounts.length,2);
    app.attachments[0].subjectId=app.subjectId;finishOpening(d,app.id,row.id,acceptedStatus,{externalId:'ATTACHMENT-SUBJECT'});
    const requestId=row.requestId,requestSnapshot=structuredClone(row.requestSnapshot);app.attachments[0].subjectId='later-mismatch';
    finishOpening(d,app.id,row.id,'成功',{externalId:'ATTACHMENT-SUBJECT'});
    assert.equal(row.requestId,requestId);assert.deepEqual(row.requestSnapshot,requestSnapshot);assert.equal(d.accounts[0].subjectId,'s1');assert.equal(d.accounts[0].externalId,'ATTACHMENT-SUBJECT');
  }
});

const assignedMedia={role:'开户媒介',name:'媒介'},otherMedia={role:'开户媒介',name:'另一媒介'},admin={role:'系统管理员',name:'管理员'};
function manualFixture(count=1){const d=fixture(),app=d.applications[0];app.completionMode='manual';app.requestedCount=count;app.rows=Array.from({length:count},(_,i)=>({id:'r'+(i+1),supplierId:'sp1',status:'待办理'}));return d;}
test('新申请五户逐行成功后仍待确认，显式完成一次且保留所有账户入口',()=>{
  const d=manualFixture(5),app=d.applications[0];
  d.notifications.push({id:'dispatch',moduleId:'M06',params:{applicationId:app.id},read:false});
  for(const row of app.rows)finishOpening(d,app.id,row.id,'成功',{externalId:'FIVE-'+row.id},assignedMedia);
  assert.equal(app.status,'待确认完成');assert.equal(app.completionConfirmedAt,undefined);
  assert.equal(d.accounts.filter(a=>a.applicationId===app.id).length,5);
  assert.equal(d.notifications.filter(n=>n.kind==='zongheng-pending'&&n.params.accountId===n.accountId).length,5);
  completeOpeningApplication(d,app.id,assignedMedia);
  assert.equal(app.status,'全部完成');assert.equal(app.completionConfirmedBy,'媒介');assert.ok(app.completionConfirmedAt);
  assert.equal(d.notifications.find(n=>n.id==='dispatch').read,true);
  assert.equal(d.notifications.filter(n=>n.kind==='opening-completion').length,1);
  const after=structuredClone(d);assert.throws(()=>completeOpeningApplication(d,app.id,assignedMedia),/已经完成/);assert.deepEqual(d,after);
});
test('显式终结拒绝部分、失败、未知、待同步、空单及账户映射缺失',()=>{
  for(const outcome of [null,'失败','未知','待同步']){
    const d=manualFixture(2),app=d.applications[0];finishOpening(d,app.id,'r1','成功',{externalId:'ONE'},assignedMedia);
    if(outcome)finishOpening(d,app.id,'r2',outcome,{externalId:'TWO'},assignedMedia);
    const before=structuredClone(d);assert.throws(()=>completeOpeningApplication(d,app.id,assignedMedia),/处理全部/);assert.deepEqual(d,before);
  }
  const d=manualFixture(),app=d.applications[0];app.rows=[];assert.throws(()=>completeOpeningApplication(d,app.id,assignedMedia),/处理全部/);
  app.rows=[{id:'r1',status:'成功',externalId:'MISSING',accountId:'missing'}];assert.throws(()=>completeOpeningApplication(d,app.id,assignedMedia),/缺少对应广告账户/);
});
test('新申请完成前后置审批不可抢跑，完成后仍按原版本完成后置审批',()=>{
  const d=manualFixture(),app=d.applications[0];app.flowSnapshot=[{id:'s1'},{id:'s2'},{id:'s3'},{id:'review',role:'财务',name:'归档复核'},{id:'s4'}];
  finishOpening(d,app.id,'r1','成功',{externalId:'POST-REVIEW'},assignedMedia);
  assert.throws(()=>approveOpeningStep(d,app.id,'review','财务'),/完成本次开户/);assert.equal(app.configApprovals,undefined);
  completeOpeningApplication(d,app.id,assignedMedia,{note:'五项材料核对完成'});assert.equal(app.status,'开户已完成，流程待复核');assert.equal(app.completionNote,'五项材料核对完成');
  approveOpeningStep(d,app.id,'review','财务');assert.equal(app.status,'全部完成');
});
test('取消最后剩余行和全部取消均不绕过新申请的显式完成',()=>{
  const d=manualFixture(2),app=d.applications[0];finishOpening(d,app.id,'r1','成功',{externalId:'ONE-CANCEL'},assignedMedia);
  cancelOpeningRow(d,app.id,'r2','客户取消',assignedMedia);assert.equal(app.status,'待确认完成');completeOpeningApplication(d,app.id,assignedMedia);assert.equal(app.status,'全部完成');
  const all=manualFixture(),cancelled=all.applications[0];cancelOpeningRow(all,cancelled.id,'r1','客户取消',assignedMedia);assert.equal(cancelled.status,'待确认完成');
  completeOpeningApplication(all,cancelled.id,assignedMedia);assert.equal(cancelled.status,'已取消');
});
test('历史自动完成单不倒退，新申请数量不一致不能确认完成',()=>{
  const d=fixture();finishOpening(d,'o1','r1','成功',{externalId:'LEGACY'});assert.equal(d.applications[0].status,'全部完成');
  const before=structuredClone(d);assert.throws(()=>completeOpeningApplication(d,'o1',assignedMedia),/已经完成/);assert.deepEqual(d,before);
  const manual=manualFixture(),app=manual.applications[0];finishOpening(manual,app.id,'r1','成功',{externalId:'COUNT'},assignedMedia);app.requestedCount=5;
  assert.throws(()=>completeOpeningApplication(manual,app.id,assignedMedia),/数量/);assert.equal(app.status,'待确认完成');
});
test('媒介办理按被派单人限制，稳定身份优先且管理员可办理',()=>{
  const d=manualFixture(),app=d.applications[0];assert.equal(canHandleOpening(assignedMedia,app),true);assert.equal(canHandleOpening(otherMedia,app),false);
  const before=structuredClone(d);
  for(const session of [otherMedia,{role:'媒介主管',name:'媒介'},{role:'商务',name:'媒介'}]){
    assert.throws(()=>finishOpening(d,app.id,'r1','成功',{externalId:'NO'},session),/被指派/);
    assert.throws(()=>completeOpeningApplication(d,app.id,session),/被指派/);
  }
  assert.throws(()=>cancelOpeningRow(d,app.id,'r1','取消',otherMedia),/被指派/);assert.deepEqual(d,before);
  app.assigneeId='media-2';assert.equal(canHandleOpening(assignedMedia,app),false);assert.equal(canHandleOpening({...otherMedia,employeeId:'media-2'},app),true);
  finishOpening(d,app.id,'r1','成功',{externalId:'ADMIN'},admin);completeOpeningApplication(d,app.id,admin);assert.equal(app.completionConfirmedBy,'管理员');
});
test('纵横补录允许空备注、更新当前资料与申请行并解决对应消息，原请求快照不变',()=>{
  const d=manualFixture(),app=d.applications[0];finishOpening(d,app.id,'r1','成功',{externalId:'ZH-SAVE'},assignedMedia);const account=d.accounts[0],row=app.rows[0];
  const original={request:structuredClone(row.requestSnapshot),result:structuredClone(row.externalResult),account:structuredClone(account.openingIdentitySnapshot)};
  d.notifications.push({id:'unrelated',moduleId:'M05',accountId:account.id,title:'其他业务消息',read:false});
  saveAccountZongheng(d,account.id,' ZH-NEW ',{session:assignedMedia});
  assert.equal(account.zonghengId,'ZH-NEW');assert.equal(row.zonghengId,'ZH-NEW');assert.equal(account.businessOwnerId,'A');assert.equal(app.status,'待确认完成');
  assert.deepEqual(row.requestSnapshot,original.request);assert.deepEqual(row.externalResult,original.result);assert.deepEqual(account.openingIdentitySnapshot,original.account);
  const notice=d.notifications.find(n=>n.kind==='zongheng-pending');assert.equal(notice.read,true);assert.ok(notice.resolvedAt);assert.equal(d.notifications.find(n=>n.id==='unrelated').read,false);
  const changes=account.changes.length;saveAccountZongheng(d,account.id,'ZH-NEW',{session:assignedMedia});assert.equal(account.changes.length,changes);
});
test('纵横补录校验权限、非空和已有账户及在途结果，失败不改当前账户',()=>{
  const d=manualFixture(2),app=d.applications[0];finishOpening(d,app.id,'r1','成功',{externalId:'ZH-ACCOUNT'},assignedMedia);const account=d.accounts[0];
  finishOpening(d,app.id,'r2','待同步',{externalId:'ZH-PENDING',zonghengId:'PENDING-ZH'},assignedMedia);d.accounts[1].zonghengId='EXISTING-ZH';
  const before=structuredClone(d);
  assert.throws(()=>saveAccountZongheng(d,account.id,'',{session:assignedMedia}),/请输入纵横/);
  assert.throws(()=>saveAccountZongheng(d,account.id,'NEW',{session:{role:'商务'}}),/维护权限/);
  for(const value of ['PENDING-ZH','EXISTING-ZH'])assert.throws(()=>saveAccountZongheng(d,account.id,value,{session:assignedMedia}),/纵横 ID/);
  assert.deepEqual(d,before);
});
test('更正纵横后旧执行快照不继续占用原编号，新编号在后续开户防重',()=>{
  const d=manualFixture(2),app=d.applications[0];finishOpening(d,app.id,'r1','成功',{externalId:'ORIGINAL',zonghengId:'OLD-ZH'},assignedMedia);const account=d.accounts[0];
  saveAccountZongheng(d,account.id,'NEW-ZH',{session:assignedMedia,note:'核对后更正'});
  assert.equal(account.openingIdentitySnapshot.zonghengId,'OLD-ZH');assert.throws(()=>finishOpening(d,app.id,'r2','成功',{externalId:'SECOND',zonghengId:'NEW-ZH'},assignedMedia),/纵横 ID/);
  finishOpening(d,app.id,'r2','成功',{externalId:'SECOND',zonghengId:'OLD-ZH'},assignedMedia);assert.equal(d.accounts[0].zonghengId,'OLD-ZH');
});

test('他人媒介不能补纵横或审批本单媒介节点，本人可继续办理',()=>{
 const d=manualFixture(),app=d.applications[0];finishOpening(d,app.id,'r1','成功',{externalId:'MEDIA-BOUNDARY'},assignedMedia);
 const account=d.accounts[0],before=structuredClone(d);
 assert.throws(()=>saveAccountZongheng(d,account.id,'FOREIGN',{session:otherMedia}),/本人开户申请/);assert.deepEqual(d,before);
 app.flowSnapshot=[{id:'s1'},{id:'s2'},{id:'s3'},{id:'review-media',role:'开户媒介',name:'媒介复核'},{id:'s4'}];
 completeOpeningApplication(d,app.id,assignedMedia);
 assert.throws(()=>approveOpeningStep(d,app.id,'review-media','开户媒介',otherMedia),/自己的开户申请/);
 assert.equal(app.configApprovals,undefined);
 approveOpeningStep(d,app.id,'review-media','开户媒介',assignedMedia);assert.equal(app.status,'全部完成');
});
