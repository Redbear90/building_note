package com.buildingnote.comment.service;

import com.buildingnote.comment.dto.UnitCommentRequest;
import com.buildingnote.comment.dto.UnitCommentResponse;
import com.buildingnote.comment.entity.UnitComment;
import com.buildingnote.comment.repository.UnitCommentRepository;
import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.unit.entity.Unit;
import com.buildingnote.unit.repository.UnitRepository;
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

    /** 호실 댓글 목록 조회 (최신순) */
    public List<UnitCommentResponse> getComments(UUID unitId) {
        if (!unitRepository.existsById(unitId)) {
            throw new BusinessException(ErrorCode.UNIT_NOT_FOUND);
        }
        return commentRepository.findByUnitIdOrderByCreatedAtDesc(unitId)
                .stream()
                .map(UnitCommentResponse::from)
                .toList();
    }

    /** 댓글 작성 */
    @Transactional
    public UnitCommentResponse addComment(UUID unitId, UnitCommentRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNIT_NOT_FOUND));

        UnitComment comment = UnitComment.builder()
                .unit(unit)
                .author(request.author())
                .content(request.content())
                .build();

        return UnitCommentResponse.from(commentRepository.save(comment));
    }

    /** 댓글 삭제 (관리자만) */
    @Transactional
    public void deleteComment(UUID commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
        }
        commentRepository.deleteById(commentId);
    }
}
