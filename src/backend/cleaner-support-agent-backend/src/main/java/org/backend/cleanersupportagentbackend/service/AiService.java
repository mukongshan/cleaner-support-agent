package org.backend.cleanersupportagentbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.backend.cleanersupportagentbackend.config.DifyConfig;
import org.backend.cleanersupportagentbackend.dto.ChatRequest;
import org.backend.cleanersupportagentbackend.dto.ConversationDetailResponse;
import org.backend.cleanersupportagentbackend.dto.ConversationSummaryResponse;
import org.backend.cleanersupportagentbackend.dto.DifyEvent;
import org.backend.cleanersupportagentbackend.dto.MessageResponse;
import org.backend.cleanersupportagentbackend.entity.Conversation;
import org.backend.cleanersupportagentbackend.entity.Message;
import org.backend.cleanersupportagentbackend.entity.User;
import org.backend.cleanersupportagentbackend.repository.ConversationRepository;
import org.backend.cleanersupportagentbackend.repository.MessageRepository;
import org.backend.cleanersupportagentbackend.util.IdGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

/**
 * AI对话服务
 * 集成 Dify AI 平台实现智能对话
 */
@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final DifyClient difyClient;
    private final DifyConfig difyConfig;
    private final ObjectMapper objectMapper;

    public AiService(ConversationRepository conversationRepository,
                     MessageRepository messageRepository,
                     @Lazy UserService userService,
                     DifyClient difyClient,
                     DifyConfig difyConfig,
                     ObjectMapper objectMapper) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.difyClient = difyClient;
        this.difyConfig = difyConfig;
        this.objectMapper = objectMapper;
    }

    /**
     * 发送AI对话消息（SSE流式响应）
     * 集成 Dify API 实现真实的AI对话
     */
    @Transactional
    public SseEmitter chat(String userId, ChatRequest request) {
        User user = userService.getUserByUserId(userId);

        // 获取或创建会话
        Conversation conversation;
        boolean isNewConversation = false;
        if (request.getConversationId() != null && !request.getConversationId().isBlank()) {
            conversation = conversationRepository.findByConversationId(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("会话不存在"));
        } else {
            isNewConversation = true;
            conversation = Conversation.builder()
                    .conversationId(IdGenerator.generateConversationId())
                    .user(user)
                    .title(extractTitle(request.getQuery()))
                    .build();
            conversationRepository.save(conversation);
        }

        // 保存用户消息
        Message userMessage = Message.builder()
                .conversation(conversation)
                .role(Message.MessageRole.user)
                .content(request.getQuery())
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(userMessage);

        // 创建SSE发射器
        SseEmitter emitter = new SseEmitter(difyConfig.getTimeout());

        // 用于累积AI回复和追踪Dify ID
        final AtomicReference<StringBuilder> fullAnswerRef = new AtomicReference<>(new StringBuilder());
        final AtomicReference<String> difyConversationIdRef = new AtomicReference<>(conversation.getDifyConversationId());
        final AtomicReference<String> difyMessageIdRef = new AtomicReference<>();
        final Conversation finalConversation = conversation;
        final boolean finalIsNewConversation = isNewConversation;

        // 设置SSE超时和错误处理
        emitter.onTimeout(() -> {
            logger.warn("SSE connection timed out for conversation: {}", finalConversation.getConversationId());
            emitter.complete();
        });

        emitter.onError(e -> {
            logger.error("SSE error for conversation: {}", finalConversation.getConversationId(), e);
        });

        // 调用Dify API
        difyClient.streamChat(
                userId,
                request.getQuery(),
                conversation.getDifyConversationId(),
                // onEvent: 处理Dify返回的事件
                (DifyEvent event) -> {
                    try {
                        if ("message".equals(event.getEvent())) {
                            // 累积回答内容
                            if (event.getAnswer() != null) {
                                fullAnswerRef.get().append(event.getAnswer());
                            }

                            // 保存Dify会话ID（首次收到时）
                            if (event.getConversationId() != null && difyConversationIdRef.get() == null) {
                                difyConversationIdRef.set(event.getConversationId());
                            }

                            // 保存Dify消息ID
                            if (event.getMessageId() != null) {
                                difyMessageIdRef.set(event.getMessageId());
                            }

                            // 转发事件到前端
                            sendSseEvent(emitter, event, finalConversation.getConversationId());

                        } else if ("message_end".equals(event.getEvent())) {
                            // 更新Dify会话ID
                            if (event.getConversationId() != null) {
                                difyConversationIdRef.set(event.getConversationId());
                            }

                            // 保存AI回复到本地数据库
                            saveAiResponse(finalConversation, fullAnswerRef.get().toString(),
                                    difyConversationIdRef.get(), difyMessageIdRef.get());

                            // 转发结束事件到前端
                            sendSseEvent(emitter, event, finalConversation.getConversationId());
                        }
                    } catch (Exception e) {
                        logger.error("Error processing Dify event", e);
                    }
                },
                // onError: 错误处理
                (Exception error) -> {
                    logger.error("Dify API error", error);
                    try {
                        sendErrorEvent(emitter, error.getMessage(), finalConversation.getConversationId());
                    } catch (Exception e) {
                        logger.error("Error sending error event", e);
                    }
                    emitter.complete();
                },
                // onComplete: 完成处理
                () -> {
                    try {
                        emitter.complete();
                    } catch (Exception e) {
                        logger.error("Error completing SSE emitter", e);
                    }
                }
        );

        return emitter;
    }

    /**
     * 发送SSE事件到前端
     */
    private void sendSseEvent(SseEmitter emitter, DifyEvent event, String localConversationId) {
        try {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("event", event.getEvent());
            eventData.put("conversation_id", localConversationId); // 使用本地会话ID

            if (event.getAnswer() != null) {
                eventData.put("answer", event.getAnswer());
            }

            if (event.getMetadata() != null) {
                Map<String, Object> metadata = new HashMap<>();
                if (event.getMetadata().getRetrieverResources() != null) {
                    metadata.put("retriever_resources", event.getMetadata().getRetrieverResources());
                }
                if (event.getMetadata().getUsage() != null) {
                    metadata.put("usage", event.getMetadata().getUsage());
                }
                eventData.put("metadata", metadata);
            }

            String jsonData = objectMapper.writeValueAsString(eventData);
            emitter.send(SseEmitter.event()
                    .name(event.getEvent())
                    .data(jsonData));
        } catch (IOException e) {
            logger.error("Error sending SSE event", e);
        }
    }

    /**
     * 发送错误事件到前端
     */
    private void sendErrorEvent(SseEmitter emitter, String errorMessage, String localConversationId) {
        try {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("event", "message");
            eventData.put("conversation_id", localConversationId);
            eventData.put("answer", "抱歉，" + errorMessage);

            String jsonData = objectMapper.writeValueAsString(eventData);
            emitter.send(SseEmitter.event()
                    .name("message")
                    .data(jsonData));

            // 发送结束事件
            Map<String, Object> endEventData = new HashMap<>();
            endEventData.put("event", "message_end");
            endEventData.put("conversation_id", localConversationId);
            endEventData.put("metadata", new HashMap<>());

            String endJsonData = objectMapper.writeValueAsString(endEventData);
            emitter.send(SseEmitter.event()
                    .name("message_end")
                    .data(endJsonData));
        } catch (IOException e) {
            logger.error("Error sending error event", e);
        }
    }

    /**
     * 保存AI回复到数据库
     */
    @Transactional
    public void saveAiResponse(Conversation conversation, String answer,
                               String difyConversationId, String difyMessageId) {
        // 更新会话的Dify会话ID
        if (difyConversationId != null && conversation.getDifyConversationId() == null) {
            conversation.setDifyConversationId(difyConversationId);
            conversationRepository.save(conversation);
        }

        // 保存AI回复消息
        if (answer != null && !answer.isBlank()) {
            Message aiMessage = Message.builder()
                    .conversation(conversation)
                    .role(Message.MessageRole.assistant)
                    .content(answer)
                    .difyMessageId(difyMessageId)
                    .timestamp(LocalDateTime.now())
                    .build();
            messageRepository.save(aiMessage);
        }
    }

    /**
     * 获取会话列表
     */
    public List<ConversationSummaryResponse> getConversations(String userId) {
        User user = userService.getUserByUserId(userId);
        List<Conversation> conversations = conversationRepository.findByUserOrderByUpdatedAtDesc(user);

        return conversations.stream().map(conv -> {
            List<Message> messages = messageRepository.findByConversationOrderByTimestampAsc(conv);
            return ConversationSummaryResponse.builder()
                    .id(conv.getConversationId())
                    .title(conv.getTitle())
                    .messageCount(messages.size())
                    .updatedAt(conv.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * 获取会话详情
     */
    public ConversationDetailResponse getConversationDetail(String userId, String conversationId) {
        User user = userService.getUserByUserId(userId);
        Conversation conversation = conversationRepository.findByConversationId(conversationId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));

        // 验证会话属于该用户
        if (!conversation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权访问该会话");
        }

        List<Message> messages = messageRepository.findByConversationOrderByTimestampAsc(conversation);
        List<MessageResponse> messageResponses = messages.stream()
                .map(msg -> MessageResponse.builder()
                        .role(msg.getRole().name())
                        .content(msg.getContent())
                        .timestamp(msg.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        return ConversationDetailResponse.builder()
                .id(conversation.getConversationId())
                .messages(messageResponses)
                .build();
    }

    /**
     * 从查询内容提取标题（取前20个字符）
     */
    private String extractTitle(String query) {
        if (query == null || query.isBlank()) {
            return "新对话";
        }
        return query.length() > 20 ? query.substring(0, 20) + "..." : query;
    }
}
