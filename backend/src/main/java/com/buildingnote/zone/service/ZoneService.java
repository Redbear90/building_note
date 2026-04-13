package com.buildingnote.zone.service;

import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.user.entity.User;
import com.buildingnote.zone.dto.ZoneRequest;
import com.buildingnote.zone.dto.ZoneResponse;
import com.buildingnote.zone.entity.Zone;
import com.buildingnote.zone.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 구역 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ZoneService {

    private final ZoneRepository zoneRepository;

    /**
     * 전체 구역 목록 조회
     */
    public List<ZoneResponse> getAllZones() {
        return zoneRepository.findAll().stream()
                .map(ZoneResponse::from)
                .toList();
    }

    /**
     * 구역 생성 (ADMIN 전용)
     */
    @Transactional
    public ZoneResponse createZone(ZoneRequest request, User currentUser) {
        Zone zone = Zone.builder()
                .name(request.name())
                .polygon(request.polygon())
                .color(request.color() != null ? request.color() : "#01696f")
                .createdBy(currentUser)
                .build();

        return ZoneResponse.from(zoneRepository.save(zone));
    }

    /**
     * 구역 수정 (ADMIN 전용)
     */
    @Transactional
    public ZoneResponse updateZone(UUID zoneId, ZoneRequest request) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ZONE_NOT_FOUND));

        zone.update(request.name(), request.polygon(),
                request.color() != null ? request.color() : zone.getColor());

        return ZoneResponse.from(zone);
    }

    /**
     * 구역 삭제 (ADMIN 전용)
     */
    @Transactional
    public void deleteZone(UUID zoneId) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ZONE_NOT_FOUND));
        zoneRepository.delete(zone);
    }
}
