package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.annotation.CurrentUserId;
import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.backend.cleanersupportagentbackend.dto.ChatRequest;
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
}
