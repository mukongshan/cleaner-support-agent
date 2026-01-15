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

    @Column(columnDefinition = "TEXT")
    private String summary; // 摘要

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private FileType type; // Article, Video, PDF, Image, Excel, PPT

    @Column(length = 100)
    private String category; // 分类，如 maintenance, sales, training

    @Column(columnDefinition = "TEXT")
    private String content; // 文本内容（Markdown格式）

    @Column(length = 500)
    private String mediaUrl; // 媒体文件URL（视频、PDF等）

    @Column(length = 500)
    private String coverUrl; // 封面图URL

    @Column(length = 20)
    private String duration; // 视频时长，如 "03:45"

    @ElementCollection
    @CollectionTable(name = "media_file_products", joinColumns = @JoinColumn(name = "media_file_id"))
    @Column(name = "product_name")
    @Builder.Default
    private List<String> relateProducts = new ArrayList<>(); // 关联产品列表

    @Column(length = 500)
    private String filePath; // 本地文件路径

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

    public enum FileType {
        Article, Video, PDF, Image, Excel, PPT
    }
}
