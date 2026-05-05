package com.buildingnote.unit.repository;

import com.buildingnote.unit.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * Unit.building은 ManyToOne 관계 필드라 메서드 이름 파싱(buildingId 단축)으로는
 * Hibernate 6에서 인식되지 않는다. 모든 building.id 접근은 @Query로 명시.
 */
public interface UnitRepository extends JpaRepository<Unit, UUID> {

    @Query("SELECT u FROM Unit u WHERE u.building.id = :buildingId ORDER BY u.sortOrder ASC")
    List<Unit> findByBuildingIdOrderBySortOrderAsc(@Param("buildingId") UUID buildingId);

    @Query("SELECT u FROM Unit u WHERE u.building.id IN :buildingIds ORDER BY u.building.id, u.sortOrder ASC")
    List<Unit> findByBuildingIdInOrderBySortOrderAsc(@Param("buildingIds") List<UUID> buildingIds);

    @Query("SELECT COUNT(u) FROM Unit u WHERE u.building.id = :buildingId")
    int countByBuildingId(@Param("buildingId") UUID buildingId);

    @Query("SELECT COUNT(u) FROM Unit u WHERE u.building.organization.id = :orgId")
    long countByOrganizationId(@Param("orgId") UUID orgId);

    @Query("SELECT COUNT(u) FROM Unit u WHERE u.building.organization.id = :orgId AND u.isActive = true")
    long countActiveByOrganizationId(@Param("orgId") UUID orgId);
}
