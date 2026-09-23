import {validateAttachmentPolicies} from './opening-attachments.js';
const f=(key,label,type='text',value='',options=[])=>({key,label,type,value,options,required:true});
const a=(label,to,roles,extra={})=>({label,to,roles,...extra});
const finance=['财务'], boss=['Boss','商务主管'], hr=['人事'], admin=['系统管理员'];
export const operationSpecs={
 M23:{title:'报销、费用与采购',desc:'批准金额、实际付款与剩余应付分别展示；演示不会发起银行付款。',fields:[f('name','申请事由','text','演示：差旅交通费'),f('category','费用类别','select','报销',['报销','部门费用','采购']),f('department','费用部门','text','演示部门'),f('amount','申请金额（元）','money','1000.00'),f('payee','实际收款方','text','演示员工甲'),f('proof','发票 / 依据编号','text','DEMO-FP-001')],states:['草稿','审批中','已批待付','部分付','已付','退回'],actions:{草稿:[a('提交审批','审批中',['*'])],审批中:[a('演示批准','已批待付',boss),a('退回补充','退回',boss)],退回:[a('重新提交','审批中',['*'])],已批待付:[a('演示登记付款','已付',finance,{payment:true})],部分付:[a('演示登记剩余付款','已付',finance,{payment:true})]},note:'付款前校验未付金额和凭证；部分支付不会把剩余应付抹掉。'},
 M24:{title:'消耗数据与来源匹配',desc:'消耗事实和成本分摊独立于现金；未知账户先核对，不自动开户。',fields:[f('name','消耗批次','text','演示：本地推日消耗'),f('accountRef','账户 ID','text','DEMO-AD-001'),f('period','消耗日期','date','2026-09-21'),f('amount','消耗量','money','800.00'),f('unit','单位','select','广告币',['广告币','现金元']),f('sourceCapacity','可分摊来源容量','money','1000.00'),f('sourceRef','充值来源编号','text','DEMO-CZ-001')],states:['待关联','待匹配','已匹配','待核对'],actions:{待关联:[a('核实账户关联','待匹配',['充值媒介','财务','商务主管'])],待匹配:[a('匹配来源（演示）','已匹配',['财务','充值媒介'],{match:true})],已匹配:[a('撤销本次分摊','待匹配',['财务'],{reason:true})],待核对:[a('重新核对来源','待匹配',['财务'],{reason:true})]},note:'匹配仅登记来源占用，绝不再次扣客户或渠道的钱包。'},
 M25:{title:'经营报表与口径',desc:'同一筛选用于汇总、明细和导出；缺数据与数值 0 分开。',fields:[f('name','报表名称','text','演示：月度业务概览'),f('period','期间','month','2026-09'),f('product','产品范围','select','全部产品',['全部产品','本地推','巨量AD','腾讯K4','快手']),f('metric','指标口径','select','开户数量',['开户数量','消耗分析','业务完成量']),f('basis','对比基数','number','0'),f('coverage','来源完整性','select','完整演示数据',['完整演示数据','存在缺口'])],states:['待生成','可查看','有缺口'],actions:{待生成:[a('生成演示报表','可查看',['*'],{report:true})],有缺口:[a('保留缺口重新生成','有缺口',['*'],{report:true})],可查看:[a('按原范围重算','可查看',['*'],{report:true})]},note:'演示数据不代表真实经营结果；基数为 0 时没有可比较增长率。'},
 M26:{title:'收益、提成与差额核算',desc:'演示模板用于交互评审，不替代已经核验的旧业务公式。',fields:[f('name','核算批次','text','演示：九月提成试算'),f('employee','员工 / 任职','text','演示员工甲 / 商务岗'),f('period','期间','month','2026-09'),f('formula','计算依据','text','DEMO-规则：基数 × 演示比例'),f('amount','可核算基数（元）','money','5000.00'),f('rate','演示比例（%）','number','5'),f('evidence','业务来源依据','text','DEMO-核算明细-01')],states:['待输入','试算','确认','发布','调整'],actions:{待输入:[a('演示试算','试算',finance,{calculate:true})],试算:[a('确认本版','确认',finance)],确认:[a('发布核算结果','发布',finance)],发布:[a('建立差额版本','调整',finance,{reason:true})],调整:[a('重新试算差额','试算',finance,{calculate:true})]},note:'发布不代表实际发放。调整保留此前结果和原因，不改历史归属。'},
 M27:{title:'激励政策与期间核算',desc:'政策审批、试算和确认分开；激励结果不会自动给客户或员工付款。',fields:[f('name','政策名称','text','演示：丽人季度激励'),f('period','适用期间','month','2026-09'),f('product','产品','select','本地推',['本地推','巨量AD','腾讯K4','快手']),f('basis','指标基数','number','100'),f('actual','实际完成值','number','120'),f('evidence','来源依据','text','DEMO-统计版本-01')],states:['草稿','审批中','有效','试算','确认'],actions:{草稿:[a('提交政策审批','审批中',['商务','渠道商务','商务主管'])],审批中:[a('演示批准政策','有效',boss)],有效:[a('演示试算达成率','试算',finance,{ratio:true})],试算:[a('确认核算','确认',finance)]},note:'基数为 0 时拦截除法，展示缺口；客户按稳定 ID 对应，不能仅凭名称。'},
 M28:{title:'素材绩效与剪辑统计',desc:'演示数量与有效率；增量和范围替换先展示影响，不覆盖整期历史。',fields:[f('name','素材批次','text','演示：丽人素材九月批次'),f('employee','剪辑人员','text','演示员工乙'),f('period','期间','month','2026-09'),f('total','素材总数','number','100'),f('valid','有效素材数','number','82'),f('mode','导入方式','select','增量',['增量','范围替换']),f('evidence','来源摘要','text','DEMO-material-01')],states:['待预检','差异预览','已导入'],actions:{待预检:[a('预检与影响预览','差异预览',['商务主管','人事','财务'],{material:true})],差异预览:[a('确认演示导入','已导入',['商务主管','人事','财务'])]},note:'有效数不得大于总数；这里只形成素材统计，不自动改变员工工资。'},
 M29:{title:'员工任职与劳动合同',desc:'全部人员为合成演示；组织映射、岗位任职和 CRM 角色分别管理。',fields:[f('name','员工姓名','text','演示员工甲'),f('employeeId','稳定员工 ID','text','DEMO-EMP-001'),f('department','部门','text','演示业务一部'),f('position','任职岗位','text','商务岗'),f('effective','生效日期','date','2026-09-21'),f('contract','劳动合同版本','text','DEMO-LD-v1')],states:['待映射','试用任职','正式任职','离职待交接','归档'],actions:{待映射:[a('核实演示映射','试用任职',hr)],试用任职:[a('登记已批准转正','正式任职',hr,{reason:true})],正式任职:[a('登记离职并停用','离职待交接',hr,{reason:true})],离职待交接:[a('确认交接归档','归档',hr,{reason:true})]},note:'组织接口未接入。本模块只停用演示人员标识；业务账户交接通过 M08，不自动整客户转移。'},
 M30:{title:'考勤、请假与调休',desc:'时间重叠检查、审批和工资差异分别展示；未接入真实打卡系统。',fields:[f('name','申请说明','text','演示：一天事假'),f('employee','员工','text','演示员工甲'),f('category','类型','select','请假',['请假','调休','考勤更正']),f('start','开始时间','datetime-local','2026-09-22T09:00'),f('end','结束时间','datetime-local','2026-09-22T18:00'),f('hours','申请小时数','number','8'),f('payrollHours','工资导入小时数','number','0')],states:['草稿','审批中','批准','退回','工资差异待核对','已核对'],actions:{草稿:[a('提交请假申请','审批中',['*'],{attendance:true})],审批中:[a('演示批准','批准',['商务主管','人事']),a('退回补正','退回',['商务主管','人事'])],退回:[a('重新提交','审批中',['*'],{attendance:true})],批准:[a('核对工资时长','工资差异待核对',hr,{attendanceCompare:true})],工资差异待核对:[a('登记差异处理依据','已核对',hr,{reason:true})]},note:'批准请假不直接扣工资；工资公式与期间更正由授权人员核对。'},
 M31:{title:'工资核对、发布与发放',desc:'合成演示工资；确认、对本人发布、财务实际发放是三个动作。',fields:[f('name','工资批次','text','演示：九月工资'),f('employee','员工','text','演示员工甲'),f('employeeId','员工稳定 ID','text','DEMO-EMP-001'),f('period','工资期间','month','2026-09'),f('gross','应发（元）','money','8000.00'),f('deduct','应扣（元）','money','200.00'),f('evidence','导入文件摘要','text','DEMO-salary-202609-01')],states:['待匹配','试算核对','已确认','已发布','已发'],actions:{待匹配:[a('核实员工及差异','试算核对',['人事','财务'],{salary:true})],试算核对:[a('确认工资','已确认',['人事','财务'])],已确认:[a('演示发布工资单','已发布',['人事','财务'])],已发布:[a('演示登记实际发放','已发',finance,{salaryPay:true})]},note:'普通商务主管没有薪资查看权。所有数据标为演示，发布后仍需独立付款记录。'},
 M32:{title:'考核目标与经营责任',desc:'目标属于经营管理，不是商务个人用款额度。',fields:[f('name','目标名称','text','演示：月度资料完整率'),f('employee','考核对象','text','演示员工甲'),f('level','目标层级','select','个人',['公司','部门','个人']),f('period','考核期间','month','2026-09'),f('metric','指标口径','text','资料完整账户占比（演示）'),f('target','目标值','number','95'),f('actual','完成值','number','92'),f('evidence','核实依据','text','DEMO-指标数据-v1')],states:['草稿','有效','待评','已评','调整'],actions:{草稿:[a('发布目标','有效',['商务主管','人事'])],有效:[a('提交评审','待评',['*'])],待评:[a('登记评审结论','已评',['商务主管','人事'],{reason:true})],已评:[a('发起有据调整','调整',['商务主管','人事'],{reason:true})],调整:[a('提交新版评审','待评',['商务主管','人事'])]},note:'评审结果不自动转正或改工资，保留历史期间和当时任职。'},
 M37:{title:'历史映射与迁移核对',desc:'历史重名、无店铺、重复账户分别核对。这里不会写入真实源数据。',fields:[f('name','核对事项','text','演示：同名客户两份来源'),f('sourceRef','源表与主键','text','DEMO-old_customer:1267 / 1226'),f('kind','冲突类型','select','客户同名',['客户同名','真实账户重复','缺店铺关系','特殊钱包对象']),f('target','候选新身份','text','待核定'),f('evidence','核对依据','text','演示来源快照'),f('strategy','处理策略','select','分别保留来源待核对',['分别保留来源待核对','已核实映射同身份，资金另核','确认不同身份，保留分开'])],states:['冲突','待复核','已核对','试迁移','只读归档'],actions:{冲突:[a('提交映射依据','待复核',['系统管理员','财务'],{mapping:true})],待复核:[a('确认身份映射','已核对',['系统管理员','财务'])],已核对:[a('演示试迁移','试迁移',admin)],试迁移:[a('核对后只读归档','只读归档',admin)]},note:'从不把重复来源余额相加；身份合并不自动合并资金。演示裁定不改变真实样本。'},
 M38:{title:'公海资料与客户跟进',desc:'资料复用与跟进记录；跟进人员不是既有账户的归属商务。',fields:[f('name','线索名称','text','演示：丽人客户合作沟通'),f('customerRef','公共客户引用','text','未关联 / 待核对'),f('owner','跟进责任人','text','演示商务 A'),f('contact','联系事项','text','核对资质与开户需求'),f('nextAt','下次跟进日期','date','2026-09-25'),f('scope','可见范围','select','本人及主管',['本人及主管','本部门','授权协作'])],states:['待核对','可跟进','跟进中','暂停'],actions:{待核对:[a('确认资料可跟进','可跟进',['商务','渠道商务','商务主管'])],可跟进:[a('添加首条跟进','跟进中',['商务','渠道商务','商务主管'],{reason:true})],跟进中:[a('继续记录跟进','跟进中',['商务','渠道商务','商务主管'],{reason:true}),a('暂停跟进','暂停',['商务','渠道商务','商务主管'],{reason:true})],暂停:[a('恢复跟进','跟进中',['商务','渠道商务','商务主管'],{reason:true})]},note:'不自动开启未确认的销售漏斗，跟进操作不更改任何已有广告账户归属。'},
 M40:{title:'同步任务与接口运行',desc:'原请求、执行结果和同步状态分别保存；本地演示不会调用平台接口。',fields:[f('name','任务名称','text','演示：广告账户结果同步'),f('capability','能力目录','select','开户结果查询',['开户结果查询','账户资料拉取','消耗增量拉取','流水拉取']),f('requestId','原请求 / 幂等键','text','DEMO-REQ-001'),f('watermark','数据水位','text','2026-09-21 09:00'),f('owner','负责人','text','演示集成管理员'),f('source','来源能力','select','本地模拟',['本地模拟','尚未接入'])],states:['待接入','待运行','部分失败','待核实','外部成功待同步','完成'],actions:{待接入:[a('载入本地模拟能力','待运行',admin)],待运行:[a('演示运行一次','完成',admin),a('演示结果未知','待核实',admin),a('演示明确失败','部分失败',admin)],部分失败:[a('仅重试明确失败项','完成',admin,{reason:true})],待核实:[a('核实原请求：已成功','外部成功待同步',['系统管理员','媒介主管'],{reason:true}),a('核实原请求：未发生','部分失败',['系统管理员','媒介主管'],{reason:true})],外部成功待同步:[a('只补 CRM 同步（演示）','完成',admin)]},note:'待核实没有重试按钮。补同步保留原请求，不生成第二笔平台开户或扣款事件。'}
};
export const roles=['商务','渠道商务','商务主管','媒介主管','开户媒介','充值媒介','财务','Boss','人事','系统管理员','运营','剪辑','员工'];
export function sessionRoles(session={}){return [...new Set([...(session.roles||[]),session.role].filter(Boolean))];}
export function canOperate(session={},allowed=[]){if(session.disabled||['停用','离职','授权过期'].includes(session.status)||session.effectiveAt&&Date.parse(session.effectiveAt)>Date.now()||session.expiresAt&&Date.parse(session.expiresAt)<=Date.now())return false;return !!(sessionRoles(session).length&&(allowed.includes('*')||sessionRoles(session).some(role=>allowed.includes(role))));}
export function toCents(value){const s=String(value).trim();if(!/^\d+(\.\d{1,2})?$/.test(s))return null;const [w,d='']=s.split('.');const n=Number(w)*100+Number(d.padEnd(2,'0'));return Number.isSafeInteger(n)?n:null;}
export function validateRecord(spec,values){
 const errors={};
 for(const field of spec.fields){
  const v=String(values[field.key]??'').trim();
  if(!v&&!field.required)continue;
  if(field.type==='rows'){
   const list=values[field.key];
   if(!Array.isArray(list)||!list.length)errors[field.key]='至少填写一行'+field.label;
   else if(list.some(row=>Object.keys(validateRecord({fields:field.columns},row)).length))errors[field.key]='逐行填写必填信息和有效非负数值';
  }else if(field.required&&!v)errors[field.key]='请填写'+field.label;
  else if(field.type==='money'&&toCents(v)===null)errors[field.key]='请输入非负金额，最多两位小数';
  else if(field.type==='number'&&(!Number.isFinite(Number(v))||Number(v)<0))errors[field.key]='请输入非负有效数值';
  else if(field.type==='select'&&!field.options.includes(v))errors[field.key]='请选择有效选项';
 }
 if(values.employee&&!String(values.employee).startsWith('演示'))errors.employee='本原型仅允许合成“演示员工”';
 if(spec===operationSpecs.M29&&!String(values.name).startsWith('演示'))errors.name='请使用演示员工名称';
 if(values.start&&values.end&&values.start>=values.end)errors.end='结束时间必须晚于开始';
 if(values.total&&Number(values.valid)>Number(values.total))errors.valid='有效数不能超过总数';
 if(values.gross&&toCents(values.deduct)>toCents(values.gross))errors.deduct='应扣不能超过应发';
 const id=Object.keys(operationSpecs).find(key=>operationSpecs[key]===spec);
 return {...errors,...(id?validateOperationDetails(id,values):{})};
}
export const WORKFLOW_CORE_ROLES={s1:'商务',s2:'媒介主管',s3:'开户媒介',s4:'系统'};
export const WORKFLOW_PRODUCTS=['本地推','巨量AD','腾讯K4','快手'];
export const WORKFLOW_REGIONS=['华南','华东','华北','华中','西南','西北'];
export const WORKFLOW_BUILTIN_FIELDS=['region','attachments'];
export function normalizeWorkflowBuiltinFields(config){
 const next=JSON.parse(JSON.stringify(config));
 const attachments=next.fields?.find(field=>field.id==='attachments');
 next.fields=[{id:'region',label:'办理区域',required:true,visible:true,type:'select',options:[...WORKFLOW_REGIONS]},
  {id:'attachments',label:'开户资料',required:!!attachments?.required,visible:true,type:'file'},
  ...(next.fields||[]).filter(field=>!WORKFLOW_BUILTIN_FIELDS.includes(field.id))];
 return next;
}
export function validateWorkflowConfig(form){
 const issues=[],fields=Array.isArray(form?.fields)?form.fields:[],steps=Array.isArray(form?.steps)?form.steps:[];
 if(!fields.length)issues.push('至少保留一个业务字段');
 if(fields.some(f=>!String(f.id||'').trim()||!String(f.label||'').trim()))issues.push('字段标识和名称不能为空');
 if(new Set(fields.map(f=>f.id)).size!==fields.length)issues.push('字段标识不能重复');
 if(new Set(fields.map(f=>String(f.label||'').trim())).size!==fields.length)issues.push('字段名称不能重复');
 for(const id of WORKFLOW_BUILTIN_FIELDS)if(fields.filter(field=>field.id===id).length!==1)issues.push('必须保留唯一内置采集字段：'+id);
 for(const field of fields){
  if(WORKFLOW_BUILTIN_FIELDS.includes(field.id)){
   const region=field.id==='region';
   if(field.visible===false||field.label!==(region?'办理区域':'开户资料')||(field.collectAt&&field.collectAt!=='s1')||field.allowedRoles)issues.push('内置字段显隐、名称及录入位置不可改写：'+field.id);
   if(region){
    if(field.required!==true)issues.push('办理区域必须保持必填');
    if(field.type!==undefined&&field.type!=='select')issues.push('办理区域只能使用固定区域选择控件');
    if((field.type==='select'||field.options!==undefined)&&(!Array.isArray(field.options)||field.options.length!==WORKFLOW_REGIONS.length||new Set(field.options).size!==WORKFLOW_REGIONS.length||WORKFLOW_REGIONS.some(value=>!field.options.includes(value))))issues.push('办理区域必须保留完整固定区域选项');
   }else if((field.type!==undefined&&field.type!=='file')||field.options!==undefined)issues.push('开户资料为固定文件控件，仅必填规则可配置');
   continue;
  }
  if(field.required&&field.visible===false)issues.push('必填字段不能隐藏：'+field.label);
  if(field.collectAt&&field.collectAt!=='s1')issues.push('扩展字段当前只支持申请节点 s1 采集');
  if(field.allowedRoles&&(!field.allowedRoles.some(role=>['商务','渠道商务'].includes(role))||field.allowedRoles.some(role=>!['商务','渠道商务','商务主管','系统管理员'].includes(role))))issues.push('扩展申请字段需要商务或渠道商务录入角色，可附加主管或管理员代办');
  if(['customerId','subjectId','shopId','product','businessOwnerId','businessOwnerName','handlingPath','objectType','channelId','name','creditCode','industry','bankName','bankAccount','registeredAddress','contactName','contactPhone','licenseName','licenseEvidence','businessAddress','laikeName','laikeId','directName','directId','zonghengId','externalId','supplierId'].includes(field.id))issues.push('标准主档字段不得通过扩展字段覆盖：'+field.id);
  if(field.type&&!['text','number','date','select'].includes(field.type))issues.push('不支持的字段类型：'+field.label);
  if(field.type==='select'&&(!Array.isArray(field.options)||!field.options.length||field.options.some(option=>!String(option).trim())))issues.push('选项字段需要非空候选值：'+field.label);
 }
 if(steps.some(s=>!String(s.id||'').trim()||!String(s.name||'').trim()||!String(s.role||'').trim()))issues.push('每个节点必须有唯一标识、名称与处理角色');
 if(new Set(steps.map(s=>s.id)).size!==steps.length)issues.push('节点 ID 不能重复');
 for(const [id,role] of Object.entries(WORKFLOW_CORE_ROLES)){
  const matches=steps.filter(s=>s.id===id);
  if(matches.length!==1)issues.push('必须且只能保留一个核心节点 '+id);
  else if(matches[0].role!==role)issues.push('核心节点 '+id+' 的处理角色必须为'+role);
 }
 const indexes=Object.keys(WORKFLOW_CORE_ROLES).map(id=>steps.findIndex(s=>s.id===id));
 if(indexes.some((n,i)=>n<0||(i>0&&n<=indexes[i-1])))issues.push('核心节点必须按 s1 → s2 → s3 → s4 顺序保留');
 if(steps[0]?.id!=='s1'||steps.at(-1)?.id!=='s4')issues.push('申请必须开始于 s1、结束于 s4；额外步骤只可插入核心节点之间');
 if(steps.some(s=>!WORKFLOW_CORE_ROLES[s.id]&&!roles.includes(s.role)))issues.push('额外步骤需要有效的演示办理角色');
 if(steps.some(step=>step.candidateRef!==undefined&&!String(step.candidateRef).trim()))issues.push('办理节点需候选人员或角色兜底');
 if(steps.some(step=>step.actionType&&!['办理','审批','确认','归档'].includes(step.actionType)))issues.push('节点动作需属于受控办理、审批、确认或归档');
 if(form?.scopeMode==='global'){
  if(form.product!==''||form.region!=='全局默认')issues.push('全局默认必须明确选择全部产品和全局默认区域');
 }else if(form?.scopeMode==='product'){
  if(!WORKFLOW_PRODUCTS.includes(form.product)||form.region!=='全局默认')issues.push('产品默认须选择具体产品和全局默认区域');
 }else if(form?.scopeMode==='product-region'){
  if(!WORKFLOW_PRODUCTS.includes(form.product)||!WORKFLOW_REGIONS.includes(form.region))issues.push('区域覆盖须选择具体产品和具体区域');
 }else issues.push('请显式选择全局默认、产品默认或产品与区域覆盖，不能以缺失范围发布');
 if(form?.financeTemplate?.tailLimit&&toCents(form.financeTemplate.tailLimit)===null)issues.push('尾差候选阈值需非负、最多两位小数');
 return [...new Set([...issues,...validateAttachmentPolicies(form)])];
}
export function workflowHistorySnapshot(config){
 const {history,...snapshot}=JSON.parse(JSON.stringify(config));
 // Missing scope is unknown history, never implicit global applicability.
 if(!['global','product','product-region'].includes(snapshot.scopeMode))snapshot.scopeMode='unverified';
 if(!Object.hasOwn(snapshot,'product'))snapshot.product=null;
 if(!Object.hasOwn(snapshot,'region'))snapshot.region=null;
 return snapshot;
}

