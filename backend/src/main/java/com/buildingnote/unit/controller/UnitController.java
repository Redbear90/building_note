package com.buildingnote.unit.controller;

import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.unit.dto.UnitReorderRequest;
import com.buildingnote.unit.dto.UnitRequest;
import com.buildingnote.unit.dto.UnitResponse;
import com.buildingnote.unit.service.UnitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 호실 컨트롤러
 */
@Tag(name = "호실", description = "건물 내 호실 관리 API")
@RestController
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @Operation(summary = "호실 목록 조회")
    @GetMapping("/api/v1/buildings/{buildingId}/units")
    public ResponseEntity<ApiResponse<List<UnitResponse>>> getUnits(@PathVariable UUID buildingId) {
        return ResponseEntity.ok(ApiResponse.success(unitService.getUnits(buildingId)));
    }

    @Operation(summary = "호실 추가 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/api/v1/buildings/{buildingId}/units")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UnitResponse>> createUnit(
            @PathVariable UUID buildingId,
            @Valid @RequestBody UnitRequest request) {

        UnitResponse response = unitService.createUnit(buildingId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "호실이 추가되었습니다."));
    }

    @Operation(summary = "호실 수정 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PatchMapping("/api/v1/units/{unitId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UnitResponse>> updateUnit(
            @PathVariable UUID unitId,
            @Valid @RequestBody UnitRequest request) {

        return ResponseEntity.ok(ApiResponse.success(unitService.updateUnit(unitId, request), "호실이 수정되었습니다."));
    }

    @Operation(summary = "호실 삭제 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @DeleteMapping("/api/v1/units/{unitId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUnit(@PathVariable UUID unitId) {
        unitService.deleteUnit(unitId);
        return ResponseEntity.ok(ApiResponse.success(null, "호실이 삭제되었습니다."));
    }

    @Operation(summary = "호실 순서 변경 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PatchMapping("/api/v1/buildings/{buildingId}/units/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UnitResponse>>> reorderUnits(
            @PathVariable UUID buildingId,
            @RequestBody UnitReorderRequest request) {

        return ResponseEntity.ok(ApiResponse.success(unitService.reorderUnits(buildingId, request), "호실 순서가 변경되었습니다."));
    }
}
