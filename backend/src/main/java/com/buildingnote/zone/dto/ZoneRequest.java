package com.buildingnote.zone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * 구역 생성/수정 요청 DTO
 */
public record ZoneRequest(
        @NotBlank(message = "구역 이름을 입력해주세요.")
        String name,

        @NotEmpty(message = "폴리곤 좌표를 입력해주세요.")
        List<List<Double>> polygon,   // [[위도, 경도], ...]

        String color
) {}
