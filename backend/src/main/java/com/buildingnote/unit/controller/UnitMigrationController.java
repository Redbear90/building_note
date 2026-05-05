package com.buildingnote.unit.controller;

import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.unit.service.UnitMigrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "마이그레이션", description = "데이터 일괄 변환 (사이트 ADMIN 전용)")
@RestController
@RequestMapping("/api/v1/admin/migrate")
@RequiredArgsConstructor
public class UnitMigrationController {

    private final UnitMigrationService unitMigrationService;

    @Operation(summary = "호실 이름 음수층 → B형식 변환 (-101호 → B101호)")
    @PostMapping("/unit-names/basement")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> migrateBasementNames() {
        int count = unitMigrationService.migrateNegativeFloorNames();
        return ResponseEntity.ok(ApiResponse.success(
                count + "개 호실 이름이 변환되었습니다.",
                count + "개 변환 완료"));
    }
}
