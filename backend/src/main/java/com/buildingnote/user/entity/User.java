package com.buildingnote.user.entity;

import com.buildingnote.common.auditing.BaseEntity;
import com.buildingnote.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * 사용자.
 * ADMIN은 organization 소속이 없고(전역), BUILDING_OWNER/MEMBER는 반드시 organization에 속한다.
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class User extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /** ADMIN은 null. BUILDING_OWNER/MEMBER는 반드시 NOT NULL. DB CHECK 제약과 일치. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    public String getRoleAuthority() {
        return "ROLE_" + this.role.name();
    }

    public boolean isAdmin() {
        return this.role == Role.ADMIN;
    }

    public boolean isBuildingOwner() {
        return this.role == Role.BUILDING_OWNER;
    }

    public boolean isMember() {
        return this.role == Role.MEMBER;
    }

    public UUID getOrganizationId() {
        return organization != null ? organization.getId() : null;
    }

    public void changeName(String name) {
        this.name = name;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
