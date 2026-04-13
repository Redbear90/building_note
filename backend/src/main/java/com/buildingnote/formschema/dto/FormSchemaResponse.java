package com.buildingnote.formschema.dto;

import com.buildingnote.formschema.entity.FormField;
import com.buildingnote.formschema.entity.FormSchema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 폼 스키마 응답 DTO
 */
public record FormSchemaResponse(
        UUID id,
        UUID buildingId,
        List<FormFieldDto> fields,
        LocalDateTime updatedAt
) {
    public record FormFieldDto(
            String id,
            String type,
            String label,
            List<String> options,
            boolean required,
            int sortOrder,
            boolean isStatusField
    ) {
        public static FormFieldDto from(FormField field) {
            return new FormFieldDto(
                    field.getId(),
                    field.getType(),
                    field.getLabel(),
                    field.getOptions(),
                    field.isRequired(),
                    field.getSortOrder(),
                    field.isStatusField()
            );
        }
    }

    public static FormSchemaResponse from(FormSchema schema) {
        return new FormSchemaResponse(
                schema.getId(),
                schema.getBuilding().getId(),
                schema.getFields().stream().map(FormFieldDto::from).toList(),
                schema.getUpdatedAt()
        );
    }
}
