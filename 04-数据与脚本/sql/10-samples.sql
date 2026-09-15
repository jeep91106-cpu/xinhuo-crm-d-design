SELECT '## Q1 主体的业务类型组合（按其账户 type）' AS _;
SELECT CONCAT(IF(has_local,'本地推 ',''), IF(has_ad,'巨量AD ',''), IF(has_tx,'腾讯 ',''), IF(has_ks,'快手','')) combo, COUNT(*) subjects, SUM(accounts) accounts FROM (SELECT cs.id, MAX(a.type IN (102,1001)) has_local, MAX(a.type IN (100,1004)) has_ad, MAX(a.type=1002) has_tx, MAX(a.type=1003) has_ks, COUNT(*) accounts FROM dig_customer_subject cs JOIN dig_advertising_account a ON a.subject_id=cs.id AND a.del_flag='0' WHERE cs.del_flag='0' GROUP BY cs.id) t GROUP BY combo ORDER BY subjects DESC;
SELECT '## Q1b 同名主体合并后（同一公司名跨记录）的业务类型组合' AS _;
SELECT CONCAT(IF(has_local,'本地推 ',''), IF(has_ad,'巨量AD ',''), IF(has_tx,'腾讯 ',''), IF(has_ks,'快手','')) combo, COUNT(*) company_names FROM (SELECT cs.subject_name, MAX(a.type IN (102,1001)) has_local, MAX(a.type IN (100,1004)) has_ad, MAX(a.type=1002) has_tx, MAX(a.type=1003) has_ks FROM dig_customer_subject cs JOIN dig_advertising_account a ON a.subject_id=cs.id AND a.del_flag='0' WHERE cs.del_flag='0' GROUP BY cs.subject_name) t GROUP BY combo ORDER BY company_names DESC;
SELECT '## Q1c 客户层的业务类型组合' AS _;
SELECT CONCAT(IF(has_local,'本地推 ',''), IF(has_ad,'巨量AD ',''), IF(has_tx,'腾讯 ',''), IF(has_ks,'快手','')) combo, COUNT(*) customers FROM (SELECT c.id, MAX(a.type IN (102,1001)) has_local, MAX(a.type IN (100,1004)) has_ad, MAX(a.type=1002) has_tx, MAX(a.type=1003) has_ks FROM dig_customer c JOIN dig_advertising_account a ON a.customer_id=c.id AND a.del_flag='0' WHERE c.del_flag='0' GROUP BY c.id) t GROUP BY combo ORDER BY customers DESC;
SELECT '## Q3 客户标签 x 归属人(sale_id)的角色' AS _;
SELECT t.tag_name, COALESCE((SELECT GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.role_name SEPARATOR '+') FROM sys_user_role ur JOIN sys_role r ON r.role_id=ur.role_id WHERE ur.user_id=c.sale_id),'(空)') owner_roles, COUNT(DISTINCT c.id) customers, SUM(c.account_num) accounts FROM dig_customer c JOIN dig_customer_tag t ON t.customer_id=c.id AND t.tag_name IN ('直客','渠道') WHERE c.del_flag='0' GROUP BY t.tag_name, owner_roles ORDER BY t.tag_name, customers DESC;
SELECT '## Q3b 渠道客户：归属人数 / 关联服务人员数' AS _;
SELECT COUNT(DISTINCT c.id) channel_customers, COUNT(DISTINCT c.sale_id) distinct_owners, (SELECT COUNT(*) FROM dig_customer_refuser ru JOIN dig_customer_tag t2 ON t2.customer_id=ru.customer_id AND t2.tag_name='渠道') refuser_links FROM dig_customer c JOIN dig_customer_tag t ON t.customer_id=c.id AND t.tag_name='渠道' WHERE c.del_flag='0';
SELECT '## Q3c 未打 直客/渠道 标签的客户：归属角色' AS _;
SELECT COALESCE((SELECT GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.role_name SEPARATOR '+') FROM sys_user_role ur JOIN sys_role r ON r.role_id=ur.role_id WHERE ur.user_id=c.sale_id),'(空)') owner_roles, COUNT(*) customers FROM dig_customer c WHERE c.del_flag='0' AND NOT EXISTS (SELECT 1 FROM dig_customer_tag t WHERE t.customer_id=c.id AND t.tag_name IN ('直客','渠道')) GROUP BY owner_roles ORDER BY customers DESC;
SELECT '## SAMPLES' AS _;
SELECT 'S1 直客·本地推·自有端口(102)' AS sample,
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
WHERE a.id = (SELECT a2.id FROM dig_advertising_account a2 JOIN dig_customer c2 ON c2.id=a2.customer_id LEFT JOIN dig_customer_tag t2 ON t2.customer_id=c2.id AND t2.tag_name='直客' WHERE a2.del_flag='0' AND a2.type=102  ORDER BY (t2.id IS NOT NULL) DESC, EXISTS(SELECT 1 FROM dig_adveracoount_recharge r3 WHERE r3.adveraccount_id=a2.id) DESC, a2.consume DESC, a2.id LIMIT 1)
UNION ALL
SELECT 'S2 直客·本地推·外转(1001)' AS sample,
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
WHERE a.id = (SELECT a2.id FROM dig_advertising_account a2 JOIN dig_customer c2 ON c2.id=a2.customer_id LEFT JOIN dig_customer_tag t2 ON t2.customer_id=c2.id AND t2.tag_name='直客' WHERE a2.del_flag='0' AND a2.type=1001  ORDER BY (t2.id IS NOT NULL) DESC, EXISTS(SELECT 1 FROM dig_adveracoount_recharge r3 WHERE r3.adveraccount_id=a2.id) DESC, a2.consume DESC, a2.id LIMIT 1)
UNION ALL
SELECT 'S3 巨量AD·自有端口(100)' AS sample,
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
WHERE a.id = (SELECT a2.id FROM dig_advertising_account a2 JOIN dig_customer c2 ON c2.id=a2.customer_id LEFT JOIN dig_customer_tag t2 ON t2.customer_id=c2.id AND t2.tag_name='直客' WHERE a2.del_flag='0' AND a2.type=100  ORDER BY (t2.id IS NOT NULL) DESC, EXISTS(SELECT 1 FROM dig_adveracoount_recharge r3 WHERE r3.adveraccount_id=a2.id) DESC, a2.consume DESC, a2.id LIMIT 1)
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
WHERE a.id = (SELECT a2.id FROM dig_advertising_account a2 JOIN dig_customer c2 ON c2.id=a2.customer_id LEFT JOIN dig_customer_tag t2 ON t2.customer_id=c2.id AND t2.tag_name='渠道' WHERE a2.del_flag='0' AND a2.type=1001 AND t2.id IS NOT NULL ORDER BY (t2.id IS NOT NULL) DESC, EXISTS(SELECT 1 FROM dig_adveracoount_recharge r3 WHERE r3.adveraccount_id=a2.id) DESC, a2.consume DESC, a2.id LIMIT 1)
UNION ALL
SELECT 'S5 渠道·巨量AD·外转(1004)' AS sample,
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
WHERE a.id = (SELECT a2.id FROM dig_advertising_account a2 JOIN dig_customer c2 ON c2.id=a2.customer_id LEFT JOIN dig_customer_tag t2 ON t2.customer_id=c2.id AND t2.tag_name='渠道' WHERE a2.del_flag='0' AND a2.type=1004  ORDER BY (t2.id IS NOT NULL) DESC, EXISTS(SELECT 1 FROM dig_adveracoount_recharge r3 WHERE r3.adveraccount_id=a2.id) DESC, a2.consume DESC, a2.id LIMIT 1)
UNION ALL
SELECT 'S6 腾讯K4·外转(1002)' AS sample,
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
WHERE a.id = (SELECT a2.id FROM dig_advertising_account a2 JOIN dig_customer c2 ON c2.id=a2.customer_id LEFT JOIN dig_customer_tag t2 ON t2.customer_id=c2.id AND t2.tag_name='渠道' WHERE a2.del_flag='0' AND a2.type=1002  ORDER BY (t2.id IS NOT NULL) DESC, EXISTS(SELECT 1 FROM dig_adveracoount_recharge r3 WHERE r3.adveraccount_id=a2.id) DESC, a2.consume DESC, a2.id LIMIT 1);
