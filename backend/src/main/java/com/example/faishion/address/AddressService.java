package com.example.faishion.address;

import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;
    private final UserRepository userRepository; // User 엔티티를 찾기 위해 추가

    public Address updateOrCreateDefaultAddress(String userId, String zipcode, String street, String detail) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // 사용자의 기본 주소지 찾기
        Optional<Address> optionalAddress = user.getAddressList().stream()
                .filter(Address::getIsDefault)
                .findFirst();

        Address userAddress;
        if (optionalAddress.isPresent()) {
            userAddress = optionalAddress.get();
        } else {
            // 기본 주소지가 없으면 새로 생성
            userAddress = new Address();
            userAddress.setUser(user);
            userAddress.setIsDefault(true);
            user.getAddressList().add(userAddress); // 양방향 관계 설정
        }

        // 주소 정보 업데이트
        userAddress.setZipcode(zipcode);
        userAddress.setStreet(street);
        userAddress.setDetail(detail);

        return addressRepository.save(userAddress); // AddressRepository를 통해 저장
    }
}