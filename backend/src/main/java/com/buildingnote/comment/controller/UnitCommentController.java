package com.buildingnote.comment.controller;

import com.buildingnote.comment.dto.UnitCommentRequest;
import com.buildingnote.comment.dto.UnitCommentResponse;
import com.buildingnote.comment.service.UnitCommentService;
import com.buildingnote.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "호실 댓글", description = "호실 메모/댓글 API")
@RestController
@RequestMapping("/api/v1/units/{unitId}/comments")
@RequiredArgsConstructor
public class UnitCommentController {

    private final UnitCommentService commentService;

    @Operation(summary = "댓글 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UnitCommentResponse>>> getComments(
            @PathVariable UUID unitId) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getComments(unitId)));
    }

    @Operation(summary = "댓글 작성", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping
    // @PreAuthorize("isAuthenticated()") // [임시 공개] 복구 시 주석 해제
    public ResponseEntity<ApiResponse<UnitCommentResponse>> addComment(
            @PathVariable UUID unitId,
            @Valid @RequestBody UnitCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(commentService.addComment(unitId, request), "댓글이 작성되었습니다."));
    }

    @Operation(summary = "댓글 삭제 (관리자)", security = @SecurityRequirement(name = "BearerAuth"))
    @DeleteMapping("/{commentId}")
    // @PreAuthorize("hasRole('ADMIN')") // [임시 공개] 복구 시 주석 해제
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable UUID unitId,
            @PathVariable UUID commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok(ApiResponse.success(null, "댓글이 삭제되었습니다."));
    }
}
