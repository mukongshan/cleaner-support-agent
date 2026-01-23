package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaFileDetailResponse {
    private String id;
    private String mediaUrl; // 媒体文件URL
    private String previewUrl; // 预览链接
    private String downloadUrl; // 下载链接
    private Boolean isViewable; // 是否可预览
}
