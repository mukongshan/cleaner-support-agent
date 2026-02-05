package org.backend.cleanersupportagentbackend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Dify SSE 事件模型
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DifyEvent {

    /**
     * 事件类型：message, message_end, message_file, workflow_started,
     * node_started, node_finished, workflow_finished, error, ping
     */
    private String event;

    /**
     * AI回复片段（message事件）
     */
    private String answer;

    /**
     * Dify会话ID
     */
    @JsonProperty("conversation_id")
    private String conversationId;

    /**
     * Dify消息ID
     */
    @JsonProperty("message_id")
    private String messageId;

    /**
     * 任务ID（用于停止响应）
     */
    @JsonProperty("task_id")
    private String taskId;

    /**
     * 创建时间戳
     */
    @JsonProperty("created_at")
    private Long createdAt;

    /**
     * 元数据（message_end事件）
     */
    private DifyMetadata metadata;

    /**
     * 错误状态码（error事件）
     */
    private Integer status;

    /**
     * 错误码（error事件）
     */
    private String code;

    /**
     * 错误消息（error事件）
     */
    private String message;

    /**
     * 判断是否为需要转发给前端的事件
     */
    public boolean isForwardableEvent() {
        return "message".equals(event) || "message_end".equals(event);
    }

    /**
     * 判断是否为错误事件
     */
    public boolean isErrorEvent() {
        return "error".equals(event);
    }

    /**
     * 元数据模型
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DifyMetadata {
        private DifyUsage usage;

        @JsonProperty("retriever_resources")
        private List<DifyRetrieverResource> retrieverResources;
    }

    /**
     * 使用量信息
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DifyUsage {
        @JsonProperty("prompt_tokens")
        private Integer promptTokens;

        @JsonProperty("completion_tokens")
        private Integer completionTokens;

        @JsonProperty("total_tokens")
        private Integer totalTokens;
    }

    /**
     * 检索资源信息
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DifyRetrieverResource {
        private Integer position;

        @JsonProperty("dataset_id")
        private String datasetId;

        @JsonProperty("dataset_name")
        private String datasetName;

        @JsonProperty("document_id")
        private String documentId;

        @JsonProperty("document_name")
        private String documentName;

        @JsonProperty("segment_id")
        private String segmentId;

        private Double score;

        private String content;
    }
}
