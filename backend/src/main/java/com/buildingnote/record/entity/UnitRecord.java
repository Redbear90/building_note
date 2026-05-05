package com.buildingnote.record.entity;

import com.buildingnote.common.auditing.BaseEntity;
import com.buildingnote.unit.entity.Unit;
import com.buildingnote.user.entity.User;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 호실 기록. (unit, author)당 활성 1건.
 * 삭제는 soft — deleted_at/deleted_by 만 설정하고 행은 유지.
 * 활성 1건 제약은 schema.sql의 partial unique index가 보장.
 */
@Entity
@Table(name = "unit_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class UnitRecord extends BaseEntity {

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

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private Map<String, Object> data = new HashMap<>();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;

    public void updateData(Map<String, Object> data) {
        this.data = data;
    }

    public void softDelete(User by) {
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = by;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
