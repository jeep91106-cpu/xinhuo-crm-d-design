import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,finishOpening,assignOpening,completeOpeningApplication} from '../src/model.js';
import {isOpeningBatchEditable,openingRowDraft,saveOpeningBatchDraft,validateOpeningBatch,registerOpeningBatchSuccess,recordOpeningRowResult} from '../src/opening-batch.js';

const media={role:'开户媒介',name:'媒介一'},otherMedia={role:'开户媒介',name:'媒介二'},admin={role:'系统管理员',name:'管理员'};
function fixture(count=3){
  const db=freshState({customers:[{id:'c',name:'客户'}],subjects:[{id:'s',name:'主体',customerIds:['c']}],shops:[{id:'t',subjectId:'s',name:'店铺',laikeId:null}],suppliers:[{id:'sp',products:['本地推']},{id:'sp2',products:['本地推']},{id:'wrong-product',products:['腾讯K4']}],accounts:[]});
  db.applications=[{id:'app',customerId:'c',subjectId:'s',shopId:'t',product:'本地推',businessOwnerId:'sales',businessOwnerName:'商务',assignee:media.name,requestedCount:count,completionMode:'manual',status:'待媒介办理',flowSnapshot:structuredClone(db.config.steps),fieldSnapshot:[],events:[],rows:Array.from({length:count},(_,index)=>({id:'r'+(index+1),supplierId:'',name:'',status:'待办理'}))}];
  return db;
}
function entries(db){return db.applications[0].rows.map((row,index)=>({id:row.id,supplierId:index%2?'sp2':'sp',name:index%2?'账户'+index:'',externalId:'000'+(index+1),zonghengId:index%2?'ZH-'+index:''}));}
function rejectedWithoutChanges(db,operation,check){
  const before=structuredClone(db);let failure;
  assert.throws(operation,cause=>{failure=cause;return cause instanceof Error&&Array.isArray(cause.rowErrors)&&cause.rowErrors.length>0;});
  assert.deepEqual(db,before);check?.(failure.rowErrors);
}

test('批量只接受待办理和明确失败行，草稿四字段优先且显式空值不回退',()=>{
  for(const status of ['待办理','失败'])assert.equal(isOpeningBatchEditable({status}),true);
  for(const status of ['未知','待同步','成功','已取消','执行中','未提交',undefined])assert.equal(isOpeningBatchEditable({status}),false);
  assert.equal(isOpeningBatchEditable(null),false);
  assert.deepEqual(openingRowDraft({supplierId:'sp',name:'旧名称',externalId:'OLD',zonghengId:'ZH',pendingValues:{supplierId:'',name:'',externalId:'000001',zonghengId:null}}),{supplierId:'',name:'',externalId:'000001',zonghengId:''});
  assert.deepEqual(openingRowDraft({supplierId:'sp',externalId:'000001',pendingValues:{name:'草稿'}}),{supplierId:'sp',name:'草稿',externalId:'000001',zonghengId:''});
  assert.deepEqual(openingRowDraft(),{supplierId:'',name:'',externalId:'',zonghengId:''});
});

test('十行草稿可保存空ID、空供应商及前导零，只保存选中行输入和时间',()=>{
  const db=fixture(10),input=entries(db);input[0]={id:'r1',supplierId:'',name:'',externalId:'',zonghengId:''};input[1].externalId='000000123';input[1].zonghengId='000005';
  db.applications[0].rows[1].status='失败';db.applications[0].rows[1].requestSnapshot={directId:'原值'};
  const before=structuredClone(db),inputBefore=structuredClone(input);
  saveOpeningBatchDraft(db,'app',input,media);
  assert.deepEqual(input,inputBefore);assert.equal(db.accounts.length,0);assert.deepEqual(db.notifications,before.notifications);
  assert.deepEqual(db.applications[0].rows.map(openingRowDraft),input.map(({id,...values})=>values));
  const withoutDraft=structuredClone(db);for(const row of withoutDraft.applications[0].rows){delete row.pendingValues;delete row.draftSavedAt;}
  assert.deepEqual(withoutDraft,before);
  const loaded=JSON.parse(JSON.stringify(db));assert.equal(openingRowDraft(loaded.applications[0].rows[1]).externalId,'000000123');
});

