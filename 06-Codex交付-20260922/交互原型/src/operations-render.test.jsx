import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import OperationsModule from './OperationsModule.jsx';

const db={operations:{},accounts:[],applications:[],notifications:[],audit:[],config:{version:1,scopeMode:'global',product:'',region:'全局默认',fields:[{id:'remark',label:'申请说明',required:false},{id:'region',label:'办理区域',required:true},{id:'attachments',label:'开户资料',required:false}],steps:[{id:'s1',name:'商务申请',role:'商务'},{id:'s2',name:'主管派单',role:'媒介主管'},{id:'s3',name:'开户办理',role:'开户媒介'},{id:'s4',name:'完成',role:'系统'}]}};
assert.ok(readFileSync('src/Prototype.jsx','utf8').includes('操作仅保存在本机，不影响正式业务'),'全局保留演示环境说明，业务页不重复堆叠');
const base={db,session:{role:'系统管理员',name:'演示管理员',businessId:'DEMO-A'},update(){},go(){},toast(){},openAccount(){}};
for(let n=23;n<=40;n++){
 const moduleId='M'+n;
 const result=renderToStaticMarkup(<OperationsModule {...base} moduleId={moduleId}/>);
 assert.ok(result.includes(moduleId),moduleId+' missing module identity');
 assert.ok(!result.includes('模块未匹配'),moduleId+' missing component');
 assert.ok(!/\?{3,}/.test(result),moduleId+' corrupted Chinese text');
}
for(const path of ['src/OperationsModule.jsx','src/operations-specs.js'])assert.ok(!/\?{3,}/.test(readFileSync(path,'utf8')),path+' has corrupted source text');
const rolePage=renderToStaticMarkup(<OperationsModule {...base} moduleId="M33"/>);
for(const label of ['有效任职引用','范围对象 ID','截止时间','可兼任角色及逐角色范围','保存授权方案'])assert.ok(rolePage.includes(label),label);
const workflowPage=renderToStaticMarkup(<OperationsModule {...base} moduleId="M34"/>);
for(const label of ['字段类型','申请 s1','校验流程','发布流程版本'])assert.ok(workflowPage.includes(label),label);
const builtinsOnly=renderToStaticMarkup(<OperationsModule {...base} moduleId="M34" db={{...db,config:{...db.config,fields:db.config.fields.filter(field=>field.id!=='remark')}}}/>);
for(const label of ['固定六区域选择','固定文件控件','恢复内置采集字段','开户资料必填','type="file"'])assert.ok(builtinsOnly.includes(label),label);
for(const forbidden of ['字段类型','字段名称','候选选项','移除此扩展字段'])assert.ok(!builtinsOnly.includes(forbidden),'内置字段不能提供 '+forbidden+' 控件');
const hidden=renderToStaticMarkup(<OperationsModule {...base} moduleId="M31" session={{role:'商务主管',name:'演示主管'}}/>);
assert.ok(hidden.includes('当前角色没有薪资'));
assert.ok(!hidden.includes('8,000.00'));
const notifications=renderToStaticMarkup(<OperationsModule {...base} moduleId="M35" db={{...db,notifications:[{id:'N1',title:'演示开户待办',moduleId:'M06',read:false,at:new Date().toISOString()}]}}/>);
assert.ok(notifications.includes('演示开户待办'));
assert.ok(notifications.includes('打开业务列表'));
assert.ok(!notifications.includes('打开原业务单'));
const linkedNotification=renderToStaticMarkup(<OperationsModule {...base} moduleId="M35" db={{...db,notifications:[{id:'N2',title:'演示原单入口',moduleId:'M06',params:{appId:'KH-DEMO'},read:false,at:new Date().toISOString()}]}}/>);
assert.ok(linkedNotification.includes('打开原业务单'));
console.log('18 个模块服务端渲染、薪资不可见边界、通知原业务入口检查通过。');
