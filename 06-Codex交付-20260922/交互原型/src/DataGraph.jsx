import React,{useState} from 'react';
import {getSubjectDirect} from './core-fields.js';
export default function DataGraph({db,customerId,openAccount}){
  const [expanded,setExpanded]=useState(null);
  const customer=db.customers.find(c=>c.id===customerId);
  const subjects=db.subjects.filter(s=>s.customerIds.includes(customerId));
  const own=db.accounts.filter(a=>a.customerId===customerId);
  const name=listId=>db.customers.find(c=>c.id===listId)?.name||listId;
  return <div className="data-graph">
    <div className="graph-origin"><span>公共客户 · #{customerId}</span><strong>{customer?.name}</strong><small>{subjects.length} 个关联主体 / {own.length} 个本客户账户</small></div>
    <div className="graph-caption">客户引用公共资料 · 主体维护直客，唯一店铺维护来客，账户独立保存纵横</div>
    <div className="graph-subjects">{subjects.map(subject=>{
      const shops=db.shops.filter(s=>s.subjectId===subject.id);
      const isOpen=expanded===subject.id,direct=getSubjectDirect(db,subject.id);
      return <section key={subject.id} className={'graph-subject '+(isOpen?'is-open':'')}>
        <button className="graph-subject-title" onClick={()=>setExpanded(isOpen?null:subject.id)} aria-expanded={isOpen}><span>主体 #{subject.id}</span><strong>{subject.name}</strong><small>主体直客：{direct.directId||'未填写'} · 名称与主体一致</small><small>{shops.length>1?'历史关系待核对：'+shops.length+' 个店铺 / 档案':shops.length===1?'已关联唯一店铺 / 档案':'尚未关联店铺'} · {own.filter(a=>a.subjectId===subject.id).length} 个本客户账户 <b>{isOpen?'收起':'展开'}</b></small></button>
        {isOpen&&<div className="graph-shops">{shops.map(shop=>{
          const all=db.accounts.filter(a=>a.shopId===shop.id);
          return <div className="graph-shop" key={shop.id}><div className="graph-shop-label"><strong>{shop.name}</strong><small>店铺 / 档案 #{shop.id}</small>{shop.laikeId?<><span>当前来客 · 1 个</span><code>{shop.laikeId}</code></>:<span>来客：未核验或该产品不适用</span>}</div><div className="graph-accounts">{all.length?all.map(a=><button key={a.id} className={'graph-account '+(a.customerId===customerId?'':'shared')} onClick={()=>openAccount(a.id)}><small>{a.customerId===customerId?'本客户业务':'共享核对 · '+name(a.customerId)} · {a.product}{a.demo?' · 本地演示':a.localChange?' · 本地更正':''}</small><b>{a.name||a.externalId}</b><code>{a.externalId}</code><span>复用主体直客<br/>纵横 {a.zonghengId||'未登记'}</span><small>负责商务：{a.businessOwnerName||'待核验'}</small></button>):<p className="muted">该店铺 / 档案在本次样本中没有账户。</p>}</div></div>;
        })}</div>}
      </section>;
    })}</div>
    <p className="graph-legend">实线层级用于资料定位；直客属于主体，纵横属于账户。一主体一店；历史多店保留核对，不自动合并。商务责任、每笔业务的资金方通过关联保存，不作为公共客户下的另一份余额。这里只显示样本及本地演示，不代表生产全量。</p>
  </div>;
}
