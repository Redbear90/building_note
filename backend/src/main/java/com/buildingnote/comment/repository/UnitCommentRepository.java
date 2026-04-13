package com.buildingnote.comment.repository;

import com.buildingnote.comment.entity.UnitComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface UnitCommentRepository extends JpaRepository<UnitComment, UUID> {

    List<UnitComment> findByUnitIdOrderByCreatedAtDesc(UUID unitId);

    /**
     * 건물 내 호실들의 최신 댓글 시각을 한 번에 조회
     * unitId → maxCreatedAt 맵 형태로 반환
     */
    @Query("SELECT c.unit.id, MAX(c.createdAt) FROM UnitComment c " +
           "WHERE c.unit.id IN :unitIds GROUP BY c.unit.id")
    List<Object[]> findLatestCommentTimesByUnitIds(@Param("unitIds") List<UUID> unitIds);
}