test('十行全部通过才登记，继承原申请归属且最后停在待确认完成',()=>{
  const db=fixture(10),input=entries(db);saveOpeningBatchDraft(db,'app',input,media);const before=structuredClone(db);
  assert.deepEqual(validateOpeningBatch(db,'app',input,media),[]);assert.deepEqual(db,before);
  const app=registerOpeningBatchSuccess(db,'app',input,media);
  assert.equal(app,db.applications[0]);assert.equal(app.status,'待确认完成');assert.equal(app.completionConfirmedAt,undefined);assert.equal(app.requestedCount,10);assert.equal(app.rows.length,10);
  assert.equal(db.accounts.length,10);assert.equal(new Set(db.accounts.map(account=>account.externalId)).size,10);
  assert.ok(db.accounts.every(account=>account.applicationId==='app'&&account.businessOwnerId==='sales'&&account.customerId==='c'&&account.subjectId==='s'&&account.shopId==='t'));
  assert.equal(db.accounts.filter(account=>account.name==='').length,5);assert.equal(db.notifications.filter(message=>message.kind==='zongheng-pending').length,5);
  assert.ok(app.rows.every(row=>row.status==='成功'&&!Object.hasOwn(row,'pendingValues')&&row.requestSnapshot&&row.accountId));
  completeOpeningApplication(db,'app',media);assert.equal(app.status,'全部完成');
});

test('十行选八行成功后留下两行原草稿，续办后仍需独立确认完成',()=>{
  const db=fixture(10),input=entries(db);saveOpeningBatchDraft(db,'app',input,media);
  const remaining=structuredClone(db.applications[0].rows.slice(8));
  registerOpeningBatchSuccess(db,'app',input.slice(0,8),media);
  assert.equal(db.accounts.length,8);assert.equal(db.applications[0].status,'部分完成');
  assert.deepEqual(db.applications[0].rows.slice(8),remaining);assert.equal(db.applications[0].requestedCount,10);
  assert.throws(()=>completeOpeningApplication(db,'app',media),/全部申请行/);
  const restored=JSON.parse(JSON.stringify(db));registerOpeningBatchSuccess(restored,'app',input.slice(8),media);
  assert.equal(restored.accounts.length,10);assert.equal(restored.applications[0].status,'待确认完成');
  assert.equal(restored.applications[0].completionConfirmedAt,undefined);
});

test('同批账户ID和纵横重复同时给双方字段错误，空纵横不算重复',()=>{
  const db=fixture(),input=entries(db);input[0].externalId=' DUP ';input[1].externalId='DUP';input[0].zonghengId=' SAME ';input[2].zonghengId='SAME';
  const before=structuredClone(db),errors=validateOpeningBatch(db,'app',input,media);assert.deepEqual(db,before);
  assert.deepEqual(errors.filter(item=>item.field==='externalId').map(item=>item.rowId).sort(),['r1','r2']);
  assert.deepEqual(errors.filter(item=>item.field==='zonghengId').map(item=>item.rowId).sort(),['r1','r3']);
  assert.ok(errors.filter(item=>item.field==='externalId').every(item=>item.message==='第1、2行的广告账户 ID重复，请核对。'));
  assert.ok(errors.filter(item=>item.field==='zonghengId').every(item=>item.message==='第1、3行的纵横 ID重复，请核对。'));
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media));
  const empty=entries(db).map(item=>({...item,zonghengId:''}));assert.deepEqual(validateOpeningBatch(db,'app',empty,media),[]);
});

test('部分行倒序选中时重复提示仍使用原申请行号，内部行ID不进入提示',()=>{
  const db=fixture(5);db.applications[0].rows.forEach((row,index)=>{row.id='L-private-'+index;});
  const all=entries(db),input=[all[3],all[1]].map(item=>({...item,externalId:'DUP',zonghengId:'SAME'}));
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media),errors=>{
    assert.equal(errors.length,4);
    for(const [field,label] of [['externalId','广告账户 ID'],['zonghengId','纵横 ID']]){
      const duplicates=errors.filter(item=>item.field===field);
      assert.deepEqual(duplicates.map(item=>item.rowId).sort(),['L-private-1','L-private-3']);
      assert.ok(duplicates.every(item=>item.message==='第2、4行的'+label+'重复，请核对。'));
    }
    assert.ok(errors.every(item=>!item.message.includes('L-private-')));
  });
});

