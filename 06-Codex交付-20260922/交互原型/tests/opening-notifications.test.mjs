import test from 'node:test';
import assert from 'node:assert/strict';
import {getVisibleNotifications,markNotificationsRead,notificationIdentityKey} from '../src/opening-notifications.js';

const salesA={role:'商务',businessId:'sales-a',name:'商务 A'},salesB={role:'商务',businessId:'sales-b',name:'商务 B'};
const mediaA={role:'开户媒介',businessId:'sales-a',name:'媒介 A'},mediaB={role:'开户媒介',businessId:'sales-a',name:'媒介 B'};
const supervisor={role:'媒介主管',name:'主管'},admin={role:'系统管理员',name:'管理员'};
const summaryId='opening-summary:app';
function fixture(){
  return {customers:[{id:'c',name:'客户 A'}],subjects:[{id:'s',name:'主体 A'}],shops:[{id:'shop',name:'门店 A'}],accounts:[],operations:{},notifications:[],applications:[{id:'app',customerId:'c',subjectId:'s',shopId:'shop',product:'本地推',businessOwnerId:'sales-a',submittedBy:'商务 A',status:'待派单',requestedCount:10,completionMode:'manual',createdAt:'2026-09-22T08:00:00Z',flowSnapshot:[],events:[],rows:Array.from({length:10},(_,i)=>({id:'r'+i,status:'待办理'}))}]};
}
function completeRows(db,count=10){
  const app=db.applications[0];app.assignee='媒介 A';app.status=count===10?'待确认完成':'部分完成';
  for(let i=0;i<count;i++){app.rows[i]={...app.rows[i],status:'成功',accountId:'a'+i};db.accounts.push({id:'a'+i,applicationId:'app',businessOwnerId:'sales-a',externalId:'000'+i});}
}
const visible=(db,session=salesA)=>getVisibleNotifications(db,session);

test('每申请投影一条实时摘要，隐藏同单旧派单、完成和逐账户纵横通知，渲染零写入',()=>{
  const db=fixture();completeRows(db,8);
  db.notifications=[{id:'assign-old',moduleId:'M06',title:'旧待派单',params:{applicationId:'app'}},{id:'completion-old',kind:'opening-completion',moduleId:'M06',params:{appId:'app'}},...db.accounts.map(a=>({id:'zh-'+a.id,moduleId:'M05',kind:'zongheng-pending',params:{accountId:a.id}}))];
  const before=structuredClone(db),messages=visible(db);
  assert.equal(messages.length,1);assert.deepEqual(db,before);
  assert.deepEqual(visible(db),messages);assert.deepEqual(db,before);
  const message=messages[0];assert.equal(message.id,summaryId);assert.equal(message.customer,'客户 A');assert.equal(message.shop,'门店 A');
  assert.deepEqual([message.total,message.success,message.remaining,message.supplement],[10,8,2,8]);
  assert.equal(message.status,'部分完成');assert.deepEqual(message.params,{applicationId:'app'});
});

test('商务只看本人归属或本人提交，不从同客户主体、空ID或他人归属名称推断权限',()=>{
  const db=fixture();assert.equal(visible(db,salesA).length,1);assert.equal(visible(db,salesB).length,0);
  db.applications[0].submittedBy=salesB.name;assert.equal(visible(db,salesB).length,1);
  delete db.applications[0].businessOwnerId;delete db.applications[0].submittedBy;db.applications[0].businessOwnerName=salesB.name;
  assert.equal(visible(db,salesB).length,0);assert.equal(visible(db,{role:'商务'}).length,0);
});

test('媒介只见当前指派任务，派单后主管摘要即时变更，转派后旧媒介失去消息',()=>{
  const db=fixture();assert.equal(visible(db,mediaA).length,0);assert.equal(visible(db,supervisor)[0].status,'待派单');
  markNotificationsRead(db,supervisor,summaryId);
  db.applications[0].assignee=mediaA.name;db.applications[0].status='待媒介办理';
  assert.equal(visible(db,supervisor)[0].status,'待媒介办理');assert.equal(visible(db,supervisor)[0].read,false);
  assert.equal(visible(db,mediaA).length,1);assert.equal(visible(db,mediaB).length,0);
  markNotificationsRead(db,mediaA,summaryId);db.applications[0].assignee=mediaB.name;
  assert.equal(visible(db,mediaA).length,0);assert.equal(visible(db,mediaB)[0].read,false);
  const before=structuredClone(db);assert.equal(markNotificationsRead(db,mediaA,summaryId),0);assert.deepEqual(db,before);
});

