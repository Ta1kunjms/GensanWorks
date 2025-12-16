-- Force drop users table to remove all legacy columns and schema drift
DROP TABLE IF EXISTS users;