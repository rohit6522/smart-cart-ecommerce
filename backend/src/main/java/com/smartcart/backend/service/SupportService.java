package com.smartcart.backend.service;

import com.smartcart.backend.dto.SupportTicketRequest;
import com.smartcart.backend.dto.SupportTicketResponse;
import com.smartcart.backend.entity.SupportTicket;
import com.smartcart.backend.entity.User;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.SupportTicketRepository;
import com.smartcart.backend.repository.UserRepository;
import com.smartcart.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    private final ResendEmailService emailService;

    public SupportTicketResponse submitTicket(SupportTicketRequest request) {
        User user = getCurrentUser();

        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .subject(request.getSubject())
                .message(request.getMessage())
                .build();
        ticket = ticketRepository.save(ticket);

        emailService.sendSupportTicketAlert(ticket, user);

        return mapToResponse(ticket);
    }

    public List<SupportTicketResponse> getMyTickets() {
        User user = getCurrentUser();
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::mapToResponse).toList();
    }

    public List<SupportTicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponse)
                .toList();
    }

    public SupportTicketResponse resolveTicket(Long ticketId) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ApiException("Ticket not found", HttpStatus.NOT_FOUND));
        ticket.setStatus(SupportTicket.TicketStatus.RESOLVED);
        ticket = ticketRepository.save(ticket);
        return mapToResponse(ticket);
    }

    private User getCurrentUser() {
        String email = securityUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    private SupportTicketResponse mapToResponse(SupportTicket ticket) {
        return SupportTicketResponse.builder()
                .id(ticket.getId())
                .subject(ticket.getSubject())
                .message(ticket.getMessage())
                .status(ticket.getStatus().name())
                .userName(ticket.getUser().getName())
                .userEmail(ticket.getUser().getEmail())
                .createdAt(ticket.getCreatedAt())
                .build();
    }
}