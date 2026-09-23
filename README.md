# 薪火 CRM 设计资料

GitHub 仓库：**[xinhuo-crm-d-design](https://github.com/jeep91106-cpu/xinhuo-crm-d-design)**（私有）
显示名：设计资料  
本地绝对路径：`D:\CodexWorkspace\xinhuo-crm-d-design`

其他 Agent 拉取：

```bash
git clone https://github.com/jeep91106-cpu/xinhuo-crm-d-design.git
```

读取和写入均沿用现有 GitHub 私有仓库权限。不要把生产 dump、`.env`、客户明细拷进本仓库。

## 这条分支

`cursor/原型图文档` 从 `main` 拉出，专门给 Cursor 继续改原型和文档。`main` 上 9 月 16 日的需求一页纸、短 PRD 和 `02-原型` 都还在，没有被覆盖。

Codex 已验收的 V1.5 原型和完整 PRD 在 [06-Codex交付-20260922](06-Codex交付-20260922/README.md)。Cursor 当前工作副本路径是 `D:\PROJECT\CRM-需求阶段`。

## 先读什么

| 顺序 | 文件 | 用途 |
|---|---|---|
| 1 | [00-需求一页纸/需求一页纸.md](00-需求一页纸/需求一页纸.md) | **已确认需求的唯一入口** |
| 2 | [01-PRD/薪火CRM-重构PRD.md](01-PRD/薪火CRM-重构PRD.md) | 完整产品说明；Word 同目录 `薪火CRM-重构PRD.docx` |
| 3 | [02-原型/index.html](02-原型/index.html) | 可交互、可自由编辑的角色工作台与开户流原型；本机 Docker 常驻地址 `http://127.0.0.1:8766` |
| 4 | `03-调研资料/` | 现网反推：主线、角色、字段、合并分析、样例（已脱敏） |
| 5 | `04-数据与脚本/` | 本地副本上的聚合 SQL 与脱敏 TSV |
| 6 | `05-代码摘录/` | 反编译关键规则摘录（完整源码不入库） |

## 仓库边界

- **在本库**：需求、PRD、原型、脱敏调研文档、聚合脚本、代码摘录。  
- **不在本库**（仍在本机 `D:\CodexWorkspace\xinhuo-crm` 与 `D:\CodexWorkspace\data`）：生产 dump、Docker MySQL、全站快照、完整反编译。  
- 调研原文 vault：`D:\Vibi Coding\项目\薪火CRM`（Obsidian）。本库是给其他 Agent 的可克隆副本。

## 安全

禁止提交：客户真名明细、电话、密码、Cookie、`sys_config` 明文、代理商密钥。样例客户一律用代号。

仓库仅保存脱敏后的产品需求、角色/组织结构、字段使用率与业务聚合，不包含生产数据库、真实客户/员工明细或认证材料。
