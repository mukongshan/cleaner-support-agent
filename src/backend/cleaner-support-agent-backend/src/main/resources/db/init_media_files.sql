-- =====================================================
-- 数据库初始化脚本 - 完整表结构
-- 数据库名: cleaner_support
-- 字符集: utf8mb4
-- 排序规则: utf8mb4_unicode_ci
-- =====================================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS cleaner_support 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE cleaner_support;

-- =====================================================
-- 1. 用户表 (users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL COMMENT '业务ID，如 U12345',
    phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
    password VARCHAR(100) COMMENT '密码（加密后）',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    member_tag VARCHAR(50) COMMENT '会员标签，如"高级用户"',
    role VARCHAR(20) COMMENT '角色：dealer(经销商), manufacturer(厂商), user(普通用户)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_phone (phone),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =====================================================
-- 2. 对话会话表 (conversations)
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100) UNIQUE NOT NULL COMMENT '业务ID，如 conv_123',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    title VARCHAR(200) COMMENT '会话标题（从第一条消息提取）',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI对话会话表';

-- =====================================================
-- 3. 消息表 (messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL COMMENT '会话ID',
    role VARCHAR(20) NOT NULL COMMENT '消息角色：user 或 assistant',
    content TEXT COMMENT '消息内容',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '消息时间戳',
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_timestamp (timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话消息表';

-- =====================================================
-- 4. 消息反馈表 (message_feedbacks)
-- =====================================================
CREATE TABLE IF NOT EXISTS message_feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL COMMENT '消息ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    type VARCHAR(20) NOT NULL COMMENT '反馈类型：like(赞) 或 dislike(踩)',
    comment TEXT COMMENT '反馈意见（可选）',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_message_user (message_id, user_id),
    INDEX idx_message_id (message_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息反馈表（赞/踩）';

-- =====================================================
-- 5. 工单表 (tickets)
-- =====================================================
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL COMMENT '业务ID，如 WO20240120001',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    title VARCHAR(200) NOT NULL COMMENT '工单标题',
    description TEXT COMMENT '工单描述',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '工单状态：pending, processing, completed, cancelled',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' COMMENT '优先级：low, medium, high',
    related_chat_id VARCHAR(100) COMMENT '关联的对话ID',
    engineer_name VARCHAR(100) COMMENT '工程师姓名',
    estimated_time VARCHAR(100) COMMENT '预计处理时间',
    comments TEXT COMMENT '备注/处理意见',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工单表';

-- =====================================================
-- 6. 工单附件表 (ticket_attachments)
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_attachments (
    ticket_id BIGINT NOT NULL COMMENT '工单ID',
    attachment_url VARCHAR(500) NOT NULL COMMENT '附件URL',
    
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    INDEX idx_ticket_id (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工单附件表';

-- =====================================================
-- 7. 工单反馈表 (ticket_feedbacks)
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL UNIQUE COMMENT '工单ID',
    type VARCHAR(20) NOT NULL COMMENT '反馈类型：like(赞) 或 dislike(踩)',
    comment TEXT COMMENT '反馈意见',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    INDEX idx_ticket_id (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工单反馈表（赞/踩）';

-- =====================================================
-- 8. 媒体文件表 (media_files)
-- =====================================================
CREATE TABLE IF NOT EXISTS media_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id VARCHAR(50) UNIQUE NOT NULL COMMENT '业务ID，如 KB001',
    title VARCHAR(200) NOT NULL COMMENT '文件标题',
    type VARCHAR(50) NOT NULL COMMENT '文件类型：Article, Video, PDF, Image, Excel, PPT',
    category VARCHAR(100) COMMENT '分类，如 maintenance, sales, training',
    cover_url VARCHAR(500) COMMENT '封面图URL（可选，用于展示）',
    -- 存储路径字段（根据 access_method 决定使用哪个）
    seafile_path VARCHAR(500) COMMENT 'Seafile 中的文件路径（当 access_method = SEAFILE 时使用）',
    file_path VARCHAR(500) COMMENT '本地文件路径（当 access_method = LOCAL 时使用）',
    storage_key VARCHAR(500) COMMENT '对象存储的 key（当 access_method = OSS 时使用）',
    is_viewable BOOLEAN COMMENT '是否支持在线预览（可根据文件类型自动判断）',
    access_method VARCHAR(20) COMMENT '访问方式：SEAFILE, LOCAL, OSS',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_file_id (file_id),
    INDEX idx_category (category),
    INDEX idx_type (type),
    INDEX idx_access_method (access_method),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='媒体文件/知识文档表';

-- =====================================================
-- 9. 图片识别记录表 (image_recognitions)
-- =====================================================
CREATE TABLE IF NOT EXISTS image_recognitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recognition_id VARCHAR(50) UNIQUE NOT NULL COMMENT '业务ID，如 IMG20240120001',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
    image_path VARCHAR(500) NOT NULL COMMENT '本地文件路径',
    description TEXT COMMENT '图片描述（Qwen-VL识别结果）',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '识别状态：pending, processing, completed, failed',
    error_message VARCHAR(500) COMMENT '错误信息（识别失败时）',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_recognition_id (recognition_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片识别记录表';

-- =====================================================
-- 初始化完成
-- =====================================================
SELECT 'Database initialization completed successfully!' AS message;
