package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 图片识别历史响应DTO（分页）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognitionHistoryResponse {
    private Long total;
    private Integer page;
    private Integer size;
    private List<ImageRecognitionResponse> items;
}
