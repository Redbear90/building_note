package com.buildingnote.comment.controller;

import com.buildingnote.comment.dto.UnitCommentRequest;
import com.buildingnote.comment.dto.UnitCommentResponse;
import com.buildingnote.comment.service.UnitCommentService;
import com.buildingnote.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "호실 댓글", description = "호실 댓글 (soft delete)")
@RestController
@RequestMapping("/api/v1/units/{unitId}/comments")
@RequiredArgsConstructor
public class UnitCommentController {

    private final UnitCommentService commentService;

    @Operation(summary = "댓글 목록")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UnitCommentResponse>>> getComments(
            @PathVariable UUID unitId) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getComments(unitId)));
    }

    @Operation(summary = "댓글 작성")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UnitCommentResponse>> addComment(
            @PathVariable UUID unitId,
            @Valid @RequestBody UnitCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        commentService.addComment(unitId, request), "댓글이 작성되었습니다."));
    }

    @Operation(summary = "댓글 삭제 (Soft) — 본인/소유자/사이트관리자")
    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable UUID unitId,
            @PathVariable UUID commentId) {
        commentService.softDeleteComment(commentId);
        return ResponseEntity.ok(ApiResponse.success(null, "댓글이 삭제되었습니다."));
    }
}
