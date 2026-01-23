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
        
        // 生成媒体URL（根据访问方式）
        String mediaUrl = generateMediaUrl(file);
        
        return MediaFileDetailResponse.builder()
                .id(file.getFileId())
                .mediaUrl(mediaUrl)
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

        // 根据访问方式生成下载链接
        if (file.getAccessMethod() == MediaFile.AccessMethod.SEAFILE &&
            file.getSeafilePath() != null) {
            // Seafile 文件：实时获取下载链接
            return seafileService.getDownloadLink(file.getSeafilePath());
        } else if (file.getAccessMethod() == MediaFile.AccessMethod.LOCAL &&
                   file.getFilePath() != null) {
            // 本地文件：生成下载URL
            return generateLocalFileUrl(file.getFilePath());
        } else if (file.getAccessMethod() == MediaFile.AccessMethod.OSS &&
                   file.getStorageKey() != null) {
            // OSS 文件：生成下载URL（需要实现 OSS 服务）
            return generateOssFileUrl(file.getStorageKey());
        }

        return null;
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

        // 根据访问方式生成预览链接
        if (file.getAccessMethod() == MediaFile.AccessMethod.SEAFILE &&
            file.getSeafilePath() != null) {
            // Seafile 文件：生成预览链接
            return seafileService.generatePreviewUrl(file.getSeafilePath());
        } else if (file.getAccessMethod() == MediaFile.AccessMethod.LOCAL &&
                   file.getFilePath() != null) {
            // 本地文件：生成预览URL
            return generateLocalFileUrl(file.getFilePath());
        } else if (file.getAccessMethod() == MediaFile.AccessMethod.OSS &&
                   file.getStorageKey() != null) {
            // OSS 文件：生成预览URL（需要实现 OSS 服务）
            return generateOssFileUrl(file.getStorageKey());
        }

        return null;
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

        // 如果已设置，直接返回
        if (file.getIsViewable() != null) {
            return file.getIsViewable();
        }

        // 根据文件路径判断
        String path = getFilePath(file);
        if (path != null) {
            if (file.getAccessMethod() == MediaFile.AccessMethod.SEAFILE) {
                return seafileService.isViewableFile(path);
            } else {
                // 本地文件和 OSS 文件：根据扩展名判断
                return isViewableByExtension(path);
            }
        }

        return false;
    }
    
    /**
     * 根据文件路径获取实际路径
     */
    private String getFilePath(MediaFile file) {
        if (file.getAccessMethod() == MediaFile.AccessMethod.SEAFILE) {
            return file.getSeafilePath();
        } else if (file.getAccessMethod() == MediaFile.AccessMethod.LOCAL) {
            return file.getFilePath();
        } else if (file.getAccessMethod() == MediaFile.AccessMethod.OSS) {
            return file.getStorageKey();
        }
        return null;
    }
    
    /**
     * 根据扩展名判断是否可预览
     */
    private boolean isViewableByExtension(String path) {
        if (path == null) {
            return false;
        }
        String lowerPath = path.toLowerCase();
        return lowerPath.endsWith(".pdf") ||
               lowerPath.matches(".*\\.(jpg|jpeg|png|gif|bmp|webp|svg)$") ||
               lowerPath.matches(".*\\.(mp4|mov|avi|mkv|flv|wmv|webm|ts)$") ||
               lowerPath.matches(".*\\.(mp3|wav|flac|aac|ogg|m4a)$");
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
        String downloadUrl = !viewable ? getFileDownloadLink(fileId) : null;

        return FileAccessInfo.builder()
                .fileId(fileId)
                .title(file.getTitle())
                .isViewable(viewable)
                .previewUrl(previewUrl)
                .downloadUrl(downloadUrl)
                .repoToken(seafileService.getRepoToken())
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

    /**
     * 生成媒体URL（根据访问方式）
     */
    private String generateMediaUrl(MediaFile file) {
        if (file.getAccessMethod() == MediaFile.AccessMethod.SEAFILE) {
            // Seafile 文件：返回预览链接作为媒体URL
            return getFilePreviewUrl(file.getFileId());
        } else if (file.getAccessMethod() == MediaFile.AccessMethod.LOCAL) {
            // 本地文件：生成访问URL
            return generateLocalFileUrl(file.getFilePath());
        } else if (file.getAccessMethod() == MediaFile.AccessMethod.OSS) {
            // OSS 文件：生成访问URL
            return generateOssFileUrl(file.getStorageKey());
        }
        return null;
    }
    
    /**
     * 生成本地文件访问URL
     */
    private String generateLocalFileUrl(String filePath) {
        if (filePath == null) {
            return null;
        }
        // 将本地路径转换为访问URL
        // 例如：./data/uploads/file.pdf -> /api/cleaner-support/v2/media/files/file.pdf
        String relativePath = filePath.replace("\\", "/");
        if (relativePath.startsWith(uploadDir)) {
            relativePath = relativePath.substring(uploadDir.length());
        }
        if (relativePath.startsWith("/")) {
            relativePath = relativePath.substring(1);
        }
        return "/api/cleaner-support/v2/media/files/" + relativePath;
    }
    
    /**
     * 生成OSS文件访问URL
     */
    private String generateOssFileUrl(String storageKey) {
        if (storageKey == null) {
            return null;
        }
        // TODO: 实现 OSS 服务，生成访问URL
        // 示例：return ossService.generateUrl(storageKey);
        return null;
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
