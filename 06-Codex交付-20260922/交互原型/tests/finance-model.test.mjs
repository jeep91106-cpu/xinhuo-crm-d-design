import test from 'node:test';
import assert from 'node:assert/strict';
import { cents, loadFinanceDemo, createFinance, actFinance, availableCash, availableCredit, platformAvailable, checkPlatformTransfer, reconciliation, refundableSources,financeRecordRoute } from '../src/finance-model.js';
const sessions = Object.fromEntries(['商务', '渠道商务', '商务主管', '媒介主管', '充值媒介', '财务', 'Boss'].map(role => [role, {
  role,
  name: '演示' + role,
  businessId: 'demo-a'
}]));
function setup(seed = true) {
  const ctx = {
    db: {
      customers: [{
        id: '1115',
        name: '允城',
        kind: null
      }, {
        id: '1098',
        name: '龙赢',
        kind: '渠道'
      }, {
        id: 'other',
        name: '其他资料',
        kind: null
      }],
      subjects: [{
        id: 's1',
        name: '演示主体'
      }],
      accounts: [{
        id: 'a1',
        name: '演示账户一',
        externalId: 'DEMO-A1',
        customerId: '1115',
        businessOwnerId: 'demo-a',
        productCode: '8',
        supplierId: 'sup1'
      }, {
        id: 'a2',
        name: '演示账户二',
        externalId: 'DEMO-A2',
        customerId: '1115',
        businessOwnerId: 'demo-a',
        productCode: '8',
        supplierId: 'sup1'
      }, {
        id: 'unknown1',
        name: '未知归属一',
        customerId: '1115',
        businessOwnerId: null,
        productCode: '8'
      }, {
        id: 'unknown2',
        name: '未知归属二',
        customerId: '1115',
        businessOwnerId: null,
        productCode: '8'
      }],
      suppliers: [{
        id: 'sup1',
        name: '演示供应商'
      }],
      finance: {
        wallets: [],
        receipts: [],
        orders: [],
        events: [],
        credits: [],
        records: {}
      }
    }
  };
  // Same transaction contract as root.update: invalid draft never replaces db.
  ctx.tx = fn => {
    const draft = structuredClone(ctx.db),
      result = fn(draft);
    ctx.db = draft;
    return result;
  };
  // Required evidence fields now have explicit demo values in existing scenario fixtures.
  // New negative tests call createFinance/actFinance directly or override these values with ''.
  ctx.create = (m, p, role = '商务主管') => ctx.tx(d => createFinance(d, m, {
    occurredAt:'2026-09-21', repaymentTerms:'演示独立约定，按应还日核销', validFrom:'2026-09-21',terms:'演示条款与约定金额范围',cutoffAt:'2026-09-21',
    ...(m==='M15'?{refundSourceId:d.finance.events.find(e=>e.walletId===p.walletId&&e.cashDelta>0)?.id}:{}),...p
  }, sessions[role]));
  ctx.act = (m, id, a, p = {}, role = '财务') => ctx.tx(d => actFinance(d, m, id, a, {
    occurredAt:'2026-09-21',issuedAt:'2026-09-21',paymentRelationship:'客户本人付款',method:'其他有据方式',payee:'演示实际收款人',paymentAccount:'DEMO-OUT-BANK',bankRef:'PAY-'+Math.random(),coverageSources:[{sourceType:'人工凭证',sourceRef:'DEMO-SOURCE-SET',expectedCount:1,checkedCount:1}],...p
  }, sessions[role]));
  ctx.w = (cid = '1115') => ctx.db.finance.wallets.find(w => w.customerId === cid);
  ctx.order = id => ctx.db.finance.orders.find(o => o.id === id);
  ctx.row = (m, id) => ctx.db.finance.records[m].find(r => r.id === id);
  if (seed) ctx.tx(d => loadFinanceDemo(d, sessions['财务']));
  return ctx;
}
function receipt(c, amount, walletId = c.w().id, purpose = '广告本金 / 还款') {
  const id = c.create('M09', {
    sourceAccount: 'DEMO-BANK',
    bankRef: 'ref-' + Math.random(),
    payer: '演示付款人',
    amount,
    evidence: '演示到账凭证',
    occurredAt: '2026-09-21'
  });
  c.act('M09', id, 'confirm');
  c.act('M09', id, 'allocate', {
    walletId,
    amount,
    purpose,
    evidence: '演示认领依据'
  });
  return id;
}
function recharge(c, amount = '1000', accountId = 'a1', walletId = c.w().id) {
  const id = c.create('M12', {
    mode: '新执行',
    accountId,
    walletId,
    amount
  });
  c.act('M12', id, 'assign', {}, '媒介主管');
  c.act('M12', id, 'price', {rate:'0'});
  return id;
}
function finish(c, id) {
  c.act('M12', id, 'freeze', {}, '充值媒介');
  c.act('M12', id, 'start', {}, '充值媒介');
  c.act('M12', id, 'success', {
    evidence: '演示平台成功凭证'
  }, '充值媒介');
  c.act('M12', id, 'post');
}
function grant(c, amount = '100000', type = '常规循环') {
  const id = c.create('M11', {
    walletId: c.w().id,
    amount,
    type,
    validUntil: '2099-12-31',
    dueAt: '2099-12-31',
    reason: '演示信用审批'
  });
  c.act('M11', id, 'approve', {}, 'Boss');
  c.act('M11', id, 'sync', {}, 'Boss');
  return id;
}
function emptyWallet(c) {
  const id = recharge(c, '50000');
  finish(c, id);
}
test('amount parsing is exact, rejects rounding and unsafe values', () => {
  assert.equal(cents('950.52'), 95052);
  assert.equal(cents('0.01'), 1);
  assert.equal(cents('0', {
    allowZero: true
  }), 0);
  for (const v of ['-1', '1.001', 'NaN', '90071992547409.92', '0']) assert.throws(() => cents(v));
});
test('seed uses explicit demo balances once without inventing source types', () => {
  const c = setup();
  assert.equal(c.w().cash, 5000000);
  assert.equal(c.db.customers[0].kind, null);
  assert.throws(() => c.tx(d => loadFinanceDemo(d, sessions['财务'])));
  assert.throws(() => c.create('M10', {
    customerId: 'other',
    kind: '渠道演示结算方'
  }, '财务'), /未知客户类型/);
  const id = c.create('M10', {
    customerId: 'other',
    kind: '普通演示结算方'
  }, '财务');
  assert.equal(c.w('other').id, id);
  assert.equal(c.w('other').cash, 0);
  assert.deepEqual(reconciliation(c.db.finance), []);
});
test('receipt confirmation and source split are separate, duplicate and over-allocation blocked', () => {
  const c = setup(),
    before = c.w().cash;
  const p = {
    sourceAccount: 'bank',
    bankRef: 'one',
    payer: '演示代付款方',
    amount: '100000',
    evidence: '凭证'
  };
  const id = c.create('M09', p);
  assert.equal(c.w().cash, before);
  assert.throws(() => c.create('M09', p), /已存在/);
  assert.throws(() => c.act('M09', id, 'allocate', {
    walletId: c.w().id,
    amount: '1',
    evidence: '依据'
  }), /确认到账/);
  assert.throws(() => c.act('M09', id, 'confirm', {}, '商务'), /不能办理/);
  c.act('M09', id, 'confirm');
  assert.equal(c.w().cash, before);
  assert.throws(() => c.act('M09', id, 'confirm'));
  c.act('M09', id, 'allocate', {
    walletId: c.w().id,
    amount: '60000',
    purpose: '广告本金 / 还款',
    evidence: '分配A'
  });
  c.act('M09', id, 'allocate', {
    walletId: c.w('1098').id,
    amount: '40000',
    purpose: '广告本金 / 还款',
    evidence: '分配B'
  });
  assert.throws(() => c.act('M09', id, 'allocate', {
    walletId: c.w().id,
    amount: '0.01',
    evidence: '超额'
  }));
  assert.equal(c.db.finance.events.filter(e => e.key === 'RECEIPT:' + id).length, 1);
  assert.deepEqual(reconciliation(c.db.finance), []);
});
test('cash freeze races, unknown results and exactly-once recharge posting', () => {
  const c = setup(),
    a = recharge(c, '40000'),
    b = recharge(c, '40000', 'a2');
  c.act('M12', a, 'freeze', {}, '充值媒介');
  assert.equal(availableCash(c.w()), 1000000);
  assert.throws(() => c.act('M12', b, 'freeze', {}, '充值媒介'), /不足/);
  assert.equal(c.order(b).status, '待办理');
  c.act('M12', a, 'start', {}, '充值媒介');
  c.act('M12', a, 'unknown', {}, '充值媒介');
  assert.equal(c.w().frozen, 4000000);
  assert.throws(() => c.act('M12', a, 'retry', {}, '充值媒介'), /未知不可重充/);
  assert.throws(() => recharge(c, '1'), /原单/);
  c.act('M12', a, 'success', {
    evidence: '回查同一请求成功'
  }, '充值媒介');
  assert.equal(c.w().cash, 5000000);
  assert.throws(() => c.act('M12', a, 'fail', {
    evidence: '不可反转已成功'
  }, '充值媒介'));
  c.act('M12', a, 'post');
  c.act('M12', a, 'post');
  assert.equal(c.w().cash, 1000000);
  assert.equal(c.w().frozen, 0);
  assert.equal(c.db.finance.events.filter(e => e.key === 'RECHARGE:' + a).length, 1);
  assert.deepEqual(reconciliation(c.db.finance), []);
});
test('confirmed failed request releases reservation and permits original-order retry', () => {
  const c = setup(),
    id = recharge(c);
  c.act('M12', id, 'freeze', {}, '充值媒介');
  c.act('M12', id, 'start', {}, '充值媒介');
  c.act('M12', id, 'unknown', {}, '充值媒介');
  c.act('M12', id, 'fail', {
    evidence: '平台明确未执行'
  }, '充值媒介');
  assert.equal(c.w().frozen, 0);
  assert.equal(c.w().cash, 5000000);
  c.act('M12', id, 'retry', {}, '充值媒介');
  assert.equal(c.order(id).status, '待派单');
});
test('unverified owner and cross-settlement ordinary recharge cannot bypass restrictions', () => {
  const c = setup();
  assert.throws(() => c.create('M12', {
    mode: '新执行',
    accountId: 'unknown1',
    walletId: c.w().id,
    amount: '100'
  }, '商务'), /明确归属/);
  assert.throws(() => c.create('M12', {
    mode: '新执行',
    accountId: 'a1',
    walletId: c.w('1098').id,
    amount: '100'
  }, '商务'), /结算方范围/);
  const id = c.create('M12', {
    mode: '新执行',
    accountId: 'a1',
    walletId: c.w('1098').id,
    amount: '100'
  }, '渠道商务');
  assert.equal(c.order(id).walletId, c.w('1098').id);
});
test('credit approval must sync; debt is used principal and receipts repay debt first', () => {
  const c = setup();
  emptyWallet(c);
  const id = c.create('M11', {
    walletId: c.w().id,
    amount: '100000',
    type: '常规循环',
    validUntil: '2099-12-31',
    dueAt: '2099-12-31',
    reason: '测试'
  });
  c.act('M11', id, 'approve', {}, 'Boss');
  assert.equal(availableCredit(c.db.finance, c.w().id), 0);
  c.act('M11', id, 'sync', {}, 'Boss');
  assert.throws(() => c.act('M11', id, 'sync', {}, 'Boss'));
  const o = recharge(c, '80000');
  finish(c, o);
  assert.equal(c.w().debt, 8000000);
  assert.equal(c.w().cash, 0);
  receipt(c, '30000');
  assert.equal(c.w().debt, 5000000);
  assert.equal(c.w().cash, 0);
  assert.equal(availableCredit(c.db.finance, c.w().id), 5000000);
  assert.deepEqual(reconciliation(c.db.finance), []);
});
test('temporary credit retires on repayment and does not silently become revolving', () => {
  const c = setup();
  emptyWallet(c);
  const id = grant(c, '1000', '临时'),
    o = recharge(c, '1000');
  finish(c, o);
  receipt(c, '1000');
  assert.equal(c.w().debt, 0);
  assert.equal(availableCredit(c.db.finance, c.w().id), 0);
  assert.equal(c.db.finance.credits.find(x => x.id === id).retired, 100000);
});
test('supplement debt repayment then refund does not reduce debt a second time', () => {
  const c = setup();
  emptyWallet(c);
  const id = c.create('M12', {
    walletId: c.w().id,
    accountId: 'a1',
    mode: '已发生补录',
    amount: '1000',
    occurredAt: '2026-09-21',
    actualTarget: '演示已交付对象',
    evidence: '既成事实'
  }, '财务');
  c.act('M12', id, 'price', {rate:'0'});
  c.act('M12', id, 'supplement');
  assert.equal(c.w().debt, 100000);
  receipt(c, '1000');
  assert.equal(c.w().debt, 0);
  assert.equal(c.order(id).exceptionDebt, 0);
  const refund = c.create('M14', {
    orderId: id,
    amount: '1000',
    reason: '退款'
  });
  c.act('M14', refund, 'success', {
    amount: '1000',
    evidence: '实际退币'
  }, '充值媒介');
  assert.equal(c.w().debt, 0);
  assert.equal(c.w().cash, 100000);
  assert.deepEqual(reconciliation(c.db.finance), []);
});
test('original pricing snapshot and mixed-source refund stay exact across partial returns', () => {
  const c = setup();
  emptyWallet(c);
  receipt(c, '0.01');
  grant(c, '0.01');
  grant(c, '0.01');
  const id = recharge(c, '0.03');
  c.act('M12', id, 'price', {
    rate: '100'
  });
  finish(c, id);
  assert.equal(c.order(id).coins, 6);
  assert.equal(c.w().debt, 2);
  const refund = c.create('M14', {
    orderId: id,
    amount: '0.06',
    reason: '分次退款'
  });
  for (let i = 0; i < 6; i++) {
    c.act('M14', refund, 'success', {
      amount: '0.01',
      evidence: '第' + i + '笔'
    }, '充值媒介');
    assert.ok(c.w().cash >= 0);
    assert.ok(c.w().debt >= 0);
    assert.deepEqual(reconciliation(c.db.finance), []);
  }
  assert.equal(c.w().cash, 1);
  assert.equal(c.w().debt, 0);
  assert.equal(c.order(id).refundedCash, 3);
});
test('cash refund approval is not payment; partial/unknown keep remaining frozen', () => {
  const c = setup(),
    id = c.create('M15', {
      walletId: c.w().id,
      amount: '1000',
      payee: '演示退款方',
      method: '银行',
      receivingBankName:'演示银行支行',
      receivingBankAccount:'DEMO-PAYEE-001',
      accountVerification:'授权新收款账户依据',
      reason: '原款依据'
    });
  assert.throws(() => c.act('M15', id, 'pay', {
    amount: '1000',
    evidence: '凭证'
  }));
  c.act('M15', id, 'approve', {}, 'Boss');
  assert.equal(c.w().cash, 5000000);
  c.act('M15', id, 'freeze');
  c.act('M15', id, 'pay', {
    amount: '300',
    evidence: '实付300'
  });
  c.act('M15', id, 'unknown');
  assert.equal(c.w().frozen, 70000);
  c.act('M15', id, 'fail', {
    evidence: '余款明确未支付'
  });
  assert.equal(c.w().frozen, 0);
  assert.equal(c.w().cash, 4970000);
  assert.deepEqual(reconciliation(c.db.finance), []);
});
test('channel transfer is atomic, cash-only and unavailable to ordinary business', () => {
  const c = setup(),
    p = {
      walletId: c.w('1098').id,
      targetWalletId: c.w().id,
      amount: '1000',
      reason: '跨结算方转账'
    };
  assert.throws(() => c.create('M16', p, '商务'));
  const id = c.create('M16', p, '渠道商务'),
    before = c.db.finance.wallets.reduce((n, w) => n + w.cash, 0);
  c.act('M16', id, 'transfer');
  assert.equal(c.db.finance.wallets.reduce((n, w) => n + w.cash, 0), before);
  assert.equal(c.db.finance.events.filter(e => e.ref === id).reduce((n, e) => n + e.bankDelta, 0), 0);
  assert.throws(() => c.act('M16', id, 'transfer'));
  assert.throws(() => c.create('M16', {
    ...p,
    amount: '1000000'
  }, '渠道商务'));
  assert.deepEqual(reconciliation(c.db.finance), []);
});
test('channel reversal restores only untouched, unfrozen transfer and keeps original events', () => {
  const c = setup(),
    p = {
      walletId: c.w('1098').id,
      targetWalletId: c.w().id,
      amount: '1000',
      reason: '演示转账'
    };
  const id = c.create('M16', p, '渠道商务');
  c.act('M16', id, 'transfer');
  c.act('M16', id, 'reverse', {
    evidence: '目标未使用的原转账更正'
  });
  assert.equal(c.w().cash, 5000000);
  assert.equal(c.row('M16', id).status, '冲正');
  assert.equal(c.db.finance.events.filter(e => e.ref === id).length, 4);
  const dependent = c.create('M16', p, '渠道商务');
  c.act('M16', dependent, 'transfer');
  finish(c, recharge(c, '100'));
  assert.throws(() => c.act('M16', dependent, 'reverse', {
    evidence: '不可自动追回已使用'
  }), /依赖/);
  assert.equal(c.row('M16', dependent).status, '完成');
  assert.deepEqual(reconciliation(c.db.finance), []);
});
test('platform transfer requires same known owner and preserves partial external fact', () => {
  const c = setup();
  assert.throws(() => checkPlatformTransfer(c.db, 'unknown1', 'unknown2'), /未知归属/);
  c.db.accounts[1].businessOwnerId = 'demo-b';
  assert.throws(() => checkPlatformTransfer(c.db, 'a1', 'a2'), /同一归属商务/);
  c.db.accounts[1].businessOwnerId = 'demo-a';
  finish(c, recharge(c));
  const before = c.w().cash,
    id = c.create('M17', {
      sourceAccountId: 'a1',
      targetAccountId: 'a2',
      amount: '500',
      evidence: '支持同产品转户'
    });
  c.act('M17', id, 'out', {}, '充值媒介');
  c.act('M17', id, 'unknown', {}, '充值媒介');
  c.act('M17', id, 'fail', {}, '充值媒介');
  assert.equal(platformAvailable(c.db.finance, 'a1'), 50000);
  assert.equal(platformAvailable(c.db.finance, 'a2'), 0);
  c.act('M17', id, 'in', {
    evidence: '原转入成功'
  }, '充值媒介');
  assert.equal(platformAvailable(c.db.finance, 'a2'), 50000);
  assert.equal(c.w().cash, before);
  const source = c.db.finance.orders[0];
  assert.throws(() => c.create('M14', {
    orderId: source.id,
    amount: '1000',
    reason: '不能退已转出的币'
  }), /已.*转出/);
});
test('classification and supplier allocation do not double-charge customer wallet', () => {
  const c = setup(),
    o = recharge(c);
  finish(c, o);
  const before = c.w().cash;
  const classification = c.create('M13', {
    orderId: o,
    collectionClass: '首续',
    accountClass: '续费',
    incomeClass: '待核算确认',
    reason: '独立分类'
  });
  c.act('M13', classification, 'confirm');
  assert.equal(c.w().cash, before);
  const supplier = c.create('M18', {
    supplierId: 'sup1',
    type: '供应商预存',
    amount: '1000',
    evidence: '付款依据'
  }, '财务');
  c.act('M18', supplier, 'pay', {
    amount: '500',
    evidence: '先付500'
  });
  c.act('M18', supplier, 'allocate', {
    amount: '500',
    orderId: o
  });
  assert.equal(c.row('M18', supplier).status, '部分付款');
  c.act('M18', supplier, 'pay', {
    amount: '500',
    evidence: '余款500'
  });
  c.act('M18', supplier, 'allocate', {
    amount: '500',
    orderId: o
  });
  assert.equal(c.row('M18', supplier).status, '已分配');
  assert.equal(c.w().cash, before);
});
test('service fee is a separate asset; rebate other payment is not also cash credit', () => {
  const c = setup(),
    before = c.w().cash;
  receipt(c, '1000', c.w().id, '独立服务费');
  assert.equal(c.w().cash, before);
  assert.equal(c.w().service, 100000);
  const id = c.create('M19', {
    walletId: c.w().id,
    type: '服务费',
    amount: '1000',
    reason: '收费约定'
  }, '财务');
  c.act('M19', id, 'confirm');
  c.act('M19', id, 'use', {
    amount: '300'
  });
  c.act('M19', id, 'refund', {
    amount: '700',
    payee: '实际原付款方',
    evidence: '原服务费退款'
  });
  assert.equal(c.w().service, 0);
  assert.equal(c.w().cash, before);
  const rebate = c.create('M19', {
    walletId: c.w().id,
    type: '后返',
    amount: '100',
    reason: '约定人民币应返'
  }, '财务');
  c.act('M19', rebate, 'confirm');
  c.act('M19', rebate, 'pay', {
    amount: '100',
    payee: '其他实际接收方',
    method: '其他有据方式',
    evidence: '非预留户返付凭证'
  });
  assert.equal(c.w().cash, before);
  assert.throws(() => c.act('M19', rebate, 'pay', {
    amount: '1',
    payee: '重复',
    evidence: '重复'
  }));
  assert.deepEqual(reconciliation(c.db.finance), []);
});
test('contract version and invoice occupancy preserve source and cash facts', () => {
  const c = setup(),
    before = c.w().cash,
    id = c.create('M20', {
      walletId: c.w().id,
      subjectId: 's1',
      contractNo: 'DEMO-C',
      amount: '1000',
      validUntil: '2099-01-01',
      evidence: '原合同条款'
    });
  c.act('M20', id, 'submit', {}, '商务主管');
  c.act('M20', id, 'sign', {
    evidence: '签署原件'
  });
  c.act('M20', id, 'version', {}, '商务主管');
  const next = c.db.finance.records.M20.find(x => x.parentId === id);
  c.act('M20', next.id, 'revise', {
    amount: '2000',
    validUntil: '2099-02-01',
    evidence: '新条款'
  }, '商务主管');
  assert.equal(c.row('M20', id).amount, 100000);
  assert.equal(c.row('M20', next.id).amount, 200000);
  const p = {
    walletId: c.w().id,
    sourceType: '有效合同',
    sourceId: id,
    title: '演示抬头',
    taxNo: 'DEMO',
    amount: '1000',
    basis: '合同可开'
  };
  const bill = c.create('M21', p);
  assert.throws(() => c.create('M21', p), /重复占用/);
  c.act('M21', bill, 'approve');
  c.act('M21', bill, 'issue', {
    amount: '1000',
    billNo: 'DEMO-INV',
    evidence: '实际蓝票'
  });
  assert.throws(() => c.act('M21', bill, 'cancel'), /已开票/);
  c.act('M21', bill, 'red', {
    evidence: '原票红冲依据'
  });
  c.act('M21', bill, 'red-complete', {
    billNo: 'DEMO-RED',
    evidence: '实际红票'
  });
  assert.equal(c.row('M21', bill).status, '红冲完成');
  assert.doesNotThrow(() => c.create('M21', p));
  assert.equal(c.w().cash, before);
});
test('tail acceptance changes no cash; reconciliation cannot hide unknown result', () => {
  const c = setup(),
    before = c.w().cash,
    tail = c.create('M22', {
      type: '尾差处理',
      period: 'DEMO-BILL',
      receivable: '950.52',
      actual: '950',
      reason: '常见小额尾差人工接受'
    }, '财务');
  c.act('M22', tail, 'accept', {
    evidence: '财务有据接受'
  });
  assert.equal(c.row('M22', tail).difference, -52);
  assert.equal(c.w().cash, before);
  const q = c.create('M22', {
      type: '期间对账',
      period: '2026-09',
      reason: '检查演示全部事件及原始来源'
    }, '财务'),
    id = recharge(c);
  c.act('M12', id, 'freeze', {}, '充值媒介');
  c.act('M12', id, 'start', {}, '充值媒介');
  c.act('M12', id, 'unknown', {}, '充值媒介');
  c.act('M22', q, 'scan');
  assert.equal(c.row('M22', q).status, '差异待核实');
  assert.throws(() => c.act('M22', q, 'close', {
    evidence: '不能强行对平'
  }));
  c.act('M12', id, 'fail', {
    evidence: '明确未发生'
  }, '充值媒介');
  c.act('M22', q, 'scan');
  c.act('M22', q, 'close', {
    evidence: '全部演示来源覆盖核验'
  });
  c.act('M22', q, 'seal');
  c.act('M22', q, 'reopen', {
    evidence: '授权重开'
  });
  assert.equal(c.row('M22', q).version, 2);
  assert.equal(c.row('M22', q).previousVersions[0].status, '已封存');
});
test('current month seal blocks money mutations until authorized recorded reopen', () => {
  const c = setup(),
    id = c.create('M22', {
      type: '期间对账',
      period: new Date().toISOString().slice(0, 7),
      reason: '当月全部演示来源'
    }, '财务');
  c.act('M22', id, 'scan');
  c.act('M22', id, 'close', {
    evidence: '来源覆盖'
  });
  c.act('M22', id, 'seal');
  assert.throws(() => receipt(c, '10'), /封存/);
  assert.throws(() => recharge(c), /封存/);
  c.act('M22', id, 'reopen', {
    evidence: '授权重开更正'
  });
  assert.doesNotThrow(() => receipt(c, '10'));
});

