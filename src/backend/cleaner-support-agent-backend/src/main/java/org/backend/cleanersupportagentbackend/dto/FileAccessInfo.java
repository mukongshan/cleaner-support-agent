package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 文件访问信息 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileAccessInfo {
    private String fileId;
    private String title;
    private Boolean isViewable;
    private String previewUrl;
    private String downloadUrl;
}
