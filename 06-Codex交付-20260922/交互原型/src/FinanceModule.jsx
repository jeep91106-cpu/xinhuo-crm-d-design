import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Field, Modal, Empty, DataTable, PageHeader, Money, Notice, Section } from './ui.jsx';
import { financeTitles, loadFinanceDemo, createFinance, actFinance, availableCash, availableCredit, moneySummary, reconciliation, platformAvailable, refundableSources, financeRecordRoute } from './finance-model.js';
const fallback = {
  wallets: [],
  receipts: [],
  orders: [],
  events: [],
  credits: [],
  records: {}
};
const F = (key, label, type = 'text', options = null, hint = '') => ({
  key,
  label,
  type,
  options,
  hint
});
const names = {
  serviceSourceReceiptId:'独立服务费原收款', rate:'约定点数输入', sourceType:'开票依据类型', coverageEvidence:'来源覆盖复核依据', redEvidence:'红冲依据', transferSeq:'资金依赖核对位置', exceptionDebt:'异常未偿本金', exceptionDebtOriginal:'原异常欠款', refundedException:'累计异常欠款来源还原', effectiveAt:'生效时间', registrationDate:'登记日期',
  payerAccount:'实际付款账号（演示）', receivingBankName:'收款银行 / 支行', receivingBankAccount:'实际收款账号（演示）', accountVerification:'收款关系核对依据', paymentAccount:'公司实际付款账户', paymentRelationship:'付款关系', thirdPartyBasis:'第三方代付依据', receivableRef:'应收来源引用', confirmedBy:'财务确认人', confirmedAt:'财务确认时间', actualPayer:'实际付款方', repaymentTerms:'独立还款约定', moneyUnit:'现金货币单位', coinUnit:'广告币单位', refundSourceId:'原备款来源事件', approvedAmount:'批准金额', approvedBy:'批准人', approvedAt:'批准时间', differenceReason:'未付差额去向说明', calculationBasis:'计算基数依据', calculationBranch:'计价分支', ratePoints:'约定后返点数', validFrom:'合同生效日期', terms:'条款及金额范围', signedAt:'实际签署日期', signedBy:'签署核验人', signedEvidence:'已签原件依据', issuedAt:'实际开票日期', attachmentRef:'票据附件引用', cutoffAt:'对账截止日期', responsible:'差异责任人', reviewedBy:'覆盖复核人', reviewedAt:'覆盖复核时间', legacySettlementRef:'旧结算身份引用', firstOrderRef:'首单台账引用', incomeRuleVersion:'收益分类规则版本', approvedVersion:'批准版本', fundAttribute:'资金属性', sourceCash:'原充值现金本金', sourceCredit:'原充值信用本金', redIssuedAt:'红票实际开票日期', redBillNo:'实际红票号', redAmount:'红冲实际金额', parentId:'原合同版本', outRequestId:'转出原请求', inRequestId:'转入原请求',
  walletId: '结算资金方',
  targetWalletId: '目标结算方',
  accountId: '广告账户',
  accountName: '账户名称快照',
  assignee: '办理责任人',
  refundedCoins: '累计退回广告币',
  refundedCash: '累计还原本金',
  financePriced: '财务已确认计价',
  externalStatus: '外部处理状态',
  submittedBy: '提交人',
  remaining: '剩余待处理',
  locked: '已锁定',
  targetDebited: '转出端确认数量',
  targetCredited: '转入端确认数量',
  receiptId: '来源收款',
  openingCash: '演示期初备款',
  openingService: '演示期初服务费',
  sourceAccountId: '转出账户',
  targetAccountId: '转入账户',
  orderId: '原充值单',
  supplierId: '供应商',
  sourceId: '开票依据来源',
  subjectId: '签约主体',
  customerId: '客户',
  amount: '申请金额 / 数量',
  coins: '广告币数量',
  payer: '实际付款方',
  bankRef: '银行流水号',
  sourceAccount: '来源账户标识',
  occurredAt: '业务发生日期',
  evidence: '凭证 / 核实依据',
  reason: '业务依据',
  status: '当前状态',
  type: '类型',
  purpose: '用途',
  cashUsed: '实际现金扣款',
  cashReserved: '冻结现金',
  paid: '累计实付',
  issued: '累计实开',
  allocated: '累计分配',
  receivable: '应收',
  actual: '实收',
  difference: '接受差额',
  returned: '实际退币',
  validUntil: '有效截止',
  dueAt: '应还日期',
  retired: '临时信用已退出',
  used: '已使用',
  inflight: '在途占用',
  creditLimit: '演示信用上限',
  debt: '未偿欠款',
  service: '独立服务费',
  cash: '现金备款',
  frozen: '冻结现金',
  method: '实际返付方式',
  payee: '实际接收方',
  frontRate: '本单前返点数',
  pricingVersion: '计价版本',
  collectionClass: '收款分类',
  accountClass: '账户标签',
  incomeClass: '收益分类',
  version: '当前版本',
  title: '发票抬头',
  taxNo: '税号（演示）',
  contractNo: '合同编号',
  basis: '可开依据',
  period: '核对期间',
  actualTarget: '实际交付对象',
  mode: '办理方式',
  requestId: '原外部请求',
  ownerId: '当时账户归属',
  operator: '实际登记人',
  name: '名称',
  kind: '资金演示类型',
  createdAt: '登记时间',
  postedAt: '记账时间'
};
const amountKeys = new Set(['approvedAmount','sourceCash','sourceCredit','redAmount','amount', 'coins', 'cashUsed', 'cashReserved', 'paid', 'issued', 'allocated', 'receivable', 'actual', 'difference', 'returned', 'retired', 'used', 'inflight', 'creditLimit', 'debt', 'service', 'cash', 'frozen', 'openingCash', 'refundedCash']);
// Preserve business dates and identifiers; render full recorded timestamps in the viewer's local time.
const readableTime = value => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return String(value);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
};
const intro = {
  M09: '真实资料名称与本地演示金额分开。登记凭证不增加资金；财务确认后再有据认领、拆分。',
  M10: '一个结算方一个逻辑总账；现金、冻结、信用、债务分开，不设置商务个人额度。',
  M11: '申请、Boss批准、CRM同步生效分开；临时额度还款后退出，欠款不会因到期消失。',
  M12: '同一笔业务贯穿派单、冻结、外部结果与一次入账。未知结果只核实原请求，不能重新充值。',
  M13: '首充/首续/N续、账户标签和收益分类分别保存；改类不改到账、不替代提成核算。',
  M14: '平台真实退币以后才还原原资金来源；按原充值的演示计价还原本金，不套当前返点。',
  M15: '审批不等于付款。财务冻结可退款、记录实际支付，部分付款与未知结果单独保留。',
  M16: '仅渠道商务可发起。转已确认未占用现金，两端等额一次落账，不增加公司现金。',
  M17: '平台币转户两端须同结算范围、同已知归属商务；两个未知归属不能判为相同。',
  M18: '公司供应商付款与向客户交付分开。关联交付只建立核对关系，不二次扣客户余额。',
  M19: '前返由财务在充值单确认；服务费单独收用；后返记录约定、分次返付与实际接收方。',
  M20: '合同金额不是到账。签约主体和结算方独立，变更新建版本、旧票保留原引用。',
  M21: '申请占用、财务审核、实际开票分开。应收、实收与票额互不覆盖，没有接入税务系统。',
  M22: '对余额和事件复算，同时检查原始来源覆盖。已接受尾差仍保存应收、实收与有符号差额。'
};
export default function FinanceModule({
  moduleId,
  params = {},
  db,
  session,
  update,
  go,
  toast,
  openAccount,
  onDirtyChange
}) {
  const f = db.finance || fallback;
  const [modal, setModal] = useState(()=>params.recordId?{type:'detail',id:params.recordId}:null),
    [form, setForm] = useState({}),
    [error, setError] = useState(''),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState('全部');
  const [dirty,setDirty]=useState(false);
  useEffect(()=>{onDirtyChange?.(dirty);},[dirty,onDirtyChange]);
  useEffect(()=>()=>onDirtyChange?.(false),[onDirtyChange]);
  useEffect(() => {
    setModal(params.recordId ? {type:'detail',id:params.recordId} : null);
    setError('');
    setDirty(false);
  }, [moduleId,params.recordId,params.accountId,params.walletId,params.orderId,params.customerId]);
  useEffect(()=>{setQuery('');setStatus('全部');},[moduleId]);
  function changeForm(patch){setDirty(true);setForm(previous=>({...previous,...patch}));}
  function changeField(key,value){changeForm({[key]:value,...(['sourceType','walletId'].includes(key)?{sourceId:'',sourceLines:[],refundSourceId:'',serviceSourceReceiptId:''}:{}),...(key==='supplierId'?{orderId:''}: {}),...(moduleId==='M12'&&key==='accountId'?{supplierId:db.accounts.find(a=>a.id===value)?.supplierId||''}:{}),...(['payee','receivingBankAccount'].includes(key)?{accountVerification:''}:{})});}
  function closeForm(next=null){setDirty(false);onDirtyChange?.(false);setError('');setModal(next);}
  function openRecord(id,target=moduleId){setDirty(false);onDirtyChange?.(false);go(target,{...params,recordId:id},{committed:true});if(target===moduleId)setModal({type:'detail',id});}
  function closeDetail(){setModal(null);go(moduleId,{...params,recordId:undefined},{committed:true});}
  const walletName = id => f.wallets.find(w => w.id === id)?.name || id || '—';
  const accountName = id => {
    const a = db.accounts.find(a => a.id === id);
    return a ? a.name + ' · ' + a.externalId : id || '—';
  };
  const supplierName = id => db.suppliers.find(a => a.id === id)?.name || id || '—';
  const formAccount = db.accounts.find(a => a.id === form.accountId);
  const supplierConflict = moduleId === 'M12' && form.mode === '已发生补录' && form.supplierId && formAccount?.supplierId && form.supplierId !== formAccount.supplierId
    ? '所选账户供应商为“' + supplierName(formAccount.supplierId) + '”，与本次选择不一致。请改选供应商或先核对账户资料，保存时不会自动替换。' : '';
  const reference = (key, value) => ['walletId', 'targetWalletId'].includes(key) ? walletName(value) : ['accountId', 'sourceAccountId', 'targetAccountId'].includes(key) ? accountName(value) : key === 'supplierId' ? supplierName(value) : key === 'subjectId' ? db.subjects.find(s => s.id === value)?.name || value : key === 'customerId' ? db.customers.find(s => s.id === value)?.name || value : value;
  const options = {
    wallet: f.wallets.map(w => [w.id, w.name + ' · ' + w.kind]),
    customer: db.customers.map(c => [c.id, c.name + (c.kind === '渠道' ? ' · 已标渠道' : '')]),
    account: db.accounts.map(a => [a.id, a.name.slice(0, 32) + ' · ' + a.externalId]),
    supplier: db.suppliers.map(s => [s.id, s.name]),
    subject: db.subjects.map(s => [s.id, s.name]),
    order: f.orders.filter(o => o.status === '完成').map(o => [o.id, o.id + ' · ' + o.accountName]),
    allOrder: f.orders.map(o => [o.id, o.id + ' · ' + o.accountName]),
    receipt: f.receipts.filter(r => r.confirmed&&(!form.walletId||r.allocations.some(a=>a.walletId===form.walletId))).map(r => [r.id, r.id + ' · ' + r.payer]),
    serviceReceipt:f.receipts.filter(r=>r.confirmed&&r.allocations.some(a=>a.walletId===form.walletId&&a.purpose==='独立服务费')).map(r=>[r.id,r.bankRef+' · '+r.payer]),
    contract: (f.records?.M20 || []).filter(r => r.status === '签订有效'&&(!form.walletId||r.walletId===form.walletId)).map(r => [r.id, r.contractNo + ' v' + r.version]),
    refundSource: refundableSources(f,form.walletId,modal?.action==='amend-source'?modal.id:null).filter(e=>e.remaining>0).map(e=>[e.id,e.type+' · '+(e.ref||e.id)+' · 来源剩余 ¥'+(e.remaining/100).toFixed(2)])
  };
  const selector = (key, label, opts, hint) => F(key, label, 'select', opts, hint);
  const amount = (label = '金额（元，演示）', key = 'amount') => F(key, label, 'money');
  const config = () => {
    const w = selector('walletId', '结算资金方', 'wallet'),
      a = selector('accountId', '广告账户', 'account');
    const reason = F('reason', '业务依据 / 处理说明', 'textarea');
    const evidence = F('evidence', '凭证说明（演示，不上传真实凭据）', 'textarea');
    switch (moduleId) {
      case 'M09':
        return [F('sourceAccount', '公司收款账户标识（演示）'), F('receivingBankName','公司收款银行 / 支行'), F('bankRef', '银行流水号（演示唯一号）'), F('payer', '实际付款方（代付也保留原名）'), F('payerAccount','实际付款账号（可未知，不推断归属）'), amount('实际到账（元）'), F('occurredAt', '发生日期', 'date'), F('receivableRef','应收来源引用（可选）'), evidence];
      case 'M10':
        return [selector('customerId', '选择客户建立演示总账', 'customer'), selector('kind', '本地资金场景', ['普通演示结算方', '渠道演示结算方'], '该选项不会修改真实客户资料或员工权限。')];
      case 'M11':
        return [w, selector('type', '信用类型', ['常规循环', '临时', '单次']), amount('申请上限（元）'), F('validUntil', '支用有效截止', 'date'), F('dueAt', '独立约定应还日期', 'date'),F('repaymentTerms','独立还款约定 / 期账安排','textarea'), reason];
      case 'M12':
        return [selector('mode', '办理方式', ['新执行', '已发生补录']), w, a,...(form.mode==='已发生补录'?[selector('supplierId','实际交付供应商（可选，未知不猜测）','supplier','选择账户时带入其供应商；已知账户供应商与本次选择须一致，缺少选择时沿用账户资料。')]:[]), amount('现金本金（元，演示）'), F('actualTarget', '实际交付对象 / 平台钱包或批次', 'text', null, '渠道级已发生补录可不选子账户，但此项及凭证必填。'), F('occurredAt', '实际发生日期（补录）', 'date'), evidence];
      case 'M13':
        return [selector('orderId', '原充值业务', 'allOrder'), selector('collectionClass', '收款分类', ['首充', '首续', 'N续']), selector('accountClass', '账户标签', ['新开', '续费']), selector('incomeClass', '收益分类', ['首单', '首续', '续费', '待核算确认']), F('legacySettlementRef','旧结算身份引用（迁移适用）'),F('firstOrderRef','首单台账引用（可选）'),F('incomeRuleVersion','收益分类规则版本 / 待核验标识'),reason];
      case 'M14':
        return [selector('orderId', '已成功充值来源', 'order'), amount('申请退回广告币数量（两位小数演示）'), reason];
      case 'M15':
        return [w,selector('refundSourceId','原备款来源（选择后仍校验当前总账可退额）','refundSource'), amount('申请现金退款（元）'), F('payee', '实际退款接收方（演示名称）'), selector('method', '退款方式', ['银行转账（演示）', '其他有据方式（演示）']), F('receivingBankName','实际收款银行 / 支行'),F('receivingBankAccount','实际收款账号（字符串，不锁定位数）'),F('accountVerification','退款收款关系核对依据','textarea',null,'不把主体开户账号或原代付款人自动视为退款收款方。'),reason];
      case 'M16':
        return [w, selector('targetWalletId', '转入结算方', 'wallet'), amount('转账现金（元）'), reason];
      case 'M17':
        return [selector('sourceAccountId', '转出广告账户', 'account'), selector('targetAccountId', '转入广告账户', 'account'), amount('广告币转户数量（两位小数演示）'), evidence];
      case 'M18':
        return [selector('supplierId', '供应商', 'supplier'), selector('type', '付款用途', ['供应商预存', '关联业务付款']),...(form.type==='关联业务付款'?[selector('orderId','指定同供应商充值原单','allOrder')]:[]),amount('应付金额（元）'), evidence];
      case 'M19':
        return [w, selector('type', '费用业务', ['服务费', '后返']),selector('orderId','关联充值原单（可选）','allOrder'),...(form.type==='服务费'?[selector('serviceSourceReceiptId','已确认独立服务费来源（可先登记应收）','serviceReceipt')]:[]),amount('应收服务费 / 约定现金应返（元）'), F('rate', '约定后返点数（财务）', 'text', null, '本台账金额按已确认人民币约定录入；广告币后返不能自动按1:1兑换现金。前返在充值财务节点办理。'),F('calculationBasis','计算基数 / 约定金额来源','textarea'),F('calculationBranch','旧计价分支 / 约定依据（不自动换算）'), reason];
      case 'M20':
        return [F('contractNo', '合同编号'), selector('subjectId', '签约法律主体', 'subject'), w, amount('合同约定金额（不是已到账）'),F('validFrom','合同有效起始','date'), F('validUntil', '合同有效截止', 'date'),F('terms','条款与金额范围','textarea'), evidence];
      case 'M21':
        return [w, selector('sourceType', '可开额度来源', ['收款分配', '有效合同']), selector('sourceId', '指定可开依据', form.sourceType === '有效合同' ? 'contract' : 'receipt'), F('title', '发票抬头（演示）'), F('taxNo', '税号（演示，不填写真实敏感资料）'), amount('申请开票金额（元）'), F('basis', '开票依据 / 应收实收差异说明', 'textarea')];
      case 'M22':
        return [selector('type', '核对业务', ['期间对账', '尾差处理']), F('period', '期间 / 账单号'),...(form.type==='尾差处理'?[amount('应收', 'receivable'),amount('实收', 'actual')]:[F('cutoffAt','来源核对截止日期','date'),F('responsible','差异责任人（演示）')]), reason];
      default:
        return [];
    }
  };
  function defaults() {
    return {
      walletId: params.walletId || (params.accountId ? f.wallets.find(w=>w.customerId===db.accounts.find(a=>a.id===params.accountId)?.customerId)?.id || '' : f.wallets[0]?.id || ''),
      targetWalletId: f.wallets[1]?.id || '',
      customerId: params.customerId || db.customers[0]?.id || '',
      accountId: params.accountId || '',
      sourceAccountId: '',
      targetAccountId: '',
      supplierId: moduleId==='M18' ? db.suppliers[0]?.id || '' : moduleId==='M12' ? db.accounts.find(a=>a.id===params.accountId)?.supplierId || '' : '',
      subjectId: db.subjects[0]?.id || '',
      orderId: params.orderId || '',
      sourceId: '',
      sourceType: '收款分配',
      amount: '1000.00',
      receivable: '950.52',
      actual: '950.00',
      sourceAccount: 'DEMO-BANK-01',
      bankRef: 'DEMO-' + Date.now(),
      payer: '演示付款方',
      payee: '演示接收方',
      occurredAt: new Date().toISOString().slice(0, 10),
      validUntil: '2027-12-31',
      dueAt: '2027-01-31',
      mode: '新执行',
      kind: '普通演示结算方',
      type: moduleId === 'M11' ? '常规循环' : moduleId === 'M18' ? '供应商预存' : moduleId === 'M19' ? '服务费' : moduleId === 'M22' ? '期间对账' : '',
      collectionClass: '首充',
      accountClass: '新开',
      incomeClass: '待核算确认',
      method: '银行转账（演示）',
      rate: '0',
      period: new Date().toISOString().slice(0, 7),
      reason: '',
      evidence: '',
      basis: '',
      contractNo: 'DEMO-C-' + Date.now(),
      title: '演示开票抬头',
      taxNo: 'DEMO-TAX-ID'
      ,payerAccount:'',receivingBankName:'',receivingBankAccount:'',accountVerification:'',refundSourceId:'',repaymentTerms:'',validFrom:new Date().toISOString().slice(0,10),terms:'',cutoffAt:new Date().toISOString().slice(0,10),responsible:session.name,sourceLines:[],incomeRuleVersion:'待核算确认',calculationBranch:'按已确认人民币约定录入'
    };
  }
  const rows = moduleId === 'M09' ? f.receipts : moduleId === 'M10' ? f.wallets : moduleId === 'M11' ? f.credits : moduleId === 'M12' ? f.orders : f.records?.[moduleId] || [];
  const filtered = useMemo(() => rows.filter(r => (status === '全部' || r.status === status) && (!query || JSON.stringify(r).toLowerCase().includes(query.toLowerCase()) || walletName(r.walletId).includes(query) || accountName(r.accountId).includes(query))), [rows, status, query]);
  const selected = modal?.id ? rows.find(r => r.id === modal.id) : null;
  function begin() {
    if(dirty&&!window.confirm('放弃当前尚未保存的表单并新建吗？'))return;
    setDirty(false);onDirtyChange?.(false);
    setForm(defaults());
    setError('');
    setModal({
      type: 'create'
    });
  }
  function detail(r) {
    setError('');openRecord(r.id);
  }
  function mutate(fn, summary, close = true) {
    try {
      let result;
      update(d => {result=fn(d);}, summary);
      toast(summary);
      setError('');
      setDirty(false);onDirtyChange?.(false);
      if (typeof result==='string'&&((moduleId==='M10')||!result.startsWith('已载入'))) openRecord(result);
      else if(modal?.id) openRecord(modal.id);
      else if (close) setModal(null);
    } catch (e) {
      setError(e.message);
      toast(e.message, 'error');
    }
  }
  function doAction(r, action, label, fields = []) {
    if (fields.length) {
      const firstWallet = f.wallets[0]?.id || '';
      setForm({
        amount: ((r.amount - (r.paid || r.issued || r.returned || r.allocated || 0)) / 100).toFixed(2),
        walletId: r.walletId || params.walletId || firstWallet,
        purpose: '广告本金 / 还款',
        evidence: '',
        payee: r.payee || r.supplierSnapshot?.agentName || r.supplierSnapshot?.name || '',
        method: r.method || '其他有据方式',
        billNo: 'DEMO-FP-' + Date.now(),
        orderId: '',
        refundSourceId:r.refundSourceId||'',
        rate: r.frontRate!==undefined?(r.frontRate/100).toFixed(2):'0',
        validUntil: r.validUntil || '2027-12-31', validFrom:r.validFrom||'',terms:r.terms||'',
        occurredAt:action==='amend'?r.occurredAt||'':new Date().toISOString().slice(0,10),issuedAt:new Date().toISOString().slice(0,10),paymentAccount:'',bankRef:'',payerAccount:r.payerAccount||'',receivableRef:r.receivableRef||'',receivingBankName:r.receivingBankName||r.supplierSnapshot?.bankName||'',receivingBankAccount:r.receivingBankAccount||r.supplierSnapshot?.bankAccount||'',accountVerification:r.accountVerification||'',paymentRelationship:'',thirdPartyBasis:'',coverageSources:[{sourceType:'人工凭证',sourceRef:'',expectedCount:'',checkedCount:''}]
      });
      setDirty(false);onDirtyChange?.(false);
      setError('');
      setModal({
        type: 'action',
        id: r.id,
        action,
        label,
        fields
      });
    } else mutate(d => actFinance(d, moduleId, r.id, action, {}, session), '演示：' + label, false);
  }
  const proof = [F('evidence', '核实凭证 / 办理依据（演示）', 'textarea')];
  const paymentIdentity=[selector('method','实际付款方式',['银行转账（演示）','其他有据方式']),F('payee','实际收款人（核对后填写）'),F('paymentAccount','公司实际付款账户 / 来源标识'),F('bankRef','本次付款流水 / 结果编号（防重复）'),F('receivingBankName','实际收款银行 / 支行'),F('receivingBankAccount','实际收款账号'),F('accountVerification','实际收款关系核对依据','textarea'),F('occurredAt','实际付款日期','date')];
  const payment = [amount('本次实际金额（元）'),...paymentIdentity,...proof];
  function actions(r) {
    const arr = [];
    const add = (action, label, roles, fields = []) => arr.push({
      action,
      label,
      roles,
      fields
    });
    switch (moduleId) {
      case 'M09':
        if (!r.confirmed) add('amend','补齐待确认凭证',['商务','渠道商务','商务主管','财务'],[F('occurredAt','实际到账日期','date'),F('payerAccount','实际付款账号'),F('receivingBankName','公司收款银行 / 支行'),F('receivableRef','应收来源引用（可选）'),...proof]);
        if (!r.confirmed) add('confirm', '财务确认到账（演示）', ['财务']);
        if (r.confirmed && r.allocated < r.amount) add('allocate', '认领 / 拆分分配', ['财务'], [selector('walletId', '结算资金方', 'wallet'), amount('本次分配金额（元）'), selector('purpose', '互斥用途', ['广告本金 / 还款', '独立服务费', '接受多款差额']),selector('paymentRelationship','本次认领的付款关系',['客户本人付款','第三方代付']),F('thirdPartyBasis','第三方代付关系依据（代付必填）','textarea'),F('receivableRef','关联应收来源（可选）'),...proof]);
        break;
      case 'M11':
        if (r.status === '待Boss审批') {
          add('approve', 'Boss批准（演示）', ['Boss']);
          add('reject', '拒绝申请', ['Boss']);
        }
        if (r.status === '批准待CRM同步') add('sync', '补CRM同步并生效', ['Boss']);
        if (r.status === '有效') add('freeze', '暂停新支用', ['Boss']);
        break;
      case 'M12':
        if (r.status === '待派单') add('assign', '主管指派充值媒介', ['媒介主管']);
        if (['待派单', '待办理', '已发生待核实'].includes(r.status)) add('price', '财务确认本单前返', ['财务'], [F('rate', '普通前返点数（非全局默认）', 'text', null, '本金1000、8点对应1080广告币；其它旧分支需独立核验。')]);
        if (r.status === '待办理') add('freeze', '校验并冻结资金', ['充值媒介']);
        if (r.status === '资金冻结') add('start', '执行演示充值', ['充值媒介']);
        if (r.status === '执行中') add('unknown', '标记未知，保留冻结', ['充值媒介']);
        if (['执行中', '未知待核实'].includes(r.status)) {
          add('success', '核实原请求已成功', ['充值媒介'], proof);
          add('fail', '核实原请求未发生', ['充值媒介'], proof);
        }
        if (r.status === '成功待入账') add('post', '补入账 / 同步一次', ['充值媒介', '财务']);
        if (r.status === '明确失败') add('retry', '原单重办', ['商务', '渠道商务', '商务主管', '充值媒介']);
        if (r.status === '已发生待核实') add('supplement', '核实已发生并记账', ['财务']);
        if(r.status==='完成'&&!r.accountId) add('match','补关联已交付子账户（不再扣款）',['财务','充值媒介'],[selector('accountId','匹配到广告账户','account'),amount('本明细现金本金（元）'),F('matchRef','原外部交付明细引用'),...proof]);
        break;
      case 'M13':
        if (r.status === '待财务确认') add('confirm', '财务确认分类版本', ['财务']);
        break;
      case 'M14':
        if (['待媒介办理', '未知', '部分退回'].includes(r.status)) {
          add('success', '核实平台实际退回', ['充值媒介', '财务'], [amount('本次实际退回广告币数量'),F('occurredAt','实际退币日期','date'),F('requestId','平台原退币请求 / 结果编号（可选）'),...proof]);
          if (r.status === '待媒介办理') add('unknown', '结果未知，仅核实原单', ['充值媒介']);
        }
        break;
      case 'M15':
        if(['待审批','已批待付'].includes(r.status)) add('amend-source','补齐 / 更正退款来源资料',['商务','渠道商务','商务主管','财务'],[selector('refundSourceId','原可退备款来源','refundSource'),F('payee','实际退款收款人'),selector('method','退款方式',['银行转账（演示）','其他有据方式']),F('receivingBankName','收款银行 / 支行'),F('receivingBankAccount','实际收款账号'),F('accountVerification','更正或核对依据（将重新审批）','textarea')]);
        if (r.status === '待审批') add('approve', '批准待财务付款', ['商务主管', 'Boss']);
        if (r.status === '已批待付') add('freeze', '冻结可退款，准备付款', ['财务']);
        if (['付款准备', '部分付'].includes(r.status)) add('unknown', '付款未知，保留冻结', ['财务']);
        if (['付款准备', '部分付', '未知'].includes(r.status)) {
          add('pay', '核实实际付款结果', ['财务'], payment);
          add('fail', '核实剩余款未支付', ['财务'], proof);
        }
        break;
      case 'M16':
        if (r.status === '待财务办理') add('transfer', '执行演示CRM转账', ['财务']);
        if (r.status === '完成') add('reverse', '检查依赖并冲正整笔', ['财务'], proof);
        break;
      case 'M17':
        if (r.status === '待媒介办理') add('out', '核实演示转出成功', ['充值媒介']);
        if (['待转入', '部分完成待补偿', '未知'].includes(r.status)) {
          add('in', '核实原转入 / 补偿成功', ['充值媒介'], proof);
          if (r.status === '待转入') add('unknown', '转入未知', ['充值媒介']);
          if (r.status !== '部分完成待补偿') add('fail', '转入失败，保留已转出', ['充值媒介']);
        }
        break;
      case 'M18':
        if (['待付款', '部分付款'].includes(r.status)) add('pay', '财务登记实际付款', ['财务'], payment);
        if (r.paid > r.allocated) add('allocate', '分配到已完成交付', ['财务'], [selector('orderId', '同供应商成功交付', 'order'), amount('分配金额（元）')]);
        break;
      case 'M19':
        if (r.status === '待财务确认') add('confirm', '财务确认本单约定', ['财务']);
        if (r.type === '服务费' && ['待收/使用', '部分使用', '部分退回'].includes(r.status)) {
          add('use', '使用独立服务费余额', ['财务'], [amount('本次使用服务费（元）')]);
          add('refund', '核实未用服务费实际退回', ['财务'], [amount('本次实际退回服务费（元）'),...paymentIdentity,...proof]);
        }
        if (r.type === '后返' && ['待返付', '部分返付'].includes(r.status)) add('pay', '登记实际返付', ['财务'], [amount('本次现金应返结付（元）'),selector('method', '返付方式', ['其他有据方式', '银行付款', '转备款', '抵欠款']),...paymentIdentity.filter(x=>x.key!=='method'),...proof]);
        break;
      case 'M20':
        if (r.status === '草稿') {
          add('revise', '编辑合同草稿', ['商务', '渠道商务', '商务主管', '财务'], [amount('本版本约定金额（元）'),F('validFrom','合同有效起始','date'), F('validUntil', '变更后的合同有效截止', 'date'),F('terms','本版本条款和金额范围','textarea'),...proof]);
          add('submit', '提交合同审核', ['商务', '渠道商务', '商务主管', '财务']);
        }
        if (r.status === '审批中') add('sign', '核实签署原件', ['财务'], [F('occurredAt','实际签署日期','date'),...proof]);
        if (r.status === '签订有效') {
          add('version', '生成下一版草稿', ['商务', '渠道商务', '商务主管', '财务']);
          add('void', '有据作废合同', ['财务'], proof);
        }
        break;
      case 'M21':
        if (r.status === '占用待审') add('approve', '财务确认可开依据', ['财务']);
        if (['待开', '部分开'].includes(r.status)) add('issue', '登记实际开出票据', ['财务'], [amount('本次实际票额（元）'), F('billNo', '实际票号（演示）'),F('issuedAt','票据实际开票日','date'),F('attachmentRef','票据附件 / 原件引用'),...proof]);
        if (!r.issued && ['占用待审', '待开'].includes(r.status)) add('cancel', '取消申请，释放未开占用', ['财务']);
        if (r.issued && !['红冲处理中', '红冲完成'].includes(r.status)) add('red', '发起原票红冲办理', ['财务'], proof);
        if (r.status === '红冲处理中') add('red-complete', '核实整单实际红冲', ['财务'], [F('billNo', '实际红票号（演示）'),F('issuedAt','红票实际开票日','date'), ...proof]);
        break;
      case 'M22':
        if (r.type === '尾差处理') {
          if (r.status === '待财务接受') add('accept', '接受差额并结清', ['财务'], proof);
        } else {
          if (r.status !== '已封存') add('scan', '重新运行事件对账', ['财务']);
          if (r.status === '待覆盖复核') add('close', '复核演示原始来源覆盖', ['财务'], [F('coverageSources','逐项原始来源覆盖','coverage'),...proof]);
          if (r.status === '核对完成') add('seal', '封存本期间版本', ['财务']);
          if (r.status === '已封存') add('reopen', '有据重开，保留旧版', ['财务'], proof);
        }
        break;
      default:
        break;
    }
    return arr;
  }
  function actionButtons(r) {
    return <div className="toolbar">{actions(r).map(a => <button key={a.action} className="btn primary" disabled={!a.roles.includes(session.role)} title={a.roles.includes(session.role) ? '本地演示，不连接生产' : '需 ' + a.roles.join(' / ')} onClick={() => doAction(r, a.action, a.label, a.fields)}>{a.label}{!a.roles.includes(session.role) ? ' · 需' + a.roles[0] : ''}</button>)}</div>;
  }
  function renderFields(fields) {
    return <div className="form-grid">{fields.map(field => {
        let opts = typeof field.options === 'string' ? options[field.options] || [] : field.options || [];
        if(field.type==='coverage') return <div key={field.key}><b>{field.label}</b><p className="muted">手工核对本次演示来源，不冒充银行或平台已经自动对账。应核 / 已核数量不相等时不能完成。</p>{(form.coverageSources||[]).map((line,index)=><div key={index} className="form-grid"><Field label="来源类型"><select value={line.sourceType} onChange={e=>changeForm({coverageSources:form.coverageSources.map((x,i)=>i===index?{...x,sourceType:e.target.value}:x)})}>{['银行流水','平台结果','人工凭证'].map(v=><option key={v}>{v}</option>)}</select></Field>{[['sourceRef','来源批次 / 凭证引用'],['expectedCount','应核笔数'],['checkedCount','已核笔数']].map(([key,label])=><Field key={key} label={label}><input value={line[key]} onChange={e=>changeForm({coverageSources:form.coverageSources.map((x,i)=>i===index?{...x,[key]:e.target.value}:x)})}/></Field>)}<button className="btn quiet" onClick={()=>changeForm({coverageSources:form.coverageSources.filter((_,i)=>i!==index)})}>移除此项</button></div>)}<button className="btn" onClick={()=>changeForm({coverageSources:[...(form.coverageSources||[]),{sourceType:'银行流水',sourceRef:'',expectedCount:'',checkedCount:''}]})}>新增来源覆盖项</button></div>;
        if(['转备款','抵欠款'].includes(form.method)&&['paymentAccount','bankRef','receivingBankName','receivingBankAccount','accountVerification'].includes(field.key))return null;
        return <Field key={field.key} label={field.label} hint={field.hint} error={field.key==='supplierId'?supplierConflict:''}>{field.type === 'select' ? <select value={form[field.key] ?? ''} onChange={e => changeField(field.key,e.target.value)}><option value="">请选择</option>{opts.map(o => {
              const [v, l] = Array.isArray(o) ? o : [o, o];
              return <option key={v} value={v}>{l}</option>;
            })}</select> : field.type === 'textarea' ? <textarea rows={3} value={form[field.key] || ''} onChange={e => changeField(field.key,e.target.value)} /> : <input type={field.type === 'date' ? 'date' : 'text'} inputMode={field.type === 'money' ? 'decimal' : undefined} value={form[field.key] ?? ''} onChange={e => changeField(field.key,e.target.value)} />}</Field>;
      })}</div>;
  }
  function invoiceSourcesEditor(){const lines=form.sourceLines||[];const opts=form.sourceType==='有效合同'?options.contract:options.receipt;return <Section title="开票来源分配"><Notice>一张申请可以引用同类多个来源；各行金额合计必须等于申请票额。合同和收款依据不能在一张申请内混用并重复占用。</Notice>{lines.map((line,index)=><div className="toolbar" key={index}><Field label={'来源 '+(index+1)}><select value={line.sourceId} onChange={e=>changeForm({sourceLines:lines.map((x,i)=>i===index?{...x,sourceId:e.target.value}:x)})}><option value="">请选择来源</option>{opts.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></Field><Field label="本来源分配金额（元）"><input value={line.amount} onChange={e=>changeForm({sourceLines:lines.map((x,i)=>i===index?{...x,amount:e.target.value}:x)})}/></Field><button className="btn quiet" onClick={()=>changeForm({sourceLines:lines.filter((_,i)=>i!==index)})}>移除此来源</button></div>)}<button className="btn" onClick={()=>changeForm({sourceLines:lines.length?[...lines,{sourceId:'',amount:''}]:[{sourceId:form.sourceId||'',amount:form.amount||''}]})}>{lines.length?'添加另一个来源':'按来源拆分申请票额'}</button>{lines.length===0&&<p className="muted">当前按上方单一来源全额申请。</p>}</Section>}
  function sourceButton(id,label){const target=financeRecordRoute(f,id);return target?<button className="btn quiet" onClick={()=>go(target,{recordId:id,returnTo:{moduleId,recordId:selected?.id}},{committed:true})}>{label||'查看原单'} · {id}</button>:<span className="muted">{label||'来源'}：{id||'未关联'}</span>}
  const title = financeTitles[moduleId] || '资金业务';
  const sum = moneySummary(f);
  const columns = moduleId === 'M10' ? [{
    key: 'name',
    label: '演示结算方',
    render: r => <><strong>{r.name}</strong><div className="muted">{r.kind}</div></>
  }, {
    key: 'cash',
    label: '现金备款',
    render: r => <Money value={r.cash} />
  }, {
    key: 'frozen',
    label: '冻结 / 在途现金',
    render: r => <Money value={r.frozen} />
  }, {
    key: 'available',
    label: '可用现金',
    render: r => <Money value={availableCash(r)} />
  }, {
    key: 'debt',
    label: '未偿本金',
    render: r => <Money value={r.debt} />
  }, {
    key: 'credit',
    label: '可用批准信用',
    render: r => <Money value={availableCredit(f, r.id)} />
  }, {
    key: 'service',
    label: '独立服务费',
    render: r => <Money value={r.service} />
  }, {
    key: 'open',
    label: '操作',
    render: () => <span className="tag">查看总账 →</span>
  }] : [{
    key: 'id',
    label: '单据 / 来源',
    render: r => <><strong className="mono">{r.id}</strong><div className="muted">{r.contractNo || r.bankRef || r.type || r.mode || '本地演示'}</div></>
  }, {
    key: 'subject',
    label: moduleId === 'M09' ? '实际付款方' : '业务对象',
    render: r => <><strong>{r.payer || r.accountName || (r.sourceAccountId ? accountName(r.sourceAccountId) : r.supplierId ? supplierName(r.supplierId) : walletName(r.walletId))}</strong><div className="muted">{r.supplierId ? supplierName(r.supplierId) : r.orderId || r.title || r.period || ''}</div></>
  }, {
    key: 'amount',
    label: moduleId==='M13'?'分类 / 版本':['M14', 'M17'].includes(moduleId) ? '广告币数量（演示）' : '金额 / 核对摘要（演示）',
    render: r => moduleId==='M13'?<>{r.collectionClass} / {r.accountClass}<small className="block">{r.incomeClass} · v{r.version}</small></>:moduleId==='M22'&&r.type==='期间对账'?(r.balanceSnapshot?`已复算 ${r.balanceSnapshot.wallets.length} 个资金方`:'尚未复算'):['M14', 'M17'].includes(moduleId) ? <span className="mono">{(r.amount / 100).toFixed(2)} 广告币</span> : <Money value={r.amount ?? r.difference ?? 0} />
  }, {
    key: 'status',
    label: '当前状态',
    render: r => <Badge tone={['完成', '已付', '已分配', '有效', '已开', '已封存', '签订有效'].includes(r.status) ? 'success' : r.status?.includes('未知') || r.status?.includes('差异') ? 'warning' : 'neutral'}>{r.status}</Badge>
  }, {
    key: 'progress',
    label: '处理进度',
    render: r => moduleId==='M19'&&r.type==='服务费'?<span>已用 <Money value={r.used||0}/> / 已退 <Money value={r.returned||0}/></span>:r.allocations?.length ? '已分配 ' + r.allocations.length + ' 笔' : r.paid !== undefined ? <span>累计实付 <Money value={r.paid} /></span> : r.issued !== undefined ? <span>已开 <Money value={r.issued} /></span> : r.version ? '版本 v' + r.version : r.requestId || '查看流程及下一步'
  }, {
    key: 'detail',
    label: '操作',
    render: () => <span className="tag">查看与办理 →</span>
  }];
  const detailEvents = selected?.events || [];
  return <div className="page">
  {params.returnTo?.moduleId&&<button className="btn quiet" onClick={()=>go(params.returnTo.moduleId,{recordId:params.returnTo.recordId})}>返回来源业务单</button>}
  <PageHeader eyebrow={'资金协作 / ' + moduleId} title={title} description={intro[moduleId]} actions={<><button className="btn" onClick={() => mutate(d => loadFinanceDemo(d, session), '载入资金演示场景')} disabled={!!f.demoLoaded}>{f.demoLoaded ? '演示资金已载入' : '载入资金演示场景'}</button><button className="btn primary" onClick={begin}>{moduleId === 'M10' ? '新增演示总账' : moduleId === 'M22' ? '新增对账 / 尾差' : '新增' + (moduleId === 'M12' ? '充值 / 补录' : '业务记录')}</button></>} />
  <Notice tone="warning">金额、资金状态和办理结果均为本地评审演示；客户与账户名称来自已核验历史样本。所有按钮均不发送银行、媒体或企微请求。当前操作角色：{session.role}。</Notice>
  <div className="grid3"><div className="metric"><span>演示现金备款</span><strong><Money value={sum.cash} /></strong><small>原始资料没有复制真实余额</small></div><div className="metric"><span>演示冻结现金</span><strong><Money value={sum.frozen} /></strong><small>未知与外部处理中仍占用</small></div><div className="metric"><span>演示未偿欠款</span><strong><Money value={sum.debt} /></strong><small>客户信用 / 真实缺口，与员工额度无关</small></div></div>
  {!f.demoLoaded && <Empty title="资金演示场景尚未载入" detail="载入后提供允城普通演示结算方与龙赢渠道演示总账，用于跨模块联动；不会修改真实客户类型。" action={<button className="btn primary" onClick={() => mutate(d => loadFinanceDemo(d, session), '载入资金演示场景')}>载入资金演示场景</button>} />}
  {moduleId === 'M12' && <Section title="充值主线"><div className="flow">{['商务提交', '主管派单', '财务计价', '冻结 / 执行', '核实原结果', '入账一次'].map(x => <div className="step" key={x}>{x}</div>)}</div><p className="muted">每笔单据的业务状态独立；结果未知没有“重充”按钮。已发生补录只记事实与资金缺口。</p></Section>}
  {moduleId === 'M17' && <Notice>真实样本的账户级商务归属尚未取得，不会把空归属判为相同。请在 <button className="btn quiet" onClick={() => go('M08')}>账户归属与交接</button> 设置明确标记的本地演示归属，并通过已完成演示充值形成可转平台余额。</Notice>}
  {moduleId === 'M19' && <Notice>独立服务费通过“收款分配 → 独立服务费”形成余额；前返点数在充值详情由财务确认。这里的后返是明确约定的人民币应返，不把旧三位小数广告币后返擅自换算成人民币。</Notice>}
  <Section title={title + '列表'} actions={<div className="toolbar"><input aria-label="搜索资金记录" placeholder="搜索单号、对象或说明" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="筛选资金状态" value={status} onChange={e => setStatus(e.target.value)}><option>全部</option>{[...new Set(rows.map(r => r.status).filter(Boolean))].map(x => <option key={x}>{x}</option>)}</select></div>}><DataTable key={moduleId} columns={columns} rows={filtered} onRow={detail} /></Section>
  {moduleId === 'M10' && <Section title="统一事件与分录（演示）" actions={<button className="btn" onClick={() => go('M22')}>前往内部对账</button>}><DataTable rows={[...f.events].reverse()} columns={[{
        key: 'at',
        label: '时间',
        render: r => readableTime(r.at)
      }, {
        key: 'type',
        label: '业务事实'
      }, {
        key: 'walletId',
        label: '资金方',
        render: r => walletName(r.walletId)
      }, {
        key: 'cashDelta',
        label: '备款变化',
        render: r => <Money value={r.cashDelta} />
      }, {
        key: 'debtDelta',
        label: '欠款变化',
        render: r => <Money value={r.debtDelta} />
      }, {
        key: 'serviceDelta',
        label: '服务费变化',
        render: r => <Money value={r.serviceDelta} />
      }, {
          key: 'ref',
          label: '原业务单',render:r=>sourceButton(r.ref)
      }, {
        key: 'note',
        label: '依据'
      }]} /></Section>}
  {moduleId === 'M22' && <Section title="当前待核对事项">{reconciliation(f).length ? <ul>{reconciliation(f).map((x, i) => <li key={i}>{x}</li>)}</ul> : <p>当前样本账内事件一致。尚须在对账单中完成原始来源覆盖核对；本提示不代表生产账已对平。</p>}</Section>}
  {modal?.type === 'create' && <Modal wide title={'新增 ' + title + ' · 本地演示'} onClose={() => closeForm()} footer={<><button className="btn" onClick={() => closeForm()}>取消</button><button className="btn primary" onClick={() => mutate(d => createFinance(d, moduleId, form, session), '新增' + title + '演示记录')}>保存演示申请</button></>}><Notice>当前角色：{session.role}。必需资料和金额将在保存时校验；不会对外发送。成功后直接打开本单详情。</Notice>{renderFields(config().filter(field=>!(moduleId==='M21'&&form.sourceLines?.length&&field.key==='sourceId')))}{moduleId==='M21'&&invoiceSourcesEditor()}{error && <Notice tone="error">{error}</Notice>}</Modal>}
  {modal?.type === 'action' && selected && <Modal title={modal.label + ' · 本地演示'} wide onClose={() => closeForm({type:'detail',id:selected.id})} footer={<><button className="btn" onClick={() => closeForm({type:'detail',id:selected.id})}>返回详情</button><button className="btn primary" onClick={() => mutate(d => actFinance(d, moduleId, selected.id, modal.action, form, session), '演示：' + modal.label)}>确认演示处理</button></>}><p className="mono">{selected.id}</p>{renderFields(modal.fields)}{error && <Notice tone="error">{error}</Notice>}</Modal>}
  {modal?.type === 'detail' && !selected&&<Notice tone="warning">原业务单未找到，可能已恢复演示数据。<button className="btn" onClick={closeDetail}>返回本模块列表</button></Notice>}
  {modal?.type === 'detail' && selected && <Modal wide title={title + '详情 · ' + selected.id} onClose={closeDetail} footer={<button className="btn" onClick={closeDetail}>关闭详情</button>}>
   <Notice>本地演示记录，不是生产操作结果。实际经办留在时间线，账户归属不会因为点击办理而改变。</Notice>
   <div className="kv">{Object.entries(selected).filter(([k, v]) => v !== null && v !== undefined && typeof v !== 'object' && !['demo', 'id', 'module', 'source', 'key', 'confirmed', 'cancelled'].includes(k)).map(([k, v]) => <React.Fragment key={k}><span className="muted">{names[k] || k}</span><strong>{typeof v === 'number' && (k === 'coins' || k === 'refundedCoins' || ['M14', 'M17'].includes(moduleId) && ['amount', 'returned'].includes(k)) ? <span>{(v / 100).toFixed(2)} 广告币</span> : amountKeys.has(k) && typeof v === 'number' ? <Money value={v} /> : ['frontRate','ratePoints'].includes(k) ? (Number(v) / 100).toFixed(2) + ' 点' : typeof v === 'boolean' ? (v ? '是' : '否') : readableTime(reference(k, v))}</strong></React.Fragment>)}</div>
   <div className="toolbar">{selected.orderId&&sourceButton(selected.orderId,'原充值')}{selected.parentId&&sourceButton(selected.parentId,'原合同版本')}{selected.refundSourceSnapshot?.ref&&sourceButton(selected.refundSourceSnapshot.ref,'退款原来源')}{selected.walletId&&sourceButton(selected.walletId,'结算总账')}</div>
   {['M09','M15','M18','M19','M21'].includes(moduleId)&&<Section title="金额进度（各自独立）"><div className="grid3"><div>{moduleId==='M09'?'实际到账':moduleId==='M19'&&selected.type==='服务费'?'应收服务费':'申请 / 应付 / 应返'}<Money value={selected.amount||0}/></div><div>{moduleId==='M09'?'已分配':moduleId==='M21'?'已开票':moduleId==='M19'&&selected.type==='服务费'?'服务费已退':'已实付 / 已返'}<Money value={moduleId==='M19'&&selected.type==='服务费'?selected.returned||0:selected.allocated!==undefined&&moduleId==='M09'?selected.allocated:selected.issued??selected.paid??selected.returned??0}/></div><div>剩余未办<Money value={(selected.amount||0)-(moduleId==='M09'?selected.allocated||0:moduleId==='M21'?selected.issued||0:(selected.paid||0)+(selected.used||0)+(selected.returned||0))}/></div></div></Section>}
   {selected.supplierSnapshot&&<Section title="本单供应商业务资料快照"><dl className="kv">{[['name','供应商'],['agentName','代理商名称'],['agentId','代理商 ID'],['platformScope','平台范围'],['bankName','开户银行 / 支行'],['bankAccount','供应商银行账号'],['bankAddress','银行地址'],['recordVersion','资料版本']].map(([key,label])=><React.Fragment key={key}><dt>{label}</dt><dd>{selected.supplierSnapshot[key]||'未取得，不按主体资料推定'}</dd></React.Fragment>)}</dl><p className="muted">资料快照供核对；实际付款记录独立保存收款方与账号，不由此自动付款。</p></Section>}
   {selected.pricingSnapshot&&<Section title="原计价快照"><div className="grid3"><div>现金本金<Money value={selected.pricingSnapshot.amount}/></div><div>广告币 {(selected.pricingSnapshot.coins/100).toFixed(2)}</div><div>前返 {(selected.pricingSnapshot.frontRate/100).toFixed(2)} 点</div></div><p>{selected.pricingSnapshot.version||selected.pricingSnapshot.pricingVersion} · {selected.pricingSnapshot.confirmedBy||'原记录'} · {readableTime(selected.pricingSnapshot.confirmedAt)}</p></Section>}
   {selected.agreementSnapshot&&<Section title="财务约定快照"><p>{selected.agreementSnapshot.calculationBranch} · {selected.agreementSnapshot.calculationBasis||'见本单约定依据'}</p><p>约定人民币金额 <Money value={selected.agreementSnapshot.amount}/>；点数 {selected.agreementSnapshot.ratePoints===null?'未约定':(selected.agreementSnapshot.ratePoints/100).toFixed(2)+' 点'}；财务确认 {selected.agreementSnapshot.confirmedBy||'待确认'}</p><p>{selected.agreementSnapshot.reason}</p></Section>}
   {selected.refundSourceSnapshot&&<Section title="退款原备款来源"><p>{selected.refundSourceSnapshot.type} · {selected.refundSourceSnapshot.ref||selected.refundSourceSnapshot.id}</p><p>原来源形成现金 <Money value={selected.refundSourceSnapshot.cashDelta}/>；申请时来源剩余 <Money value={selected.refundSourceSnapshot.remaining}/></p><p>来源引用不会替代冻结时对当前总账、其他退款占用的再次核验。</p></Section>}
   {selected.payments?.length>0&&<Section title="逐笔实际返付 / 付款"><DataTable rows={selected.payments} columns={[{key:'occurredAt',label:'实际日期'},{key:'amount',label:'实际金额',render:r=><Money value={r.amount}/>},{key:'method',label:'方式 / 真实收款方',render:r=><>{r.method}<small className="block">{r.payee}</small></>},{key:'bankRef',label:'付款来源 / 结果编号',render:r=><>{r.paymentAccount||'内部用途转换'}<small className="block">{r.bankRef||'未发生银行付款'}</small></>},{key:'receivingBankAccount',label:'收款银行 / 账号',render:r=><>{r.receivingBankName||'非银行或未提供'}<small className="block mono">{r.receivingBankAccount||'—'}</small></>},{key:'evidence',label:'核对依据',render:r=><>{r.evidence}<small className="block">{r.accountVerification}</small></>},{key:'operator',label:'经办'}]}/></Section>}
   {selected.refundResults?.length>0&&<Section title="逐笔真实退币结果"><DataTable rows={selected.refundResults} columns={[{key:'occurredAt',label:'发生日期'},{key:'coins',label:'广告币',render:r=>(r.coins/100).toFixed(2)},{key:'cashRestored',label:'还原备款',render:r=><Money value={r.cashRestored}/>},{key:'debtReduced',label:'核销债务',render:r=><Money value={r.debtReduced}/>},{key:'requestId',label:'原请求 / 结果'},{key:'evidence',label:'凭证'}]}/></Section>}
   {selected.sourceLines?.length>0&&<Section title="申请票额的来源分配"><DataTable rows={selected.sourceLines.map((r,i)=>({...r,id:String(i)}))} columns={[{key:'sourceType',label:'依据类型'},{key:'sourceId',label:'来源原单',render:r=>sourceButton(r.sourceId)},{key:'sourceVersion',label:'合同版本',render:r=>r.sourceVersion||'收款分配'},{key:'amount',label:'本次占用金额',render:r=><Money value={r.amount}/>}]}/></Section>}
   {selected.coverageSources?.length>0&&<Section title="原始来源覆盖"><DataTable rows={selected.coverageSources.map((r,i)=>({...r,id:String(i)}))} columns={[{key:'sourceType',label:'来源类型'},{key:'sourceRef',label:'批次 / 凭证引用'},{key:'expectedCount',label:'应核笔数'},{key:'checkedCount',label:'已核笔数'}]}/></Section>}
   {selected.deliveryMatches?.length>0&&<Section title="已交付主单的子账户匹配"><DataTable rows={selected.deliveryMatches} columns={[{key:'externalId',label:'子账户完整 ID',render:r=><button className="text-btn" onClick={()=>openAccount(r.accountId)}>{r.externalId}</button>},{key:'amount',label:'匹配本金',render:r=><Money value={r.amount}/>},{key:'matchRef',label:'原交付明细'},{key:'evidence',label:'核对依据'},{key:'operator',label:'登记人'}]}/><Notice>仅补主单关联，不再扣款或把金额重记为子账户余额。</Notice></Section>}
   {selected.creditAlloc?.length>0&&<Section title="本次信用资金来源"><DataTable rows={selected.creditAlloc.map(x=>({...x,id:x.creditId}))} columns={[{key:'creditId',label:'授信原单',render:r=>sourceButton(r.creditId)},{key:'amount',label:'支用本金',render:r=><Money value={r.amount}/>},{key:'unpaid',label:'尚未偿还',render:r=><Money value={r.unpaid||0}/>}]}/></Section>}
   {selected.approvalSnapshot&&<Section title="批准版本快照"><p>版本 v{selected.approvalSnapshot.version} · 批准人 {selected.approvalSnapshot.approvedBy} · 上限 <Money value={selected.approvalSnapshot.amount}/></p><p>支用截止 {selected.approvalSnapshot.validUntil}；应还 {selected.approvalSnapshot.dueAt}</p><p>{selected.approvalSnapshot.repaymentTerms}</p></Section>}
   {selected.balanceSnapshot&&<Section title="本次对账余额快照"><p className="muted">本地演示事件全量复算，手工来源截止日另存；历史生产期间重放未接入。</p><DataTable rows={selected.balanceSnapshot.wallets.map(r=>({...r,id:r.walletId}))} columns={[{key:'walletId',label:'结算方',render:r=>walletName(r.walletId)},{key:'openingCash',label:'演示期初',render:r=><Money value={r.openingCash}/>},{key:'cash',label:'复核时现金',render:r=><Money value={r.cash}/>},{key:'frozen',label:'冻结',render:r=><Money value={r.frozen}/>},{key:'debt',label:'债务',render:r=><Money value={r.debt}/>} ]}/></Section>}
   {moduleId==='M20'&&<Section title="版本与关联票据"><div className="toolbar">{(f.records.M20||[]).filter(r=>r.contractNo===selected.contractNo).map(r=><button className="btn" key={r.id} disabled={r.id===selected.id} onClick={()=>openRecord(r.id)}>v{r.version} · {r.status}</button>)}</div>{(f.records.M21||[]).filter(r=>(r.sourceLines||[{sourceId:r.sourceId}]).some(line=>line.sourceId===selected.id)).map(r=><p key={r.id}>{sourceButton(r.id,'本版本票据')} <Money value={r.issued||0}/></p>)}</Section>}
   {moduleId === 'M16' && <Notice>冲正仅演示未使用、无冻结、目标无后续资金依赖的整笔反向。有下游使用时保留原账，提示财务更正，不自动恢复来源余额。</Notice>}
   {moduleId === 'M14' && <Notice>退币按原计价累计还原本金；演示按原现金/信用比例分摊，信用部分按原授信先后核销。旧特殊分支与返利追回需要另核验，不使用现返点。</Notice>}
   {selected.accountId && <button className="btn" onClick={() => openAccount(selected.accountId)}>查看完整广告账户</button>}
   {selected.serviceSourceSnapshot&&<Section title="独立服务费原收款来源">{sourceButton(selected.serviceSourceSnapshot.receiptId,'原服务费收款')}<p>本单关联独立服务费 <Money value={selected.serviceSourceSnapshot.amount}/>；原流水 {selected.serviceSourceSnapshot.bankRef}</p></Section>}
   {selected.sourceVersions?.length>0&&<Section title="退款资料更正前版本"><DataTable rows={selected.sourceVersions.map((r,i)=>({...r,id:String(i)}))} columns={[{key:'refundSourceId',label:'原资金来源'},{key:'payee',label:'原收款人'},{key:'receivingBankAccount',label:'原收款账号'},{key:'approvedBy',label:'原批准人'},{key:'actor',label:'更正经办'},{key:'at',label:'更正时间',render:r=>readableTime(r.at)}]}/></Section>}
   {selected.evidenceVersions?.length>0&&<Section title="待确认收款的原资料版本"><DataTable rows={selected.evidenceVersions.map((r,i)=>({...r,id:String(i)}))} columns={[{key:'evidence',label:'原凭证说明'},{key:'occurredAt',label:'原发生日'},{key:'payerAccount',label:'原付款账号'},{key:'actor',label:'补齐经办'},{key:'at',label:'时间',render:r=>readableTime(r.at)}]}/></Section>}
   {moduleId === 'M10' && <><div className="toolbar">{[['M09','登记 / 分配收款'],['M11','信用与债务'],['M12','充值办理'],['M16','渠道转账']].map(([id,label])=><button className="btn" key={id} onClick={()=>go(id,{walletId:selected.id,returnTo:{moduleId:'M10',recordId:selected.id}})}>{label}</button>)}</div><p>可用现金 <Money value={availableCash(selected)} />；可用有效信用 <Money value={availableCredit(f, selected.id)} />。</p><DataTable rows={f.events.filter(e => e.walletId === selected.id)} columns={[{
          key: 'type',
          label: '事实'
        }, {
          key: 'cashDelta',
          label: '现金变化',
          render: r => <Money value={r.cashDelta} />
        }, {
          key: 'debtDelta',
          label: '欠款变化',
          render: r => <Money value={r.debtDelta} />
        }, {
          key: 'ref',
          label: '原单',render:r=>sourceButton(r.ref)
        }]} /></>}
   {moduleId==='M10'&&<Section title="授信与未偿期账"><DataTable rows={f.credits.filter(c=>c.walletId===selected.id)} columns={[{key:'id',label:'授信原单',render:r=>sourceButton(r.id)},{key:'type',label:'信用类型'},{key:'amount',label:'批准上限',render:r=><Money value={r.amount}/>},{key:'used',label:'未偿本金',render:r=><Money value={r.used}/>},{key:'inflight',label:'在途',render:r=><Money value={r.inflight}/>},{key:'dueAt',label:'应还日'},{key:'repaymentTerms',label:'还款约定'},{key:'status',label:'状态'}]}/></Section>}
   {selected.allocations?.length > 0 && <Section title="逐笔分配"><DataTable rows={selected.allocations.map((a, i) => ({
          ...a,
          id: a.id || String(i)
        }))} columns={moduleId==='M18'?[{key:'orderId',label:'已完成交付',render:r=>sourceButton(r.orderId)},{key:'amount',label:'分配金额',render:r=><Money value={r.amount}/>},{key:'operator',label:'分配经办'},{key:'at',label:'分配时间',render:r=>readableTime(r.at)}]:[{
          key: 'walletId',
          label: '资金方',
          render: r => walletName(r.walletId)
        }, {
          key: 'orderId',
          label: '交付单'
        }, {
          key: 'amount',
          label: '分配金额',
          render: r => <Money value={r.amount} />
        }, {
          key: 'purpose',
          label: '用途'
        }, {
          key: 'repaid',
          label: '核销欠款',
          render: r => <Money value={r.repaid || 0} />
        }, {
          key:'paymentRelationship',label:'付款关系',render:r=><>{r.paymentRelationship||'旧演示资料未登记'}<small className="block">{r.actualPayer}</small></>
        }, {
          key:'thirdPartyBasis',label:'代付关系依据',render:r=>r.thirdPartyBasis||'—'
        }, {
          key: 'evidence',
          label: '依据'
        }]} /></Section>}
   {selected.bills?.length > 0 && <Section title="实际票据"><DataTable rows={selected.bills.map((b, i) => ({
          ...b,
          id: String(i)
        }))} columns={[{
          key: 'number',
          label: '票号'
        }, {
          key: 'amount',
          label: '实际票额',
          render: r => <Money value={r.amount} />
        }, {
          key:'issuedAt',label:'实际开票日',render:r=>r.issuedAt||'旧演示未记录'
        }, {
          key:'attachmentRef',label:'票据原件引用'
        }, {
          key: 'evidence',
          label: '凭证说明'
        }]} /></Section>}
   {selected.issues?.length > 0 && <Notice tone="warning">{selected.issues.map((i, n) => <p key={n}>{i}</p>)}</Notice>}
   <Section title="下一步办理">{actions(selected).length ? actionButtons(selected) : <p className="muted">当前没有可直接执行的动作。已完成事实保留；后续退币、退款、分类或对账通过相应模块另建关联业务。</p>}</Section>
   <Section title="本单流转时间线"><div className="timeline">{detailEvents.length ? detailEvents.map((e, i) => <div key={i}><strong>{e.text}</strong><p className="muted">{e.actor} · {e.role} · {readableTime(e.at)}</p></div>) : <p>演示总账由载入场景建立；根审计记录保留实际操作者。</p>}</div></Section>{error && <Notice tone="error">{error}</Notice>}
  </Modal>}
 </div>;
}
