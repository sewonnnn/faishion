package com.example.faishion.address;

import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/address")
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    // 1. GET /address/list : 배송지 목록 조회 (프론트엔드 fetchAddresses 구현용)
    @GetMapping("/list")
    public ResponseEntity<List<AddressDTO>> getAllAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("USER_NOT_FOUND"));

        // User 엔티티의 addressList를 가져와 DTO 리스트로 변환하여 반환
        List<AddressDTO> addressDTOList = user.getAddressList().stream()
                .map(address -> new AddressDTO(
                        address.getId(),
                        address.getZipcode(),
                        address.getStreet(),
                        address.getDetail(),
                        address.getIsDefault(),
                        address.getRequestMsg()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(addressDTOList);
    }

    // 2. POST /address : 새 배송지 추가 (기존 코드 개선 및 유지)
    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(
            @Valid @RequestBody AddressDTO req,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findById(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("USER_NOT_FOUND"));

        Address address = new Address();
        address.setUser(user);
        address.setZipcode(req.getZipcode());
        address.setStreet(req.getStreet());
        address.setDetail(req.getDetail());
        address.setRequestMsg(req.getRequestMsg()); // 요청 사항 저장 활성화

        // 새로 추가하는 주소는 기본적으로 isDefault=false
        address.setIsDefault(Boolean.FALSE);

        Address saved = addressRepository.save(address);

        // Map 대신 DTO로 반환 (일관성 유지)
        return ResponseEntity.ok(new AddressDTO(
                saved.getId(), saved.getZipcode(), saved.getStreet(),
                saved.getDetail(), saved.getIsDefault(), saved.getRequestMsg()
        ));
    }

    // 3. PUT /address/{id} : 특정 배송지 수정 (프론트엔드 handleSaveAddress 구현용)
    @PutMapping("/{id}")
    @Transactional // 수정 작업에는 트랜잭션 필요
    public ResponseEntity<AddressDTO> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressDTO req,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Address existingAddress = addressRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Address not found with ID: " + id));

        // 소유자 검증
        if (!existingAddress.getUser().getId().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        existingAddress.setZipcode(req.getZipcode());
        existingAddress.setStreet(req.getStreet());
        existingAddress.setDetail(req.getDetail());
        existingAddress.setRequestMsg(req.getRequestMsg());
        // isDefault는 이 엔드포인트에서 변경하지 않습니다.

        Address updated = addressRepository.save(existingAddress);

        return ResponseEntity.ok(new AddressDTO(
                updated.getId(), updated.getZipcode(), updated.getStreet(),
                updated.getDetail(), updated.getIsDefault(), updated.getRequestMsg()
        ));
    }

    // 4. DELETE /address/{id} : 특정 배송지 삭제 (프론트엔드 handleDeleteAddress 구현용)
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Address addressToDelete = addressRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Address not found with ID: " + id));

        // 소유자 검증
        if (!addressToDelete.getUser().getId().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (addressToDelete.getIsDefault()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        addressRepository.delete(addressToDelete);
        return ResponseEntity.noContent().build();
    }

    // 5. PUT /address/default/{id} : 기본 배송지 설정 (프론트엔드 handleSetDefault 구현용)
    @PutMapping("/default/{id}")
    @Transactional
    public ResponseEntity<AddressDTO> setDefaultAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findById(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("USER_NOT_FOUND"));

        Address newDefault = addressRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Address not found with ID: " + id));

        // 소유자 검증
        if (!newDefault.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 1. 기존 기본 배송지를 해제
        user.getAddressList().stream()
                .filter(Address::getIsDefault)
                .findFirst()
                .ifPresent(oldDefault -> {
                    if (!oldDefault.getId().equals(id)) { // 새 주소와 다를 경우에만 해제
                        oldDefault.setIsDefault(Boolean.FALSE);
                        addressRepository.save(oldDefault);
                    }
                });

        // 2. 새 배송지를 기본 배송지로 설정
        newDefault.setIsDefault(Boolean.TRUE);
        Address updatedDefault = addressRepository.save(newDefault);

        // DTO로 변환하여 반환
        return ResponseEntity.ok(new AddressDTO(
                updatedDefault.getId(), updatedDefault.getZipcode(), updatedDefault.getStreet(),
                updatedDefault.getDetail(), updatedDefault.getIsDefault(), updatedDefault.getRequestMsg()
        ));
    }
}