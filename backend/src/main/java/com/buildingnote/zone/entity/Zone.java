package com.buildingnote.zone.entity;

import com.buildingnote.common.auditing.BaseEntity;
import com.buildingnote.organization.entity.Organization;
import com.buildingnote.user.entity.User;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

import java.util.List;
import java.util.UUID;

/**
 * 지도 폴리곤 구역. organization 단위로 격리.
 */
@Entity
@Table(name = "zones")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Zone extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<List<Double>> polygon;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String color = "#01696f";

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    public void update(String name, List<List<Double>> polygon, String color) {
        this.name = name;
        this.polygon = polygon;
        this.color = color;
    }

    public UUID getOrganizationId() {
        return organization.getId();
    }
}
