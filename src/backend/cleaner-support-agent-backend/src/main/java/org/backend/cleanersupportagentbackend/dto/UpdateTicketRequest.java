package org.backend.cleanersupportagentbackend.dto;

import lombok.Data;

@Data
public class UpdateTicketRequest {
    private String status;
    private String comments;
}
