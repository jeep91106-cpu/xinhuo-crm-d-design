import test from 'node:test';
import assert from 'node:assert/strict';
import {openingDraftActorKey,listOpeningDrafts,getOpeningDraft,hasUnassignedOpeningDraft,saveOpeningDraft,deleteOpeningDraft,restoreOpeningDraft,consumeOpeningDraft,assertOpeningDraftSubmission} from '../src/opening-drafts.js';
import {freshState} from '../src/model.js';

const a={role:'商务',businessId:'demo-sales-a',name:'演示商务 A'},b={role:'商务',businessId:'demo-sales-b',name:'演示商务 B'};
const manager={role:'商务主管',businessId:a.businessId,name:'演示商务主管'},admin={role:'系统管理员',businessId:a.businessId,name:'演示系统管理员'};
const fixture=()=>freshState({customers:[{id:'ca',name:'A客户'},{id:'cb',name:'B客户'}],subjects:[{id:'sa',name:'A主体',customerIds:['ca']},{id:'sb',name:'B主体',customerIds:['cb']}],shops:[],suppliers:[],accounts:[]});
const form=(id,owner=a.businessId)=>({draftId:id,customerId:'ca',subjectId:'sa',businessOwnerId:owner,product:'本地推',rows:[{id:'row',status:'待办理'}],attachments:[],note:''});
function unchanged(db,fn){const before=structuredClone(db);assert.throws(fn);assert.deepEqual(db,before);}

test('人员稳定身份不随名称或负责商务改变，主管管理员不继承所选商务身份',()=>{
  assert.equal(openingDraftActorKey(a),openingDraftActorKey({...a,role:'渠道商务',name:'已改名'}));
  assert.notEqual(openingDraftActorKey(a),openingDraftActorKey(b));
  assert.notEqual(openingDraftActorKey(a),openingDraftActorKey(manager));
  assert.notEqual(openingDraftActorKey(manager),openingDraftActorKey(admin));
  assert.equal(openingDraftActorKey(manager),openingDraftActorKey({...manager,businessId:b.businessId}));
  assert.equal(openingDraftActorKey({...manager,employeeId:'001'}),'employee:001');
  assert.equal(openingDraftActorKey({...manager,userId:'user-1'}),'user:user-1');
  assert.equal(openingDraftActorKey({...manager,id:'person-1'}),'person:person-1');
});

test('未知人员或无创建权限身份不能保存，不按同名或当前商务猜测归属',()=>{
  for(const session of [{role:'商务',name:a.name},{role:'商务主管',name:'某主管',businessId:a.businessId},{role:'开户媒介',employeeId:'1'},null]){
    const db=fixture();assert.equal(openingDraftActorKey(session),'');assert.deepEqual(listOpeningDrafts(db,session),[]);
    unchanged(db,()=>saveOpeningDraft(db,{},session));
  }
});

test('允许空白草稿并懒初始化，多份保存并存，不产生申请或通知',()=>{
  const db=fixture(),before=structuredClone(db),first=saveOpeningDraft(db,{},a),second=saveOpeningDraft(db,{},a);
  assert.notEqual(first.id,second.id);assert.equal(listOpeningDrafts(db,a).length,2);assert.deepEqual(listOpeningDrafts(db,b),[]);
  const {openingDrafts,...other}=db;assert.deepEqual(other,before);assert.equal(openingDrafts.length,2);
  assert.equal(first.form.draftId,first.id);assert.ok(first.createdAt&&first.updatedAt);
});

test('同ID只更新本人草稿，输入与返回对象均不会绕过存储修改草稿',()=>{
  const db=fixture(),input=form('a1');saveOpeningDraft(db,input,a);saveOpeningDraft(db,form('a2'),a);saveOpeningDraft(db,form('b1',b.businessId),b);
  const untouched=structuredClone(db.openingDrafts.filter(row=>row.id!=='a1')),created=getOpeningDraft(db,'a1',a).createdAt;
  input.note='新输入';const saved=saveOpeningDraft(db,input,{...a,name:'改名商务'});input.note='外部篡改';saved.form.note='返回对象篡改';
  assert.equal(getOpeningDraft(db,'a1',a).form.note,'新输入');assert.equal(getOpeningDraft(db,'a1',a).createdAt,created);
  assert.deepEqual(db.openingDrafts.filter(row=>row.id!=='a1'),untouched);
});

test('另存新草稿生成独立ID，保留原草稿和附件引用，不能借另存读他人草稿',()=>{
  const db=fixture(),input=form('a1');input.attachments=[{storageKey:'file-1',subjectId:'sa'}];saveOpeningDraft(db,input,a);
  const original=getOpeningDraft(db,'a1',a),copy=saveOpeningDraft(db,{...input,note:'副本'},a,{asNew:true});
  assert.notEqual(copy.id,'a1');assert.deepEqual(getOpeningDraft(db,'a1',a),original);assert.deepEqual(copy.form.attachments,input.attachments);
  unchanged(db,()=>saveOpeningDraft(db,input,b,{asNew:true}));
});

