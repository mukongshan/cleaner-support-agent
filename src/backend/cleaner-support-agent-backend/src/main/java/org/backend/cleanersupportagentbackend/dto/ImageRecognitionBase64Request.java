package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * base64 图片识别请求DTO（用于联调/自动化测试）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionBase64Request {
    /**
     * 图片base64内容。支持纯base64或data URI（data:image/png;base64,xxxx）
     */
    private String base64;

    /**
     * 图片格式（如 png/jpg/jpeg/webp）。若传 data URI，可不填。
     */
    private String format;
}

