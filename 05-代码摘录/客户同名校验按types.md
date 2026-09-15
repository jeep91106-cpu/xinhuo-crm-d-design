# 客户名称唯一性只在同一 types 内

来源：`DigCustomerServiceImpl.checkName` 约 1313–1318 行。

```java
DigCustomer namecustomer = this.digCustomerMapper.selectDigCustomerByName(
    digCustomer.getCustomerName(), digCustomer.getTypes());
if (namecustomer != null && /* 非自身 */) {
    throw new ServiceException("客户名称已存在");
}
```

`types` 由「抖音事业部 / 其他媒体」入口写入，所以同一公司可以各建一份（实测 54 例）。合并双树后这条校验必须改成**全库客户名唯一**（或按合作方主体），不再按入口分叉。