test('第三行供应商失效时整批回滚，前两行不产生账户、请求、通知或成功状态',()=>{
  const db=fixture(),input=entries(db);input[2].supplierId='wrong-product';
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media),errors=>assert.ok(errors.some(item=>item.rowId==='r3'&&item.field==='supplierId')));
  input[2].supplierId='sp';db.suppliers[0].active=false;
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media),errors=>assert.deepEqual(errors.map(item=>item.rowId).sort(),['r1','r3']));
});

test('第三行已有或在途ID冲突时整批回滚，跨供应商仍按平台防重',()=>{
  const db=fixture(),input=entries(db);db.accounts.push({id:'existing',product:'巨量AD',externalId:input[2].externalId,supplierId:'another'});
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media),errors=>assert.ok(errors.some(item=>item.rowId==='r3'&&item.field==='externalId')));
  db.accounts=[];db.applications.push({id:'pending',product:'巨量AD',rows:[{id:'inflight',status:'待同步',externalId:input[2].externalId,externalResult:{zonghengId:'INFLIGHT-ZH'}}]});
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media),errors=>assert.ok(errors.some(item=>item.field==='externalId')));
  input[2].externalId='NEW-THREE';input[2].zonghengId='INFLIGHT-ZH';
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media),errors=>assert.ok(errors.some(item=>item.rowId==='r3'&&item.field==='zonghengId')));
});

test('他人或已转派媒介不能保存草稿与登记，主管无本人执行权且管理员可操作',()=>{
  const db=fixture(),input=entries(db);
  for(const session of [otherMedia,{role:'媒介主管',name:'主管'},undefined]){
    rejectedWithoutChanges(db,()=>saveOpeningBatchDraft(db,'app',input,session));
    rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,session));
  }
  assignOpening(db,'app',otherMedia.name,'媒介主管');
  rejectedWithoutChanges(db,()=>saveOpeningBatchDraft(db,'app',input,media));rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media));
  registerOpeningBatchSuccess(db,'app',input,admin);assert.equal(db.applications[0].status,'待确认完成');
});

test('已终结或显式确认的申请不能以批量覆盖；未知、待同步和成功行不进入批量',()=>{
  for(const status of ['全部完成','已取消','开户已完成，流程待复核']){
    const db=fixture();db.applications[0].status=status;const input=entries(db);
    rejectedWithoutChanges(db,()=>saveOpeningBatchDraft(db,'app',input,media));rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media));
  }
  const confirmed=fixture();confirmed.applications[0].completionConfirmedAt='2026-09-22';rejectedWithoutChanges(confirmed,()=>registerOpeningBatchSuccess(confirmed,'app',entries(confirmed),media));
  for(const status of ['未知','待同步','成功','已取消','执行中']){
    const db=fixture(),input=entries(db);db.applications[0].rows[2].status=status;
    rejectedWithoutChanges(db,()=>saveOpeningBatchDraft(db,'app',input,media),errors=>assert.ok(errors.some(item=>item.rowId==='r3'&&item.field==='general')));
    rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media));
  }
});

test('批量复核申请绑定附件及主体归属、前置流程，草稿不被材料门槛阻断',()=>{
  const db=fixture(),input=entries(db),app=db.applications[0];app.attachmentPolicySnapshot=[{id:'license',label:'营业执照',product:'本地推',required:true,requiredAt:'execution',accept:['pdf'],maxSizeMB:10}];
  saveOpeningBatchDraft(db,'app',input,media);
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media),errors=>assert.ok(errors.every(item=>item.field==='general'&&item.message.includes('营业执照'))));
  db.applications[0].attachments=[{name:'license.pdf',size:128,policyId:'license',storageKey:'license-local',storedLocally:true,subjectId:'wrong'}];
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media),errors=>assert.ok(errors.every(item=>item.message.includes('其他主体'))));
  db.applications[0].attachments[0].subjectId='s';db.applications[0].flowSnapshot.splice(2,0,{id:'pre-review',name:'前置核验',role:'财务'});
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media),errors=>assert.ok(errors.every(item=>item.message.includes('前置核验'))));
});

