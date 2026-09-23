# Codex 交付 · 2026-09-22

这是 Codex 在本机原型仓库里已经验收、可以对照阅读的一版。来源提交是 `c64d5e24731c1947a49002919d546b7d2c27da80`，说明为 “chore: deliver PRD v1.5 and verified opening efficiency prototype”。

`main` 里的 `01-PRD` 和 `02-原型` 是 9 月 16 日的短稿和静态原型，这一份没有替换它们。

## 目录

| 目录 | 内容 |
|---|---|
| `交互原型/` | 可运行的 React 原型源码，169 个已跟踪文件。不含 `node_modules`。 |
| `PRD评审稿/` | 同一轮交给评审的 PRD：Markdown、HTML、Word、PDF 和交付包。文件名仍是 `薪火CRM-完整PRD-V1.0.*`，正文版本是 V1.5。 |

## 本机怎么看原型

依赖装在原来的原型目录里，预览已经开着：

[http://127.0.0.1:4317/#M06](http://127.0.0.1:4317/#M06)

这个文件夹里的副本要单独安装后再开，避免和 4317 抢端口：

```powershell
cd 交互原型
npm install
npm run dev -- --host 127.0.0.1 --port 4319 --strictPort
```

## 没有放进来的内容

- 未完成的 V1.6：主管直接办理、简化开户表、充值指定到人。这些还在 Codex 的本地工作树里，测试没有全部通过，所以没有当作这一版交付。
- `node_modules`、本地日志、截图取证和生产数据。
