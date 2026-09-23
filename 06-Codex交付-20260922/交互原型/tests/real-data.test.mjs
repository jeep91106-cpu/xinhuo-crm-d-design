import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const db=JSON.parse(await readFile(new URL('../src/realData.json',import.meta.url),'utf8'));
test('真实样本内部主键与外键完整，长编号全部用字符串',()=>{
  for(const key of ['customers','subjects','shops','accounts','suppliers'])assert.equal(new Set(db[key].map(x=>x.id)).size,db[key].length,key);
  for(const a of db.accounts){
    assert.equal(typeof a.externalId,'string');
    assert.ok(db.customers.some(c=>c.id===a.customerId),a.id);
    const subject=db.subjects.find(s=>s.id===a.subjectId);assert.ok(subject?.customerIds.includes(a.customerId),a.id);
    assert.ok(db.shops.some(s=>s.id===a.shopId&&s.subjectId===a.subjectId),a.id);
    assert.ok(db.suppliers.some(s=>s.id===a.supplierId),a.id);
    assert.equal(a.directId,null);assert.equal(a.zonghengId,null);assert.equal(a.businessOwnerId,null);
  }
});
test('潮拍摄影样本确为一店一已互证来客、多广告账户',()=>{
  const shop=db.shops.find(s=>s.id==='8819');
  assert.equal(shop.laikeId,'7230041288479868968');
  assert.ok(shop.laikeVerified);
  assert.equal(db.accounts.filter(a=>a.shopId===shop.id).length,4);
  assert.equal(db.shops.filter(s=>s.laikeVerified).length,6);
});
