package com.buildingnote.unit.entity;

import com.buildingnote.building.entity.Building;
import com.buildingnote.common.auditing.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * 호실 엔티티
 * 건물 내 개별 호실/공간
 */
@Entity
@Table(name = "units")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Unit extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 호실 명칭 (예: 101호, B-201, 지하1층) */
    @Column(nullable = false, length = 100)
    private String name;

    /** 층 정보 (선택) */
    @Column
    private Integer floor;

    /** 정렬 순서 (낮을수록 앞에 표시) */
    @Column(nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    /**
     * 호실 정보 수정
     */
    public void update(String name, Integer floor, Integer sortOrder) {
        this.name = name;
        this.floor = floor;
        if (sortOrder != null) {
            this.sortOrder = sortOrder;
        }
    }

    /**
     * 정렬 순서만 변경
     */
    public void updateSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
