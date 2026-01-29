package org.backend.cleanersupportagentbackend.service.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DeepSeek API 客户端（OpenAI Compatible Chat Completions）
 *
 * 说明：为了工期，当前实现为“非流式”调用，AiService 仍以 SSE 一次性推送最终 answer。
 */
@Component
public class DeepSeekClient {

    private static final Logger logger = LoggerFactory.getLogger(DeepSeekClient.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.deepseek.api-url:https://api.deepseek.com/chat/completions}")
    private String apiUrl;

    @Value("${app.ai.deepseek.api-key:}")
    private String apiKey;

    @Value("${app.ai.deepseek.model:deepseek-chat}")
    private String model;

    @Value("${app.ai.deepseek.timeout:60000}")
    private int timeoutMs;

    @Value("${app.ai.deepseek.max-retries:1}")
    private int maxRetries;

    public DeepSeekClient(ObjectMapper objectMapper) {
        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = objectMapper;
    }

    /**
     * @param messages OpenAI 规范 messages：role=user/assistant/system, content=...
     */
    public String chat(List<Map<String, String>> messages) {
        logger.info("开始调用 DeepSeek API，URL: {}, Model: {}, Messages数量: {}", apiUrl, model, messages.size());
        
        if (apiKey == null || apiKey.isBlank()) {
            logger.error("DeepSeek API Key 未配置");
            throw new IllegalStateException("未配置 DeepSeek API Key：请设置环境变量 DEEPSEEK_API_KEY，或在 application.yml 配置 app.ai.deepseek.api-key");
        }
        
        // 隐藏 API Key 的前8位用于日志
        String maskedKey = apiKey.length() > 8 ? apiKey.substring(0, 8) + "..." : "***";
        logger.debug("使用 API Key: {}", maskedKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("stream", false);

        try {
            logger.debug("发送请求到 DeepSeek API");
            String responseBody = webClient.post()
                    .uri(apiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .map(body -> {
                                        logger.error("DeepSeek API 返回错误状态: {} {}, body: {}", 
                                                clientResponse.statusCode().value(), 
                                                clientResponse.statusCode().toString(),
                                                body.length() > 500 ? body.substring(0, 500) + "..." : body);
                                        return new RuntimeException("DeepSeek HTTP错误：" +
                                                clientResponse.statusCode().value() + " " +
                                                clientResponse.statusCode().toString() +
                                                (body.isBlank() ? "" : ("，body=" + body)));
                                    }))
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .retryWhen(Retry.fixedDelay(Math.max(0, maxRetries), Duration.ofSeconds(1))
                            .filter(this::isRetryable)
                            .onRetryExhaustedThrow((spec, signal) -> signal.failure()))
                    .block();

            logger.debug("收到 DeepSeek API 响应，长度: {} 字符", responseBody != null ? responseBody.length() : 0);
            String answer = parseAnswer(responseBody);
            logger.info("DeepSeek API 调用成功，返回答案长度: {} 字符", answer != null ? answer.length() : 0);
            return answer;
        } catch (Exception e) {
            Throwable root = e;
            while (root.getCause() != null && root.getCause() != root) {
                root = root.getCause();
            }
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            String rootMsg = root.getMessage() != null ? root.getMessage() : root.getClass().getSimpleName();
            logger.error("DeepSeek调用失败: {}, root: {}", msg, rootMsg, e);
            throw new RuntimeException("DeepSeek调用失败：" + msg + (root != e ? "；root=" + rootMsg : ""), e);
        }
    }

    private boolean isRetryable(Throwable t) {
        if (t == null) {
            return false;
        }
        // 鉴权错误不重试
        String msg = t.getMessage() != null ? t.getMessage() : "";
        if (msg.contains("401") || msg.contains("403")) {
            return false;
        }
        return true;
    }

    private String parseAnswer(String responseBody) {
        try {
            if (responseBody == null || responseBody.isBlank()) {
                throw new RuntimeException("DeepSeek返回空响应");
            }
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.get("choices");
            if (choices == null || !choices.isArray() || choices.isEmpty()) {
                throw new RuntimeException("DeepSeek响应格式错误：缺少choices");
            }
            JsonNode first = choices.get(0);
            JsonNode message = first.get("message");
            if (message == null) {
                throw new RuntimeException("DeepSeek响应格式错误：缺少message");
            }
            JsonNode content = message.get("content");
            if (content == null) {
                throw new RuntimeException("DeepSeek响应格式错误：缺少content");
            }
            return content.asText("");
        } catch (Exception e) {
            throw new RuntimeException("解析DeepSeek响应失败：" + e.getMessage(), e);
        }
    }
}

