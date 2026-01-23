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

    @Value("${seafile.server-url}")
    private String serverUrl;

    @Value("${seafile.repo-token}")
    private String repoToken;

    @Value("${seafile.repo-id}")
    private String repoId;

    @Value("${seafile.repo-password:}")
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
        params.add("path", filePath);
        if (StringUtils.hasText(repoPassword)) {
            params.add("password", repoPassword);
        }

        HttpEntity<?> entity = new HttpEntity<>(headers);
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParams(params);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                String downloadUrl = response.getBody();
                // 清理响应中的引号
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
        try {
            String encodedPath = URLEncoder.encode(filePath, StandardCharsets.UTF_8);
            return String.format("%s/lib/%s/file/%s", serverUrl, repoId, encodedPath);
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
}