test('选择部分待办行不改变其他成功或未知行及其快照，失败行保留历史请求',()=>{
  const db=fixture(),app=db.applications[0];app.rows[0].supplierId='sp';finishOpening(db,'app','r1','未知',{},media);
  app.rows[1].status='失败';app.rows[1].requestId='OLD-REQUEST';app.rows[1].requestSnapshot={supplierId:'old',at:'old'};
  const locked=structuredClone(app.rows[0]),input=entries(db).slice(1),ids=app.rows.map(row=>row.id);
  saveOpeningBatchDraft(db,'app',input,media);registerOpeningBatchSuccess(db,'app',input,media);
  const saved=db.applications[0];assert.deepEqual(saved.rows[0],locked);assert.deepEqual(saved.rows.map(row=>row.id),ids);assert.equal(saved.requestedCount,3);assert.equal(saved.status,'有未知待核查');
  assert.equal(saved.rows[1].requestHistory[0].requestId,'OLD-REQUEST');assert.deepEqual(saved.rows[1].requestHistory[0].requestSnapshot,{supplierId:'old',at:'old'});
});

test('空批次、重复行及他单行在任何写入前拒绝，并返回可定位行错误',()=>{
  for(const input of [[],null,[{id:'foreign'}],[{id:'r1'},{id:'r1'}]]){
    const db=fixture();assert.ok(validateOpeningBatch(db,'app',input,media).length);
    rejectedWithoutChanges(db,()=>saveOpeningBatchDraft(db,'app',input,media));rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media));
  }
  const db=fixture(),input=entries(db);db.applications[0].requestedCount=9;
  rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media),errors=>assert.ok(errors.some(item=>item.rowId===''&&item.field==='general')));
});

test('旧未完成单批量登记转显式完成，已完成历史单仍拒绝且无副作用',()=>{
  const db=fixture(),input=entries(db);delete db.applications[0].completionMode;
  saveOpeningBatchDraft(db,'app',input,media);assert.equal(db.applications[0].completionMode,undefined);
  registerOpeningBatchSuccess(db,'app',input,media);assert.equal(db.applications[0].completionMode,'manual');assert.equal(db.applications[0].status,'待确认完成');
  completeOpeningApplication(db,'app',media);rejectedWithoutChanges(db,()=>registerOpeningBatchSuccess(db,'app',input,media));
});

test('批量草稿转单行失败后保留全部输入，刷新仍可批量续办且只建户一次',()=>{
  const db=fixture(1),input={...entries(db)[0],name:'需要保留的名称',externalId:'00000123',zonghengId:'ZH-01'};
  saveOpeningBatchDraft(db,'app',[input],media);
  recordOpeningRowResult(db,'app','r1','失败',openingRowDraft(db.applications[0].rows[0]),media);
  assert.equal(db.accounts.length,0);assert.equal(db.applications[0].rows[0].status,'失败');
  const loaded=JSON.parse(JSON.stringify(db)),row=loaded.applications[0].rows[0];
  assert.deepEqual(openingRowDraft(row),(({id,...values})=>values)(input));
  registerOpeningBatchSuccess(loaded,'app',[{id:row.id,...openingRowDraft(row)}],media);
  assert.equal(loaded.accounts.length,1);assert.equal(loaded.accounts[0].externalId,'00000123');assert.equal(loaded.applications[0].status,'待确认完成');assert.equal(loaded.applications[0].rows[0].pendingValues,undefined);
});
test('结果未知及核实未发生仍保留录入草稿，他人登记失败不写入',()=>{
  const db=fixture(1),input={...entries(db)[0],name:'核实中的名称',externalId:'00000125',zonghengId:'ZH-02'};
  saveOpeningBatchDraft(db,'app',[input],media);const before=structuredClone(db);
  assert.throws(()=>recordOpeningRowResult(db,'app','r1','失败',input,otherMedia));assert.deepEqual(db,before);
  recordOpeningRowResult(db,'app','r1','未知',input,media);
  const expected=(({id,...values})=>values)(input);assert.deepEqual(openingRowDraft(db.applications[0].rows[0]),expected);
  recordOpeningRowResult(db,'app','r1','核实未发生',{...openingRowDraft(db.applications[0].rows[0]),verificationReason:'平台已核实未创建'},media);
  assert.equal(db.applications[0].rows[0].status,'失败');assert.deepEqual(openingRowDraft(db.applications[0].rows[0]),expected);assert.equal(db.accounts.length,0);
});
