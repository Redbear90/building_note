package com.buildingnote.formschema.repository;

import com.buildingnote.formschema.entity.FormSchema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * 폼 스키마 JPA 리포지터리
 */
public interface FormSchemaRepository extends JpaRepository<FormSchema, UUID> {

    Optional<FormSchema> findByBuildingId(UUID buildingId);
}
