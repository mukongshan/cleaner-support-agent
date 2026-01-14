package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/cleaner-support/v1/knowledge")
public class KnowledgeController {

    @GetMapping("/articles")
    public ResponseEntity<ApiResponse<?>> listArticles(@RequestParam Map<String, String> query) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("搜索/获取知识库列表"));
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<ApiResponse<?>> getArticle(@PathVariable("id") String id) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("获取知识库详情"));
    }
}
