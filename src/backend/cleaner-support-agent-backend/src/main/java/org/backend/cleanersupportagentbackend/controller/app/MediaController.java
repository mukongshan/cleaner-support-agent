package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.backend.cleanersupportagentbackend.dto.FileAccessInfo;
import org.backend.cleanersupportagentbackend.dto.MediaFileDetailResponse;
import org.backend.cleanersupportagentbackend.dto.MediaFileSummaryResponse;
import org.backend.cleanersupportagentbackend.dto.UploadFileResponse;
import org.backend.cleanersupportagentbackend.service.MediaService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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

    /**
     * 获取文件访问信息（预览链接和下载链接）
     * GET /api/cleaner-support/v2/media/files/{id}/access
     */
    @GetMapping("/files/{id}/access")
    public ResponseEntity<ApiResponse<FileAccessInfo>> getFileAccess(@PathVariable String id) {
        try {
            FileAccessInfo accessInfo = mediaService.getFileAccessInfo(id);
            return ResponseEntity.ok(ApiResponse.success(accessInfo));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * 获取文件下载链接（重定向到下载地址）
     * GET /api/cleaner-support/v2/media/files/{id}/download
     */
    @GetMapping("/files/{id}/download")
    public ResponseEntity<?> downloadFile(@PathVariable String id) {
        try {
            String downloadUrl = mediaService.getFileDownloadLink(id);
            if (downloadUrl == null) {
                return ResponseEntity.ok(ApiResponse.error(404, "文件不存在或无法下载"));
            }

            // 重定向到下载链接
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, downloadUrl)
                    .build();
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * 获取文件预览链接（重定向到预览地址）
     * GET /api/cleaner-support/v2/media/files/{id}/preview
     */
    @GetMapping("/files/{id}/preview")
    public ResponseEntity<?> previewFile(@PathVariable String id) {
        try {
            boolean viewable = mediaService.isFileViewable(id);
            if (!viewable) {
                return ResponseEntity.ok(ApiResponse.error(400, "该文件类型不支持在线预览"));
            }

            String previewUrl = mediaService.getFilePreviewUrl(id);
            if (previewUrl == null) {
                return ResponseEntity.ok(ApiResponse.error(404, "文件不存在或无法预览"));
            }

            // 重定向到预览链接
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, previewUrl)
                    .build();
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }
}
