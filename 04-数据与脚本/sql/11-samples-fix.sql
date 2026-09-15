CREATE TEMPORARY TABLE tmp_oc AS SELECT account_id, MAX(consume_date) last_date, COUNT(*) n FROM dig_other_account_consume GROUP BY account_id;
CREATE TEMPORARY TABLE tmp_rc AS SELECT adveraccount_id, COUNT(*) n FROM dig_adveracoount_recharge GROUP BY adveraccount_id;
SET @s2 = (SELECT a2.id FROM dig_advertising_account a2 JOIN dig_customer c2 ON c2.id=a2.customer_id JOIN dig_customer_tag t2 ON t2.customer_id=c2.id AND t2.tag_name='直客' JOIN tmp_oc o ON o.account_id=a2.id JOIN tmp_rc r ON r.adveraccount_id=a2.id WHERE a2.del_flag='0' AND a2.type=1001 AND c2.customer_name NOT LIKE '%测试%' ORDER BY o.last_date DESC, a2.id LIMIT 1);
SET @s4 = (SELECT a2.id FROM dig_advertising_account a2 JOIN dig_customer c2 ON c2.id=a2.customer_id JOIN dig_customer_tag t2 ON t2.customer_id=c2.id AND t2.tag_name='渠道' JOIN tmp_oc o ON o.account_id=a2.id LEFT JOIN tmp_rc r ON r.adveraccount_id=a2.id WHERE a2.del_flag='0' AND a2.type=1001 ORDER BY (r.n IS NOT NULL) DESC, o.last_date DESC, a2.id LIMIT 1);
SELECT '## PICK' AS _; SELECT @s2 s2, @s4 s4;
SELECT '## SAMPLES' AS _;SELECT 'S2 直客·本地推·外转(1001)' AS sample,
 c.id c_id, c.customer_name, c.types c_types, (SELECT GROUP_CONCAT(tag_name) FROM dig_customer_tag t WHERE t.customer_id=c.id) c_tags,
 (SELECT GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '+') FROM sys_user_role ur JOIN sys_role r ON r.role_id=ur.role_id WHERE ur.user_id=c.sale_id) c_owner_role,
 c.before_ratio c_before, c.after_ratio c_after, c.credit_money, c.credit_usemoney, c.balance c_balance, c.wallet_status, c.credit_limit_type, c.account_num,
 IF(c.contact_name IS NULL OR c.contact_name='','无','有') c_contact, IF(c.tel IS NULL OR c.tel='','无','有') c_tel,
 cs.id s_id, cs.subject_name, (SELECT supplier_name FROM dig_supplier WHERE id=cs.supplier_id) s_supplier, cs.isapi s_isapi, cs.account_infojson s_accinfo,
 sh.id shop_id, sh.shop_name, sh.shop_no, CHAR_LENGTH(sh.shop_no) shop_no_len,
 a.id a_id, a.account_no, a.account_name, a.type a_type, (SELECT dict_label FROM sys_dict_data WHERE dict_type='ks_account_type' AND dict_value=a.type LIMIT 1) a_type_label, a.customer_type a_ctype, a.data_type a_datatype, a.currencymoney a_currency, a.consume a_consume, a.primary_industry, a.secondary_industry, a.remark a_source, DATE(a.create_time) a_created,
 sp.supplier_name, sp.suppliertype, sp.dy_agentId sp_dyagent, (SELECT agent_id FROM dig_dy_developinfo d WHERE d.id=sp.dy_agentId) own_agent_id,
 r.source r_source, r.cash_recharge, r.currency_recharge, r.before_ratio r_before, r.credit_pay, r.cash_pay, r.approval_state r_state, r.sync_state r_sync, r.wallet_key r_wallet, DATE(r.create_time) r_time,
 dc.consume_date dc_date, dc.actual_spend dc_spend, dc.business_type_name dc_biz, dc.account_reporting_tag dc_tag, dc.agent_name dc_agent,
 oc.consume_date oc_date, oc.cost oc_cost, oc.agent_name oc_agent
