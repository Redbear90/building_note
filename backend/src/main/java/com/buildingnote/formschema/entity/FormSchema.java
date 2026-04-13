package com.buildingnote.formschema.entity;

import com.buildingnote.building.entity.Building;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 폼 스키마 엔티티
 * 건물별 커스텀 폼 필드 정의를 JSONB로 저장
 */
@Entity
@Table(name = "form_schemas")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class FormSchema {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false, unique = true)
    private Building building;

    /**
     * 필드 정의 배열 (JSONB)
     * [{ id, type, label, options, required, sortOrder }, ...]
     */
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private List<FormField> fields = new ArrayList<>();

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 폼 스키마 필드 전체 교체
     */
    public void updateFields(List<FormField> fields) {
        this.fields = fields;
    }
}
