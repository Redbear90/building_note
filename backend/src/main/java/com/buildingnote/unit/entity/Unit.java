package com.buildingnote.unit.entity;

import com.buildingnote.building.entity.Building;
import com.buildingnote.common.auditing.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * 호실. is_active는 멤버 누구나 토글하는 슬라이드 버튼 상태.
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

    @Column(nullable = false, length = 100)
    private String name;

    @Column
    private Integer floor;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    public void update(String name, Integer floor, Integer sortOrder) {
        this.name = name;
        this.floor = floor;
        if (sortOrder != null) {
            this.sortOrder = sortOrder;
        }
    }

    public void updateSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public void setActive(boolean active) {
        this.isActive = active;
    }

    public UUID getBuildingId() {
        return building.getId();
    }

    public UUID getOrganizationId() {
        return building.getOrganizationId();
    }
}
