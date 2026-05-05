package com.buildingnote.auth.jwt;

import com.buildingnote.config.JwtConfig;
import com.buildingnote.user.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.UUID;

/**
 * JWT 토큰 발급/검증.
 * 비밀키 길이는 256bit(32B) 이상이어야 한다 — 시작 시 1회 검증.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtConfig jwtConfig;
    private SecretKey signingKey;

    @PostConstruct
    void init() {
        String configured = jwtConfig.getSecret();
        if (configured == null || configured.isBlank()) {
            throw new IllegalStateException("JWT_SECRET이 설정되지 않았습니다.");
        }
        byte[] keyBytes = configured.getBytes(StandardCharsets.UTF_8);

        // HS256은 32B 이상 키가 필요. 짧으면 SHA-256으로 derive하여 32B로 정규화한다.
        // 운영에서는 충분히 긴(>= 32B) 무작위 secret 사용을 권장 — 짧은 secret은 엔트로피가 부족함.
        if (keyBytes.length < 32) {
            log.warn("JWT secret 길이 {}B < 32B. SHA-256으로 정규화하여 사용합니다. "
                   + "운영에서는 'openssl rand -base64 48' 등으로 긴 secret을 발급하세요.",
                    keyBytes.length);
            try {
                keyBytes = MessageDigest.getInstance("SHA-256").digest(keyBytes);
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException("SHA-256 알고리즘을 사용할 수 없습니다.", e);
            }
        }
        try {
            this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        } catch (WeakKeyException e) {
            throw new IllegalStateException("JWT secret이 약합니다: " + e.getMessage(), e);
        }
    }

    public String generateAccessToken(User user) {
        return buildToken(user, jwtConfig.getAccessTokenExpiration(), "ACCESS");
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, jwtConfig.getRefreshTokenExpiration(), "REFRESH");
    }

    private String buildToken(User user, long expiration, String tokenType) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);

        JwtBuilder builder = Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("type", tokenType)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey);

        if (user.getOrganizationId() != null) {
            builder.claim("orgId", user.getOrganizationId().toString());
        }
        return builder.compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public String getRoleFromToken(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("만료된 JWT 토큰");
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT 검증 실패: {}", e.getMessage());
        }
        return false;
    }
}
