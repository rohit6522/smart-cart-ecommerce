package com.smartcart.backend.controller;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getMyAddresses() {
        List<AddressResponse> addresses = addressService.getMyAddresses();
        return ResponseEntity.ok(ApiResponse.<List<AddressResponse>>builder()
                .success(true)
                .message("Addresses fetched successfully")
                .data(addresses)
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(@Valid @RequestBody AddressRequest request) {
        AddressResponse address = addressService.addAddress(request);
        return ResponseEntity.ok(ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Address added successfully")
                .data(address)
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Long id, @Valid @RequestBody AddressRequest request) {
        AddressResponse address = addressService.updateAddress(id, request);
        return ResponseEntity.ok(ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Address updated successfully")
                .data(address)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Address deleted successfully")
                .data(null)
                .build());
    }

    @PutMapping("/{id}/set-default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefault(@PathVariable Long id) {
        AddressResponse address = addressService.setDefault(id);
        return ResponseEntity.ok(ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Default address updated")
                .data(address)
                .build());
    }
}