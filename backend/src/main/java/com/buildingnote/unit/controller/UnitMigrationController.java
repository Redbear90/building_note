package com.buildingnote.unit.controller;

import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.unit.service.UnitMigrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 호실 이름 마이그레이션 컨트롤러
 */
@Tag(name = "마이그레이션", description = "데이터 일괄 변환")
@RestController
@RequestMapping("/api/v1/admin/migrate")
@RequiredArgsConstructor
public class UnitMigrationController {

    private final UnitMigrationService unitMigrationService;

    @Operation(summary = "호실 이름 음수층 → B형식 변환 (-101호 → B101호)", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/unit-names/basement")
    public ResponseEntity<ApiResponse<String>> migrateBasementNames() {
        int count = unitMigrationService.migrateNegativeFloorNames();
        return ResponseEntity.ok(ApiResponse.success(
                count + "개 호실 이름이 변환되었습니다.",
                count + "개 변환 완료"
        ));
    }
}
