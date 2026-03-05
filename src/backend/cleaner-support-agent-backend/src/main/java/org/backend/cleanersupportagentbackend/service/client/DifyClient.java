package org.backend.cleanersupportagentbackend.service.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.backend.cleanersupportagentbackend.config.DifyConfig;
import org.backend.cleanersupportagentbackend.dto.DifyEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

/**
 * Dify API 客户端
 * 负责与 Dify AI 平台通信，处理 SSE 流式响应
 */
@Service
public class DifyClient {

    private static final Logger logger = LoggerFactory.getLogger(DifyClient.class);

    private final DifyConfig difyConfig;
    private final ObjectMapper objectMapper;
    private final ExecutorService executorService;
    // taskId -> 正在进行的 HttpURLConnection，用于主动中断流
    private final ConcurrentHashMap<String, HttpURLConnection> activeConnections = new ConcurrentHashMap<>();

    public DifyClient(DifyConfig difyConfig, ObjectMapper objectMapper) {
        this.difyConfig = difyConfig;
        this.objectMapper = objectMapper;
        this.executorService = Executors.newCachedThreadPool();
    }

    /**
     * 取消指定任务的 Dify 流式请求。
     * 调用 HttpURLConnection.disconnect() 关闭底层 Socket，
     * 使读取线程中的 readLine() 抛出 IOException 从而退出循环。
     */
    public void cancelStream(String taskId) {
        HttpURLConnection conn = activeConnections.remove(taskId);
        if (conn != null) {
            logger.info("Cancelling Dify stream for task: {}", taskId);
            conn.disconnect();
        }
    }

    /**
     * 发送聊天消息并以流式方式接收响应
     *
     * @param taskId              任务ID（通常为本地 conversationId），用于取消流
     * @param userId              系统用户ID
     * @param query               用户查询内容
     * @param difyConversationId  Dify会话ID（新会话时为null）
     * @param onEvent             事件回调
     * @param onError             错误回调
     * @param onComplete          完成回调
     */
    public void streamChat(String taskId, String userId, String query, String difyConversationId,
                           Consumer<DifyEvent> onEvent,
                           Consumer<Exception> onError,
                           Runnable onComplete) {

        if (!difyConfig.isConfigured()) {
            onError.accept(new RuntimeException("AI服务未配置，请联系管理员配置 Dify API Key"));
            return;
        }

        executorService.submit(() -> {
            HttpURLConnection connection = null;
            try {
                // 构建请求URL
                URL url = new URL(difyConfig.getBaseUrl() + "/chat-messages");
                connection = (HttpURLConnection) url.openConnection();

                // 设置请求属性
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Authorization", "Bearer " + difyConfig.getApiKey());
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("Accept", "text/event-stream");
                connection.setConnectTimeout((int) difyConfig.getTimeout());
                connection.setReadTimeout((int) difyConfig.getTimeout());
                connection.setDoOutput(true);

                // 注册连接，以便外部可通过 cancelStream() 中断
                activeConnections.put(taskId, connection);

                // 构建请求体
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("query", query);
                requestBody.put("inputs", new HashMap<>());
                requestBody.put("response_mode", "streaming");
                requestBody.put("user", difyConfig.getDifyUserId(userId));
                requestBody.put("auto_generate_name", true);

                // 如果有现有会话ID，则传递
                if (difyConversationId != null && !difyConversationId.isBlank()) {
                    requestBody.put("conversation_id", difyConversationId);
                }

                String jsonBody = objectMapper.writeValueAsString(requestBody);
                logger.debug("Dify request: {}", jsonBody);

                // 发送请求
                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

                // 检查响应状态
                int responseCode = connection.getResponseCode();
                if (responseCode != 200) {
                    String errorResponse = readErrorResponse(connection);
                    logger.error("Dify API error: {} - {}", responseCode, errorResponse);
                    onError.accept(new RuntimeException(parseErrorMessage(responseCode, errorResponse)));
                    return;
                }

                // 读取SSE流
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data:")) {
                            String jsonData = line.substring(5).trim();
                            if (!jsonData.isEmpty()) {
                                try {
                                    DifyEvent event = objectMapper.readValue(jsonData, DifyEvent.class);
                                    logger.debug("Dify event: {}", event.getEvent());

                                    // 处理错误事件
                                    if (event.isErrorEvent()) {
                                        onError.accept(new RuntimeException(
                                                event.getMessage() != null ? event.getMessage() : "AI服务返回错误"));
                                        return;
                                    }

                                    // 转发需要的事件
                                    if (event.isForwardableEvent()) {
                                        onEvent.accept(event);
                                    }
                                } catch (Exception e) {
                                    logger.warn("Failed to parse SSE event: {}", jsonData, e);
                                    // 继续处理下一个事件，不中断流
                                }
                            }
                        }
                        // 忽略空行和其他格式的行
                    }
                }

                onComplete.run();

            } catch (java.net.SocketTimeoutException e) {
                logger.error("Dify API timeout", e);
                onError.accept(new RuntimeException("AI服务响应超时，请重试"));
            } catch (java.net.ConnectException e) {
                logger.error("Dify API connection error", e);
                onError.accept(new RuntimeException("无法连接到AI服务，请稍后重试"));
            } catch (Exception e) {
                logger.error("Dify API error", e);
                onError.accept(new RuntimeException("AI服务暂时不可用：" + e.getMessage()));
            } finally {
                activeConnections.remove(taskId);
                if (connection != null) {
                    connection.disconnect();
                }
            }
        });
    }

    /**
     * 读取错误响应
     */
    private String readErrorResponse(HttpURLConnection connection) {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(connection.getErrorStream(), StandardCharsets.UTF_8))) {
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            return response.toString();
        } catch (Exception e) {
            return "Unable to read error response";
        }
    }

    /**
     * 解析错误消息，返回友好提示
     */
    private String parseErrorMessage(int statusCode, String errorResponse) {
        switch (statusCode) {
            case 400:
                if (errorResponse.contains("invalid_param")) {
                    return "请求参数错误，请重试";
                } else if (errorResponse.contains("provider_quota_exceeded")) {
                    return "AI服务配额已用尽，请联系管理员";
                } else if (errorResponse.contains("model_currently_not_support")) {
                    return "AI模型暂时不可用，请稍后重试";
                }
                return "请求格式错误，请重试";
            case 401:
                return "AI服务认证失败，请联系管理员";
            case 404:
                return "会话不存在";
            case 500:
                return "AI服务内部错误，请稍后重试";
            default:
                return "AI服务异常（错误码：" + statusCode + "），请稍后重试";
        }
    }
}
