package org.backend.cleanersupportagentbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 媒体文件/知识文档实体
 */
@Entity
@Table(name = "media_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String fileId; // 业务ID，如 KB001

    @Column(nullable = false, length = 200)
    private String title; // 文件标题

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private FileType type; // Article, Video, PDF, Image, Excel, PPT

    @Column(length = 100)
    private String category; // 分类，如 maintenance, sales, training

    @Column(length = 500)
    private String mediaUrl; // 媒体文件URL（视频、PDF等）

    @Column(length = 500)
    private String coverUrl; // 封面图URL

    @Column(length = 500)
    private String filePath; // 本地文件路径

    // Seafile 相关字段
    @Column(length = 100)
    private String repoId; // Seafile 资料库ID

    @Column(length = 500)
    private String seafilePath; // Seafile 中的文件路径（完整路径）

    @Column(length = 500)
    private String downloadUrl; // 下载链接（临时链接，有时效性）

    @Column(length = 500)
    private String previewUrl; // 预览链接（Web预览地址）

    @Column
    private Boolean isViewable; // 是否支持在线预览

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private AccessMethod accessMethod; // 访问方式

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

    /**
     * 文件类型枚举
     */
    public enum FileType {
        Article,   // 文章
        Video,     // 视频
        PDF,       // PDF文档
        Image,     // 图片
        Excel,     // Excel表格
        PPT        // PowerPoint演示文稿
    }

    /**
     * 访问方式枚举
     */
    public enum AccessMethod {
        SEAFILE,    // 通过 Seafile 访问
        LOCAL,      // 本地文件
        OSS         // 对象存储
    }
}
