package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 图片识别响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionResponse {
    private String recognitionId;
    private String imageUrl;
    private String description;
    private String status;
    private LocalDateTime createdAt;
}
