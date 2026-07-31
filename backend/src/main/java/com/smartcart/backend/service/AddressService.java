package com.smartcart.backend.service;

import com.smartcart.backend.dto.AddressRequest;
import com.smartcart.backend.dto.AddressResponse;
import com.smartcart.backend.entity.Address;
import com.smartcart.backend.entity.User;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.AddressRepository;
import com.smartcart.backend.repository.UserRepository;
import com.smartcart.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    public List<AddressResponse> getMyAddresses() {
        User user = getCurrentUser();
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public AddressResponse addAddress(AddressRequest request) {
        User user = getCurrentUser();

        // If this is marked default, unset default on all other addresses first
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetAllDefaults(user.getId());
        }

        // If this is the user's very first address, make it default automatically
        boolean isFirst = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId()).isEmpty();

        Address address = Address.builder()
                .user(user)
                .label(request.getLabel())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .isDefault(isFirst || Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        address = addressRepository.save(address);
        return mapToResponse(address);
    }

    public AddressResponse updateAddress(Long id, AddressRequest request) {
        User user = getCurrentUser();
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ApiException("Address not found", HttpStatus.NOT_FOUND));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ApiException("This address does not belong to you", HttpStatus.FORBIDDEN);
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetAllDefaults(user.getId());
        }

        address.setLabel(request.getLabel());
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZip(request.getZip());
        address.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));

        address = addressRepository.save(address);
        return mapToResponse(address);
    }

    public void deleteAddress(Long id) {
        User user = getCurrentUser();
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ApiException("Address not found", HttpStatus.NOT_FOUND));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ApiException("This address does not belong to you", HttpStatus.FORBIDDEN);
        }

        addressRepository.delete(address);
    }

    public AddressResponse setDefault(Long id) {
        User user = getCurrentUser();
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ApiException("Address not found", HttpStatus.NOT_FOUND));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ApiException("This address does not belong to you", HttpStatus.FORBIDDEN);
        }

        unsetAllDefaults(user.getId());
        address.setIsDefault(true);
        address = addressRepository.save(address);
        return mapToResponse(address);
    }

    private void unsetAllDefaults(Long userId) {
        List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        for (Address a : addresses) {
            if (Boolean.TRUE.equals(a.getIsDefault())) {
                a.setIsDefault(false);
                addressRepository.save(a);
            }
        }
    }

    private User getCurrentUser() {
        String email = securityUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    private AddressResponse mapToResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zip(address.getZip())
                .isDefault(address.getIsDefault())
                .build();
    }
}