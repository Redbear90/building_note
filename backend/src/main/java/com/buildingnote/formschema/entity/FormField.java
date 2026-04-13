package com.buildingnote.formschema.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 폼 필드 정의 클래스
 * FormSchema의 JSONB 컬럼에 배열로 저장되는 항목
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormField {

    /** 필드 고유 ID (예: f1, f2 ...) */
    private String id;

    /** 필드 타입: text | textarea | checkbox | radio | select | date | number */
    private String type;

    /** 화면에 표시될 레이블 */
    private String label;

    /** checkbox, radio, select 타입에서 사용되는 선택지 */
    private List<String> options;

    /** 필수 여부 */
    @Builder.Default
    private boolean required = false;

    /** 정렬 순서 */
    private int sortOrder;
}
