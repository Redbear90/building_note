package com.buildingnote.auth.dto;

/**
 * 로그인/회원가입 성공 시 반환하는 토큰 + 사용자 정보.
 * 리프레시 토큰은 httpOnly 쿠키로 별도 전달된다.
 */
public record TokenResponse(
        String accessToken,
        String tokenType,    // "Bearer"
        long expiresIn,      // seconds
        UserInfo user
) {
    public record UserInfo(
            String id,
            String email,
            String name,
            String role,
            String organizationId,    // ADMIN은 null
            String organizationName,  // ADMIN은 null
            String inviteCode         // BUILDING_OWNER에게만 노출
    ) {}
}
