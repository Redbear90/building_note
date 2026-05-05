package com.buildingnote.auth.controller;

import com.buildingnote.auth.dto.LoginRequest;
import com.buildingnote.auth.dto.SignupMemberRequest;
import com.buildingnote.auth.dto.SignupOwnerRequest;
import com.buildingnote.auth.dto.TokenResponse;
import com.buildingnote.auth.service.AuthService;
import com.buildingnote.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증", description = "회원가입 / 로그인 / 토큰 갱신 / 로그아웃")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "워크스페이스 생성 + BUILDING_OWNER 회원가입")
    @PostMapping("/signup/owner")
    public ResponseEntity<ApiResponse<TokenResponse>> signupOwner(
            @Valid @RequestBody SignupOwnerRequest request,
            HttpServletResponse response) {
        TokenResponse tokens = authService.signupOwner(request, response);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(tokens, "워크스페이스가 생성되었습니다."));
    }

    @Operation(summary = "초대 코드로 MEMBER 회원가입")
    @PostMapping("/signup/member")
    public ResponseEntity<ApiResponse<TokenResponse>> signupMember(
            @Valid @RequestBody SignupMemberRequest request,
            HttpServletResponse response) {
        TokenResponse tokens = authService.signupMember(request, response);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(tokens, "가입이 완료되었습니다."));
    }

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        return ResponseEntity.ok(ApiResponse.success(
                authService.login(request, response), "로그인에 성공했습니다."));
    }

    @Operation(summary = "토큰 갱신 (httpOnly 쿠키 사용)")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        return ResponseEntity.ok(ApiResponse.success(
                authService.refresh(request, response), "토큰이 갱신되었습니다."));
    }

    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(ApiResponse.success(null, "로그아웃되었습니다."));
    }
}
