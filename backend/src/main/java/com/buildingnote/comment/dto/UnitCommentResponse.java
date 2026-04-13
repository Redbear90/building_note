package com.buildingnote.comment.dto;

import com.buildingnote.comment.entity.UnitComment;

import java.time.LocalDateTime;
import java.util.UUID;

public record UnitCommentResponse(
        UUID id,
        UUID unitId,
        String author,
        String content,
        LocalDateTime createdAt
) {
    public static UnitCommentResponse from(UnitComment comment) {
        return new UnitCommentResponse(
                comment.getId(),
                comment.getUnit().getId(),
                comment.getAuthor(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
