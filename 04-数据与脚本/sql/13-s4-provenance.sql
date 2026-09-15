SELECT '## A. S4 店铺 850 / 账户 8381 的来源' AS _;
SELECT s.id, s.shop_no, s.shop_name = cs.subject_name AS name_eq_subject, s.create_time, s.remark, s.supplier_id, s.ks_agentId, s.account_infojson,
 (SELECT GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '+') FROM sys_user_role ur JOIN sys_role r ON r.role_id=ur.role_id WHERE ur.user_id=s.create_by) creator_roles,
 (SELECT d.dept_name FROM sys_user u JOIN sys_dept d ON d.dept_id=u.dept_id WHERE u.user_id=s.create_by) creator_dept
FROM dig_shop s JOIN dig_customer_subject cs ON cs.id=s.subject_id WHERE s.id=850;
SELECT a.id, a.create_time, a.update_time, a.remark, a.data_type, a.advertiser_id, a.editor_name IS NOT NULL has_editor,
 (SELECT GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '+') FROM sys_user_role ur JOIN sys_role r ON r.role_id=ur.role_id WHERE ur.user_id=a.create_by) creator_roles,
 (SELECT d.dept_name FROM sys_user u JOIN sys_dept d ON d.dept_id=u.dept_id WHERE u.user_id=a.create_by) creator_dept
FROM dig_advertising_account a WHERE a.id=8381;
SELECT '## A2. 同一分钟内该用户的操作日志（判断是导入还是手工新增）' AS _;
SELECT l.title, l.method, l.oper_url, l.oper_time FROM sys_oper_log l JOIN dig_shop s ON s.id=850 JOIN sys_user u ON u.user_id=s.create_by
WHERE l.oper_name=u.user_name AND l.oper_time BETWEEN DATE_SUB(s.create_time, INTERVAL 3 MINUTE) AND DATE_ADD(s.create_time, INTERVAL 3 MINUTE) ORDER BY l.oper_time;
SELECT '## A3. 该客户/主体有没有开户申请单' AS _;
SELECT id, LEFT(subject_name,12) subj, shop_no, CHAR_LENGTH(shop_no) len, account_type, state, create_time, supplier_name FROM dig_accountopen_apply WHERE customer_id=1246 OR subject_name LIKE '秦皇岛致合信行%';
SELECT '## B. 全库 19 位 shop_no 的店铺是怎么来的' AS _;
SELECT COALESCE((SELECT GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '+') FROM sys_user_role ur JOIN sys_role r ON r.role_id=ur.role_id WHERE ur.user_id=s.create_by),'(空)') creator_roles,
 DATE_FORMAT(s.create_time,'%Y-%m') ym, COUNT(*) shops, SUM(s.shop_name=cs.subject_name) name_eq_subject,
 (SELECT GROUP_CONCAT(DISTINCT COALESCE(a.remark,'NULL')) FROM dig_advertising_account a WHERE a.shop_id IN (SELECT s2.id FROM dig_shop s2 WHERE CHAR_LENGTH(s2.shop_no)=19 AND s2.shop_no REGEXP '^[0-9]+$' AND s2.create_by=s.create_by AND DATE_FORMAT(s2.create_time,'%Y-%m')=DATE_FORMAT(s.create_time,'%Y-%m'))) account_sources
FROM dig_shop s JOIN dig_customer_subject cs ON cs.id=s.subject_id WHERE CHAR_LENGTH(s.shop_no)=19 AND s.shop_no REGEXP '^[0-9]+$' AND s.del_flag='0' GROUP BY creator_roles, ym ORDER BY ym;
SELECT '## B2. 19 位店铺的 shop_no 是否与账户 ID 重复（排除“把账户ID填进店铺编号”）' AS _;
SELECT COUNT(*) shops19, SUM(EXISTS(SELECT 1 FROM dig_advertising_account a WHERE a.account_no=s.shop_no)) equals_some_account_no FROM dig_shop s WHERE CHAR_LENGTH(s.shop_no)=19 AND s.shop_no REGEXP '^[0-9]+$' AND s.del_flag='0';
SELECT '## C. 开户申请单里商务填的 shop_no 长什么样' AS _;
SELECT CHAR_LENGTH(shop_no) len, shop_no REGEXP '^[0-9]+$' numeric_only, COUNT(*) n, MIN(create_time) first_seen, MAX(create_time) last_seen FROM dig_accountopen_apply GROUP BY len, numeric_only ORDER BY n DESC;
SELECT '## D. 开户申请 ↔ 账户：apply 回复后创建的账户 shop_no 是否沿用申请单的值' AS _;
SELECT COUNT(*) n, SUM(s.shop_no=ap.shop_no) same_shop_no FROM dig_accountopen_apply ap JOIN dig_advertising_account a ON FIND_IN_SET(a.account_no, REPLACE(ap.account_nos,'，',',')) JOIN dig_shop s ON s.id=a.shop_id WHERE ap.account_nos IS NOT NULL AND ap.account_nos<>'';