const optional=(key,label,type='text',value='')=>({...f(key,label,type,value),required:false});
const rows=(key,label,columns,value)=>({...f(key,label,'rows',value),columns});
const extraFields={
 M23:[rows('items','费用明细',[f('description','明细'),f('quantity','数量','number'),f('unitPrice','单价（元）','money')],[{description:'演示交通费',quantity:'1',unitPrice:'1000.00'}]),optional('correctionRef','原付款 / 更正依据')],
 M24:[f('platform','媒体平台','text','抖音'),f('sourceVersion','消耗来源版本','text','DEMO-COST-v1'),f('dataAsOf','数据截至','datetime-local','2026-09-21T09:00'),rows('allocations','充值来源分摊',[f('sourceId','充值来源编号'),f('capacity','可用容量','money'),f('allocated','本次分摊','money'),f('rebate','返点依据')],[{sourceId:'DEMO-CZ-001',capacity:'1000.00',allocated:'800.00',rebate:'演示返点版本1'}]),optional('accountIssue','未知账户 / 重算差额说明')],
 M25:[f('metricVersion','口径版本','text','DEMO-METRIC-v1'),f('dateFrom','统计开始','date','2026-09-01'),f('dateTo','统计结束','date','2026-09-30'),f('media','媒体维度','text','全部媒体'),f('businessSnapshot','商务归属快照','text','DEMO-商务归属-202609'),f('unit','金额单位','select','现金元',['现金元','广告币']),f('dataAsOf','数据截至','datetime-local','2026-09-21T09:00'),optional('gapReason','缺口 / 迟到数据说明'),optional('detailRef','明细来源编号')],
 M26:[f('employeeId','员工稳定 ID','text','DEMO-EMP-001'),f('appointmentRef','有效任职版本','text','DEMO-JOB-v1'),f('classification','输入分类','select','收入',['收入','成本','服务费','返点','续费']),f('formulaVersion','公式 / 阶梯版本','text','DEMO-FORMULA-v1'),optional('originalBatch','原版 / 已发批次'),optional('differenceReason','异议 / 差额依据'),optional('paymentRef','发放关联（不自动付款）')],
 M27:[f('customerId','客户稳定 ID','text','DEMO-CUSTOMER-001'),f('policyVersion','政策版本','text','DEMO-POLICY-v1'),f('metric','指标口径及单位','text','演示有效账户数 / 个'),f('dateFrom','适用开始','date','2026-09-01'),f('dateTo','适用结束','date','2026-09-30'),f('batchRef','计算批次','text','DEMO-CALC-001'),optional('differenceReason','异常 / 期间调整依据')],
 M28:[f('sourceId','素材来源 ID','text','DEMO-MATERIAL-001'),f('employeeId','责任人员 ID','text','DEMO-EMP-002'),f('businessType','业务类型','text','丽人（演示旧映射）'),f('sourceFormat','旧来源格式','select','素材明细格式',['素材明细格式','剪辑统计格式']),f('importBatch','导入批次','text','DEMO-MATERIAL-BATCH-001'),f('replaceScope','增量 / 替换明确范围','text','2026-09 / DEMO-EMP-002 / 丽人'),f('existingCount','范围内原记录数','number','100'),optional('consumption','消耗（可缺失）','money'),optional('incentive','激励（可缺失）','money'),f('unit','消耗单位','select','广告币',['广告币','现金元'])],
 M29:[f('appointmentRef','任职关系版本 ID','text','DEMO-JOB-v1'),f('externalId','企微 userid（演示映射）','text','DEMO-WX-001'),f('organizationSource','组织来源状态','select','本地演示未接入',['本地演示未接入','历史快照待核验']),f('employmentStatus','在职状态','select','在职',['在职','离职待交接','已离职']),optional('appointmentEnd','任职结束日期','date'),optional('confirmationRef','已批准转正事件'),optional('confirmationDate','转正生效日期','date'),optional('evidence','劳动合同 / 转正附件依据'),optional('handoverRef','离职交接任务')],
 M30:[f('employeeId','员工稳定 ID','text','DEMO-EMP-001'),f('period','考勤期间','month','2026-09'),f('sourceRef','打卡 / 异常来源','text','未接入：演示人工申请'),f('shiftRule','班次 / 假期规则版本','text','DEMO-SHIFT-v1'),optional('correctionRef','销假 / 更正原申请')],
 M31:[f('appointmentRef','有效任职版本','text','DEMO-JOB-v1'),f('salaryVersion','工资来源版本','text','DEMO-SALARY-v1'),optional('originalBatch','前版工资 / 补差批次'),optional('differenceReason','导入差异 / 补差说明')],
 M32:[f('employeeId','考核对象稳定 ID','text','DEMO-EMP-001'),f('appointmentRef','当期有效任职','text','DEMO-JOB-v1'),f('unit','指标单位','text','%'),f('responsibilitySnapshot','当期人员 / 部门责任','text','演示业务一部 / 2026-09'),optional('originalVersion','原目标版本'),optional('differenceReason','异议 / 变更说明')],
 M37:[f('sourceSystem','来源系统','text','旧 CRM（演示）'),f('productCode','产品原码','text','DEMO-LOCAL'),f('pathCode','路径原码','text','DEMO-PATH-01'),f('legacyCombination','历史产品路径组合','text','待按七组合逐项核验'),f('fundingStatus','期初 / 未结核对状态','select','未核对',['未核对','已核对演示数']),optional('openingAmount','演示期初（核对后填写）','money'),optional('unsettledAmount','演示未结债务（核对后填写）','money'),f('originalRequest','在途原请求','text','DEMO-REQ-001'),f('requestState','原请求状态','select','待核实',['待核实','未执行','已成功','明确失败']),f('owner','差异处置负责人','text','演示迁移复核员'),f('cutoverBatch','切换批次','text','DEMO-CUTOVER-001'),f('watermark','切换数据水位','datetime-local','2026-09-21T09:00'),optional('legacyLookup','旧单只读查询引用')],
 M38:[f('ownerId','跟进责任人 ID','text','DEMO-EMP-001'),f('followupAt','记录时间','datetime-local','2026-09-21T09:00'),f('source','线索来源','text','演示人工记录'),optional('importBatch','导入批次')],
 M40:[f('contractVersion','能力契约版本','text','DEMO-CONTRACT-v1'),optional('credentialRef','受控凭据引用（禁止填写密钥）'),f('schedule','计划执行说明','text','手工演示，无后台调度'),f('scheduler','唯一执行者','select','本地演示执行者',['本地演示执行者','旧调度仍在运行','未核定']),f('dataAsOf','数据截至','datetime-local','2026-09-21T09:00'),optional('failedItems','失败项及补拉范围'),optional('lastSuccess','最近已核实成功时间','datetime-local')]
};
for(const [id,fields] of Object.entries(extraFields))operationSpecs[id].fields.push(...fields);
operationSpecs.M23.actions.审批中[0].approval=true;
operationSpecs.M28.actions.差异预览[0].reason=true;
operationSpecs.M29.actions.试用任职[0].confirmation=true;
operationSpecs.M29.actions.正式任职[0].departure=true;
operationSpecs.M31.actions.已发布[0].payment=true;
operationSpecs.M31.states.push('部分发放');
operationSpecs.M31.actions.部分发放=[a('登记剩余实际发放','已发',finance,{salaryPay:true,payment:true})];
for(const id of ['M24','M25','M28'])for(const actions of Object.values(operationSpecs[id].actions))for(const action of actions)if(!action.roles.includes('*'))action.roles=[...new Set([...action.roles,'运营',...(id==='M28'?['剪辑']:[])])];

