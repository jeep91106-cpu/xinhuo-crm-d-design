# 「抖音事业部」与「其他媒体」能否合并 — 代码与数据实证

结论先行：**可以合并，而且应当合并。** 两个模块管理的是**同一种媒体产品（巨量本地推 / 巨量AD）**，差别只在**账户从哪条供货渠道开出来**：

- 抖音事业部 = 公司**自有巨量代理端口**开的账户（有 API，能自动拉消耗、API 划款）
- 其他媒体 = 通过**外部代理商/供应商**开的账户（无 API，消耗靠导入，代码里叫 `externalTransfer` = 「外转」）

「其他媒体」这个名字是误导：它 8963 个账户里 8557 个（95%）是巨量本地推/巨量AD，真正的其他媒体（腾讯K4 390 个、快手 10 个）不到 5%。

分析对象：生产库快照 `crm_xinhuo`（2026-09-14）+ 后端 jar 反编译源码。所有数字均为实测，来源见 [[本地分析环境与产物]]。

---

## 1. 逐层对照

| 层 | 抖音事业部 | 其他媒体 | 判定 |
|---|---|---|---|
| **菜单树** `sys_menu` | 82 项 | 81 项 | 子菜单、按钮、权限串**逐项相同**（`digital:customer:*`、`digital:advertisingAccount:*`、`digital:adveraccountRecharge:*` …），只有 Vue 组件路径不同（`douyin/…` vs `otherMedia/…`）。唯一差异：消耗菜单权限 `digital:douyinaccountconsume:*` vs `externalTransfer:consume:*` |
| **Controller** | `DouyinDigCustomerController`、`DouyinDigAdvertisingAccountController` … | `ExternalTransferDigCustomerController` … | 逐文件 diff：外转版 = 抖音版复制后把 `setTypes("1")` 改成 `setTypes(CustomerType.EXTERNAL_TRANSFER)`（="10"），无其他业务差异 |
| **Service / Mapper** | `DigCustomerServiceImpl`、`DigAdvertisingAccountServiceImpl`、`DigAdveracoountRechargeServiceImpl` … | **同一份** | 已经是统一实现。全部 Service 里按客户类型分叉的代码只有 5 处（见 §3） |
| **主数据表** | `dig_customer`（`types`=1）、`dig_customer_subject`、`dig_shop`、`dig_advertising_account`（`customer_type`=1） | 同表，`types`/`customer_type`=10 | **单表共用**，靠一个类型字段隔离 |
| **交易表** | `dig_adveracoount_recharge`、`dig_transfer_account`、`dig_return_coin`、`dig_cashrecharge`、`dig_customer_bill` | 同表 | 单表共用 |
| **消耗表** | `dig_douyin_account_consume`（19,930 行，巨量 API 拉取） | `dig_other_account_consume`（43,613 行，Excel/RPA 导入） | **唯一真正分开的表**；两表 50 列里 46 列同名同义 |
| **字典** | `account_dy_tags`：已转户/已注销 | `account_om_tags`：已转户/已注销 | 值完全相同的重复字典 |
| **报表** | — | — | 「全媒体消耗明细/环比」（`FullPlatformConsumeDetails`）已经把两张消耗表 UNION 后统一出报表，证明合并口径早已存在 |

## 2. 账户类型：两边装的是同一种东西

`dig_advertising_account.type` 实测分布（未删除）：

| type | 字典名 | 所属模块 | 账户数 | 供应商 | 供应商类型 |
|---|---|---|---|---|---|
| 102 | 巨量本地 | 抖音事业部 | 3,641 | 本地推供应商（自有端口 `dy_agentId`=3，LOCAL） | AGENT（有 API） |
| 100 | 巨量AD | 抖音事业部 | 13 | 薪火相承-综合（自有端口 `dy_agentId`=4，AD） | AGENT |
| **1001** | **本地推** | 其他媒体 | **6,935** | 本地推-迪雾 4,970 / 央广 1,578 / 意克 186 / 国鑫众盟 169 / … | NOAGENT（无 API） |
| **1004** | **巨量AD** | 其他媒体 | **1,622** | 巨量AD-央广 901 / 珠海今日 361 / 亿点 360 | NOAGENT |
| 1002 | 腾讯K4 | 其他媒体 | 390 | 腾讯K4-山东易搜 384 | NOAGENT |
| 1003 | 快手 | 其他媒体 | 10 | 快手-铁磁 | NOAGENT |

字典 `ks_account_type` 里「巨量AD」同时是 100 和 1004、「本地推」同时是 102（巨量本地）和 1001 —— 同一媒体产品被编成两套码，只为了落在两棵菜单树下。

配置 `sys_config.rebateLimit` 也印证：`t102:4`、`t1001:4`、`t1002:4`、`t1003:4` —— 本地推无论哪条渠道，返点上限同为 4。

## 3. 代码里真正按「平台」分叉的 5 处

反编译 `ruoyi-digital` 全部 Service，`CustomerType.EXTERNAL_TRANSFER` / `getTypes().equals(...)` 分叉只出现在：

