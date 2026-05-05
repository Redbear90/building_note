package com.buildingnote.unit.controller;

import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.unit.dto.UnitActiveRequest;
import com.buildingnote.unit.dto.UnitReorderRequest;
import com.buildingnote.unit.dto.UnitRequest;
import com.buildingnote.unit.dto.UnitResponse;
import com.buildingnote.unit.service.UnitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "호실", description = "호실 관리 API")
@RestController
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @Operation(summary = "전체 호실 수 (현재 워크스페이스)")
    @GetMapping("/api/v1/units/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getTotalUnitCount() {
        return ResponseEntity.ok(ApiResponse.success(unitService.getTotalCount()));
    }

    @Operation(summary = "호실 통계 (전체/동의/미참여)")
    @GetMapping("/api/v1/units/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UnitService.UnitStats>> getUnitStats() {
        return ResponseEntity.ok(ApiResponse.success(unitService.getStats()));
    }

    @Operation(summary = "건물의 호실 목록")
    @GetMapping("/api/v1/buildings/{buildingId}/units")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UnitResponse>>> getUnits(@PathVariable UUID buildingId) {
        return ResponseEntity.ok(ApiResponse.success(unitService.getUnits(buildingId)));
    }

    @Operation(summary = "호실 추가 (BUILDING_OWNER)")
    @PostMapping("/api/v1/buildings/{buildingId}/units")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<UnitResponse>> createUnit(
            @PathVariable UUID buildingId,
            @Valid @RequestBody UnitRequest request) {
        UnitResponse response = unitService.createUnit(buildingId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "호실이 추가되었습니다."));
    }

    @Operation(summary = "호실 수정 (BUILDING_OWNER)")
    @PatchMapping("/api/v1/units/{unitId}")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<UnitResponse>> updateUnit(
            @PathVariable UUID unitId,
            @Valid @RequestBody UnitRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                unitService.updateUnit(unitId, request), "호실이 수정되었습니다."));
    }

    @Operation(summary = "호실 삭제 (BUILDING_OWNER)")
    @DeleteMapping("/api/v1/units/{unitId}")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteUnit(@PathVariable UUID unitId) {
        unitService.deleteUnit(unitId);
        return ResponseEntity.ok(ApiResponse.success(null, "호실이 삭제되었습니다."));
    }

    @Operation(summary = "호실 순서 변경 (BUILDING_OWNER)")
    @PatchMapping("/api/v1/buildings/{buildingId}/units/reorder")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<List<UnitResponse>>> reorderUnits(
            @PathVariable UUID buildingId,
            @RequestBody UnitReorderRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                unitService.reorderUnits(buildingId, request), "호실 순서가 변경되었습니다."));
    }

    @Operation(summary = "슬라이드 버튼 토글 (모든 인증 사용자)")
    @PatchMapping("/api/v1/units/{unitId}/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UnitResponse>> setActive(
            @PathVariable UUID unitId,
            @RequestBody UnitActiveRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                unitService.setActive(unitId, request.active()), "상태가 변경되었습니다."));
    }
}
