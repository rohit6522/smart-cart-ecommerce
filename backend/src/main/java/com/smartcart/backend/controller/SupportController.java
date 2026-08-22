package com.smartcart.backend.controller;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/api/user/support")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> submitTicket(@Valid @RequestBody SupportTicketRequest request) {
        SupportTicketResponse ticket = supportService.submitTicket(request);
        return ResponseEntity.ok(ApiResponse.<SupportTicketResponse>builder()
                .success(true)
                .message("Your query has been submitted. We'll get back to you soon.")
                .data(ticket)
                .build());
    }

    @GetMapping("/api/user/support/my-tickets")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getMyTickets() {
        List<SupportTicketResponse> tickets = supportService.getMyTickets();
        return ResponseEntity.ok(ApiResponse.<List<SupportTicketResponse>>builder()
                .success(true).message("Tickets fetched").data(tickets).build());
    }

    @GetMapping("/api/admin/support/tickets")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getAllTickets() {
        List<SupportTicketResponse> tickets = supportService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.<List<SupportTicketResponse>>builder()
                .success(true).message("Tickets fetched").data(tickets).build());
    }

    @PutMapping("/api/admin/support/tickets/{id}/resolve")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> resolveTicket(@PathVariable Long id) {
        SupportTicketResponse ticket = supportService.resolveTicket(id);
        return ResponseEntity.ok(ApiResponse.<SupportTicketResponse>builder()
                .success(true).message("Ticket resolved").data(ticket).build());
    }
}