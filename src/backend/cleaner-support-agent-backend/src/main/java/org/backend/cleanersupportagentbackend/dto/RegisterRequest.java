package org.backend.cleanersupportagentbackend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String phone; // 手机号
    private String password; // 密码
    private String nickname; // 昵称（可选）
}
