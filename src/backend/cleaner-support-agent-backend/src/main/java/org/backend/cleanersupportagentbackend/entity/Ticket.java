package org.backend.cleanersupportagentbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 工单实体
 */
@Entity
@Table(name = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String ticketId; // 业务ID，如 WO20240120001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title; // 工单标题

    @Column(columnDefinition = "TEXT")
    private String description; // 工单描述

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TicketStatus status; // pending, processing, completed, cancelled

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TicketPriority priority; // low, medium, high

    @Column(length = 100)
    private String relatedChatId; // 关联的对话ID

    @ElementCollection
    @CollectionTable(name = "ticket_attachments", joinColumns = @JoinColumn(name = "ticket_id"))
    @Column(name = "attachment_url")
    @Builder.Default
    private List<String> attachmentUrls = new ArrayList<>(); // 附件URL列表

    @Column(length = 100)
    private String engineerName; // 工程师姓名

    @Column(length = 100)
    private String estimatedTime; // 预计处理时间

    @Column(columnDefinition = "TEXT")
    private String comments; // 备注/处理意见

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = TicketStatus.pending;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TicketStatus {
        pending, processing, completed, cancelled
    }

    public enum TicketPriority {
        low, medium, high
    }
}
