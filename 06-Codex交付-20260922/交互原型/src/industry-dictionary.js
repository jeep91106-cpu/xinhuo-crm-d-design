const clean=value=>String(value??'').trim();
const normalized=value=>clean(value).normalize('NFKC').replace(/\s+/g,'').toLowerCase();
export const INITIAL_INDUSTRIES=['餐饮','住宿','美容美发','休闲娱乐','教育培训','零售'].map((name,order)=>({id:'INITIAL-IND-'+(order+1),name,enabled:true,order}));

export function industryOptions(db,{includeDisabled=false}={}){
  return (Array.isArray(db.industryDictionary)?db.industryDictionary:INITIAL_INDUSTRIES).filter(item=>includeDisabled||item.enabled!==false).slice().sort((a,b)=>(a.order??0)-(b.order??0));
}

export function industryStatus(db,value){
  if(!clean(value))return '';
  const item=industryOptions(db,{includeDisabled:true}).find(item=>item.name===value);
  return !item?'历史值，未列入当前选项':item.enabled===false?'已停用，当前资料保留':'';
}

export function validateSubjectIndustry(db,value,originalValue=''){
  const selected=clean(value);
  if(!selected||selected===clean(originalValue))return;
  if(!industryOptions(db).some(item=>item.name===selected))throw Error('请选择当前可用的行业选项。');
}

export function saveIndustryDictionary(db,items,{session}={}){
  if(session?.role!=='系统管理员')throw Error('只有系统管理员可以维护行业选项。');
  const names=new Set(),ids=new Set();
  const next=items.map((item,order)=>{
    const name=clean(item.name),id=clean(item.id)||'IND-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
    if(!name)throw Error('请填写行业名称。');
    if(names.has(normalized(name)))throw Error('行业名称重复：'+name+'。');
    if(ids.has(id))throw Error('行业记录重复，请刷新后重试。');
    names.add(normalized(name));ids.add(id);
    return {id,name,enabled:item.enabled!==false,order};
  });
  db.industryDictionary=next;
  return next;
}
