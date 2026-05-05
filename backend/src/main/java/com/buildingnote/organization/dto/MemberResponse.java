package com.buildingnote.organization.dto;

import com.buildingnote.user.entity.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record MemberResponse(
        UUID id,
        String email,
        String name,
        String role,
        LocalDateTime createdAt
) {
    public static MemberResponse from(User user) {
        return new MemberResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}
