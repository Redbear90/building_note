package com.buildingnote.unit.repository;

import com.buildingnote.unit.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * 호실 JPA 리포지터리
 */
public interface UnitRepository extends JpaRepository<Unit, UUID> {

    /**
     * 건물 ID로 호실 목록 조회 (정렬 순서 오름차순)
     */
    List<Unit> findByBuildingIdOrderBySortOrderAsc(UUID buildingId);

    /**
     * 여러 건물 ID로 호실 목록 일괄 조회 (엑셀 내보내기 N+1 방지)
     */
    @Query("SELECT u FROM Unit u WHERE u.building.id IN :buildingIds ORDER BY u.building.id, u.sortOrder ASC")
    List<Unit> findByBuildingIdInOrderBySortOrderAsc(@Param("buildingIds") List<UUID> buildingIds);

    /**
     * 건물 내 최대 정렬 순서 조회 (새 호실 추가 시 사용)
     */
    int countByBuildingId(UUID buildingId);
}
