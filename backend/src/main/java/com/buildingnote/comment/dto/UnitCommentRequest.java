package com.buildingnote.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 댓글 작성 요청. 작성자는 SecurityContext에서 결정된다.
 */
public record UnitCommentRequest(
        @NotBlank(message = "내용을 입력해주세요.")
        @Size(max = 500, message = "댓글은 500자 이내로 입력해주세요.")
        String content
) {}
