package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.backend.cleanersupportagentbackend.dto.FileAccessInfo;
import org.backend.cleanersupportagentbackend.dto.FileRedirectInfo;
import org.backend.cleanersupportagentbackend.dto.MediaFileDetailResponse;
import org.backend.cleanersupportagentbackend.dto.MediaFileSummaryResponse;
import org.backend.cleanersupportagentbackend.dto.UploadFileResponse;
import org.backend.cleanersupportagentbackend.entity.MediaFile;
import org.backend.cleanersupportagentbackend.repository.MediaFileRepository;
import org.backend.cleanersupportagentbackend.service.MediaService;
import org.backend.cleanersupportagentbackend.service.support.ImageRecognitionService;
import org.backend.cleanersupportagentbackend.service.support.SeafileService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
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
    private final SeafileService seafileService;
    private final MediaFileRepository mediaFileRepository;
    private final ImageRecognitionService imageRecognitionService;

    public MediaController(MediaService mediaService, SeafileService seafileService,
                           MediaFileRepository mediaFileRepository, ImageRecognitionService imageRecognitionService) {
        this.mediaService = mediaService;
        this.seafileService = seafileService;
        this.mediaFileRepository = mediaFileRepository;
        this.imageRecognitionService = imageRecognitionService;
    }

    /**
     * 图片识别上传的图片展示（当前会话与历史会话均使用此 URL：/media/images/{filename}）
     * GET /api/cleaner-support/v2/media/images/{filename}
     */
    @GetMapping(value = "/images/{filename}", produces = { MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_GIF_VALUE, "image/webp" })
    public ResponseEntity<?> imageContent(@PathVariable String filename) {
        Resource resource = imageRecognitionService.getImageResourceByFilename(filename);
        if (resource == null || !resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        String contentType = ImageRecognitionService.getContentTypeForFilename(filename);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .body(resource);
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
     * 获取文件下载链接和 repoToken（供前端重定向）
     * GET /api/cleaner-support/v2/media/files/{id}/download
     */
    @GetMapping("/files/{id}/download")
    public ResponseEntity<ApiResponse<FileRedirectInfo>> downloadFile(@PathVariable String id) {
        try {
            MediaFile file = mediaFileRepository.findByFileId(id)
                    .orElseThrow(() -> new RuntimeException("文件不存在"));

            String downloadUrl = mediaService.getFileDownloadLink(id);
            if (downloadUrl == null) {
                return ResponseEntity.ok(ApiResponse.error(404, "文件不存在或无法下载"));
            }

            // 返回下载 URL 和 repoToken，让前端重定向
            FileRedirectInfo redirectInfo = FileRedirectInfo.builder()
                    .url(downloadUrl)
                    .repoToken(seafileService.getRepoToken())
                    .title(file.getTitle())
                    .isPreview(false)
                    .build();

            return ResponseEntity.ok(ApiResponse.success(redirectInfo));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * 获取文件二进制内容（用于前端带鉴权请求后直接展示，如历史消息中的图片）
     * GET /api/cleaner-support/v2/media/files/{id}/content
     */
    @GetMapping(value = "/files/{id}/content", produces = { MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_GIF_VALUE, "image/webp" })
    public ResponseEntity<?> fileContent(@PathVariable String id) {
        try {
            MediaService.FileContentResult result = mediaService.getFileContent(id);
            if (result == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(result.getContentType()))
                    .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                    .body(result.getResource());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 获取文件预览链接和 repoToken（供前端重定向）
     * GET /api/cleaner-support/v2/media/files/{id}/preview
     */
    @GetMapping("/files/{id}/preview")
    public ResponseEntity<ApiResponse<FileRedirectInfo>> previewFile(@PathVariable String id) {
        try {
            MediaFile file = mediaFileRepository.findByFileId(id)
                    .orElseThrow(() -> new RuntimeException("文件不存在"));

            boolean viewable = mediaService.isFileViewable(id);
            if (!viewable) {
                return ResponseEntity.ok(ApiResponse.error(400, "该文件类型不支持在线预览"));
            }

            String previewUrl = mediaService.getFilePreviewUrl(id);
            if (previewUrl == null) {
                return ResponseEntity.ok(ApiResponse.error(404, "文件不存在或无法预览"));
            }

            // 返回预览 URL 和 repoToken，让前端重定向
            FileRedirectInfo redirectInfo = FileRedirectInfo.builder()
                    .url(previewUrl)
                    .repoToken(seafileService.getRepoToken())
                    .title(file.getTitle())
                    .isPreview(true)
                    .build();

            return ResponseEntity.ok(ApiResponse.success(redirectInfo));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }
}