test('third-party allocation preserves payer, evidence and confirmation identity separately',()=>{
  const c=setup();
  assert.throws(()=>c.create('M09',{sourceAccount:'IN',bankRef:'R0',payer:'P',amount:'100',occurredAt:''}),/发生日期/);
  const id=c.create('M09',{sourceAccount:'IN',bankRef:'R1',payer:'演示第三方本人',payerAccount:'000012345678901234567890',receivingBankName:'演示公司开户支行',amount:'100',evidence:'原银行凭证',receivableRef:'AR-DEMO'});
  c.act('M09',id,'confirm');
  const p={walletId:c.w().id,amount:'100',purpose:'广告本金 / 还款',paymentRelationship:'第三方代付',evidence:'分配说明'};
  assert.throws(()=>c.act('M09',id,'allocate',p),/代付关系依据/);
  c.act('M09',id,'allocate',{...p,thirdPartyBasis:'客户确认由此公司代付的演示附件'});
  const r=c.db.finance.receipts.find(r=>r.id===id);
  assert.equal(r.payer,'演示第三方本人');assert.equal(r.payerAccount,'000012345678901234567890');
  assert.equal(r.confirmedBy,'演示财务');assert.ok(r.confirmedAt);
  assert.equal(r.allocations[0].thirdPartyBasis,'客户确认由此公司代付的演示附件');
  assert.equal(r.allocations[0].receivableRef,'AR-DEMO');
  assert.equal(financeRecordRoute(c.db.finance,id),'M09');
});