test('有稳定媒介ID时按ID匹配，商务ID残留不能充当媒介身份或定向收件人',()=>{
  const db=fixture();Object.assign(db.applications[0],{assignee:'同名媒介',assigneeId:'employee-a'});
  assert.equal(visible(db,{...mediaA,name:'同名媒介',employeeId:'employee-b'}).length,0);
  assert.equal(visible(db,{...mediaA,name:'改名媒介',employeeId:'employee-a'}).length,1);
  db.notifications.push({id:'private',moduleId:'M01',title:'仅商务A',recipientId:'sales-a'});
  assert.equal(visible(db,mediaA).length,0);assert.ok(visible(db,salesA).some(message=>message.id==='private'));
  assert.notEqual(notificationIdentityKey(mediaA),notificationIdentityKey(mediaB));
  assert.notEqual(notificationIdentityKey(mediaA),notificationIdentityKey(salesA));
  assert.equal(notificationIdentityKey({...salesA,employeeId:'employee-a'}),notificationIdentityKey({...mediaA,employeeId:'employee-a'}));
});

test('个人已读互不影响，JSON刷新后保留，不改raw通知的全局read字段',()=>{
  const db=fixture();db.applications[0].assignee=mediaA.name;db.notifications=[{id:'ordinary',moduleId:'M01',title:'系统消息',read:false}];
  const before=structuredClone(db.notifications);markNotificationsRead(db,salesA);
  assert.ok(visible(db,salesA).every(message=>message.read));assert.ok(visible(db,mediaA).every(message=>!message.read));assert.deepEqual(db.notifications,before);
  const restored=JSON.parse(JSON.stringify(db));assert.ok(visible(restored,salesA).every(message=>message.read));
  assert.equal(restored.notificationReads[notificationIdentityKey(salesA)][summaryId],visible(restored,salesA)[0].revision);
});

test('保存草稿和普通备注不再提醒，状态或各类数量变化会再次未读',()=>{
  const db=fixture();markNotificationsRead(db,salesA,summaryId);const revision=visible(db)[0].revision;
  db.applications[0].events.push({at:'2026-09-22T09:00:00Z',text:'普通备注'});db.applications[0].rows[0].pendingValues={externalId:'draft'};db.applications[0].updatedAt='2026-09-22T09:00:00Z';
  assert.equal(visible(db)[0].read,true);assert.equal(visible(db)[0].revision,revision);
  for(const status of ['失败','未知','待同步']){db.applications[0].rows[0].status=status;assert.equal(visible(db)[0].read,false);markNotificationsRead(db,salesA,summaryId);}
  completeRows(db,8);assert.equal(visible(db)[0].read,false);markNotificationsRead(db,salesA,summaryId);
  db.applications[0].rows[8].status='已取消';assert.equal(visible(db)[0].read,false);
});

test('完成后保留原申请摘要，逐户补纵横更新待补数，清零后无旧待补通知残留',()=>{
  const db=fixture();completeRows(db);Object.assign(db.applications[0],{status:'全部完成',completionConfirmedAt:'2026-09-22T09:00:00Z'});
  db.notifications=db.accounts.map(a=>({id:'z-'+a.id,moduleId:'M05',kind:'zongheng-pending',accountId:a.id,read:false}));
  assert.equal(visible(db)[0].status,'开户已完成');assert.equal(visible(db)[0].supplement,10);markNotificationsRead(db,salesA);
  db.accounts[0].zonghengId='ZH-000';assert.equal(visible(db)[0].supplement,9);assert.equal(visible(db)[0].read,false);markNotificationsRead(db,salesA);
  for(const [i,account] of db.accounts.entries())account.zonghengId='ZH-'+i;
  const messages=visible(db);assert.equal(messages.length,1);assert.equal(messages[0].supplement,0);assert.equal(messages[0].read,false);assert.equal(messages[0].success,10);assert.deepEqual(messages[0].params,{applicationId:'app'});
});

