package com.buildingnote.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * MEMBER 회원가입 요청. 초대 코드로 기존 워크스페이스에 합류한다.
 */
public record SignupMemberRequest(
        @NotBlank @Size(min = 4, max = 20, message = "초대 코드를 정확히 입력해주세요.")
        String inviteCode,

        @NotBlank @Email(message = "이메일 형식이 올바르지 않습니다.")
        String email,

        @NotBlank @Size(min = 8, max = 100, message = "비밀번호는 8~100자입니다.")
        String password,

        @NotBlank @Size(max = 100)
        String name
) {}
