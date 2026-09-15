SELECT '## sys_role' AS _;
SELECT role_id, role_name, role_key, role_sort, data_scope, status, del_flag, remark FROM sys_role ORDER BY role_sort;
SELECT '## users by role' AS _;
SELECT r.role_id, r.role_name, COUNT(ur.user_id) users, SUM(u.status='0' AND u.del_flag='0') active FROM sys_role r LEFT JOIN sys_user_role ur ON ur.role_id=r.role_id LEFT JOIN sys_user u ON u.user_id=ur.user_id GROUP BY r.role_id, r.role_name ORDER BY users DESC;
SELECT '## sys_dept' AS _;
SELECT dept_id, parent_id, ancestors, dept_name, order_num, status, del_flag FROM sys_dept ORDER BY ancestors, order_num;
SELECT '## users by dept' AS _;
SELECT d.dept_id, d.dept_name, COUNT(u.user_id) users FROM sys_dept d LEFT JOIN sys_user u ON u.dept_id=d.dept_id AND u.del_flag='0' GROUP BY d.dept_id, d.dept_name ORDER BY users DESC;
SELECT '## user totals' AS _;
SELECT COUNT(*) total, SUM(del_flag='0') not_deleted, SUM(del_flag='0' AND status='0') active, MAX(login_date) last_login FROM sys_user;
SELECT '## role_menu counts' AS _;
SELECT r.role_name, COUNT(*) menus FROM sys_role_menu rm JOIN sys_role r ON r.role_id=rm.role_id GROUP BY r.role_id, r.role_name;
SELECT '## role x top menu' AS _;
SELECT r.role_name, COALESCE(m3.menu_name, m2.menu_name, m1.menu_name, m.menu_name) AS top_menu, COUNT(*) items
FROM sys_role_menu rm JOIN sys_role r ON r.role_id=rm.role_id JOIN sys_menu m ON m.menu_id=rm.menu_id
LEFT JOIN sys_menu m1 ON m1.menu_id=m.parent_id LEFT JOIN sys_menu m2 ON m2.menu_id=m1.parent_id LEFT JOIN sys_menu m3 ON m3.menu_id=m2.parent_id
GROUP BY r.role_name, top_menu ORDER BY r.role_name, items DESC;
SELECT '## dict types' AS _;
SELECT dict_id, dict_name, dict_type, status, remark FROM sys_dict_type ORDER BY dict_id;
SELECT '## dict data' AS _;
SELECT dict_type, dict_sort, dict_label, dict_value, status, remark FROM sys_dict_data ORDER BY dict_type, dict_sort;
SELECT '## sys_config' AS _;
SELECT config_name, config_key, config_value, config_type FROM sys_config;
