package com.buildingnote.auth.service;

import com.buildingnote.auth.dto.LoginRequest;
import com.buildingnote.auth.dto.TokenResponse;
import com.buildingnote.auth.jwt.JwtTokenProvider;
import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.config.JwtConfig;
import com.buildingnote.user.entity.User;
import com.buildingnote.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

/**
 * 인증 서비스
 * 로그인, 토큰 갱신, 로그아웃 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;
    private final Environment environment;

    /**
     * 로그인
     * - 이메일/비밀번호 검증
     * - 액세스 토큰 반환 (응답 바디)
     * - 리프레시 토큰 설정 (httpOnly 쿠키)
     */
    public TokenResponse login(LoginRequest request, HttpServletResponse response) {
        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        // 리프레시 토큰을 httpOnly 쿠키에 설정
        setRefreshTokenCookie(response, refreshToken);

        log.info("로그인 성공 - 사용자: {}", user.getEmail());
        return buildTokenResponse(user, accessToken);
    }

    /**
     * 토큰 갱신
     * - 쿠키에서 리프레시 토큰 추출
     * - 새 액세스 토큰 발급
     */
    public TokenResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        // 쿠키에서 리프레시 토큰 추출
        String refreshToken = extractRefreshTokenFromCookie(request);

        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        // 토큰에서 사용자 ID 추출 후 DB 조회
        var userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 새 액세스 토큰 발급
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);

        // 리프레시 토큰도 갱신 (선택적: 보안 강화)
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);
        setRefreshTokenCookie(response, newRefreshToken);

        log.info("토큰 갱신 성공 - 사용자: {}", user.getEmail());
        return buildTokenResponse(user, newAccessToken);
    }

    /**
     * 로그아웃
     * - 리프레시 토큰 쿠키 삭제
     */
    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, null);
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);
        log.info("로그아웃 처리 완료");
    }

    /**
     * httpOnly 쿠키에 리프레시 토큰 설정
     * local 프로파일에서는 Secure=false (HTTP 허용), 그 외 운영 환경에서는 Secure=true (HTTPS 필수)
     */
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        boolean isLocal = Arrays.asList(environment.getActiveProfiles()).contains("local");
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(!isLocal);
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtConfig.getRefreshTokenExpiration() / 1000));
        response.addCookie(cookie);
    }

    /**
     * HTTP 요청 쿠키에서 리프레시 토큰 추출
     */
    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(cookie -> REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    /**
     * 토큰 응답 DTO 생성
     */
    private TokenResponse buildTokenResponse(User user, String accessToken) {
        return new TokenResponse(
                accessToken,
                "Bearer",
                jwtConfig.getAccessTokenExpiration() / 1000,
                new TokenResponse.UserInfo(
                        user.getId().toString(),
                        user.getEmail(),
                        user.getName(),
                        user.getRole().name()
                )
        );
    }
}
