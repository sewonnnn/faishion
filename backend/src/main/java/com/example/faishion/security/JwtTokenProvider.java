package com.example.faishion.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessExp;
    private final long refreshExp;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-exp-seconds}") long accessExpSeconds,
            @Value("${app.jwt.refresh-exp-seconds}") long refreshExpSeconds
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExp = accessExpSeconds * 1000L;
        this.refreshExp = refreshExpSeconds * 1000L;
    }

    public String generateAccess(String subject, List<String> roles) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subject) // 이메일을 subject로 사용
                .addClaims(Map.of("roles", roles))
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + accessExp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefresh(String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + refreshExp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }
}
