package com.buildingnote.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 모든 API 응답의 공통 래퍼 클래스
 * <p>
 * 성공 응답:
 * { "success": true, "data": {...}, "message": "성공", "timestamp": "..." }
 * <p>
 * 실패 응답:
 * { "success": false, "data": null, "message": "에러 메시지", "code": "ERROR_CODE", "timestamp": "..." }
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;
    private final String code;        // 에러 코드 (실패 시만 포함)
    private final LocalDateTime timestamp;

    /**
     * 성공 응답 생성 (데이터 포함)
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message("성공")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 성공 응답 생성 (메시지 커스텀)
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 성공 응답 생성 (데이터 없음)
     */
    public static <Void> ApiResponse<Void> success() {
        return ApiResponse.<Void>builder()
                .success(true)
                .message("성공")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 실패 응답 생성
     */
    public static <T> ApiResponse<T> failure(String message, String code) {
        return ApiResponse.<T>builder()
                .success(false)
                .data(null)
                .message(message)
                .code(code)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
