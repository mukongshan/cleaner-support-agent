package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private String role; // user 或 assistant
    private String content;
    private LocalDateTime timestamp;

    /**
     * 关联的图片识别记录ID（当消息包含图片时）
     * 前端可以通过此ID查询图片识别信息
     */
    private String recognitionId;

    /**
     * 关联的媒体文件业务ID（可选，通过 ImageRecognition.mediaFileId 反查）
     * 前端可以通过此ID调用媒体文件访问接口获取图片URL
     */
    private String mediaFileId;

    /**
     * 图片URL（可选，由后端通过 MediaFile / MediaService 生成，便于前端直接显示）
     * 如果为 null，前端可以基于 mediaFileId 再次调用媒体文件接口获取
     */
    private String imageUrl;
}
