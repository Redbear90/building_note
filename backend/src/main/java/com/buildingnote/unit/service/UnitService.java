package com.buildingnote.unit.service;

import com.buildingnote.building.entity.Building;
import com.buildingnote.building.repository.BuildingRepository;
import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.unit.dto.UnitReorderRequest;
import com.buildingnote.unit.dto.UnitRequest;
import com.buildingnote.unit.dto.UnitResponse;
import com.buildingnote.unit.entity.Unit;
import com.buildingnote.unit.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 호실 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnitService {

    private final UnitRepository unitRepository;
    private final BuildingRepository buildingRepository;

    /**
     * 건물의 호실 목록 조회 (정렬 순서 기준)
     */
    public List<UnitResponse> getUnits(UUID buildingId) {
        // 건물 존재 여부 확인
        if (!buildingRepository.existsById(buildingId)) {
            throw new BusinessException(ErrorCode.BUILDING_NOT_FOUND);
        }
        return unitRepository.findByBuildingIdOrderBySortOrderAsc(buildingId)
                .stream().map(UnitResponse::from).toList();
    }

    /**
     * 호실 추가 (ADMIN 전용)
     */
    @Transactional
    public UnitResponse createUnit(UUID buildingId, UnitRequest request) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));

        // 정렬 순서 자동 설정 (마지막 위치)
        int sortOrder = request.sortOrder() != null
                ? request.sortOrder()
                : unitRepository.countByBuildingId(buildingId);

        Unit unit = Unit.builder()
                .name(request.name())
                .floor(request.floor())
                .sortOrder(sortOrder)
                .building(building)
                .build();

        return UnitResponse.from(unitRepository.save(unit));
    }

    /**
     * 호실 수정 (ADMIN 전용)
     */
    @Transactional
    public UnitResponse updateUnit(UUID unitId, UnitRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNIT_NOT_FOUND));

        unit.update(request.name(), request.floor(), request.sortOrder());
        return UnitResponse.from(unit);
    }

    /**
     * 호실 삭제 (ADMIN 전용)
     */
    @Transactional
    public void deleteUnit(UUID unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNIT_NOT_FOUND));
        unitRepository.delete(unit);
    }

    /**
     * 호실 순서 일괄 변경 (ADMIN 전용)
     */
    @Transactional
    public List<UnitResponse> reorderUnits(UUID buildingId, UnitReorderRequest request) {
        // 건물 존재 확인
        if (!buildingRepository.existsById(buildingId)) {
            throw new BusinessException(ErrorCode.BUILDING_NOT_FOUND);
        }

        // id → sortOrder 맵 구성
        Map<UUID, Integer> sortOrderMap = request.items().stream()
                .collect(Collectors.toMap(
                        UnitReorderRequest.UnitSortItem::id,
                        UnitReorderRequest.UnitSortItem::sortOrder
                ));

        // 해당 건물의 호실 일괄 업데이트
        List<Unit> units = unitRepository.findByBuildingIdOrderBySortOrderAsc(buildingId);
        for (Unit unit : units) {
            if (sortOrderMap.containsKey(unit.getId())) {
                unit.updateSortOrder(sortOrderMap.get(unit.getId()));
            }
        }

        return units.stream().map(UnitResponse::from).toList();
    }
}
