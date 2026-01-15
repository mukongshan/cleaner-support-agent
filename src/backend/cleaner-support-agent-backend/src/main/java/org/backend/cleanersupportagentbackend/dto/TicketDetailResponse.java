package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDetailResponse {
    private String ticketId;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String engineerName;
    private String estimatedTime;
    private List<String> attachments;
    private String comments;
}
