package org.backend.cleanersupportagentbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String userId;
    private String nickname;
    private String avatar;
    private String phone;
    private String memberTag;
}
