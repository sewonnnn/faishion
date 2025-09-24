package com.example.faishion.user;

import com.example.faishion.address.AddressService;
import com.example.faishion.image.Image;
import com.example.faishion.image.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import com.example.faishion.address.Address;
import java.util.Optional;

@RequiredArgsConstructor
@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final ImageRepository imageRepository;
    private final AddressService addressService; // 수정: AddressService 주입

    @GetMapping("/")
    public ResponseEntity<UserUpdateDTO> tokenUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));

        String zipcode = "";
        String street = "";
        String detail = "";

        // 사용자의 주소 목록에서 기본 주소지를 찾아 DTO에 설정
        Optional<Address> defaultAddress = user.getAddressList().stream()
                .filter(Address::getIsDefault)
                .findFirst();

        if (defaultAddress.isPresent()) {
            Address userAddress = defaultAddress.get();
            zipcode = userAddress.getZipcode();
            street = userAddress.getStreet();
            detail = userAddress.getDetail();
        }

        return ResponseEntity.ok(new UserUpdateDTO(user.getId(), user.getName(), user.getEmail(), user.getPhoneNumber(), user.getImage(), zipcode, street, detail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable String id, @RequestBody UserUpdateDTO userUpdateDTO) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));

        // 사용자 기본 정보 업데이트 - 값이 있을 때만 업데이트
        if (userUpdateDTO.getName() != null) {
            existingUser.setName(userUpdateDTO.getName());
        }
        if (userUpdateDTO.getEmail() != null) {
            existingUser.setEmail(userUpdateDTO.getEmail());
        }
        if (userUpdateDTO.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(userUpdateDTO.getPhoneNumber());
        }
        // 비밀번호 업데이트는 별도 로직이 필요하며, 보안을 위해 현재 예시에서는 제외

        // 이미지 업데이트 로직 - 이미지 정보가 null이 아닐 때만 업데이트
        if (userUpdateDTO.getImage() != null) {
            if (userUpdateDTO.getImage().getId() != null) {
                Image image = imageRepository.findById(userUpdateDTO.getImage().getId())
                        .orElseThrow(() -> new RuntimeException("Image not found with ID: " + userUpdateDTO.getImage().getId()));
                existingUser.setImage(image);
            } else {
                // 이미지가 null이고 ID도 없으면 이미지 삭제로 판단
                existingUser.setImage(null);
            }
        }

        userRepository.save(existingUser);

        // 주소 업데이트 로직은 AddressService에 위임 (이미 구현된 대로 작동)
        // 주소 필드는 프론트엔드에서 항상 빈 문자열로라도 전송되므로 null 체크는 필요 없습니다.
        addressService.updateOrCreateDefaultAddress(
                id,
                userUpdateDTO.getZipcode(),
                userUpdateDTO.getStreet(),
                userUpdateDTO.getDetail()
        );

        return ResponseEntity.ok("User and address updated successfully!");
    }
}