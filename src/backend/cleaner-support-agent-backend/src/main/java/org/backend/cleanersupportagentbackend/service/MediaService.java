package org.backend.cleanersupportagentbackend.service;

import org.backend.cleanersupportagentbackend.dto.MediaFileDetailResponse;
import org.backend.cleanersupportagentbackend.dto.MediaFileSummaryResponse;
import org.backend.cleanersupportagentbackend.dto.UploadFileResponse;
import org.backend.cleanersupportagentbackend.entity.MediaFile;
import org.backend.cleanersupportagentbackend.repository.MediaFileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MediaService {

    private final MediaFileRepository mediaFileRepository;
    
    @Value("${app.media.upload-dir:./data/uploads}")
    private String uploadDir;

    public MediaService(MediaFileRepository mediaFileRepository) {
        this.mediaFileRepository = mediaFileRepository;
    }

    /**
     * 搜索/获取媒体文件列表
     */
    public List<MediaFileSummaryResponse> searchFiles(String category, String query) {
        List<MediaFile> files;
        if (category != null || query != null) {
            files = mediaFileRepository.searchByCategoryAndQuery(category, query);
        } else {
            files = mediaFileRepository.findAll();
        }
        
        return files.stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取媒体文件详情
     */
    public MediaFileDetailResponse getFileDetail(String fileId) {
        MediaFile file = mediaFileRepository.findByFileId(fileId)
                .orElseThrow(() -> new RuntimeException("文件不存在"));
        
        return MediaFileDetailResponse.builder()
                .id(file.getFileId())
                .content(file.getContent())
                .mediaUrl(file.getMediaUrl())
                .relateProducts(file.getRelateProducts())
                .build();
    }

    /**
     * 上传媒体文件
     */
    @Transactional
    public UploadFileResponse uploadFile(MultipartFile file) throws IOException {
        // 创建上传目录
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String filename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(filename);

        // 保存文件
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 确定文件类型
        String fileType = determineFileType(originalFilename, file.getContentType());

        // 构建访问URL（简化处理，实际应该配置静态资源路径或使用OSS）
        String url = "/api/cleaner-support/v2/media/files/" + filename;

        // 可选：保存到数据库
        // MediaFile mediaFile = MediaFile.builder()...
        // mediaFileRepository.save(mediaFile);

        return UploadFileResponse.builder()
                .url(url)
                .fileType(fileType)
                .build();
    }

    private MediaFileSummaryResponse toSummaryResponse(MediaFile file) {
        return MediaFileSummaryResponse.builder()
                .id(file.getFileId())
                .title(file.getTitle())
                .summary(file.getSummary())
                .type(file.getType().name())
                .coverUrl(file.getCoverUrl())
                .duration(file.getDuration())
                .build();
    }

    private String determineFileType(String filename, String contentType) {
        if (filename == null) {
            return "unknown";
        }
        
        String lowerName = filename.toLowerCase();
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || 
            lowerName.endsWith(".png") || lowerName.endsWith(".gif") || 
            lowerName.endsWith(".webp")) {
            return "image";
        } else if (lowerName.endsWith(".mp4") || lowerName.endsWith(".avi") || 
                   lowerName.endsWith(".mov") || lowerName.endsWith(".wmv")) {
            return "video";
        } else if (lowerName.endsWith(".pdf")) {
            return "pdf";
        } else if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
            return "excel";
        } else if (lowerName.endsWith(".ppt") || lowerName.endsWith(".pptx")) {
            return "ppt";
        } else {
            return "other";
        }
    }
}
