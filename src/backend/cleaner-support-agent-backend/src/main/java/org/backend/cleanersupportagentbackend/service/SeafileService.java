package org.backend.cleanersupportagentbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;

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
        
        if (repoToken == null || repoToken.trim().isEmpty()) {
            String errorMsg = String.format(
                "Seafile repo-token 未配置！\n" +
                "  当前值: %s\n" +
                "  请检查:\n" +
                "  1. application.yml 中的 seafile.repo-token 配置\n" +
                "  2. 环境变量 SEAFILE_REPO_TOKEN 是否设置为空字符串（会覆盖默认值）\n" +
                "  3. 确保配置格式正确: seafile.repo-token: ${SEAFILE_REPO_TOKEN:your-default-token}",
                repoToken == null ? "null" : "空字符串"
            );
            System.err.println("[SeafileService] 配置错误: " + errorMsg);
            throw new IllegalStateException(errorMsg);
        }
        if (serverUrl == null || serverUrl.trim().isEmpty()) {
            throw new IllegalStateException(
                "Seafile server-url 未配置！请检查 application.yml 中的 seafile.server-url 或环境变量 SEAFILE_SERVER_URL"
            );
        }
        if (repoId == null || repoId.trim().isEmpty()) {
            throw new IllegalStateException(
                "Seafile repo-id 未配置！请检查 application.yml 中的 seafile.repo-id 或环境变量 SEAFILE_REPO_ID"
            );
        }
        System.out.println("[SeafileService] 配置初始化成功");
    }

    /**
     * 获取文件下载链接
     *
     * @param filePath 文件在 Seafile 中的路径
     * @return 下载链接（临时链接，有时效性）
     */
    public String getDownloadLink(String filePath) {
        String url = serverUrl + "/api/v2.1/via-repo-token/download-link/";
    
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + repoToken);
    
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("repo_id", repoId);
    
        // ✅ 直接使用原始路径，不要手动编码！！
        
        String encodedPath = URLEncoder.encode(filePath, StandardCharsets.UTF_8).replace("+", "%20");
        params.add("path", encodedPath); 
    
        if (StringUtils.hasText(repoPassword)) {
            params.add("password", repoPassword);
        }
    
        HttpEntity<?> entity = new HttpEntity<>(headers);
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParams(params);
    
        try {
            // 打印最终请求 URL，调试用
            String finalUrl = builder.toUriString();
            System.out.println("[DEBUG] 最终请求 URL: " + finalUrl);
    
            ResponseEntity<String> response = restTemplate.exchange(
                    finalUrl,
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
            } else {
                System.err.println("[ERROR] 获取下载链接失败，状态码: " + response.getStatusCode());
                System.err.println("[ERROR] 响应内容: " + response.getBody());
            }
        } catch (Exception e) {
            throw new RuntimeException("获取下载链接失败: " + e.getMessage() + ", request: " + builder.toUriString(), e);
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
        return repoToken;
    }
}
