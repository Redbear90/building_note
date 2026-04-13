package com.buildingnote.building.dto;

import com.buildingnote.building.entity.Building;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 건물 응답 DTO
 */
public record BuildingResponse(
        UUID id,
        String name,
        String address,
        Double lat,
        Double lng,
        UUID zoneId,
        String zoneName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Building 엔티티로부터 BuildingResponse 생성
     */
    public static BuildingResponse from(Building building) {
        return new BuildingResponse(
                building.getId(),
                building.getName(),
                building.getAddress(),
                building.getLat(),
                building.getLng(),
                building.getZone() != null ? building.getZone().getId() : null,
                building.getZone() != null ? building.getZone().getName() : null,
                building.getCreatedAt(),
                building.getUpdatedAt()
        );
    }
}
