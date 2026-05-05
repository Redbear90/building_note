package com.buildingnote.zone.controller;

import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.zone.dto.ZoneRequest;
import com.buildingnote.zone.dto.ZoneResponse;
import com.buildingnote.zone.service.ZoneService;
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

@Tag(name = "구역", description = "지도 폴리곤 구역 (org 단위 격리)")
@RestController
@RequestMapping("/api/v1/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    @Operation(summary = "구역 목록")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ZoneResponse>>> getAllZones() {
        return ResponseEntity.ok(ApiResponse.success(zoneService.getAllZones()));
    }

    @Operation(summary = "구역 생성 (BUILDING_OWNER)")
    @PostMapping
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<ZoneResponse>> createZone(@Valid @RequestBody ZoneRequest request) {
        ZoneResponse response = zoneService.createZone(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "구역이 생성되었습니다."));
    }

    @Operation(summary = "구역 수정 (BUILDING_OWNER)")
    @PatchMapping("/{zoneId}")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<ZoneResponse>> updateZone(
            @PathVariable UUID zoneId,
            @Valid @RequestBody ZoneRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                zoneService.updateZone(zoneId, request), "구역이 수정되었습니다."));
    }

    @Operation(summary = "구역 삭제 (BUILDING_OWNER)")
    @DeleteMapping("/{zoneId}")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteZone(@PathVariable UUID zoneId) {
        zoneService.deleteZone(zoneId);
        return ResponseEntity.ok(ApiResponse.success(null, "구역이 삭제되었습니다."));
    }
}
