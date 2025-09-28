package com.example.faishion.security;

import com.example.faishion.user.AuthProvider;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepo;

    // 사용자 정보를 임시로 저장하기 위한 record (Java 14 이상)
    // record를 사용하면 불변(immutable) 객체를 간결하게 만들 수 있습니다.
    private record OAuth2UserInfo(
            AuthProvider provider,
            String providerUserId,
            String name,
            String email,
            String phone
    ) {}

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User rawUser = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attrs = new HashMap<>(rawUser.getAttributes());

        // switch 표현식을 사용하여 불변(immutable)인 OAuth2UserInfo 객체를 생성합니다.
        // 이 객체는 람다에서 안전하게 사용할 수 있습니다.
        final OAuth2UserInfo userInfo = switch (registrationId.toLowerCase()) {
            case "naver" -> {
                Map<String,Object> resp = cast(attrs.get("response"));
                String naverEmail = (String) resp.get("email");
                String naverPhone = normalizePhone((String) resp.get("mobile"));
                yield new OAuth2UserInfo(
                        AuthProvider.NAVER,
                        String.valueOf(resp.get("id")),
                        (String) resp.getOrDefault("name", ""),
                        naverEmail,
                        naverPhone
                );
            }

            default -> throw new IllegalArgumentException("Unsupported provider: " + registrationId);
        };

        // upsert 로직을 하나의 스트림으로 통합합니다.
        // findByProviderAndProviderUserId는 Optional을 반환합니다.
        User user = userRepo.findByProviderAndProviderUserId(userInfo.provider(), userInfo.providerUserId())
                .map(u -> { // 기존 사용자가 존재하면 업데이트합니다.
                    if (userInfo.name() != null && !userInfo.name().isBlank()) u.setName(userInfo.name());
                    if (userInfo.email() != null && !userInfo.email().isBlank()) u.setEmail(userInfo.email());
                    if (userInfo.phone() != null && !userInfo.phone().isBlank()) u.setPhoneNumber(userInfo.phone());
                    return u;
                })
                .orElseGet(() -> { // 기존 사용자가 없으면 새로 생성합니다.
                    User u = new User();
                    u.setId(UUID.randomUUID().toString());
                    u.setProvider(userInfo.provider());
                    u.setProviderUserId(userInfo.providerUserId());
                    u.setName(userInfo.name() != null && !userInfo.name().isBlank() ? userInfo.name() : userInfo.provider().name() + "_" + userInfo.providerUserId());
                    u.setEmail(userInfo.email() != null ? userInfo.email() : userInfo.provider().name().toLowerCase() + "_" + userInfo.providerUserId() + "@social.local");
                    u.setPhoneNumber(userInfo.phone() != null ? userInfo.phone() : "SOCIAL-" + userInfo.providerUserId());
                    return userRepo.save(u);
                });

        // 리다이렉트에서 쉽게 쓰도록, 우리 시스템의 userId/ email을 attributes에 심어준다
        attrs.put("app_user_id", user.getId());
        attrs.put("app_email", user.getEmail());

        // 권한
        var authorities = List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"));

        // nameAttributeKey는 임의로 "app_user_id" 사용 (DefaultOAuth2User가 getName()으로 돌려줌)
        return new DefaultOAuth2User(authorities, attrs, "app_user_id");
    }

    @SuppressWarnings("unchecked")
    private static Map<String,Object> cast(Object o) {
        return (o instanceof Map<?,?> m) ? (Map<String,Object>) m : null;
    }

    private static String normalizePhone(String phone) {
        if (phone == null) return null;
        return phone.replaceAll("[^0-9]", ""); // 숫자만 추출
    }

    private static String normalizeKakaoPhone(String kakaoPhone) {
        if (kakaoPhone == null) return null;
        String digits = kakaoPhone.replaceAll("[^0-9]", "");
        if (digits.startsWith("8210")) return "0" + digits.substring(2);
        return digits;
    }
}