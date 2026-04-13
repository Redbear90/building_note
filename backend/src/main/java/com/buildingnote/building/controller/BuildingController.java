package com.buildingnote.building.controller;

import com.buildingnote.building.dto.BuildingRequest;
import com.buildingnote.building.dto.BuildingResponse;
import com.buildingnote.building.service.BuildingService;
import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 건물 컨트롤러
 * GET: 공개, POST/PATCH/DELETE: ADMIN 전용
 */
@Tag(name = "건물", description = "건물 관리 API")
@RestController
@RequestMapping("/api/v1/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    @Operation(summary = "건물 목록 조회", description = "지도 마커 표시용 건물 목록. zoneId로 필터링 가능.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<BuildingResponse>>> getBuildings(
            @RequestParam(required = false) UUID zoneId) {

        return ResponseEntity.ok(ApiResponse.success(buildingService.getBuildings(zoneId)));
    }

    @Operation(summary = "건물 상세 조회")
    @GetMapping("/{buildingId}")
    public ResponseEntity<ApiResponse<BuildingResponse>> getBuilding(@PathVariable UUID buildingId) {
        return ResponseEntity.ok(ApiResponse.success(buildingService.getBuilding(buildingId)));
    }

    @Operation(summary = "건물 생성 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')") // [임시 공개] 복구 시 주석 해제
    public ResponseEntity<ApiResponse<BuildingResponse>> createBuilding(
            @Valid @RequestBody BuildingRequest request,
            @AuthenticationPrincipal User currentUser) {

        BuildingResponse response = buildingService.createBuilding(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "건물이 생성되었습니다."));
    }

    @Operation(summary = "건물 수정 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PatchMapping("/{buildingId}")
    // @PreAuthorize("hasRole('ADMIN')") // [임시 공개] 복구 시 주석 해제
    public ResponseEntity<ApiResponse<BuildingResponse>> updateBuilding(
            @PathVariable UUID buildingId,
            @Valid @RequestBody BuildingRequest request) {

        return ResponseEntity.ok(ApiResponse.success(buildingService.updateBuilding(buildingId, request), "건물이 수정되었습니다."));
    }

    @Operation(summary = "건물 삭제 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @DeleteMapping("/{buildingId}")
    // @PreAuthorize("hasRole('ADMIN')") // [임시 공개] 복구 시 주석 해제
    public ResponseEntity<ApiResponse<Void>> deleteBuilding(@PathVariable UUID buildingId) {
        buildingService.deleteBuilding(buildingId);
        return ResponseEntity.ok(ApiResponse.success(null, "건물이 삭제되었습니다."));
    }
}
