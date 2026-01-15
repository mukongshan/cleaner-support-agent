package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaFileSummaryResponse {
    private String id;
    private String title;
    private String summary;
    private String type; // Article, Video, PDF, etc.
    private String coverUrl;
    private String duration; // 视频类特有
}
