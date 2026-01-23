-- =====================================================
-- 数据库迁移脚本：移除不应直接存储的URL字段
-- 执行日期：2024-01-23
-- 说明：移除 preview_url, download_url, media_url, repo_id 字段
--       这些字段应该通过服务实时生成，而不是存储在数据库中
-- =====================================================

USE cleaner_support;

-- 备份表（可选，建议先备份）
-- CREATE TABLE media_files_backup AS SELECT * FROM media_files;

-- 移除不需要的字段
ALTER TABLE media_files 
    DROP COLUMN IF EXISTS preview_url,
    DROP COLUMN IF EXISTS download_url,
    DROP COLUMN IF EXISTS media_url,
    DROP COLUMN IF EXISTS repo_id;

-- 添加 storage_key 字段（如果不存在）
ALTER TABLE media_files 
    ADD COLUMN IF NOT EXISTS storage_key VARCHAR(500) COMMENT '对象存储的 key（当 access_method = OSS 时使用）';

-- 验证表结构
DESCRIBE media_files;

SELECT 'Migration completed successfully!' AS message;