test('主管替B负责商务准备的草稿仍归主管创建人，B和管理员不能读取或提交',()=>{
  const db=fixture();saveOpeningDraft(db,form('manager-draft',b.businessId),manager);
  assert.equal(listOpeningDrafts(db,manager).length,1);assert.deepEqual(listOpeningDrafts(db,b),[]);
  for(const session of [a,b,admin]){unchanged(db,()=>getOpeningDraft(db,'manager-draft',session));unchanged(db,()=>consumeOpeningDraft(db,'manager-draft',session,'app'));}
});

test('A不能通过已知ID读改删恢复提交B草稿，失败均无副作用',()=>{
  const db=fixture();saveOpeningDraft(db,form('b1',b.businessId),b);
  for(const operation of [()=>getOpeningDraft(db,'b1',a),()=>saveOpeningDraft(db,form('b1'),a),()=>deleteOpeningDraft(db,'b1',a),()=>restoreOpeningDraft(db,'b1',a),()=>consumeOpeningDraft(db,'b1',a,'app'),()=>assertOpeningDraftSubmission(db,'b1',a)])unchanged(db,operation);
});

test('本人删除可恢复，删除后不能继续修改或提交，其他草稿保持原样',()=>{
  const db=fixture();saveOpeningDraft(db,form('a1'),a);saveOpeningDraft(db,form('a2'),a);const other=getOpeningDraft(db,'a2',a);
  deleteOpeningDraft(db,'a1',a);assert.equal(listOpeningDrafts(db,a).length,1);assert.equal(listOpeningDrafts(db,a,{includeDeleted:true}).length,2);
  unchanged(db,()=>saveOpeningDraft(db,form('a1'),a));unchanged(db,()=>consumeOpeningDraft(db,'a1',a,'app'));
  restoreOpeningDraft(db,'a1',a);assert.equal(listOpeningDrafts(db,a).length,2);assert.deepEqual(getOpeningDraft(db,'a2',a),other);
});

test('提交仅移除对应本人草稿，其余保留且已提交草稿不可恢复或再次提交',()=>{
  const db=fixture();saveOpeningDraft(db,form('a1'),a);saveOpeningDraft(db,form('a2'),a);saveOpeningDraft(db,form('b1',b.businessId),b);
  const others=structuredClone(db.openingDrafts.filter(row=>row.id!=='a1'));
  consumeOpeningDraft(db,'a1',a,'app1');assert.deepEqual(listOpeningDrafts(db,a).map(row=>row.id),['a2']);assert.equal(listOpeningDrafts(db,b).length,1);
  assert.deepEqual(db.openingDrafts.filter(row=>row.id!=='a1'),others);assert.equal(db.openingDrafts.find(row=>row.id==='a1').applicationId,'app1');
  unchanged(db,()=>restoreOpeningDraft(db,'a1',a));unchanged(db,()=>consumeOpeningDraft(db,'a1',a,'app2'));
});

test('尚未保存的新表单可提交；指定已存草稿但找不到时必须阻止续存和提交',()=>{
  const db=fixture(),before=structuredClone(db);assert.equal(assertOpeningDraftSubmission(db,'new-form',a),null);assert.equal(consumeOpeningDraft(db,'new-form',a,'app'),null);assert.deepEqual(db,before);
  unchanged(db,()=>assertOpeningDraftSubmission(db,'missing',a,{mustExist:true}));
});

test('可靠旧草稿仅归对应商务，读取不迁移或清空，不能把负责商务当主管身份',()=>{
  const db=fixture();db.openingDraft=form('legacy',b.businessId);const before=structuredClone(db);
  for(const session of [a,manager,admin]){assert.deepEqual(listOpeningDrafts(db,session),[]);unchanged(db,()=>getOpeningDraft(db,'legacy',session));}
  assert.equal(listOpeningDrafts(db,b)[0].id,'legacy');assert.equal(getOpeningDraft(db,'legacy',{...b,role:'渠道商务'}).form.businessOwnerId,b.businessId);assert.deepEqual(db,before);
});

test('未知归属旧草稿原样保留，保存当前人新草稿不会认领或覆盖旧内容',()=>{
  const db=fixture();db.openingDraft={...form('unknown'),businessOwnerId:'',note:'历史未确认内容'};const original=structuredClone(db.openingDraft);
  assert.equal(hasUnassignedOpeningDraft(db),true);
  for(const session of [a,b,manager,admin]){assert.deepEqual(listOpeningDrafts(db,session),[]);unchanged(db,()=>getOpeningDraft(db,'unknown',session));}
  saveOpeningDraft(db,{},a);saveOpeningDraft(db,{},b);assert.deepEqual(db.openingDraft,original);assert.equal(hasUnassignedOpeningDraft(db),true);
});

