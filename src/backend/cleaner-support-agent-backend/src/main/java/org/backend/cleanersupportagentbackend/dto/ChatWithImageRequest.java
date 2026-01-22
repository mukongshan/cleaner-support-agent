package org.backend.cleanersupportagentbackend.dto;

import lombok.Data;

/**
 * 基于图片识别结果的AI对话请求DTO
 */
@Data
public class ChatWithImageRequest {
    private String recognitionId; // 图片识别记录ID（必填）
    private String query; // 用户问题（可选，如果不提供则只基于图片描述）
    private String conversationId; // 会话ID（可选，用于关联历史会话）
}
