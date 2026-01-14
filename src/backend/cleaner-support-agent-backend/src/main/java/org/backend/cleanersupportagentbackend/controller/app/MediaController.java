package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/cleaner-support/v1/media")
public class MediaController {

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> upload(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("上传图片/视频"));
    }

    /**
     * 媒体文件列表（原 KnowledgeController 中的知识库列表，可理解为“可下载文件列表”）。
     */
    @GetMapping("/files")
    public ResponseEntity<ApiResponse<?>> listFiles(@RequestParam Map<String, String> query) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("搜索/获取媒体文件列表"));
    }

    /**
     * 媒体文件详情/下载信息。
     * 后续你可以改成直接返回二进制流（例如 ResponseEntity<Resource>）实现真正的下载。
     */
    @GetMapping("/files/{id}")
    public ResponseEntity<ApiResponse<?>> getFile(@PathVariable("id") String id) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("获取媒体文件详情/下载链接"));
    }
}

