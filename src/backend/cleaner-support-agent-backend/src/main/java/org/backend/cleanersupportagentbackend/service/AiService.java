package org.backend.cleanersupportagentbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.backend.cleanersupportagentbackend.dto.ChatRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.backend.cleanersupportagentbackend.dto.ChatWithImageRequest;
import org.backend.cleanersupportagentbackend.dto.ConversationDetailResponse;
import org.backend.cleanersupportagentbackend.dto.ConversationSummaryResponse;
import org.backend.cleanersupportagentbackend.dto.MessageResponse;
import org.backend.cleanersupportagentbackend.entity.Conversation;
import org.backend.cleanersupportagentbackend.entity.ImageRecognition;
import org.backend.cleanersupportagentbackend.entity.Message;
import org.backend.cleanersupportagentbackend.entity.User;
import org.backend.cleanersupportagentbackend.repository.ConversationRepository;
import org.backend.cleanersupportagentbackend.repository.MessageRepository;
import org.backend.cleanersupportagentbackend.service.client.DeepSeekClient;
import org.backend.cleanersupportagentbackend.util.IdGenerator;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI对话服务
 * TODO: 集成Dify API实现真实的AI对话
 */
@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final ImageRecognitionService imageRecognitionService;
    private final DeepSeekClient deepSeekClient;
    private final ObjectMapper objectMapper;

    private static final String DEFAULT_SYSTEM_PROMPT = """
            你是一个清洁机器人售后支持专家。你的目标是基于用户描述（以及可能提供的图片描述），给出：
            1) 初步故障判断 2) 排查步骤（按优先级） 3) 可能原因 4) 解决方案与注意事项。
            若信息不足，请先提出最多 3 个关键追问，再给出可执行的通用排查步骤。
            """;

    public AiService(ConversationRepository conversationRepository, 
                     MessageRepository messageRepository,
                     @Lazy UserService userService,
                     @Lazy ImageRecognitionService imageRecognitionService,
                     @Lazy DeepSeekClient deepSeekClient,
                     ObjectMapper objectMapper) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.imageRecognitionService = imageRecognitionService;
        this.deepSeekClient = deepSeekClient;
        this.objectMapper = objectMapper;
    }

    /**
     * 发送AI对话消息（SSE流式响应）
     * TODO: 实现与Dify的SSE连接
     */
    @Transactional
    public SseEmitter chat(String userId, ChatRequest request) {
        User user = userService.getUserByUserId(userId);
        
        // 获取或创建会话
        Conversation conversation;
        if (request.getConversationId() != null && !request.getConversationId().isBlank()) {
            conversation = conversationRepository.findByConversationId(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("会话不存在"));
        } else {
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
        SseEmitter emitter = new SseEmitter(60000L); // 60秒超时

        try {
            String answer;
            try {
                answer = askDeepSeek(conversation, request.getDeviceInfo());
            } catch (Exception ex) {
                // 不让前端“直接断流”，返回可读错误提示便于联调
                answer = "当前AI服务暂时不可用（DeepSeek调用失败）。" +
                        "请检查 DEEPSEEK_API_KEY / 网络连通性 / 代理设置。错误：" + safeErrorMessage(ex);
            }
            
            // 保存AI回复
            Message aiMessage = Message.builder()
                    .conversation(conversation)
                    .role(Message.MessageRole.assistant)
                    .content(answer)
                    .timestamp(LocalDateTime.now())
                    .build();
            messageRepository.save(aiMessage);

            // 发送SSE事件
            emitter.send(SseEmitter.event()
                    .name("message")
                    .data(toJsonString(Map.of(
                            "event", "message",
                            "answer", answer,
                            "conversation_id", conversation.getConversationId()
                    ))));
            
            emitter.send(SseEmitter.event()
                    .name("message_end")
                    .data(toJsonString(Map.of(
                            "event", "message_end",
                            "metadata", Map.of()
                    ))));
            
            emitter.complete();
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
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
     * 基于图片识别结果进行AI对话
     */
    @Transactional
    public SseEmitter chatWithImage(String userId, ChatWithImageRequest request) {
        User user = userService.getUserByUserId(userId);
        
        // 获取图片识别记录
        ImageRecognition recognition = imageRecognitionService.getRecognitionById(request.getRecognitionId());
        
        // 验证识别记录属于该用户
        if (!recognition.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权访问该图片识别记录");
        }
        
        // 验证识别状态
        if (recognition.getStatus() != org.backend.cleanersupportagentbackend.entity.RecognitionStatus.completed) {
            throw new RuntimeException("图片识别尚未完成，无法进行对话");
        }
        
        // 获取或创建会话
        Conversation conversation;
        if (request.getConversationId() != null && !request.getConversationId().isBlank()) {
            conversation = conversationRepository.findByConversationId(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("会话不存在"));
        } else {
            conversation = Conversation.builder()
                    .conversationId(IdGenerator.generateConversationId())
                    .user(user)
                    .title(extractTitle(request.getQuery()))
                    .build();
            conversationRepository.save(conversation);
        }
        
        // 构建包含图片描述的提示词
        String imageDescription = recognition.getDescription() != null ? recognition.getDescription() : "";
        String userQuery = request.getQuery() != null && !request.getQuery().isBlank() 
                ? request.getQuery() 
                : "请基于图片描述，提供专业的故障诊断和解决方案。";
        
        String fullQuery = buildPromptWithImage(imageDescription, userQuery);
        
        // 保存用户消息（包含图片描述）
        Message userMessage = Message.builder()
                .conversation(conversation)
                .role(Message.MessageRole.user)
                .content(fullQuery)
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(userMessage);
        
        // 创建SSE发射器
        SseEmitter emitter = new SseEmitter(60000L); // 60秒超时
        
        try {
            // 注意：图片已在 fullQuery 中以“图片描述”形式一并上传到大模型侧（满足工期要求）
            String answer;
            try {
                logger.info("开始调用 DeepSeek 进行图片对话，会话ID: {}, 图片描述长度: {} 字符", 
                        conversation.getConversationId(), imageDescription.length());
                answer = askDeepSeek(conversation, null);
                logger.info("DeepSeek 图片对话调用成功，答案长度: {} 字符", answer != null ? answer.length() : 0);
            } catch (Exception ex) {
                logger.error("DeepSeek 图片对话调用失败，会话ID: {}, 错误: {}", 
                        conversation.getConversationId(), ex.getMessage(), ex);
                answer = "当前AI服务暂时不可用（DeepSeek调用失败）。" +
                        "请检查 DEEPSEEK_API_KEY / 网络连通性 / 代理设置。错误：" + safeErrorMessage(ex);
            }
            
            // 保存AI回复
            Message aiMessage = Message.builder()
                    .conversation(conversation)
                    .role(Message.MessageRole.assistant)
                    .content(answer)
                    .timestamp(LocalDateTime.now())
                    .build();
            messageRepository.save(aiMessage);
            
            // 发送SSE事件
            emitter.send(SseEmitter.event()
                    .name("message")
                    .data(toJsonString(Map.of(
                            "event", "message",
                            "answer", answer,
                            "conversation_id", conversation.getConversationId()
                    ))));
            
            emitter.send(SseEmitter.event()
                    .name("message_end")
                    .data(toJsonString(Map.of(
                            "event", "message_end",
                            "metadata", Map.of()
                    ))));
            
            emitter.complete();
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
        
        return emitter;
    }
    
    /**
     * 构建包含图片描述的提示词
     */
    private String buildPromptWithImage(String imageDescription, String userQuery) {
        return "[图片描述]\n" + imageDescription + "\n\n" +
               "[用户问题]\n" + userQuery + "\n\n" +
               "请基于以上图片描述和用户问题，提供专业的故障诊断和解决方案。";
    }

    private String askDeepSeek(Conversation conversation, Map<String, Object> deviceInfo) {
        List<Message> history = messageRepository.findByConversationOrderByTimestampAsc(conversation);

        // 控制上下文长度：最多取最近 N 条（不含 system），避免 prompt 过长
        int maxHistoryMessages = 20;
        int startIdx = Math.max(0, history.size() - maxHistoryMessages);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", DEFAULT_SYSTEM_PROMPT));

        // 可选：把 deviceInfo 作为系统附加信息（优先级高于用户消息）
        if (deviceInfo != null && !deviceInfo.isEmpty()) {
            messages.add(Map.of(
                    "role", "system",
                    "content", "[设备信息]\n" + toJsonString(deviceInfo)
            ));
        }

        for (int i = startIdx; i < history.size(); i++) {
            Message msg = history.get(i);
            if (msg.getContent() == null || msg.getContent().isBlank()) {
                continue;
            }
            messages.add(Map.of(
                    "role", msg.getRole().name(),
                    "content", msg.getContent()
            ));
        }

        return deepSeekClient.chat(messages);
    }

    private String toJsonString(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            // 回退：避免因为JSON序列化失败导致 SSE/Prompt 全部失败
            return String.valueOf(obj);
        }
    }

    private String safeErrorMessage(Exception ex) {
        if (ex == null) {
            return "unknown";
        }
        String msg = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
        msg = msg.replace("\r", " ").replace("\n", " ");
        return msg.length() > 300 ? msg.substring(0, 300) + "..." : msg;
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
