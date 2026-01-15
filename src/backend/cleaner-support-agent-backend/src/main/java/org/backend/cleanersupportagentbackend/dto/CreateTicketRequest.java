package org.backend.cleanersupportagentbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateTicketRequest {
    private String title;
    private String description;
    private String priority; // low, medium, high
    private String relatedChatId;
    private List<String> attachmentUrls;
}
