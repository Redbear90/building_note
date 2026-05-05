package com.buildingnote.building.entity;

import com.buildingnote.common.auditing.BaseEntity;
import com.buildingnote.organization.entity.Organization;
import com.buildingnote.user.entity.User;
import com.buildingnote.zone.entity.Zone;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * 건물.
 * organization 단위로 격리되며 (organization_id NOT NULL),
 * 작성자는 BUILDING_OWNER 본인.
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

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lng;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id")
    private Zone zone;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    public void update(String name, String address, Double lat, Double lng, Zone zone) {
        this.name = name;
        this.address = address;
        this.lat = lat;
        this.lng = lng;
        this.zone = zone;
    }

    public UUID getOrganizationId() {
        return organization.getId();
    }
}