test('本人旧草稿首次保存转换为记录，旧值保留；提交后不会重新出现旧全局草稿',()=>{
  const db=fixture();db.openingDraft=form('legacy',b.businessId);const original=structuredClone(db.openingDraft);
  saveOpeningDraft(db,{...getOpeningDraft(db,'legacy',b).form,note:'新版'},b);assert.equal(listOpeningDrafts(db,b).length,1);assert.equal(getOpeningDraft(db,'legacy',b).form.note,'新版');assert.deepEqual(db.openingDraft,original);
  consumeOpeningDraft(db,'legacy',b,'app');assert.deepEqual(listOpeningDrafts(db,b),[]);assert.deepEqual(db.openingDraft,original);
  unchanged(db,()=>getOpeningDraft(db,'legacy',b));
});

test('未带ID的可靠旧草稿可迁移，删除或直接提交均不会被旧数据复活',()=>{
  for(const action of ['delete','submit']){const db=fixture();db.openingDraft={businessOwnerId:a.businessId,note:'旧草稿'};const record=listOpeningDrafts(db,a)[0];
    if(action==='delete')deleteOpeningDraft(db,record.id,a);else consumeOpeningDraft(db,record.id,a,'app');
    assert.deepEqual(listOpeningDrafts(db,a),[]);assert.equal(db.openingDraft.note,'旧草稿');
    if(action==='delete'){restoreOpeningDraft(db,record.id,a);assert.equal(listOpeningDrafts(db,a).length,1);}
  }
});

test('草稿创建人不可由输入伪造，刷新序列化后多人草稿与前导零仍隔离',()=>{
  const db=fixture();const saved=saveOpeningDraft(db,{...form('a1'),creatorKey:'business:demo-sales-b',note:'00123'},a);saveOpeningDraft(db,form('b1',b.businessId),b);
  assert.equal(saved.creatorKey,openingDraftActorKey(a));const restored=JSON.parse(JSON.stringify(db));
  assert.deepEqual(listOpeningDrafts(restored,a).map(row=>row.id),['a1']);assert.equal(getOpeningDraft(restored,'a1',a).form.note,'00123');
  const list=listOpeningDrafts(restored,a);list[0].form.note='外部修改';assert.equal(getOpeningDraft(restored,'a1',a).form.note,'00123');
});

test('草稿箱及URL定向续填只渲染本人资料，管理员也不能从URL打开他人草稿',async()=>{
  const {build}=await import('esbuild'),{fileURLToPath}=await import('node:url'),{createRequire}=await import('node:module');
  const React=(await import('react')).default,{renderToStaticMarkup}=await import('react-dom/server');
  const result=await build({entryPoints:[fileURLToPath(new URL('../src/CoreModule.jsx',import.meta.url))],bundle:true,write:false,format:'cjs',platform:'node',loader:{'.css':'empty'},external:['react','react-dom','react-dom/server']});
  const loaded={exports:{}};new Function('require','module','exports',result.outputFiles[0].text)(createRequire(import.meta.url),loaded,loaded.exports);
  const db=fixture();saveOpeningDraft(db,{...form('b-secret',b.businessId),customerId:'cb',subjectId:'sb',note:'只有B可见的备注'},b);saveOpeningDraft(db,form('a-own'),a);
  const render=(session,params)=>renderToStaticMarkup(React.createElement(loaded.exports.default,{db,session,params,moduleId:'M06',update:()=>{},toast:()=>{},go:()=>{}}));
  const list=render(a,{mode:'drafts'});assert.match(list,/A客户/);assert.doesNotMatch(list,/B客户|B主体|只有B可见/);for(const label of ['继续填写','另存为新草稿','删除草稿','已删除'])assert.ok(list.includes(label));
  for(const session of [a,admin])for(const mode of ['resumeDraft','new']){const denied=render(session,{mode,draftId:'b-secret'});assert.match(denied,/无法继续此草稿/);assert.doesNotMatch(denied,/B客户|B主体|只有B可见|提交开户申请/);}
  const own=render(b,{mode:'resumeDraft',draftId:'b-secret'});assert.match(own,/只有B可见的备注/);assert.match(own,/提交开户申请/);
  saveOpeningDraft(db,{draftId:'unfinished-search',draftSearch:{customer:'尚未选中的客户搜索词',subject:'未选中的主体搜索词'}},a);
  const unfinished=render(a,{mode:'resumeDraft',draftId:'unfinished-search'});assert.match(unfinished,/value="尚未选中的客户搜索词"/);assert.match(unfinished,/value="未选中的主体搜索词"/);
});
