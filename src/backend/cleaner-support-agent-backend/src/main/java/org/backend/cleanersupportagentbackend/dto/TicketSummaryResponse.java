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
public class TicketSummaryResponse {
    private String ticketId;
    private String title;
    private String status;
    private String priority;
    private LocalDateTime createdAt;
    private String engineerName;
    private String estimatedTime;
}
