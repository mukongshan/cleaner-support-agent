-- 数据库初始化脚本
-- 用于首次创建数据库和基础表结构
-- 注意：此脚本只创建数据库，表结构由JPA自动生成（ddl-auto: update）

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS cleaner_support 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE cleaner_support;

-- 注意：表结构不需要手动创建
-- JPA会根据实体类自动创建以下表：
-- - users
-- - conversations
-- - messages
-- - tickets
-- - ticket_attachments
-- - ticket_feedbacks
-- - media_files
-- - media_file_products
-- - message_feedbacks
