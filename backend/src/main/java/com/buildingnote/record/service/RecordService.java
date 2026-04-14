package com.buildingnote.record.service;

import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.record.dto.UnitRecordRequest;
import com.buildingnote.record.dto.UnitRecordResponse;
import com.buildingnote.record.entity.UnitRecord;
import com.buildingnote.record.repository.UnitRecordRepository;
import com.buildingnote.unit.entity.Unit;
import com.buildingnote.unit.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.UUID;

/**
 * 호실 기록 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecordService {

    private final UnitRecordRepository unitRecordRepository;
    private final UnitRepository unitRepository;

    /**
     * 호실 기록 조회
     * 기록이 없으면 빈 데이터로 응답 (Unit 존재 여부는 record join 또는 단일 쿼리로 확인)
     */
    public UnitRecordResponse getRecord(UUID unitId) {
        // Unit 존재 확인과 record 조회를 분리하지 않고,
        // unit 존재 여부는 record upsert 시 검증되므로 여기서는 record 조회만 수행
        // 단, Unit 자체가 없을 때를 위해 Unit 조회로 통합
        return unitRepository.findById(unitId)
                .map(unit -> unitRecordRepository.findByUnitId(unitId)
                        .map(UnitRecordResponse::from)
                        .orElse(new UnitRecordResponse(null, unitId, new HashMap<>(), null, null)))
                .orElseThrow(() -> new BusinessException(ErrorCode.UNIT_NOT_FOUND));
    }

    /**
     * 호실 기록 저장 (upsert)
     * 기존 기록이 있으면 업데이트, 없으면 새로 생성
     */
    @Transactional
    public UnitRecordResponse saveRecord(UUID unitId, UnitRecordRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNIT_NOT_FOUND));

        UnitRecord record = unitRecordRepository.findByUnitId(unitId)
                .orElse(UnitRecord.builder().unit(unit).build());

        record.updateData(request.data());
        return UnitRecordResponse.from(unitRecordRepository.save(record));
    }
}
