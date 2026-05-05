package com.buildingnote.zone.service;

import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.common.security.SecurityUtils;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ZoneService {

    private final ZoneRepository zoneRepository;

    public List<ZoneResponse> getAllZones() {
        UUID orgId = requireOrgId();
        return zoneRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId).stream()
                .map(ZoneResponse::from)
                .toList();
    }

    @Transactional
    public ZoneResponse createZone(ZoneRequest request) {
        User me = SecurityUtils.currentUser();
        if (me.getOrganization() == null) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        Zone zone = Zone.builder()
                .name(request.name())
                .polygon(request.polygon())
                .color(request.color() != null ? request.color() : "#01696f")
                .organization(me.getOrganization())
                .createdBy(me)
                .build();
        return ZoneResponse.from(zoneRepository.save(zone));
    }

    @Transactional
    public ZoneResponse updateZone(UUID zoneId, ZoneRequest request) {
        Zone zone = loadOwnedZone(zoneId);
        zone.update(request.name(), request.polygon(),
                request.color() != null ? request.color() : zone.getColor());
        return ZoneResponse.from(zone);
    }

    @Transactional
    public void deleteZone(UUID zoneId) {
        Zone zone = loadOwnedZone(zoneId);
        zoneRepository.delete(zone);
    }

    private Zone loadOwnedZone(UUID zoneId) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ZONE_NOT_FOUND));
        SecurityUtils.assertOrgAccess(zone.getOrganizationId());
        return zone;
    }

    private UUID requireOrgId() {
        UUID orgId = SecurityUtils.currentOrgId();
        if (orgId == null) throw new BusinessException(ErrorCode.ACCESS_DENIED);
        return orgId;
    }
}
