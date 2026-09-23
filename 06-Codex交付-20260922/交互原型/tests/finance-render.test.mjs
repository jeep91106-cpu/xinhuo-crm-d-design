import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {financeTitles,initFinance} from '../src/finance-model.js';

// In-memory bundle: no browser, source mutations, generated files, or production calls.
const result=await build({entryPoints:[fileURLToPath(new URL('../src/FinanceModule.jsx',import.meta.url))],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react-dom']});
const loaded={exports:{}};
new Function('require','module','exports',result.outputFiles[0].text)(createRequire(import.meta.url),loaded,loaded.exports);
const FinanceModule=loaded.exports.default;
const db={customers:[{id:'c',name:'演示客户'}],subjects:[{id:'s',name:'演示签约主体'}],shops:[],suppliers:[{id:'sup',name:'演示供应商'}],accounts:[{id:'a',name:'演示广告账户',externalId:'DEMO-AD'}]};
const f=initFinance(db);
f.wallets.push({id:'w',customerId:'c',name:'演示结算方',kind:'普通演示结算方',cash:10000,frozen:0,debt:0,service:0,openingCash:10000});
f.events.push({id:'e',walletId:'w',cashDelta:10000,debtDelta:0,serviceDelta:0,bankDelta:0,type:'演示期初',ref:'',at:'2026-09-22T00:00:00Z'});
f.demoLoaded=true;
const payment={id:'p',occurredAt:'2026-09-20',amount:100,method:'银行付款',payee:'演示实际收款人',paymentAccount:'DEMO-OUT',bankRef:'DEMO-RESULT',receivingBankName:'演示银行支行',receivingBankAccount:'000012345678901234567890',accountVerification:'演示核对依据',evidence:'演示付款凭证',operator:'演示财务'};
f.receipts.push({id:'r09',sourceAccount:'DEMO-IN',bankRef:'DEMO-REF',payer:'演示第三方付款人',amount:100,status:'已分配',confirmed:true,allocated:100,allocations:[{id:'alloc',walletId:'w',amount:100,purpose:'广告本金 / 还款',repaid:0,paymentRelationship:'第三方代付',thirdPartyBasis:'演示代付授权附件',actualPayer:'演示第三方付款人'}],events:[]});
f.orders.push({id:'r12',walletId:'w',accountId:null,accountName:'演示渠道交付',amount:100,coins:100,status:'完成',events:[],pricingSnapshot:{amount:100,coins:100,frontRate:0,version:'演示计价',confirmedBy:'演示财务'},deliveryMatches:[{id:'match',accountId:'a',externalId:'DEMO-AD',amount:100,matchRef:'DEMO-DETAIL',evidence:'演示匹配依据',operator:'演示媒介'}]});
f.records.M15=[{id:'r15',walletId:'w',amount:100,paid:100,status:'已付',events:[],payments:[payment],refundSourceSnapshot:{id:'e',type:'演示期初',cashDelta:10000,remaining:10000}}];
f.records.M18=[{id:'r18',supplierId:'sup',amount:100,paid:100,allocated:100,status:'已分配',events:[],supplierSnapshot:{name:'演示供应商',agentName:'演示代理商',agentId:'DEMO-AGENT',bankName:'演示银行',bankAccount:'00001',recordVersion:2},payments:[payment],allocations:[{orderId:'r12',amount:100,operator:'演示财务'}]}];
f.records.M19=[{id:'r19',walletId:'w',type:'后返',amount:100,paid:100,status:'已返付',events:[],agreementSnapshot:{amount:100,ratePoints:800,calculationBranch:'明确人民币约定',calculationBasis:'原约定',confirmedBy:'演示财务'},payments:[payment]}];
f.records.M20=[{id:'r20',contractNo:'DEMO-C',version:1,subjectId:'s',walletId:'w',amount:100,validFrom:'2026-09-01',validUntil:'2027-09-01',terms:'演示已保存合同条款',status:'签订有效',events:[]}];
f.records.M21=[{id:'r21',walletId:'w',amount:100,issued:100,status:'已开',events:[],sourceLines:[{sourceType:'有效合同',sourceId:'r20',sourceVersion:1,amount:100}],bills:[{number:'DEMO-FP',amount:100,issuedAt:'2026-09-20',attachmentRef:'DEMO-ATTACHMENT',evidence:'演示蓝票'}]}];
f.records.M22=[{id:'r22',type:'期间对账',period:'2026-09',status:'已封存',version:1,events:[],coverageSources:[{sourceType:'银行流水',sourceRef:'DEMO-COVERAGE',expectedCount:2,checkedCount:2}],balanceSnapshot:{wallets:[{walletId:'w',openingCash:10000,cash:10000,frozen:0,debt:0}]}}];
const props={db,session:{role:'财务',name:'演示财务',businessId:'demo'},update:()=>{throw Error('render must not write');},go:()=>{},toast:()=>{},openAccount:()=>{},onDirtyChange:()=>{}};
for(const [moduleId,title] of Object.entries(financeTitles))test(moduleId+' list renders with no data mutation',()=>{
  const before=JSON.stringify(db),html=renderToStaticMarkup(React.createElement(FinanceModule,{...props,moduleId}));
  assert.ok(html.includes(title));assert.equal(JSON.stringify(db),before);
});
for(const [moduleId,id,expected] of [['M09','r09','演示代付授权附件'],['M12','r12','DEMO-DETAIL'],['M15','r15','000012345678901234567890'],['M18','r18','演示代理商'],['M19','r19','明确人民币约定'],['M20','r20','演示已保存合同条款'],['M21','r21','DEMO-ATTACHMENT'],['M22','r22','DEMO-COVERAGE']])test(moduleId+' direct-link detail displays saved evidence',()=>{
  const html=renderToStaticMarkup(React.createElement(FinanceModule,{...props,moduleId,params:{recordId:id}}));
  assert.ok(html.includes(expected));assert.ok(html.includes('详情'));
});
