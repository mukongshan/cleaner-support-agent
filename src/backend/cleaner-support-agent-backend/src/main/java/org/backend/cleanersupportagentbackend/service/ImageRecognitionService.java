package org.backend.cleanersupportagentbackend.service;

import org.backend.cleanersupportagentbackend.dto.ImageRecognitionHistoryResponse;
import org.backend.cleanersupportagentbackend.dto.ImageRecognitionResponse;
import org.backend.cleanersupportagentbackend.entity.ImageRecognition;
import org.backend.cleanersupportagentbackend.entity.RecognitionStatus;
import org.backend.cleanersupportagentbackend.entity.User;
import org.backend.cleanersupportagentbackend.repository.ImageRecognitionRepository;
import org.backend.cleanersupportagentbackend.util.IdGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 图片识别服务
 */
@Service
public class ImageRecognitionService {

    private final ImageRecognitionRepository imageRecognitionRepository;
    private final QwenVLClient qwenVLClient;
    private final UserService userService;
    
    @Value("${app.image-recognition.upload-dir:./data/images}")
    private String uploadDir;
    
    @Value("${app.image-recognition.max-file-size:10485760}")
    private long maxFileSize; // 10MB
    
    @Value("${app.image-recognition.allowed-formats:jpg,jpeg,png,webp}")
    private String allowedFormats;

    public ImageRecognitionService(ImageRecognitionRepository imageRecognitionRepository,
                                   QwenVLClient qwenVLClient,
                                   UserService userService) {
        this.imageRecognitionRepository = imageRecognitionRepository;
        this.qwenVLClient = qwenVLClient;
        this.userService = userService;
    }

    /**
     * 上传图片并识别
     */
    @Transactional
    public ImageRecognitionResponse recognizeImage(String userId, MultipartFile image) throws IOException {
        User user = userService.getUserByUserId(userId);
        
        // 验证图片格式
        validateImage(image);
        
        // 创建上传目录
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String originalFilename = image.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase()
                : "jpg";

        // 保存图片并完成识别
        Path filePath = saveBytesToFile(uploadPath, image.getBytes(), extension);
        return recognizeFromSavedFile(user, filePath, extension);
    }

    /**
     * base64方式识别（便于联调/自动化，不依赖本地图片文件）
     */
    @Transactional
    public ImageRecognitionResponse recognizeImageBase64(String userId, String base64, String format) throws IOException {
        User user = userService.getUserByUserId(userId);

        if (base64 == null || base64.isBlank()) {
            throw new IllegalArgumentException("base64不能为空");
        }

        // 创建上传目录
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 支持 data URI：data:image/png;base64,xxxx
        String resolvedFormat = format;
        String resolvedBase64 = base64.trim();
        if (resolvedBase64.startsWith("data:")) {
            int commaIdx = resolvedBase64.indexOf(',');
            if (commaIdx > 0) {
                String meta = resolvedBase64.substring(0, commaIdx);
                resolvedBase64 = resolvedBase64.substring(commaIdx + 1);
                // meta 示例：data:image/png;base64
                int slash = meta.indexOf('/');
                int semi = meta.indexOf(';');
                if (slash > 0 && semi > slash) {
                    resolvedFormat = meta.substring(slash + 1, semi);
                }
            }
        }

        if (resolvedFormat == null || resolvedFormat.isBlank()) {
            resolvedFormat = "png";
        }
        resolvedFormat = resolvedFormat.toLowerCase();

        // 简单复用 allowedFormats 规则
        validateExtension(resolvedFormat);

        byte[] imageBytes;
        try {
            imageBytes = java.util.Base64.getDecoder().decode(resolvedBase64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("base64解析失败：" + e.getMessage());
        }

        if (imageBytes.length > maxFileSize) {
            throw new IllegalArgumentException("图片大小不能超过 " + (maxFileSize / 1024 / 1024) + "MB");
        }

        Path filePath = saveBytesToFile(uploadPath, imageBytes, resolvedFormat);
        return recognizeFromSavedFile(user, filePath, resolvedFormat);
    }

    /**
     * 根据ID获取识别结果
     */
    public ImageRecognition getRecognitionById(String recognitionId) {
        return imageRecognitionRepository.findByRecognitionId(recognitionId)
                .orElseThrow(() -> new RuntimeException("图片识别记录不存在"));
    }

    /**
     * 获取用户的识别历史
     */
    public ImageRecognitionHistoryResponse getUserRecognitions(String userId, String status, int page, int size) {
        User user = userService.getUserByUserId(userId);
        Pageable pageable = PageRequest.of(page - 1, size);
        
        Page<ImageRecognition> recognitions;
        if (status != null && !status.isBlank()) {
            try {
                RecognitionStatus statusEnum = RecognitionStatus.valueOf(status);
                recognitions = imageRecognitionRepository.findByUserAndStatus(user, statusEnum, pageable);
            } catch (IllegalArgumentException e) {
                recognitions = imageRecognitionRepository.findByUser(user, pageable);
            }
        } else {
            recognitions = imageRecognitionRepository.findByUser(user, pageable);
        }
        
        List<ImageRecognitionResponse> items = recognitions.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return ImageRecognitionHistoryResponse.builder()
                .total(recognitions.getTotalElements())
                .page(page)
                .size(size)
                .items(items)
                .build();
    }

    /**
     * 验证图片格式和大小
     */
    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("图片文件不能为空");
        }
        
