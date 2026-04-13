package com.buildingnote.formschema.controller;

import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.formschema.dto.FormSchemaRequest;
import com.buildingnote.formschema.dto.FormSchemaResponse;
import com.buildingnote.formschema.service.FormSchemaService;
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
 * 폼 스키마 컨트롤러
 * GET: 공개, PUT: ADMIN 전용
 */
@Tag(name = "폼 스키마", description = "건물별 커스텀 폼 필드 정의 API")
@RestController
@RequestMapping("/api/v1/buildings/{buildingId}/form-schema")
@RequiredArgsConstructor
public class FormSchemaController {

    private final FormSchemaService formSchemaService;

    @Operation(summary = "폼 스키마 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<FormSchemaResponse>> getFormSchema(@PathVariable UUID buildingId) {
        return ResponseEntity.ok(ApiResponse.success(formSchemaService.getFormSchema(buildingId)));
    }

    @Operation(summary = "폼 스키마 저장/전체교체 (ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FormSchemaResponse>> saveFormSchema(
            @PathVariable UUID buildingId,
            @Valid @RequestBody FormSchemaRequest request) {

        return ResponseEntity.ok(ApiResponse.success(
                formSchemaService.saveFormSchema(buildingId, request),
                "폼 스키마가 저장되었습니다."));
    }
}
