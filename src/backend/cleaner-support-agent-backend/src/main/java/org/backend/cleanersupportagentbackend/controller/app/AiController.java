package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.annotation.CurrentUserId;
import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.backend.cleanersupportagentbackend.dto.ChatRequest;
import org.backend.cleanersupportagentbackend.dto.ChatWithImageRequest;
import org.backend.cleanersupportagentbackend.dto.ConversationDetailResponse;
import org.backend.cleanersupportagentbackend.dto.ConversationSummaryResponse;
import org.backend.cleanersupportagentbackend.service.AiService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/cleaner-support/v2/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@CurrentUserId String userId, @RequestBody ChatRequest request) {
        return aiService.chat(userId, request);
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationSummaryResponse>>> listConversations(@CurrentUserId String userId) {
        try {
            List<ConversationSummaryResponse> conversations = aiService.getConversations(userId);
            return ResponseEntity.ok(ApiResponse.success(conversations));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ApiResponse<ConversationDetailResponse>> getConversationDetail(
            @CurrentUserId String userId,
            @PathVariable String conversationId) {
        try {
            ConversationDetailResponse detail = aiService.getConversationDetail(userId, conversationId);
            return ResponseEntity.ok(ApiResponse.success(detail));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * 基于图片识别结果进行AI对话
     */
    @PostMapping(value = "/chat/with-image", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatWithImage(@CurrentUserId String userId, @RequestBody ChatWithImageRequest request) {
        return aiService.chatWithImage(userId, request);
    }

    /**
     * 主动终止指定会话的流式生成。
     * 前端在用户点击"停止"时调用，后端立即中断对 Dify 的 HTTP 连接。
     */
    @PostMapping("/conversations/{conversationId}/abort")
    public ResponseEntity<ApiResponse<Void>> abortChat(@PathVariable String conversationId) {
        try {
            aiService.stopChat(conversationId);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }
}
