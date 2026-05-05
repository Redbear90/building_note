package com.buildingnote.zone.repository;

import com.buildingnote.zone.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * organization은 ManyToOne 관계 필드라 메서드 이름 파싱(findByOrganizationId)으로는
 * Hibernate 6에서 인식되지 않는다. @Query로 명시.
 */
public interface ZoneRepository extends JpaRepository<Zone, UUID> {

    @Query("SELECT z FROM Zone z WHERE z.organization.id = :orgId ORDER BY z.createdAt DESC")
    List<Zone> findByOrganizationIdOrderByCreatedAtDesc(@Param("orgId") UUID orgId);

    @Query("SELECT COUNT(z) FROM Zone z WHERE z.organization.id = :orgId")
    long countByOrganizationId(@Param("orgId") UUID orgId);
}
