package org.backend.cleanersupportagentbackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Dify AI 平台配置类
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app.dify")
public class DifyConfig {

    /**
     * Dify API 基础URL
     */
    private String baseUrl = "http://dify.seec.seecoder.cn/v1";

    /**
     * Dify API Key
     */
    private String apiKey;

    /**
     * 用户标识前缀，用于区分不同应用的用户
     */
    private String userPrefix = "__CSA_developer_";

    /**
     * SSE连接超时时间（毫秒）
     */
    private long timeout = 60000;

    /**
     * 检查配置是否有效
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * 生成Dify用户标识
     */
    public String getDifyUserId(String userId) {
        return userPrefix + userId;
    }
}
