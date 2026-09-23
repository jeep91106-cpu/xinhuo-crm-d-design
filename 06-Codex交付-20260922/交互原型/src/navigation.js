export const NAV_GROUPS=[
 {name:'工作与公共资料',ids:['M01','M02','M03','M04','M05','M06','M07','M08']},
 {name:'资金与业务结算',ids:['M09','M10','M11','M12','M13','M14','M15','M16','M17','M18','M19','M20','M21','M22']},
 {name:'经营与协作',ids:['M23','M24','M25','M26','M27','M28','M38']},
 {name:'人事行政',ids:['M29','M30','M31','M32']},
 {name:'配置与控制',ids:['M33','M34','M35','M36','M37','M39','M40']}
];
export function normalizeRoute(id,params={}){
 const valid=NAV_GROUPS.some(g=>g.ids.includes(id));
 return {id:valid?id:'M01',params:params&&typeof params==='object'&&!Array.isArray(params)?Object.fromEntries(Object.entries(params).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b))):{}};
}
export function routeKey(route){const r=normalizeRoute(route.id,route.params);return r.id+'?'+JSON.stringify(r.params)}
export function routeHash(route){const r=normalizeRoute(route.id,route.params);return '#'+r.id+(Object.keys(r.params).length?'?'+encodeURIComponent(JSON.stringify(r.params)):'')}
export function parseRoute(hash){try{const [id,p]=hash.replace(/^#/,'').split('?');return normalizeRoute(id,p?JSON.parse(decodeURIComponent(p)):{})}catch{return normalizeRoute('M01')}}
export function routePhase(route){const p=route.params||{};return p.mode==='new'?'新增申请':p.mode==='resumeDraft'?'继续草稿':p.applicationId?'开户原单':p.recordId?'业务原单':p.customerId&&route.id==='M02'?'客户全景':''}
export function nextRouteTrail(trail,previous,next,options={}){
 if(options.back||options.browser&&options.direction<0){const found=trail.map(routeKey).lastIndexOf(routeKey(next));return found>=0?trail.slice(0,found):trail.slice(0,-1)}
 return [...trail,previous].slice(-15);
}
// A blocked browser Back is restored with history.go, never by overwriting the
// historical destination. The user may resume that exact traversal afterward.
export function createRouteHistory({history,readRoute,isDirty,onApply,onBlocked}){
 const field='xinhuoNavigationIndex';
 let current=readRoute(),index=Number.isInteger(history.state?.[field])?history.state[field]:0,restoring=null,queued=null;
 const mark=i=>({...history.state,[field]:i});
 history.replaceState(mark(index),'',routeHash(current));
 const apply=(next,options={})=>{const previous=current;current=next;onApply(next,{...options,previous,index})};
 const commit=(next,options)=>{
  if(restoring!==null){queued={next,options};return;}
  if(Number.isInteger(options.traverseTo)){const delta=options.traverseTo-index;if(delta)history.go(delta);return;}
  if(!options.replace)index++;
  history[options.replace?'replaceState':'pushState'](mark(index),'',routeHash(next));apply(next,options);
 };
 const navigate=(next,options={})=>{next=normalizeRoute(next.id,next.params);if(routeKey(current)===routeKey(next))return;if(isDirty()&&!options.committed){onBlocked({next,options});return;}commit(next,options)};
 const onPop=()=>{
  const next=readRoute();let targetIndex=history.state?.[field];
  if(!Number.isInteger(targetIndex)){targetIndex=index+1;history.replaceState(mark(targetIndex),'',routeHash(next));}
  if(restoring!==null){if(targetIndex===restoring){restoring=null;const resume=queued;queued=null;if(resume)commit(resume.next,resume.options)}return;}
  if(routeKey(current)===routeKey(next)&&targetIndex===index)return;
  const direction=targetIndex-index;
  if(isDirty()){
   restoring=index;
   history.go(index-targetIndex);
   onBlocked({next,options:{traverseTo:targetIndex,browser:true}});return;
  }
  index=targetIndex;apply(next,{browser:true,direction});
 };
 return {navigate,onPop,current:()=>current,index:()=>index};
}
