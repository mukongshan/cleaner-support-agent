package org.backend.cleanersupportagentbackend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username; // 手机号
    private String password;
    private String loginType; // password 或 sms
}
