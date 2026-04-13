package com.buildingnote.formschema.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * 폼 스키마 저장 요청 DTO
 */
public record FormSchemaRequest(
        @NotNull(message = "필드 목록을 입력해주세요.")
        List<FormFieldDto> fields
) {
    /**
     * 폼 필드 DTO
     */
    public record FormFieldDto(
            String id,
            String type,
            String label,
            List<String> options,
            boolean required,
            int sortOrder,
            boolean isStatusField
    ) {}
}
