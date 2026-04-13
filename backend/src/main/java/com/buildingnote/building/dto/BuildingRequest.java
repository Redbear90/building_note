package com.buildingnote.building.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * 건물 생성/수정 요청 DTO
 */
public record BuildingRequest(
        @NotBlank(message = "건물 이름을 입력해주세요.")
        String name,

        String address,

        @NotNull(message = "위도를 입력해주세요.")
        Double lat,

        @NotNull(message = "경도를 입력해주세요.")
        Double lng,

        UUID zoneId     // null 허용 (구역 미지정)
) {}
