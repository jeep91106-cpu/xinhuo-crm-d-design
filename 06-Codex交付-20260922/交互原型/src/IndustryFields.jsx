import React,{useEffect,useId,useState} from 'react';
import {Notice,Section} from './ui.jsx';
import {industryOptions,industryStatus,saveIndustryDictionary} from './industry-dictionary.js';
import './industry-fields.css';

export function IndustrySelect({db,value='',onChange}){
  const [query,setQuery]=useState(value),[open,setOpen]=useState(false),[active,setActive]=useState(0),id=useId();
  useEffect(()=>setQuery(value),[value]);
  const options=industryOptions(db),matches=options.filter(item=>item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),status=industryStatus(db,value);
  const choose=item=>{onChange(item.name);setQuery(item.name);setOpen(false);};
  return <div className="field industry-select" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget)){setOpen(false);setQuery(value);}}}>
    <label htmlFor={id}>行业</label>
    <div className="industry-input"><input id={id} role="combobox" aria-label="搜索并选择行业" aria-expanded={open} aria-controls={id+'-options'} aria-autocomplete="list" aria-activedescendant={open&&matches[active]?id+'-'+active:undefined} autoComplete="off" value={query} placeholder="搜索并选择行业" onFocus={()=>{setOpen(true);setQuery('');setActive(0);}} onChange={event=>{setQuery(event.target.value);setActive(0);setOpen(true);}} onKeyDown={event=>{
      if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);setActive(index=>Math.min(index+1,Math.max(0,matches.length-1)));}
      if(event.key==='ArrowUp'){event.preventDefault();setActive(index=>Math.max(0,index-1));}
      if(event.key==='Enter'&&open){event.preventDefault();if(matches[active])choose(matches[active]);}
      if(event.key==='Escape'){event.stopPropagation();setOpen(false);setQuery(value);}
    }}/>{value&&<button type="button" className="text-btn" aria-label="清空行业" onClick={()=>{onChange('');setQuery('');setOpen(false);}}>清空</button>}</div>
    {open&&<div className="industry-options" id={id+'-options'} role="listbox">{matches.length?matches.map((item,index)=><button type="button" id={id+'-'+index} role="option" aria-selected={value===item.name} className={index===active?'active':''} key={item.id} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(item)}>{item.name}</button>):<p>{options.length?'未找到匹配行业':'暂无可选行业，请联系管理员配置'}</p>}</div>}
    {value&&<small className={status?'industry-history':'muted'}>{status?value+' · '+status:open?'已选择：'+value:''}</small>}
  </div>;
}

export function IndustryDictionaryEditor({db,session,update,toast,onDirtyChange}){
  const [items,setItems]=useState(()=>industryOptions(db,{includeDisabled:true})),[dirty,setDirty]=useState(false),[error,setError]=useState('');
  const editable=session.role==='系统管理员',signature=JSON.stringify(db.industryDictionary||[]);
  useEffect(()=>{if(!dirty)setItems(industryOptions(db,{includeDisabled:true}));},[signature,dirty]);
  useEffect(()=>{onDirtyChange?.(dirty);return()=>onDirtyChange?.(false);},[dirty,onDirtyChange]);
  const change=next=>{setItems(next);setDirty(true);setError('');};
  const move=(index,delta)=>{const next=items.slice();[next[index],next[index+delta]]=[next[index+delta],next[index]];change(next);};
  const save=()=>{try{update(d=>saveIndustryDictionary(d,items,{session}),'更新行业选项');setDirty(false);setError('');toast('行业选项已保存');}catch(cause){setError(cause.message);}};
  return <Section title="行业选项" actions={<button className="btn primary" disabled={!editable||!dirty} onClick={save}>保存行业选项</button>}>
    <p className="muted">用于主体资料中的行业选择。改名或停用后，已保存的主体行业继续保留。</p>
    <p className="muted">初始提供餐饮、住宿、美容美发、休闲娱乐、教育培训、零售，可按业务调整；这些选项不是旧系统或官方行业分类。</p>
    {!editable&&<Notice>只有系统管理员可以维护行业选项。</Notice>}{error&&<Notice tone="error">{error}</Notice>}
    <div className="industry-dictionary">{items.map((item,index)=><div className="industry-row" key={item.id}>
      <span className="muted">{index+1}</span><input aria-label={'行业名称 '+(index+1)} disabled={!editable} value={item.name} placeholder="行业名称" onChange={event=>change(items.map((old,i)=>i===index?{...old,name:event.target.value}:old))}/>
      <label><input type="checkbox" disabled={!editable} checked={item.enabled!==false} onChange={event=>change(items.map((old,i)=>i===index?{...old,enabled:event.target.checked}:old))}/> 启用</label>
      <button className="btn quiet" aria-label={'上移行业 '+(index+1)} disabled={!editable||index===0} onClick={()=>move(index,-1)}>上移</button><button className="btn quiet" aria-label={'下移行业 '+(index+1)} disabled={!editable||index===items.length-1} onClick={()=>move(index,1)}>下移</button>
    </div>)}</div>
    {!items.length&&<p className="muted">尚未配置行业选项。</p>}
    {editable&&<button className="btn" onClick={()=>change([...items,{id:'IND-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),name:'',enabled:true,order:items.length}])}>新增行业</button>}
    {dirty&&<button className="btn quiet" onClick={()=>{setItems(industryOptions(db,{includeDisabled:true}));setDirty(false);setError('');}}>撤销修改</button>}
  </Section>;
}
