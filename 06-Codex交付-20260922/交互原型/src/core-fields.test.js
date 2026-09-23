import {industryOptions,industryStatus,saveIndustryDictionary} from './industry-dictionary.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {saveSubject,subjectSnapshot,saveShop,saveSupplier,linkSubject,bindDirect,editApplicationDirect,editAccountDirect,getSubjectDirect,saveSubjectDirect,directConflict,SUBJECT_FIELDS} from './core-fields.js';
import {freshState,finishOpening,validateOpening,openingFieldErrors,cancelOpeningRow} from './model.js';
const sales={role:'商务',name:'演示商务 A'},media={role:'开户媒介',name:'演示开户媒介'};
const savedAttachment={name:'license.pdf',size:128,policyId:'license',storageKey:'local-test-license',storedLocally:true};
function fixture(){const d=freshState({customers:[{id:'c',name:'客户'},{id:'c2',name:'客户二'}],subjects:[{id:'s',name:'主体',customerIds:['c']}],shops:[{id:'t',subjectId:'s',name:'店铺',laikeId:null}],suppliers:[{id:'sp',name:'供应商',products:['本地推']}],accounts:[]});d.applications=[{id:'app',customerId:'c',subjectId:'s',shopId:'t',product:'本地推',businessOwnerId:'sales-a',businessOwnerName:'商务 A',assignee:media.name,events:[],rows:[{id:'row',name:'新户',supplierId:'sp',status:'待办理',submittedDirectSnapshot:{directId:null,directName:null}}]}];return d;}
test('主体完整字段保留字符串和独立银行资料，未知种子不补造',()=>{const d=fixture();const s=saveSubject(d,{name:'新增主体',creditCode:' demo-code ',industry:'美容美发',bankAccount:'0000012345678901234567890',bankName:'演示银行',registeredAddress:'主体住所',contactName:'联系人',contactPhone:'+86 020-1234567',licenseName:'演示营业执照',licenseEvidence:'演示证照材料'},{customerId:'c',session:sales});assert.equal(s.creditCode,'DEMO-CODE');assert.equal(s.bankAccount,'0000012345678901234567890');assert.equal(s.recordVersion,1);assert.equal(d.subjects[0].creditCode,undefined)});
test('信用代码查重独立于主体名称，提示已有对象',()=>{const d=fixture();saveSubject(d,{name:'甲',creditCode:'CODE001',licenseEvidence:'证照'},{session:sales});assert.throws(()=>saveSubject(d,{name:'乙',creditCode:'code001',licenseEvidence:'证照'},{session:sales}),/信用代码已登记/);assert.equal(d.subjects.length,2)});
test('主体更正备注可空，不覆盖申请快照，关联只增加引用',()=>{const d=fixture(),before=subjectSnapshot(d,'s');d.applications[0].subjectSnapshot=before;saveSubject(d,{name:'主体',creditCode:'NEW',licenseEvidence:'证照'},{id:'s',reason:'补全',session:sales});linkSubject(d,'s','c2',sales);assert.equal(d.subjects.length,1);assert.deepEqual(d.subjects[0].customerIds,['c','c2']);assert.equal(before.creditCode,'');assert.equal(d.subjects[0].versions.length,2);assert.doesNotThrow(()=>saveSubject(d,{name:'主体'},{id:'s',session:sales}))});
test('来客名称始终取店铺名称，商务媒介可补可空的ID',()=>{const d=fixture();saveShop(d,{name:'店铺',laikeName:'旧独立名称',laikeId:''},{id:'t',subjectId:'s',reason:'核对店名',session:sales});assert.equal(d.shops[0].laikeName,'店铺');saveShop(d,{name:'更正店铺名',laikeId:'LK-1'},{id:'t',subjectId:'s',reason:'媒介取得ID',session:media});assert.equal(d.shops[0].laikeId,'LK-1');assert.equal(d.shops[0].laikeName,'更正店铺名');assert.equal(d.shops[0].versions.length,2);assert.equal(d.shops[0].versions[1].actor,media.name)});
test('同店来客更正留前后值，既有申请和外部请求快照不改',()=>{const d=fixture();d.shops[0].laikeId='LK-old';d.applications[0].shopSnapshot=structuredClone(d.shops[0]);d.applications[0].rows[0].requestSnapshot={laikeId:'LK-old'};saveShop(d,{name:'店铺',laikeId:'LK-new'},{id:'t',subjectId:'s',reason:'有据更正',session:media});assert.equal(d.applications[0].shopSnapshot.laikeId,'LK-old');assert.equal(d.applications[0].rows[0].requestSnapshot.laikeId,'LK-old');assert.equal(d.shops[0].versions[0].before.laikeId,'LK-old');assert.match(d.notifications[0].title,/店铺资料更正/)});
test('同一来客跨店先提示核对，不擅自添加全局唯一约束',()=>{const d=fixture();d.shops.push({id:'t2',subjectId:'s',name:'另一店',laikeId:'LK'});assert.throws(()=>saveShop(d,{name:'店铺',laikeId:'LK'},{id:'t',subjectId:'s',reason:'核对',session:sales}),/跨店/);saveShop(d,{name:'店铺',laikeId:'LK',crossShopAcknowledged:true},{id:'t',subjectId:'s',reason:'经核对保留独立记录',session:sales});assert.equal(d.shops.length,2)});
test('供应商银行和代理资料授权维护、保存版本，与主体银行不混用',()=>{const d=fixture();assert.throws(()=>saveSupplier(d,'sp',{bankAccount:'001'},{reason:'演示',session:sales}),/授权媒介/);saveSupplier(d,'sp',{agentName:'代理商',agentId:'AG001',platformScope:'巨量',bankAccount:'00001',bankName:'支行',bankAddress:'地址'},{reason:'代理商提供资料',session:media});assert.equal(d.suppliers[0].bankAccount,'00001');assert.equal(d.subjects[0].bankAccount,undefined);assert.equal(d.suppliers[0].recordVersion,1)});
test('兼容行入口只更正主体直客，名称固定取主体而非行输入',()=>{const d=fixture(),form={subjectId:'s',product:'本地推',rows:[{id:'r1'},{id:'r2'}]};const row=bindDirect(d,form,'r2',{id:'D2',name:'不能独立设置的名称',evidence:'演示'},sales);assert.equal(row.directId,'D2');assert.equal(row.directName,'主体');assert.equal(getSubjectDirect(d,'s').directId,'D2');assert.equal(d.applications[0].rows[0].directId,'D2');assert.equal(form.rows[0].directId,undefined);assert.ok(SUBJECT_FIELDS.some(([key])=>key==='directId'));assert.equal(SUBJECT_FIELDS.some(([key])=>key==='directName'),false)});
test('商务媒介更正统一主体直客，原提交快照不变且可清空编号',()=>{const d=fixture();editApplicationDirect(d,'app','row',{id:'D2',name:'直客二',evidence:'媒介回查'},media);assert.equal(d.applications[0].rows[0].directName,'主体');assert.equal(d.applications[0].rows[0].submittedDirectSnapshot.directId,null);editApplicationDirect(d,'app','row',{id:'',name:'',evidence:'撤回误填'},media);assert.equal(d.applications[0].rows[0].directId,'');assert.equal(d.applications[0].rows[0].directChanges.length,2);assert.equal(getSubjectDirect(d,'s').directName,'主体')});
test('来客ID直客ID与账户名称均可空，成功仍要求唯一账户ID',()=>{const d=fixture();assert.throws(()=>finishOpening(d,'app','row','成功',{}),/完整广告账户 ID/);assert.equal(d.applications[0].rows[0].requestId,undefined);finishOpening(d,'app','row','成功',{name:'',externalId:'NEW'});assert.equal(d.accounts[0].name,'');assert.equal(d.accounts[0].directId,null);assert.equal(d.accounts[0].openingIdentitySnapshot.laikeId,null);assert.equal(d.accounts[0].openingIdentitySnapshot.laikeName,'店铺');assert.equal(d.accounts[0].businessOwnerId,'sales-a')});
test('跨主体直客重复拦截，同主体在途和已开户可复用',()=>{const d=fixture();saveSubjectDirect(d,'s',{id:'D'},{reason:'主体资料',session:media});d.applications.push({...structuredClone(d.applications[0]),id:'same-subject'});assert.equal(directConflict(d,'D',{subjectId:'s'}),'');d.subjects.push({id:'s2',name:'其他主体',customerIds:['c2']});d.applications.push({...structuredClone(d.applications[0]),id:'other-subject',subjectId:'s2'});assert.throws(()=>finishOpening(d,'app','row','成功',{externalId:'NEW'}),/执行前直客复核/);d.applications.pop();finishOpening(d,'app','row','成功',{externalId:'NEW'});assert.equal(directConflict(d,'D',{subjectId:'s'}),'');assert.throws(()=>saveSubjectDirect(d,'s2',{id:'D'},{reason:'重复核对',session:media}),/其他主体/);assert.equal(getSubjectDirect(d,'s2').directId,'')});
test('已外部成功身份锁定，补资料不得重写当前请求',()=>{const d=fixture();finishOpening(d,'app','row','待同步',{externalId:'NEW'});assert.throws(()=>editApplicationDirect(d,'app','row',{id:'D',evidence:'修改'},media),/锁定/);saveShop(d,{name:'店铺',laikeId:'LK-new'},{id:'t',subjectId:'s',reason:'补资料',session:media});finishOpening(d,'app','row','成功');assert.equal(d.accounts[0].openingIdentitySnapshot.laikeId,null)});
test('成功账户兼容更正更新主体当前直客，不改变商务、申请和执行快照',()=>{const d=fixture();finishOpening(d,'app','row','成功',{externalId:'NEW'});const a=d.accounts[0];editAccountDirect(d,a.id,{id:'D-new',name:'直客',evidence:'补录资料'},media);assert.equal(a.directId,'D-new');assert.equal(a.directName,'主体');assert.equal(getSubjectDirect(d,'s').directId,'D-new');assert.equal(a.businessOwnerId,'sales-a');assert.equal(a.openingIdentitySnapshot.directId,null);assert.equal(d.applications[0].rows[0].directId,undefined);assert.equal(a.changes[0].before.directId,'')});
test('执行快照保存主体与供应商版本，后续主档变更不追改',()=>{const d=fixture();saveSupplier(d,'sp',{bankAccount:'001'},{reason:'原始资料',session:media});finishOpening(d,'app','row','成功',{externalId:'NEW'});saveSupplier(d,'sp',{bankAccount:'002'},{reason:'更正',session:media});assert.equal(d.accounts[0].openingIdentitySnapshot.supplierSnapshot.bankAccount,'001')});
test('非本地推残留直客拦截，切换表单必须清理唯一身份',()=>{const d=fixture();const errors=validateOpening(d,{customerId:'c',subjectId:'s',shopId:'t',product:'快手',region:'华南',rows:[{directId:'D'}]});assert.match(errors.join(),/不适用直客/)});
test('动态字段校验数字日期选项，隐藏字段不强制，数字0有效',()=>{const flow={fields:[{id:'hidden',visible:false,required:true,label:'隐藏'},{id:'n',type:'number',required:true,label:'数字'},{id:'date',type:'date',label:'日期'},{id:'choice',type:'select',options:['甲','乙'],label:'选择'}]};assert.equal(openingFieldErrors(flow,{region:'华南',customValues:{n:0,date:'2026-09-22',choice:'甲'}}).length,0);assert.equal(openingFieldErrors(flow,{region:'华南',customValues:{n:'bad',date:'2026-02-30',choice:'丙'}}).length,3)});
test('旧内置字段错误类型不阻断有效区域和已保存附件，也不覆写配置',()=>{const flow={fields:[{id:'region',label:'区域',type:'number',visible:false,required:false},{id:'attachments',label:'资料',type:'date',required:true,visible:false}]},before=structuredClone(flow);assert.deepEqual(openingFieldErrors(flow,{region:'华南',attachments:[savedAttachment]}),[]);assert.deepEqual(flow,before);assert.match(openingFieldErrors(flow,{region:'华南',attachmentName:'license.pdf'}).join(),/开户资料/)});
test('内置区域始终按固定候选必填校验，不受删除和自定义选项影响',()=>{const flow={fields:[{id:'region',type:'select',options:['任意区'],required:false},{id:'attachments',type:'number',required:false}]};assert.deepEqual(openingFieldErrors(flow,{region:'华南',attachmentName:'license.pdf'}),[]);assert.match(openingFieldErrors(flow,{region:'任意区'}).join(),/有效的办理区域/);assert.match(openingFieldErrors({fields:[]},{}).join(),/请选择办理区域/);assert.deepEqual(openingFieldErrors({fields:[]},{region:'华东'}),[])});
test('只有未办或明确失败可取消，未知行不能取消释放直客',()=>{const d=fixture();finishOpening(d,'app','row','未知');assert.throws(()=>cancelOpeningRow(d,'app','row','取消',sales),/不能直接取消/);finishOpening(d,'app','row','核实未发生',{verificationReason:'平台核实无结果'});cancelOpeningRow(d,'app','row','客户取消',sales);assert.equal(d.applications[0].status,'已取消');assert.throws(()=>finishOpening(d,'app','row','成功',{externalId:'NEW'}),/已取消/)});