test('pending receipt can complete evidence without changing source, amount or money',()=>{
  const c=setup(),cash=c.w().cash,id=c.create('M09',{sourceAccount:'IN',bankRef:'PENDING',payer:'P',amount:'25'});
  assert.throws(()=>c.act('M09',id,'confirm'),/凭证/);
  c.act('M09',id,'amend',{evidence:'补充真实演示凭证',payerAccount:'00000000000000000001'},'商务');
  const r=c.db.finance.receipts.find(r=>r.id===id);assert.equal(r.amount,2500);assert.equal(r.bankRef,'PENDING');assert.equal(c.w().cash,cash);
  c.act('M09',id,'confirm');assert.throws(()=>c.act('M09',id,'amend',{evidence:'覆盖旧凭证'}),/不可覆盖/);
});

test('refund source enforces funder, reservations and immutable source snapshot',()=>{
  const c=setup(),source=refundableSources(c.db.finance,c.w().id)[0];
  const p={walletId:c.w().id,refundSourceId:source.id,amount:'30000',payee:'演示收款人',method:'其他有据方式',reason:'原备款退回'};
  assert.throws(()=>c.create('M15',{...p,refundSourceId:refundableSources(c.db.finance,c.w('1098').id)[0].id}),/本结算方/);
  const id=c.create('M15',p);
  assert.throws(()=>c.create('M15',p),/未被其他退款占用/);
  assert.equal(c.row('M15',id).refundSourceSnapshot.cashDelta,5000000);
  c.act('M15',id,'approve',{},'Boss');c.act('M15',id,'freeze');
  c.act('M15',id,'pay',{amount:'100',evidence:'实际退款凭证',bankRef:'REFUND-ONCE',payee:'核对后的演示收款人'});
  assert.equal(c.row('M15',id).approvedAmount,3000000);
  assert.equal(c.row('M15',id).payments[0].payee,'核对后的演示收款人');
  assert.throws(()=>c.act('M15',id,'pay',{amount:'100',evidence:'重复凭证',bankRef:'REFUND-ONCE'}),/不能重复/);
  assert.equal(c.row('M15',id).paid,10000);
});

