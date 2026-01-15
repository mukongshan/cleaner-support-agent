package org.backend.cleanersupportagentbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 工单反馈实体（赞/踩）
 */
@Entity
@Table(name = "ticket_feedbacks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false, unique = true)
    private Ticket ticket;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private FeedbackType type; // like(赞) 或 dislike(踩)

    @Column(columnDefinition = "TEXT")
    private String comment; // 反馈意见

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum FeedbackType {
        like, dislike
    }
}
