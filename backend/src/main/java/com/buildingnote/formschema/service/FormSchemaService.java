package com.buildingnote.formschema.service;

import com.buildingnote.building.entity.Building;
import com.buildingnote.building.repository.BuildingRepository;
import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.common.security.SecurityUtils;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FormSchemaService {

    private final FormSchemaRepository formSchemaRepository;
    private final BuildingRepository buildingRepository;

    public FormSchemaResponse getFormSchema(UUID buildingId) {
        Building building = loadOwnedBuilding(buildingId);
        return formSchemaRepository.findByBuildingId(building.getId())
                .map(FormSchemaResponse::from)
                .orElse(new FormSchemaResponse(null, building.getId(), List.of(), null));
    }

    @Transactional
    public FormSchemaResponse saveFormSchema(UUID buildingId, FormSchemaRequest request) {
        Building building = loadOwnedBuilding(buildingId);

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

        FormSchema schema = formSchemaRepository.findByBuildingId(building.getId())
                .orElse(FormSchema.builder().building(building).build());
        schema.updateFields(fields);

        return FormSchemaResponse.from(formSchemaRepository.save(schema));
    }

    private Building loadOwnedBuilding(UUID buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));
        SecurityUtils.assertOrgAccess(building.getOrganizationId());
        return building;
    }
}