export function expenseTotal(items=[]){return items.reduce((sum,item)=>sum+Math.round((toCents(item.unitPrice)||0)*Number(item.quantity||0)),0);}
export function validateOperationDetails(id,v){
 const e={};
 if(id==='M23'&&expenseTotal(v.items)!==toCents(v.amount))e.items='明细数量 × 单价合计必须等于申请金额';
 if(id==='M24'){
  const items=v.allocations||[];
  if(new Set(items.map(x=>x.sourceId)).size!==items.length)e.allocations='同一充值来源只能出现一次';
  else if(items.some(x=>toCents(x.allocated)>toCents(x.capacity)))e.allocations='来源分摊不能超过各自可用容量';
  else if(items.reduce((sum,x)=>sum+(toCents(x.allocated)||0),0)!==toCents(v.amount))e.allocations='各来源分摊合计必须等于消耗量';
 }
 if(v.dateFrom&&v.dateTo&&v.dateFrom>v.dateTo)e.dateTo='结束日期不得早于开始日期';
 if(id==='M25'&&v.coverage==='存在缺口'&&!v.gapReason?.trim())e.gapReason='请说明缺口，缺失不能视为零';
 if(id==='M28')for(const key of ['total','valid','existingCount'])if(!Number.isInteger(Number(v[key])))e[key]='数量必须为非负整数';
 if(id==='M29'&&v.appointmentEnd&&v.appointmentEnd<v.effective)e.appointmentEnd='任职结束不得早于生效';
 if(id==='M37'&&v.fundingStatus==='已核对演示数'&&(toCents(v.openingAmount)===null||toCents(v.unsettledAmount)===null))e.fundingStatus='核对完成须填写期初和未结；未知金额请保持未核对';
 return e;
}
