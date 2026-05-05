package com.buildingnote.organization.repository;

import com.buildingnote.organization.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    Optional<Organization> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);
}
