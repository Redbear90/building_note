package com.buildingnote.building.repository;

import com.buildingnote.building.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * 건물 JPA 리포지터리
 */
public interface BuildingRepository extends JpaRepository<Building, UUID> {

    /**
     * 구역 ID로 건물 목록 조회
     */
    List<Building> findByZoneId(UUID zoneId);

    /**
     * 전체 건물 목록 (구역 정보 Fetch Join으로 N+1 방지)
     */
    @Query("SELECT b FROM Building b LEFT JOIN FETCH b.zone ORDER BY b.createdAt DESC")
    List<Building> findAllWithZone();

    /**
     * 구역 ID로 건물 목록 조회 (구역 정보 Fetch Join)
     */
    @Query("SELECT b FROM Building b LEFT JOIN FETCH b.zone WHERE b.zone.id = :zoneId ORDER BY b.createdAt DESC")
    List<Building> findByZoneIdWithZone(@Param("zoneId") UUID zoneId);

    /**
     * 건물명 또는 주소 검색 (구역 필터 + 키워드)
     */
    @Query("SELECT b FROM Building b LEFT JOIN FETCH b.zone WHERE b.zone.id = :zoneId AND (LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(b.address) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY b.createdAt DESC")
    List<Building> findByZoneIdAndKeyword(@Param("zoneId") UUID zoneId, @Param("search") String search);

    /**
     * 건물명 또는 주소 검색 (전체 구역)
     */
    @Query("SELECT b FROM Building b LEFT JOIN FETCH b.zone WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(b.address) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY b.createdAt DESC")
    List<Building> findByKeyword(@Param("search") String search);
}
