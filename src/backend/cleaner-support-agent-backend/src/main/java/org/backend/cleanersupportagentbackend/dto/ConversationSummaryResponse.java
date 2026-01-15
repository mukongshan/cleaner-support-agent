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
public class ConversationSummaryResponse {
    private String id;
    private String title;
    private Integer messageCount;
    private LocalDateTime updatedAt;
}
