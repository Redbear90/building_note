package com.buildingnote.auth.service;

import com.buildingnote.auth.dto.LoginRequest;
import com.buildingnote.auth.dto.SignupMemberRequest;
import com.buildingnote.auth.dto.SignupOwnerRequest;
import com.buildingnote.auth.dto.TokenResponse;
import com.buildingnote.auth.jwt.JwtTokenProvider;
import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.config.JwtConfig;
import com.buildingnote.organization.entity.Organization;
import com.buildingnote.organization.repository.OrganizationRepository;
import com.buildingnote.organization.service.InviteCodeGenerator;
import com.buildingnote.user.entity.Role;
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
 * 인증 서비스. 로그인/회원가입(OWNER, MEMBER)/토큰 갱신/로그아웃.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private static final String REFRESH_COOKIE = "refreshToken";

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;
    private final InviteCodeGenerator inviteCodeGenerator;
    private final Environment environment;

    // ===== 로그인 / 갱신 / 로그아웃 =====

    public TokenResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        return issueTokens(user, response);
    }

    public TokenResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshToken(request);
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
        var userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return issueTokens(user, response);
    }

    public void logout(HttpServletResponse response) {
        clearRefreshTokenCookie(response);
    }

    // ===== 회원가입 =====

    @Transactional
    public TokenResponse signupOwner(SignupOwnerRequest req, HttpServletResponse response) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        Organization org = organizationRepository.save(Organization.builder()
                .name(req.workspaceName())
                .inviteCode(inviteCodeGenerator.generateUnique())
                .build());

        User owner = userRepository.save(User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .name(req.name())
                .role(Role.BUILDING_OWNER)
                .organization(org)
                .build());
        log.info("워크스페이스 생성: {} / owner={}", org.getName(), owner.getEmail());
        return issueTokens(owner, response);
    }

    @Transactional
    public TokenResponse signupMember(SignupMemberRequest req, HttpServletResponse response) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        Organization org = organizationRepository.findByInviteCode(req.inviteCode().toUpperCase())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INVITE_CODE));

        User member = userRepository.save(User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .name(req.name())
                .role(Role.MEMBER)
                .organization(org)
                .build());
        log.info("멤버 가입: {} → {}", member.getEmail(), org.getName());
        return issueTokens(member, response);
    }

    // ===== 헬퍼 =====

    private TokenResponse issueTokens(User user, HttpServletResponse response) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        setRefreshTokenCookie(response, refreshToken);

        Organization org = user.getOrganization();
        String inviteCode = (user.getRole() == Role.BUILDING_OWNER && org != null) ? org.getInviteCode() : null;

        return new TokenResponse(
                accessToken,
                "Bearer",
                jwtConfig.getAccessTokenExpiration() / 1000,
                new TokenResponse.UserInfo(
                        user.getId().toString(),
                        user.getEmail(),
                        user.getName(),
                        user.getRole().name(),
                        org != null ? org.getId().toString() : null,
                        org != null ? org.getName() : null,
                        inviteCode
                )
        );
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        boolean isLocal = Arrays.asList(environment.getActiveProfiles()).contains("local");
        Cookie cookie = new Cookie(REFRESH_COOKIE, refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(!isLocal);
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtConfig.getRefreshTokenExpiration() / 1000));
        cookie.setAttribute("SameSite", isLocal ? "Lax" : "Strict");
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        boolean isLocal = Arrays.asList(environment.getActiveProfiles()).contains("local");
        Cookie cookie = new Cookie(REFRESH_COOKIE, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(!isLocal);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", isLocal ? "Lax" : "Strict");
        response.addCookie(cookie);
    }

    private String extractRefreshToken(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> REFRESH_COOKIE.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
