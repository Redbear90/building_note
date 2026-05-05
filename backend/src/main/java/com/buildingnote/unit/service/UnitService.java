package com.buildingnote.unit.service;

import com.buildingnote.building.entity.Building;
import com.buildingnote.building.repository.BuildingRepository;
import com.buildingnote.comment.repository.UnitCommentRepository;
import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.common.security.SecurityUtils;
import com.buildingnote.unit.dto.UnitReorderRequest;
import com.buildingnote.unit.dto.UnitRequest;
import com.buildingnote.unit.dto.UnitResponse;
import com.buildingnote.unit.entity.Unit;
import com.buildingnote.unit.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnitService {

    private final UnitRepository unitRepository;
    private final BuildingRepository buildingRepository;
    private final UnitCommentRepository commentRepository;

    public long getTotalCount() {
        UUID orgId = requireOrgId();
        return unitRepository.countByOrganizationId(orgId);
    }

    public UnitStats getStats() {
        UUID orgId = requireOrgId();
        long total = unitRepository.countByOrganizationId(orgId);
        long active = unitRepository.countActiveByOrganizationId(orgId);
        long inactive = total - active;
        return new UnitStats(total, active, inactive);
    }

    public record UnitStats(long total, long active, long inactive) {}

    public List<UnitResponse> getUnits(UUID buildingId) {
        Building building = loadOwnedBuilding(buildingId);
        List<Unit> units = unitRepository.findByBuildingIdOrderBySortOrderAsc(building.getId());
        if (units.isEmpty()) return List.of();

        List<UUID> unitIds = units.stream().map(Unit::getId).toList();
        Map<UUID, LocalDateTime> lastCommentMap = commentRepository
                .findLatestActiveCommentTimesByUnitIds(unitIds)
                .stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> (LocalDateTime) row[1]));

        return units.stream()
                .map(u -> UnitResponse.from(u, lastCommentMap.get(u.getId())))
                .toList();
    }

    @Transactional
    public UnitResponse createUnit(UUID buildingId, UnitRequest request) {
        Building building = loadOwnedBuilding(buildingId);

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

    @Transactional
    public UnitResponse updateUnit(UUID unitId, UnitRequest request) {
        Unit unit = loadOwnedUnit(unitId);
        unit.update(request.name(), request.floor(), request.sortOrder());
        return UnitResponse.from(unit);
    }

    @Transactional
    public void deleteUnit(UUID unitId) {
        Unit unit = loadOwnedUnit(unitId);
        unitRepository.delete(unit);
    }

    @Transactional
    public List<UnitResponse> reorderUnits(UUID buildingId, UnitReorderRequest request) {
        Building building = loadOwnedBuilding(buildingId);

        Map<UUID, Integer> sortOrderMap = request.items().stream()
                .collect(Collectors.toMap(
                        UnitReorderRequest.UnitSortItem::id,
                        UnitReorderRequest.UnitSortItem::sortOrder));

        List<Unit> units = unitRepository.findByBuildingIdOrderBySortOrderAsc(building.getId());
        for (Unit unit : units) {
            if (sortOrderMap.containsKey(unit.getId())) {
                unit.updateSortOrder(sortOrderMap.get(unit.getId()));
            }
        }
        return units.stream().map(UnitResponse::from).toList();
    }

    /** 슬라이드 버튼 토글 — 동일 org의 사용자라면 누구나 가능 (MEMBER 포함) */
    @Transactional
    public UnitResponse setActive(UUID unitId, boolean active) {
        Unit unit = loadOwnedUnit(unitId);
        unit.setActive(active);
        return UnitResponse.from(unit);
    }

    private Unit loadOwnedUnit(UUID unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNIT_NOT_FOUND));
        SecurityUtils.assertOrgAccess(unit.getOrganizationId());
        return unit;
    }

    private Building loadOwnedBuilding(UUID buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));
        SecurityUtils.assertOrgAccess(building.getOrganizationId());
        return building;
    }

    private UUID requireOrgId() {
        UUID orgId = SecurityUtils.currentOrgId();
        if (orgId == null) throw new BusinessException(ErrorCode.ACCESS_DENIED);
        return orgId;
    }
}
