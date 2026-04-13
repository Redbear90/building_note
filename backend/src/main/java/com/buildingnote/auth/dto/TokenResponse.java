package com.buildingnote.auth.dto;

/**
 * 토큰 응답 DTO
 * 리프레시 토큰은 httpOnly 쿠키로 전달 (보안 강화)
 */
public record TokenResponse(
        String accessToken,
        String tokenType,    // "Bearer"
        long expiresIn,      // 초 단위 만료 시간
        UserInfo user
) {
    /**
     * 사용자 정보 DTO (토큰 응답에 포함)
     */
    public record UserInfo(
            String id,
            String email,
            String name,
            String role
    ) {}
}
