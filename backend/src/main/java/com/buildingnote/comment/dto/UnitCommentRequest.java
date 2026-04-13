package com.buildingnote.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UnitCommentRequest(
        @NotBlank(message = "작성자를 입력해주세요.")
        @Size(max = 50)
        String author,

        @NotBlank(message = "내용을 입력해주세요.")
        @Size(max = 500, message = "댓글은 500자 이내로 입력해주세요.")
        String content
) {}
