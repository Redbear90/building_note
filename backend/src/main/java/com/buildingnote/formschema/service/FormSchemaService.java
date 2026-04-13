package com.buildingnote.formschema.service;

import com.buildingnote.building.entity.Building;
import com.buildingnote.building.repository.BuildingRepository;
import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.formschema.dto.FormSchemaRequest;
import com.buildingnote.formschema.dto.FormSchemaResponse;
import com.buildingnote.formschema.entity.FormField;
import com.buildingnote.formschema.entity.FormSchema;
import com.buildingnote.formschema.repository.FormSchemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 폼 스키마 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FormSchemaService {

    private final FormSchemaRepository formSchemaRepository;
    private final BuildingRepository buildingRepository;

    /**
     * 건물의 폼 스키마 조회
     * 스키마가 없으면 빈 필드 배열로 초기화
     */
    public FormSchemaResponse getFormSchema(UUID buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));

        return formSchemaRepository.findByBuildingId(buildingId)
                .map(FormSchemaResponse::from)
                .orElse(new FormSchemaResponse(null, buildingId, List.of(), null));
    }

    /**
     * 폼 스키마 저장/전체교체 (upsert)
     * 기존 스키마가 있으면 필드 전체 교체, 없으면 새로 생성
     */
    @Transactional
    public FormSchemaResponse saveFormSchema(UUID buildingId, FormSchemaRequest request) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));

        // DTO → Entity 변환
        List<FormField> fields = request.fields().stream()
                .map(dto -> FormField.builder()
                        .id(dto.id())
                        .type(dto.type())
                        .label(dto.label())
                        .options(dto.options())
                        .required(dto.required())
                        .sortOrder(dto.sortOrder())
                        .isStatusField(dto.isStatusField())
                        .build())
                .toList();

        // upsert: 기존 스키마가 있으면 업데이트, 없으면 생성
        FormSchema schema = formSchemaRepository.findByBuildingId(buildingId)
                .orElse(FormSchema.builder().building(building).build());

        schema.updateFields(fields);

        return FormSchemaResponse.from(formSchemaRepository.save(schema));
    }
}
