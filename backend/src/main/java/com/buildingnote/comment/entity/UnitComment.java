package com.buildingnote.comment.entity;

import com.buildingnote.unit.entity.Unit;
import com.buildingnote.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 호실 댓글. 작성자 FK, soft delete.
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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    public void softDelete(User by) {
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = by;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
