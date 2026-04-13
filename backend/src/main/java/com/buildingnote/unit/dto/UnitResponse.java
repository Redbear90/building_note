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
        LocalDateTime lastCommentAt,  // 최신 댓글 작성 시각 (NEW 배지용)
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
                unit.getBuilding().getId(),
                lastCommentAt,
                unit.getCreatedAt(),
                unit.getUpdatedAt()
        );
    }
}
