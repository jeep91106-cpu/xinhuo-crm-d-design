# Prototype Instructions

选择客户后，空搜索立即完整展示本客户已关联主体，不截断10条；可按名称/信用代码筛选。当前客户无匹配时显示明确空态，全局已有未关联主体另列，只有用户选择才关联复用；空搜索也可进入新增，保存前查重未命中才新建。选主体后唯一店铺自动展示复用，无店同页新增，历史多店保留待核对且不自动选第一店。更换客户清空主体/店铺及派生资料、更换主体重新加载下游，同时解除本申请旧附件关联并提示，已提交历史快照保留。

## 用户确认的原型约定（2026-09-22）

- 导航栏目标题与可点击功能页必须明显区分；提交、补资料不能引起栏目自动折叠或当前菜单跳动。事务应留在同一业务模块，能返回来源和原筛选。
- 当前V1.2规则：客户1:N主体，保留customerIds共享引用，不推定主体只能属于一客户；主体当前1:1店铺、1:1直客，同主体多个账户共享直客。主体名与营业执照一致且就是直客名；店铺自定义真实店名且就是来客名，不双填。直客ID、来客ID均可空。
- 商务开户原前三步合并同页：搜索查重客户选择/新增、主体店铺原地维护、上传资质，只用“− 数字 +”选择数量，不逐行填账户或直客。媒介按数量逐行填写可选账户名、供应商、必填防重的账户ID及可后补且非空一对一的纵横。
- 媒介可在原申请新增、补全、更正主体店铺及ID；直客ID随主体维护，废止直客与账户1:1和行级占用。当前资料、申请和执行快照分开；历史同主体多店保留原记录并标待核对，不自动合并。
- 按产品和材料类型配置显示、可选/申请必需/执行前补齐，默认营业执照及其他资质可选。真实选中文件保存在本地IndexedDB，可预览下载；不把文件名当上传，不宣称生产存储。未知/成功待同步继续核实原请求，不被新材料门槛迫使重开。
- 上传前先选主体，换主体解除本申请旧附件关联并提示；提交和新执行拦跨主体附件，历史文件快照保留。
- 本轮直接修改原PRD和原原型；原PRD文件名继续使用“薪火CRM-完整PRD-V1.0”，正文标2026-09-22当前修订V1.2。工作树产物用于合入和覆盖原入口，回退备份不作为新的当前入口。
- PRD字段不能只展示名称；可录入、校验、保存、回显和对应权限都须核验。未知历史值不得补成虚构真实数据。

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## 2026-09-22 V1.3 本轮追加约定

本轮V1.3：新申请逐行保存结果后仍须被指派媒介显式点击“完成本次开户”；历史已完成保留。开户待办按一申请汇总并区分成功/待办理/异常/纵横待补，退出可回原单继续；已办和资料待补保留原单入口。只有主管派单，普通媒介仅办理本人当前任务。后台行业字典可搜选和增改启停。主体/店铺/直客普通维护的流转备注选填，不以licenseEvidence或备注拦身份字段；系统审计保留。开户只选择供应商并只读引用，不填供应商银行；独立供应商主档保留旧多收款账户关系，地址未核实为旧独立字段。用户页使用明确业务标签并清理开发评审话术。

以上为当前增量确认，替代与之冲突的旧交互要求；财务计算、身份防重、原申请与执行快照、未知不重试保持。原PRD继续使用V1.0文件名，当前正文内部版本V1.3。

- 本轮收尾补充：全部行成功/已取消才能显式完成，全取消显示已取消；未知/待同步不能取消结束。配置的后置复核只在完成按钮后进入。办理明细置顶，材料/历史折叠，保存办理进度持久保留pendingValues；草稿与成功结果分开。

## 2026-09-22 批量开户交互确认

媒介原申请以可编辑表格连续录入，不逐户弹窗。只允许待办理/明确失败行批改；成功、未知、待同步、取消行锁定并保留单行核实入口。供应商可搜索，批量应用默认只填空值，替换须显式选择。整表草稿允许ID空，批量成功登记必须选中行全部校验通过后一次写入，同批重复双方提示到字段且失败零业务写入。仍由本人媒介单独完成整单，不改变数量、行ID、客户主体店铺商务关系和历史快照。本轮不做Excel整表导入。原PRD原文件名不变，正文修订V1.4。

## 2026-09-22 V1.5 效率改进确认

本轮已授权在原型与原PRD中执行个人多草稿、申请聚合通知、Excel多行粘贴预览。以下替代上一轮不做Excel粘贴的范围限制，原文件名不变，正文内部版本V1.5。

- 未提交开户草稿按稳定创建人身份隔离，一人可多份；负责商务与创建人分开。继续、保存本份、另存新份、软删除及恢复不得影响其他草稿或他人草稿。URL指定草稿也校验创建人。旧全局草稿仅在可靠归属匹配时迁移，未知归属保留；提交仅消费指定草稿，不能复活历史草稿。
- 开户通知按同一申请一条汇总，显示客户、店铺、数量、成功、待办、纵横待补与当前状态，打开原M06。个人已读按身份与业务版本记录；顶部计数和消息中心同源。状态、数量或转派变化可重新未读，普通备注、草稿保存及重复渲染不提醒；不对外发送。
- Excel复制的TSV支持表头部分列与任意顺序（需账户ID），无表头固定前1–4列。按用户选中原申请行顺序预览前N行；超量拒绝，中间空行不压缩。默认只填空，显式替换也不以空白清除旧值；长ID保留文本，科学计数/公式、重复与供应商匹配错误拒绝整次填入。预览后目标或内容变化必须重新预览，不自动转填后续行。
- 确认粘贴只填当前未保存表格；保存草稿、登记成功、完成整单是独立动作。持久化失败必须保留输入并阻止保存后离开，不得提示成功。
