package com.buildingnote.record.dto;

import com.buildingnote.record.entity.UnitRecord;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * 호실 기록 응답 DTO
 */
public record UnitRecordResponse(
        UUID id,
        UUID unitId,
        Map<String, Object> data,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UnitRecordResponse from(UnitRecord record) {
        return new UnitRecordResponse(
                record.getId(),
                record.getUnit().getId(),
                record.getData(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}
