package org.backend.cleanersupportagentbackend.service;

import org.backend.cleanersupportagentbackend.dto.FileAccessInfo;
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
    private final SeafileService seafileService;
    
    @Value("${app.media.upload-dir:./data/uploads}")
    private String uploadDir;

    public MediaService(MediaFileRepository mediaFileRepository, SeafileService seafileService) {
        this.mediaFileRepository = mediaFileRepository;
        this.seafileService = seafileService;
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
        
        // 获取访问信息
        FileAccessInfo accessInfo = getFileAccessInfo(fileId);
        
        return MediaFileDetailResponse.builder()
                .id(file.getFileId())
                .mediaUrl(file.getMediaUrl())
                .previewUrl(accessInfo.getPreviewUrl())
                .downloadUrl(accessInfo.getDownloadUrl())
                .isViewable(accessInfo.getIsViewable())
                .build();
    }

    /**
     * 获取文件下载链接
     *
     * @param fileId 文件业务ID
     * @return 下载链接
     */
    public String getFileDownloadLink(String fileId) {
        MediaFile file = mediaFileRepository.findByFileId(fileId)
                .orElseThrow(() -> new RuntimeException("文件不存在"));

        // 如果是 Seafile 文件，实时获取下载链接
        if (file.getAccessMethod() == MediaFile.AccessMethod.SEAFILE &&
            file.getSeafilePath() != null) {
            return seafileService.getDownloadLink(file.getSeafilePath());
        }

        // 否则返回已存储的下载链接
        return file.getDownloadUrl();
    }

    /**
     * 获取文件预览链接
     *
     * @param fileId 文件业务ID
     * @return 预览链接
     */
    public String getFilePreviewUrl(String fileId) {
        MediaFile file = mediaFileRepository.findByFileId(fileId)
                .orElseThrow(() -> new RuntimeException("文件不存在"));

        // 如果是 Seafile 文件，生成预览链接
        if (file.getAccessMethod() == MediaFile.AccessMethod.SEAFILE &&
            file.getSeafilePath() != null) {
            return seafileService.generatePreviewUrl(file.getSeafilePath());
        }

        // 否则返回已存储的预览链接
        return file.getPreviewUrl();
    }

    /**
     * 判断文件是否支持在线预览
     *
     * @param fileId 文件业务ID
     * @return 是否可预览
     */
    public boolean isFileViewable(String fileId) {
        MediaFile file = mediaFileRepository.findByFileId(fileId)
                .orElseThrow(() -> new RuntimeException("文件不存在"));

        if (file.getIsViewable() != null) {
            return file.getIsViewable();
        }

        // 如果是 Seafile 文件，实时判断
        if (file.getAccessMethod() == MediaFile.AccessMethod.SEAFILE &&
            file.getSeafilePath() != null) {
            return seafileService.isViewableFile(file.getSeafilePath());
        }

        return false;
    }

    /**
     * 智能处理文件：返回预览链接或下载链接
     *
     * @param fileId 文件业务ID
     * @return 访问信息（包含预览链接和下载链接）
     */
    public FileAccessInfo getFileAccessInfo(String fileId) {
        MediaFile file = mediaFileRepository.findByFileId(fileId)
                .orElseThrow(() -> new RuntimeException("文件不存在"));

        boolean viewable = isFileViewable(fileId);
        String previewUrl = viewable ? getFilePreviewUrl(fileId) : null;
        String downloadUrl = getFileDownloadLink(fileId);

        return FileAccessInfo.builder()
                .fileId(fileId)
                .title(file.getTitle())
                .isViewable(viewable)
                .previewUrl(previewUrl)
                .downloadUrl(downloadUrl)
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
                .type(file.getType().name())
                .coverUrl(file.getCoverUrl())
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
