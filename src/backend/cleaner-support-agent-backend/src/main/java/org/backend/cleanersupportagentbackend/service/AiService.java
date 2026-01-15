package org.backend.cleanersupportagentbackend.service;

import org.backend.cleanersupportagentbackend.dto.ChatRequest;
import org.backend.cleanersupportagentbackend.dto.ConversationDetailResponse;
import org.backend.cleanersupportagentbackend.dto.ConversationSummaryResponse;
import org.backend.cleanersupportagentbackend.dto.MessageResponse;
import org.backend.cleanersupportagentbackend.entity.Conversation;
import org.backend.cleanersupportagentbackend.entity.Message;
import org.backend.cleanersupportagentbackend.entity.User;
import org.backend.cleanersupportagentbackend.repository.ConversationRepository;
import org.backend.cleanersupportagentbackend.repository.MessageRepository;
import org.backend.cleanersupportagentbackend.util.IdGenerator;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AI对话服务
 * TODO: 集成Dify API实现真实的AI对话
 */
@Service
public class AiService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;

    public AiService(ConversationRepository conversationRepository, 
                     MessageRepository messageRepository,
                     @Lazy UserService userService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userService = userService;
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

        // TODO: 这里应该调用Dify API并转发SSE流
        // 目前先返回模拟响应
        try {
            String mockResponse = "这是一个模拟的AI回复。请配置Dify API以获取真实回复。";
            
            // 保存AI回复
            Message aiMessage = Message.builder()
                    .conversation(conversation)
                    .role(Message.MessageRole.assistant)
                    .content(mockResponse)
                    .timestamp(LocalDateTime.now())
                    .build();
            messageRepository.save(aiMessage);

            // 发送SSE事件
            emitter.send(SseEmitter.event()
                    .name("message")
                    .data("{\"event\":\"message\",\"answer\":\"" + mockResponse + "\",\"conversation_id\":\"" + conversation.getConversationId() + "\"}"));
            
            emitter.send(SseEmitter.event()
                    .name("message_end")
                    .data("{\"event\":\"message_end\",\"metadata\":{}}"));
            
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
     * 从查询内容提取标题（取前20个字符）
     */
    private String extractTitle(String query) {
        if (query == null || query.isBlank()) {
            return "新对话";
        }
        return query.length() > 20 ? query.substring(0, 20) + "..." : query;
    }
}
