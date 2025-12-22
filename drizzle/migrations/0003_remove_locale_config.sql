-- Remove LOCALE key from all existing users_configs records
UPDATE users_configs
SET configs = configs - 'LOCALE'
WHERE configs ? 'LOCALE';
