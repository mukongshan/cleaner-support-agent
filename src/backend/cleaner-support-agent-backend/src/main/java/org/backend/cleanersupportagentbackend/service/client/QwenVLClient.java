package org.backend.cleanersupportagentbackend.service.client;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Qwen-VL API 客户端
 * 用于调用通义千问视觉语言模型API进行图片识别
 */
@Component
public class QwenVLClient {

    private static final Logger logger = LoggerFactory.getLogger(QwenVLClient.class);
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${app.image-recognition.qwen-vl.api-url:https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation}")
    private String apiUrl;
    
    @Value("${app.image-recognition.qwen-vl.api-key:}")
    private String apiKey;
    
    @Value("${app.image-recognition.qwen-vl.model:qwen-vl-plus}")
    private String model;
    
    @Value("${app.image-recognition.qwen-vl.timeout:30000}")
    private int timeout;
    
    @Value("${app.image-recognition.qwen-vl.max-retries:3}")
    private int maxRetries;

    /**
     * 本地联调/演示用：开启后不调用外部API，直接返回模拟描述
     */
    @Value("${app.image-recognition.qwen-vl.mock:false}")
    private boolean mockEnabled;

    public QwenVLClient() {
        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 调用视觉识别API识别图片
     * 
     * @param imageBytes 图片字节数组
     * @param imageFormat 图片格式（如 jpg, png）
     * @return 图片描述文本
     */
    public String recognizeImage(byte[] imageBytes, String imageFormat) {
        try {
            if (mockEnabled) {
                int size = imageBytes != null ? imageBytes.length : 0;
                return "MOCK: 已接收到图片（format=" + imageFormat + ", bytes=" + size + "）。" +
                        "如需真实识别，请配置环境变量 QWEN_VL_API_KEY 并关闭 mock。";
            }

            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalStateException("未配置Qwen-VL API Key：请设置环境变量 QWEN_VL_API_KEY，" +
                        "或在 application.yml 配置 app.image-recognition.qwen-vl.api-key；" +
                        "本地联调可临时开启 app.image-recognition.qwen-vl.mock=true。");
            }

            // 将图片转换为base64
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String imageDataUri = "data:image/" + imageFormat + ";base64," + base64Image;
            
            // 构建请求体
            Map<String, Object> requestBody = buildRequest(imageDataUri);
            
            // 调用API
            logger.info("调用Qwen-VL API，URL: {}", apiUrl);
            logger.debug("请求体大小: {} bytes", objectMapper.writeValueAsString(requestBody).length());
            
            String responseBody = webClient.post()
                    .uri(apiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .map(body -> new RuntimeException("Qwen-VL HTTP错误：" +
                                            clientResponse.statusCode().value() + " " +
                                            clientResponse.statusCode().toString() +
                                            (body.isBlank() ? "" : ("，body=" + body)))))
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(timeout))
                    // 仅对“可恢复”的异常做重试；并在重试耗尽时抛出最后一次失败原因（不要只返回 retries exhausted）
                    .retryWhen(Retry.fixedDelay(maxRetries, Duration.ofSeconds(1))
                            .filter(this::isRetryable)
                            .onRetryExhaustedThrow((spec, signal) -> signal.failure()))
                    .block();
            
            // 记录API响应（截取前500字符避免日志过长）
            if (responseBody != null) {
                String preview = responseBody.length() > 500 ? responseBody.substring(0, 500) + "..." : responseBody;
                logger.info("Qwen-VL API响应预览: {}", preview);
            } else {
                logger.warn("Qwen-VL API返回空响应");
            }
            
            // 解析响应
            String description = parseResponse(responseBody);
            logger.info("解析得到的描述长度: {} 字符", description != null ? description.length() : 0);
            
            return description;
        } catch (Exception e) {
            // 把根因尽量带出来，方便联调定位（DNS/超时/401/403/5xx等）
            Throwable root = e;
            while (root.getCause() != null && root.getCause() != root) {
                root = root.getCause();
            }
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            String rootMsg = root.getMessage() != null ? root.getMessage() : root.getClass().getSimpleName();
            throw new RuntimeException("图片识别失败：" + msg + (root != e ? "；root=" + rootMsg : ""), e);
        }
    }

    private boolean isRetryable(Throwable t) {
        if (t == null) {
            return false;
        }
        // 业务/鉴权错误（例如 401/403）不重试
        String msg = t.getMessage() != null ? t.getMessage() : "";
        if (msg.contains("401") || msg.contains("403")) {
            return false;
        }
        // 其他网络类/5xx/超时等交给重试
        return true;
    }

    /**
     * 构建API请求体
     */
    private Map<String, Object> buildRequest(String imageDataUri) {
        Map<String, Object> request = new HashMap<>();
        request.put("model", model);
        
        // 构建input
        Map<String, Object> input = new HashMap<>();
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        
        // 构建content数组
        java.util.List<Map<String, Object>> content = new java.util.ArrayList<>();
        
        // 添加图片
        Map<String, Object> imageContent = new HashMap<>();
        imageContent.put("image", imageDataUri);
        content.add(imageContent);
        
        // 添加文本提示词
        Map<String, Object> textContent = new HashMap<>();
        textContent.put("text", "请详细描述这张图片中的内容，特别是与清洁机器人相关的故障或问题。包括：1. 机器人的状态和外观 2. 可见的错误代码或指示灯 3. 可能存在的故障或异常情况 4. 任何与清洁、维护相关的细节");
        content.add(textContent);
        
        message.put("content", content);
        
        java.util.List<Map<String, Object>> messages = new java.util.ArrayList<>();
        messages.add(message);
        input.put("messages", messages);
        
        request.put("input", input);
        
        // 构建parameters
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("max_tokens", 1000);
        request.put("parameters", parameters);
        
        return request;
    }

    /**
     * 解析API响应
     */
    private String parseResponse(String responseBody) {
        try {
            if (responseBody == null || responseBody.trim().isEmpty()) {
                logger.error("API响应为空");
                throw new RuntimeException("API响应为空");
            }
            
            JsonNode rootNode = objectMapper.readTree(responseBody);
            // 记录响应结构用于调试
            if (logger.isDebugEnabled()) {
                java.util.Iterator<String> fieldNames = rootNode.fieldNames();
                java.util.List<String> fields = new java.util.ArrayList<>();
                while (fieldNames.hasNext()) {
                    fields.add(fieldNames.next());
                }
                logger.debug("API响应根节点字段: {}", String.join(", ", fields));
            }
            
            // 检查是否有错误
            if (rootNode.has("code")) {
                String code = rootNode.get("code").asText();
                logger.debug("API响应code字段: {}", code);
                if (!code.equals("Success")) {
                    String errorMessage = rootNode.has("message") 
                        ? rootNode.get("message").asText() 
                        : "API调用失败";
                    logger.error("Qwen-VL API错误: code={}, message={}", code, errorMessage);
                    throw new RuntimeException("Qwen-VL API错误：" + errorMessage);
                }
            }
            
            // 提取识别结果
            JsonNode outputNode = rootNode.get("output");
            if (outputNode == null) {
                logger.error("API响应缺少output字段，完整响应: {}", responseBody);
                throw new RuntimeException("API响应格式错误：缺少output字段");
            }
            
            JsonNode choicesNode = outputNode.get("choices");
            if (choicesNode == null || !choicesNode.isArray() || choicesNode.size() == 0) {
                logger.error("API响应缺少choices字段，output内容: {}", outputNode.toString());
                throw new RuntimeException("API响应格式错误：缺少choices字段");
            }
            
            JsonNode firstChoice = choicesNode.get(0);
            JsonNode messageNode = firstChoice.get("message");
            if (messageNode == null) {
                logger.error("API响应缺少message字段，choice内容: {}", firstChoice.toString());
                throw new RuntimeException("API响应格式错误：缺少message字段");
            }
            
            JsonNode contentNode = messageNode.get("content");
            if (contentNode == null) {
                logger.error("API响应缺少content字段，message内容: {}", messageNode.toString());
                throw new RuntimeException("API响应格式错误：缺少content字段");
            }
            
            String description;
            // content可能是字符串或数组，需要分别处理
            if (contentNode.isTextual()) {
                // 如果是字符串，直接获取
                description = contentNode.asText();
            } else if (contentNode.isArray()) {
                // 如果是数组，提取所有文本内容
                StringBuilder sb = new StringBuilder();
                for (JsonNode item : contentNode) {
                    if (item.has("text")) {
                        sb.append(item.get("text").asText());
                    } else if (item.isTextual()) {
                        sb.append(item.asText());
                    }
                }
                description = sb.toString();
            } else {
                // 尝试直接转换为字符串
                description = contentNode.asText();
            }
            
            logger.info("成功解析描述，长度: {} 字符", description != null ? description.length() : 0);
            if (description != null && !description.isEmpty()) {
                logger.debug("描述内容预览: {}", description.length() > 100 ? description.substring(0, 100) + "..." : description);
            } else {
                logger.warn("解析得到的描述为空，content节点类型: {}, 内容: {}", contentNode.getNodeType(), contentNode.toString());
            }
            
            return description != null ? description : "";
        } catch (JsonProcessingException e) {
            throw new RuntimeException("解析API响应失败：" + e.getMessage(), e);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("解析API响应失败：" + e.getMessage(), e);
        }
    }
}