| 位置 | 作用 | 合并后如何处理 |
|---|---|---|
| `DigCustomerStatementServiceImpl` 511/551 | 生成对账单时按客户类型选消耗表（5 路三元表达式） | 消耗表合并或建视图后消失 |
| `ExternalApiServiceImpl` 703–1011 | 微信机器人/外部 API 按账户类型决定走巨量 API、快手 API、腾讯 API 还是纯记账 | 改为按 `supplier.suppliertype`（AGENT/NOAGENT）+ `dy_agentId` 判断，语义更准 |
| `DigTransferAccountServiceImpl` 791 | 转户同步媒体时判 `types=="1"` | 同上 |
| `DigOtherAccountConsumeServiceImpl` 441 | 导入外转消耗时自动补建账户，硬编码 `customerType="10"` | 改为按供应商归属 |
| `DigAccountopenApplyServiceImpl` 86/130 | 开户申请校验「申请类型必须等于客户类型」；媒介回复只有 `dataType=10` 才自动建账户 | 校验删除；建账户逻辑对两条渠道统一 |

而**充值确认**（`douyinConfirmAccountRecharge` 872 行起）已经是按供应商而非模块分叉：`suppliertype=AGENT` → 调巨量 API `sendWalletRecharge` 从代理大钱包划款；`NOAGENT` → 只记账。这就是合并后应保留的唯一分叉轴：**账户挂的供应商有没有 API**。

## 4. 拆分已经造成的真实代价（数据实测）

| 现象 | 数字 | 说明 |
|---|---|---|
| 同一客户名在两个模块各建一份 | **54 个客户名，108 条记录** | `DigCustomerServiceImpl` 1316 行：名称唯一性只在同 `types` 内校验，等于**设计上允许**同一公司建两遍 |
| 同一主体名挂在不同类型客户下 | **65 个** | 同一家广告主的营业执照主体在两边各录一次 |
| 「申请的客户类型和选择的客户的类型不一致！」 | 操作日志报错 **12 次** | 商务在抖音树下选了外转客户（或反之）直接被拒 |
| 「迁移主体(跨媒体)」功能 `dig_transfer_subjectapply` | **33 次申请** | 专门为把主体从一个类型搬到另一个类型而造的补丁功能 |
| 两棵一模一样的菜单树 | 82 + 81 = 163 个菜单项 | 商务 111 个菜单里 82 个属于这两棵树；每次找功能先猜「在哪棵树下」 |
| 主体同时在两条渠道都有账户 | 仅 1 个 | 说明两边**几乎没有天然交集**，合并时冲突少 |

## 5. 业务趋势：自有端口在涨，外转在退

按月消耗（元）：

| 月 | 抖音（自有端口 API） | 外转（导入） |
|---|---|---|
| 2026-05 | — | 7,328,565 |
| 2026-06 | — | 29,852,354 |
| 2026-07 | 4,027,262 | 22,801,487 |
| 2026-08 | 7,562,846 | 11,027,331 |
| 2026-09（至 13 日） | 4,903,005 | 1,168,174 |

新开账户：7 月外转 5,882 个 vs 自有 2,451；9 月外转 27 个 vs 自有 431。业务重心已经从外部代理商转向自有端口，**继续维护两套并行界面的收益在缩小**。

> [!hypothesis] 推断
> 外转 9 月消耗骤降也可能是导入滞后（外转消耗靠人工/RPA 导入，最后一条 2026-09-13），需向用户核实。

## 6. 合并方案要点（供重构决策）

1. **一棵树**：客户 → 主体 → 店铺（可选）→ 广告账户，不再按模块分树。
2. **账户两个维度取代「模块」**：
   - `媒体产品`：巨量本地推 / 巨量AD / 腾讯 / 快手 …（现 `type` 去重后的字典）
   - `渠道/供应商`：自有端口（AGENT，有 API）/ 外部代理商 XX（NOAGENT）
3. **消耗**：一张表 + `来源` 列（API / 导入），或保留两表加统一视图；报表层已经这么做了。
4. **权限不用动**：两棵树的按钮权限串本来就相同。
5. **数据迁移**：54 个重名客户、65 个重名主体需人工确认后合并，账户 `customer_id/subject_id` 重指；`types`/`customer_type` 字段降级为「历史来源」。
6. **保留**：`suppliertype`+`dy_agentId` 决定充值/转户/退币走 API 还是记账；外转消耗导入模板。
7. **删除**：`dig_transfer_subjectapply`（迁移主体）、开户申请的类型一致性校验、重复字典 `account_om_tags`。

## 7. 用户已确认（2026-09-14）

1. 腾讯K4（390 户）、快手（10 户）及三棵停用事业部树：**先不删除**。→ 合并后保留「媒体产品」维度，停用树只隐藏。
2. 外转渠道：**收缩了也不停止**。→ 「导入消耗」入口与 NOAGENT 记账路径为必备能力，不是过渡方案。
3. 现有角色/权限不作为基线，重构时随数据迁移一起重做（见 [[首页]] 决策表）。

相关：[[系统主线业务图]] · [[角色×字段×阶段-流程图]] · [[核心表与字段真实使用率]] · [[系统使用现状-证据链]]
