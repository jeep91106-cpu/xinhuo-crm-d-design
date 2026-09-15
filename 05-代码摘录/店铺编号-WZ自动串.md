# 导入时空店铺编号生成 WZ- 自动串

来源：`DigCustomerServiceImpl` 约 732–735 行。

```java
if (entity.getShopNo() == null || entity.getShopNo().isEmpty()) {
    int rand = random.nextInt(900) + 100;
    entity.setShopNo("WZ-" + userId + "-" + flag + rand + System.currentTimeMillis());
}
```

这不是来客 ID。全库大部分 `shop_no` 是这类占位或 `DY`/`OM` 内部流水。19 位纯数字才是商务在开户申请里手填的来客 ID。
