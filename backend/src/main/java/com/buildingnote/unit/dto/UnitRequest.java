package com.buildingnote.unit.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 호실 생성/수정 요청 DTO
 */
public record UnitRequest(
        @NotBlank(message = "호실 이름을 입력해주세요.")
        String name,

        Integer floor,

        Integer sortOrder
) {}
