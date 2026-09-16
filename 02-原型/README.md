# 业务共创交互原型 v0.3

用浏览器直接打开 `index.html`（无需构建），或启动任意本地静态服务器。原型只使用脱敏聚合事实与示例数据，不连接、更不写入生产数据库。

## 页面

| 导航 | 对应 PRD | 可做什么 |
|---|---|---|
| 角色工作台 | §6 | 按生产真实角色、组织和数据范围模拟最小权限导航；生产聚合与演示待办分标 |
| 开户申请 | §7.2 §8 | 媒体产品 × 供货渠道分轴；主数据按 ID 选择；多账户需求；条件资质；路由预览 |
| 处理开户 | §7.3 | 批量粘贴、逐账户校验、部分成功、来客纠错留痕 |
| 客户档案 | §4 | 客户→主体→店铺→广告账户；内部 `shop_no` 与独立 `laike_id` 分开 |
| 字段与表单规则 | §8.4 | 对象、阶段、产品、渠道、角色、来源、校验、纠错、版本和发布前冲突检查 |
| 工作流与组织 | §9 | 条件节点、城市组织、多层部门、SLA、退回与无人处理兜底 |
| 角色与数据范围 | §5 | 15 个启用角色、零用户角色、多角色组合以及功能/组织/协作三层权限 |
| 字段调整清单 | 新增 | 点击页面内或全局 `＋`，直接在清单页展开填写；保存后立即展示并支持导出 JSON |

## 全局自由编辑

每个页面右上角都有“编辑页面”：

- 点虚线框文字即可直接修改；输入框与示例值也可以改。
- 每个字段、表格行、卡片、任务和规则旁都有 `－ 移除`。
- 表单、表格、列表、网格及页面底部都有对应的 `＋`。
- “保存本页”后刷新仍保留；“取消”撤销本轮操作；“恢复本页默认”只清除当前页面/当前产品视图的自由编辑内容。
- 自由编辑使用独立的 `xinhuo.pageEdits.v1` 本地存储，不覆盖字段模板、工作流或字段建议。

右上角角色切换器仅用于设计模拟，不代表线上登录。RPA 是服务身份，不放进人工角色切换器。

字段建议与字段/流程草稿写入当前浏览器 `localStorage`；它们不会修改生产字段。字段建议不使用弹窗，提交后表单收起，新卡片继续显示在当前清单下方。演示聚合基线见 `js/app.js` 的 `SNAPSHOT`，详细设计依据见 `设计决策-v0.2.md`。

## Docker 常驻部署

本机正式预览使用 `compose.yaml`，只监听 `127.0.0.1:8766`。静态文件构建进 Nginx 镜像，不挂载数据库、凭据或生产目录。

```powershell
& 'D:\Dependencies\Docker\scripts\Start-DockerDesktop.ps1'
docker --context desktop-linux compose -p xinhuo-crm-prototype -f 'D:\CodexWorkspace\xinhuo-crm-d-design\02-原型\compose.yaml' up -d --build --wait
```

查看状态：

```powershell
docker --context desktop-linux compose -p xinhuo-crm-prototype -f 'D:\CodexWorkspace\xinhuo-crm-d-design\02-原型\compose.yaml' ps
```

常规停止（不删除镜像或其他项目资源）：

```powershell
docker --context desktop-linux compose -p xinhuo-crm-prototype -f 'D:\CodexWorkspace\xinhuo-crm-d-design\02-原型\compose.yaml' stop
```

容器使用 `restart: unless-stopped`。Windows 登录时现有 HKCU 启动项会调用 D 盘 `Start-DockerDesktop.ps1`；Docker 引擎就绪后，该容器自动恢复。若手工执行过 `stop`，需再次运行 `up -d` 才会恢复自动启动状态。
