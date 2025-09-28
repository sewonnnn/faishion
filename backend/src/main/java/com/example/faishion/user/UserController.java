package com.example.faishion.user;

import com.example.faishion.address.AddressDTO;
import com.example.faishion.address.AddressService;
import com.example.faishion.image.Image;
import com.example.faishion.image.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder; // ⭐추가
import org.springframework.web.bind.annotation.*;
import com.example.faishion.address.Address;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final ImageRepository imageRepository;
    private final AddressService addressService;
    private final PasswordEncoder passwordEncoder; // ⭐ 추가: PasswordEncoder 주입

    @GetMapping("/")
    public ResponseEntity<UserUpdateDTO> tokenUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
        int height = user.getHeight();
        int weight = user.getWeight();
        // ⭐ 주소: 사용자의 주소 목록에서 기본 주소지를 찾아 DTO에 설정
        System.out.println("ㅁ:" + user.getAddressList());
        List<Address> addressList = user.getAddressList();

        Address address = user.getAddressList().stream()
                //.filter(Address::getIsDefault)
                .findFirst()
                .orElse(null); // 없으면 null 반환

        AddressDTO addressDTO = null;
        if (address != null) {
            addressDTO = new AddressDTO(
                    address.getId(),
                    address.getZipcode(),
                    address.getStreet(),
                    address.getDetail(),
                    address.getIsDefault(),
                    address.getRequestMsg()
            );
        }

        return ResponseEntity.ok(new UserUpdateDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getImage(),
                height,
                weight,
                addressDTO
        ));
    }

    // 유저정보 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable String id, @RequestBody UserUpdateDTO userUpdateDTO) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));

        System.out.println("유저 비밀번호 수정 : "+userUpdateDTO.getPassword());
        // DTO에 비밀번호가 존재하고 비어있지 않은 경우에만 암호화하여 저장
        if (userUpdateDTO.getPassword() != null && !userUpdateDTO.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(userUpdateDTO.getPassword());
            existingUser.setPwHash(hashedPassword);
        }

        existingUser.setHeight(userUpdateDTO.getHeight());
        existingUser.setWeight(userUpdateDTO.getWeight());

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

        // 이미지 업데이트 로직
        if (userUpdateDTO.getImage() != null) {
            if (userUpdateDTO.getImage().getId() != null) {
                Image image = imageRepository.findById(userUpdateDTO.getImage().getId())
                        .orElseThrow(() -> new RuntimeException("Image not found with ID: " + userUpdateDTO.getImage().getId()));
                existingUser.setImage(image);
            } else {
                // 이미지가 null이고 ID도 없으면 이미지 삭제로 판단
                existingUser.setImage(null);
            }
        } else if (existingUser.getImage() != null) {
            // DTO의 이미지가 null인데 기존 사용자는 이미지가 있는 경우, 기존 이미지를 삭제
            existingUser.setImage(null);
        }

        userRepository.save(existingUser);

        return ResponseEntity.ok("User and address updated successfully!");
    }
}