package com.buildingnote.record.service;

import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.common.security.SecurityUtils;
import com.buildingnote.record.dto.UnitRecordRequest;
import com.buildingnote.record.dto.UnitRecordResponse;
import com.buildingnote.record.entity.UnitRecord;
import com.buildingnote.record.repository.UnitRecordRepository;
import com.buildingnote.unit.entity.Unit;
import com.buildingnote.unit.repository.UnitRepository;
import com.buildingnote.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecordService {

    private final UnitRecordRepository unitRecordRepository;
    private final UnitRepository unitRepository;

    /**
     * 본인이 작성한 활성 기록 1건. 없으면 빈 응답.
     * 호실은 같은 org이면 누구나 접근 가능.
     */
    public UnitRecordResponse getMyRecord(UUID unitId) {
        Unit unit = loadOwnedUnit(unitId);
        UUID me = SecurityUtils.currentUserId();
        return unitRecordRepository.findActiveByUnitAndAuthor(unit.getId(), me)
                .map(UnitRecordResponse::from)
                .orElse(new UnitRecordResponse(null, unit.getId(), me, null, java.util.Map.of(), null, null));
    }

    /**
     * 호실 내 모든 멤버의 활성 기록. BUILDING_OWNER가 전체 현황을 볼 때 사용.
     */
    public List<UnitRecordResponse> getAllRecords(UUID unitId) {
        Unit unit = loadOwnedUnit(unitId);
        return unitRecordRepository.findActiveByUnitId(unit.getId()).stream()
                .map(UnitRecordResponse::from)
                .toList();
    }

    /** Upsert by (unit, currentUser) */
    @Transactional
    public UnitRecordResponse saveMyRecord(UUID unitId, UnitRecordRequest request) {
        Unit unit = loadOwnedUnit(unitId);
        User me = SecurityUtils.currentUser();

        UnitRecord record = unitRecordRepository
                .findActiveByUnitAndAuthor(unit.getId(), me.getId())
                .orElse(UnitRecord.builder().unit(unit).author(me).build());

        record.updateData(request.data());
        return UnitRecordResponse.from(unitRecordRepository.save(record));
    }

    /**
     * Soft delete. 본인 글이면 누구나, BUILDING_OWNER는 자기 org 멤버 글 삭제 가능.
     * 수정은 본인만 — BUILDING_OWNER도 수정 불가 (요구사항).
     */
    @Transactional
    public void softDeleteRecord(UUID recordId) {
        UnitRecord record = unitRecordRepository.findById(recordId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RECORD_NOT_FOUND));

        if (record.isDeleted()) return;

        User me = SecurityUtils.currentUser();
        Unit unit = record.getUnit();
        SecurityUtils.assertOrgAccess(unit.getOrganizationId());

        boolean isAuthor = record.getAuthor().getId().equals(me.getId());
        boolean isOwnerOfOrg = me.isBuildingOwner()
                && me.getOrganizationId() != null
                && me.getOrganizationId().equals(unit.getOrganizationId());

        if (!isAuthor && !isOwnerOfOrg && !me.isAdmin()) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        record.softDelete(me);
    }

    private Unit loadOwnedUnit(UUID unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNIT_NOT_FOUND));
        SecurityUtils.assertOrgAccess(unit.getOrganizationId());
        return unit;
    }
}
