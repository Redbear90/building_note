package com.buildingnote.organization.entity;

import com.buildingnote.common.auditing.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * 워크스페이스. BUILDING_OWNER 1명이 회원가입 시 생성하며 MEMBER는 invite_code로 합류.
 */
@Entity
@Table(name = "organizations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Organization extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "invite_code", nullable = false, unique = true, length = 20)
    private String inviteCode;

    public void rename(String name) {
        this.name = name;
    }

    public void rotateInviteCode(String newCode) {
        this.inviteCode = newCode;
    }
}