        // 验证文件大小
        if (image.getSize() > maxFileSize) {
            throw new IllegalArgumentException("图片大小不能超过 " + (maxFileSize / 1024 / 1024) + "MB");
        }
        
        // 验证文件格式
        String originalFilename = image.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("无法获取文件名");
        }

        if (!originalFilename.contains(".")) {
            throw new IllegalArgumentException("文件名缺少扩展名");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        validateExtension(extension);
    }

    private void validateExtension(String extension) {
        String[] allowed = allowedFormats.split(",");
        for (String format : allowed) {
            if (format.trim().equalsIgnoreCase(extension)) {
                return;
            }
        }
        throw new IllegalArgumentException("不支持的图片格式，仅支持：" + allowedFormats);
    }

    private Path saveBytesToFile(Path uploadPath, byte[] bytes, String extension) throws IOException {
        String filename = UUID.randomUUID().toString() + "." + extension;
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, bytes);
        return filePath;
    }

    private ImageRecognitionResponse recognizeFromSavedFile(User user, Path filePath, String extension) {
        // 生成识别ID
        String recognitionId = IdGenerator.generateRecognitionId();

        // 构建图片URL
        String filename = filePath.getFileName().toString();
        String imageUrl = "/api/cleaner-support/v2/media/images/" + filename;

        // 创建识别记录（初始状态为pending）
        ImageRecognition recognition = ImageRecognition.builder()
                .recognitionId(recognitionId)
                .user(user)
                .imageUrl(imageUrl)
                .imagePath(filePath.toString())
                .status(RecognitionStatus.pending)
                .build();
        imageRecognitionRepository.save(recognition);

        try {
            // 更新状态为processing
            recognition.setStatus(RecognitionStatus.processing);
            imageRecognitionRepository.save(recognition);

            // 读取图片字节
            byte[] imageBytes = Files.readAllBytes(filePath);

            // 调用Qwen-VL API识别图片
            String description = qwenVLClient.recognizeImage(imageBytes, extension);

            // 更新识别结果
            recognition.setDescription(description);
            recognition.setStatus(RecognitionStatus.completed);
            imageRecognitionRepository.save(recognition);

            return toResponse(recognition);
        } catch (Exception e) {
            // 识别失败，更新状态和错误信息
            recognition.setStatus(RecognitionStatus.failed);
            recognition.setErrorMessage(e.getMessage());
            imageRecognitionRepository.save(recognition);

            throw new RuntimeException("图片识别失败：" + e.getMessage(), e);
        }
    }

    /**
     * 转换为响应DTO
     */
    private ImageRecognitionResponse toResponse(ImageRecognition recognition) {
        return ImageRecognitionResponse.builder()
                .recognitionId(recognition.getRecognitionId())
                .imageUrl(recognition.getImageUrl())
                .description(recognition.getDescription())
                .status(recognition.getStatus().name())
                .createdAt(recognition.getCreatedAt())
                .build();
    }
}
