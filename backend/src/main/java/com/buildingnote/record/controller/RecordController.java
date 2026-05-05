package com.buildingnote.record.controller;

import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.record.dto.UnitRecordRequest;
import com.buildingnote.record.dto.UnitRecordResponse;
import com.buildingnote.record.service.RecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "호실 기록", description = "호실 기록 (멤버별 1건, soft delete)")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    @Operation(summary = "내 호실 기록 조회")
    @GetMapping("/units/{unitId}/record/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UnitRecordResponse>> getMyRecord(@PathVariable UUID unitId) {
        return ResponseEntity.ok(ApiResponse.success(recordService.getMyRecord(unitId)));
    }

    @Operation(summary = "호실 내 모든 멤버 기록 (BUILDING_OWNER)")
    @GetMapping("/units/{unitId}/records")
    @PreAuthorize("hasAnyRole('BUILDING_OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<List<UnitRecordResponse>>> getAllRecords(@PathVariable UUID unitId) {
        return ResponseEntity.ok(ApiResponse.success(recordService.getAllRecords(unitId)));
    }

    @Operation(summary = "내 호실 기록 저장 (upsert)")
    @PutMapping("/units/{unitId}/record/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UnitRecordResponse>> saveMyRecord(
            @PathVariable UUID unitId,
            @Valid @RequestBody UnitRecordRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                recordService.saveMyRecord(unitId, request), "기록이 저장되었습니다."));
    }

    @Operation(summary = "호실 기록 삭제 (Soft) — 본인/소유자/사이트관리자")
    @DeleteMapping("/records/{recordId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(@PathVariable UUID recordId) {
        recordService.softDeleteRecord(recordId);
        return ResponseEntity.ok(ApiResponse.success(null, "기록이 삭제되었습니다."));
    }
}
