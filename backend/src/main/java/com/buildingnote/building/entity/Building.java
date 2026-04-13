package com.buildingnote.building.entity;

import com.buildingnote.common.auditing.BaseEntity;
import com.buildingnote.user.entity.User;
import com.buildingnote.zone.entity.Zone;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * 건물 엔티티
 * 지도에 마커로 표시되는 건물 정보
 */
@Entity
@Table(name = "buildings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Building extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String address;

    /** 위도 (latitude) */
    @Column(nullable = false)
    private Double lat;

    /** 경도 (longitude) */
    @Column(nullable = false)
    private Double lng;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id")
    private Zone zone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    /**
     * 건물 정보 수정
     */
    public void update(String name, String address, Double lat, Double lng, Zone zone) {
        this.name = name;
        this.address = address;
        this.lat = lat;
        this.lng = lng;
        this.zone = zone;
    }
}
