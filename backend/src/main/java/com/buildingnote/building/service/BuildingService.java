package com.buildingnote.building.service;

import com.buildingnote.building.dto.BuildingRequest;
import com.buildingnote.building.dto.BuildingResponse;
import com.buildingnote.building.entity.Building;
import com.buildingnote.building.repository.BuildingRepository;
import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.user.entity.User;
import com.buildingnote.zone.entity.Zone;
import com.buildingnote.zone.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 건물 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final ZoneRepository zoneRepository;

    /**
     * 건물 목록 조회 (zoneId 필터 선택)
     */
    public List<BuildingResponse> getBuildings(UUID zoneId) {
        List<Building> buildings;
        if (zoneId != null) {
            buildings = buildingRepository.findByZoneIdWithZone(zoneId);
        } else {
            buildings = buildingRepository.findAllWithZone();
        }
        return buildings.stream().map(BuildingResponse::from).toList();
    }

    /**
     * 건물 상세 조회
     */
    public BuildingResponse getBuilding(UUID buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));
        return BuildingResponse.from(building);
    }

    /**
     * 건물 생성 (ADMIN 전용)
     */
    @Transactional
    public BuildingResponse createBuilding(BuildingRequest request, User currentUser) {
        Zone zone = resolveZone(request.zoneId());

        Building building = Building.builder()
                .name(request.name())
                .address(request.address())
                .lat(request.lat())
                .lng(request.lng())
                .zone(zone)
                .createdBy(currentUser)
                .build();

        return BuildingResponse.from(buildingRepository.save(building));
    }

    /**
     * 건물 수정 (ADMIN 전용)
     */
    @Transactional
    public BuildingResponse updateBuilding(UUID buildingId, BuildingRequest request) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));

        Zone zone = resolveZone(request.zoneId());
        building.update(request.name(), request.address(), request.lat(), request.lng(), zone);

        return BuildingResponse.from(building);
    }

    /**
     * 건물 삭제 (ADMIN 전용)
     */
    @Transactional
    public void deleteBuilding(UUID buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));
        buildingRepository.delete(building);
    }

    /**
     * zoneId가 있으면 Zone 엔티티 조회, 없으면 null 반환
     */
    private Zone resolveZone(UUID zoneId) {
        if (zoneId == null) return null;
        return zoneRepository.findById(zoneId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ZONE_NOT_FOUND));
    }
}
