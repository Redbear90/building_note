package com.buildingnote.comment.service;

import com.buildingnote.comment.dto.UnitCommentRequest;
import com.buildingnote.comment.dto.UnitCommentResponse;
import com.buildingnote.comment.entity.UnitComment;
import com.buildingnote.comment.repository.UnitCommentRepository;
import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.common.security.SecurityUtils;
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
public class UnitCommentService {

    private final UnitCommentRepository commentRepository;
    private final UnitRepository unitRepository;

    public List<UnitCommentResponse> getComments(UUID unitId) {
        Unit unit = loadOwnedUnit(unitId);
        return commentRepository.findActiveByUnitId(unit.getId()).stream()
                .map(UnitCommentResponse::from)
                .toList();
    }

    @Transactional
    public UnitCommentResponse addComment(UUID unitId, UnitCommentRequest request) {
        Unit unit = loadOwnedUnit(unitId);
        User me = SecurityUtils.currentUser();

        UnitComment comment = UnitComment.builder()
                .unit(unit)
                .author(me)
                .content(request.content())
                .build();
        return UnitCommentResponse.from(commentRepository.save(comment));
    }

    /** Soft delete. 본인 또는 같은 org의 BUILDING_OWNER, 또는 ADMIN. */
    @Transactional
    public void softDeleteComment(UUID commentId) {
        UnitComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        if (comment.isDeleted()) return;

        User me = SecurityUtils.currentUser();
        Unit unit = comment.getUnit();
        SecurityUtils.assertOrgAccess(unit.getOrganizationId());

        boolean isAuthor = comment.getAuthor().getId().equals(me.getId());
        boolean isOwnerOfOrg = me.isBuildingOwner()
                && me.getOrganizationId() != null
                && me.getOrganizationId().equals(unit.getOrganizationId());

        if (!isAuthor && !isOwnerOfOrg && !me.isAdmin()) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        comment.softDelete(me);
    }

    private Unit loadOwnedUnit(UUID unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNIT_NOT_FOUND));
        SecurityUtils.assertOrgAccess(unit.getOrganizationId());
        return unit;
    }
}
