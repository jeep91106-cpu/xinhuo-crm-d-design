const DATABASE='xinhuo-review-qualification-files-v1';
function openStore(){return new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB)return reject(new Error('当前浏览器不能保存文件，请在支持本地存储的浏览器打开原型。'));
  const request=indexedDB.open(DATABASE,1);
  request.onupgradeneeded=()=>request.result.createObjectStore('files',{keyPath:'id'});
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(new Error('无法打开本地文件存储，请检查浏览器存储权限。'));
});}
export async function storeAttachment(file,{policyId,subjectId}={}){
  const db=await openStore(),id='FILE-'+crypto.randomUUID();
  try{await new Promise((resolve,reject)=>{
    const tx=db.transaction('files','readwrite');tx.objectStore('files').put({id,blob:file});
    tx.oncomplete=resolve;tx.onerror=()=>reject(new Error('文件未保存：本地空间不足或写入失败。'));tx.onabort=tx.onerror;
  });}finally{db.close();}
  return {id,name:file.name,type:file.type,size:file.size,policyId,subjectId,storageKey:id,storedLocally:true,uploadedAt:new Date().toISOString()};
}
export async function loadAttachment(file){
  const db=await openStore();
  try{return await new Promise((resolve,reject)=>{
    const request=db.transaction('files','readonly').objectStore('files').get(file.storageKey);
    request.onsuccess=()=>request.result?.blob?resolve(request.result.blob):reject(new Error('当前浏览器没有这份文件，请回到上传时的浏览器，或在原单重新上传。'));
    request.onerror=()=>reject(new Error('文件读取失败，请重试。'));
  });}finally{db.close();}
}
