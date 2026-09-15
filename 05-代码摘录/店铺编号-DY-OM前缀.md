# 批量建账户时的店铺前缀

来源：`DigDouyinAccountConsumeServiceImpl.batchcreateAdverAccount` 约 725–741 行。

```java
if (customerType.equals(CustomerType.DOUYIN.getValue())) {
    shopprev = "DY";
} else if (customerType.equals(CustomerType.EXTERNAL_TRANSFER.getValue())) {
    shopprev = "OM";
}
```

自有端口内部编号 `DY+日期+序号`，外转 `OM…`。与巨量 19 位来客 ID 无关。
