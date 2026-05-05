package com.buildingnote.comment.repository;

import com.buildingnote.comment.entity.UnitComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UnitCommentRepository extends JpaRepository<UnitComment, UUID> {

    @Query("""
        SELECT c FROM UnitComment c
        JOIN FETCH c.author
        WHERE c.unit.id = :unitId AND c.deletedAt IS NULL
        ORDER BY c.createdAt DESC
        """)
    List<UnitComment> findActiveByUnitId(@Param("unitId") UUID unitId);

    /** unitId → 활성 댓글 최신 시각 (NEW 배지용 일괄 조회) */
    @Query("""
        SELECT c.unit.id, MAX(c.createdAt) FROM UnitComment c
        WHERE c.unit.id IN :unitIds AND c.deletedAt IS NULL
        GROUP BY c.unit.id
        """)
    List<Object[]> findLatestActiveCommentTimesByUnitIds(@Param("unitIds") List<UUID> unitIds);
}
