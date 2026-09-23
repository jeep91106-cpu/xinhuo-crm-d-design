export function visibleColumns(columns,prefs={}){
 const names=columns.map(c=>c.key),order=[...new Set([...(prefs.order||[]).filter(k=>names.includes(k)),...names])];
 const mandatory=new Set([names[0],...names.filter(k=>['action','actions'].includes(k))]);
 return order.filter(k=>mandatory.has(k)||!(prefs.hidden||[]).includes(k)).map(k=>columns.find(c=>c.key===k));
}
export function orderedRows(rows,sort){
 if(!sort?.key)return rows;
 return [...rows].sort((a,b)=>{const x=a[sort.key],y=b[sort.key];if(x==null&&y==null)return 0;if(x==null)return 1;if(y==null)return -1;const n=typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y),'zh-CN');return sort.direction==='desc'?-n:n});
}
export const tableDefaults=size=>({page:1,pageSize:size,density:'comfortable',hidden:[],order:[],widths:{},pinFirst:false,sort:null});
