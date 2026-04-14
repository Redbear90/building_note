package com.buildingnote.formschema.repository;

import com.buildingnote.formschema.entity.FormSchema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 폼 스키마 JPA 리포지터리
 */
public interface FormSchemaRepository extends JpaRepository<FormSchema, UUID> {

    Optional<FormSchema> findByBuildingId(UUID buildingId);

    /**
     * 여러 건물 ID로 폼 스키마 일괄 조회 (엑셀 내보내기 N+1 방지)
     */
    @Query("SELECT s FROM FormSchema s WHERE s.building.id IN :buildingIds")
    List<FormSchema> findByBuildingIdIn(@Param("buildingIds") List<UUID> buildingIds);
}
