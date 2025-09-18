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

import java.util.*;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepo;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User rawUser = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId(); // "naver" or "kakao"
        Map<String, Object> attrs = new HashMap<>(rawUser.getAttributes());

        AuthProvider provider;
        String providerUserId;
        String name = null;
        String email = null;
        String phone = null;

        switch (registrationId.toLowerCase()) {
            case "naver" -> {
                provider = AuthProvider.NAVER;
                // attrs: {resultcode=00, message=success, response={id=..., name=..., email=..., mobile=...}}
                Map<String,Object> resp = cast(attrs.get("response"));
                providerUserId = String.valueOf(resp.get("id"));
                name  = (String) resp.getOrDefault("name", "");
                email = (String) resp.get("email"); // 동의 안하면 null
                phone = normalizePhone((String) resp.get("mobile")); // "010-1234-5678" → "01012345678"
            }
            case "kakao" -> {
                provider = AuthProvider.KAKAO;
                // attrs: {id=..., kakao_account={email=..., profile={nickname=...}, phone_number="+82 10-1234-5678"}}
                providerUserId = String.valueOf(attrs.get("id"));
                Map<String,Object> account = cast(attrs.get("kakao_account"));
                if (account != null) {
                    email = (String) account.get("email");
                    Map<String,Object> profile = cast(account.get("profile"));
                    if (profile != null) name = (String) profile.getOrDefault("nickname", "");
                    // 카카오는 국제형식 +82 … 로 들어올 수 있음
                    String kakaoPhone = (String) account.get("phone_number");
                    phone = normalizeKakaoPhone(kakaoPhone); // "+82 10-1234-5678" → "01012345678"
                }
            }
            default -> throw new IllegalArgumentException("Unsupported provider: " + registrationId);
        }

        // upsert
        User user = userRepo.findByProviderAndProviderUserId(provider, providerUserId)
                .map(u -> {
                    if (name != null && !name.isBlank()) u.setName(name);
                    if (email != null && !email.isBlank()) u.setEmail(email);
                    if (phone != null && !phone.isBlank()) u.setPhoneNumber(phone);
                    return u;
                })
                .orElseGet(() -> {
                    User u = new User();
                    u.setId(UUID.randomUUID().toString());        // 내부 PK는 항상 UUID
                    u.setProvider(provider);
                    u.setProviderUserId(providerUserId);
                    u.setUsername(null);                          // 소셜은 username 없음
                    u.setName(name != null && !name.isBlank() ? name : provider.name()+"_"+providerUserId);
                    u.setEmail(email != null ? email : provider.name().toLowerCase()+"_"+providerUserId+"@social.local");
                    u.setPhoneNumber(phone != null ? phone : "SOCIAL-"+providerUserId);
                    return userRepo.save(u);
                });

        // 리다이렉트에서 쉽게 쓰도록, 우리 시스템의 userId/ email을 attributes에 심어준다
        attrs.put("app_user_id", user.getId());
        attrs.put("app_email",   user.getEmail());

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
        // "+82 10-1234-5678" → "01012345678"
        String digits = kakaoPhone.replaceAll("[^0-9]", "");
        // 한국번호이고 8210... 형태면 0 붙여서 010...
        if (digits.startsWith("8210")) return "0" + digits.substring(2);
        return digits;
    }
}
