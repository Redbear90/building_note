package com.buildingnote.unit.dto;

import com.buildingnote.unit.entity.Unit;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 호실 응답 DTO
 */
public record UnitResponse(
        UUID id,
        String name,
        Integer floor,
        Integer sortOrder,
        UUID buildingId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UnitResponse from(Unit unit) {
        return new UnitResponse(
                unit.getId(),
                unit.getName(),
                unit.getFloor(),
                unit.getSortOrder(),
                unit.getBuilding().getId(),
                unit.getCreatedAt(),
                unit.getUpdatedAt()
        );
    }
}
