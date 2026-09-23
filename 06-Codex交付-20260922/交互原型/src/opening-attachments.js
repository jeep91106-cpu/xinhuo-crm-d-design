export const ATTACHMENT_PRODUCTS=['全部产品','本地推','巨量AD','腾讯K4','快手'];
export const ATTACHMENT_EXTENSIONS=['pdf','png','jpg','jpeg','webp'];
export const DEFAULT_ATTACHMENT_POLICIES=[
  {id:'license',label:'营业执照',product:'全部产品',visible:true,required:false,requiredAt:'submit',accept:[...ATTACHMENT_EXTENSIONS],maxSizeMB:10},
  {id:'qualification',label:'其他资质',product:'全部产品',visible:true,required:false,requiredAt:'submit',accept:[...ATTACHMENT_EXTENSIONS],maxSizeMB:10},
];
export function attachmentPolicies(workflow={}){
  return structuredClone(Array.isArray(workflow?.attachmentPolicies)?workflow.attachmentPolicies:DEFAULT_ATTACHMENT_POLICIES);
}
export function applicableAttachmentPolicies(workflow,product){return attachmentPolicies(workflow).filter(p=>p.visible!==false&&(p.product==='全部产品'||p.product===product));}
export function attachmentFileError(file,policy){
  if(!policy)return '该材料类型已不适用于当前产品，请重新选择。';
  const extension=String(file.name||'').split('.').pop().toLowerCase();
  if(!(policy.accept||ATTACHMENT_EXTENSIONS).includes(extension))return policy.label+'仅支持 '+(policy.accept||ATTACHMENT_EXTENSIONS).join('、').toUpperCase()+' 文件。';
  if(!Number.isFinite(file.size)||file.size<=0)return '文件为空或无法读取，请重新选择。';
  if(file.size>(policy.maxSizeMB||10)*1024*1024)return policy.label+'单文件不能超过 '+(policy.maxSizeMB||10)+' MB。';
  return '';
}
export function validateAttachmentPolicies(workflow){
  const policies=workflow?.attachmentPolicies;
  if(policies==null)return [];
  if(!Array.isArray(policies))return ['资质规则必须为材料列表'];
  const errors=[];
  if(new Set(policies.map(p=>p.id)).size!==policies.length)errors.push('资质类型标识不能重复');
  for(const p of policies){
    if(!String(p.id||'').trim()||!String(p.label||'').trim())errors.push('资质类型和名称不能为空');
    if(!ATTACHMENT_PRODUCTS.includes(p.product))errors.push('资质规则须指定有效产品范围');
    if(!['submit','execution'].includes(p.requiredAt))errors.push('资质收集时点须为申请提交或媒介执行前');
    if(p.required&&p.visible===false)errors.push(p.label+'不能同时设为隐藏和必需');
    if(!Number.isInteger(p.maxSizeMB)||p.maxSizeMB<1||p.maxSizeMB>20)errors.push('本地资质文件大小需为 1–20 MB 的整数');
    if(!Array.isArray(p.accept)||!p.accept.length||p.accept.some(ext=>!ATTACHMENT_EXTENSIONS.includes(ext)))errors.push('资质格式仅支持 PDF、PNG、JPG、JPEG、WEBP');
  }
  if(workflow?.fields?.some(f=>f.id==='attachments'&&f.required)){
    const products=workflow.scopeMode==='global'||!workflow.product?ATTACHMENT_PRODUCTS.slice(1):[workflow.product];
    for(const product of products)if(!policies.some(p=>p.visible!==false&&(p.product==='全部产品'||p.product===product)))errors.push(product+'要求开户资料，但没有可用的上传入口');
  }
  return [...new Set(errors)];
}
export function validateOpeningAttachments(files=[],workflow={},product,stage='submit'){
  const errors=[],policies=applicableAttachmentPolicies(workflow,product);
  for(const file of files){
    const policy=policies.find(p=>p.id===file.policyId);
    const error=attachmentFileError(file,policy);
    if(error)errors.push(file.name+'：'+error);
    if(!file.storageKey||file.storedLocally!==true)errors.push(file.name+'尚未保存文件，请重新上传。');
  }
  const saved=files.filter(f=>f.storageKey&&f.storedLocally===true);
  // Previously published generic attachment requirements still require a real file.
  if(workflow?.fields?.some(f=>f.id==='attachments'&&f.required)&&!saved.length)errors.push('请上传配置要求的开户资料。');
  for(const p of policies){
    if(p.required&&(stage==='execution'||p.requiredAt==='submit')&&!saved.some(f=>f.policyId===p.id))errors.push('请上传'+p.label+(p.requiredAt==='execution'?'（媒介执行前补齐）':'（申请提交时必需）'));
  }
  return [...new Set(errors)];
}
