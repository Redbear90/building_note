package com.buildingnote.record.repository;

import com.buildingnote.record.entity.UnitRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * 호실 기록 JPA 리포지터리
 */
public interface UnitRecordRepository extends JpaRepository<UnitRecord, UUID> {

    Optional<UnitRecord> findByUnitId(UUID unitId);
}
