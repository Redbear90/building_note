package com.buildingnote.zone.entity;

import com.buildingnote.common.auditing.BaseEntity;
import com.buildingnote.user.entity.User;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

import java.util.List;
import java.util.UUID;

/**
 * 구역 엔티티
 * 지도 위에 표시되는 폴리곤 영역
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

    /**
     * 폴리곤 좌표 배열 - [[위도, 경도], ...] 형태의 JSON 배열
     * JSONB 타입으로 PostgreSQL에 저장
     */
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<List<Double>> polygon;

    @Column(length = 20)
    @Builder.Default
    private String color = "#01696f";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    /**
     * 구역 정보 수정
     */
    public void update(String name, List<List<Double>> polygon, String color) {
        this.name = name;
        this.polygon = polygon;
        this.color = color;
    }
}
