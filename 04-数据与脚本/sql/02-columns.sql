SELECT table_name, ordinal_position, column_name, column_type, is_nullable, column_default, column_key, column_comment
FROM information_schema.columns WHERE table_schema='crm_xinhuo' ORDER BY table_name, ordinal_position;
