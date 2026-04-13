package com.buildingnote.auth.controller;

import com.buildingnote.auth.dto.LoginRequest;
import com.buildingnote.auth.dto.TokenResponse;
import com.buildingnote.auth.service.AuthService;
import com.buildingnote.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 컨트롤러
 * 로그인, 토큰 갱신, 로그아웃 API
 */
@Tag(name = "인증", description = "로그인/로그아웃/토큰 갱신 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "로그인", description = "이메일/비밀번호로 로그인하여 액세스 토큰을 발급받습니다.")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        TokenResponse tokenResponse = authService.login(request, response);
        return ResponseEntity.ok(ApiResponse.success(tokenResponse, "로그인에 성공했습니다."));
    }

    @Operation(summary = "토큰 갱신", description = "리프레시 토큰(쿠키)을 이용하여 새 액세스 토큰을 발급합니다.")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {

        TokenResponse tokenResponse = authService.refresh(request, response);
        return ResponseEntity.ok(ApiResponse.success(tokenResponse, "토큰이 갱신되었습니다."));
    }

    @Operation(summary = "로그아웃", description = "리프레시 토큰 쿠키를 삭제하여 로그아웃합니다.")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(ApiResponse.success(null, "로그아웃되었습니다."));
    }
}
