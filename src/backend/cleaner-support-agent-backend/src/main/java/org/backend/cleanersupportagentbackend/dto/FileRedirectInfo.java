package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 文件重定向信息 DTO
 * 包含预览/下载 URL 和 repoToken，供前端重定向使用
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileRedirectInfo {
    /**
     * 预览或下载 URL
     */
    private String url;
    
    /**
     * Seafile Repository Token
     * 用于前端访问 Seafile 资源
     */
    private String repoToken;
    
    /**
     * 文件标题
     */
    private String title;
    
    /**
     * 是否为预览链接（true=预览，false=下载）
     */
    private Boolean isPreview;
}
