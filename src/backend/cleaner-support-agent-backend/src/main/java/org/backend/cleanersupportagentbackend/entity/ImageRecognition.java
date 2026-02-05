package org.backend.cleanersupportagentbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 图片识别记录实体
 */
@Entity
@Table(name = "image_recognitions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageRecognition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String recognitionId; // 业务ID，如 IMG20240120001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 关联用户

    @Column(nullable = false, length = 500)
    private String imageUrl; // 图片URL

    @Column(nullable = false, length = 500)
    private String imagePath; // 本地文件路径

    @Column(columnDefinition = "TEXT")
    private String description; // 图片描述（Qwen-VL识别结果）

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RecognitionStatus status = RecognitionStatus.pending; // 识别状态

    /**
     * 关联的媒体文件业务ID（MediaFile.fileId）
     * 通过 MediaFile 统一管理图片的存储路径与访问方式（LOCAL / SEAFILE / OSS）
     */
    @Column(name = "media_file_id", length = 50)
    private String mediaFileId;

    @Column(length = 500)
    private String errorMessage; // 错误信息（识别失败时）

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
