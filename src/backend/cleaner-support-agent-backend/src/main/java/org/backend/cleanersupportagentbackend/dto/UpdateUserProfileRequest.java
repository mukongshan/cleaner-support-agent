package org.backend.cleanersupportagentbackend.dto;

import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String nickname;
    private String avatar;
}
