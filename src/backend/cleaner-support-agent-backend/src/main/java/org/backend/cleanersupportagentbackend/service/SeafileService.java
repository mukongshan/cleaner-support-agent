package org.backend.cleanersupportagentbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import org.springframework.web.util.UriUtils;
import java.net.URI;

/**
 * Seafile 服务封装
 * 用于与 Seafile API 交互，获取文件下载链接和预览链接
 */
@Service
public class SeafileService {

    @Value("${seafile.server-url:https://box.nju.edu.cn}")
    private String serverUrl;

    @Value("${seafile.repo-token}")
    private String repoToken;

    @Value("${seafile.repo-id}")
    private String repoId;

    @Value("${seafile.repo-password}")
    private String repoPassword;

    private final RestTemplate restTemplate;
    private boolean enabled = true;

    // 支持在线预览的文件扩展名
    private static final Set<String> VIEWABLE_EXTENSIONS = Set.of(
            ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg",
            ".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".webm", ".ts",
            ".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"
    );

    public SeafileService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * 初始化后验证配置
     */
    @jakarta.annotation.PostConstruct
    public void init() {
        System.out.println("[SeafileService] 开始初始化配置...");
        System.out.println("  - serverUrl (raw): " + serverUrl);
        System.out.println("  - repoId (raw): " + repoId);
        System.out.println("  - repoToken (raw): " + (repoToken != null ? ("长度=" + repoToken.length() + ", 值=" + (repoToken.length() > 0 ? repoToken.substring(0, Math.min(8, repoToken.length())) + "..." : "空字符串")) : "null"));
        
        // 联调/测试环境：允许 Seafile 不配置（禁用相关能力，不影响其他模块启动）
        if (repoToken == null || repoToken.trim().isEmpty() ||
            serverUrl == null || serverUrl.trim().isEmpty() ||
            repoId == null || repoId.trim().isEmpty()) {
            enabled = false;
            System.err.println("[SeafileService] 配置不完整，已禁用Seafile能力（不影响其他功能启动）。");
            System.err.println("  - 请配置 seafile.server-url / seafile.repo-id / seafile.repo-token 以启用下载/预览。");
            return;
        }

        enabled = true;
        System.out.println("[SeafileService] 配置初始化成功");
    }

    /**
     * 获取文件下载链接
     *
     * @param filePath 文件在 Seafile 中的路径
     * @return 下载链接（临时链接，有时效性）
     */
    public String getDownloadLink(String filePath) {
        if (!enabled) {
            return null;
        }
        // 1. 基础 URL
        String baseUrl = serverUrl + "/api/v2.1/via-repo-token/download-link/";
    
        // 2. 手动对每一个参数进行严格编码
        // 特别是 filePath，必须把 "/" 编码为 "%2F"
        String encodedPath = UriUtils.encode(filePath, StandardCharsets.UTF_8);
        String encodedRepoId = UriUtils.encode(repoId, StandardCharsets.UTF_8);
    
        // 3. 手动拼接 URL 字符串
        StringBuilder urlBuilder = new StringBuilder(baseUrl);
        urlBuilder.append("?repo_id=").append(encodedRepoId);
        urlBuilder.append("&path=").append(encodedPath);
    
        if (StringUtils.hasText(repoPassword)) {
            urlBuilder.append("&password=").append(UriUtils.encode(repoPassword, StandardCharsets.UTF_8));
        }
    
        try {
            // 4. 关键：转换为 java.net.URI 对象，防止 RestTemplate 二次编码
            URI finalUri = new URI(urlBuilder.toString());
            
            System.out.println("[DEBUG] 最终请求 URI: " + finalUri);
    
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + repoToken);
            HttpEntity<?> entity = new HttpEntity<>(headers);
    
            ResponseEntity<String> response = restTemplate.exchange(
                    finalUri, // 传入 URI 对象
                    HttpMethod.GET,
                    entity,
                    String.class
            );
    
            if (response.getStatusCode().is2xxSuccessful()) {
                String downloadUrl = response.getBody();
                if (downloadUrl != null) {
                    downloadUrl = downloadUrl.trim().replaceAll("^[\"']|[\"']$", "");
                }
                return downloadUrl;
            }
        } catch (Exception e) {
            throw new RuntimeException("获取下载链接失败: " + e.getMessage(), e);
        }
        return null;
    }

    /**
     * 生成 Web 预览链接
     *
     * @param filePath 文件在 Seafile 中的路径
     * @return 预览链接
     */
    public String generatePreviewUrl(String filePath) {
        if (!enabled) {
            return null;
        }
        try {
            String encodedPath = URLEncoder.encode(filePath, StandardCharsets.UTF_8).replace("+", "%20");
            return String.format("%s/lib/%s/file%s", serverUrl, repoId, encodedPath);
        } catch (Exception e) {
            throw new RuntimeException("生成预览链接失败: " + e.getMessage(), e);
        }
    }

    /**
     * 判断文件是否支持在线预览
     *
     * @param filePath 文件路径
     * @return 是否可预览
     */
    public boolean isViewableFile(String filePath) {
        String extension = extractExtension(filePath);
        return VIEWABLE_EXTENSIONS.contains(extension.toLowerCase());
    }

    /**
     * 提取文件扩展名
     *
     * @param filePath 文件路径
     * @return 扩展名（包含点号）
     */
    private String extractExtension(String filePath) {
        int lastDot = filePath.lastIndexOf('.');
        if (lastDot > 0 && lastDot < filePath.length() - 1) {
            return filePath.substring(lastDot);
        }
        return "";
    }

    /**
     * 获取 Repository Token
     *
     * @return repoToken
     */
    public String getRepoToken() {
        return enabled ? repoToken : null;
    }

    public boolean isEnabled() {
        return enabled;
    }
}
