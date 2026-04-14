package com.buildingnote.export;

import com.buildingnote.building.entity.Building;
import com.buildingnote.building.repository.BuildingRepository;
import com.buildingnote.formschema.entity.FormField;
import com.buildingnote.formschema.entity.FormSchema;
import com.buildingnote.formschema.repository.FormSchemaRepository;
import com.buildingnote.record.entity.UnitRecord;
import com.buildingnote.record.repository.UnitRecordRepository;
import com.buildingnote.unit.entity.Unit;
import com.buildingnote.unit.repository.UnitRepository;
import com.buildingnote.zone.entity.Zone;
import com.buildingnote.zone.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 전체 데이터 엑셀 내보내기 서비스
 * 구역 → 건물 → 호실 순으로 시트 구성
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExcelExportService {

    private final ZoneRepository zoneRepository;
    private final BuildingRepository buildingRepository;
    private final UnitRepository unitRepository;
    private final UnitRecordRepository unitRecordRepository;
    private final FormSchemaRepository formSchemaRepository;

    public byte[] exportAll() throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle boldStyle = createBoldStyle(workbook);
            CellStyle wrapStyle = createWrapStyle(workbook);

            Sheet sheet = workbook.createSheet("건물 현황");

            List<Zone> zones = zoneRepository.findAll();
            List<Building> allBuildings = buildingRepository.findAllWithZone();

            // ── 벌크 조회로 N+1 방지 ──────────────────────────────────────
            List<UUID> buildingIds = allBuildings.stream().map(Building::getId).toList();

            // 건물 ID → 폼 스키마 맵
            Map<UUID, FormSchema> schemaByBuilding = formSchemaRepository
                    .findByBuildingIdIn(buildingIds)
                    .stream()
                    .collect(Collectors.toMap(s -> s.getBuilding().getId(), s -> s));

            // 건물 ID → 호실 목록 맵
            Map<UUID, List<Unit>> unitsByBuilding = unitRepository
                    .findByBuildingIdInOrderBySortOrderAsc(buildingIds)
                    .stream()
                    .collect(Collectors.groupingBy(u -> u.getBuilding().getId()));

            // 전체 호실 ID → 기록 맵
            List<UUID> allUnitIds = unitsByBuilding.values().stream()
                    .flatMap(List::stream)
                    .map(Unit::getId)
                    .toList();
            Map<UUID, UnitRecord> recordByUnit = unitRecordRepository
                    .findByUnitIdIn(allUnitIds)
                    .stream()
                    .collect(Collectors.toMap(r -> r.getUnit().getId(), r -> r));
            // ─────────────────────────────────────────────────────────────

            // 구역별로 건물 그룹핑 (구역 없는 건물 포함)
            Map<String, List<Building>> byZone = new LinkedHashMap<>();
            for (Zone z : zones) byZone.put(z.getId().toString(), new ArrayList<>());
            byZone.put("__none__", new ArrayList<>());

            for (Building b : allBuildings) {
                String key = b.getZone() != null ? b.getZone().getId().toString() : "__none__";
                byZone.computeIfAbsent(key, k -> new ArrayList<>()).add(b);
            }

            int rowIdx = 0;

            for (Map.Entry<String, List<Building>> entry : byZone.entrySet()) {
                List<Building> buildings = entry.getValue();
                if (buildings.isEmpty()) continue;

                String zoneName = entry.getKey().equals("__none__") ? "구역 없음"
                        : zones.stream()
                            .filter(z -> z.getId().toString().equals(entry.getKey()))
                            .findFirst().map(Zone::getName).orElse("알 수 없음");

                // 구역 헤더
                Row zoneRow = sheet.createRow(rowIdx++);
                Cell zoneCell = zoneRow.createCell(0);
                zoneCell.setCellValue("■ 구역: " + zoneName);
                zoneCell.setCellStyle(boldStyle);
                rowIdx++; // 빈 줄

                for (Building building : buildings) {
                    // 건물 헤더
                    Row buildingRow = sheet.createRow(rowIdx++);
                    Cell buildingCell = buildingRow.createCell(0);
                    buildingCell.setCellValue("▶ " + building.getName() + (building.getAddress() != null ? " (" + building.getAddress() + ")" : ""));
                    buildingCell.setCellStyle(boldStyle);

                    // 폼 스키마 (캐시된 맵에서 조회)
                    FormSchema schema = schemaByBuilding.get(building.getId());
                    List<FormField> fields = schema != null ? schema.getFields() : List.of();
                    List<FormField> sortedFields = fields.stream()
                            .sorted(Comparator.comparingInt(FormField::getSortOrder))
                            .collect(Collectors.toList());

                    // 컬럼 헤더
                    Row colHeader = sheet.createRow(rowIdx++);
                    int col = 0;
                    createHeaderCell(colHeader, col++, "호실명", headerStyle);
                    createHeaderCell(colHeader, col++, "층", headerStyle);
                    createHeaderCell(colHeader, col++, "ON 여부", headerStyle);
                    for (FormField field : sortedFields) {
                        createHeaderCell(colHeader, col++, field.getLabel(), headerStyle);
                    }
                    createHeaderCell(colHeader, col, "메모", headerStyle);

                    // 유닛 데이터 (캐시된 맵에서 조회)
                    List<Unit> units = unitsByBuilding.getOrDefault(building.getId(), List.of());
                    for (Unit unit : units) {
                        Row dataRow = sheet.createRow(rowIdx++);
                        UnitRecord record = recordByUnit.get(unit.getId());
                        Map<String, Object> data = record != null ? record.getData() : Map.of();

                        col = 0;
                        dataRow.createCell(col++).setCellValue(unit.getName());
                        if (unit.getFloor() != null) {
                            int floor = unit.getFloor();
                            dataRow.createCell(col++).setCellValue(floor < 0 ? "지하" + Math.abs(floor) + "층" : floor + "층");
                        } else {
                            dataRow.createCell(col++).setCellValue("");
                        }
                        String active = String.valueOf(data.getOrDefault("__active", "false"));
                        dataRow.createCell(col++).setCellValue("true".equals(active) ? "ON" : "OFF");
                        for (FormField field : sortedFields) {
                            Object val = data.get(field.getId());
                            Cell c = dataRow.createCell(col++);
                            c.setCellStyle(wrapStyle);
                            if (val == null) {
                                c.setCellValue("");
                            } else if (val instanceof List<?> list) {
                                c.setCellValue(list.stream().map(Object::toString).collect(Collectors.joining(", ")));
                            } else {
                                c.setCellValue(val.toString());
                            }
                        }
                        // 메모 없음 (별도 comment 테이블 — 필요시 확장)
                        dataRow.createCell(col).setCellValue("");
                    }
                    rowIdx++; // 건물 사이 빈 줄
                }
                rowIdx++; // 구역 사이 빈 줄
            }

            // 컬럼 자동 너비
            for (int i = 0; i < 20; i++) sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void createHeaderCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createBoldStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        return style;
    }

    private CellStyle createWrapStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setWrapText(true);
        return style;
    }
}
