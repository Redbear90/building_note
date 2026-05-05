package com.buildingnote.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * BUILDING_OWNER 회원가입 요청. 새 워크스페이스를 생성하면서 본인이 owner가 된다.
 */
public record SignupOwnerRequest(
        @NotBlank(message = "워크스페이스 이름을 입력해주세요.")
        @Size(max = 200)
        String workspaceName,

        @NotBlank @Email(message = "이메일 형식이 올바르지 않습니다.")
        String email,

        @NotBlank @Size(min = 8, max = 100, message = "비밀번호는 8~100자입니다.")
        String password,

        @NotBlank @Size(max = 100)
        String name
) {}
