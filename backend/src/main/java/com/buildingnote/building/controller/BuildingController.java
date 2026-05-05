package com.buildingnote.building.controller;

import com.buildingnote.building.dto.BuildingRequest;
import com.buildingnote.building.dto.BuildingResponse;
import com.buildingnote.building.service.BuildingService;
import com.buildingnote.common.response.ApiResponse;
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

@Tag(name = "건물", description = "건물 관리 API (org 단위 격리)")
@RestController
@RequestMapping("/api/v1/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    @Operation(summary = "건물 목록")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<BuildingResponse>>> getBuildings(
            @RequestParam(required = false) UUID zoneId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(buildingService.getBuildings(zoneId, search)));
    }

    @Operation(summary = "건물 상세")
    @GetMapping("/{buildingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BuildingResponse>> getBuilding(@PathVariable UUID buildingId) {
        return ResponseEntity.ok(ApiResponse.success(buildingService.getBuilding(buildingId)));
    }

    @Operation(summary = "건물 생성 (BUILDING_OWNER)")
    @PostMapping
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<BuildingResponse>> createBuilding(
            @Valid @RequestBody BuildingRequest request) {
        BuildingResponse response = buildingService.createBuilding(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "건물이 생성되었습니다."));
    }

    @Operation(summary = "건물 수정 (BUILDING_OWNER)")
    @PatchMapping("/{buildingId}")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<BuildingResponse>> updateBuilding(
            @PathVariable UUID buildingId,
            @Valid @RequestBody BuildingRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                buildingService.updateBuilding(buildingId, request), "건물이 수정되었습니다."));
    }

    @Operation(summary = "건물 삭제 (BUILDING_OWNER)")
    @DeleteMapping("/{buildingId}")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteBuilding(@PathVariable UUID buildingId) {
        buildingService.deleteBuilding(buildingId);
        return ResponseEntity.ok(ApiResponse.success(null, "건물이 삭제되었습니다."));
    }
}
