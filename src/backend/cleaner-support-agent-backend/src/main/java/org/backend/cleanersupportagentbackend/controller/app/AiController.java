package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/cleaner-support/v1/ai")
public class AiController {

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@RequestBody Map<String, Object> body) {
        // 预留 SSE 占位：后续实现“Java 后端透传 Dify 的 SSE”
        SseEmitter emitter = new SseEmitter();
        emitter.completeWithError(new UnsupportedOperationException("AI 对话未实现"));
        return emitter;
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<?>> listConversations(@RequestParam Map<String, String> query) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("获取历史会话列表"));
    }
}