test('legacy unexecuted refund can complete source details but must receive a fresh approval',()=>{
  const c=setup(),source=refundableSources(c.db.finance,c.w().id)[0],id=c.create('M15',{walletId:c.w().id,refundSourceId:source.id,amount:'100',payee:'原收款人',method:'其他有据方式',reason:'原款退回'});
  c.act('M15',id,'approve',{},'Boss');
  delete c.row('M15',id).refundSourceId;
  c.act('M15',id,'amend-source',{refundSourceId:source.id,payee:'核实后的新收款人',method:'其他有据方式',accountVerification:'补核原款来源及收款授权'},'商务主管');
  assert.equal(c.row('M15',id).status,'待审批');assert.equal(c.row('M15',id).approvedBy,null);
  assert.equal(c.row('M15',id).sourceVersions[0].approvedBy,'演示Boss');
  assert.throws(()=>c.act('M15',id,'freeze'),/审批/);
  c.act('M15',id,'approve',{},'Boss');c.act('M15',id,'freeze');
  assert.throws(()=>c.act('M15',id,'amend-source',{refundSourceId:source.id,payee:'不能变更',method:'其他有据方式',accountVerification:'新资料'}),/冻结或付款后/);
});

test('bank payment requires independent payee account and blocks cross-module duplicate result',()=>{
  const c=setup();c.db.suppliers[0].agentName='演示代理商';c.db.suppliers[0].bankAccount='00000000000000000001';c.db.suppliers[0].bankName='演示供应商支行';c.db.suppliers[0].recordVersion=2;
  const id=c.create('M18',{supplierId:'sup1',type:'供应商预存',amount:'500',evidence:'预付款约定'},'财务');
  c.db.suppliers[0].bankAccount='AFTER-CHANGED';
  const p={amount:'100',method:'银行转账（演示）',payee:'实际供应商收款人',paymentAccount:'OUT',bankRef:'SAME',receivingBankName:'实际银行支行',receivingBankAccount:'00000000000000000002',evidence:'付款结果'};
  assert.throws(()=>c.act('M18',id,'pay',p),/收款关系/);
  c.act('M18',id,'pay',{...p,accountVerification:'核对实际收款账号附件'});
  const r=c.row('M18',id);assert.equal(r.supplierSnapshot.bankAccount,'00000000000000000001');assert.equal(r.payments[0].receivingBankAccount,'00000000000000000002');
  const rebate=c.create('M19',{walletId:c.w().id,type:'后返',amount:'100',reason:'单独返付约定'},'财务');c.act('M19',rebate,'confirm');
  assert.throws(()=>c.act('M19',rebate,'pay',{...p,accountVerification:'同凭证重复'}),/不能重复/);
  assert.equal(c.row('M19',rebate).paid,0);
});

