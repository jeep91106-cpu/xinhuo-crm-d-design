# 数据与脚本

仅含**聚合** SQL 与脱敏 TSV（表行数、列结构、填充率、状态分布）。不含客户明细。

复现需本机 Docker MySQL 副本（`D:\CodexWorkspace\xinhuo-crm\local-mysql`，不入库）：

```powershell
docker cp .\sql\01-tables.sql xinhuo-crm-mysql:/tmp/sql/
docker exec xinhuo-crm-mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 -B crm_xinhuo < /tmp/sql/01-tables.sql'
```

`10-samples` / `11-samples-fix` / `13-s4-provenance` 的**输出**含真实客户名，只保留 SQL 备查，不提交 TSV。
