package com.buildingnote.export;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDate;

@Tag(name = "내보내기", description = "엑셀 내보내기 (BUILDING_OWNER 전용)")
@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExcelExportController {

    private final ExcelExportService excelExportService;

    @Operation(summary = "내 워크스페이스 건물/호실 엑셀 다운로드")
    @GetMapping("/buildings/excel")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<byte[]> downloadBuildingsExcel() throws IOException {
        byte[] excel = excelExportService.exportMyOrganization();
        String filename = "building_status_" + LocalDate.now() + ".xlsx";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(excel);
    }
}