test('主体只能新建一个店铺，历史多店原记录不被合并或改挂',()=>{
  const d=fixture(),before=structuredClone(d.shops);assert.throws(()=>saveShop(d,{name:'第二店'},{subjectId:'s',session:sales}),/一个主体只能对应一个店铺/);assert.deepEqual(d.shops,before);
  d.subjects.push({id:'s2',name:'第二主体',customerIds:['c']});assert.throws(()=>saveShop(d,{name:'店铺'},{id:'t',subjectId:'s2',reason:'误改关系',session:sales}),/不允许/);assert.equal(d.shops[0].subjectId,'s');
  const second=saveShop(d,{name:'第二主体的店铺'},{subjectId:'s2',session:sales});assert.equal(second.laikeName,second.name);assert.equal(d.shops.length,2);
});
test('主体表单可保存直客ID，其他字段编辑不意外清空直客',()=>{
  const d=fixture();saveSubject(d,{name:'主体',directId:'000000123',directEvidence:'平台资料'},{id:'s',reason:'主体补录',session:sales});
  assert.equal(getSubjectDirect(d,'s').directId,'000000123');assert.equal(getSubjectDirect(d,'s').directEvidence,'平台资料');
  saveSubject(d,{name:'主体新公司名'},{id:'s',reason:'工商更名',session:media});assert.deepEqual(getSubjectDirect(d,'s'),{directId:'000000123',directName:'主体新公司名',directEvidence:'平台资料'});
  assert.equal(d.applications[0].rows[0].directName,'主体新公司名');assert.throws(()=>saveSubject(d,{name:'另一主体',directId:'000000123',licenseEvidence:'证据'},{session:sales}),/其他主体/);
});
test('更正主体只同步当前展示，成功与未知行以及三类历史快照保留',()=>{
  const d=fixture(),app=d.applications[0];saveSubjectDirect(d,'s',{id:'D-old'},{reason:'初始资料',session:sales});app.subjectSnapshot=subjectSnapshot(d,'s');
  app.rows.push({id:'unknown-row',supplierId:'sp',status:'待办理'});finishOpening(d,'app','row','成功',{externalId:'A-OLD'});finishOpening(d,'app','unknown-row','未知');
  const submitted=structuredClone(app.subjectSnapshot),oldSuccessful=structuredClone(app.rows[0]),oldUnknown=structuredClone(app.rows[1]),external=structuredClone(d.accounts[0].openingIdentitySnapshot);
  saveSubjectDirect(d,'s',{id:'D-new',name:'不应采用'},{reason:'修正平台资料',session:media});
  assert.equal(d.accounts[0].directId,'D-new');assert.equal(d.accounts[0].directName,'主体');assert.deepEqual(app.subjectSnapshot,submitted);assert.deepEqual(app.rows[0],oldSuccessful);assert.deepEqual(app.rows[1],oldUnknown);assert.deepEqual(d.accounts[0].openingIdentitySnapshot,external);
  finishOpening(d,'app','unknown-row','成功',{externalId:'A-LOCKED'});assert.equal(d.accounts[0].openingIdentitySnapshot.directId,'D-old');assert.equal(getSubjectDirect(d,'s').directId,'D-new');
});
test('旧样本直客与来客名称不自动回填为当前主体平台事实',()=>{
  const d=fixture();d.accounts.push({id:'legacy',subjectId:'s',directId:'OLD-SAMPLE',product:'本地推',externalId:'OLD'});d.shops[0].laikeName='历史独立名称';const before=structuredClone(d);
  assert.deepEqual(getSubjectDirect(d,'s'),{directId:'',directName:'主体',directEvidence:''});assert.deepEqual(d,before);
  assert.throws(()=>saveSubjectDirect(d,'s',{id:'D'},{reason:'非法角色',session:{role:'财务'}}),/无权/);assert.deepEqual(d,before);
});


