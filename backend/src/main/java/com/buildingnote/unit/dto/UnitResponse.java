package com.buildingnote.unit.dto;

import com.buildingnote.unit.entity.Unit;

import java.time.LocalDateTime;
import java.util.UUID;

public record UnitResponse(
        UUID id,
        String name,
        Integer floor,
        Integer sortOrder,
        boolean isActive,
        UUID buildingId,
        LocalDateTime lastCommentAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UnitResponse from(Unit unit) {
        return from(unit, null);
    }

    public static UnitResponse from(Unit unit, LocalDateTime lastCommentAt) {
        return new UnitResponse(
                unit.getId(),
                unit.getName(),
                unit.getFloor(),
                unit.getSortOrder(),
                Boolean.TRUE.equals(unit.getIsActive()),
                unit.getBuilding().getId(),
                lastCommentAt,
                unit.getCreatedAt(),
                unit.getUpdatedAt()
        );
    }
}
