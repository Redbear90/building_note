package com.buildingnote.building.repository;

import com.buildingnote.building.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * 건물 리포지터리. 모든 조회는 organization 단위로 격리된다.
 */
public interface BuildingRepository extends JpaRepository<Building, UUID> {

    @Query("""
        SELECT b FROM Building b
        LEFT JOIN FETCH b.zone
        WHERE b.organization.id = :orgId
        ORDER BY b.createdAt DESC
        """)
    List<Building> findAllInOrg(@Param("orgId") UUID orgId);

    @Query("""
        SELECT b FROM Building b
        LEFT JOIN FETCH b.zone
        WHERE b.organization.id = :orgId AND b.zone.id = :zoneId
        ORDER BY b.createdAt DESC
        """)
    List<Building> findByZoneIdInOrg(@Param("orgId") UUID orgId, @Param("zoneId") UUID zoneId);

    @Query("""
        SELECT b FROM Building b
        LEFT JOIN FETCH b.zone
        WHERE b.organization.id = :orgId
          AND (LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(b.address) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY b.createdAt DESC
        """)
    List<Building> findByKeywordInOrg(@Param("orgId") UUID orgId, @Param("search") String search);

    @Query("""
        SELECT b FROM Building b
        LEFT JOIN FETCH b.zone
        WHERE b.organization.id = :orgId AND b.zone.id = :zoneId
          AND (LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(b.address) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY b.createdAt DESC
        """)
    List<Building> findByZoneIdAndKeywordInOrg(
            @Param("orgId") UUID orgId,
            @Param("zoneId") UUID zoneId,
            @Param("search") String search);

    @Query("SELECT COUNT(b) FROM Building b WHERE b.organization.id = :orgId")
    long countByOrganizationId(@Param("orgId") UUID orgId);
}