test('行业初始选项兼容旧存储，显式空字典不重新填充',()=>{
  const d=fixture();assert.deepEqual(industryOptions(d).map(item=>item.name),['餐饮','住宿','美容美发','休闲娱乐','教育培训','零售']);
  saveIndustryDictionary(d,[],{session:{role:'系统管理员'}});assert.deepEqual(industryOptions(d),[]);
});
test('行业字典仅管理员可改，去重并按保存顺序排列',()=>{
  const d=fixture(),admin={role:'系统管理员'};assert.throws(()=>saveIndustryDictionary(d,[{name:'餐饮'}],{session:sales}),/系统管理员/);
  assert.equal(d.industryDictionary,undefined);assert.throws(()=>saveIndustryDictionary(d,[{name:'餐 饮'},{name:'餐饮'}],{session:admin}),/重复/);
  assert.equal(d.industryDictionary,undefined);assert.throws(()=>saveIndustryDictionary(d,[{name:' '}],{session:admin}),/行业名称/);
  saveIndustryDictionary(d,[{id:'a',name:'行业乙',enabled:false},{id:'b',name:'行业甲',enabled:true}],{session:admin});
  assert.deepEqual(industryOptions(d).map(item=>item.name),['行业甲']);assert.deepEqual(industryOptions(d,{includeDisabled:true}).map(item=>item.order),[0,1]);
  saveIndustryDictionary(d,[{id:'b',name:'改名后的行业',enabled:true},{id:'a',name:'行业乙',enabled:true}],{session:admin});assert.deepEqual(industryOptions(d).map(item=>item.id),['b','a']);
});
test('主体行业选中保存，历史和停用值继续保留，不追改资料或申请快照',()=>{
  const d=fixture();d.subjects[0].industry='历史行业';const before=subjectSnapshot(d,'s');d.applications[0].subjectSnapshot=before;
  assert.match(industryStatus(d,'历史行业'),/历史值/);saveSubject(d,{name:'主体',industry:'历史行业'},{id:'s',session:sales});
  saveSubject(d,{name:'主体',industry:'餐饮'},{id:'s',session:sales});assert.equal(d.subjects[0].industry,'餐饮');
  saveIndustryDictionary(d,[{id:'food',name:'餐饮',enabled:false}],{session:{role:'系统管理员'}});
  assert.match(industryStatus(d,'餐饮'),/已停用/);saveSubject(d,{name:'主体',industry:'餐饮'},{id:'s',session:sales});
  assert.throws(()=>saveSubject(d,{name:'新主体',industry:'餐饮'},{session:sales}),/请选择/);assert.throws(()=>saveSubject(d,{name:'主体',industry:'随便输入'},{id:'s',session:sales}),/请选择/);
  assert.deepEqual(d.applications[0].subjectSnapshot,before);
});
test('信用代码直客和普通更正无需证照依据，隐藏历史证照来源保留',()=>{
  const d=fixture();d.subjects[0].licenseEvidence='历史证照来源';
  saveSubject(d,{name:'主体',creditCode:'CREDIT-1',directId:'DIRECT-1',licenseEvidence:''},{id:'s',session:sales});
  assert.equal(d.subjects[0].licenseEvidence,'历史证照来源');assert.equal(d.subjects[0].creditCode,'CREDIT-1');assert.equal(d.subjects[0].directId,'DIRECT-1');
  saveSubjectDirect(d,'s',{id:'DIRECT-2'},{session:media});saveShop(d,{name:'新店名',laikeId:'LAIKE-1'},{id:'t',subjectId:'s',session:media});
  assert.equal(d.shops[0].laikeId,'LAIKE-1');assert.equal(d.subjects[0].versions.at(-1).actor,media.name);
});
test('主体流转备注只写本单一次，当前直客同步其他申请也不复制备注',()=>{
  const d=fixture();d.applications.push({...structuredClone(d.applications[0]),id:'other-app'});
  saveSubject(d,{name:'主体新名称',directId:'DIRECT'},{id:'s',applicationId:'app',reason:'本单专属备注',session:media});
  assert.equal(d.applications[0].events.filter(event=>event.text.includes('本单专属备注')).length,1);
  assert.equal(d.applications[0].events.length,1);assert.equal(JSON.stringify(d.applications[1]).includes('本单专属备注'),false);
  assert.equal(d.applications[1].rows[0].directId,'DIRECT');
});
test('店铺和直客备注各只写对应申请一次，空备注不造占位事件',()=>{
  const d=fixture();d.applications.push({...structuredClone(d.applications[0]),id:'other-app'});
  saveShop(d,{name:'店铺新名称',laikeId:'LK'},{id:'t',subjectId:'s',applicationId:'app',reason:'本单店铺备注',session:media});
  assert.equal(d.applications[0].events.length,1);assert.equal(d.applications[0].events[0].text,'流转备注：本单店铺备注');assert.equal(JSON.stringify(d.applications[1]).includes('本单店铺备注'),false);
  saveSubjectDirect(d,'s',{id:'NEW'},{applicationId:'app',reason:'本单直客备注',session:media});assert.equal(d.applications[0].events.length,2);assert.equal(JSON.stringify(d.applications[1]).includes('本单直客备注'),false);
  saveShop(d,{name:'店铺新名称',laikeId:'LK'},{id:'t',subjectId:'s',applicationId:'app',session:media});assert.equal(d.applications[0].events.length,2);
});
test('错误申请上下文拒绝改资料或写入他单备注',()=>{
  const d=fixture();d.subjects.push({id:'other-subject',name:'其他主体',customerIds:['c']});const before=structuredClone(d);
  assert.throws(()=>saveSubject(d,{name:'主体'},{id:'s',applicationId:'missing',reason:'错误备注',session:media}),/不存在/);
  assert.throws(()=>saveSubjectDirect(d,'other-subject',{id:'OTHER'},{applicationId:'app',reason:'错误备注',session:media}),/不一致/);
  assert.deepEqual(d,before);
});


