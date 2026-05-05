package com.buildingnote.organization.dto;

import com.buildingnote.organization.entity.Organization;

import java.time.LocalDateTime;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String name,
        String inviteCode,
        LocalDateTime createdAt
) {
    public static OrganizationResponse from(Organization org) {
        return new OrganizationResponse(
                org.getId(),
                org.getName(),
                org.getInviteCode(),
                org.getCreatedAt()
        );
    }
}