test('旧账户缺applicationId时以唯一原行关联聚合，禁止无归属开户通知广播',()=>{
  const db=fixture();completeRows(db,1);delete db.accounts[0].applicationId;
  db.notifications=[{id:'z',kind:'zongheng-pending',moduleId:'M05',accountId:'a0'},{id:'orphan',moduleId:'M06',title:'旧开户派单'},{id:'missing',moduleId:'M06',params:{applicationId:'missing-app'}}];
  assert.deepEqual(visible(db).map(message=>message.id),[summaryId]);assert.equal(visible(db,salesB).length,0);
  assert.equal(visible(db,mediaA).length,1);assert.equal(visible(db,mediaB).length,0);
  assert.equal(visible(db,admin).length,3);
});

test('明确历史账户归属及明确收件人可见，不凭旧read值授予权限',()=>{
  const db=fixture();db.applications=[];db.accounts=[{id:'historic',businessOwnerId:'sales-a'}];
  db.notifications=[{id:'z',kind:'zongheng-pending',moduleId:'M05',accountId:'historic',read:true},{id:'private-opening',moduleId:'M06',recipientId:'media-a'}];
  assert.deepEqual(visible(db,salesA).map(message=>message.id),['z']);assert.equal(visible(db,salesB).length,0);
  assert.deepEqual(visible(db,salesA)[0].params,{accountId:'historic'});
  assert.deepEqual(visible(db,{...mediaA,employeeId:'media-a'}).map(message=>message.id),['private-opening']);
});

test('审批角色仅在当前额外步骤需要该角色时看到开户，不放宽敏感模块权限',()=>{
  const db=fixture();db.applications[0].flowSnapshot=[{id:'financial-review',name:'财务复核',role:'财务'},{id:'s2',name:'派单',role:'媒介主管'}];
  assert.equal(visible(db,{role:'财务',name:'财务'}).length,1);assert.equal(visible(db,{role:'人事',name:'人事'}).length,0);
  db.applications[0].configApprovals={'financial-review':true};assert.equal(visible(db,{role:'财务',name:'财务'}).length,0);
  db.operations={M31:[{id:'payroll',employeeId:'sales-b',status:'已发布'}],M26:[{id:'commission',employeeId:'sales-b',status:'发布'}]};
  db.notifications=[{id:'salary',moduleId:'M31',params:{recordId:'payroll'},title:'工资金额'},{id:'commission',moduleId:'M26',params:{recordId:'commission'},title:'提成金额'}];
  for(const session of [salesA,supervisor,admin])assert.ok(!visible(db,session).some(message=>['salary','commission'].includes(message.id)));
  assert.equal(visible(db,salesB).length,2);assert.equal(visible(db,{role:'财务',name:'财务'}).length,2);
});

test('普通通知兼容旧read，后续本人阅读和内容版本变化仍独立',()=>{
  const db=fixture();db.applications=[];db.notifications=[{id:'old-read',moduleId:'M01',read:true,title:'旧已读'},{id:'new',moduleId:'M01',read:false,title:'新消息',businessVersion:1}];
  assert.equal(visible(db,salesA).find(message=>message.id==='old-read').read,true);
  markNotificationsRead(db,salesA,'new');assert.equal(visible(db,salesA).find(message=>message.id==='new').read,true);assert.equal(visible(db,salesB).find(message=>message.id==='new').read,false);
  db.notifications[1].businessVersion=2;assert.equal(visible(db,salesA).find(message=>message.id==='new').read,false);
});

test('无效身份及不可见ID标记零写入，全部已读仅写本人当前范围',()=>{
  const db=fixture();db.notifications=[{id:'hidden',moduleId:'M31',title:'工资'}];
  for(const session of [{},{...salesA,disabled:true},{...salesA,status:'离职'},{...salesA,expiresAt:'2000-01-01'}]){
    const before=structuredClone(db);assert.deepEqual(visible(db,session),[]);assert.equal(markNotificationsRead(db,session),0);assert.deepEqual(db,before);
  }
  const before=structuredClone(db);assert.equal(markNotificationsRead(db,salesA,'hidden'),0);assert.deepEqual(db,before);
  assert.equal(markNotificationsRead(db,salesA),1);assert.deepEqual(Object.keys(db.notificationReads[notificationIdentityKey(salesA)]),[summaryId]);
});
