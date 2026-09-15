SELECT 'dig_advertising_account' t, 'id' c, COUNT(*) total, SUM(`id` IS NOT NULL) notnull, SUM(`id` IS NOT NULL AND `id`<>'' AND `id`<>'0') meaningful, COUNT(DISTINCT `id`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'customer_id' c, COUNT(*) total, SUM(`customer_id` IS NOT NULL) notnull, SUM(`customer_id` IS NOT NULL AND `customer_id`<>'' AND `customer_id`<>'0') meaningful, COUNT(DISTINCT `customer_id`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'subject_id' c, COUNT(*) total, SUM(`subject_id` IS NOT NULL) notnull, SUM(`subject_id` IS NOT NULL AND `subject_id`<>'' AND `subject_id`<>'0') meaningful, COUNT(DISTINCT `subject_id`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'shop_id' c, COUNT(*) total, SUM(`shop_id` IS NOT NULL) notnull, SUM(`shop_id` IS NOT NULL AND `shop_id`<>'' AND `shop_id`<>'0') meaningful, COUNT(DISTINCT `shop_id`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'account_no' c, COUNT(*) total, SUM(`account_no` IS NOT NULL) notnull, SUM(`account_no` IS NOT NULL AND `account_no`<>'' AND `account_no`<>'0') meaningful, COUNT(DISTINCT `account_no`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'account_name' c, COUNT(*) total, SUM(`account_name` IS NOT NULL) notnull, SUM(`account_name` IS NOT NULL AND `account_name`<>'' AND `account_name`<>'0') meaningful, COUNT(DISTINCT `account_name`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'currencymoney' c, COUNT(*) total, SUM(`currencymoney` IS NOT NULL) notnull, SUM(`currencymoney` IS NOT NULL AND `currencymoney`<>'' AND `currencymoney`<>'0') meaningful, COUNT(DISTINCT `currencymoney`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'incentives' c, COUNT(*) total, SUM(`incentives` IS NOT NULL) notnull, SUM(`incentives` IS NOT NULL AND `incentives`<>'' AND `incentives`<>'0') meaningful, COUNT(DISTINCT `incentives`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'returnmoney' c, COUNT(*) total, SUM(`returnmoney` IS NOT NULL) notnull, SUM(`returnmoney` IS NOT NULL AND `returnmoney`<>'' AND `returnmoney`<>'0') meaningful, COUNT(DISTINCT `returnmoney`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'service_id' c, COUNT(*) total, SUM(`service_id` IS NOT NULL) notnull, SUM(`service_id` IS NOT NULL AND `service_id`<>'' AND `service_id`<>'0') meaningful, COUNT(DISTINCT `service_id`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'service_name' c, COUNT(*) total, SUM(`service_name` IS NOT NULL) notnull, SUM(`service_name` IS NOT NULL AND `service_name`<>'' AND `service_name`<>'0') meaningful, COUNT(DISTINCT `service_name`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'remark' c, COUNT(*) total, SUM(`remark` IS NOT NULL) notnull, SUM(`remark` IS NOT NULL AND `remark`<>'' AND `remark`<>'0') meaningful, COUNT(DISTINCT `remark`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'revision' c, COUNT(*) total, SUM(`revision` IS NOT NULL) notnull, SUM(`revision` IS NOT NULL AND `revision`<>'' AND `revision`<>'0') meaningful, COUNT(DISTINCT `revision`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'create_by' c, COUNT(*) total, SUM(`create_by` IS NOT NULL) notnull, SUM(`create_by` IS NOT NULL AND `create_by`<>'' AND `create_by`<>'0') meaningful, COUNT(DISTINCT `create_by`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'create_time' c, COUNT(*) total, SUM(`create_time` IS NOT NULL) notnull, SUM(`create_time` IS NOT NULL AND `create_time`<>'' AND `create_time`<>'0') meaningful, COUNT(DISTINCT `create_time`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'update_by' c, COUNT(*) total, SUM(`update_by` IS NOT NULL) notnull, SUM(`update_by` IS NOT NULL AND `update_by`<>'' AND `update_by`<>'0') meaningful, COUNT(DISTINCT `update_by`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'update_time' c, COUNT(*) total, SUM(`update_time` IS NOT NULL) notnull, SUM(`update_time` IS NOT NULL AND `update_time`<>'' AND `update_time`<>'0') meaningful, COUNT(DISTINCT `update_time`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'del_flag' c, COUNT(*) total, SUM(`del_flag` IS NOT NULL) notnull, SUM(`del_flag` IS NOT NULL AND `del_flag`<>'' AND `del_flag`<>'0') meaningful, COUNT(DISTINCT `del_flag`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'type' c, COUNT(*) total, SUM(`type` IS NOT NULL) notnull, SUM(`type` IS NOT NULL AND `type`<>'' AND `type`<>'0') meaningful, COUNT(DISTINCT `type`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'run_status' c, COUNT(*) total, SUM(`run_status` IS NOT NULL) notnull, SUM(`run_status` IS NOT NULL AND `run_status`<>'' AND `run_status`<>'0') meaningful, COUNT(DISTINCT `run_status`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'editor_id' c, COUNT(*) total, SUM(`editor_id` IS NOT NULL) notnull, SUM(`editor_id` IS NOT NULL AND `editor_id`<>'' AND `editor_id`<>'0') meaningful, COUNT(DISTINCT `editor_id`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'editor_name' c, COUNT(*) total, SUM(`editor_name` IS NOT NULL) notnull, SUM(`editor_name` IS NOT NULL AND `editor_name`<>'' AND `editor_name`<>'0') meaningful, COUNT(DISTINCT `editor_name`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'account_ratio' c, COUNT(*) total, SUM(`account_ratio` IS NOT NULL) notnull, SUM(`account_ratio` IS NOT NULL AND `account_ratio`<>'' AND `account_ratio`<>'0') meaningful, COUNT(DISTINCT `account_ratio`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'ks_agentId' c, COUNT(*) total, SUM(`ks_agentId` IS NOT NULL) notnull, SUM(`ks_agentId` IS NOT NULL AND `ks_agentId`<>'' AND `ks_agentId`<>'0') meaningful, COUNT(DISTINCT `ks_agentId`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'supplier_id' c, COUNT(*) total, SUM(`supplier_id` IS NOT NULL) notnull, SUM(`supplier_id` IS NOT NULL AND `supplier_id`<>'' AND `supplier_id`<>'0') meaningful, COUNT(DISTINCT `supplier_id`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'dy_agentId' c, COUNT(*) total, SUM(`dy_agentId` IS NOT NULL) notnull, SUM(`dy_agentId` IS NOT NULL AND `dy_agentId`<>'' AND `dy_agentId`<>'0') meaningful, COUNT(DISTINCT `dy_agentId`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'secondary_industry' c, COUNT(*) total, SUM(`secondary_industry` IS NOT NULL) notnull, SUM(`secondary_industry` IS NOT NULL AND `secondary_industry`<>'' AND `secondary_industry`<>'0') meaningful, COUNT(DISTINCT `secondary_industry`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'primary_industry' c, COUNT(*) total, SUM(`primary_industry` IS NOT NULL) notnull, SUM(`primary_industry` IS NOT NULL AND `primary_industry`<>'' AND `primary_industry`<>'0') meaningful, COUNT(DISTINCT `primary_industry`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'consume' c, COUNT(*) total, SUM(`consume` IS NOT NULL) notnull, SUM(`consume` IS NOT NULL AND `consume`<>'' AND `consume`<>'0') meaningful, COUNT(DISTINCT `consume`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'after_ratio' c, COUNT(*) total, SUM(`after_ratio` IS NOT NULL) notnull, SUM(`after_ratio` IS NOT NULL AND `after_ratio`<>'' AND `after_ratio`<>'0') meaningful, COUNT(DISTINCT `after_ratio`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'customer_type' c, COUNT(*) total, SUM(`customer_type` IS NOT NULL) notnull, SUM(`customer_type` IS NOT NULL AND `customer_type`<>'' AND `customer_type`<>'0') meaningful, COUNT(DISTINCT `customer_type`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'original_subjectid' c, COUNT(*) total, SUM(`original_subjectid` IS NOT NULL) notnull, SUM(`original_subjectid` IS NOT NULL AND `original_subjectid`<>'' AND `original_subjectid`<>'0') meaningful, COUNT(DISTINCT `original_subjectid`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'advertiser_id' c, COUNT(*) total, SUM(`advertiser_id` IS NOT NULL) notnull, SUM(`advertiser_id` IS NOT NULL AND `advertiser_id`<>'' AND `advertiser_id`<>'0') meaningful, COUNT(DISTINCT `advertiser_id`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'account_service_point' c, COUNT(*) total, SUM(`account_service_point` IS NOT NULL) notnull, SUM(`account_service_point` IS NOT NULL AND `account_service_point`<>'' AND `account_service_point`<>'0') meaningful, COUNT(DISTINCT `account_service_point`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_advertising_account' t, 'data_type' c, COUNT(*) total, SUM(`data_type` IS NOT NULL) notnull, SUM(`data_type` IS NOT NULL AND `data_type`<>'' AND `data_type`<>'0') meaningful, COUNT(DISTINCT `data_type`) distinct_n FROM dig_advertising_account WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'id' c, COUNT(*) total, SUM(`id` IS NOT NULL) notnull, SUM(`id` IS NOT NULL AND `id`<>'' AND `id`<>'0') meaningful, COUNT(DISTINCT `id`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'cashrecharge_id' c, COUNT(*) total, SUM(`cashrecharge_id` IS NOT NULL) notnull, SUM(`cashrecharge_id` IS NOT NULL AND `cashrecharge_id`<>'' AND `cashrecharge_id`<>'0') meaningful, COUNT(DISTINCT `cashrecharge_id`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'customer_id' c, COUNT(*) total, SUM(`customer_id` IS NOT NULL) notnull, SUM(`customer_id` IS NOT NULL AND `customer_id`<>'' AND `customer_id`<>'0') meaningful, COUNT(DISTINCT `customer_id`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'adveraccount_id' c, COUNT(*) total, SUM(`adveraccount_id` IS NOT NULL) notnull, SUM(`adveraccount_id` IS NOT NULL AND `adveraccount_id`<>'' AND `adveraccount_id`<>'0') meaningful, COUNT(DISTINCT `adveraccount_id`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'cash_recharge' c, COUNT(*) total, SUM(`cash_recharge` IS NOT NULL) notnull, SUM(`cash_recharge` IS NOT NULL AND `cash_recharge`<>'' AND `cash_recharge`<>'0') meaningful, COUNT(DISTINCT `cash_recharge`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'currency_recharge' c, COUNT(*) total, SUM(`currency_recharge` IS NOT NULL) notnull, SUM(`currency_recharge` IS NOT NULL AND `currency_recharge`<>'' AND `currency_recharge`<>'0') meaningful, COUNT(DISTINCT `currency_recharge`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'credit_pay' c, COUNT(*) total, SUM(`credit_pay` IS NOT NULL) notnull, SUM(`credit_pay` IS NOT NULL AND `credit_pay`<>'' AND `credit_pay`<>'0') meaningful, COUNT(DISTINCT `credit_pay`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'cash_pay' c, COUNT(*) total, SUM(`cash_pay` IS NOT NULL) notnull, SUM(`cash_pay` IS NOT NULL AND `cash_pay`<>'' AND `cash_pay`<>'0') meaningful, COUNT(DISTINCT `cash_pay`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'opentypes' c, COUNT(*) total, SUM(`opentypes` IS NOT NULL) notnull, SUM(`opentypes` IS NOT NULL AND `opentypes`<>'' AND `opentypes`<>'0') meaningful, COUNT(DISTINCT `opentypes`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'service_charge' c, COUNT(*) total, SUM(`service_charge` IS NOT NULL) notnull, SUM(`service_charge` IS NOT NULL AND `service_charge`<>'' AND `service_charge`<>'0') meaningful, COUNT(DISTINCT `service_charge`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'supplier_id' c, COUNT(*) total, SUM(`supplier_id` IS NOT NULL) notnull, SUM(`supplier_id` IS NOT NULL AND `supplier_id`<>'' AND `supplier_id`<>'0') meaningful, COUNT(DISTINCT `supplier_id`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'supplier_name' c, COUNT(*) total, SUM(`supplier_name` IS NOT NULL) notnull, SUM(`supplier_name` IS NOT NULL AND `supplier_name`<>'' AND `supplier_name`<>'0') meaningful, COUNT(DISTINCT `supplier_name`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'actual_expenditure' c, COUNT(*) total, SUM(`actual_expenditure` IS NOT NULL) notnull, SUM(`actual_expenditure` IS NOT NULL AND `actual_expenditure`<>'' AND `actual_expenditure`<>'0') meaningful, COUNT(DISTINCT `actual_expenditure`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'supplier_accountid' c, COUNT(*) total, SUM(`supplier_accountid` IS NOT NULL) notnull, SUM(`supplier_accountid` IS NOT NULL AND `supplier_accountid`<>'' AND `supplier_accountid`<>'0') meaningful, COUNT(DISTINCT `supplier_accountid`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'supplier_ratio' c, COUNT(*) total, SUM(`supplier_ratio` IS NOT NULL) notnull, SUM(`supplier_ratio` IS NOT NULL AND `supplier_ratio`<>'' AND `supplier_ratio`<>'0') meaningful, COUNT(DISTINCT `supplier_ratio`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'payment_types' c, COUNT(*) total, SUM(`payment_types` IS NOT NULL) notnull, SUM(`payment_types` IS NOT NULL AND `payment_types`<>'' AND `payment_types`<>'0') meaningful, COUNT(DISTINCT `payment_types`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'approval_state' c, COUNT(*) total, SUM(`approval_state` IS NOT NULL) notnull, SUM(`approval_state` IS NOT NULL AND `approval_state`<>'' AND `approval_state`<>'0') meaningful, COUNT(DISTINCT `approval_state`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'confirm_userid' c, COUNT(*) total, SUM(`confirm_userid` IS NOT NULL) notnull, SUM(`confirm_userid` IS NOT NULL AND `confirm_userid`<>'' AND `confirm_userid`<>'0') meaningful, COUNT(DISTINCT `confirm_userid`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'complete_time' c, COUNT(*) total, SUM(`complete_time` IS NOT NULL) notnull, SUM(`complete_time` IS NOT NULL AND `complete_time`<>'' AND `complete_time`<>'0') meaningful, COUNT(DISTINCT `complete_time`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'cash_balance' c, COUNT(*) total, SUM(`cash_balance` IS NOT NULL) notnull, SUM(`cash_balance` IS NOT NULL AND `cash_balance`<>'' AND `cash_balance`<>'0') meaningful, COUNT(DISTINCT `cash_balance`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'credit_usemoney' c, COUNT(*) total, SUM(`credit_usemoney` IS NOT NULL) notnull, SUM(`credit_usemoney` IS NOT NULL AND `credit_usemoney`<>'' AND `credit_usemoney`<>'0') meaningful, COUNT(DISTINCT `credit_usemoney`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'account_balance' c, COUNT(*) total, SUM(`account_balance` IS NOT NULL) notnull, SUM(`account_balance` IS NOT NULL AND `account_balance`<>'' AND `account_balance`<>'0') meaningful, COUNT(DISTINCT `account_balance`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'remark' c, COUNT(*) total, SUM(`remark` IS NOT NULL) notnull, SUM(`remark` IS NOT NULL AND `remark`<>'' AND `remark`<>'0') meaningful, COUNT(DISTINCT `remark`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'revision' c, COUNT(*) total, SUM(`revision` IS NOT NULL) notnull, SUM(`revision` IS NOT NULL AND `revision`<>'' AND `revision`<>'0') meaningful, COUNT(DISTINCT `revision`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'create_by' c, COUNT(*) total, SUM(`create_by` IS NOT NULL) notnull, SUM(`create_by` IS NOT NULL AND `create_by`<>'' AND `create_by`<>'0') meaningful, COUNT(DISTINCT `create_by`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'create_time' c, COUNT(*) total, SUM(`create_time` IS NOT NULL) notnull, SUM(`create_time` IS NOT NULL AND `create_time`<>'' AND `create_time`<>'0') meaningful, COUNT(DISTINCT `create_time`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'update_by' c, COUNT(*) total, SUM(`update_by` IS NOT NULL) notnull, SUM(`update_by` IS NOT NULL AND `update_by`<>'' AND `update_by`<>'0') meaningful, COUNT(DISTINCT `update_by`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'update_time' c, COUNT(*) total, SUM(`update_time` IS NOT NULL) notnull, SUM(`update_time` IS NOT NULL AND `update_time`<>'' AND `update_time`<>'0') meaningful, COUNT(DISTINCT `update_time`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'datatypes' c, COUNT(*) total, SUM(`datatypes` IS NOT NULL) notnull, SUM(`datatypes` IS NOT NULL AND `datatypes`<>'' AND `datatypes`<>'0') meaningful, COUNT(DISTINCT `datatypes`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'service_id' c, COUNT(*) total, SUM(`service_id` IS NOT NULL) notnull, SUM(`service_id` IS NOT NULL AND `service_id`<>'' AND `service_id`<>'0') meaningful, COUNT(DISTINCT `service_id`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'service_name' c, COUNT(*) total, SUM(`service_name` IS NOT NULL) notnull, SUM(`service_name` IS NOT NULL AND `service_name`<>'' AND `service_name`<>'0') meaningful, COUNT(DISTINCT `service_name`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'before_ratio' c, COUNT(*) total, SUM(`before_ratio` IS NOT NULL) notnull, SUM(`before_ratio` IS NOT NULL AND `before_ratio`<>'' AND `before_ratio`<>'0') meaningful, COUNT(DISTINCT `before_ratio`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'sale_id' c, COUNT(*) total, SUM(`sale_id` IS NOT NULL) notnull, SUM(`sale_id` IS NOT NULL AND `sale_id`<>'' AND `sale_id`<>'0') meaningful, COUNT(DISTINCT `sale_id`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'sale_name' c, COUNT(*) total, SUM(`sale_name` IS NOT NULL) notnull, SUM(`sale_name` IS NOT NULL AND `sale_name`<>'' AND `sale_name`<>'0') meaningful, COUNT(DISTINCT `sale_name`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'merge_id' c, COUNT(*) total, SUM(`merge_id` IS NOT NULL) notnull, SUM(`merge_id` IS NOT NULL AND `merge_id`<>'' AND `merge_id`<>'0') meaningful, COUNT(DISTINCT `merge_id`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'sync_state' c, COUNT(*) total, SUM(`sync_state` IS NOT NULL) notnull, SUM(`sync_state` IS NOT NULL AND `sync_state`<>'' AND `sync_state`<>'0') meaningful, COUNT(DISTINCT `sync_state`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'ks_reason' c, COUNT(*) total, SUM(`ks_reason` IS NOT NULL) notnull, SUM(`ks_reason` IS NOT NULL AND `ks_reason`<>'' AND `ks_reason`<>'0') meaningful, COUNT(DISTINCT `ks_reason`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'sync_time' c, COUNT(*) total, SUM(`sync_time` IS NOT NULL) notnull, SUM(`sync_time` IS NOT NULL AND `sync_time`<>'' AND `sync_time`<>'0') meaningful, COUNT(DISTINCT `sync_time`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'account_ratio' c, COUNT(*) total, SUM(`account_ratio` IS NOT NULL) notnull, SUM(`account_ratio` IS NOT NULL AND `account_ratio`<>'' AND `account_ratio`<>'0') meaningful, COUNT(DISTINCT `account_ratio`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'supplement_state' c, COUNT(*) total, SUM(`supplement_state` IS NOT NULL) notnull, SUM(`supplement_state` IS NOT NULL AND `supplement_state`<>'' AND `supplement_state`<>'0') meaningful, COUNT(DISTINCT `supplement_state`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'supplement_date' c, COUNT(*) total, SUM(`supplement_date` IS NOT NULL) notnull, SUM(`supplement_date` IS NOT NULL AND `supplement_date`<>'' AND `supplement_date`<>'0') meaningful, COUNT(DISTINCT `supplement_date`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'wallet_json' c, COUNT(*) total, SUM(`wallet_json` IS NOT NULL) notnull, SUM(`wallet_json` IS NOT NULL AND `wallet_json`<>'' AND `wallet_json`<>'0') meaningful, COUNT(DISTINCT `wallet_json`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'del_flag' c, COUNT(*) total, SUM(`del_flag` IS NOT NULL) notnull, SUM(`del_flag` IS NOT NULL AND `del_flag`<>'' AND `del_flag`<>'0') meaningful, COUNT(DISTINCT `del_flag`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'after_ratio' c, COUNT(*) total, SUM(`after_ratio` IS NOT NULL) notnull, SUM(`after_ratio` IS NOT NULL AND `after_ratio`<>'' AND `after_ratio`<>'0') meaningful, COUNT(DISTINCT `after_ratio`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'refuse_reason' c, COUNT(*) total, SUM(`refuse_reason` IS NOT NULL) notnull, SUM(`refuse_reason` IS NOT NULL AND `refuse_reason`<>'' AND `refuse_reason`<>'0') meaningful, COUNT(DISTINCT `refuse_reason`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'account' c, COUNT(*) total, SUM(`account` IS NOT NULL) notnull, SUM(`account` IS NOT NULL AND `account`<>'' AND `account`<>'0') meaningful, COUNT(DISTINCT `account`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'after_ratio_last' c, COUNT(*) total, SUM(`after_ratio_last` IS NOT NULL) notnull, SUM(`after_ratio_last` IS NOT NULL AND `after_ratio_last`<>'' AND `after_ratio_last`<>'0') meaningful, COUNT(DISTINCT `after_ratio_last`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'capital_type' c, COUNT(*) total, SUM(`capital_type` IS NOT NULL) notnull, SUM(`capital_type` IS NOT NULL AND `capital_type`<>'' AND `capital_type`<>'0') meaningful, COUNT(DISTINCT `capital_type`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'tags' c, COUNT(*) total, SUM(`tags` IS NOT NULL) notnull, SUM(`tags` IS NOT NULL AND `tags`<>'' AND `tags`<>'0') meaningful, COUNT(DISTINCT `tags`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'source' c, COUNT(*) total, SUM(`source` IS NOT NULL) notnull, SUM(`source` IS NOT NULL AND `source`<>'' AND `source`<>'0') meaningful, COUNT(DISTINCT `source`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'monetary_credit_pay' c, COUNT(*) total, SUM(`monetary_credit_pay` IS NOT NULL) notnull, SUM(`monetary_credit_pay` IS NOT NULL AND `monetary_credit_pay`<>'' AND `monetary_credit_pay`<>'0') meaningful, COUNT(DISTINCT `monetary_credit_pay`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'monetary_credituse' c, COUNT(*) total, SUM(`monetary_credituse` IS NOT NULL) notnull, SUM(`monetary_credituse` IS NOT NULL AND `monetary_credituse`<>'' AND `monetary_credituse`<>'0') meaningful, COUNT(DISTINCT `monetary_credituse`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'credit_datatype' c, COUNT(*) total, SUM(`credit_datatype` IS NOT NULL) notnull, SUM(`credit_datatype` IS NOT NULL AND `credit_datatype`<>'' AND `credit_datatype`<>'0') meaningful, COUNT(DISTINCT `credit_datatype`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_adveracoount_recharge' t, 'wallet_key' c, COUNT(*) total, SUM(`wallet_key` IS NOT NULL) notnull, SUM(`wallet_key` IS NOT NULL AND `wallet_key`<>'' AND `wallet_key`<>'0') meaningful, COUNT(DISTINCT `wallet_key`) distinct_n FROM dig_adveracoount_recharge WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'id' c, COUNT(*) total, SUM(`id` IS NOT NULL) notnull, SUM(`id` IS NOT NULL AND `id`<>'' AND `id`<>'0') meaningful, COUNT(DISTINCT `id`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'supplier_name' c, COUNT(*) total, SUM(`supplier_name` IS NOT NULL) notnull, SUM(`supplier_name` IS NOT NULL AND `supplier_name`<>'' AND `supplier_name`<>'0') meaningful, COUNT(DISTINCT `supplier_name`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'returnratio' c, COUNT(*) total, SUM(`returnratio` IS NOT NULL) notnull, SUM(`returnratio` IS NOT NULL AND `returnratio`<>'' AND `returnratio`<>'0') meaningful, COUNT(DISTINCT `returnratio`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'types' c, COUNT(*) total, SUM(`types` IS NOT NULL) notnull, SUM(`types` IS NOT NULL AND `types`<>'' AND `types`<>'0') meaningful, COUNT(DISTINCT `types`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'remark' c, COUNT(*) total, SUM(`remark` IS NOT NULL) notnull, SUM(`remark` IS NOT NULL AND `remark`<>'' AND `remark`<>'0') meaningful, COUNT(DISTINCT `remark`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'arrears' c, COUNT(*) total, SUM(`arrears` IS NOT NULL) notnull, SUM(`arrears` IS NOT NULL AND `arrears`<>'' AND `arrears`<>'0') meaningful, COUNT(DISTINCT `arrears`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'revision' c, COUNT(*) total, SUM(`revision` IS NOT NULL) notnull, SUM(`revision` IS NOT NULL AND `revision`<>'' AND `revision`<>'0') meaningful, COUNT(DISTINCT `revision`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'create_by' c, COUNT(*) total, SUM(`create_by` IS NOT NULL) notnull, SUM(`create_by` IS NOT NULL AND `create_by`<>'' AND `create_by`<>'0') meaningful, COUNT(DISTINCT `create_by`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'create_time' c, COUNT(*) total, SUM(`create_time` IS NOT NULL) notnull, SUM(`create_time` IS NOT NULL AND `create_time`<>'' AND `create_time`<>'0') meaningful, COUNT(DISTINCT `create_time`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'update_by' c, COUNT(*) total, SUM(`update_by` IS NOT NULL) notnull, SUM(`update_by` IS NOT NULL AND `update_by`<>'' AND `update_by`<>'0') meaningful, COUNT(DISTINCT `update_by`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'update_time' c, COUNT(*) total, SUM(`update_time` IS NOT NULL) notnull, SUM(`update_time` IS NOT NULL AND `update_time`<>'' AND `update_time`<>'0') meaningful, COUNT(DISTINCT `update_time`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'del_flag' c, COUNT(*) total, SUM(`del_flag` IS NOT NULL) notnull, SUM(`del_flag` IS NOT NULL AND `del_flag`<>'' AND `del_flag`<>'0') meaningful, COUNT(DISTINCT `del_flag`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'pay_type' c, COUNT(*) total, SUM(`pay_type` IS NOT NULL) notnull, SUM(`pay_type` IS NOT NULL AND `pay_type`<>'' AND `pay_type`<>'0') meaningful, COUNT(DISTINCT `pay_type`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'ks_agentId' c, COUNT(*) total, SUM(`ks_agentId` IS NOT NULL) notnull, SUM(`ks_agentId` IS NOT NULL AND `ks_agentId`<>'' AND `ks_agentId`<>'0') meaningful, COUNT(DISTINCT `ks_agentId`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'dy_agentId' c, COUNT(*) total, SUM(`dy_agentId` IS NOT NULL) notnull, SUM(`dy_agentId` IS NOT NULL AND `dy_agentId`<>'' AND `dy_agentId`<>'0') meaningful, COUNT(DISTINCT `dy_agentId`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'account_type' c, COUNT(*) total, SUM(`account_type` IS NOT NULL) notnull, SUM(`account_type` IS NOT NULL AND `account_type`<>'' AND `account_type`<>'0') meaningful, COUNT(DISTINCT `account_type`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'suppliertype' c, COUNT(*) total, SUM(`suppliertype` IS NOT NULL) notnull, SUM(`suppliertype` IS NOT NULL AND `suppliertype`<>'' AND `suppliertype`<>'0') meaningful, COUNT(DISTINCT `suppliertype`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'apiprevfix' c, COUNT(*) total, SUM(`apiprevfix` IS NOT NULL) notnull, SUM(`apiprevfix` IS NOT NULL AND `apiprevfix`<>'' AND `apiprevfix`<>'0') meaningful, COUNT(DISTINCT `apiprevfix`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'first_userId' c, COUNT(*) total, SUM(`first_userId` IS NOT NULL) notnull, SUM(`first_userId` IS NOT NULL AND `first_userId`<>'' AND `first_userId`<>'0') meaningful, COUNT(DISTINCT `first_userId`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'first_userpwd' c, COUNT(*) total, SUM(`first_userpwd` IS NOT NULL) notnull, SUM(`first_userpwd` IS NOT NULL AND `first_userpwd`<>'' AND `first_userpwd`<>'0') meaningful, COUNT(DISTINCT `first_userpwd`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'first_customerId' c, COUNT(*) total, SUM(`first_customerId` IS NOT NULL) notnull, SUM(`first_customerId` IS NOT NULL AND `first_customerId`<>'' AND `first_customerId`<>'0') meaningful, COUNT(DISTINCT `first_customerId`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'first_supplierId' c, COUNT(*) total, SUM(`first_supplierId` IS NOT NULL) notnull, SUM(`first_supplierId` IS NOT NULL AND `first_supplierId`<>'' AND `first_supplierId`<>'0') meaningful, COUNT(DISTINCT `first_supplierId`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'main_wallet_id' c, COUNT(*) total, SUM(`main_wallet_id` IS NOT NULL) notnull, SUM(`main_wallet_id` IS NOT NULL AND `main_wallet_id`<>'' AND `main_wallet_id`<>'0') meaningful, COUNT(DISTINCT `main_wallet_id`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'sendmsg' c, COUNT(*) total, SUM(`sendmsg` IS NOT NULL) notnull, SUM(`sendmsg` IS NOT NULL AND `sendmsg`<>'' AND `sendmsg`<>'0') meaningful, COUNT(DISTINCT `sendmsg`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'threshold' c, COUNT(*) total, SUM(`threshold` IS NOT NULL) notnull, SUM(`threshold` IS NOT NULL AND `threshold`<>'' AND `threshold`<>'0') meaningful, COUNT(DISTINCT `threshold`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'remind_userid' c, COUNT(*) total, SUM(`remind_userid` IS NOT NULL) notnull, SUM(`remind_userid` IS NOT NULL AND `remind_userid`<>'' AND `remind_userid`<>'0') meaningful, COUNT(DISTINCT `remind_userid`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'last_consume_date' c, COUNT(*) total, SUM(`last_consume_date` IS NOT NULL) notnull, SUM(`last_consume_date` IS NOT NULL AND `last_consume_date`<>'' AND `last_consume_date`<>'0') meaningful, COUNT(DISTINCT `last_consume_date`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'media_balance' c, COUNT(*) total, SUM(`media_balance` IS NOT NULL) notnull, SUM(`media_balance` IS NOT NULL AND `media_balance`<>'' AND `media_balance`<>'0') meaningful, COUNT(DISTINCT `media_balance`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_supplier' t, 'media_balancejson' c, COUNT(*) total, SUM(`media_balancejson` IS NOT NULL) notnull, SUM(`media_balancejson` IS NOT NULL AND `media_balancejson`<>'' AND `media_balancejson`<>'0') meaningful, COUNT(DISTINCT `media_balancejson`) distinct_n FROM dig_supplier WHERE del_flag='0'
UNION ALL
SELECT 'dig_cashrecharge' t, 'id' c, COUNT(*) total, SUM(`id` IS NOT NULL) notnull, SUM(`id` IS NOT NULL AND `id`<>'' AND `id`<>'0') meaningful, COUNT(DISTINCT `id`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'customer_id' c, COUNT(*) total, SUM(`customer_id` IS NOT NULL) notnull, SUM(`customer_id` IS NOT NULL AND `customer_id`<>'' AND `customer_id`<>'0') meaningful, COUNT(DISTINCT `customer_id`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'customer_name' c, COUNT(*) total, SUM(`customer_name` IS NOT NULL) notnull, SUM(`customer_name` IS NOT NULL AND `customer_name`<>'' AND `customer_name`<>'0') meaningful, COUNT(DISTINCT `customer_name`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'money' c, COUNT(*) total, SUM(`money` IS NOT NULL) notnull, SUM(`money` IS NOT NULL AND `money`<>'' AND `money`<>'0') meaningful, COUNT(DISTINCT `money`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'retype' c, COUNT(*) total, SUM(`retype` IS NOT NULL) notnull, SUM(`retype` IS NOT NULL AND `retype`<>'' AND `retype`<>'0') meaningful, COUNT(DISTINCT `retype`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'payer' c, COUNT(*) total, SUM(`payer` IS NOT NULL) notnull, SUM(`payer` IS NOT NULL AND `payer`<>'' AND `payer`<>'0') meaningful, COUNT(DISTINCT `payer`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'pay_time' c, COUNT(*) total, SUM(`pay_time` IS NOT NULL) notnull, SUM(`pay_time` IS NOT NULL AND `pay_time`<>'' AND `pay_time`<>'0') meaningful, COUNT(DISTINCT `pay_time`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'payment_voucher' c, COUNT(*) total, SUM(`payment_voucher` IS NOT NULL) notnull, SUM(`payment_voucher` IS NOT NULL AND `payment_voucher`<>'' AND `payment_voucher`<>'0') meaningful, COUNT(DISTINCT `payment_voucher`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'account_id' c, COUNT(*) total, SUM(`account_id` IS NOT NULL) notnull, SUM(`account_id` IS NOT NULL AND `account_id`<>'' AND `account_id`<>'0') meaningful, COUNT(DISTINCT `account_id`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'account_no' c, COUNT(*) total, SUM(`account_no` IS NOT NULL) notnull, SUM(`account_no` IS NOT NULL AND `account_no`<>'' AND `account_no`<>'0') meaningful, COUNT(DISTINCT `account_no`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'account_name' c, COUNT(*) total, SUM(`account_name` IS NOT NULL) notnull, SUM(`account_name` IS NOT NULL AND `account_name`<>'' AND `account_name`<>'0') meaningful, COUNT(DISTINCT `account_name`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'approval_state' c, COUNT(*) total, SUM(`approval_state` IS NOT NULL) notnull, SUM(`approval_state` IS NOT NULL AND `approval_state`<>'' AND `approval_state`<>'0') meaningful, COUNT(DISTINCT `approval_state`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'confirm_userid' c, COUNT(*) total, SUM(`confirm_userid` IS NOT NULL) notnull, SUM(`confirm_userid` IS NOT NULL AND `confirm_userid`<>'' AND `confirm_userid`<>'0') meaningful, COUNT(DISTINCT `confirm_userid`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'complete_time' c, COUNT(*) total, SUM(`complete_time` IS NOT NULL) notnull, SUM(`complete_time` IS NOT NULL AND `complete_time`<>'' AND `complete_time`<>'0') meaningful, COUNT(DISTINCT `complete_time`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'cash_balance' c, COUNT(*) total, SUM(`cash_balance` IS NOT NULL) notnull, SUM(`cash_balance` IS NOT NULL AND `cash_balance`<>'' AND `cash_balance`<>'0') meaningful, COUNT(DISTINCT `cash_balance`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'credit_usemoney' c, COUNT(*) total, SUM(`credit_usemoney` IS NOT NULL) notnull, SUM(`credit_usemoney` IS NOT NULL AND `credit_usemoney`<>'' AND `credit_usemoney`<>'0') meaningful, COUNT(DISTINCT `credit_usemoney`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'remark' c, COUNT(*) total, SUM(`remark` IS NOT NULL) notnull, SUM(`remark` IS NOT NULL AND `remark`<>'' AND `remark`<>'0') meaningful, COUNT(DISTINCT `remark`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'revision' c, COUNT(*) total, SUM(`revision` IS NOT NULL) notnull, SUM(`revision` IS NOT NULL AND `revision`<>'' AND `revision`<>'0') meaningful, COUNT(DISTINCT `revision`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'create_by' c, COUNT(*) total, SUM(`create_by` IS NOT NULL) notnull, SUM(`create_by` IS NOT NULL AND `create_by`<>'' AND `create_by`<>'0') meaningful, COUNT(DISTINCT `create_by`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'create_time' c, COUNT(*) total, SUM(`create_time` IS NOT NULL) notnull, SUM(`create_time` IS NOT NULL AND `create_time`<>'' AND `create_time`<>'0') meaningful, COUNT(DISTINCT `create_time`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'update_by' c, COUNT(*) total, SUM(`update_by` IS NOT NULL) notnull, SUM(`update_by` IS NOT NULL AND `update_by`<>'' AND `update_by`<>'0') meaningful, COUNT(DISTINCT `update_by`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'update_time' c, COUNT(*) total, SUM(`update_time` IS NOT NULL) notnull, SUM(`update_time` IS NOT NULL AND `update_time`<>'' AND `update_time`<>'0') meaningful, COUNT(DISTINCT `update_time`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'serialnum' c, COUNT(*) total, SUM(`serialnum` IS NOT NULL) notnull, SUM(`serialnum` IS NOT NULL AND `serialnum`<>'' AND `serialnum`<>'0') meaningful, COUNT(DISTINCT `serialnum`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'commission' c, COUNT(*) total, SUM(`commission` IS NOT NULL) notnull, SUM(`commission` IS NOT NULL AND `commission`<>'' AND `commission`<>'0') meaningful, COUNT(DISTINCT `commission`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'all_send_out' c, COUNT(*) total, SUM(`all_send_out` IS NOT NULL) notnull, SUM(`all_send_out` IS NOT NULL AND `all_send_out`<>'' AND `all_send_out`<>'0') meaningful, COUNT(DISTINCT `all_send_out`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'sale_id' c, COUNT(*) total, SUM(`sale_id` IS NOT NULL) notnull, SUM(`sale_id` IS NOT NULL AND `sale_id`<>'' AND `sale_id`<>'0') meaningful, COUNT(DISTINCT `sale_id`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'sale_name' c, COUNT(*) total, SUM(`sale_name` IS NOT NULL) notnull, SUM(`sale_name` IS NOT NULL AND `sale_name`<>'' AND `sale_name`<>'0') meaningful, COUNT(DISTINCT `sale_name`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'before_ratio' c, COUNT(*) total, SUM(`before_ratio` IS NOT NULL) notnull, SUM(`before_ratio` IS NOT NULL AND `before_ratio`<>'' AND `before_ratio`<>'0') meaningful, COUNT(DISTINCT `before_ratio`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'statement_id' c, COUNT(*) total, SUM(`statement_id` IS NOT NULL) notnull, SUM(`statement_id` IS NOT NULL AND `statement_id`<>'' AND `statement_id`<>'0') meaningful, COUNT(DISTINCT `statement_id`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'first_order_num' c, COUNT(*) total, SUM(`first_order_num` IS NOT NULL) notnull, SUM(`first_order_num` IS NOT NULL AND `first_order_num`<>'' AND `first_order_num`<>'0') meaningful, COUNT(DISTINCT `first_order_num`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'del_flag' c, COUNT(*) total, SUM(`del_flag` IS NOT NULL) notnull, SUM(`del_flag` IS NOT NULL AND `del_flag`<>'' AND `del_flag`<>'0') meaningful, COUNT(DISTINCT `del_flag`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'first_order_price' c, COUNT(*) total, SUM(`first_order_price` IS NOT NULL) notnull, SUM(`first_order_price` IS NOT NULL AND `first_order_price`<>'' AND `first_order_price`<>'0') meaningful, COUNT(DISTINCT `first_order_price`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'wallet_json' c, COUNT(*) total, SUM(`wallet_json` IS NOT NULL) notnull, SUM(`wallet_json` IS NOT NULL AND `wallet_json`<>'' AND `wallet_json`<>'0') meaningful, COUNT(DISTINCT `wallet_json`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'commission_ratio' c, COUNT(*) total, SUM(`commission_ratio` IS NOT NULL) notnull, SUM(`commission_ratio` IS NOT NULL AND `commission_ratio`<>'' AND `commission_ratio`<>'0') meaningful, COUNT(DISTINCT `commission_ratio`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'recharge_flag' c, COUNT(*) total, SUM(`recharge_flag` IS NOT NULL) notnull, SUM(`recharge_flag` IS NOT NULL AND `recharge_flag`<>'' AND `recharge_flag`<>'0') meaningful, COUNT(DISTINCT `recharge_flag`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'invoice_flag' c, COUNT(*) total, SUM(`invoice_flag` IS NOT NULL) notnull, SUM(`invoice_flag` IS NOT NULL AND `invoice_flag`<>'' AND `invoice_flag`<>'0') meaningful, COUNT(DISTINCT `invoice_flag`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'tag' c, COUNT(*) total, SUM(`tag` IS NOT NULL) notnull, SUM(`tag` IS NOT NULL AND `tag`<>'' AND `tag`<>'0') meaningful, COUNT(DISTINCT `tag`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_cashrecharge' t, 'service_charge' c, COUNT(*) total, SUM(`service_charge` IS NOT NULL) notnull, SUM(`service_charge` IS NOT NULL AND `service_charge`<>'' AND `service_charge`<>'0') meaningful, COUNT(DISTINCT `service_charge`) distinct_n FROM dig_cashrecharge WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'id' c, COUNT(*) total, SUM(`id` IS NOT NULL) notnull, SUM(`id` IS NOT NULL AND `id`<>'' AND `id`<>'0') meaningful, COUNT(DISTINCT `id`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'subject_name' c, COUNT(*) total, SUM(`subject_name` IS NOT NULL) notnull, SUM(`subject_name` IS NOT NULL AND `subject_name`<>'' AND `subject_name`<>'0') meaningful, COUNT(DISTINCT `subject_name`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'shop_no' c, COUNT(*) total, SUM(`shop_no` IS NOT NULL) notnull, SUM(`shop_no` IS NOT NULL AND `shop_no`<>'' AND `shop_no`<>'0') meaningful, COUNT(DISTINCT `shop_no`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'account_type' c, COUNT(*) total, SUM(`account_type` IS NOT NULL) notnull, SUM(`account_type` IS NOT NULL AND `account_type`<>'' AND `account_type`<>'0') meaningful, COUNT(DISTINCT `account_type`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'add_num' c, COUNT(*) total, SUM(`add_num` IS NOT NULL) notnull, SUM(`add_num` IS NOT NULL AND `add_num`<>'' AND `add_num`<>'0') meaningful, COUNT(DISTINCT `add_num`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'category' c, COUNT(*) total, SUM(`category` IS NOT NULL) notnull, SUM(`category` IS NOT NULL AND `category`<>'' AND `category`<>'0') meaningful, COUNT(DISTINCT `category`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'cid' c, COUNT(*) total, SUM(`cid` IS NOT NULL) notnull, SUM(`cid` IS NOT NULL AND `cid`<>'' AND `cid`<>'0') meaningful, COUNT(DISTINCT `cid`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'customer_name' c, COUNT(*) total, SUM(`customer_name` IS NOT NULL) notnull, SUM(`customer_name` IS NOT NULL AND `customer_name`<>'' AND `customer_name`<>'0') meaningful, COUNT(DISTINCT `customer_name`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'depname' c, COUNT(*) total, SUM(`depname` IS NOT NULL) notnull, SUM(`depname` IS NOT NULL AND `depname`<>'' AND `depname`<>'0') meaningful, COUNT(DISTINCT `depname`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'applyname' c, COUNT(*) total, SUM(`applyname` IS NOT NULL) notnull, SUM(`applyname` IS NOT NULL AND `applyname`<>'' AND `applyname`<>'0') meaningful, COUNT(DISTINCT `applyname`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'manager' c, COUNT(*) total, SUM(`manager` IS NOT NULL) notnull, SUM(`manager` IS NOT NULL AND `manager`<>'' AND `manager`<>'0') meaningful, COUNT(DISTINCT `manager`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'reply' c, COUNT(*) total, SUM(`reply` IS NOT NULL) notnull, SUM(`reply` IS NOT NULL AND `reply`<>'' AND `reply`<>'0') meaningful, COUNT(DISTINCT `reply`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'reply_date' c, COUNT(*) total, SUM(`reply_date` IS NOT NULL) notnull, SUM(`reply_date` IS NOT NULL AND `reply_date`<>'' AND `reply_date`<>'0') meaningful, COUNT(DISTINCT `reply_date`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'reply_userid' c, COUNT(*) total, SUM(`reply_userid` IS NOT NULL) notnull, SUM(`reply_userid` IS NOT NULL AND `reply_userid`<>'' AND `reply_userid`<>'0') meaningful, COUNT(DISTINCT `reply_userid`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'reply_username' c, COUNT(*) total, SUM(`reply_username` IS NOT NULL) notnull, SUM(`reply_username` IS NOT NULL AND `reply_username`<>'' AND `reply_username`<>'0') meaningful, COUNT(DISTINCT `reply_username`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'state' c, COUNT(*) total, SUM(`state` IS NOT NULL) notnull, SUM(`state` IS NOT NULL AND `state`<>'' AND `state`<>'0') meaningful, COUNT(DISTINCT `state`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'create_by' c, COUNT(*) total, SUM(`create_by` IS NOT NULL) notnull, SUM(`create_by` IS NOT NULL AND `create_by`<>'' AND `create_by`<>'0') meaningful, COUNT(DISTINCT `create_by`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'create_time' c, COUNT(*) total, SUM(`create_time` IS NOT NULL) notnull, SUM(`create_time` IS NOT NULL AND `create_time`<>'' AND `create_time`<>'0') meaningful, COUNT(DISTINCT `create_time`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'shop_name' c, COUNT(*) total, SUM(`shop_name` IS NOT NULL) notnull, SUM(`shop_name` IS NOT NULL AND `shop_name`<>'' AND `shop_name`<>'0') meaningful, COUNT(DISTINCT `shop_name`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'data_type' c, COUNT(*) total, SUM(`data_type` IS NOT NULL) notnull, SUM(`data_type` IS NOT NULL AND `data_type`<>'' AND `data_type`<>'0') meaningful, COUNT(DISTINCT `data_type`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'supplier_name' c, COUNT(*) total, SUM(`supplier_name` IS NOT NULL) notnull, SUM(`supplier_name` IS NOT NULL AND `supplier_name`<>'' AND `supplier_name`<>'0') meaningful, COUNT(DISTINCT `supplier_name`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'customer_type' c, COUNT(*) total, SUM(`customer_type` IS NOT NULL) notnull, SUM(`customer_type` IS NOT NULL AND `customer_type`<>'' AND `customer_type`<>'0') meaningful, COUNT(DISTINCT `customer_type`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'account_nos' c, COUNT(*) total, SUM(`account_nos` IS NOT NULL) notnull, SUM(`account_nos` IS NOT NULL AND `account_nos`<>'' AND `account_nos`<>'0') meaningful, COUNT(DISTINCT `account_nos`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'customer_id' c, COUNT(*) total, SUM(`customer_id` IS NOT NULL) notnull, SUM(`customer_id` IS NOT NULL AND `customer_id`<>'' AND `customer_id`<>'0') meaningful, COUNT(DISTINCT `customer_id`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_accountopen_apply' t, 'remark' c, COUNT(*) total, SUM(`remark` IS NOT NULL) notnull, SUM(`remark` IS NOT NULL AND `remark`<>'' AND `remark`<>'0') meaningful, COUNT(DISTINCT `remark`) distinct_n FROM dig_accountopen_apply WHERE 1=1
UNION ALL
SELECT 'dig_customer' t, 'id' c, COUNT(*) total, SUM(`id` IS NOT NULL) notnull, SUM(`id` IS NOT NULL AND `id`<>'' AND `id`<>'0') meaningful, COUNT(DISTINCT `id`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'types' c, COUNT(*) total, SUM(`types` IS NOT NULL) notnull, SUM(`types` IS NOT NULL AND `types`<>'' AND `types`<>'0') meaningful, COUNT(DISTINCT `types`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'customer_no' c, COUNT(*) total, SUM(`customer_no` IS NOT NULL) notnull, SUM(`customer_no` IS NOT NULL AND `customer_no`<>'' AND `customer_no`<>'0') meaningful, COUNT(DISTINCT `customer_no`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'customer_name' c, COUNT(*) total, SUM(`customer_name` IS NOT NULL) notnull, SUM(`customer_name` IS NOT NULL AND `customer_name`<>'' AND `customer_name`<>'0') meaningful, COUNT(DISTINCT `customer_name`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'contact_name' c, COUNT(*) total, SUM(`contact_name` IS NOT NULL) notnull, SUM(`contact_name` IS NOT NULL AND `contact_name`<>'' AND `contact_name`<>'0') meaningful, COUNT(DISTINCT `contact_name`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'tel' c, COUNT(*) total, SUM(`tel` IS NOT NULL) notnull, SUM(`tel` IS NOT NULL AND `tel`<>'' AND `tel`<>'0') meaningful, COUNT(DISTINCT `tel`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'before_ratio' c, COUNT(*) total, SUM(`before_ratio` IS NOT NULL) notnull, SUM(`before_ratio` IS NOT NULL AND `before_ratio`<>'' AND `before_ratio`<>'0') meaningful, COUNT(DISTINCT `before_ratio`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'credit_money' c, COUNT(*) total, SUM(`credit_money` IS NOT NULL) notnull, SUM(`credit_money` IS NOT NULL AND `credit_money`<>'' AND `credit_money`<>'0') meaningful, COUNT(DISTINCT `credit_money`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'credit_usemoney' c, COUNT(*) total, SUM(`credit_usemoney` IS NOT NULL) notnull, SUM(`credit_usemoney` IS NOT NULL AND `credit_usemoney`<>'' AND `credit_usemoney`<>'0') meaningful, COUNT(DISTINCT `credit_usemoney`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'balance' c, COUNT(*) total, SUM(`balance` IS NOT NULL) notnull, SUM(`balance` IS NOT NULL AND `balance`<>'' AND `balance`<>'0') meaningful, COUNT(DISTINCT `balance`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'total_recharge' c, COUNT(*) total, SUM(`total_recharge` IS NOT NULL) notnull, SUM(`total_recharge` IS NOT NULL AND `total_recharge`<>'' AND `total_recharge`<>'0') meaningful, COUNT(DISTINCT `total_recharge`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'total_consume' c, COUNT(*) total, SUM(`total_consume` IS NOT NULL) notnull, SUM(`total_consume` IS NOT NULL AND `total_consume`<>'' AND `total_consume`<>'0') meaningful, COUNT(DISTINCT `total_consume`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sale_id' c, COUNT(*) total, SUM(`sale_id` IS NOT NULL) notnull, SUM(`sale_id` IS NOT NULL AND `sale_id`<>'' AND `sale_id`<>'0') meaningful, COUNT(DISTINCT `sale_id`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sale_name' c, COUNT(*) total, SUM(`sale_name` IS NOT NULL) notnull, SUM(`sale_name` IS NOT NULL AND `sale_name`<>'' AND `sale_name`<>'0') meaningful, COUNT(DISTINCT `sale_name`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'service_id' c, COUNT(*) total, SUM(`service_id` IS NOT NULL) notnull, SUM(`service_id` IS NOT NULL AND `service_id`<>'' AND `service_id`<>'0') meaningful, COUNT(DISTINCT `service_id`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'service_name' c, COUNT(*) total, SUM(`service_name` IS NOT NULL) notnull, SUM(`service_name` IS NOT NULL AND `service_name`<>'' AND `service_name`<>'0') meaningful, COUNT(DISTINCT `service_name`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'status' c, COUNT(*) total, SUM(`status` IS NOT NULL) notnull, SUM(`status` IS NOT NULL AND `status`<>'' AND `status`<>'0') meaningful, COUNT(DISTINCT `status`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'remark' c, COUNT(*) total, SUM(`remark` IS NOT NULL) notnull, SUM(`remark` IS NOT NULL AND `remark`<>'' AND `remark`<>'0') meaningful, COUNT(DISTINCT `remark`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'revision' c, COUNT(*) total, SUM(`revision` IS NOT NULL) notnull, SUM(`revision` IS NOT NULL AND `revision`<>'' AND `revision`<>'0') meaningful, COUNT(DISTINCT `revision`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'create_by' c, COUNT(*) total, SUM(`create_by` IS NOT NULL) notnull, SUM(`create_by` IS NOT NULL AND `create_by`<>'' AND `create_by`<>'0') meaningful, COUNT(DISTINCT `create_by`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'create_time' c, COUNT(*) total, SUM(`create_time` IS NOT NULL) notnull, SUM(`create_time` IS NOT NULL AND `create_time`<>'' AND `create_time`<>'0') meaningful, COUNT(DISTINCT `create_time`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'update_by' c, COUNT(*) total, SUM(`update_by` IS NOT NULL) notnull, SUM(`update_by` IS NOT NULL AND `update_by`<>'' AND `update_by`<>'0') meaningful, COUNT(DISTINCT `update_by`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'update_time' c, COUNT(*) total, SUM(`update_time` IS NOT NULL) notnull, SUM(`update_time` IS NOT NULL AND `update_time`<>'' AND `update_time`<>'0') meaningful, COUNT(DISTINCT `update_time`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'del_flag' c, COUNT(*) total, SUM(`del_flag` IS NOT NULL) notnull, SUM(`del_flag` IS NOT NULL AND `del_flag`<>'' AND `del_flag`<>'0') meaningful, COUNT(DISTINCT `del_flag`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'payer' c, COUNT(*) total, SUM(`payer` IS NOT NULL) notnull, SUM(`payer` IS NOT NULL AND `payer`<>'' AND `payer`<>'0') meaningful, COUNT(DISTINCT `payer`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'service_balance' c, COUNT(*) total, SUM(`service_balance` IS NOT NULL) notnull, SUM(`service_balance` IS NOT NULL AND `service_balance`<>'' AND `service_balance`<>'0') meaningful, COUNT(DISTINCT `service_balance`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'service_point' c, COUNT(*) total, SUM(`service_point` IS NOT NULL) notnull, SUM(`service_point` IS NOT NULL AND `service_point`<>'' AND `service_point`<>'0') meaningful, COUNT(DISTINCT `service_point`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'is_sea' c, COUNT(*) total, SUM(`is_sea` IS NOT NULL) notnull, SUM(`is_sea` IS NOT NULL AND `is_sea`<>'' AND `is_sea`<>'0') meaningful, COUNT(DISTINCT `is_sea`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_type' c, COUNT(*) total, SUM(`sea_type` IS NOT NULL) notnull, SUM(`sea_type` IS NOT NULL AND `sea_type`<>'' AND `sea_type`<>'0') meaningful, COUNT(DISTINCT `sea_type`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_region' c, COUNT(*) total, SUM(`sea_region` IS NOT NULL) notnull, SUM(`sea_region` IS NOT NULL AND `sea_region`<>'' AND `sea_region`<>'0') meaningful, COUNT(DISTINCT `sea_region`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_account_no' c, COUNT(*) total, SUM(`sea_account_no` IS NOT NULL) notnull, SUM(`sea_account_no` IS NOT NULL AND `sea_account_no`<>'' AND `sea_account_no`<>'0') meaningful, COUNT(DISTINCT `sea_account_no`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_account_nickname' c, COUNT(*) total, SUM(`sea_account_nickname` IS NOT NULL) notnull, SUM(`sea_account_nickname` IS NOT NULL AND `sea_account_nickname`<>'' AND `sea_account_nickname`<>'0') meaningful, COUNT(DISTINCT `sea_account_nickname`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_subject_name' c, COUNT(*) total, SUM(`sea_subject_name` IS NOT NULL) notnull, SUM(`sea_subject_name` IS NOT NULL AND `sea_subject_name`<>'' AND `sea_subject_name`<>'0') meaningful, COUNT(DISTINCT `sea_subject_name`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_legal_person' c, COUNT(*) total, SUM(`sea_legal_person` IS NOT NULL) notnull, SUM(`sea_legal_person` IS NOT NULL AND `sea_legal_person`<>'' AND `sea_legal_person`<>'0') meaningful, COUNT(DISTINCT `sea_legal_person`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_industry' c, COUNT(*) total, SUM(`sea_industry` IS NOT NULL) notnull, SUM(`sea_industry` IS NOT NULL AND `sea_industry`<>'' AND `sea_industry`<>'0') meaningful, COUNT(DISTINCT `sea_industry`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_category' c, COUNT(*) total, SUM(`sea_category` IS NOT NULL) notnull, SUM(`sea_category` IS NOT NULL AND `sea_category`<>'' AND `sea_category`<>'0') meaningful, COUNT(DISTINCT `sea_category`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_product' c, COUNT(*) total, SUM(`sea_product` IS NOT NULL) notnull, SUM(`sea_product` IS NOT NULL AND `sea_product`<>'' AND `sea_product`<>'0') meaningful, COUNT(DISTINCT `sea_product`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_store_sales' c, COUNT(*) total, SUM(`sea_store_sales` IS NOT NULL) notnull, SUM(`sea_store_sales` IS NOT NULL AND `sea_store_sales`<>'' AND `sea_store_sales`<>'0') meaningful, COUNT(DISTINCT `sea_store_sales`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_numoffans' c, COUNT(*) total, SUM(`sea_numoffans` IS NOT NULL) notnull, SUM(`sea_numoffans` IS NOT NULL AND `sea_numoffans`<>'' AND `sea_numoffans`<>'0') meaningful, COUNT(DISTINCT `sea_numoffans`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_wechat_name' c, COUNT(*) total, SUM(`sea_wechat_name` IS NOT NULL) notnull, SUM(`sea_wechat_name` IS NOT NULL AND `sea_wechat_name`<>'' AND `sea_wechat_name`<>'0') meaningful, COUNT(DISTINCT `sea_wechat_name`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_license_name' c, COUNT(*) total, SUM(`sea_license_name` IS NOT NULL) notnull, SUM(`sea_license_name` IS NOT NULL AND `sea_license_name`<>'' AND `sea_license_name`<>'0') meaningful, COUNT(DISTINCT `sea_license_name`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_license_tel' c, COUNT(*) total, SUM(`sea_license_tel` IS NOT NULL) notnull, SUM(`sea_license_tel` IS NOT NULL AND `sea_license_tel`<>'' AND `sea_license_tel`<>'0') meaningful, COUNT(DISTINCT `sea_license_tel`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_other_contact' c, COUNT(*) total, SUM(`sea_other_contact` IS NOT NULL) notnull, SUM(`sea_other_contact` IS NOT NULL AND `sea_other_contact`<>'' AND `sea_other_contact`<>'0') meaningful, COUNT(DISTINCT `sea_other_contact`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_remarks' c, COUNT(*) total, SUM(`sea_remarks` IS NOT NULL) notnull, SUM(`sea_remarks` IS NOT NULL AND `sea_remarks`<>'' AND `sea_remarks`<>'0') meaningful, COUNT(DISTINCT `sea_remarks`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_add_time' c, COUNT(*) total, SUM(`sea_add_time` IS NOT NULL) notnull, SUM(`sea_add_time` IS NOT NULL AND `sea_add_time`<>'' AND `sea_add_time`<>'0') meaningful, COUNT(DISTINCT `sea_add_time`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'sea_live_mode' c, COUNT(*) total, SUM(`sea_live_mode` IS NOT NULL) notnull, SUM(`sea_live_mode` IS NOT NULL AND `sea_live_mode`<>'' AND `sea_live_mode`<>'0') meaningful, COUNT(DISTINCT `sea_live_mode`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'customer_status' c, COUNT(*) total, SUM(`customer_status` IS NOT NULL) notnull, SUM(`customer_status` IS NOT NULL AND `customer_status`<>'' AND `customer_status`<>'0') meaningful, COUNT(DISTINCT `customer_status`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'updatestatus_time' c, COUNT(*) total, SUM(`updatestatus_time` IS NOT NULL) notnull, SUM(`updatestatus_time` IS NOT NULL AND `updatestatus_time`<>'' AND `updatestatus_time`<>'0') meaningful, COUNT(DISTINCT `updatestatus_time`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'first_cooperation_time' c, COUNT(*) total, SUM(`first_cooperation_time` IS NOT NULL) notnull, SUM(`first_cooperation_time` IS NOT NULL AND `first_cooperation_time`<>'' AND `first_cooperation_time`<>'0') meaningful, COUNT(DISTINCT `first_cooperation_time`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'new_orderfirst_pay' c, COUNT(*) total, SUM(`new_orderfirst_pay` IS NOT NULL) notnull, SUM(`new_orderfirst_pay` IS NOT NULL AND `new_orderfirst_pay`<>'' AND `new_orderfirst_pay`<>'0') meaningful, COUNT(DISTINCT `new_orderfirst_pay`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'new_orderfirst_consume' c, COUNT(*) total, SUM(`new_orderfirst_consume` IS NOT NULL) notnull, SUM(`new_orderfirst_consume` IS NOT NULL AND `new_orderfirst_consume`<>'' AND `new_orderfirst_consume`<>'0') meaningful, COUNT(DISTINCT `new_orderfirst_consume`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'last_return_time' c, COUNT(*) total, SUM(`last_return_time` IS NOT NULL) notnull, SUM(`last_return_time` IS NOT NULL AND `last_return_time`<>'' AND `last_return_time`<>'0') meaningful, COUNT(DISTINCT `last_return_time`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'return_type' c, COUNT(*) total, SUM(`return_type` IS NOT NULL) notnull, SUM(`return_type` IS NOT NULL AND `return_type`<>'' AND `return_type`<>'0') meaningful, COUNT(DISTINCT `return_type`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'return_value' c, COUNT(*) total, SUM(`return_value` IS NOT NULL) notnull, SUM(`return_value` IS NOT NULL AND `return_value`<>'' AND `return_value`<>'0') meaningful, COUNT(DISTINCT `return_value`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'return_money' c, COUNT(*) total, SUM(`return_money` IS NOT NULL) notnull, SUM(`return_money` IS NOT NULL AND `return_money`<>'' AND `return_money`<>'0') meaningful, COUNT(DISTINCT `return_money`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'next_return_time' c, COUNT(*) total, SUM(`next_return_time` IS NOT NULL) notnull, SUM(`next_return_time` IS NOT NULL AND `next_return_time`<>'' AND `next_return_time`<>'0') meaningful, COUNT(DISTINCT `next_return_time`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'is_brand' c, COUNT(*) total, SUM(`is_brand` IS NOT NULL) notnull, SUM(`is_brand` IS NOT NULL AND `is_brand`<>'' AND `is_brand`<>'0') meaningful, COUNT(DISTINCT `is_brand`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'account_infojson' c, COUNT(*) total, SUM(`account_infojson` IS NOT NULL) notnull, SUM(`account_infojson` IS NOT NULL AND `account_infojson`<>'' AND `account_infojson`<>'0') meaningful, COUNT(DISTINCT `account_infojson`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'temp_credit_money' c, COUNT(*) total, SUM(`temp_credit_money` IS NOT NULL) notnull, SUM(`temp_credit_money` IS NOT NULL AND `temp_credit_money`<>'' AND `temp_credit_money`<>'0') meaningful, COUNT(DISTINCT `temp_credit_money`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'trans_ratio' c, COUNT(*) total, SUM(`trans_ratio` IS NOT NULL) notnull, SUM(`trans_ratio` IS NOT NULL AND `trans_ratio`<>'' AND `trans_ratio`<>'0') meaningful, COUNT(DISTINCT `trans_ratio`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'consume_prev' c, COUNT(*) total, SUM(`consume_prev` IS NOT NULL) notnull, SUM(`consume_prev` IS NOT NULL AND `consume_prev`<>'' AND `consume_prev`<>'0') meaningful, COUNT(DISTINCT `consume_prev`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'consume_current' c, COUNT(*) total, SUM(`consume_current` IS NOT NULL) notnull, SUM(`consume_current` IS NOT NULL AND `consume_current`<>'' AND `consume_current`<>'0') meaningful, COUNT(DISTINCT `consume_current`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'consume' c, COUNT(*) total, SUM(`consume` IS NOT NULL) notnull, SUM(`consume` IS NOT NULL AND `consume`<>'' AND `consume`<>'0') meaningful, COUNT(DISTINCT `consume`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'cycle_return_time' c, COUNT(*) total, SUM(`cycle_return_time` IS NOT NULL) notnull, SUM(`cycle_return_time` IS NOT NULL AND `cycle_return_time`<>'' AND `cycle_return_time`<>'0') meaningful, COUNT(DISTINCT `cycle_return_time`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'after_ratio' c, COUNT(*) total, SUM(`after_ratio` IS NOT NULL) notnull, SUM(`after_ratio` IS NOT NULL AND `after_ratio`<>'' AND `after_ratio`<>'0') meaningful, COUNT(DISTINCT `after_ratio`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'after_currency' c, COUNT(*) total, SUM(`after_currency` IS NOT NULL) notnull, SUM(`after_currency` IS NOT NULL AND `after_currency`<>'' AND `after_currency`<>'0') meaningful, COUNT(DISTINCT `after_currency`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'wallet_status' c, COUNT(*) total, SUM(`wallet_status` IS NOT NULL) notnull, SUM(`wallet_status` IS NOT NULL AND `wallet_status`<>'' AND `wallet_status`<>'0') meaningful, COUNT(DISTINCT `wallet_status`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'monetary_credit' c, COUNT(*) total, SUM(`monetary_credit` IS NOT NULL) notnull, SUM(`monetary_credit` IS NOT NULL AND `monetary_credit`<>'' AND `monetary_credit`<>'0') meaningful, COUNT(DISTINCT `monetary_credit`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'monetary_credituse' c, COUNT(*) total, SUM(`monetary_credituse` IS NOT NULL) notnull, SUM(`monetary_credituse` IS NOT NULL AND `monetary_credituse`<>'' AND `monetary_credituse`<>'0') meaningful, COUNT(DISTINCT `monetary_credituse`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'credit_datatype' c, COUNT(*) total, SUM(`credit_datatype` IS NOT NULL) notnull, SUM(`credit_datatype` IS NOT NULL AND `credit_datatype`<>'' AND `credit_datatype`<>'0') meaningful, COUNT(DISTINCT `credit_datatype`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'account_num' c, COUNT(*) total, SUM(`account_num` IS NOT NULL) notnull, SUM(`account_num` IS NOT NULL AND `account_num`<>'' AND `account_num`<>'0') meaningful, COUNT(DISTINCT `account_num`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer' t, 'credit_limit_type' c, COUNT(*) total, SUM(`credit_limit_type` IS NOT NULL) notnull, SUM(`credit_limit_type` IS NOT NULL AND `credit_limit_type`<>'' AND `credit_limit_type`<>'0') meaningful, COUNT(DISTINCT `credit_limit_type`) distinct_n FROM dig_customer WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'id' c, COUNT(*) total, SUM(`id` IS NOT NULL) notnull, SUM(`id` IS NOT NULL AND `id`<>'' AND `id`<>'0') meaningful, COUNT(DISTINCT `id`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'customer_id' c, COUNT(*) total, SUM(`customer_id` IS NOT NULL) notnull, SUM(`customer_id` IS NOT NULL AND `customer_id`<>'' AND `customer_id`<>'0') meaningful, COUNT(DISTINCT `customer_id`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'subject_id' c, COUNT(*) total, SUM(`subject_id` IS NOT NULL) notnull, SUM(`subject_id` IS NOT NULL AND `subject_id`<>'' AND `subject_id`<>'0') meaningful, COUNT(DISTINCT `subject_id`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'shop_name' c, COUNT(*) total, SUM(`shop_name` IS NOT NULL) notnull, SUM(`shop_name` IS NOT NULL AND `shop_name`<>'' AND `shop_name`<>'0') meaningful, COUNT(DISTINCT `shop_name`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'shop_no' c, COUNT(*) total, SUM(`shop_no` IS NOT NULL) notnull, SUM(`shop_no` IS NOT NULL AND `shop_no`<>'' AND `shop_no`<>'0') meaningful, COUNT(DISTINCT `shop_no`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'serveice_id' c, COUNT(*) total, SUM(`serveice_id` IS NOT NULL) notnull, SUM(`serveice_id` IS NOT NULL AND `serveice_id`<>'' AND `serveice_id`<>'0') meaningful, COUNT(DISTINCT `serveice_id`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'service_name' c, COUNT(*) total, SUM(`service_name` IS NOT NULL) notnull, SUM(`service_name` IS NOT NULL AND `service_name`<>'' AND `service_name`<>'0') meaningful, COUNT(DISTINCT `service_name`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'sale_id' c, COUNT(*) total, SUM(`sale_id` IS NOT NULL) notnull, SUM(`sale_id` IS NOT NULL AND `sale_id`<>'' AND `sale_id`<>'0') meaningful, COUNT(DISTINCT `sale_id`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'sale_name' c, COUNT(*) total, SUM(`sale_name` IS NOT NULL) notnull, SUM(`sale_name` IS NOT NULL AND `sale_name`<>'' AND `sale_name`<>'0') meaningful, COUNT(DISTINCT `sale_name`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'remark' c, COUNT(*) total, SUM(`remark` IS NOT NULL) notnull, SUM(`remark` IS NOT NULL AND `remark`<>'' AND `remark`<>'0') meaningful, COUNT(DISTINCT `remark`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'revision' c, COUNT(*) total, SUM(`revision` IS NOT NULL) notnull, SUM(`revision` IS NOT NULL AND `revision`<>'' AND `revision`<>'0') meaningful, COUNT(DISTINCT `revision`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'create_by' c, COUNT(*) total, SUM(`create_by` IS NOT NULL) notnull, SUM(`create_by` IS NOT NULL AND `create_by`<>'' AND `create_by`<>'0') meaningful, COUNT(DISTINCT `create_by`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'create_time' c, COUNT(*) total, SUM(`create_time` IS NOT NULL) notnull, SUM(`create_time` IS NOT NULL AND `create_time`<>'' AND `create_time`<>'0') meaningful, COUNT(DISTINCT `create_time`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'update_by' c, COUNT(*) total, SUM(`update_by` IS NOT NULL) notnull, SUM(`update_by` IS NOT NULL AND `update_by`<>'' AND `update_by`<>'0') meaningful, COUNT(DISTINCT `update_by`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'update_time' c, COUNT(*) total, SUM(`update_time` IS NOT NULL) notnull, SUM(`update_time` IS NOT NULL AND `update_time`<>'' AND `update_time`<>'0') meaningful, COUNT(DISTINCT `update_time`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'del_flag' c, COUNT(*) total, SUM(`del_flag` IS NOT NULL) notnull, SUM(`del_flag` IS NOT NULL AND `del_flag`<>'' AND `del_flag`<>'0') meaningful, COUNT(DISTINCT `del_flag`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'ks_agentId' c, COUNT(*) total, SUM(`ks_agentId` IS NOT NULL) notnull, SUM(`ks_agentId` IS NOT NULL AND `ks_agentId`<>'' AND `ks_agentId`<>'0') meaningful, COUNT(DISTINCT `ks_agentId`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'supplier_id' c, COUNT(*) total, SUM(`supplier_id` IS NOT NULL) notnull, SUM(`supplier_id` IS NOT NULL AND `supplier_id`<>'' AND `supplier_id`<>'0') meaningful, COUNT(DISTINCT `supplier_id`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_shop' t, 'account_infojson' c, COUNT(*) total, SUM(`account_infojson` IS NOT NULL) notnull, SUM(`account_infojson` IS NOT NULL AND `account_infojson`<>'' AND `account_infojson`<>'0') meaningful, COUNT(DISTINCT `account_infojson`) distinct_n FROM dig_shop WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'id' c, COUNT(*) total, SUM(`id` IS NOT NULL) notnull, SUM(`id` IS NOT NULL AND `id`<>'' AND `id`<>'0') meaningful, COUNT(DISTINCT `id`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'customer_id' c, COUNT(*) total, SUM(`customer_id` IS NOT NULL) notnull, SUM(`customer_id` IS NOT NULL AND `customer_id`<>'' AND `customer_id`<>'0') meaningful, COUNT(DISTINCT `customer_id`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'contact_name' c, COUNT(*) total, SUM(`contact_name` IS NOT NULL) notnull, SUM(`contact_name` IS NOT NULL AND `contact_name`<>'' AND `contact_name`<>'0') meaningful, COUNT(DISTINCT `contact_name`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'contact_tel' c, COUNT(*) total, SUM(`contact_tel` IS NOT NULL) notnull, SUM(`contact_tel` IS NOT NULL AND `contact_tel`<>'' AND `contact_tel`<>'0') meaningful, COUNT(DISTINCT `contact_tel`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'subject_name' c, COUNT(*) total, SUM(`subject_name` IS NOT NULL) notnull, SUM(`subject_name` IS NOT NULL AND `subject_name`<>'' AND `subject_name`<>'0') meaningful, COUNT(DISTINCT `subject_name`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'create_by' c, COUNT(*) total, SUM(`create_by` IS NOT NULL) notnull, SUM(`create_by` IS NOT NULL AND `create_by`<>'' AND `create_by`<>'0') meaningful, COUNT(DISTINCT `create_by`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'create_time' c, COUNT(*) total, SUM(`create_time` IS NOT NULL) notnull, SUM(`create_time` IS NOT NULL AND `create_time`<>'' AND `create_time`<>'0') meaningful, COUNT(DISTINCT `create_time`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'update_by' c, COUNT(*) total, SUM(`update_by` IS NOT NULL) notnull, SUM(`update_by` IS NOT NULL AND `update_by`<>'' AND `update_by`<>'0') meaningful, COUNT(DISTINCT `update_by`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'update_time' c, COUNT(*) total, SUM(`update_time` IS NOT NULL) notnull, SUM(`update_time` IS NOT NULL AND `update_time`<>'' AND `update_time`<>'0') meaningful, COUNT(DISTINCT `update_time`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'remark' c, COUNT(*) total, SUM(`remark` IS NOT NULL) notnull, SUM(`remark` IS NOT NULL AND `remark`<>'' AND `remark`<>'0') meaningful, COUNT(DISTINCT `remark`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'del_flag' c, COUNT(*) total, SUM(`del_flag` IS NOT NULL) notnull, SUM(`del_flag` IS NOT NULL AND `del_flag`<>'' AND `del_flag`<>'0') meaningful, COUNT(DISTINCT `del_flag`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'supplier_id' c, COUNT(*) total, SUM(`supplier_id` IS NOT NULL) notnull, SUM(`supplier_id` IS NOT NULL AND `supplier_id`<>'' AND `supplier_id`<>'0') meaningful, COUNT(DISTINCT `supplier_id`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'account_infojson' c, COUNT(*) total, SUM(`account_infojson` IS NOT NULL) notnull, SUM(`account_infojson` IS NOT NULL AND `account_infojson`<>'' AND `account_infojson`<>'0') meaningful, COUNT(DISTINCT `account_infojson`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'ks_agentId' c, COUNT(*) total, SUM(`ks_agentId` IS NOT NULL) notnull, SUM(`ks_agentId` IS NOT NULL AND `ks_agentId`<>'' AND `ks_agentId`<>'0') meaningful, COUNT(DISTINCT `ks_agentId`) distinct_n FROM dig_customer_subject WHERE del_flag='0'
UNION ALL
SELECT 'dig_customer_subject' t, 'isapi' c, COUNT(*) total, SUM(`isapi` IS NOT NULL) notnull, SUM(`isapi` IS NOT NULL AND `isapi`<>'' AND `isapi`<>'0') meaningful, COUNT(DISTINCT `isapi`) distinct_n FROM dig_customer_subject WHERE del_flag='0';
