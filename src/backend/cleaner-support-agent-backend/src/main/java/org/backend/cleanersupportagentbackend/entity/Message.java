package org.backend.cleanersupportagentbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 对话消息实体
 */
@Entity
@Table(name = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private MessageRole role; // user 或 assistant

    @Column(columnDefinition = "TEXT")
    private String content; // 消息内容

    /**
     * 关联的图片识别记录ID（用于关联 ImageRecognition）
     * 通过 ImageRecognition 可以进一步找到 MediaFile，从而获取图片访问信息
     *
     * 说明：一个会话可以对应多条消息，每条消息最多关联一个图片识别记录；
     * 如果未来支持“一条消息多图”，可以演进为单独的关联表。
     */
    @Column(name = "recognition_id", length = 50)
    private String recognitionId;

    @Column(name = "dify_message_id", length = 100)
    private String difyMessageId; // Dify平台消息ID映射

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public enum MessageRole {
        user, assistant
    }
}
