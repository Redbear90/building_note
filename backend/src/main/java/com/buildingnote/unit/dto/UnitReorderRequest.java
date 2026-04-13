package com.buildingnote.unit.dto;

import java.util.List;
import java.util.UUID;

/**
 * 호실 순서 변경 요청 DTO
 */
public record UnitReorderRequest(
        List<UnitSortItem> items
) {
    public record UnitSortItem(UUID id, int sortOrder) {}
}
