package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.backend.cleanersupportagentbackend.dto.MediaFileDetailResponse;
import org.backend.cleanersupportagentbackend.dto.MediaFileSummaryResponse;
import org.backend.cleanersupportagentbackend.dto.UploadFileResponse;
import org.backend.cleanersupportagentbackend.service.MediaService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/cleaner-support/v2/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping("/files")
    public ResponseEntity<ApiResponse<List<MediaFileSummaryResponse>>> listFiles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query) {
        try {
            List<MediaFileSummaryResponse> files = mediaService.searchFiles(category, query);
            return ResponseEntity.ok(ApiResponse.success(files));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/files/{id}")
    public ResponseEntity<ApiResponse<MediaFileDetailResponse>> getFile(@PathVariable String id) {
        try {
            MediaFileDetailResponse detail = mediaService.getFileDetail(id);
            return ResponseEntity.ok(ApiResponse.success(detail));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UploadFileResponse>> upload(@RequestPart("file") MultipartFile file) {
        try {
            UploadFileResponse response = mediaService.uploadFile(file);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IOException e) {
            return ResponseEntity.ok(ApiResponse.error(500, "文件上传失败: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }
}
