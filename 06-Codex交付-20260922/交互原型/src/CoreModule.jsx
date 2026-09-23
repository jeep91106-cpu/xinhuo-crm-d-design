import React,{useState,useEffect,useRef} from 'react';
import DataGraph from './DataGraph.jsx';
import OpeningApplication,{ZonghengEditor,personLabel} from './OpeningApplication.jsx';
import DraftList from './DraftList.jsx';
import {openingDraftActorKey,listOpeningDrafts,getOpeningDraft,saveOpeningDraft,consumeOpeningDraft,assertOpeningDraftSubmission} from './opening-drafts.js';
import {openingWorkbenchRecords,relatedOpeningRecord} from './opening-workbench.js';
import {SubjectEditor,SubjectSummary,ShopEditor,LinkSubjectEditor,SupplierEditor,DirectEditor} from './CoreFields.jsx';
import {canMaintainPublic,linkSubject,getSubjectDirect,subjectSnapshot,subjectValues} from './core-fields.js';
import OpeningAttachments from './OpeningAttachments.jsx';
import {validateOpeningAttachments} from './opening-attachments.js';
import './opening.css';
import {Badge,Notice,PageHeader,Section,Field,Modal,Empty,DataTable} from './ui.jsx';
import {PRODUCTS,uid,allowed,canAccount,canHandleOpening,customerAccounts,sharedAccounts,validateOpening,finishOpening,addCustomer,normalizeName,supplierEligible,workflowFor,openingFieldErrors,approveOpeningStep,assignOpening,cancelOpeningRow} from './model.js';
const nameOf=(list,id)=>list.find(x=>x.id===id)?.name||'待核验';
const localTime=at=>new Date(at).toLocaleString('zh-CN');
const businessDirectory=[{id:'demo-sales-a',name:'演示商务 A'},{id:'demo-sales-b',name:'演示商务 B'}];
const businessName=id=>businessDirectory.find(person=>person.id===id)?.name||'';
const accountOrigin=a=>a.demo?'本地流程演示':a.localChange?'真实样本＋本地更正':'真实历史资料';
function Copy({value}){return <button className="copy" title="复制完整编号" onClick={async e=>{e.stopPropagation();try{await navigator.clipboard.writeText(value)}catch{} }}>{value}</button>}
function AccountTable({db,rows,openAccount,selected,onSelect,extraColumns=false}){
  return <DataTable rows={rows} selected={selected} onSelect={onSelect} onRow={r=>openAccount(r.id)} columns={[
    {key:'name',label:'广告账户 / 完整 ID',render:r=><div className="account-cell"><strong>{r.name||r.externalId}</strong><Copy value={r.externalId}/>{(r.demo||r.localChange)&&<Badge tone={r.demo?"blue":"amber"}>{accountOrigin(r)}</Badge>}</div>},
    {key:'product',label:'产品 / 办理资料',render:r=><><span>{r.product}</span><small className="muted block">{r.demo?'演示开户':r.localChange?'真实样本＋本地更正':'历史账户档案'}</small></>},
    {key:'customerId',label:'客户 / 主体 / 店铺',render:r=><div className="relation-cell"><b>{nameOf(db.customers,r.customerId)}</b><span>{nameOf(db.subjects,r.subjectId)}</span><small>{nameOf(db.shops,r.shopId)}</small></div>},
    {key:'businessOwnerName',label:'负责商务',render:r=><span className={!r.businessOwnerName?'muted':''}>{r.businessOwnerName||'归属待核验'}</span>},
    ...(extraColumns?[{key:'laike',label:'来客 / 直客 / 纵横',render:r=><div className="relation-cell"><span>来客 {db.shops.find(s=>s.id===r.shopId)?.laikeId||'未核验'}</span><span>主体直客 {getSubjectDirect(db,r.subjectId).directId||'未登记'}</span><span>纵横 {r.zonghengId||'未登记'}</span></div>}]:[]),
    {key:'status',label:'资料状态',render:r=><Badge tone={r.demo?'green':'neutral'}>{r.demo&&!r.zonghengId&&r.product==='本地推'?'完成 · 纵横待补':r.status}</Badge>},
    {key:'action',label:'操作',render:r=><button className="text-btn" onClick={e=>{e.stopPropagation();openAccount(r.id)}}>查看详情</button>}
  ]}/>;
}
export function AccountDetail({accountId,db,session,update,go,toast,onClose}){
  const a=db.accounts.find(x=>x.id===accountId),[tab,setTab]=useState('资料'),[editDirect,setEditDirect]=useState(false),[editZh,setEditZh]=useState(false),[savedPlatformRevision,setSavedPlatformRevision]=useState(0);
  if(!a)return null;const shop=db.shops.find(s=>s.id===a.shopId),app=db.applications.find(x=>x.id===a.applicationId),direct=getSubjectDirect(db,a.subjectId),canEditRecord=!app||session.role!=='开户媒介'||canHandleOpening(session,app);
  return <Modal title="广告账户完整详情" onClose={onClose} wide resetDirtyKey={savedPlatformRevision} footer={({close})=><>{app&&<button className="btn primary" onClick={()=>close(()=>{onClose();go('M06',{applicationId:app.id})})}>返回开户申请</button>}<button className="btn" onClick={()=>close(()=>{onClose();go('M02',{customerId:a.customerId})})}>进入客户全景</button><button className="btn" onClick={()=>close(()=>{onClose();go('M07',{accountId:a.id})})}>复制资料申请</button><button className="btn primary" onClick={()=>close(()=>{onClose();go('M12',{accountId:a.id})})}>发起充值</button></>}>
    {({close})=><><div className="detail-title"><h2>{a.name||a.externalId}</h2><Copy value={a.externalId}/><Badge tone={a.demo?'blue':a.localChange?'amber':'green'}>{accountOrigin(a)}</Badge></div>
    <div className="tabs">{['资料','关联业务','变更记录','来源'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {tab==='资料'&&<><div className="grid2"><Section title="公共资料"><dl className="kv"><dt>客户</dt><dd>{nameOf(db.customers,a.customerId)} <span className="muted">#{a.customerId}</span></dd><dt>主体</dt><dd>{nameOf(db.subjects,a.subjectId)}</dd><dt>统一社会信用代码</dt><dd>{db.subjects.find(s=>s.id===a.subjectId)?.creditCode||'未填写'}</dd><dt>{a.product==='本地推'?'店铺':'业务档案'}</dt><dd>{shop?.name}</dd><dt>该店当前来客</dt><dd>{a.product==='本地推'?(shop?.laikeId||'未填写'):'此产品不适用'}</dd><dt>旧业务编号</dt><dd className="mono">{shop?.legacyNo||'—'}</dd></dl></Section><Section title="平台身份"><dl className="kv"><dt>平台产品</dt><dd>{a.product}</dd><dt>广告账户 ID</dt><dd className="mono">{a.externalId}</dd><dt>主体名称（直客名称）</dt><dd>{a.product==='本地推'?(direct.directName||'未登记'):'不适用'}</dd><dt>主体直客 ID</dt><dd>{a.product==='本地推'?(direct.directId||'未登记；可在主体资料补全'):'不适用'}</dd><dt>该账户纵横 ID</dt><dd>{a.zonghengId||'未登记'}</dd><dt>供应商</dt><dd>{nameOf(db.suppliers,a.supplierId)}</dd></dl></Section><Section title="责任与办理"><dl className="kv"><dt>负责商务</dt><dd>{a.businessOwnerName||'未指定'}</dd><dt>协办</dt><dd>{a.collaborators?.map(c=>c.name).join('、')||'未设置'}</dd><dt>来源申请</dt><dd>{app?.id||'历史账户'}</dd><dt>当前媒介</dt><dd>{app?.assignee||'未记录'}</dd></dl></Section><Section title="业务资金关系"><p>每笔业务分别保存实际资金方。公共客户、负责商务、出资渠道是不同关系。</p><button className="btn" onClick={()=>close(()=>{onClose();go('M10',{accountId:a.id})})}>查看授权资金台账</button><p className="muted">没有选择业务单时，不把最近资金方当作账户永久钱包。</p></Section></div>
    {a.product==='本地推'&&<Section title="直客资料"><p>直客在主体资料维护，同主体账户复用。名称与主体一致，直客 ID 非必填。</p><button className="btn" disabled={!canMaintainPublic(session)||!canEditRecord} onClick={()=>setEditDirect(true)}>编辑直客资料</button></Section>}
    {a.product==='本地推'&&allowed(session,'edit')&&canEditRecord&&<Section title="纵横资料"><dl className="kv"><dt>纵横 ID</dt><dd>{a.zonghengId||'未填写'}</dd></dl><button className="btn primary" onClick={()=>setEditZh(true)}>{a.zonghengId?'修改纵横 ID':'补充纵横 ID'}</button></Section>}</>}
    {tab==='关联业务'&&<Section title="本地原型办理记录">{app?<><p>{app.id} · {app.status}</p><button className="btn" onClick={()=>close(()=>{onClose();go('M06',{applicationId:app.id})})}>查看来源开户单</button></>:<Notice>此账户来自历史数据库样本；原型没有假造它的历史开户单。可以发起新的本地演示业务。</Notice>}</Section>}
    {tab==='变更记录'&&<div className="timeline">{(a.changes||[]).map((e,i)=><div key={i}><b>{localTime(e.at)}</b><p>{e.text}</p></div>)}{!a.changes?.length&&<Empty title="没有本地变更" detail="现有历史字段尚未在此原型中修改。"/>}</div>}
    {tab==='来源'&&<><Notice>{a.demo?'该记录由本地原型创建，未在平台或生产 CRM 开户。':a.localChange?'基础资料来自真实历史样本；归属或纵横等当前值包含本地演示更正，未写回生产。请结合变更记录核对，不能把本地更正当作生产事实。':'资料为历史数据库及只读查询缓存中的真实样本，不代表当前平台状态。'}</Notice><pre className="source">{a.source}</pre><p>客户、主体、店铺和账号按稳定 ID 关联；银行资料、真实余额、电话未导入。</p></>}
    {editZh&&<ZonghengEditor db={db} accountId={a.id} session={session} update={update} toast={toast} onClose={()=>setEditZh(false)}/> }
    {editDirect&&<DirectEditor db={db} session={session} update={update} accountId={a.id} onClose={()=>setEditDirect(false)}/>}
    </>}
  </Modal>
}

export function createOpeningDemoDraft(db,session){
  const customer=db.customers.find(c=>c.name==='允城')||db.customers[0];
  const shop=db.shops.find(s=>s.laikeId&&db.shops.filter(t=>t.subjectId===s.subjectId).length===1&&db.subjects.find(x=>x.id===s.subjectId)?.customerIds.includes(customer?.id));
  if(!shop)throw Error('缺少可用于演示的完整样本');
  if(!workflowFor(db,'本地推','华南'))throw Error('没有匹配本地推 / 华南的已发布流程，请先配置后再载入。');
  const supplier=db.accounts.find(a=>a.shopId===shop.id)?.supplierId,ownerId=session.businessId||'demo-sales-a';
  return {draftId:uid('DRAFT'),customerId:customer.id,subjectId:shop.subjectId,shopId:shop.id,product:'本地推',businessOwnerId:ownerId,businessOwnerName:businessName(ownerId),region:'华南',customValues:{},attachments:[],requestedCount:3,rows:[1,2,3].map(i=>({id:uid('L'),name:'',supplierId:'',status:'待办理'})),note:'本地三行申请草稿：请按当前表单补齐资料并确认提交；尚未发起开户。'};
}
function Workbench(p){
  const {db,session,go,update,toast}=p;
  const [tab,setTab]=useState(()=>['我的待办','资料待补','已完成',...(['商务','渠道商务','商务主管'].includes(session.role)?['我发起的','我负责的账户','协办业务']:[])].includes(p.viewState?.workbenchTab)?p.viewState.workbenchTab:'我的待办'),[scope,setScope]=useState('与我角色相关');
  useEffect(()=>{p.setViewState?.({workbenchTab:tab})},[tab,p.setViewState]);
  const finance=db.finance||{},businessRoles=['商务','渠道商务','商务主管'];
  const privateModules=new Set(['M26','M31']);
  const canSeeModule=id=>!privateModules.has(id)||['财务','人事'].includes(session.role);
  const isMe=person=>!!person&&(person===session.name||person===session.businessId);
  const terminal=new Set(['全部完成','完成','已取消','取消','冲正','已付','已分配','已分类','已返付','已结清','已使用','已开','红冲完成','签订有效','作废','已封存','已接受差额结清','已拒绝','有效','冻结','归档','只读归档','已发','发布','确认','已匹配','可查看','已导入','已评','已核对','封存']);
  const titles={M09:'收款认领',M11:'授信申请',M12:'充值办理',M13:'续费分类',M14:'平台退币',M15:'现金退款',M16:'渠道转账',M17:'平台转户',M18:'供应商往来',M19:'服务费与返付',M20:'合同办理',M21:'开票办理',M22:'对账与尾差',M23:'报销、费用与采购',M24:'消耗匹配',M25:'经营报表',M26:'收益核算',M27:'激励政策',M28:'素材绩效',M29:'员工任职',M30:'考勤申请',M31:'工资核对',M32:'目标考核',M36:'导入批次',M37:'迁移核对',M38:'客户跟进',M39:'期间审计',M40:'接口同步'};
  const financialRoles=(id,r)=>{
    if(id==='M11')return ['Boss'];
    if(id==='M12')return r.status==='待派单'?['媒介主管','财务']:r.status==='待办理'?['充值媒介','财务']:r.status==='已发生待核实'?['财务']:r.status==='成功待入账'?['充值媒介','财务']:r.status==='明确失败'?[...businessRoles,'充值媒介']:['充值媒介'];
    if(id==='M14')return ['充值媒介','财务'];
    if(id==='M15'&&r.status==='待审批')return ['商务主管','Boss'];
    if(id==='M17')return ['充值媒介'];
    if(id==='M20'&&r.status==='草稿')return [...businessRoles,'财务'];
    return ['财务'];
  };
  const operationalRoles=(id,r)=>{
    if(id==='M23')return ['草稿','退回'].includes(r.status)?['发起人']:r.status==='审批中'?['Boss','商务主管']:['财务'];
    if(id==='M24')return r.status==='待关联'?['充值媒介','财务','商务主管']:['充值媒介','财务'];
    if(id==='M25')return ['发起人'];
    if(id==='M26')return ['财务'];
    if(id==='M27')return r.status==='草稿'?businessRoles:r.status==='审批中'?['Boss','商务主管']:['财务'];
    if(id==='M28')return ['商务主管','人事','财务'];
    if(id==='M29')return ['人事'];
    if(id==='M30')return ['草稿','退回'].includes(r.status)?['发起人']:r.status==='审批中'?['商务主管','人事']:['人事'];
    if(id==='M31')return r.status==='已发布'?['财务']:['人事','财务'];
    if(id==='M32')return r.status==='有效'?['发起人']:['商务主管','人事'];
    if(id==='M36')return ['系统管理员','财务'];
    if(id==='M37')return ['冲突','待复核'].includes(r.status)?['系统管理员','财务']:['系统管理员'];
    if(id==='M38')return businessRoles;
    if(id==='M39')return ['财务','系统管理员'];
    if(id==='M40')return r.status==='待核实'?['系统管理员','媒介主管']:['系统管理员'];
    return ['系统管理员'];
  };
  const records=[];
  const addRecord=(target,r,origin)=>{if(!r?.id||!canSeeModule(target))return;const roles=origin==='finance'?financialRoles(target,r):operationalRoles(target,r);const creator=origin==='finance'?r.operator:r.createdBy;records.push({id:target+':'+r.id,recordId:r.id,name:titles[target]||target,node:r.status||'待核对',roles,role:roles.join(' / '),creator,at:r.createdAt,target,params:{recordId:r.id},next:/未知|待核实/.test(r.status||'')?'核查原业务单':/待同步/.test(r.status||'')?'回原单补同步':'继续办理'});};
  for(const [key,id] of [['receipts','M09'],['orders','M12'],['credits','M11']])for(const r of finance[key]||[])addRecord(id,r,'finance');
  for(const [id,rows] of Object.entries(finance.records||{}))if(Array.isArray(rows))for(const r of rows)addRecord(id,r,'finance');
  for(const [id,rows] of Object.entries(db.operations||{}))if(Array.isArray(rows))for(const r of rows)addRecord(id,r,'operations');
  const openingRecords=openingWorkbenchRecords(db);
  const waitingRecords=records.filter(r=>!terminal.has(r.node)||r.target==='M27'&&r.node==='有效'||r.target==='M32'&&r.node==='有效'||r.target==='M26'&&r.node==='确认'||r.target==='M37'&&r.node==='已核对');
  const taskMap=new Map([...openingRecords.filter(r=>!r.closed),...waitingRecords].map(r=>[r.id,r]));
  const tasks=[...taskMap.values()];
  const related=r=>r.target==='M06'?relatedOpeningRecord(r,session):r.roles.includes(session.role)||r.roles.includes('发起人')&&isMe(r.creator);
  const mine=tasks.filter(related),visible=scope==='全部待办'&&['媒介主管','系统管理员'].includes(session.role)?tasks:mine;
  const supplement=openingRecords.filter(r=>r.supplement>0&&related(r)),completed=openingRecords.filter(r=>r.closed&&related(r));
  const isBusiness=businessRoles.includes(session.role),isSupervisor=['媒介主管','系统管理员'].includes(session.role);
  const roleIntro=isBusiness?'查看客户开户需求、办理进度与账户结果。':isSupervisor?'分配开户申请，跟进媒介办理进度。':'按申请继续本人任务，保存账户结果并确认完成。';
  const pendingTitle=isBusiness?'进行中的申请':isSupervisor?'待分配与跟进':'待办申请';
  const relatedOpenings=openingRecords.filter(related),unassigned=relatedOpenings.filter(r=>!r.closed&&!r.assignee).length,inProgress=relatedOpenings.filter(r=>!r.closed&&r.assignee).length;
  const initiated=[...openingRecords,...records].filter(r=>isMe(r.creator)).sort((a,b)=>(b.at||'').localeCompare(a.at||''));
  const owned=db.accounts.filter(a=>isBusiness&&!!session.businessId&&a.businessOwnerId===session.businessId);
  const assisted=db.accounts.filter(a=>isBusiness&&!!session.businessId&&a.collaborators?.some(c=>c.id===session.businessId&&c.active!==false));
  const open=r=>r.accountId?p.openAccount(r.accountId):go(r.target,r.params);
  const taskColumns=[{key:'name',label:'客户 / 业务申请',render:r=><div className="relation-cell"><b>{r.name}</b>{r.subject&&isBusiness&&<span>主体：{r.subject}</span>}{r.shop&&<span>店铺：{r.shop} · {r.product}</span>}<small className="muted mono">申请单号：{r.recordId}</small></div>},{key:'node',label:'当前状态',render:r=><Badge tone={r.closed?'green':'amber'}>{r.node}</Badge>},{key:'progress',label:'办理进度',render:r=>r.target==='M06'?<div className="relation-cell"><b>申请 {r.total} 个 · 成功 {r.success} 个</b><span>待处理 {r.remaining} 个{r.cancelled?' · 取消 '+r.cancelled+' 个':''}</span>{!!r.supplement&&<small>纵横 ID 待补 {r.supplement} 个</small>}</div>:'—'},{key:'assignee',label:'当前办理人',render:r=>personLabel(r.assignee)||r.role},{key:'action',label:'操作',render:r=><button className="btn" onClick={()=>open(r)}>{r.target==='M06'&&isBusiness?'查看开户进度':r.target==='M06'&&isSupervisor?(r.closed?'查看开户申请':!r.assignee&&!r.step?'指派开户媒介':r.step?.role===session.role?'办理审批':'查看办理进度'):r.next}</button>}];
  return <><PageHeader eyebrow="我的工作" title={'工作台 · '+session.role} description={roleIntro} actions={allowed(session,'create')&&<><button className="btn" onClick={()=>go('M06',{mode:'drafts'})}>我的开户草稿（{listOpeningDrafts(db,session).length}）</button><button className="btn primary" onClick={()=>go('M06',{mode:'new'})}>新增开户</button></>}/>
  <div className="metrics"><div className="metric"><span>{isBusiness?'进行中申请':isSupervisor?'待指派申请':'本人待办申请'}</span><strong>{isSupervisor?unassigned:mine.length}</strong></div><div className="metric"><span>资料待补</span><strong>{supplement.length}</strong><small>{supplement.reduce((n,r)=>n+r.supplement,0)} 个账户待补纵横 ID</small></div><div className="metric"><span>已完成开户</span><strong>{completed.length}</strong></div><div className="metric"><span>{isBusiness?'我负责的账户':isSupervisor?'办理中申请':'我经办的账户'}</span><strong>{isBusiness?owned.length:isSupervisor?inProgress:db.accounts.filter(a=>openingRecords.some(r=>r.recordId===a.applicationId&&canHandleOpening(session,r))).length}</strong></div></div>
  <div className="tabs">{['我的待办','资料待补','已完成',...(isBusiness?['我发起的','我负责的账户','协办业务']:[])].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t==='我的待办'?(isBusiness?'进行中申请':isSupervisor?'待分配与跟进':'我的待办'):t}</button>)}</div>
  <div className="workspace-columns"><div>
  {tab==='我的待办'&&<Section title={pendingTitle} actions={['媒介主管','系统管理员'].includes(session.role)&&<select aria-label="工作台待办范围" value={scope} onChange={e=>setScope(e.target.value)}><option>与我角色相关</option><option>全部待办</option></select>}>
    {visible.length?<DataTable rows={visible} columns={taskColumns} onRow={open}/>:<Empty title="暂无待办申请" detail="已完成的申请可在“已完成”中查看。"/>}
  </Section>}
  {tab==='资料待补'&&<Section title="开户后资料补充"><p className="opening-table-note">纵横 ID 可以后补，不影响已保存的开户结果。</p><DataTable rows={supplement.map(r=>({...r,next:'返回申请补资料'}))} columns={taskColumns} onRow={open}/></Section>}
  {tab==='已完成'&&<Section title="已完成开户申请"><DataTable rows={completed} columns={taskColumns} onRow={open}/></Section>}
  {tab==='我发起的'&&<Section title="我发起的业务"><DataTable rows={initiated} columns={taskColumns} onRow={open}/></Section>}
  {tab==='我负责的账户'&&<Section title="我负责的账户"><AccountTable db={db} rows={owned} openAccount={p.openAccount}/></Section>}
  {tab==='协办业务'&&<Section title="协办账户"><AccountTable db={db} rows={assisted} openAccount={p.openAccount}/></Section>}
  </div><Section title="常用入口"><div className="quick-links">{[['M06','开户申请','查看申请与办理进度'],['M02','客户资料','查看主体与店铺'],['M05','广告账户','查看已开通账户'],...(['系统管理员'].includes(session.role)?[['M34','表单与流程配置','维护选项与流程']]:[])].map(([id,title,sub])=><button key={id} onClick={()=>go(id)}><b>{title}</b><span>{sub}</span></button>)}</div></Section></div></>;
}

