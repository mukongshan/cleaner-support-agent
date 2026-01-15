package org.backend.cleanersupportagentbackend.service;

import org.backend.cleanersupportagentbackend.dto.CreateTicketRequest;
import org.backend.cleanersupportagentbackend.dto.TicketDetailResponse;
import org.backend.cleanersupportagentbackend.dto.TicketSummaryResponse;
import org.backend.cleanersupportagentbackend.dto.UpdateTicketRequest;
import org.backend.cleanersupportagentbackend.entity.Ticket;
import org.backend.cleanersupportagentbackend.entity.Ticket.TicketPriority;
import org.backend.cleanersupportagentbackend.entity.Ticket.TicketStatus;
import org.backend.cleanersupportagentbackend.entity.User;
import org.backend.cleanersupportagentbackend.repository.TicketRepository;
import org.backend.cleanersupportagentbackend.util.IdGenerator;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserService userService;

    public TicketService(TicketRepository ticketRepository, @Lazy UserService userService) {
        this.ticketRepository = ticketRepository;
        this.userService = userService;
    }

    /**
     * 创建工单
     */
    @Transactional
    public TicketSummaryResponse createTicket(String userId, CreateTicketRequest request) {
        User user = userService.getUserByUserId(userId);
        
        Ticket ticket = Ticket.builder()
                .ticketId(IdGenerator.generateTicketId())
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(parsePriority(request.getPriority()))
                .relatedChatId(request.getRelatedChatId())
                .attachmentUrls(request.getAttachmentUrls() != null ? request.getAttachmentUrls() : List.of())
                .status(TicketStatus.pending)
                .build();
        
        ticketRepository.save(ticket);
        
        return toSummaryResponse(ticket);
    }

    /**
     * 获取工单列表
     */
    public List<TicketSummaryResponse> getTickets(String userId, String status) {
        User user = userService.getUserByUserId(userId);
        
        List<Ticket> tickets;
        if (status != null && !status.isBlank()) {
            TicketStatus ticketStatus = parseStatus(status);
            tickets = ticketRepository.findByUserAndStatusOrderByCreatedAtDesc(user, ticketStatus);
        } else {
            tickets = ticketRepository.findByUserOrderByCreatedAtDesc(user);
        }
        
        return tickets.stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取工单详情
     */
    public TicketDetailResponse getTicketDetail(String userId, String ticketId) {
        User user = userService.getUserByUserId(userId);
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("工单不存在"));
        
        // 验证工单属于该用户
        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权访问该工单");
        }
        
        return TicketDetailResponse.builder()
                .ticketId(ticket.getTicketId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus().name())
                .priority(ticket.getPriority().name())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .engineerName(ticket.getEngineerName())
                .estimatedTime(ticket.getEstimatedTime())
                .attachments(ticket.getAttachmentUrls())
                .comments(ticket.getComments())
                .build();
    }

    /**
     * 更新工单状态
     */
    @Transactional
    public void updateTicket(String userId, String ticketId, UpdateTicketRequest request) {
        User user = userService.getUserByUserId(userId);
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("工单不存在"));
        
        // 验证工单属于该用户
        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权修改该工单");
        }
        
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            ticket.setStatus(parseStatus(request.getStatus()));
        }
        if (request.getComments() != null) {
            ticket.setComments(request.getComments());
        }
        
        ticketRepository.save(ticket);
    }

    private TicketSummaryResponse toSummaryResponse(Ticket ticket) {
        return TicketSummaryResponse.builder()
                .ticketId(ticket.getTicketId())
                .title(ticket.getTitle())
                .status(ticket.getStatus().name())
                .priority(ticket.getPriority().name())
                .createdAt(ticket.getCreatedAt())
                .engineerName(ticket.getEngineerName())
                .estimatedTime(ticket.getEstimatedTime())
                .build();
    }

    private TicketStatus parseStatus(String status) {
        try {
            return TicketStatus.valueOf(status.toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("无效的工单状态: " + status);
        }
    }

    private TicketPriority parsePriority(String priority) {
        try {
            return TicketPriority.valueOf(priority.toLowerCase());
        } catch (IllegalArgumentException e) {
            return TicketPriority.medium; // 默认中等优先级
        }
    }
}