test('finance zero-rate confirmation is required and pricing/supplier snapshot survive later changes',()=>{
  const c=setup(),id=c.create('M12',{accountId:'a1',walletId:c.w().id,amount:'100',mode:'新执行'});
  c.act('M12',id,'assign',{},'媒介主管');
  assert.throws(()=>c.act('M12',id,'freeze',{},'充值媒介'),/财务确认/);
  c.act('M12',id,'price',{rate:'0',evidence:'本单明确不返点'});
  c.act('M12',id,'freeze',{},'充值媒介');
  assert.throws(()=>c.act('M12',id,'price',{rate:'8'}),/不能覆盖/);
  assert.equal(c.order(id).pricingSnapshot.frontRate,0);assert.equal(c.order(id).pricingSnapshot.confirmedBy,'演示财务');
  c.db.accounts[0].supplierId='changed';assert.equal(c.order(id).supplierId,'sup1');
});

test('approved credit version mismatch cannot synchronize as current approval',()=>{
  const c=setup(),id=c.create('M11',{walletId:c.w().id,type:'常规循环',amount:'100',validUntil:'2099-01-01',dueAt:'2099-02-01',reason:'用途'});
  c.act('M11',id,'approve',{},'Boss');c.db.finance.credits.find(r=>r.id===id).version++;
  assert.throws(()=>c.act('M11',id,'sync',{},'Boss'),/批准版本/);
  assert.equal(availableCredit(c.db.finance,c.w().id),0);
});

