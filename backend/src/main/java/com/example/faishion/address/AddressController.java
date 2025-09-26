package com.example.faishion.address;

import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/address")
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createAddress(
            @Valid @RequestBody AddressDTO req,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        System.out.println("로그인 유저 id:"+userDetails.getUsername());
        if (userDetails == null) {
            return ResponseEntity.status(401).body("UNAUTHORIZED");
        }

        // UserDetails.getUsername() = User.id
        User user = userRepository.findById(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("USER_NOT_FOUND"));

        Address address = new Address();
        address.setUser(user);
        address.setZipcode(req.getZipcode());
        address.setStreet(req.getStreet());
        address.setDetail(req.getDetail());
       // address.setRequestMsg(req.getRequestMsg());     // 저장
        // 무조건 기본배송지 아님(=0/false)으로 저장
        address.setIsDefault(Boolean.FALSE);

        Address saved = addressRepository.save(address);

        // 필요한 정보만 반환
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("zipcode", saved.getZipcode());
        resp.put("street", saved.getStreet());
        resp.put("detail", saved.getDetail());
        resp.put("requestMsg", saved.getRequestMsg());
        resp.put("isDefault", saved.getIsDefault()); // false

        return ResponseEntity.ok(resp);
    }
}
