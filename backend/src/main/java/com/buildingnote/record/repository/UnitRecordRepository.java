package com.buildingnote.record.repository;

import com.buildingnote.record.entity.UnitRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 호실 기록 JPA 리포지터리
 */
public interface UnitRecordRepository extends JpaRepository<UnitRecord, UUID> {

    Optional<UnitRecord> findByUnitId(UUID unitId);

    /**
     * 여러 호실 ID로 기록 일괄 조회 (엑셀 내보내기 N+1 방지)
     */
    @Query("SELECT r FROM UnitRecord r WHERE r.unit.id IN :unitIds")
    List<UnitRecord> findByUnitIdIn(@Param("unitIds") List<UUID> unitIds);
}