test('supplement rejects an explicit supplier that conflicts with the selected account without saving',()=>{
  const c=setup();c.db.suppliers.push({id:'sup2',name:'演示供应商二'});
  const before=structuredClone(c.db);
  assert.throws(()=>c.create('M12',{walletId:c.w().id,accountId:'a1',mode:'已发生补录',amount:'100',actualTarget:'演示实际交付账户',supplierId:'sup2',evidence:'实际交付核验'},'财务'),/供应商不一致.*不会自动覆盖/);
  assert.deepEqual(c.db,before);
});

test('supplement uses matching supplier or account fallback and preserves explicit supplier when the account has none',()=>{
  const c=setup();c.db.suppliers.push({id:'sup2',name:'演示供应商二',agentId:'DEMO-AGENT-2'});
  const p={walletId:c.w().id,mode:'已发生补录',amount:'100',actualTarget:'演示实际交付账户',evidence:'实际交付核验'};
  const matching=c.create('M12',{...p,accountId:'a1',supplierId:'sup1'},'财务');
  const fallback=c.create('M12',{...p,accountId:'a2',supplierId:''},'财务');
  const unknown=c.create('M12',{...p,accountId:'unknown1',supplierId:'sup2'},'财务');
  assert.equal(c.order(matching).supplierId,'sup1');assert.equal(c.order(fallback).supplierId,'sup1');
  assert.equal(c.order(unknown).supplierId,'sup2');assert.equal(c.order(unknown).supplierSnapshot.agentId,'DEMO-AGENT-2');
  c.db.suppliers.find(s=>s.id==='sup2').agentId='later-change';
  assert.equal(c.order(unknown).supplierSnapshot.agentId,'DEMO-AGENT-2');
});