test('资料弹窗渲染行业搜索、选填备注与开户只读供应商',async()=>{
  const {build}=await import('esbuild'),{createRequire}=await import('node:module'),{fileURLToPath}=await import('node:url');
  const React=(await import('react')).default,{renderToStaticMarkup}=await import('react-dom/server');
  const result=await build({entryPoints:[fileURLToPath(new URL('./CoreFields.jsx',import.meta.url))],bundle:true,write:false,format:'cjs',platform:'node',loader:{'.css':'empty'},external:['react','react-dom','react-dom/server']});
  const loaded={exports:{}};new Function('require','module','exports',result.outputFiles[0].text)(createRequire(import.meta.url),loaded,loaded.exports);
  const d=fixture(),props={db:d,session:media,update:()=>{},onSaved:()=>{},onClose:()=>{}};
  const subject=renderToStaticMarkup(React.createElement(loaded.exports.SubjectEditor,{...props,subjectId:'s'}));
  assert.match(subject,/role="combobox"/);assert.match(subject,/流转备注（选填）/);assert.match(subject,/保存主体/);assert.doesNotMatch(subject,/证照来源|返回当前上下文|查重并保存|公共主体/);
  const shop=renderToStaticMarkup(React.createElement(loaded.exports.ShopEditor,{...props,subjectId:'s',shopId:'t'}));assert.match(shop,/保存店铺/);assert.match(shop,/流转备注（选填）/);
  const supplier=renderToStaticMarkup(React.createElement(loaded.exports.SupplierEditor,{...props,supplierId:'sp',readOnly:true}));assert.match(supplier,/支持产品/);assert.match(supplier,/代理商 ID/);assert.doesNotMatch(supplier,/银行|开户行|保存供应商|修改说明/);
  const archive=renderToStaticMarkup(React.createElement(loaded.exports.SupplierEditor,{...props,supplierId:'sp'}));assert.match(archive,/供应商银行账号/);assert.doesNotMatch(archive,/开户行地址/);
});

test('他人媒介不能从开户原单或账户修改主体、店铺、直客，拒绝后无副作用',()=>{
 const d=fixture(),other={role:'开户媒介',name:'其他媒介'},before=structuredClone(d);
 assert.throws(()=>saveSubject(d,{name:'被更改'},{id:'s',applicationId:'app',session:other}),/自己的开户申请/);
 assert.throws(()=>saveShop(d,{name:'被更改'},{id:'t',subjectId:'s',applicationId:'app',session:other}),/自己的开户申请/);
 assert.throws(()=>saveSubjectDirect(d,'s',{id:'UNAUTHORIZED'},{applicationId:'app',session:other}),/自己的开户申请/);
 assert.deepEqual(d,before);
 finishOpening(d,'app','row','成功',{externalId:'CONTEXT'});
 const completed=structuredClone(d);
 assert.throws(()=>editAccountDirect(d,d.accounts[0].id,{id:'UNAUTHORIZED'},other),/自己的开户申请/);
 assert.deepEqual(d,completed);
});
