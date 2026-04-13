package com.buildingnote.comment.entity;

import com.buildingnote.unit.entity.Unit;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 호실 댓글 엔티티
 * 누구나 읽기 가능, 로그인 사용자만 작성/삭제
 */
@Entity
@Table(name = "unit_comments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class UnitComment {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    /** 작성자 닉네임 (로그인 사용자 이름 또는 직접 입력) */
    @Column(nullable = false, length = 50)
    private String author;

    /** 댓글 내용 */
    @Column(nullable = false, length = 500)
    private String content;

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
