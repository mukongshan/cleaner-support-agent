package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaFileDetailResponse {
    private String id;
    private String content; // Markdown内容
    private String mediaUrl; // 媒体文件URL
    private List<String> relateProducts;
}
