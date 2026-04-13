package com.buildingnote.common.exception;

import lombok.Getter;

/**
 * 비즈니스 로직 예외 클래스
 * ErrorCode를 통해 HTTP 상태코드와 메시지를 포함
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
