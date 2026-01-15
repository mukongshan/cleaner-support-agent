package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.annotation.CurrentUserId;
import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.backend.cleanersupportagentbackend.dto.CreateTicketRequest;
import org.backend.cleanersupportagentbackend.dto.TicketDetailResponse;
import org.backend.cleanersupportagentbackend.dto.TicketSummaryResponse;
import org.backend.cleanersupportagentbackend.dto.UpdateTicketRequest;
import org.backend.cleanersupportagentbackend.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cleaner-support/v2/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketSummaryResponse>> createTicket(
            @CurrentUserId String userId,
            @RequestBody CreateTicketRequest request) {
        try {
            TicketSummaryResponse response = ticketService.createTicket(userId, request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketSummaryResponse>>> getTickets(
            @CurrentUserId String userId,
            @RequestParam(required = false) String status) {
        try {
            List<TicketSummaryResponse> tickets = ticketService.getTickets(userId, status);
            return ResponseEntity.ok(ApiResponse.success(tickets));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<TicketDetailResponse>> getTicketDetail(
            @CurrentUserId String userId,
            @PathVariable String ticketId) {
        try {
            TicketDetailResponse detail = ticketService.getTicketDetail(userId, ticketId);
            return ResponseEntity.ok(ApiResponse.success(detail));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<Void>> updateTicket(
            @CurrentUserId String userId,
            @PathVariable String ticketId,
            @RequestBody UpdateTicketRequest request) {
        try {
            ticketService.updateTicket(userId, ticketId, request);
            return ResponseEntity.ok(ApiResponse.success("工单状态更新成功", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }
}
