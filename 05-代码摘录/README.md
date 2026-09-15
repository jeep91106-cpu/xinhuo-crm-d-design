# 代码摘录说明

完整反编译在本机 `D:\CodexWorkspace\xinhuo-crm\decompile\src-utf8`，**不入库**。这里只留与重构决策直接相关的规则原文位置。

| 文件 | 规则 |
|---|---|
| `开户申请-外转才建账户.md` | `replayAccountOpenApply`：仅 `data_type=10` 建账户 |
| `店铺编号-WZ自动串.md` | 导入时空 `shop_no` 生成 `WZ-{userId}-{flag}{rand}{ts}` |
| `店铺编号-DY-OM前缀.md` | 批量建账户时自有 `DY`、外转 `OM` |
| `客户同名校验按types.md` | 客户名唯一性只在同一 `types` 内 |

行号相对反编译 UTF-8 源，不是原厂 Git。
