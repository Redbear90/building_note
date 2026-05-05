package com.buildingnote.formschema.repository;

import com.buildingnote.formschema.entity.FormSchema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FormSchemaRepository extends JpaRepository<FormSchema, UUID> {

    @Query("SELECT s FROM FormSchema s WHERE s.building.id = :buildingId")
    Optional<FormSchema> findByBuildingId(@Param("buildingId") UUID buildingId);

    @Query("SELECT s FROM FormSchema s WHERE s.building.id IN :buildingIds")
    List<FormSchema> findByBuildingIdIn(@Param("buildingIds") List<UUID> buildingIds);
}