test('invoice source rows sum exactly, hold each source and preserve invoice dates',()=>{
  const c=setup(),a=receipt(c,'600'),b=receipt(c,'400');
  const p={walletId:c.w().id,sourceType:'收款分配',sourceLines:[{sourceId:a,amount:'600'},{sourceId:b,amount:'400'}],amount:'1000',title:'演示票据抬头',taxNo:'DEMO-TAX',basis:'两笔分配合并开票'};
  assert.throws(()=>c.create('M21',{...p,amount:'999'}),/合计/);
  const id=c.create('M21',p);assert.throws(()=>c.create('M21',p),/重复占用/);
  c.act('M21',id,'approve');
  assert.throws(()=>c.act('M21',id,'issue',{amount:'1000',billNo:'INV1',evidence:'真实票据演示',issuedAt:''}),/开票日期/);
  c.act('M21',id,'issue',{amount:'1000',billNo:'INV1',issuedAt:'2026-09-20',attachmentRef:'DEMO-file-1',evidence:'实际蓝票'});
  const r=c.row('M21',id);assert.equal(r.bills[0].issuedAt,'2026-09-20');assert.equal(r.bills[0].sourceSnapshot.length,2);assert.equal(r.bills[0].attachmentRef,'DEMO-file-1');
});

test('contract versions retain dates and terms while duplicate active drafts are blocked',()=>{
  const c=setup(),id=c.create('M20',{walletId:c.w().id,subjectId:'s1',contractNo:'VERSION-DEMO',amount:'1000',validFrom:'2026-09-01',validUntil:'2099-01-01',terms:'原条款',evidence:'原件'});
  c.act('M20',id,'submit',{},'商务主管');c.act('M20',id,'sign',{occurredAt:'2026-09-02',evidence:'签署原件'});
  const newId=c.act('M20',id,'version',{},'商务主管');assert.ok(newId);
  assert.throws(()=>c.act('M20',id,'version',{},'商务主管'),/已有变更草稿/);
  c.act('M20',newId,'revise',{amount:'2000',validFrom:'2026-09-03',validUntil:'2099-03-01',terms:'新条款',evidence:'变更依据'},'商务主管');
  assert.equal(c.row('M20',id).terms,'原条款');assert.equal(c.row('M20',id).signedAt,'2026-09-02');assert.equal(c.row('M20',newId).signedAt,null);assert.equal(financeRecordRoute(c.db.finance,newId),'M20');
});

