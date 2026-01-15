package org.backend.cleanersupportagentbackend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ChatRequest {
    private String query;
    private String conversationId; // 可选
    private Map<String, Object> deviceInfo; // 可选
}
