package com.example.faishion.config;

//import com.example.faishion.security.CustomOAuth2UserService;
import com.example.faishion.security.JwtAuthenticationFilter;
//import com.example.faishion.security.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final UserDetailsService userDetailsService;
//    private final CustomOAuth2UserService customOAuth2UserService;
//    private final OAuth2SuccessHandler  oAuth2SuccessHandler;

    // 비밀번호 단방향(BCrypt) 암호화용 Bean
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // BCrypt 해시 사용
    }

    @Bean
    public AuthenticationManager authenticationManager(PasswordEncoder encoder) {
        var provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(encoder); // Bcrypt 설정
        provider.setUserDetailsService(userDetailsService); // 사용자 로드 서비스 설정
        return new ProviderManager(provider);
    }

    @Bean
    // csrfFilter
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // REST API라 CSRF 비활성화
                .cors(Customizer.withDefaults())

                .sessionManagement(sm ->  // 세션 관리
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // JWT니까 무상태
                .authorizeHttpRequests(auth -> auth // URL 권한 규칙
                        .anyRequest().permitAll() // 허용
                )
                // jwt 필터 등록
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
                // OAuth2 로그인
//        .oauth2Login(oauth -> oauth
//                .userInfoEndpoint(ui -> ui.userService(customOAuth2UserService))
//                .successHandler(oAuth2SuccessHandler));
        return http.build();
    }

    // CORS: 프론트(5173) 허용
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:5173"));
        c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        c.setAllowedHeaders(List.of("Authorization","Content-Type", "X-Requested-With"));
        c.setExposedHeaders(List.of("Authorization","Location")); // 토큰/리다이렉트 헤더 노출
        c.setAllowCredentials(true);
        c.setMaxAge(3600L);
        var s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }
}
