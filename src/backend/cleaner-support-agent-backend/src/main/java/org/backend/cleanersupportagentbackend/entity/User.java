package org.backend.cleanersupportagentbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户实体
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String userId; // 业务ID，如 U12345

    @Column(unique = true, nullable = false, length = 20)
    private String phone; // 手机号

    @Column(length = 100)
    private String password; // 密码（加密后）

    @Column(length = 50)
    private String nickname; // 昵称

    @Column(length = 500)
    private String avatar; // 头像URL

    @Column(length = 50)
    private String memberTag; // 会员标签，如"高级用户"

    @Column(length = 20)
    private String role; // 角色：dealer(经销商), manufacturer(厂商), user(普通用户)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
