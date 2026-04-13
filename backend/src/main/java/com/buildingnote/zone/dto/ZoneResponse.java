package com.buildingnote.zone.dto;

import com.buildingnote.zone.entity.Zone;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 구역 응답 DTO
 */
public record ZoneResponse(
        UUID id,
        String name,
        List<List<Double>> polygon,
        String color,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Zone 엔티티로부터 ZoneResponse 생성
     */
    public static ZoneResponse from(Zone zone) {
        return new ZoneResponse(
                zone.getId(),
                zone.getName(),
                zone.getPolygon(),
                zone.getColor(),
                zone.getCreatedAt(),
                zone.getUpdatedAt()
        );
    }
}
