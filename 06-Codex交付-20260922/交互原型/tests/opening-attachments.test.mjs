import test from 'node:test';
import assert from 'node:assert/strict';
import {attachmentPolicies,validateAttachmentPolicies,validateOpeningAttachments,attachmentFileError} from '../src/opening-attachments.js';
import {validateWorkflowConfig,workflowHistorySnapshot} from '../src/operations-specs.js';

const file={id:'f1',name:'营业执照.png',size:1024,type:'image/png',policyId:'license',storageKey:'blob-f1',storedLocally:true};
test('材料默认可选，已有仅文件名不能冒充真实上传',()=>{
  assert.deepEqual(validateOpeningAttachments([],{},'本地推'),[]);
  assert.match(validateOpeningAttachments([],{fields:[{id:'attachments',required:true}],attachmentName:'a.png'},'本地推').join(),/请上传/);
  assert.deepEqual(validateOpeningAttachments([file],{fields:[{id:'attachments',required:true}]},'本地推'),[]);
});
test('按产品和材料类型区分商务必需与媒介后补',()=>{
  const rules=attachmentPolicies({});rules[0]={...rules[0],product:'本地推',required:true,requiredAt:'execution'};
  const workflow={attachmentPolicies:rules};
  assert.deepEqual(validateOpeningAttachments([],workflow,'本地推','submit'),[]);
  assert.match(validateOpeningAttachments([],workflow,'本地推','execution').join(),/营业执照/);
  assert.deepEqual(validateOpeningAttachments([],workflow,'快手','execution'),[]);
  assert.deepEqual(validateOpeningAttachments([file],workflow,'本地推','execution'),[]);
  assert.match(validateOpeningAttachments([file],workflow,'快手').join(),/不适用/);
});
test('材料规则按快照保留，隐藏不能绕过必需校验',()=>{
  const rules=attachmentPolicies({});const config={attachmentPolicies:rules};
  const snapshot=workflowHistorySnapshot(config);rules[0].required=true;
  assert.equal(snapshot.attachmentPolicies[0].required,false);
  rules[0].visible=false;
  assert.match(validateAttachmentPolicies(config).join(),/隐藏和必需/);
  assert.match(validateWorkflowConfig(config).join(),/隐藏和必需/);
});
test('空文件、不支持格式、大小超限及未存储资料被拒绝',()=>{
  const policy=attachmentPolicies({})[0];
  assert.match(attachmentFileError({...file,size:0},policy),/为空/);
  assert.match(attachmentFileError({...file,name:'script.html'},policy),/仅支持/);
  assert.match(attachmentFileError({...file,size:11*1024*1024},policy),/不能超过/);
  assert.match(validateOpeningAttachments([{...file,storedLocally:false}],{},'本地推').join(),/尚未保存/);
});
test('任一资料必需与材料入口的产品范围一致，不能发布无入口死路',()=>{
  const config={scopeMode:'global',product:'',fields:[{id:'attachments',required:true}],attachmentPolicies:[]};
  assert.match(validateAttachmentPolicies(config).join(),/没有可用的上传入口/);
  config.attachmentPolicies=attachmentPolicies({}).map(p=>({...p,product:'本地推'}));
  assert.match(validateAttachmentPolicies(config).join(),/快手/);
  config.scopeMode='product';config.product='本地推';
  assert.deepEqual(validateAttachmentPolicies(config),[]);
  config.attachmentPolicies.forEach(p=>{p.visible=false;});
  assert.match(validateAttachmentPolicies(config).join(),/没有可用/);
});
