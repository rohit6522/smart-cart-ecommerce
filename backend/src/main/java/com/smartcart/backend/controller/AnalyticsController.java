package com.smartcart.backend.controller;

import com.smartcart.backend.dto.AnalyticsResponse;
import com.smartcart.backend.dto.ApiResponse;
import com.smartcart.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/api/admin/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        AnalyticsResponse analytics = analyticsService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.<AnalyticsResponse>builder()
                .success(true)
                .message("Analytics fetched successfully")
                .data(analytics)
                .build());
    }
}