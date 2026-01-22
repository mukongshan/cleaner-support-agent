package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.annotation.CurrentUserId;
import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.backend.cleanersupportagentbackend.dto.ImageRecognitionHistoryResponse;
import org.backend.cleanersupportagentbackend.dto.ImageRecognitionResponse;
import org.backend.cleanersupportagentbackend.service.ImageRecognitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * 图片识别控制器
 */
@RestController
@RequestMapping("/api/cleaner-support/v2/image-reco")
public class ImageRecognitionController {

    private final ImageRecognitionService imageRecognitionService;

    public ImageRecognitionController(ImageRecognitionService imageRecognitionService) {
        this.imageRecognitionService = imageRecognitionService;
    }

    /**
     * 上传图片并识别
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ImageRecognitionResponse>> uploadAndRecognize(
            @CurrentUserId String userId,
            @RequestParam("image") MultipartFile image) {
        try {
            ImageRecognitionResponse response = imageRecognitionService.recognizeImage(userId, image);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(ApiResponse.error(400, e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.ok(ApiResponse.error(500, "文件上传失败：" + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * 获取图片识别历史
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<ImageRecognitionHistoryResponse>> getHistory(
            @CurrentUserId String userId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            ImageRecognitionHistoryResponse response = imageRecognitionService.getUserRecognitions(
                    userId, status, page, size);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }
}
