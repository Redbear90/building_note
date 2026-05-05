package com.buildingnote.record.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * 호실 기록 저장 요청. 작성자는 SecurityContext에서 자동 결정된다.
 */
public record UnitRecordRequest(
        @NotNull(message = "데이터를 입력해주세요.")
        Map<String, Object> data
) {}
