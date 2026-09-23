# 原型实现契约

选择客户后，空搜索立即完整展示本客户已关联主体，不截断10条；可按名称/信用代码筛选。当前客户无匹配时显示明确空态，全局已有未关联主体另列，只有用户选择才关联复用；空搜索也可进入新增，保存前查重未命中才新建。选主体后唯一店铺自动展示复用，无店同页新增，历史多店保留待核对且不自动选第一店。更换客户清空主体/店铺及派生资料、更换主体重新加载下游，同时解除本申请旧附件关联并提示，已提交历史快照保留。

本地前端评审原型，不连接生产写接口；真实历史样本与本地演示状态分开。协调/整合：Codex 主助手。根目录是新建独立原型仓库，不修改其他助手已有原型。

## 当前关系与申请契约（V1.2，2026-09-22）

客户1:N主体，保留主体`customerIds`公共复用结构，不反推主体只能关联一客户。主体当前1:1店铺和直客，店铺通过`subjectId`关联，不新增`subject.shopId`。主体名称等于营业执照公司名，直客名称从`subject.name`派生；`directId/directEvidence`属于主体。同主体多账户共享该直客，不做按账户一户一占用。店铺`laikeName`同步`name`，不双填；`laikeId`可空。

商务原前三步合并一页，客户搜索查重选择/新增、主体店铺原地维护与资质上传同页完成，仅用数量加减申请账户。媒介查看申请数量和逐行账户名称、供应商、账户ID、纵横。账户名称可空，账户ID完成必填防重；纵横可后补且非空一对一。数量变更不得删除已受理/未知/成功/待同步的行。历史主体多店等保留原值和记录，标历史关系待核对，不自动合并迁移。

当前资料、申请资料快照与执行快照分开；身份更正留痕且不改变账户商务归属。未知/外部成功待同步仅处理原请求，不能因新材料门槛重新执行。

## 模块组件

`FinanceModule` default export from `src/FinanceModule.jsx`，负责 M09–M22。
`OperationsModule` default export from `src/OperationsModule.jsx`，负责 M23–M40（M33/M34/M35亦在内）。

Props 统一：`{ moduleId, db, session, update, go, toast, openAccount }`。

- db 是共享只读当前状态；`update(draft => { ... }, '操作摘要')` 在根组件复制 draft 后持久化并记录操作。不要直接改 db。
- `go(moduleId, {customerId?, accountId?, tab?}?)` 导航。`openAccount(accountId)` 打开根账户详情。
- `toast(message, tone='success')` 显示通知。
- session `{role, name, businessId}`。role 为：商务、渠道商务、商务主管、媒介主管、开户媒介、充值媒介、财务、Boss、人事、系统管理员。默认商务主管。不能通过角色名自动虚构真实来源的商务身份；businessId 是当前演示对应的商务 ID。
- 角色仅是评审演示。真实银行/企微/媒体 API 均未接入，所有成功按钮都明确显示“演示”。

## 共享状态

`db.customers`: `{id,name,kind:null|'普通客户'|'渠道',kindVerified?,source,demo?}`
`db.subjects`: `{id,name,customerIds:[],directId?:null|string,directEvidence?:string,source,demo?}`；直客名称由name派生，主体客户共享引用保留。
`db.shops`: `{id,subjectId,name,laikeName?,legacyNo,laikeId:null|string,laikeVerified,source,demo?}`；laikeName与name一致，当前每主体唯一店铺，历史冲突单列待核对。
`db.accounts`: `{id,externalId,name?,customerId,subjectId,shopId,product,productCode,supplierId,businessOwnerId:null|string,businessOwnerName:null|string,zonghengId:null|string,status,source,demo?}`；旧账户directId如保留，仅作历史来源/快照，当前直客通过主体派生，不作独立编辑或排他绑定。
`db.suppliers`: `{id,name,products:[],active?:boolean}`
`db.applications`: 继续保存稳定id、客户/主体/店铺、产品、商务、区域、指派、workflowVersion、createdAt和events；商务侧只采集正整数开户数量，内部rows用于媒介逐行保存`{id,name?,supplierId,status,externalId?,zonghengId?}`。每行直客当前值由主体引用，旧行级值只保留历史快照。申请保存资料及附件版本。
`db.finance`: 初始对象为 `{wallets:[],receipts:[],orders:[],events:[],credits:[],records:{}}`。Finance 模块使用这些数组，初始无演示状态时可通过明显的“载入资金演示场景”按钮生成，或者组件初始化一次；wallets 推荐 `{id,customerId,name,cash, frozen,creditLimit,debt}` 金额单位为分。普通客户与渠道出资可在演示样本中明示，不篡改真实客户类型。
`db.operations`: 按模块ID存数组，初始化为空。Operations 可以保存本模块演示记录。
`db.config`: `{version:1,draftVersion:2,fields:[{id,label,required}],steps:[{id,name,role}],publishedAt, ...}`。初始 steps 商务申请→媒介主管派单→开户媒介办理→完成。编辑发布版本供新申请使用；既有application.workflowVersion不改。

流程版本`workflow.attachmentPolicies`：`[{id,label,product:'全部产品'|具体产品,visible,required,requiredAt:'submit'|'execution',accept:['pdf','png','jpg','jpeg','webp'],maxSizeMB:10}]`。默认license营业执照与qualification其他资质均可选；可配置按申请时必需或执行前补齐，模板已有产品/区域范围和版本仍独立保留。

`form/app.attachments`：`[{id,name,type,size,policyId,subjectId,storageKey,storedLocally:true,uploadedAt}]`。真实文件在本地IndexedDB，元数据随单据快照；预览/下载必须读取实际内容，不只存文件名。媒介可在原单补上传，不冒充远端生产存储。

附件归属保护：上传前先选择主体；切换主体解除本申请原附件关联并提示。提交和新的外部执行检查附件subjectId与本单主体一致，跨主体拒绝；已提交历史快照不覆盖，未知/成功待同步不因新门槛重新执行。
`db.notifications`: `{id,title,moduleId,read,at}`，由核心或模块操作追加，已读不代表业务已办。
`db.audit`: `{id,at,actor,action}`，由root.update统一追加，不覆写。
`db.meta`: 样本来源说明。

## 可复用UI

`src/ui.jsx` exports `Badge({children,tone})`, `Field({label,required,hint,error,children})`, `Modal({title,onClose,children,footer,wide})`, `Empty({title,detail,action})`, `DataTable({columns,rows,rowKey='id',onRow,pageSize=10,selected,onSelect})`, `PageHeader({eyebrow,title,description,actions})`, `Money({value})`（分→元）, `Notice({children,tone})`, `Section({title,actions,children})`。
columns 是 `{key,label,render?}`，render(row) 返回React节点。使用全局 CSS `.btn`, `.primary`, `.danger`, `.quiet`, `.toolbar`, `.tabs`, `.active`, `.grid2`, `.grid3`, `.metric`, `.muted`, `.mono`, `.stack`, `.kv`, `.form-grid`, `.flow`, `.step`, `.timeline`, `.tag`, `.page`, `.section`。代理不要修改共享 ui/CSS/App，样式需要额外类时交接给根。

## 必须闭环

资金初始余额都标“演示资金”，不把历史生产余额搬来模拟扣款；所有金额精确到分。
平台转户两端同结算范围且同商务；渠道 CRM 转账不能绕过。
有资金冻结、成功扣一次、未知不重试、外部成功只补同步；不新增商务个人额度。
非核心模块也要列表→表单→详情→有效状态变化，字段和状态对应真实模块语义。无来源人事/薪资用明确演示人员，不套真实员工工资。
