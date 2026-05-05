package com.buildingnote.record.repository;

import com.buildingnote.record.entity.UnitRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UnitRecordRepository extends JpaRepository<UnitRecord, UUID> {

    /** 활성(미삭제) 기록 — (unit, author) 1건. */
    @Query("""
        SELECT r FROM UnitRecord r
        WHERE r.unit.id = :unitId AND r.author.id = :authorId AND r.deletedAt IS NULL
        """)
    Optional<UnitRecord> findActiveByUnitAndAuthor(
            @Param("unitId") UUID unitId, @Param("authorId") UUID authorId);

    /** 호실 한 칸의 활성 기록 전체 (BUILDING_OWNER가 모든 멤버 기록을 볼 때) */
    @Query("""
        SELECT r FROM UnitRecord r
        JOIN FETCH r.author
        WHERE r.unit.id = :unitId AND r.deletedAt IS NULL
        ORDER BY r.updatedAt DESC
        """)
    List<UnitRecord> findActiveByUnitId(@Param("unitId") UUID unitId);

    /** 엑셀 내보내기 — 활성 기록만 일괄 */
    @Query("""
        SELECT r FROM UnitRecord r
        JOIN FETCH r.author
        WHERE r.unit.id IN :unitIds AND r.deletedAt IS NULL
        """)
    List<UnitRecord> findActiveByUnitIdIn(@Param("unitIds") List<UUID> unitIds);
}
