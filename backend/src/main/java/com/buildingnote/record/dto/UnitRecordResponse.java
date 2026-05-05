package com.buildingnote.record.dto;

import com.buildingnote.record.entity.UnitRecord;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record UnitRecordResponse(
        UUID id,
        UUID unitId,
        UUID authorId,
        String authorName,
        Map<String, Object> data,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UnitRecordResponse from(UnitRecord record) {
        return new UnitRecordResponse(
                record.getId(),
                record.getUnit().getId(),
                record.getAuthor().getId(),
                record.getAuthor().getName(),
                record.getData(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}
