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
import java.nio.file.StandardCopyOption;
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
        
        // 生成唯一文件名
        String originalFilename = image.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase()
                : "jpg";
        String filename = UUID.randomUUID().toString() + "." + extension;
        Path filePath = uploadPath.resolve(filename);
        
        // 保存图片文件
        Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // 生成识别ID
        String recognitionId = IdGenerator.generateRecognitionId();
        
        // 构建图片URL
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
        
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        String[] allowed = allowedFormats.split(",");
        boolean isValid = false;
        for (String format : allowed) {
            if (format.trim().equalsIgnoreCase(extension)) {
                isValid = true;
                break;
            }
        }
        
        if (!isValid) {
            throw new IllegalArgumentException("不支持的图片格式，仅支持：" + allowedFormats);
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
