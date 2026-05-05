package com.buildingnote.building.service;

import com.buildingnote.building.dto.BuildingRequest;
import com.buildingnote.building.dto.BuildingResponse;
import com.buildingnote.building.entity.Building;
import com.buildingnote.building.repository.BuildingRepository;
import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.common.security.SecurityUtils;
import com.buildingnote.user.entity.User;
import com.buildingnote.zone.entity.Zone;
import com.buildingnote.zone.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final ZoneRepository zoneRepository;

    /**
     * 현재 사용자 organization의 건물만 조회.
     * (ADMIN은 organization이 없으므로 별도 엔드포인트로 처리하거나 추후 확장.)
     */
    public List<BuildingResponse> getBuildings(UUID zoneId, String search) {
        UUID orgId = requireOrgId();
        String keyword = (search != null && !search.isBlank()) ? search.trim() : null;

        List<Building> buildings;
        if (keyword != null && zoneId != null) {
            buildings = buildingRepository.findByZoneIdAndKeywordInOrg(orgId, zoneId, keyword);
        } else if (keyword != null) {
            buildings = buildingRepository.findByKeywordInOrg(orgId, keyword);
        } else if (zoneId != null) {
            buildings = buildingRepository.findByZoneIdInOrg(orgId, zoneId);
        } else {
            buildings = buildingRepository.findAllInOrg(orgId);
        }
        return buildings.stream().map(BuildingResponse::from).toList();
    }

    public BuildingResponse getBuilding(UUID buildingId) {
        Building building = loadOwnedBuilding(buildingId);
        return BuildingResponse.from(building);
    }

    @Transactional
    public BuildingResponse createBuilding(BuildingRequest request) {
        User me = SecurityUtils.currentUser();
        if (me.getOrganization() == null) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        Zone zone = resolveZone(request.zoneId(), me.getOrganization().getId());

        Building building = Building.builder()
                .name(request.name())
                .address(request.address())
                .lat(request.lat())
                .lng(request.lng())
                .zone(zone)
                .organization(me.getOrganization())
                .createdBy(me)
                .build();

        return BuildingResponse.from(buildingRepository.save(building));
    }

    @Transactional
    public BuildingResponse updateBuilding(UUID buildingId, BuildingRequest request) {
        Building building = loadOwnedBuilding(buildingId);
        Zone zone = resolveZone(request.zoneId(), building.getOrganizationId());
        building.update(request.name(), request.address(), request.lat(), request.lng(), zone);
        return BuildingResponse.from(building);
    }

    @Transactional
    public void deleteBuilding(UUID buildingId) {
        Building building = loadOwnedBuilding(buildingId);
        buildingRepository.delete(building);
    }

    private Building loadOwnedBuilding(UUID buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));
        SecurityUtils.assertOrgAccess(building.getOrganizationId());
        return building;
    }

    private Zone resolveZone(UUID zoneId, UUID expectedOrgId) {
        if (zoneId == null) return null;
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ZONE_NOT_FOUND));
        if (!zone.getOrganization().getId().equals(expectedOrgId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        return zone;
    }

    private UUID requireOrgId() {
        UUID orgId = SecurityUtils.currentOrgId();
        if (orgId == null) throw new BusinessException(ErrorCode.ACCESS_DENIED);
        return orgId;
    }
}