FROM dig_advertising_account a JOIN dig_customer c ON c.id=a.customer_id JOIN dig_customer_subject cs ON cs.id=a.subject_id
LEFT JOIN dig_shop sh ON sh.id=a.shop_id LEFT JOIN dig_supplier sp ON sp.id=a.supplier_id
LEFT JOIN dig_adveracoount_recharge r ON r.id=(SELECT r2.id FROM dig_adveracoount_recharge r2 WHERE r2.adveraccount_id=a.id ORDER BY r2.create_time DESC LIMIT 1)
LEFT JOIN dig_douyin_account_consume dc ON dc.id=(SELECT d2.id FROM dig_douyin_account_consume d2 WHERE d2.account_id=a.id ORDER BY d2.consume_date DESC LIMIT 1)
LEFT JOIN dig_other_account_consume oc ON oc.id=(SELECT o2.id FROM dig_other_account_consume o2 WHERE o2.account_id=a.id ORDER BY o2.consume_date DESC LIMIT 1)
WHERE a.id = @s2
UNION ALL
SELECT 'S4 渠道·本地推·外转(1001)' AS sample,
 c.id c_id, c.customer_name, c.types c_types, (SELECT GROUP_CONCAT(tag_name) FROM dig_customer_tag t WHERE t.customer_id=c.id) c_tags,
 (SELECT GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '+') FROM sys_user_role ur JOIN sys_role r ON r.role_id=ur.role_id WHERE ur.user_id=c.sale_id) c_owner_role,
 c.before_ratio c_before, c.after_ratio c_after, c.credit_money, c.credit_usemoney, c.balance c_balance, c.wallet_status, c.credit_limit_type, c.account_num,
 IF(c.contact_name IS NULL OR c.contact_name='','无','有') c_contact, IF(c.tel IS NULL OR c.tel='','无','有') c_tel,
 cs.id s_id, cs.subject_name, (SELECT supplier_name FROM dig_supplier WHERE id=cs.supplier_id) s_supplier, cs.isapi s_isapi, cs.account_infojson s_accinfo,
 sh.id shop_id, sh.shop_name, sh.shop_no, CHAR_LENGTH(sh.shop_no) shop_no_len,
 a.id a_id, a.account_no, a.account_name, a.type a_type, (SELECT dict_label FROM sys_dict_data WHERE dict_type='ks_account_type' AND dict_value=a.type LIMIT 1) a_type_label, a.customer_type a_ctype, a.data_type a_datatype, a.currencymoney a_currency, a.consume a_consume, a.primary_industry, a.secondary_industry, a.remark a_source, DATE(a.create_time) a_created,
 sp.supplier_name, sp.suppliertype, sp.dy_agentId sp_dyagent, (SELECT agent_id FROM dig_dy_developinfo d WHERE d.id=sp.dy_agentId) own_agent_id,
 r.source r_source, r.cash_recharge, r.currency_recharge, r.before_ratio r_before, r.credit_pay, r.cash_pay, r.approval_state r_state, r.sync_state r_sync, r.wallet_key r_wallet, DATE(r.create_time) r_time,
 dc.consume_date dc_date, dc.actual_spend dc_spend, dc.business_type_name dc_biz, dc.account_reporting_tag dc_tag, dc.agent_name dc_agent,
 oc.consume_date oc_date, oc.cost oc_cost, oc.agent_name oc_agent
FROM dig_advertising_account a JOIN dig_customer c ON c.id=a.customer_id JOIN dig_customer_subject cs ON cs.id=a.subject_id
LEFT JOIN dig_shop sh ON sh.id=a.shop_id LEFT JOIN dig_supplier sp ON sp.id=a.supplier_id
LEFT JOIN dig_adveracoount_recharge r ON r.id=(SELECT r2.id FROM dig_adveracoount_recharge r2 WHERE r2.adveraccount_id=a.id ORDER BY r2.create_time DESC LIMIT 1)
LEFT JOIN dig_douyin_account_consume dc ON dc.id=(SELECT d2.id FROM dig_douyin_account_consume d2 WHERE d2.account_id=a.id ORDER BY d2.consume_date DESC LIMIT 1)
LEFT JOIN dig_other_account_consume oc ON oc.id=(SELECT o2.id FROM dig_other_account_consume o2 WHERE o2.account_id=a.id ORDER BY o2.consume_date DESC LIMIT 1)
WHERE a.id = @s4;
