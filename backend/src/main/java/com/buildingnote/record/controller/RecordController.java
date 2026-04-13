package com.buildingnote.record.controller;

import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.record.dto.UnitRecordRequest;
import com.buildingnote.record.dto.UnitRecordResponse;
import com.buildingnote.record.service.RecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 호실 기록 컨트롤러
 * 인증된 사용자만 접근 가능
 */
@Tag(name = "호실 기록", description = "호실별 커스텀 폼 데이터 입력/조회 API")
@RestController
@RequestMapping("/api/v1/units/{unitId}/record")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    @Operation(summary = "호실 기록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<UnitRecordResponse>> getRecord(@PathVariable UUID unitId) {
        return ResponseEntity.ok(ApiResponse.success(recordService.getRecord(unitId)));
    }

    @Operation(summary = "호실 기록 저장 (upsert)", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UnitRecordResponse>> saveRecord(
            @PathVariable UUID unitId,
            @Valid @RequestBody UnitRecordRequest request) {

        return ResponseEntity.ok(ApiResponse.success(
                recordService.saveRecord(unitId, request),
                "기록이 저장되었습니다."));
    }
}
