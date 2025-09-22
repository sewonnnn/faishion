package com.example.faishion.security;

import com.example.faishion.admin.AdminRepository;
import com.example.faishion.seller.SellerRepository;
import com.example.faishion.user.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwt;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final AdminRepository adminRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String accessToken = header.substring(7);
            try {
                authenticateUser(jwt.parse(accessToken));
            } catch (ExpiredJwtException e) {
                // 액세스 토큰 만료 시 리프레시 토큰으로 재발급 시도
                handleRefreshToken(req, res);
            } catch (Exception e) {
                // 기타 토큰 관련 예외 처리
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(req, res);
    }

    private void handleRefreshToken(HttpServletRequest req, HttpServletResponse res) {
        System.out.println("리프레시 토큰 재발급 시도");
        String refreshToken = extractRefreshTokenFromCookie(req);
        if (refreshToken != null) {
            try {
                // 리프레시 토큰 유효성 검증
                Jws<Claims> refreshJws = jwt.parse(refreshToken);
                Claims claims = refreshJws.getBody();
                String subject = claims.getSubject();
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>)claims.get("roles");

                System.out.println(roles);

                // 사용자 ID(subject)와 role을 사용해서 실제로 DB에 존재하는지 조회
                if(roles != null && !roles.isEmpty()){
                    String role = roles.get(0);
                    System.out.println(role);
                    if("USER".equals(role)){
                        userRepository.findById(subject).orElseThrow();
                    }else if("SELLER".equals(role)){
                        sellerRepository.findById(subject).orElseThrow();
                    }else if("ADMIN".equals(role)){
                        adminRepository.findById(subject).orElseThrow();
                    }
                }

                System.out.println("dd2");

                // 새 액세스 토큰 발급 및 응답 헤더에 추가
                String newAccessToken = jwt.generateAccess(subject, roles);
                res.setHeader("Authorization", "Bearer " + newAccessToken);

                // 새 액세스 토큰으로 인증 설정
                authenticateUser(jwt.parse(newAccessToken));
            } catch (Exception refreshException) {
                // 리프레시 토큰 유효성 검증 실패 시 401 에러 반환
                System.out.println("리프레시 토큰 유효성 검증 실패");
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                SecurityContextHolder.clearContext();
            }
        } else {
            // 리프레시 토큰이 없는 경우 401 에러 반환
            System.out.println("리프레시 토큰 없음");
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            SecurityContextHolder.clearContext();
        }
    }

    private void authenticateUser(Jws<Claims> jws) {
        Claims claims = jws.getBody();
        String subject = claims.getSubject();
        // Spring Security가 인식하도록 각 역할에 ROLE_ 접두사 추가
        @SuppressWarnings("unchecked")
        List<SimpleGrantedAuthority> authorities = ((List<String>)claims.get("roles")).stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(subject, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
