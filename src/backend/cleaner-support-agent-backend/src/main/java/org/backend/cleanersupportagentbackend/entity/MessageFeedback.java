package org.backend.cleanersupportagentbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 消息反馈实体（赞/踩）
 * 记录用户对AI消息的评价
 */
@Entity
@Table(name = "message_feedbacks", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"message_id", "user_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private FeedbackType type; // like(赞) 或 dislike(踩)

    @Column(columnDefinition = "TEXT")
    private String comment; // 反馈意见（可选）

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

    public enum FeedbackType {
        like,    // 赞
        dislike  // 踩
    }
}
