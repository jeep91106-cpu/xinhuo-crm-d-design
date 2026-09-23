export const financeTitles = {
  M09: '收款与认领分配',
  M10: '客户与渠道资金总账',
  M11: '授信与欠款',
  M12: '充值办理与事实补录',
  M13: '续费与业务分类',
  M14: '平台退币',
  M15: '客户现金退款',
  M16: '渠道资金转账',
  M17: '广告账户余额转户',
  M18: '公司与供应商往来',
  M19: '服务费与前后返',
  M20: '合同与版本',
  M21: '开票与票据',
  M22: '内部对账与尾差'
};
export function cents(value, {
  allowZero = false
} = {}) {
  const s = String(value ?? '').trim();
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw Error('请输入精确到分的金额；本演示不截断更多小数。');
  const [a, b = ''] = s.split('.');
  const exact = BigInt(a) * 100n + BigInt(b.padEnd(2, '0'));
  if (exact > BigInt(Number.MAX_SAFE_INTEGER) || !allowZero && exact === 0n) throw Error('金额必须大于0且在有效范围内。');
  return Number(exact);
}
function portion(a, b, divisor, round = false) {
  const top = BigInt(a) * BigInt(b),
    bottom = BigInt(divisor);
  const n = Number((top + (round ? bottom / 2n : 0n)) / bottom);
  must(Number.isSafeInteger(n), '金额计算超过安全范围。');
  return n;
}
const uid = p => p + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
const now = () => new Date().toISOString();
function must(test, message) {
  if (!test) throw Error(message);
}
function date(value, label) {
  const text = String(value || '');
  must(/^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(text)) && new Date(text).toISOString().slice(0, 10) === text, label + '必须是有效日期。');
  return text;
}
function text(value) { return String(value ?? '').trim(); }
function paymentDetails(f, row, p, s, amount, module) {
  const method = text(p.method || row.method), payee = text(p.payee || row.payee);
  must(method && payee && text(p.evidence), '实际付款方式、收款人及凭证必填。');
  const internal = ['转备款', '抵欠款'].includes(method);
  must(['银行','银行转账（演示）','银行付款','其他有据方式','其他有据方式（演示）','转备款','抵欠款'].includes(method),'请选择受支持的实际付款方式。');
  must(!internal || module==='M19'&&row.type==='后返','仅后返可有据转换为备款或抵欠款，现金退款不能冒用内部转换。');
  const details = {id:uid('PAY'), amount, method, payee, occurredAt:date(p.occurredAt, '实际付款日期'), evidence:text(p.evidence), operator:s.name, registeredAt:now(), module, recordId:row.id};
  if (!internal) {
    must(text(p.paymentAccount) && text(p.bankRef), '公司实际付款账户和付款流水/结果编号必填。');
    Object.assign(details, {paymentAccount:text(p.paymentAccount), bankRef:text(p.bankRef), receivingBankName:text(p.receivingBankName || row.receivingBankName), receivingBankAccount:text(p.receivingBankAccount || row.receivingBankAccount), accountVerification:text(Object.hasOwn(p,'accountVerification')?p.accountVerification:row.accountVerification)});
    if (method.includes('银行')) must(details.receivingBankName && details.receivingBankAccount && details.accountVerification, '银行付款须保存收款银行、账号及收款关系核对依据；不自动沿用原代付账户。');
    must(!Object.values(f.records).flatMap(list => list).flatMap(r => r.payments || []).some(x => x.paymentAccount === details.paymentAccount && x.bankRef === details.bankRef), '同一公司付款账户及结果编号已登记，不能重复记实际付款。');
  }
  return details;
}
function savePayment(row, payment) { row.payments ??= []; row.payments.push(payment); }
export function refundableSources(f, walletId, excludeId = null) {
  return f.events.filter(e => e.walletId === walletId && e.cashDelta > 0).map(e => {
    const occupied = (f.records.M15 || []).filter(r => r.id !== excludeId && r.refundSourceId === e.id).reduce((sum,r) => sum + (['失败','取消','部分付 / 余款明确失败'].includes(r.status) ? r.paid || 0 : r.amount), 0);
    return {...e, remaining:Math.max(0,e.cashDelta-occupied)};
  });
}
export function financeRecordRoute(f, id) {
  if (f.receipts.some(r => r.id === id)) return 'M09';
  if (f.wallets.some(r => r.id === id)) return 'M10';
  if (f.credits.some(r => r.id === id)) return 'M11';
  if (f.orders.some(r => r.id === id)) return 'M12';
  return Object.keys(f.records).find(module => f.records[module].some(r => r.id === id)) || null;
}
export function initFinance(db) {
  db.finance ??= {};
  for (const k of ['wallets', 'receipts', 'orders', 'events', 'credits']) db.finance[k] ??= [];
  db.finance.records ??= {};
  return db.finance;
}
function writablePeriod(f) {
  const period = new Date().toISOString().slice(0, 7);
  must(!(f.records.M22 || []).some(r => r.type === '期间对账' && r.period === period && r.status === '已封存'), '当前入账期间已封存，请先在原对账单有据重开；本地演示不允许覆盖封存事实。');
}
function role(s, roles) {
  must(roles.includes(s.role), '当前角色“' + s.role + '”不能办理此动作，请切换到 ' + roles.join(' / ') + '。');
}
const business = ['商务', '渠道商务', '商务主管'];
const finance = ['财务'];
const recordFields={
  M13:['orderId','collectionClass','accountClass','incomeClass','legacySettlementRef','firstOrderRef','incomeRuleVersion','reason'],
  M14:['orderId','amount','reason'],
  M15:['walletId','refundSourceId','amount','payee','method','receivingBankName','receivingBankAccount','accountVerification','reason'],
  M16:['walletId','targetWalletId','amount','reason'],
  M17:['sourceAccountId','targetAccountId','amount','evidence'],
  M18:['supplierId','type','orderId','amount','evidence'],
  M19:['walletId','type','orderId','serviceSourceReceiptId','amount','rate','calculationBasis','calculationBranch','reason'],
  M20:['contractNo','subjectId','walletId','amount','validFrom','validUntil','terms','evidence'],
  M21:['walletId','sourceType','sourceId','sourceLines','title','taxNo','amount','basis'],
  M22:['type','period','receivable','actual','cutoffAt','responsible','reason']
};
function wallet(f, id) {
  const w = f.wallets.find(x => x.id === id);
  must(w, '请选择有效的演示结算方。');
  return w;
}
function record(f, module, id) {
  const x = (f.records[module] || []).find(x => x.id === id);
  must(x, '记录不存在。');
  return x;
}
function log(row, message, s) {
  row.events ??= [];
  row.events.push({
    at: now(),
    actor: s.name,
    role: s.role,
    text: message
  });
}
function event(f, key, type, {
  walletId = null,
  cash = 0,
  debt = 0,
  service = 0,
  bank = 0,
  ref = '',
  note = ''
} = {}) {
  if (f.events.some(e => e.key === key)) return false;
  f.events.push({
    id: uid('EV'),
    key,
    type,
    walletId,
    cashDelta: cash,
    debtDelta: debt,
    serviceDelta: service,
    bankDelta: bank,
    ref,
    note,
    at: now(),
    demo: true
  });
  return true;
}
export function availableCash(w) {
  return (w.cash || 0) - (w.frozen || 0);
}
export function availableCredit(f, wid) {
  return f.credits.filter(c => c.walletId === wid && c.status === '有效' && c.validUntil >= new Date().toISOString().slice(0, 10)).reduce((n, c) => n + Math.max(0, c.amount - (c.used || 0) - (c.inflight || 0) - (c.retired || 0)), 0);
}
export function moneySummary(f) {
  return {
    cash: f.wallets.reduce((s, w) => s + w.cash, 0),
    frozen: f.wallets.reduce((s, w) => s + w.frozen, 0),
    debt: f.wallets.reduce((s, w) => s + w.debt, 0),
    bank: f.events.reduce((s, e) => s + (e.bankDelta || 0), 0)
  };
}
function ensureWallet(db, customerId, kind) {
  const f = initFinance(db);
  let w = f.wallets.find(w => w.customerId === customerId);
  if (w) return w;
  const c = db.customers.find(c => c.id === customerId);
  must(c, '客户资料不存在。');
  w = {
    id: uid('W'),
    customerId,
    name: c.name,
    kind: kind || '普通演示结算方',
    cash: 0,
    frozen: 0,
    creditLimit: 0,
    debt: 0,
    service: 0,
    openingCash: 0,
    demo: true
  };
  f.wallets.push(w);
  return w;
}
export function loadFinanceDemo(db, s) {
  const f = initFinance(db);
  writablePeriod(f);
  must(!f.demoLoaded, '演示资金场景已经载入，不重复增加余额。');
  for (const [cid, kind, amount] of [['1115', '普通演示结算方', 5000000], ['1098', '渠道演示结算方', 10000000]]) {
    if (!db.customers.some(c => c.id === cid)) continue;
    const w = ensureWallet(db, cid, kind);
    w.cash += amount;
    w.openingCash += amount;
    event(f, 'SEED:' + w.id, '演示期初', {
      walletId: w.id,
      cash: amount,
      note: '本地评审场景，不是历史生产余额。'
    });
  }
  f.demoLoaded = true;
  f.loadedBy = s.name;
  return '已载入明确标记的演示期初资金。';
}
function payDebt(f, w, amount) {
  let left = amount;
  for (const o of f.orders.filter(o => o.walletId === w.id && o.status === '完成')) {
    for (const a of o.creditAlloc || []) {
      const paid = Math.min(left, a.unpaid || 0);
      if (!paid) continue;
      a.unpaid -= paid;
      left -= paid;
      const c = f.credits.find(c => c.id === a.creditId);
      if (c) {
        c.used -= paid;
        if (c.type !== '常规循环') c.retired = (c.retired || 0) + paid;
      }
      w.debt -= paid;
      if (!left) return amount;
    }
    const exceptional = Math.min(left, o.exceptionDebt || 0);
    if (exceptional) {
      o.exceptionDebt -= exceptional;
      w.exceptionDebt -= exceptional;
      w.debt -= exceptional;
      left -= exceptional;
    }
    if (!left) return amount;
  }
  return amount - left;
}
function reserve(f, o) {
  const w = wallet(f, o.walletId);
  must(o.status === '待办理', '只有已派单待办理的充值可以冻结。');
  must(o.financePriced, '请先由财务确认本单前返及计价快照；0点也须明确确认。');
  must(!f.orders.some(x => x.id !== o.id && x.accountId === o.accountId && ['未知待核实', '成功待入账', '执行中'].includes(x.status)), '此账户有未知或未入账充值，请先核实原单，不能用新单绕过。');
  let remaining = o.amount;
  const cash = Math.min(availableCash(w), remaining);
  remaining -= cash;
  const allocations = [];
  for (const c of f.credits.filter(c => c.walletId === w.id && c.status === '有效' && c.validUntil >= new Date().toISOString().slice(0, 10))) {
    const part = Math.min(remaining, Math.max(0, c.amount - c.used - c.inflight - c.retired));
    if (part) {
      allocations.push({
        creditId: c.id,
        amount: part,
        unpaid: 0
      });
      remaining -= part;
    }
    if (!remaining) break;
  }
  must(remaining === 0, '可用演示备款及有效授信不足。');
  w.frozen += cash;
  o.cashReserved = cash;
  o.creditAlloc = allocations;
  for (const a of allocations) f.credits.find(c => c.id === a.creditId).inflight += a.amount;
  o.status = '资金冻结';
}
function release(f, o) {
  const w = wallet(f, o.walletId);
  w.frozen -= o.cashReserved || 0;
  for (const a of o.creditAlloc || []) {
    const c = f.credits.find(c => c.id === a.creditId);
    if (c) c.inflight -= a.amount;
  }
  o.cashReserved = 0;
  o.creditAlloc = [];
}
function postRecharge(f, o) {
  if (o.status === '完成') return;
  must(o.status === '成功待入账', '只有已确认外部成功的充值可以补入账。');
  const w = wallet(f, o.walletId);
  const cash = o.cashReserved || 0;
  const credit = (o.creditAlloc || []).reduce((n, a) => n + a.amount, 0);
  must(w.frozen >= cash && w.cash >= cash, '冻结资金不一致，请进入对账。');
  if (!event(f, 'RECHARGE:' + o.id, '充值成功入账', {
    walletId: w.id,
    cash: -cash,
    debt: credit,
    ref: o.id,
    note: '外部成功事实 ' + o.evidence
  })) return;
  w.cash -= cash;
  w.frozen -= cash;
  w.debt += credit;
  for (const a of o.creditAlloc || []) {
    const c = f.credits.find(c => c.id === a.creditId);
    c.inflight -= a.amount;
    c.used += a.amount;
    a.unpaid = a.amount;
  }
  o.status = '完成';
  o.postedAt = now();
  o.cashUsed = cash;
  o.cashReserved = 0;
  o.refundedCoins = 0;
  o.refundedCash = 0;
  o.refundCredits = {};
}
export function platformAvailable(f, accountId) {
  let n = f.orders.filter(o => o.accountId === accountId && o.status === '完成').reduce((s, o) => s + o.coins - (o.refundedCoins || 0), 0);
  for (const r of f.records.M17 || []) {
    if (['待转入', '部分完成待补偿', '未知', '完成'].includes(r.status) && r.sourceAccountId === accountId) n -= r.amount;
    if (r.status === '完成' && r.targetAccountId === accountId) n += r.amount;
  }
  return n;
}
export function checkPlatformTransfer(db, sourceId, targetId) {
  const a = db.accounts.find(x => x.id === sourceId),
    b = db.accounts.find(x => x.id === targetId);
  must(a && b && a.id !== b.id, '请选择两个不同广告账户。');
  must(a.customerId === b.customerId, '平台转户仅限同一结算客户演示范围；不能借渠道权限跨客户。');
  must(a.businessOwnerId && b.businessOwnerId, '两端商务归属尚未核验。未知归属不能视作同一商务，请先通过账户交接模块设置本地演示归属。');
  must(a.businessOwnerId === b.businessOwnerId, '两端必须同一归属商务，协办授权不能绕过。');
  must(a.productCode && a.productCode === b.productCode, '本演示仅承接已知同产品币种的转户，跨产品换算待核验。');
  return [a, b];
}
export function reconciliation(f) {
  const issues = [];
  for (const w of f.wallets) {
    const cash = f.events.filter(e => e.walletId === w.id).reduce((s, e) => s + e.cashDelta, 0);
    const debt = f.events.filter(e => e.walletId === w.id).reduce((s, e) => s + e.debtDelta, 0);
    const service = f.events.filter(e => e.walletId === w.id).reduce((s, e) => s + e.serviceDelta, 0);
    const frozen = f.orders.filter(o => o.walletId === w.id && ['资金冻结', '执行中', '未知待核实', '成功待入账'].includes(o.status)).reduce((s, o) => s + (o.cashReserved || 0), 0) + (f.records.M15 || []).filter(r => r.walletId === w.id).reduce((s, r) => s + (r.frozen || 0), 0);
    if (cash !== w.cash || debt !== w.debt || service !== (w.service || 0) || frozen !== w.frozen) issues.push(w.name + ' 的余额/冻结与事件不一致');
    if (availableCash(w) < 0) issues.push(w.name + ' 的冻结超过备款');
  }
  for (const o of f.orders) if (['未知待核实', '成功待入账', '执行中'].includes(o.status)) issues.push(o.id + '：' + o.status);
  for (const module of ['M14', 'M15', 'M17']) for (const r of f.records[module] || []) if (['未知', '部分完成待补偿', '已退待入账'].includes(r.status)) issues.push(r.id + '：' + r.status);
  for (const r of f.receipts) if (r.confirmed && r.allocated < r.amount) issues.push(r.id + '：确认款项尚有未分配余额');
  return issues;
}
export function createFinance(db, module, p, s) {
  const f = initFinance(db);
  writablePeriod(f);
  if (module === 'M10') {
    role(s, finance);
    must(!f.wallets.some(w => w.customerId === p.customerId), '该客户已有一个逻辑演示总账。');
    must(p.kind !== '渠道演示结算方' || db.customers.find(c => c.id === p.customerId)?.kind === '渠道', '渠道演示总账只能基于已核验渠道客户建立；未知客户类型不能赋予渠道权限。');
    return ensureWallet(db, p.customerId, p.kind).id;
  }
  if (module === 'M09') {
    role(s, [...business, '财务']);
    must(p.sourceAccount?.trim() && p.bankRef?.trim() && p.payer?.trim(), '来源账户、流水号和实际付款方必填。');
    must(!f.receipts.some(r => r.sourceAccount === p.sourceAccount.trim() && r.bankRef === p.bankRef.trim()), '来源账户＋流水号已存在，不能重复登记。');
    const r = {
      id: uid('RC'),
      sourceAccount: p.sourceAccount.trim(),
      bankRef: p.bankRef.trim(),
      payer: p.payer.trim(),
      payerAccount: text(p.payerAccount),
      receivingBankName: text(p.receivingBankName),
      receivableRef: text(p.receivableRef),
      amount: cents(p.amount),
      occurredAt: date(p.occurredAt, '到账发生日期'),
      evidence: p.evidence,
      status: '待财务确认',
      confirmed: false,
      allocated: 0,
      allocations: [],
      events: [],
      createdAt: now(),
      demo: true
    };
    f.receipts.push(r);
    log(r, '登记凭证；未增加资金', s);
    return r.id;
  }
  if (module === 'M11') {
    role(s, business);
    wallet(f, p.walletId);
    must(p.validUntil && p.dueAt && p.reason?.trim(), '支用期限、应还日期及用途必填。');
    date(p.validUntil, '支用截止日'); date(p.dueAt, '应还日期');
    must(text(p.repaymentTerms), '请填写本次独立约定的还款安排。');
    const c = {
      id: uid('CR'),
      walletId: p.walletId,
      type: p.type,
      amount: cents(p.amount),
      validUntil: p.validUntil,
      dueAt: p.dueAt,
      reason: p.reason,
      repaymentTerms: text(p.repaymentTerms),
      moneyUnit: 'CNY',
      version: 1,
      status: '待Boss审批',
      used: 0,
      inflight: 0,
      retired: 0,
      events: [],
      demo: true
    };
    f.credits.push(c);
    log(c, '提交授信申请，不产生可用信用', s);
    return c.id;
  }
  if (module === 'M12') {
    role(s, [...business, '财务']);
    const fundingWallet = wallet(f, p.walletId);
    const account = db.accounts.find(a => a.id === p.accountId);
    const supplement = p.mode === '已发生补录';
    if(supplement&&p.supplierId) {
      must(db.suppliers.some(x=>x.id===p.supplierId),'请选择有效的实际交付供应商。');
      must(!account?.supplierId || account.supplierId === p.supplierId, '实际交付供应商与所选广告账户的供应商不一致，请改选供应商或先核对账户资料，不会自动覆盖本次选择。');
    }
    must(account || supplement && p.actualTarget?.trim(), '新执行必须选真实账户；渠道补录需要真实交付对象说明。');
    if (account && !supplement && s.role === '商务') must(account.businessOwnerId && account.businessOwnerId === s.businessId, '普通商务只能提交已明确归属本人的演示账户；未知归属先核验。');
    if (account && !supplement) must(account.customerId === fundingWallet.customerId || fundingWallet.kind === '渠道演示结算方' && ['渠道商务', '财务'].includes(s.role), '此账户不在所选普通结算方范围；渠道出资须选择渠道总账并有渠道办理权限。');
    const amount = cents(p.amount);
    must(!f.orders.some(o => o.accountId === p.accountId && ['未知待核实', '成功待入账', '执行中'].includes(o.status)), '此账户有未知或成功待同步原单，请先处理，不创建重复充值。');
    if (supplement) {
      must(s.role === '财务', '已发生资金补录由财务演示核实后记账。');
      must(p.evidence?.trim() && p.occurredAt && p.actualTarget?.trim(), '补录需要发生时间、交付对象和凭证。');
    }
    const o = {
      id: uid('CH'),
      accountId: p.accountId || null,
      accountName: account?.name || p.actualTarget,
      supplierId: account?.supplierId || p.supplierId || null,
      supplierSnapshot: (account?.supplierId||p.supplierId) ? structuredClone(db.suppliers.find(x=>x.id===(account?.supplierId||p.supplierId)) || {id:account?.supplierId||p.supplierId}) : null,
      moneyUnit:'CNY', coinUnit:'广告币（两位小数演示）',
      walletId: p.walletId,
      amount,
      coins: amount,
      frontRate: 0,
      financePriced: false,
      pricingVersion: '演示现金1:1 / 待财务计价',
      status: supplement ? '已发生待核实' : '待派单',
      mode: p.mode,
      actualTarget: p.actualTarget,
      evidence: p.evidence,
      occurredAt: p.occurredAt,
      ownerId: account?.businessOwnerId || null,
      operator: s.name,
      submittedBy: s.name,
      events: [],
      createdAt: now(),
      demo: true
    };
    f.orders.push(o);
    log(o, supplement ? '登记已发生事实，不调用平台' : '提交充值，等待媒介主管派单', s);
    return o.id;
  }
  const id = uid(module);
  const r = {
    id,
    module,
    createdAt: now(),
    events: [],
    demo: true,
    ...Object.fromEntries((recordFields[module]||[]).filter(key=>p[key]!==undefined&&!(module==='M22'&&p.type!=='尾差处理'&&['receivable','actual'].includes(key))).map(key=>[key,p[key]]))
  };
  for (const k of ['amount', 'receivable', 'actual']) if (r[k] !== undefined && r[k] !== '') r[k] = cents(r[k], {
    allowZero: k !== 'amount'
  });
  delete r.submit;
  if (module === 'M13') {
    role(s, [...business, '财务']);
    must(f.orders.some(o => o.id === p.orderId), '请选择原充值业务。');
    must(p.reason?.trim(), '分类依据必填。');
    must(['首充','首续','N续'].includes(p.collectionClass) && ['新开','续费'].includes(p.accountClass) && ['首单','首续','续费','待核算确认'].includes(p.incomeClass), '三种分类须分别选择有效值。');
    r.orderSnapshot = structuredClone(f.orders.find(o=>o.id===p.orderId));
    r.status = '待财务确认';
    r.version = (f.records.M13 || []).filter(x => x.orderId === p.orderId).length + 1;
  } else if (module === 'M14') {
    role(s, business);
    const o = f.orders.find(o => o.id === p.orderId && o.status === '完成');
    must(o, '请选择已入账充值来源。');
    const occupied = (f.records.M14 || []).filter(x => x.orderId === o.id && !['完成', '失败', '取消'].includes(x.status)).reduce((n, x) => n + x.amount - (x.returned || 0), 0);
    if (o.accountId) must(r.amount <= platformAvailable(f, o.accountId), '账户本地演示平台余额不足，已经转出的广告币不能再次退回');
    must(r.amount <= o.coins - (o.refundedCoins || 0) - occupied, '超出原充值尚可退的演示广告币数量。');
    r.walletId = o.walletId;
    r.accountId = o.accountId;
    r.pricingSnapshot = structuredClone(o.pricingSnapshot || {amount:o.amount,coins:o.coins,frontRate:o.frontRate,pricingVersion:o.pricingVersion});
    r.sourceCash = o.cashUsed || 0;
    r.sourceCredit = (o.creditAlloc || []).reduce((n,a)=>n+a.amount,0);
    r.status = '待媒介办理';
    r.returned = 0;
  } else if (module === 'M15') {
    role(s, business);
    wallet(f, p.walletId);
    must(p.payee?.trim() && p.method?.trim() && p.reason?.trim(), '实际收款方、返款方式和原款依据必填。');
    const source = refundableSources(f,p.walletId).find(e=>e.id===p.refundSourceId);
    must(source && r.amount<=source.remaining, '请选择本结算方足额且未被其他退款占用的原备款来源。');
    r.refundSourceSnapshot = structuredClone(source);
    if (p.method.includes('银行')) must(text(p.receivingBankName)&&text(p.receivingBankAccount)&&text(p.accountVerification), '银行退款须填写收款银行、账号及新收款关系核对依据。');
    r.status = '待审批';
    r.paid = 0;
    r.frozen = 0;
  } else if (module === 'M16') {
    role(s, ['渠道商务']);
    const a = wallet(f, p.walletId),
      b = wallet(f, p.targetWalletId);
    must(a.kind === '渠道演示结算方', '来源必须是渠道演示总账。');
    must(a.id !== b.id, '源目标结算方不能相同。');
    must(p.reason?.trim(), '转账依据必填。');
    must(r.amount <= availableCash(a), '来源可用备款不足，不能把未用授信当现金。');
    r.moneyUnit='CNY'; r.fundAttribute='已确认未占用现金'; r.pricingVersion='同单位等额转账演示 v1';
    r.status = '待财务办理';
  } else if (module === 'M17') {
    role(s, [...business, '充值媒介']);
    checkPlatformTransfer(db, p.sourceAccountId, p.targetAccountId);
    must(p.evidence?.trim(), '请登记产品办理能力及演示依据。');
    must(r.amount <= platformAvailable(f, p.sourceAccountId), '本地演示平台余额不足；不会使用未核验生产余额。');
    r.sourceSnapshot=structuredClone(db.accounts.find(a=>a.id===p.sourceAccountId));
    r.targetSnapshot=structuredClone(db.accounts.find(a=>a.id===p.targetAccountId));
    r.status = '待媒介办理';
  } else if (module === 'M18') {
    role(s, finance);
    must(db.suppliers.some(x => x.id === p.supplierId) && p.evidence?.trim(), '供应商及付款依据必填。');
    must(['供应商预存','关联业务付款'].includes(p.type), '请选择有效供应商付款用途。');
    if (p.type==='关联业务付款') must(f.orders.some(o=>o.id===p.orderId&&(o.supplierId||db.accounts.find(a=>a.id===o.accountId)?.supplierId)===p.supplierId), '关联付款须选择该供应商的原充值业务。');
    r.supplierSnapshot=structuredClone(db.suppliers.find(x=>x.id===p.supplierId));
    r.status = '待付款';
    r.paid = 0;
    r.allocated = 0;
  } else if (module === 'M19') {
    role(s, finance);
    wallet(f, p.walletId);
    must(p.reason?.trim(), '计费或返付约定依据必填。');
    must(['服务费','后返'].includes(p.type), '请选择服务费或后返。');
    if (p.orderId) must(f.orders.some(o=>o.id===p.orderId&&o.walletId===p.walletId), '费用原业务必须属于所选结算方。');
    if (p.serviceSourceReceiptId) {
      must(p.type==='服务费','独立服务费来源只用于服务费业务。');
      const source=f.receipts.find(q=>q.id===p.serviceSourceReceiptId&&q.confirmed);
      const cap=source?.allocations.filter(a=>a.walletId===p.walletId&&a.purpose==='独立服务费').reduce((n,a)=>n+a.amount,0)||0;
      const used=(f.records.M19||[]).filter(x=>x.serviceSourceReceiptId===p.serviceSourceReceiptId&&x.walletId===p.walletId).reduce((n,x)=>n+x.amount,0);
      must(r.amount<=cap-used,'超过该收款已确认独立服务费的可关联金额。');
      r.serviceSourceSnapshot={receiptId:source.id,bankRef:source.bankRef,walletId:p.walletId,amount:r.amount,sourceAllocations:structuredClone(source.allocations.filter(a=>a.walletId===p.walletId&&a.purpose==='独立服务费'))};
    }
    if (p.rate!==undefined&&p.rate!=='') r.ratePoints=cents(p.rate,{allowZero:true});
    r.moneyUnit='CNY'; r.calculationBranch=p.calculationBranch || '按已确认人民币约定录入';
    r.agreementSnapshot={amount:r.amount,ratePoints:r.ratePoints ?? null,orderId:p.orderId||null,calculationBasis:text(p.calculationBasis),calculationBranch:r.calculationBranch,reason:p.reason,confirmedBy:null};
    r.status = '待财务确认';
    r.paid = 0;
    r.used = 0;
  } else if (module === 'M20') {
    role(s, [...business, '财务']);
    must(db.subjects.some(x => x.id === p.subjectId), '请选择真实签约主体。');
    wallet(f, p.walletId);
    must(p.contractNo?.trim() && p.validUntil && p.evidence?.trim(), '合同编号、有效期和条款附件说明必填。');
    date(p.validFrom,'合同生效日期'); date(p.validUntil,'合同截止日期');
    must(p.validFrom<=p.validUntil&&text(p.terms), '合同有效起止及条款范围必填且日期顺序有效。');
    must(!(f.records.M20||[]).some(x=>x.contractNo===p.contractNo.trim()), '合同编号已存在，请通过原合同创建下一版本。');
    r.contractNo=p.contractNo.trim();
    r.status = '草稿';
    r.version = 1;
  } else if (module === 'M21') {
    role(s, [...business, '财务']);
    wallet(f, p.walletId);
    must(p.title?.trim() && p.taxNo?.trim() && p.basis?.trim(), '抬头、税号和可开依据必填。');
    must(['收款分配','有效合同'].includes(p.sourceType),'请选择已支持的开票依据类型。');
    const lines=p.sourceLines?.length ? p.sourceLines : [{sourceId:p.sourceId,amount:p.amount}];
    must(new Set(lines.map(line=>line.sourceId)).size===lines.length,'同一开票依据不能重复添加；请合并来源行。');
    r.sourceLines=lines.map(line=>{
      const amount=cents(line.amount); let source,cap;
      if (p.sourceType==='收款分配') {
        source=f.receipts.find(q=>q.id===line.sourceId&&q.confirmed);
        must(source,'来源收款未确认。');
        cap=source.allocations.filter(a=>a.walletId===p.walletId).reduce((n,a)=>n+a.amount,0);
      } else {
        source=(f.records.M20||[]).find(q=>q.id===line.sourceId&&q.status==='签订有效'&&q.walletId===p.walletId);
        must(source,'请选择同结算方有效合同版本。'); cap=source.amount;
      }
      const occupied=(f.records.M21||[]).filter(x=>x.walletId===p.walletId&&!['已取消','已退回','红冲完成'].includes(x.status)).flatMap(x=>x.sourceLines||[{sourceType:x.sourceType,sourceId:x.sourceId,amount:x.amount}]).filter(x=>x.sourceType===p.sourceType&&x.sourceId===line.sourceId).reduce((n,x)=>n+x.amount,0);
      must(amount<=cap-occupied,'超过该依据剩余可开金额，不能重复占用。');
      return {sourceType:p.sourceType,sourceId:line.sourceId,amount,sourceVersion:source.version||null,sourceTitle:source.contractNo||source.bankRef,availableAtApplication:cap-occupied};
    });
    must(r.sourceLines.reduce((n,line)=>n+line.amount,0)===r.amount,'各来源分配合计必须等于本次申请票额。');
    r.sourceId=r.sourceLines[0].sourceId;
    r.status = '占用待审';
    r.issued = 0;
    r.bills = [];
  } else if (module === 'M22') {
    role(s, finance);
    must(p.period?.trim() && p.reason?.trim(), '期间和核对范围/处理依据必填。');
    if (p.type === '期间对账') must(/^\d{4}-\d{2}$/.test(p.period), '期间对账请输入YYYY-MM月份；本地演示按当前入账月份保护封存。');
    if (p.type === '尾差处理') {
      must(Number.isSafeInteger(r.receivable) && Number.isSafeInteger(r.actual), '应收和实收必填。');
      r.difference = r.actual - r.receivable;
      r.status = '待财务接受';
    } else {
      r.status = '待检查';
      r.version = 1;
      r.issues = [];
      r.cutoffAt=date(p.cutoffAt,'对账截止日期');
      r.responsible=text(p.responsible)||s.name;
    }
  } else throw Error('未支持模块');
  f.records[module] ??= [];
  f.records[module].push(r);
  log(r, '新增' + financeTitles[module] + '演示记录', s);
  return id;
}
export function actFinance(db, module, id, action, p, s) {
  const f = initFinance(db);
  if (!(module === 'M22' && action === 'reopen')) writablePeriod(f);
  if (module === 'M09') {
    const r = f.receipts.find(x => x.id === id);
    must(r, '收款不存在');
    role(s, action==='amend'?[...business,'财务']:finance);
    if(action==='amend'){
      must(!r.confirmed,'已确认收款不可覆盖原凭证，需另作有据更正。');
      must(text(p.evidence),'请填写到账凭证依据。');
      r.evidenceVersions??=[];r.evidenceVersions.push({evidence:r.evidence,occurredAt:r.occurredAt,payerAccount:r.payerAccount,receivingBankName:r.receivingBankName,at:now(),actor:s.name});
      r.evidence=text(p.evidence);r.occurredAt=date(p.occurredAt,'到账发生日期');
      r.payerAccount=text(p.payerAccount||r.payerAccount);r.receivingBankName=text(p.receivingBankName||r.receivingBankName);r.receivableRef=text(p.receivableRef||r.receivableRef);
      log(r,'补齐原收款凭证；来源身份、金额不变，未增加资金',s);
    } else if (action === 'confirm') {
      must(!r.confirmed, '该流水已确认，不重复入账。');
      must(r.evidence?.trim(), '请先在登记时填写到账凭证说明。');
      r.confirmed = true;
      r.confirmedBy=s.name; r.confirmedAt=now();
      r.status = '已确认待分配';
      event(f, 'RECEIPT:' + id, '确认演示银行到账', {
        bank: r.amount,
        ref: id
      });
      log(r, '财务确认到账，公司现金记录一次', s);
    } else if (action === 'allocate') {
      must(r.confirmed, '财务确认到账后才可分配。');
      const w = wallet(f, p.walletId),
        amount = cents(p.amount);
      must(amount <= r.amount - r.allocated, '累计分配不能超过实际到账。');
      must(p.evidence?.trim(), '认领、拆分或代付依据必填。');
      must(['客户本人付款','第三方代付'].includes(p.paymentRelationship), '请明确核验本次分配对应的付款关系。');
      if (p.paymentRelationship==='第三方代付') must(text(p.thirdPartyBasis), '第三方代付须保存代付关系依据，实际付款人不能改成客户。');
      let repaid = 0,
        cash = 0,
        service = 0;
      if (p.purpose === '独立服务费') {
        service = amount;
        w.service = (w.service || 0) + amount;
      } else if (p.purpose === '接受多款差额') {
        must(s.role === '财务', '差额由财务处理。');
      } else {
        repaid = payDebt(f, w, amount);
        cash = amount - repaid;
        w.cash += cash;
      }
      const a = {
        id: uid('AL'),
        walletId: w.id,
        amount,
        purpose: p.purpose,
        evidence: p.evidence,
        paymentRelationship:p.paymentRelationship,
        thirdPartyBasis:text(p.thirdPartyBasis),
        receivableRef:text(p.receivableRef||r.receivableRef),
        actualPayer:r.payer,
        confirmedBy:s.name,
        repaid,
        cash,
        service,
        at: now()
      };
      r.allocations.push(a);
      r.allocated += amount;
      r.status = r.allocated === r.amount ? '已分配' : '部分分配';
      event(f, 'ALLOC:' + a.id, '到账分配', {
        walletId: w.id,
        cash,
        debt: -repaid,
        service,
        ref: id,
        note: p.purpose + '；实际分配 ' + amount + ' 分'
      });
      log(r, '分配给 ' + w.name + '；先还债 ' + repaid + ' 分，备款 ' + cash + ' 分，服务费 ' + service + ' 分', s);
    } else throw Error('不支持此收款动作');
    return;
  }
  if (module === 'M11') {
    role(s, ['Boss']);
    const c = f.credits.find(x => x.id === id);
    must(c, '信用申请不存在');
    if (action === 'approve') {
      must(c.status === '待Boss审批', '只处理当前待批版本。');
      c.status = '批准待CRM同步';
      c.approvedVersion=c.version;
      c.approvalSnapshot={amount:c.amount,type:c.type,validUntil:c.validUntil,dueAt:c.dueAt,repaymentTerms:c.repaymentTerms,version:c.version,approvedBy:s.name,approvedAt:now()};
      log(c, '演示Boss批准当前版本，尚未生效', s);
    } else if (action === 'sync') {
      must(c.status === '批准待CRM同步', '无待同步批准，不能重复加额。');
      must(c.approvedVersion===c.version&&c.approvalSnapshot.amount===c.amount,'批准版本与当前申请不一致，禁止同步生效。');
      c.status = '有效';
      wallet(f, c.walletId).creditLimit += c.amount;
      log(c, 'CRM留痕成功，信用一次生效', s);
    } else if (action === 'reject') {
      must(c.status === '待Boss审批', '当前不是待批状态。');
      c.status = '已拒绝';
      log(c, 'Boss拒绝，未增加信用', s);
    } else if (action === 'freeze') {
      must(c.status === '有效', '当前信用不可冻结');
      c.status = '冻结';
      log(c, '暂停新支用，未偿债务保留', s);
    } else throw Error('不支持此信用动作');
    return;
  }
  if (module === 'M12') {
    const o = f.orders.find(x => x.id === id);
    must(o, '充值单不存在');
    if (action === 'assign') {
      role(s, ['媒介主管']);
      must(o.status === '待派单', '当前不待派');
      o.status = '待办理';
      o.assignee = '充值媒介（演示队列）';
      log(o, '主管派至充值媒介', s);
    } else if (action === 'price') {
      role(s, finance);
      must(['待派单', '待办理', '已发生待核实'].includes(o.status), '冻结或执行后不能覆盖计价快照。');
      must(/^\d+(\.\d{1,2})?$/.test(String(p.rate)), '请输入非负返点点数，最多2位小数。');
      const bp = cents(p.rate, {
        allowZero: true
      });
      must(bp <= 10000, '演示返点限定0–100点，其他分支待专门核验。');
      o.frontRate = bp;
      o.coins = portion(o.amount, 10000 + bp, 10000, true);
      o.pricingVersion = '财务确认演示普通前返 v1';
      o.financePriced=true;
      o.pricingSnapshot={version:o.pricingVersion,amount:o.amount,coins:o.coins,frontRate:bp,moneyUnit:'CNY',coinUnit:o.coinUnit,confirmedBy:s.name,confirmedAt:now(),basis:text(p.evidence)||'普通前返演示分支'};
      log(o, '财务确认前返 ' + p.rate + ' 点，广告币独立计量', s);
    } else if (action === 'freeze') {
      role(s, ['充值媒介']);
      reserve(f, o);
      log(o, '冻结备款/适用信用，等待执行', s);
    } else if (action === 'start') {
      role(s, ['充值媒介']);
      must(o.status === '资金冻结', '执行前必须先冻结');
      o.status = '执行中';
      o.requestId = uid('REQ');
      log(o, '演示提交外部请求 ' + o.requestId, s);
    } else if (action === 'unknown') {
      role(s, ['充值媒介']);
      must(o.status === '执行中', '只有执行中结果可标未知');
      o.status = '未知待核实';
      log(o, '结果未知，保留冻结，仅回查原请求', s);
    } else if (action === 'success') {
      role(s, ['充值媒介']);
      must(['执行中', '未知待核实'].includes(o.status), '只有原执行可以核实成功');
      must(p.evidence?.trim(), '成功核实凭证必填');
      o.evidence = p.evidence;
      o.status = '成功待入账';
      log(o, '外部成功事实已核实，只允许同步入账', s);
    } else if (action === 'post') {
      role(s, ['充值媒介', '财务']);
      postRecharge(f, o);
      log(o, '演示成功事实入账；未再次调用媒体', s);
    } else if (action === 'fail') {
      role(s, ['充值媒介']);
      must(['执行中', '未知待核实'].includes(o.status), '不允许把已成功结果改失败');
      must(p.evidence?.trim(), '确认未发生的依据必填');
      release(f, o);
      o.status = '明确失败';
      log(o, '核实未发生，释放冻结：' + p.evidence, s);
    } else if (action === 'retry') {
      role(s, [...business, '充值媒介']);
      must(o.status === '明确失败', '只有明确失败可原单重办；未知不可重充');
      o.status = '待派单';
      log(o, '原单重新派单，保留失败记录', s);
    } else if (action === 'supplement') {
      role(s, finance);
      must(o.status === '已发生待核实', '此事实已经处理');
      must(o.financePriced, '补录入账前需财务核实原交付的计价快照。');
      const w = wallet(f, o.walletId),
        cash = Math.min(availableCash(w), o.amount),
        debt = o.amount - cash;
      w.cash -= cash;
      w.debt += debt;
      w.exceptionDebt = (w.exceptionDebt || 0) + debt;
      o.status = '完成';
      o.postedAt = now();
      o.cashUsed = cash;
      o.exceptionDebt = debt;
      o.exceptionDebtOriginal = debt;
      o.refundedCoins = 0;
      o.refundedCash = 0;
      o.creditAlloc = [];
      event(f, 'RECHARGE:' + o.id, '已发生补录', {
        walletId: w.id,
        cash: -cash,
        debt,
        ref: o.id,
        note: '不再次执行平台；不足 ' + debt + ' 分记异常待核实，不伪造信用批准'
      });
      log(o, '登记已发生交付；资金缺口进入异常欠款', s);
    } else if(action==='match') {
      role(s,['财务','充值媒介']);
      must(o.status==='完成'&&!o.accountId,'仅已完成且未匹配子账户的交付主单可补关联。');
      const account=db.accounts.find(a=>a.id===p.accountId),amount=cents(p.amount);
      must(account&&text(p.matchRef)&&text(p.evidence),'子账户、原交付明细引用及核对依据必填。');
      if(o.supplierId) must(account.supplierId===o.supplierId,'明细账户供应商与主单实际交付供应商不一致。');
      const w=wallet(f,o.walletId);
      must(w.kind==='渠道演示结算方'||account.customerId===w.customerId,'普通结算方只能匹配本客户账户。');
      o.deliveryMatches??=[];
      must(!o.deliveryMatches.some(x=>x.matchRef===text(p.matchRef)),'该外部明细已匹配，不能重复登记。');
      must(amount<=o.amount-o.deliveryMatches.reduce((n,x)=>n+x.amount,0),'匹配合计不能超过主单真实交付本金。');
      o.deliveryMatches.push({id:uid('MATCH'),accountId:account.id,externalId:account.externalId,amount,matchRef:text(p.matchRef),evidence:text(p.evidence),operator:s.name,at:now()});
      log(o,'仅补交付明细关联 '+account.externalId+'；未再次充值、扣款或生成子账户资金',s);
    } else throw Error('不支持此充值动作');
    return;
  }
  const r = record(f, module, id);
  if (module === 'M13') {
    role(s, finance);
    must(r.status === '待财务确认', '分类已确认；更正请新增版本。');
    r.status = '已分类';
    log(r, '确认分类 v' + r.version + '，不改变任何资金事实', s);
  } else if (module === 'M14') {
    role(s, ['充值媒介', '财务']);
    const o = f.orders.find(o => o.id === r.orderId);
    if (action === 'unknown') {
      must(r.status === '待媒介办理', '只有待办理可标未知');
      r.status = '未知';
    } else if (action === 'success') {
      must(['待媒介办理', '未知', '部分退回'].includes(r.status), '当前不能登记退币结果');
      must(p.evidence?.trim(), '实际退回凭证必填');
      const n = cents(p.amount);
      must(n <= r.amount - r.returned, '不能超出申请剩余退币数');
      if (o.accountId) must(n <= platformAvailable(f, o.accountId), '已转出的广告币不能重复退款，请核实平台剩余');
      const newCoins = (o.refundedCoins || 0) + n;
      must(newCoins <= o.coins, '超过原充值可退总量');
      const cashTotal = portion(o.amount, newCoins, o.coins, true),
        cashPart = cashTotal - (o.refundedCash || 0);
      const w = wallet(f, o.walletId);
      let repay = 0;
      const totalCredit = (o.creditAlloc || []).reduce((n, a) => n + a.amount, 0);
      let creditBudget = portion(totalCredit, cashTotal, o.amount);
      for (const a of o.creditAlloc || []) {
        const total = Math.min(a.amount, creditBudget);
        creditBudget -= total;
        const prev = (o.refundCredits || {})[a.creditId] || 0,
          part = total - prev;
        const reduce = Math.min(part, a.unpaid || 0);
        a.unpaid -= reduce;
        repay += reduce;
        const c = f.credits.find(c => c.id === a.creditId);
        if (c) {
          c.used -= reduce;
          if (c.type !== '常规循环') c.retired += reduce;
        }
        o.refundCredits ??= {};
        o.refundCredits[a.creditId] = total;
      }
      const exTotal = portion(o.exceptionDebtOriginal || 0, cashTotal, o.amount);
      const ex = Math.min(o.exceptionDebt || 0, exTotal - (o.refundedException || 0));
      o.refundedException = exTotal;
      must(repay + ex <= cashPart, '来源分摊金额异常，停止记账并进入对账。');
      if (ex) {
        o.exceptionDebt -= ex;
        w.exceptionDebt -= ex;
        repay += ex;
      }
      w.debt -= repay;
      w.cash += cashPart - repay;
      o.refundedCoins = newCoins;
      o.refundedCash = cashTotal;
      r.returned += n;
      r.status = r.returned === r.amount ? '完成' : '部分退回';
      r.refundResults ??= [];
      r.refundResults.push({id:uid('CRR'),coins:n,cashRestored:cashPart-repay,debtReduced:repay,evidence:text(p.evidence),occurredAt:date(p.occurredAt,'实际退币日期'),requestId:text(p.requestId)||r.id,registeredAt:now(),operator:s.name});
      event(f, 'COINREFUND:' + r.id + ':' + r.returned, '平台实际退币', {
        walletId: w.id,
        cash: cashPart - repay,
        debt: -repay,
        ref: r.id,
        note: p.evidence + '；按原充值演示计价还原本金'
      });
    } else throw Error('不支持此退币动作');
    log(r, '演示退币结果：' + r.status, s);
  } else if (module === 'M15') {
    if(action==='amend-source') {
      role(s,[...business,'财务']);
      must(['待审批','已批待付'].includes(r.status),'冻结或付款后不能覆盖退款来源与收款身份。');
      const source=refundableSources(f,r.walletId,r.id).find(e=>e.id===p.refundSourceId);
      must(source&&r.amount<=source.remaining,'请选择同结算方足额的未占用退款来源。');
      must(text(p.payee)&&text(p.method)&&text(p.accountVerification),'收款方、退款方式及更正核对依据必填。');
      if(p.method.includes('银行'))must(text(p.receivingBankName)&&text(p.receivingBankAccount),'银行退款需完整银行和收款账号。');
      r.sourceVersions??=[];r.sourceVersions.push({refundSourceId:r.refundSourceId||null,payee:r.payee,method:r.method,receivingBankName:r.receivingBankName||'',receivingBankAccount:r.receivingBankAccount||'',approvedAmount:r.approvedAmount||null,approvedBy:r.approvedBy||null,at:now(),actor:s.name});
      Object.assign(r,{refundSourceId:source.id,refundSourceSnapshot:structuredClone(source),payee:text(p.payee),method:text(p.method),receivingBankName:text(p.receivingBankName),receivingBankAccount:text(p.receivingBankAccount),accountVerification:text(p.accountVerification),status:'待审批',approvedAmount:null,approvedBy:null,approvedAt:null});
      log(r,'补齐或更正退款来源/收款身份；原批准保留历史，需按新资料重新审批',s);
    } else if (action === 'approve') {
      role(s, ['商务主管', 'Boss']);
      must(r.status === '待审批', '当前不待审批');
      r.status = '已批待付';
      r.approvedAmount=r.amount; r.approvedBy=s.name; r.approvedAt=now();
    } else if (action === 'freeze') {
      role(s, finance);
      must(r.status === '已批待付', '请先审批');
      const w = wallet(f, r.walletId);
      const source=refundableSources(f,r.walletId,r.id).find(e=>e.id===r.refundSourceId);
      must(source && r.amount <= source.remaining,'原退款来源被其他申请占用，请重新核对；不能只凭总余额绕过来源。');
      must(r.amount - r.paid <= availableCash(w), '可退备款不足或已被占用');
      r.frozen = r.amount - r.paid;
      w.frozen += r.frozen;
      r.status = '付款准备';
    } else if (action === 'unknown') {
      role(s, finance);
      must(['付款准备', '部分付'].includes(r.status), '没有在途付款');
      r.status = '未知';
    } else if (action === 'pay') {
      role(s, finance);
      must(['付款准备', '未知', '部分付'].includes(r.status), '付款前须审批和冻结');
      must(p.evidence?.trim(), '实际付款凭证必填');
      const n = cents(p.amount);
      must(n <= r.frozen, '超出尚未付款的冻结金额');
      const payment=paymentDetails(f,r,p,s,n,module);
      const w = wallet(f, r.walletId);
      w.cash -= n;
      w.frozen -= n;
      r.frozen -= n;
      r.paid += n;
      r.status = r.paid === r.amount ? '已付' : '部分付';
      savePayment(r,payment);
      event(f, 'REFUND:' + r.id + ':' + r.paid, '客户实际退款', {
        walletId: w.id,
        cash: -n,
        bank: -n,
        ref: r.id,
        note: p.evidence
      });
    } else if (action === 'fail') {
      role(s, finance);
      must(['未知', '付款准备', '部分付'].includes(r.status) && p.evidence?.trim(), '需确认未付部分及依据');
      wallet(f, r.walletId).frozen -= r.frozen;
      r.frozen = 0;
      r.status = r.paid ? '部分付 / 余款明确失败' : '失败';
      r.differenceReason=text(p.evidence);
    } else throw Error('不支持此退款动作');
    log(r, '演示退款：' + r.status, s);
  } else if (module === 'M16') {
    role(s, finance);
    if (action === 'reverse') {
      must(r.status === '完成' && p.evidence?.trim(), '需要原已完成转账和冲正依据');
      const a = wallet(f, r.walletId),
        b = wallet(f, r.targetWalletId);
      must(!b.frozen && r.amount <= availableCash(b), '目标存在占用或可回转备款不足；转入已用部分应进入财务更正，不能强行恢复来源');
      must(!f.events.slice(r.transferSeq).some(e => e.walletId === b.id && (e.cashDelta || e.debtDelta || e.serviceDelta)), '目标转入后已有资金/核销依赖；本演示停止自动冲正，保留原记录并进入人工更正');
      b.cash -= r.amount;
      a.cash += r.amount;
      r.status = '冲正';
      event(f, 'REVERSE:' + id + ':OUT', '渠道冲正转出', {
        walletId: b.id,
        cash: -r.amount,
        ref: id,
        note: p.evidence
      });
      event(f, 'REVERSE:' + id + ':IN', '渠道冲正转入', {
        walletId: a.id,
        cash: r.amount,
        ref: id,
        note: p.evidence
      });
      log(r, '未使用无占用整笔反向；原转账记录保留', s);
      return;
    }
    must(action === 'transfer', '无效转账动作');
    must(r.status === '待财务办理', '该转账已处理');
    const a = wallet(f, r.walletId),
      b = wallet(f, r.targetWalletId);
    must(r.amount <= availableCash(a), '来源未占用现金不足，不能转授信');
    a.cash -= r.amount;
    b.cash += r.amount;
    r.status = '完成';
    event(f, 'TRANSFER:' + id + ':OUT', '渠道转账转出', {
      walletId: a.id,
      cash: -r.amount,
      ref: id
    });
    event(f, 'TRANSFER:' + id + ':IN', '渠道转账转入', {
      walletId: b.id,
      cash: r.amount,
      ref: id
    });
    r.transferSeq = f.events.length;
    log(r, '同一演示事件两端落账，公司现金无变化；旧资方差额分支未在此冒用', s);
  } else if (module === 'M17') {
    role(s, ['充值媒介']);
    checkPlatformTransfer(db, r.sourceAccountId, r.targetAccountId);
    if (action === 'out') {
      must(r.status === '待媒介办理', '不能重复转出');
      must(r.amount <= platformAvailable(f, r.sourceAccountId), '本地平台余额不足');
      r.status = '待转入';
      r.outRequestId=uid('TRANSFER-OUT'); r.outResult={accountId:r.sourceAccountId,amount:r.amount,at:now(),operator:s.name};
    } else if (action === 'in') {
      must(['待转入', '部分完成待补偿', '未知'].includes(r.status), '尚无已转出事实');
      must(p.evidence?.trim(), '转入结果凭证必填');
      r.status = '完成';
      r.inRequestId=r.inRequestId||uid('TRANSFER-IN'); r.inResult={accountId:r.targetAccountId,amount:r.amount,evidence:text(p.evidence),at:now(),operator:s.name};
    } else if (action === 'unknown') {
      must(r.status === '待转入', '未知仅针对原转入执行');
      r.status = '未知';
    } else if (action === 'fail') {
      must(['待转入', '未知'].includes(r.status), '当前无待核实转入');
      r.status = '部分完成待补偿';
    } else throw Error('不支持此平台转户动作');
    log(r, '平台转户 ' + r.status + '；不改变CRM现金', s);
  } else if (module === 'M18') {
    role(s, finance);
    if (action === 'pay') {
      must(['待付款', '部分付款'].includes(r.status), '已付部分不能重复支付');
      must(p.evidence?.trim(), '付款凭证必填');
      const n = cents(p.amount);
      must(n <= r.amount - r.paid, '累计付款超应付');
      const payment=paymentDetails(f,r,p,s,n,module);
      r.paid += n;
      savePayment(r,payment);
      r.status = r.paid === r.amount ? '已付款待分配' : '部分付款';
      event(f, 'SUPPLIERPAY:' + id + ':' + r.paid, '供应商实际付款', {
        bank: -n,
        ref: id,
        note: p.evidence
      });
    } else if (action === 'allocate') {
      const o = f.orders.find(o => o.id === p.orderId && o.status === '完成');
      must(o, '请关联已完成交付');
      must((o.supplierId||db.accounts.find(a => a.id === o.accountId)?.supplierId) === r.supplierId, '交付供应商不一致');
      if(r.type==='关联业务付款') must(r.orderId===o.id,'关联业务付款仅分配到本单指定原充值；供应商预存才可拆分其他交付。');
      const n = cents(p.amount);
      const used = (f.records.M18 || []).flatMap(x => x.allocations || []).filter(x => x.orderId === o.id).reduce((s, x) => s + x.amount, 0);
      must(n <= r.paid - r.allocated && n <= o.amount - used, '超出实付剩余或交付可分配数');
      r.allocations ??= [];
      r.allocations.push({
        orderId: o.id,
        amount: n,
        at:now(), operator:s.name
      });
      r.allocated += n;
      r.status = r.paid < r.amount ? '部分付款' : r.allocated === r.paid ? '已分配' : '已付款待分配';
    } else throw Error('不支持此供应商动作');
    log(r, '供应商往来 ' + r.status + '；不再扣客户钱包', s);
  } else if (module === 'M19') {
    role(s, finance);
    const w = wallet(f, r.walletId);
    if (action === 'confirm') {
      must(r.status === '待财务确认', '已确认；调整应另存版本');
      r.status = r.type === '服务费' ? '待收/使用' : '待返付';
      r.agreementSnapshot={...(r.agreementSnapshot||{amount:r.amount,ratePoints:null,calculationBasis:'旧演示记录未留完整计算快照',calculationBranch:'旧记录约定金额',reason:r.reason}),confirmedBy:s.name,confirmedAt:now()};
    } else if (action === 'use') {
      must(r.type === '服务费' && ['待收/使用', '部分使用', '部分退回'].includes(r.status), '此记录不可扣用服务费');
      const n = cents(p.amount);
      must(n <= r.amount - r.used - (r.returned || 0) && n <= w.service, '服务费台账剩余或独立服务费余额不足');
      w.service -= n;
      r.used += n;
      r.status = r.used + (r.returned || 0) === r.amount ? '已结清' : '部分使用';
      event(f, 'SERVICE:' + id + ':' + r.used, '服务费使用', {
        walletId: w.id,
        service: -n,
        ref: id
      });
    } else if (action === 'refund') {
      must(r.type === '服务费' && ['待收/使用', '部分使用', '部分退回'].includes(r.status), '只有尚未使用的服务费可退回');
      must(p.evidence?.trim() && p.payee?.trim(), '实际退款对象和原服务费收款依据必填');
      const n = cents(p.amount);
      must(n <= r.amount - r.used - (r.returned || 0) && n <= w.service, '超出本单未用或独立服务费可退余额');
      const payment=paymentDetails(f,r,p,s,n,module);
      w.service -= n;
      r.returned = (r.returned || 0) + n;
      r.status = r.used + r.returned === r.amount ? '已结清' : '部分退回';
      savePayment(r,payment);
      event(f, 'SERVICE-REFUND:' + id + ':' + r.returned, '服务费实际退回', {
        walletId: w.id,
        service: -n,
        bank: -n,
        ref: id,
        note: p.payee + ' / ' + p.evidence
      });
    } else if (action === 'pay') {
      must(r.type === '后返' && ['待返付', '部分返付'].includes(r.status), '返付记录未确认或已完成');
      must(p.evidence?.trim() && p.payee?.trim(), '需保存实际返付对象及凭证');
      const n = cents(p.amount);
      must(n <= r.amount - r.paid, '累计返付超过应返');
      const payment=paymentDetails(f,r,p,s,n,module);
      let cash = 0,
        debt = 0,
        bank = 0;
      if (p.method === '转备款') {
        cash = n;
        w.cash += n;
      } else if (p.method === '抵欠款') {
        must(n <= w.debt, '超过本结算方实际未偿');
        debt = -payDebt(f, w, n);
      } else {
        bank = -n;
      }
      r.paid += n;
      r.status = r.paid === r.amount ? '已返付' : '部分返付';
      savePayment(r,payment);
      event(f, 'REBATE:' + id + ':' + r.paid, '客户后返结付', {
        walletId: w.id,
        cash,
        debt,
        bank,
        ref: id,
        note: p.method + ' / ' + p.payee + ' / ' + p.evidence
      });
    } else throw Error('不支持此费用动作');
    log(r, '费用与返付 ' + r.status, s);
  } else if (module === 'M20') {
    if (action === 'revise') {
      role(s, [...business, '财务']);
      must(r.status === '草稿', '已提交合同应通过下一版本变更');
      must(p.validUntil && p.evidence?.trim(), '变更后的期限与条款依据必填');
      const from=date(p.validFrom||r.validFrom,'合同生效日期'),until=date(p.validUntil,'合同截止日期');
      must(from<=until&&text(p.terms||r.terms),'有效期间和条款范围须完整。');
      r.amount = cents(p.amount);
      r.validUntil = p.validUntil;
      r.evidence = p.evidence;
      r.validFrom=from; r.terms=text(p.terms||r.terms);
    } else if (action === 'submit') {
      role(s, [...business, '财务']);
      must(r.status === '草稿', '合同已提交');
      r.status = '审批中';
    } else if (action === 'sign') {
      role(s, finance);
      must(r.status === '审批中' && p.evidence?.trim(), '需审批中合同及已签署原件说明');
      r.status = '签订有效';
      r.signedEvidence = p.evidence;
      r.signedAt=date(p.occurredAt,'合同实际签署日期'); r.signedBy=s.name;
    } else if (action === 'version') {
      role(s, [...business, '财务']);
      must(r.status === '签订有效', '仅从有效合同创建新草稿');
      must(!(f.records.M20||[]).some(x=>x.contractNo===r.contractNo&&['草稿','审批中'].includes(x.status)),'该合同已有变更草稿或审批版本，请先办理原版本。');
      const copy = {
        ...r,
        id: uid('M20'),
        parentId: r.id,
        version: Math.max(...f.records.M20.filter(x=>x.contractNo===r.contractNo).map(x=>x.version))+1,
        status: '草稿',
        createdAt: now(),
        events: [], signedEvidence:null, signedAt:null, signedBy:null
      };
      f.records.M20.push(copy);
      log(copy, '由原合同创建变更草稿，旧票仍引用原版本', s);
      log(r, '已生成下一版草稿 '+copy.id+'；旧版本继续保留', s);
      return copy.id;
    } else if (action === 'void') {
      role(s, finance);
      must(r.status === '签订有效' && p.evidence?.trim(), '需有效合同及作废依据');
      r.status = '作废';
    } else throw Error('不支持此合同动作');
    log(r, '合同 ' + r.status + '；不改变历史收款或发票', s);
  } else if (module === 'M21') {
    role(s, finance);
    if(['approve','issue'].includes(action)) for(const line of r.sourceLines||[{sourceType:r.sourceType,sourceId:r.sourceId}]) {
      if(line.sourceType==='收款分配') must(f.receipts.some(q=>q.id===line.sourceId&&q.confirmed&&q.allocations.some(a=>a.walletId===r.walletId)),'原收款分配已经无效，请保留申请并核实可开依据。');
      else must((f.records.M20||[]).some(q=>q.id===line.sourceId&&q.status==='签订有效'&&q.walletId===r.walletId),'原合同版本已无效，须核实依据，不能继续自动开票。');
    }
    if (action === 'approve') {
      must(r.status === '占用待审', '当前不待审核');
      r.status = '待开';
    } else if (action === 'issue') {
      must(['待开', '部分开'].includes(r.status), '当前不能开票');
      const n = cents(p.amount);
      must(n <= r.amount - r.issued, '超过申请未开金额');
      must(p.billNo?.trim() && p.evidence?.trim(), '真实演示票号及凭证说明必填');
      must(!(f.records.M21 || []).some(x => x.bills?.some(b => b.number === p.billNo.trim()) || x.redBillNo===p.billNo.trim()), '票号重复');
      r.bills.push({
        number: p.billNo.trim(),
        amount: n,
        evidence: p.evidence,
        issuedAt:date(p.issuedAt,'实际开票日期'),
        attachmentRef:text(p.attachmentRef)||text(p.evidence),
        issuer:s.name,
        sourceSnapshot:structuredClone(r.sourceLines||[{sourceType:r.sourceType,sourceId:r.sourceId,amount:r.amount}]),
        at: now()
      });
      r.issued += n;
      r.status = r.issued === r.amount ? '已开' : '部分开';
    } else if (action === 'cancel') {
      must(r.issued === 0, '已开票不能取消释放，请保留原票进入红冲办理。');
      must(['占用待审', '待开'].includes(r.status), '当前不可取消');
      r.status = '已取消';
      r.cancelled = true;
    } else if (action === 'red') {
      must(r.issued > 0 && p.evidence?.trim(), '已有票据及红冲办理依据必填');
      r.status = '红冲处理中';
      r.redEvidence = p.evidence;
    } else if (action === 'red-complete') {
      must(r.status === '红冲处理中' && p.evidence?.trim() && p.billNo?.trim(), '需要正在红冲的原票和实际红票凭证');
      must(!(f.records.M21 || []).some(x => x.bills?.some(b => b.number === p.billNo.trim()) || x.redBillNo === p.billNo.trim()), '票号重复');
      r.redBillNo = p.billNo.trim();
      r.redEvidence = p.evidence;
      r.status = '红冲完成';
      r.redIssuedAt=date(p.issuedAt,'红票实际开票日期');
      r.redSourceBills=r.bills.map(b=>b.number);
      r.cancelled = true;
      r.redAmount = r.issued;
    } else throw Error('不支持此开票动作');
    log(r, '票据 ' + r.status + '；不改变现金备款', s);
  } else if (module === 'M22') {
    role(s, finance);
    if (action === 'accept') {
      must(r.type === '尾差处理' && r.status === '待财务接受' && p.evidence?.trim(), '接受尾差必须有处理依据');
      r.status = '已接受差额结清';
      r.evidence = p.evidence;
      log(r, '保留应收 ' + r.receivable + ' / 实收 ' + r.actual + ' / 差额 ' + r.difference + ' 分，不自动增减现金', s);
    } else if (action === 'scan') {
      must(r.type !== '尾差处理' && r.status !== '已封存', '封存期间应先重开');
      r.issues = reconciliation(f);
      r.differences=r.issues.map(message=>({type:'账内事件或状态差异',message,amount:null,responsible:r.responsible,status:'待核实'}));
      r.balanceSnapshot={at:now(),wallets:f.wallets.map(w=>({walletId:w.id,openingCash:w.openingCash||0,cash:w.cash,frozen:w.frozen,debt:w.debt,service:w.service})),eventIds:f.events.map(e=>e.id)};
      r.status = r.issues.length ? '差异待核实' : '待覆盖复核';
      log(r, '事件复算完成；仍需核对原始来源完整性', s);
    } else if (action === 'close') {
      must(r.status === '待覆盖复核' && p.evidence?.trim(), '先完成无差异复算并登记覆盖复核依据');
      must(reconciliation(f).length === 0, '期间出现新差异，请重新检查');
      must(Array.isArray(p.coverageSources)&&p.coverageSources.length>0, '请逐项登记本次原始来源覆盖范围。');
      const coverage=p.coverageSources.map(source=>{const expected=Number(source.expectedCount),checked=Number(source.checkedCount);must(text(source.sourceType)&&text(source.sourceRef)&&text(source.expectedCount)!==''&&text(source.checkedCount)!==''&&Number.isInteger(expected)&&expected>=0&&Number.isInteger(checked)&&checked===expected,'每项覆盖须有来源类型、依据以及相等的应核/已核数量，缺件不能直接关闭。');return {...source,expectedCount:expected,checkedCount:checked};});
      r.status = '核对完成';
      r.coverageEvidence = p.evidence;
      r.coverageSources=structuredClone(coverage); r.reviewedBy=s.name; r.reviewedAt=now();
      log(r, '确认演示原始来源覆盖，核对完成不等于封存', s);
    } else if (action === 'seal') {
      must(r.status === '核对完成' && reconciliation(f).length === 0, '须无新增差异且核对完成');
      r.status = '已封存';
      log(r, '期间封存 v' + r.version, s);
    } else if (action === 'reopen') {
      must(r.status === '已封存' && p.evidence?.trim(), '重开必须保留授权原因');
      r.previousVersions ??= [];
      r.previousVersions.push({
        version: r.version,
        status: r.status,
        coverageEvidence: r.coverageEvidence
        ,coverageSources:structuredClone(r.coverageSources||[]),balanceSnapshot:structuredClone(r.balanceSnapshot||null),differences:structuredClone(r.differences||[])
      });
      r.version += 1;
      r.status = '已重开';
      log(r, '有据重开：' + p.evidence, s);
    } else throw Error('不支持此对账动作');
  } else throw Error('未支持操作');
}
