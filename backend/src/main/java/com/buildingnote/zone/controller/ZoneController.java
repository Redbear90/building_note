package com.buildingnote.zone.controller;

import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.user.entity.User;
import com.buildingnote.zone.dto.ZoneRequest;
import com.buildingnote.zone.dto.ZoneResponse;
import com.buildingnote.zone.service.ZoneService;
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
 * 구역 컨트롤러
 * GET: 공개, POST/PATCH/DELETE: ADMIN 전용
 */
@Tag(name = "구역", description = "지도 폴리곤 구역 관리 API")
@RestController
@RequestMapping("/api/v1/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    @Operation(summary = "구역 전체 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ZoneResponse>>> getAllZones() {
        return ResponseEntity.ok(ApiResponse.success(zoneService.getAllZones()));
    }

    @Operation(summary = "구역 생성 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')") // [임시 공개] 복구 시 주석 해제
    public ResponseEntity<ApiResponse<ZoneResponse>> createZone(
            @Valid @RequestBody ZoneRequest request,
            @AuthenticationPrincipal User currentUser) {

        ZoneResponse response = zoneService.createZone(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "구역이 생성되었습니다."));
    }

    @Operation(summary = "구역 수정 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PatchMapping("/{zoneId}")
    // @PreAuthorize("hasRole('ADMIN')") // [임시 공개] 복구 시 주석 해제
    public ResponseEntity<ApiResponse<ZoneResponse>> updateZone(
            @PathVariable UUID zoneId,
            @Valid @RequestBody ZoneRequest request) {

        return ResponseEntity.ok(ApiResponse.success(zoneService.updateZone(zoneId, request), "구역이 수정되었습니다."));
    }

    @Operation(summary = "구역 삭제 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @DeleteMapping("/{zoneId}")
    // @PreAuthorize("hasRole('ADMIN')") // [임시 공개] 복구 시 주석 해제
    public ResponseEntity<ApiResponse<Void>> deleteZone(@PathVariable UUID zoneId) {
        zoneService.deleteZone(zoneId);
        return ResponseEntity.ok(ApiResponse.success(null, "구역이 삭제되었습니다."));
    }
}