function OpeningList({db,session,go,viewState,setViewState}){
 const [filter,setFilter]=useState(viewState?.openingListFilter||'全部'),[query,setQuery]=useState(viewState?.openingListQuery||'');
 useEffect(()=>{setViewState?.({openingListFilter:filter,openingListQuery:query})},[filter,query,setViewState]);
 const business=['商务','渠道商务','商务主管'].includes(session.role),supervisor=['媒介主管','系统管理员'].includes(session.role);
 const records=openingWorkbenchRecords(db).filter(r=>relatedOpeningRecord(r,session));
 const rows=records.filter(r=>(filter==='全部'||filter==='待指派'&&!r.assignee&&!r.closed||filter==='办理中'&&r.assignee&&!r.closed||filter==='待确认完成'&&r.node==='待确认完成'||filter==='已完成'&&r.closed||filter==='资料待补'&&r.supplement>0)&&[r.recordId,r.customer,r.subject,r.shop].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 const action=r=>business?'查看开户进度':supervisor?(!r.closed&&!r.assignee&&!r.step?'指派开户媒介':'查看办理进度'):r.next;
  return <><PageHeader eyebrow="开户申请" title={business?'我的开户申请':supervisor?'开户分配与跟进':'我的开户办理'} description={business?'按客户查看申请资料、开户数量和办理结果。':supervisor?'按申请指派媒介，跟进办理数量与异常结果。':'每笔申请保留全部账户，随时继续未完成的办理。'} actions={allowed(session,'create')&&<><button className="btn" onClick={()=>go('M06',{mode:'drafts'})}>我的开户草稿（{listOpeningDrafts(db,session).length}）</button><button className="btn primary" onClick={()=>go('M06',{mode:'new'})}>新增开户</button></>}/>
 <div className="toolbar"><input aria-label="搜索开户申请" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索客户、主体、店铺或申请单号"/><select aria-label="申请状态" value={filter} onChange={e=>setFilter(e.target.value)}>{['全部',...(supervisor?['待指派','待确认完成']:[]),'办理中','已完成','资料待补'].map(x=><option key={x}>{x}</option>)}</select></div>
 <Section><DataTable rows={rows} onRow={r=>go('M06',r.params)} columns={[
 {key:'customer',label:'客户 / 开户申请',render:r=><div className="relation-cell"><b>{r.customer}</b><small>申请单号：{r.recordId}</small></div>},
 {key:'subject',label:'主体 / 店铺',render:r=><div className="relation-cell"><span>{r.subject}</span><small>{r.shop} · {r.product}</small></div>},
 {key:'total',label:business?'申请数量 / 开户进度':'账户办理进度',render:r=><div className="relation-cell"><b>申请 {r.total} 个 · 成功 {r.success} 个</b><span>待处理 {r.remaining} 个 · 取消 {r.cancelled} 个</span>{!!r.supplement&&<small>纵横 ID 待补 {r.supplement} 个</small>}</div>},
 {key:'node',label:'当前状态',render:r=><Badge tone={r.closed?'green':'blue'}>{r.node}</Badge>},
 ...(business||supervisor?[{key:'assignee',label:'开户媒介',render:r=>personLabel(r.assignee)||'待指派'}]:[]),
 ...(!business?[{key:'businessOwnerName',label:'负责商务',render:r=>personLabel(r.businessOwnerName)||'未指定'}]:[]),
 {key:'action',label:'操作',render:r=><button className="btn" onClick={()=>go('M06',r.params)}>{action(r)}</button>}
  ]}/></Section></>;
}

function Customers(p){
  const {db,params,go,update,toast,openAccount,session}=p;
  const [query,setQuery]=useState(params.query||''),[tab,setTab]=useState('本客户业务'),[subjectId,setSubject]=useState(''),[shopId,setShop]=useState(''),[newName,setNewName]=useState(''),[modal,setModal]=useState(false);
  useEffect(()=>{setQuery(params.query||'');setSubject('');setShop('');setTab('本客户业务')},[params.customerId,params.query]);
  const customer=db.customers.find(c=>c.id===params.customerId);
  const create=()=>{try{let id;update(d=>{id=addCustomer(d,newName).id},'新建公共客户（演示）');setModal(false);go('M02',{customerId:id});toast('客户已在本地原型新建。')}catch(e){toast(e.message,'error')}};
  if(customer){
    const subjects=db.subjects.filter(s=>s.customerIds.includes(customer.id));
    const own=customerAccounts(db,customer.id),same=sharedAccounts(db,customer.id,shopId,subjectId);
    const rows=(tab==='共享关系核对'?same:own).filter(a=>(!subjectId||a.subjectId===subjectId)&&(!shopId||a.shopId===shopId));
    const applications=db.applications.filter(a=>a.customerId===customer.id&&(!subjectId||a.subjectId===subjectId)&&(!shopId||a.shopId===shopId));
    return <><PageHeader eyebrow="公共资料 / 客户全景" title={customer.name} description={'客户 #'+customer.id+' · '+(customer.kind||'类型待核验')+' · 当前统计仅覆盖本次导入样本和本地演示'} actions={<><button className="btn" onClick={()=>go('M02')}>返回客户列表</button><button className="btn" onClick={()=>go('M03',{customerId:customer.id})}>关联 / 维护资料</button>{allowed(session,'create')&&<button className="btn primary" onClick={()=>go('M06',{mode:'new',customerId:customer.id,subjectId,shopId})}>在此新增开户</button>}</>}/>
    <div className="metrics compact"><div className="metric"><span>关联主体</span><strong>{subjects.length}</strong></div><div className="metric"><span>本客户关联账户</span><strong>{own.length}</strong></div><div className="metric"><span>本地开户申请</span><strong>{applications.length}</strong></div><div className="metric"><span>共享核对账户</span><strong>{sharedAccounts(db,customer.id).length}</strong></div></div>
    <div className="customer-workspace"><aside className="relation-picker"><h3>主体与店铺定位</h3><button className={!subjectId?'selected':''} onClick={()=>{setSubject('');setShop('')}}>全部关联主体</button>{subjects.map(s=><div key={s.id}><button className={subjectId===s.id&&!shopId?'selected subject':'subject'} onClick={()=>{setSubject(s.id);setShop('')}}>{s.name}<small>主体 #{s.id}</small></button>{(subjectId===s.id||subjects.length<=3)&&db.shops.filter(t=>t.subjectId===s.id).map(t=><button key={t.id} className={shopId===t.id?'selected shop':'shop'} onClick={()=>{setSubject(s.id);setShop(t.id)}}>{t.name}<small>{t.laikeId?'来客 '+t.laikeId:'旧档案 · 来客未核验'}</small></button>)}</div>)}</aside><div className="workspace-main"><div className="tabs">{['本客户业务','共享关系核对','在途申请','数据结构'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}{t==='本客户业务'?' ('+own.length+')':''}</button>)}</div>
    {tab==='本客户业务'&&<><Notice>按本次业务客户关系取账户。共享主体下其他客户的账户不会自动计入本表；财务金额不沿主体树累加。</Notice><AccountTable db={db} rows={rows} openAccount={openAccount}/></>}
    {tab==='共享关系核对'&&<><Notice tone="amber">用于核对同主体、同店的其他客户账户。基础身份可见不等于可查看资金、修改账户或代充。</Notice><AccountTable db={db} rows={rows} openAccount={openAccount}/>{!rows.length&&<button className="btn" onClick={()=>go('M03',{customerId:customer.id})}>关联已有主体，演示共享关系</button>}</>}
    {tab==='在途申请'&&<DataTable rows={applications} columns={[{key:'id',label:'申请单'},{key:'product',label:'产品'},{key:'status',label:'状态'},{key:'workflowVersion',label:'流程版本',render:r=>'v'+r.workflowVersion},{key:'action',label:'操作',render:r=><button className="text-btn" onClick={()=>go('M06',{applicationId:r.id})}>继续办理</button>}]}/>}
    {tab==='数据结构'&&<><DataGraph db={db} customerId={customer.id} openAccount={p.openAccount}/><Notice>每一行展示真实稳定关联；来客取店铺资料，直客取主体当前资料，纵横取各账户独立值。点击任一账户可追溯原始来源。</Notice><AccountTable db={db} rows={own.filter(a=>(!subjectId||a.subjectId===subjectId)&&(!shopId||a.shopId===shopId))} openAccount={openAccount} extraColumns/><div className="relationship-key"><span>客户</span><b>引用</b><span>主体</span><b>关联</b><span>店铺 / 业务档案</span><b>关联</b><span>广告账户</span></div><p className="muted">同一主体下账户共用主体直客；纵横与账户一对一；商务归属和每笔资金方分别关联，不是公共资料的下一层。</p></>}
    </div></div></>;
  }
  const q=query.trim().toLowerCase(),hits=[];
  if(q){for(const c of db.customers)if((c.name+c.id).toLowerCase().includes(q))hits.push({id:'c'+c.id,type:'客户',name:c.name,path:'公共客户 #'+c.id,open:()=>go('M02',{customerId:c.id})});
  for(const s of db.subjects)if((s.name+s.id+(s.creditCode||'')).toLowerCase().includes(q))hits.push({id:'s'+s.id,type:'主体',name:s.name,path:s.customerIds.map(id=>nameOf(db.customers,id)).join(' / '),open:()=>go('M03',{subjectId:s.id})});
  for(const s of db.shops)if((s.name+s.id+(s.laikeId||'')+(s.legacyNo||'')).toLowerCase().includes(q))hits.push({id:'t'+s.id,type:'店铺 / 档案',name:s.name,path:nameOf(db.subjects,s.subjectId)+' · '+(s.laikeId||'来客未核验'),open:()=>go('M03',{subjectId:s.subjectId,shopId:s.id})});
  for(const a of db.accounts)if(((a.name||'')+a.externalId+(getSubjectDirect(db,a.subjectId).directId||'')+(a.zonghengId||'')).toLowerCase().includes(q))hits.push({id:'a'+a.id,type:'广告账户',name:a.name||a.externalId,path:nameOf(db.customers,a.customerId)+' / '+a.externalId,open:()=>openAccount(a.id)});
  }
  return <><PageHeader eyebrow="DIRECTORY / 公共资料" title="客户与全局检索" description="先搜索，再关联。客户、主体、店铺、广告账户按命中类型路由。" actions={<button className="btn primary" onClick={()=>{setNewName(query);setModal(true)}}>新增客户</button>}/><div className="search-hero"><label>查找已有资料<input aria-label="搜索客户主体店铺账号" autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="输入客户名称、主体、店铺或完整广告账户 ID"/></label><p>试试：允城、潮拍摄影、1873296142902524。精确账户命中直接打开已有账户。</p></div>
  {q?<Section title={'命中 '+hits.length+' 条'}><DataTable rows={hits} onRow={r=>r.open()} columns={[{key:'type',label:'对象类型',render:r=><Badge tone="blue">{r.type}</Badge>},{key:'name',label:'名称'},{key:'path',label:'关联范围'},{key:'action',label:'操作',render:r=><button className="text-btn" onClick={e=>{e.stopPropagation();r.open()}}>定位资料</button>}]}/></Section>:<Section title="客户列表"><DataTable rows={db.customers} onRow={r=>go('M02',{customerId:r.id})} columns={[{key:'name',label:'客户名称',render:r=><><strong>{r.name}</strong><small className="muted block">客户 #{r.id}{r.demo?' · 本地新建':''}</small></>},{key:'kind',label:'客户类型',render:r=><Badge tone={r.kind==='渠道'?'blue':'neutral'}>{r.kind||'类型待核验'}</Badge>},{key:'subjects',label:'关联主体',render:r=>db.subjects.filter(s=>s.customerIds.includes(r.id)).length},{key:'accounts',label:'样本账户',render:r=>customerAccounts(db,r.id).length},{key:'action',label:'操作',render:r=><button className="text-btn" onClick={e=>{e.stopPropagation();go('M02',{customerId:r.id})}}>客户全景</button>}]}/></Section>}
  {modal&&<Modal title="新增公共客户" onClose={()=>setModal(false)} footer={<button className="btn primary" onClick={create}>查重并创建</button>}><Field label="客户名称" required><input value={newName} onChange={e=>setNewName(e.target.value)}/></Field><Notice>名称重复会拦截。更换名称不自动证明是新的法律实体，也不自动开立钱包。</Notice></Modal>}</>;
}

function Records(p){
  const {db,params,update,go,session}=p;
  const [subjectId,setSubject]=useState(params.subjectId||''),[shopId,setShop]=useState(params.shopId||''),[editor,setEditor]=useState(null);
  const sourceSubject=db.subjects.find(s=>s.id===(subjectId||params.subjectId)),linkedCustomers=sourceSubject?.customerIds||[];
  const customerId=params.customerId||(linkedCustomers.length===1?linkedCustomers[0]:'');
  const subjects=db.subjects.filter(s=>!customerId||s.customerIds.includes(customerId)),subject=db.subjects.find(s=>s.id===subjectId),shop=db.shops.find(s=>s.id===shopId);
  const shownSubjects=params.subjectId?db.subjects.filter(s=>s.id===params.subjectId):subjects;
  const chooseSubject=id=>{setSubject(id);setShop(openingShopState(db,id).shop?.id||'')};
  return <><PageHeader eyebrow="公共资料 / 主体与店铺" title="主体、店铺与业务档案" description="主体资质、店铺来客与账户身份分层维护；公共更正保留版本，历史申请保留快照。" actions={<><button className="btn" disabled={!customerId||!canMaintainPublic(session)} onClick={()=>setEditor('link')}>关联已有主体</button><button className="btn primary" disabled={!customerId||!canMaintainPublic(session)} onClick={()=>setEditor('newSubject')}>新增主体</button></>}/><div className="toolbar"><Field label="本次客户"><select aria-label="本次客户" value={customerId} onChange={e=>go('M03',{customerId:e.target.value,...(sourceSubject?.customerIds.includes(e.target.value)?{subjectId:sourceSubject.id,shopId}:{})})}><option value="">请选择本次客户</option>{db.customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><button className="btn" disabled={!customerId} onClick={()=>go('M02',{customerId})}>打开客户全景</button></div>{!customerId&&<Notice>{linkedCustomers.length>1?'本主体关联多个客户，请先选择本次客户，再发起开户。':'请选择本次客户，再新增或关联主体。'}</Notice>}
  <div className="grid2"><Section title="主体引用列表"><DataTable rows={shownSubjects} pageSize={8} onRow={s=>chooseSubject(s.id)} columns={[{key:'name',label:'主体 / 信用代码',render:s=><><b>{s.name}</b><small className="muted block">{s.creditCode||'统一社会信用代码未登记'}</small></>},{key:'customers',label:'客户引用',render:s=>s.customerIds.map(id=>nameOf(db.customers,id)).join('、')},{key:'select',label:'操作',render:s=><button className="text-btn" onClick={()=>chooseSubject(s.id)}>查看资料与店铺</button>}]}/></Section><Section title={subject?.name||'请选择主体'} actions={<button className="btn" disabled={!subject||!canMaintainPublic(session)||db.shops.some(s=>s.subjectId===subjectId)} onClick={()=>setEditor('newShop')}>新增店铺 / 档案</button>}>{subject?<DataTable rows={db.shops.filter(s=>s.subjectId===subjectId)} pageSize={8} onRow={s=>setShop(s.id)} columns={[{key:'name',label:'店铺 / 业务档案'},{key:'laikeId',label:'当前来客',render:s=><><span>{s.name}</span><small className="mono block">{s.laikeId||'ID 未取得'}</small></>},{key:'action',label:'操作',render:s=><button className="text-btn" onClick={()=>setShop(s.id)}>关系核对</button>}]}/>:<Empty detail="选择主体查看其资质和店铺，不复制公共资料。"/>}</Section></div>
  <SubjectSummary subject={subject} session={session} onEdit={()=>setEditor('subject')}/>
  {shop&&<Section title={shop.name+' · 关系核对'} actions={<><button className="btn" disabled={!canMaintainPublic(session)} onClick={()=>setEditor('shop')}>补全 / 更正店铺来客</button>{allowed(session,'create')&&<button className="btn primary" disabled={!customerId||!subject?.customerIds.includes(customerId)} onClick={()=>go('M06',{mode:'new',customerId,subjectId,shopId})}>在此开户</button>}</>}><dl className="kv"><dt>经营地址</dt><dd>{shop.businessAddress||'未登记，与主体住所分开'}</dd><dt>当前来客名称</dt><dd>{shop.name}</dd><dt>当前来客 ID</dt><dd>{shop.laikeId||'未取得'}</dd><dt>资料来源</dt><dd>{shop.laikeSource||shop.source}</dd><dt>旧业务编号</dt><dd>{shop.legacyNo||'无'}</dd></dl><AccountTable db={db} rows={db.accounts.filter(a=>a.shopId===shop.id)} openAccount={p.openAccount} extraColumns/><div className="timeline">{shop.versions?.map((v,i)=><div key={i}>{localTime(v.at)} · {v.actor||'历史记录'} · {v.reason}<small className="block">来客 {v.before?.laikeId||v.oldValue||'空'} → {v.after?.laikeId||v.newValue||'空'}</small></div>)}</div></Section>}
  {['newSubject','subject'].includes(editor)&&<SubjectEditor {...p} subjectId={editor==='subject'?subjectId:undefined} customerId={customerId} onSaved={chooseSubject} onClose={()=>setEditor(null)}/>}
  {editor==='link'&&<LinkSubjectEditor {...p} customerId={customerId} onSaved={chooseSubject} onClose={()=>setEditor(null)}/>}
  {['shop','newShop'].includes(editor)&&<ShopEditor {...p} subjectId={subjectId} shopId={editor==='shop'?shopId:undefined} onSaved={setShop} onClose={()=>setEditor(null)}/>}
  </>;
}
function Suppliers(p){
  const {db,update,session,toast}=p,[q,setQ]=useState(''),[detail,setDetail]=useState(null);
  return <><PageHeader eyebrow="公共资料 / 服务关系" title="供应商与产品能力" description="供应商资料按对象独立维护；样本产品覆盖不等于真实平台 API 授权。"/><div className="toolbar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索供应商名称 / 代理商 ID"/></div><Section><DataTable rows={db.suppliers.filter(s=>(s.name+(s.agentId||'')).includes(q))} columns={[{key:'name',label:'供应商',render:s=><><b>{s.name}</b><small className="muted block">供应商 #{s.id} · 资料 v{s.recordVersion||0}</small></>},{key:'agentName',label:'代理商资料',render:s=><>{s.agentName||'名称未登记'}<small className="mono block">{s.agentId||'ID 未登记'}</small></>},{key:'products',label:'样本观察产品',render:s=>s.products.join(' / ')},{key:'active',label:'本地选用状态',render:s=><Badge tone={s.active===false?'red':'green'}>{s.active===false?'已停用':'可供演示选择'}</Badge>},{key:'action',label:'资料 / 状态',render:s=><><button className="text-btn" onClick={()=>setDetail(s.id)}>查看 / 维护资料</button>{allowed(session,'supplier')&&<button className="text-btn" onClick={()=>{update(d=>{const x=d.suppliers.find(x=>x.id===s.id);x.active=x.active===false},'主管调整供应商本地选用状态');toast('已调整本地状态，历史服务关系保留')}}>{s.active===false?'启用':'停用'}</button>}</>}]}/></Section><Notice>能力按产品、供应商、对象类型和动作核验。此处展示开户、充值、查余额、退币的人工演示入口，真实接口未接入；查余额可用不能推断充值也可用。</Notice>{detail&&<SupplierEditor {...p} supplierId={detail} onClose={()=>setDetail(null)}/>}</>;
}

function Accounts(p){
  const {db,params,go,openAccount,session}=p,[q,setQ]=useState(p.viewState?.q||''),[product,setProduct]=useState(p.viewState?.product||''),[mode,setMode]=useState(p.viewState?.mode||'全部样本'),[cols,setCols]=useState(p.viewState?.cols||false),[selected,setSelected]=useState([]);
  useEffect(()=>{p.setViewState?.({q,product,mode,cols})},[q,product,mode,cols]);
  const rows=db.accounts.filter(a=>(!q||(a.name+a.externalId+nameOf(db.customers,a.customerId)+nameOf(db.subjects,a.subjectId)).includes(q))&&(!product||a.product===product)&&(mode!=='本地新开'||a.demo)&&(mode!=='归属待核验'||!a.businessOwnerId)&&(!params.customerId||a.customerId===params.customerId));
  return <><PageHeader eyebrow="ACCOUNTS / 广告账户" title="广告账户总表" description="一账户一行，完整编号可复制；公共资料、负责商务、供应商和资金来源分别关联。" actions={allowed(session,'create')&&<button className="btn primary" onClick={()=>go('M06',{mode:'new'})}>新增开户</button>}/><div className="tabs">{['全部样本','本地新开','归属待核验'].map(t=><button key={t} className={mode===t?'active':''} onClick={()=>setMode(t)}>{t}</button>)}</div><div className="toolbar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜客户、主体、账户名称或完整 ID"/><select value={product} onChange={e=>setProduct(e.target.value)}><option value="">全部产品</option>{[...new Set(db.accounts.map(a=>a.product))].map(t=><option key={t}>{t}</option>)}</select><button className="btn" onClick={()=>setCols(!cols)}>{cols?'收起平台资料列':'展开来客 / 直客 / 纵横'}</button><button className="btn" disabled={!selected.length} onClick={()=>go('M08',{ids:selected})}>批量交接 / 协办 ({selected.length})</button></div><Section><AccountTable db={db} rows={rows} openAccount={openAccount} extraColumns={cols} selected={selected} onSelect={setSelected}/></Section></>;
}

export function openingShopState(db,subjectId){
  const shops=db.shops.filter(s=>s.subjectId===subjectId);
  return {shops,shop:shops.length===1?shops[0]:null,conflict:shops.length>1};
}
export function openingSubjectOptions(db,customerId,query=''){
  if(!db.customers.some(c=>c.id===customerId))return {linked:[],relatedCount:0,other:[],exact:false};
  const search=normalizeName(query),related=db.subjects.filter(s=>s.customerIds?.includes(customerId));
  const matches=s=>!search||normalizeName(s.name+' '+(s.creditCode||'')).includes(search);
  return {
    linked:related.filter(matches),relatedCount:related.length,
    other:search?db.subjects.filter(s=>!s.customerIds?.includes(customerId)&&matches(s)):[],
    exact:!!search&&db.subjects.some(s=>normalizeName(s.name)===search||(s.creditCode&&normalizeName(s.creditCode)===search))
  };
}
export function resizeOpeningRows(rows,count){
  const target=Math.max(1,Math.floor(Number(count)||1));
  return [...rows.slice(0,target),...Array.from({length:Math.max(0,target-rows.length)},()=>({id:uid('L'),name:'',supplierId:'',status:'待办理'}))];
}
const newForm=(db,params,session)=>{const copied=db.accounts.find(a=>a.id===params.copyAccountId),subjectId=params.subjectId??copied?.subjectId??'';return {draftId:uid('DRAFT'),customerId:params.customerId??copied?.customerId??'',product:params.product??copied?.product??'本地推',subjectId,shopId:openingShopState(db,subjectId).shop?.id||'',region:params.region||'华南',businessOwnerId:session.businessId||'',businessOwnerName:businessName(session.businessId),requestedCount:1,rows:resizeOpeningRows([],1),attachments:[],note:''}};
const openingForm=(db,params,session)=>{
  if(params.mode!=='resumeDraft'&&!params.draftId)return {form:newForm(db,params,session)};
  try{
    // 兼容旧的“继续草稿”链接，仅接受能够证明属于本商务的历史草稿。
    const record=params.draftId?getOpeningDraft(db,params.draftId,session):listOpeningDrafts(db,session).find(item=>item.legacy);
    if(!record)return {form:newForm(db,{},session),showDrafts:true};
    const draft=record.form,rows=draft.rows?.length?draft.rows.map(r=>({...r,directId:null,directName:null,directEvidence:null,directSource:null})):resizeOpeningRows([],draft.requestedCount||1);
    return {persisted:true,form:{...newForm(db,{},session),...draft,rows,requestedCount:rows.length,attachments:draft.attachments||[],shopId:openingShopState(db,draft.subjectId).shop?.id||'',businessOwnerName:businessName(draft.businessOwnerId)}};
  }catch(error){return {form:newForm(db,{},session),error:error.message};}
};
function Opening(p){
  const {db,params,session,update,toast,go}=p;
  const [loaded]=useState(()=>openingForm(db,params,session)),[form,setForm]=useState(loaded.form),persisted=useRef(!!loaded.persisted);
  const [customerQuery,setCustomerQuery]=useState(()=>db.customers.find(c=>c.id===form.customerId)?.name||form.draftSearch?.customer||''),[subjectQuery,setSubjectQuery]=useState(()=>db.subjects.find(s=>s.id===form.subjectId)?.name||form.draftSearch?.subject||'');
  const [error,setError]=useState(loaded.error||''),[publicEditor,setPublicEditor]=useState(null),[dirty,setDirty]=useState(false),[uploadBusy,setUploadBusy]=useState(false);
  const initialForm=useRef(JSON.stringify(form));
  const app=db.applications.find(a=>a.id===params.applicationId),workflow=workflowFor(db,form.product,form.region),subject=db.subjects.find(s=>s.id===form.subjectId);
  const editing=!app&&!loaded.error&&!loaded.showDrafts&&(!!params.draftId||['new','resumeDraft'].includes(params.mode))&&allowed(session,'create');
  const {shops,shop,conflict:shopConflict}=openingShopState(db,form.subjectId);
  const direct=getSubjectDirect(db,form.subjectId);
  const customerHits=customerQuery.trim()?db.customers.filter(c=>normalizeName(c.name+' '+c.id).includes(normalizeName(customerQuery))):[];
  const subjectOptions=openingSubjectOptions(db,form.customerId,subjectQuery);
  const exactCustomer=db.customers.some(c=>normalizeName(c.name)===normalizeName(customerQuery));
  const change=(k,v)=>{setDirty(true);setForm(f=>({...f,[k]:v}))};
  const changeCount=count=>setForm(f=>{const rows=resizeOpeningRows(f.rows,count);return {...f,rows,requestedCount:rows.length}});
  const attachmentsForSubject=subjectId=>{if(subjectId!==form.subjectId&&form.attachments?.length){toast('主体已变更，原主体的附件已解除本申请关联，请为当前主体重新上传。','info');return [];}return form.attachments||[];};
  const selectCustomer=c=>{if(uploadBusy)return toast('附件正在保存，请稍候。','error');const attachments=attachmentsForSubject('');setCustomerQuery(c.name);setSubjectQuery('');setForm(f=>({...f,customerId:c.id,subjectId:'',shopId:'',attachments}));setDirty(true);setError('')};
  const selectSubject=s=>{try{if(uploadBusy)throw Error('附件正在保存，请稍候。');if(!form.customerId)throw Error('请先选择本次客户。');update(d=>linkSubject(d,s.id,form.customerId,session),'在原开户申请复用已有主体');const attachments=attachmentsForSubject(s.id);setSubjectQuery(s.name);setForm(f=>({...f,subjectId:s.id,shopId:openingShopState(db,s.id).shop?.id||'',attachments}));setDirty(true);setError('')}catch(e){setError(e.message)}};
  const createCustomer=()=>{try{if(uploadBusy)throw Error('附件正在保存，请稍候。');if(!allowed(session,'create'))throw Error('当前角色不能新增客户。');let id;update(d=>{id=addCustomer(d,customerQuery).id},'原地查重并新增公共客户');selectCustomer({id,name:customerQuery.trim()});toast('客户已保存，继续填写本页资料。')}catch(e){setError(e.message)}};
  useEffect(()=>{if(JSON.stringify(form)!==initialForm.current){setDirty(true);initialForm.current=JSON.stringify(form)}},[form]);
  useEffect(()=>{if(form.subjectId){const current=db.subjects.find(s=>s.id===form.subjectId);if(current)setSubjectQuery(current.name);const autoShop=openingShopState(db,form.subjectId).shop?.id||'';if(form.shopId!==autoShop)setForm(f=>({...f,shopId:autoShop}));}},[form.subjectId,db.subjects,db.shops]);
  const draftValue=()=>({...structuredClone(form),requestedCount:form.rows.length,draftSearch:{customer:customerQuery,subject:subjectQuery}});
  const persistDraft=(asNew=false)=>{
    if(!editing)throw Error('当前页面不能保存开户草稿。');
    if(uploadBusy)throw Error('附件正在保存，请稍候再保存草稿。');
    let saved;update(d=>{assertOpeningDraftSubmission(d,form.draftId,session,{mustExist:persisted.current});saved=saveOpeningDraft(d,draftValue(),session,{asNew})},asNew?'另存本人开户草稿':'保存本人开户草稿');
    persisted.current=true;initialForm.current=JSON.stringify(saved.form);setForm(saved.form);setDirty(false);setError('');p.onDirtyChange?.(false);return saved;
  };
  const saveDraft=(asNew=false)=>{try{const saved=persistDraft(asNew);go('M06',{mode:'resumeDraft',draftId:saved.id},{committed:true,replace:true});toast(asNew?'已另存为新草稿，原草稿保留。':'开户草稿已保存');return true;}catch(error){setError(error.message);toast(error.message,'error');return false;}};
  useEffect(()=>{if(!editing)return;p.onDirtyChange?.(dirty||uploadBusy);return()=>p.onDirtyChange?.(false)},[dirty,uploadBusy,editing,p.onDirtyChange]);
  useEffect(()=>{if(!editing)return;p.registerDraftSaver?.(()=>{persistDraft();return true});return()=>p.registerDraftSaver?.(null)},[form,customerQuery,subjectQuery,update,editing,session,uploadBusy,p.registerDraftSaver,p.onDirtyChange]);
  const submit=()=>{try{
    if(uploadBusy){toast('附件正在保存，请等待完成后提交。','error');return;}
    if(!allowed(session,'create'))return toast('当前角色不能发起开户，请切换商务或商务主管。','error');
    const {draftSearch,...applicationForm}=form;
    const payload={...applicationForm,requestedCount:form.rows.length,attachments:form.attachments||[]};
    const errors=validateOpening(db,payload);
    if(shopConflict)errors.push('该主体存在多个历史店铺，需先核对一主体一店关系，当前不能提交新开户。');
    if(!businessName(form.businessOwnerId))errors.push('请选择目录内的有效负责商务。');
    if(!workflow)errors.push('没有适用于本产品和区域的流程版本。');
    if(['商务','渠道商务'].includes(session.role)&&form.businessOwnerId!==session.businessId)errors.push('普通商务不能代选他人作为账户归属。');
    errors.push(...openingFieldErrors(workflow,{...payload,subjectSnapshot:subjectSnapshot(db,form.subjectId)}),...validateOpeningAttachments(payload.attachments,workflow,form.product));
    if(errors.length){setError([...new Set(errors)].join(' '));return;}
    const id=uid('KH');
    update(d=>{
      assertOpeningDraftSubmission(d,form.draftId,session,{mustExist:persisted.current});
      const finalErrors=validateOpening(d,payload);if(finalErrors.length)throw Error(finalErrors.join(' '));
      const currentDirect=getSubjectDirect(d,form.subjectId);
      d.applications.unshift({...structuredClone(payload),id,completionMode:'manual',attachmentPolicySnapshot:structuredClone(workflow.attachmentPolicies??null),customValues:Object.fromEntries((workflow.fields||[]).filter(f=>f.visible!==false&&!['region','attachments'].includes(f.id)).map(f=>[f.id,form.customValues?.[f.id]??''])),status:'待派单',assignee:null,createdAt:new Date().toISOString(),workflowVersion:workflow.version,flowSnapshot:structuredClone(workflow.steps),configApprovals:{},fieldSnapshot:structuredClone(workflow.fields),subjectSnapshot:subjectSnapshot(d,form.subjectId),supplierSnapshots:{},shopSnapshot:structuredClone(d.shops.find(s=>s.id===form.shopId)),businessOwnerId:form.businessOwnerId,businessOwnerName:businessName(form.businessOwnerId),submittedBy:session.name,events:[{at:new Date().toISOString(),text:session.name+'提交 '+form.rows.length+' 户演示申请；负责商务 '+businessName(form.businessOwnerId)+'，流程版本 v'+workflow.version}],rows:form.rows.map(r=>({...r,submittedDirectSnapshot:{...currentDirect},status:'待办理'}))});
      consumeOpeningDraft(d,form.draftId,session,id);
      d.notifications.unshift({id:uid('N'),title:'新开户申请等待区域媒介主管派单',moduleId:'M06',params:{applicationId:id},read:false,at:new Date().toISOString()});
    },'提交开户申请（本地演示）');
    setDirty(false);p.onDirtyChange?.(false);go('M06',{applicationId:id},{committed:true});toast('开户申请已提交，等待指派媒介');
  }catch(e){setError(e.message)}};
  if(app)return <OpeningApplication {...p} app={app}/>;
  if(loaded.error)return <><PageHeader title="无法继续此草稿" actions={<button className="btn" onClick={()=>go('M06',{mode:'drafts'})}>返回我的草稿箱</button>}/><Notice tone="error">{loaded.error}</Notice></>;
  if(params.mode==='drafts'||loaded.showDrafts)return <DraftList {...p}/>;
  if(!params.draftId&&!['new','resumeDraft'].includes(params.mode))return <OpeningList key={session.role+':'+session.name} {...p}/>;
  if(!allowed(session,'create'))return <><PageHeader title="新增开户" actions={<button className="btn" onClick={()=>go('M06')}>返回申请列表</button>}/><Notice>请由商务提交开户申请。你可以从工作台继续办理已指派的申请。</Notice></>;
  return <div className="opening-page"><PageHeader eyebrow="OPENING / 商务申请" title={persisted.current?'继续开户草稿':'新增开户'} description="填写客户、主体、店铺及开户数量。草稿由当前创建人保管。" actions={<><button className="btn" disabled={uploadBusy} onClick={()=>saveDraft()}>保存草稿</button>{persisted.current&&<button className="btn" disabled={uploadBusy} onClick={()=>saveDraft(true)}>另存为新草稿</button>}<button className="btn" onClick={()=>go('M06',{mode:'drafts'})}>我的开户草稿</button><button className="btn" onClick={()=>go('M06')}>返回申请列表</button></>}/>{error&&<Notice tone="error">{error}</Notice>}
    <Section title="客户与开户信息"><div className="form-grid">
      <div className="opening-search"><Field label="客户名称" required hint="输入名称查重，选择已有客户或在当前页新增"><input aria-label="搜索客户名称" disabled={uploadBusy} autoComplete="off" value={customerQuery} onChange={e=>{const attachments=attachmentsForSubject('');setCustomerQuery(e.target.value);setSubjectQuery('');setForm(f=>({...f,customerId:'',subjectId:'',shopId:'',attachments}));setDirty(true)}} placeholder="直接输入客户名称"/></Field>{form.customerId?<div className="opening-selected"><Badge tone="green">已选客户</Badge><span>{nameOf(db.customers,form.customerId)}</span></div>:customerQuery.trim()&&<div className="opening-matches">{customerHits.slice(0,10).map(c=><button key={c.id} disabled={uploadBusy} onClick={()=>selectCustomer(c)}><strong>{c.name}</strong><small>#{c.id} · 选择已有客户</small></button>)}{!customerHits.length&&<p>未找到已登记客户</p>}{!exactCustomer&&<button className="text-btn" disabled={uploadBusy} onClick={createCustomer}>新增客户「{customerQuery.trim()}」并继续</button>}</div>}</div>
      <Field label="产品" required><select disabled={uploadBusy} value={form.product} onChange={e=>{const product=e.target.value;setForm(f=>({...f,product,rows:f.rows.map(r=>({...r,directId:null,directName:null,directEvidence:null,supplierId:''}))}));setDirty(true)}}>{PRODUCTS.map(t=><option key={t}>{t}</option>)}</select></Field>
      <Field label="办理区域" required><select disabled={uploadBusy} value={form.region} onChange={e=>change('region',e.target.value)}>{['华南','华北','华东','西北','西南','华中'].map(r=><option key={r}>{r}</option>)}</select></Field>
      <Field label="负责商务"><select disabled={['商务','渠道商务'].includes(session.role)} value={form.businessOwnerId||session.businessId} onChange={e=>setForm(f=>({...f,businessOwnerId:e.target.value,businessOwnerName:businessName(e.target.value)}))}><option value="demo-sales-a">演示商务 A</option><option value="demo-sales-b">演示商务 B</option></select></Field>
    </div></Section>
    <Section title="主体与店铺资料"><div className="opening-search">
      <Field label="主体名称 / 统一社会信用代码" required hint="选择客户后直接显示关联主体；可继续输入名称或信用代码查重复用"><input aria-label="搜索主体名称或信用代码" disabled={uploadBusy||!form.customerId} autoComplete="off" value={subjectQuery} onChange={e=>{const attachments=attachmentsForSubject('');setSubjectQuery(e.target.value);setForm(f=>({...f,subjectId:'',shopId:'',attachments}));setDirty(true)}} placeholder={form.customerId?'选择下方已有主体，或输入名称 / 信用代码查重':'请先选择客户'}/></Field>
      {subject?<div className="opening-selected"><Badge tone="green">已选择主体</Badge><span>{subject.name}</span><button className="text-btn" disabled={uploadBusy} onClick={()=>{setSubjectQuery('');const attachments=attachmentsForSubject('');setForm(f=>({...f,subjectId:'',shopId:'',attachments}));setDirty(true);setError('')}}>重新选择主体</button><button className="text-btn" disabled={uploadBusy} onClick={()=>setPublicEditor('subject')}>编辑主体资料</button></div>:form.customerId&&<div className="opening-subject-options">
        <h3>该客户已关联主体（{subjectOptions.relatedCount}）</h3>
        {subjectOptions.linked.length?<div className="opening-matches" role="group" aria-label="该客户已关联主体">{subjectOptions.linked.map(s=><button key={s.id} disabled={uploadBusy} onClick={()=>selectSubject(s)}><strong>{s.name}</strong><small>{s.creditCode||'信用代码未登记'} · 选择并复用</small></button>)}</div>:<p className="opening-empty-hint">{subjectOptions.relatedCount?'该客户下没有匹配主体，可清空搜索查看全部关联主体。':'该客户暂无关联主体，可新增主体，或输入名称 / 信用代码查找已有主体复用。'}</p>}
        {!!subjectOptions.other.length&&<><h3>其他已登记主体</h3><p className="opening-empty-hint">以下主体尚未关联当前客户，选择后复用资料并建立关联。</p><div className="opening-matches" role="group" aria-label="其他已登记主体">{subjectOptions.other.map(s=><button key={s.id} disabled={uploadBusy} onClick={()=>selectSubject(s)}><strong>{s.name}</strong><small>{s.creditCode||'信用代码未登记'} · 关联并复用</small></button>)}</div></>}
        {subjectQuery.trim()&&!subjectOptions.linked.length&&!subjectOptions.other.length&&<p className="opening-empty-hint">未找到已登记主体，可按营业执照名称新增。</p>}
        {!subjectOptions.exact&&<button className="btn" disabled={uploadBusy} onClick={()=>setPublicEditor('newSubject')}>{subjectQuery.trim()?'新增主体「'+subjectQuery.trim()+'」':'＋ 新增主体'}</button>}
      </div>}
    </div>
      {subject&&<><div className="opening-subject-summary"><span>统一社会信用代码：<b>{subject.creditCode||'未填写'}</b></span>{form.product==='本地推'&&<><span>主体名称（直客名称）：<b>{subject.name}</b></span><span>主体直客 ID：<b>{direct.directId||'未填写（非必填）'}</b></span></>}</div>{shopConflict?<Notice tone="amber"><strong>历史关系待核对：此主体关联 {shops.length} 个历史店铺。</strong><p>新开户要求一主体一店，当前不能自动选取或提交。历史资料保留，可进入旧记录核对。</p>{shops.map(s=><button className="btn" key={s.id} onClick={()=>go('M03',{customerId:form.customerId,subjectId:form.subjectId,shopId:s.id})}>查看历史店铺：{s.name}</button>)}</Notice>:shop?<div className="opening-linked-shop"><div><Badge tone="green">已选择店铺</Badge><dl className="kv"><dt>店铺名称（来客名称）</dt><dd>{shop.name}</dd>{form.product==='本地推'&&<><dt>来客 ID</dt><dd>{shop.laikeId||'未填写'}</dd></>}</dl></div><button className="btn" disabled={uploadBusy} onClick={()=>setPublicEditor('shop')}>编辑店铺资料</button></div>:<div className="opening-empty-shop"><span>此主体尚未登记店铺。</span><button className="btn" disabled={uploadBusy} onClick={()=>setPublicEditor('newShop')}>新增店铺</button></div>}</>}
    </Section>
    <Section title="开户数量"><div className="opening-quantity"><button className="btn" aria-label="减少开户数量" disabled={form.rows.length<=1} onClick={()=>changeCount(form.rows.length-1)}>−</button><output aria-label="开户数量">{form.rows.length}</output><button className="btn" aria-label="增加开户数量" onClick={()=>changeCount(form.rows.length+1)}>＋</button></div><p className="muted">填写本次需要开通的广告账户数量。</p></Section>
    <Section title="营业执照与资质">{subject?<OpeningAttachments onBusyChange={setUploadBusy} files={form.attachments||[]} onChange={files=>change('attachments',files)} product={form.product} workflow={workflow} subjectId={form.subjectId}/>:<Notice>请先选择或新增主体，再上传该主体的营业执照与资质。</Notice>}</Section>
    <Section title="办理补充资料"><div className="form-grid"><Field label="开户方式"><select value={form.handlingPath||'人工办理'} onChange={e=>change('handlingPath',e.target.value)}><option>人工办理</option><option>平台接口（暂未开通）</option><option>外部已开户补录</option></select></Field><Field label="账户类型"><select value={form.objectType||'普通广告账户'} onChange={e=>change('objectType',e.target.value)}><option>普通广告账户</option><option disabled>共享钱包（仅历史迁移）</option></select></Field><Field label="渠道公司（如适用）"><select value={form.channelId||''} onChange={e=>change('channelId',e.target.value)}><option value="">未指定</option>{db.customers.filter(c=>c.kind==='渠道').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>{(workflow?.fields||[]).filter(f=>!['region','attachments'].includes(f.id)&&f.visible!==false).map(f=>{const editable=['商务主管','系统管理员'].includes(session.role)||!f.allowedRoles?.length||f.allowedRoles.includes(session.role);return <Field key={f.id} label={f.label} required={f.required} hint={!editable?'当前角色只读':undefined}>{f.type==='select'?<select disabled={!editable} value={form.customValues?.[f.id]??''} onChange={e=>change('customValues',{...form.customValues,[f.id]:e.target.value})}><option value="">请选择</option>{(f.options||[]).map(o=><option key={o}>{o}</option>)}</select>:<input disabled={!editable} type={['number','date'].includes(f.type)?f.type:'text'} value={form.customValues?.[f.id]??''} onChange={e=>change('customValues',{...form.customValues,[f.id]:e.target.value})}/>}</Field>})}</div><Field label="流转备注（选填）"><textarea value={form.note||''} onChange={e=>change('note',e.target.value)} placeholder="填写办理说明或待补资料"/></Field></Section>
    <div className="opening-submit"><div><strong>申请 {form.rows.length} 个账户</strong><span>{form.customerId?nameOf(db.customers,form.customerId):'待选择客户'} · {form.product} · {form.region}</span><small>负责商务：{businessName(form.businessOwnerId)||'待选择'} · 流程 v{workflow?.version||'未匹配'}</small></div><button className="btn" disabled={uploadBusy} onClick={()=>saveDraft()}>保存草稿</button><button className="btn primary" disabled={shopConflict||uploadBusy} onClick={submit}>提交开户申请</button></div>
    {['newSubject','subject'].includes(publicEditor)&&<SubjectEditor {...p} initialName={publicEditor==='newSubject'?subjectQuery:''} subjectId={publicEditor==='subject'?form.subjectId:undefined} customerId={form.customerId} onSaved={(id,meta)=>{const attachments=attachmentsForSubject(id);setForm(f=>({...f,subjectId:id,shopId:openingShopState(db,id).shop?.id||'',attachments,note:[f.note,meta?.note].filter(Boolean).join('\n')}));setDirty(true)}} onClose={()=>setPublicEditor(null)}/>}
    {['newShop','shop'].includes(publicEditor)&&<ShopEditor {...p} subjectId={form.subjectId} shopId={publicEditor==='shop'?form.shopId:undefined} product={form.product} onSaved={(id,meta)=>setForm(f=>({...f,shopId:id,note:[f.note,meta?.note].filter(Boolean).join('\n')}))} onClose={()=>setPublicEditor(null)}/>}
  </div>;
}

function Copies(p){const {db,params,go}=p;const [id,setId]=useState(params.accountId||'');const a=db.accounts.find(x=>x.id===id);return <><PageHeader eyebrow="ACCOUNTS / 资料复用" title="复制资料申请新户" description="复用主体与店铺资料；新账户的真实 ID 和纵横重新填写。"/><Section title="选择资料来源"><Field label="已有广告账户"><select value={id} onChange={e=>setId(e.target.value)}><option value="">选择来源账户</option>{db.accounts.map(a=><option key={a.id} value={a.id}>{a.name||a.externalId} / {a.externalId}</option>)}</select></Field>{a&&<><dl className="kv"><dt>保留引用</dt><dd>{nameOf(db.customers,a.customerId)} / {nameOf(db.subjects,a.subjectId)} / {nameOf(db.shops,a.shopId)}</dd><dt>重新确认</dt><dd>本次商务、产品、供应商和申请资料</dd><dt>不复制</dt><dd>广告账户 ID、纵横、历史资金</dd></dl><button className="btn primary" onClick={()=>go('M06',{mode:'new',copyAccountId:a.id,customerId:a.customerId,subjectId:a.subjectId,shopId:a.shopId})}>建立独立开户申请</button></>}</Section></>;}
function Ownership(p){
  const {db,params,session,update,toast}=p,[selected,setSelected]=useState(params.ids||[]),[modal,setModal]=useState(null),[target,setTarget]=useState('demo-sales-b'),[reason,setReason]=useState('');
  const save=()=>{if(!allowed(session,'transfer'))return toast('需要商务主管确认或管理员演示权限。','error');if(!reason.trim())return toast('请填写交接/协办原因','error');update(d=>{d.accounts.filter(a=>selected.includes(a.id)).forEach(a=>{const name=target==='demo-sales-a'?'演示商务 A':'演示商务 B';a.changes=[...(a.changes||[]),{at:new Date().toISOString(),text:modal==='handoff'?'归属 '+(a.businessOwnerName||'待核验')+' → '+name+'；'+reason:'协办授权 '+name+'；'+reason}];if(modal==='handoff'){a.businessOwnerId=target;a.businessOwnerName=name;a.localChange=true;}else{a.collaborators=[...(a.collaborators||[]),{id:target,name,scope:'本地演示业务',expires:'本次评审期间'}]}})},modal==='handoff'?'主管确认账户交接（演示）':'新增协办授权（演示）');setModal(null);toast('本地变更已留痕；历史来源与原操作记录保留。')};
  return <><PageHeader eyebrow="ACCOUNTS / 责任协作" title="账户归属、交接与协办" description="交接单位是账户；公共客户和主体不随商务复制或整体转移。" actions={<><button className="btn" disabled={!selected.length} onClick={()=>{setModal('assist');setReason('')}}>授权协办</button><button className="btn primary" disabled={!selected.length} onClick={()=>{setModal('handoff');setReason('')}}>主管确认交接</button></>}/><Notice tone="amber">当前真实样本没有可靠账户归属。批量操作仅生成本地演示变更，不把客户销售字段当成账户归属证据。</Notice><Section><AccountTable db={db} rows={db.accounts} openAccount={p.openAccount} selected={selected} onSelect={setSelected}/></Section>{modal&&<Modal title={(modal==='handoff'?'账户交接':'协办授权')+' · '+selected.length+' 户'} onClose={()=>setModal(null)} footer={<button className="btn primary" onClick={save}>确认本地演示变更</button>}><Field label="接收商务 / 协办人"><select value={target} onChange={e=>setTarget(e.target.value)}><option value="demo-sales-a">演示商务 A</option><option value="demo-sales-b">演示商务 B</option></select></Field><Field label="原因及依据" required><textarea value={reason} onChange={e=>setReason(e.target.value)}/></Field><Notice>未勾选账户不变。过往单据与收益快照不覆盖；协办不自动取得账户归属或跨商务平台转户权限。</Notice></Modal>}</>;
}
export default function CoreModule(p){switch(p.moduleId){case'M01':return <Workbench key={p.session.role+':'+p.session.name} {...p}/>;case'M02':return <Customers {...p}/>;case'M03':return <Records key={JSON.stringify(p.params)} {...p}/>;case'M04':return <Suppliers {...p}/>;case'M05':return <Accounts key={p.session.role+':'+p.session.businessId} {...p}/>;case'M06':return <Opening key={openingDraftActorKey(p.session)+':'+p.session.role+':'+JSON.stringify(p.params)} {...p}/>;case'M07':return <Copies {...p}/>;case'M08':return <Ownership {...p}/>;default:return null}}
