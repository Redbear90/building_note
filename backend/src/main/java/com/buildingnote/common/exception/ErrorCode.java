package com.buildingnote.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 인증 / 권한
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."),

    // 사용자 / 워크스페이스
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    ORGANIZATION_NOT_FOUND(HttpStatus.NOT_FOUND, "워크스페이스를 찾을 수 없습니다."),
    INVALID_INVITE_CODE(HttpStatus.BAD_REQUEST, "초대 코드가 올바르지 않습니다."),

    // 도메인
    ZONE_NOT_FOUND(HttpStatus.NOT_FOUND, "구역을 찾을 수 없습니다."),
    BUILDING_NOT_FOUND(HttpStatus.NOT_FOUND, "건물을 찾을 수 없습니다."),
    UNIT_NOT_FOUND(HttpStatus.NOT_FOUND, "호실을 찾을 수 없습니다."),
    FORM_SCHEMA_NOT_FOUND(HttpStatus.NOT_FOUND, "폼 스키마를 찾을 수 없습니다."),
    RECORD_NOT_FOUND(HttpStatus.NOT_FOUND, "호실 기록을 찾을 수 없습니다."),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."),

    // 공통
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