test('channel delivery matching links detail without a second cash or platform posting',()=>{
  const c=setup(),id=c.create('M12',{walletId:c.w('1098').id,mode:'已发生补录',amount:'1000',actualTarget:'演示渠道平台钱包',supplierId:'sup1',evidence:'交付原证'},'财务');
  c.act('M12',id,'price',{rate:'0'});c.act('M12',id,'supplement');
  const cash=c.w('1098').cash,count=c.db.finance.events.length;
  c.act('M12',id,'match',{accountId:'a1',amount:'600',matchRef:'DETAIL-1',evidence:'已交付明细核验'},'充值媒介');
  assert.throws(()=>c.act('M12',id,'match',{accountId:'a2',amount:'500',matchRef:'DETAIL-2',evidence:'超额'}),/不能超过/);
  assert.throws(()=>c.act('M12',id,'match',{accountId:'a1',amount:'100',matchRef:'DETAIL-1',evidence:'重复'}),/重复/);
  assert.equal(c.w('1098').cash,cash);assert.equal(c.db.finance.events.length,count);assert.equal(c.order(id).accountId,null);assert.equal(c.order(id).deliveryMatches.length,1);
});

test('structured coverage blocks missing or partial source review and survives reopen',()=>{
  const c=setup(),id=c.create('M22',{type:'期间对账',period:'2026-09',reason:'来源完整性核验'},'财务');
  c.act('M22',id,'scan');
  assert.throws(()=>c.act('M22',id,'close',{evidence:'缺来源',coverageSources:[]}),/逐项/);
  assert.throws(()=>c.act('M22',id,'close',{evidence:'未填数量',coverageSources:[{sourceType:'银行流水',sourceRef:'DEMO-BANK-BATCH',expectedCount:'',checkedCount:''}]}),/相等/);
  assert.throws(()=>c.act('M22',id,'close',{evidence:'少一笔',coverageSources:[{sourceType:'银行流水',sourceRef:'DEMO-BANK-BATCH',expectedCount:2,checkedCount:1}]}),/相等/);
  c.act('M22',id,'close',{evidence:'核验完毕',coverageSources:[{sourceType:'银行流水',sourceRef:'DEMO-BANK-BATCH',expectedCount:2,checkedCount:2}]});
  c.act('M22',id,'seal');c.act('M22',id,'reopen',{evidence:'授权补充'});
  assert.equal(c.row('M22',id).previousVersions[0].coverageSources[0].sourceRef,'DEMO-BANK-BATCH');
  assert.ok(c.row('M22',id).previousVersions[0].balanceSnapshot.eventIds.length);
});

test('void contract stops pending invoice processing without deleting issued evidence',()=>{
  const c=setup(),contract=c.create('M20',{walletId:c.w().id,subjectId:'s1',contractNo:'VOID-DEMO',amount:'100',validUntil:'2099-01-01',evidence:'原件'});
  c.act('M20',contract,'submit',{},'商务主管');c.act('M20',contract,'sign',{evidence:'签署原件'});
  const invoice=c.create('M21',{walletId:c.w().id,sourceType:'有效合同',sourceId:contract,amount:'100',title:'演示抬头',taxNo:'DEMO',basis:'有效合同'});
  c.act('M21',invoice,'approve');c.act('M21',invoice,'issue',{amount:'50',billNo:'HALF',evidence:'实际票据'});
  c.act('M20',contract,'void',{evidence:'有据作废'});
  assert.throws(()=>c.act('M21',invoice,'issue',{amount:'50',billNo:'SECOND',evidence:'不能沿无效合同继续'}),/已无效/);
  assert.equal(c.row('M21',invoice).issued,5000);assert.equal(c.row('M21',invoice).bills[0].number,'HALF');
});
