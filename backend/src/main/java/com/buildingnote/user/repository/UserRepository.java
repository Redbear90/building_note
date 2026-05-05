package com.buildingnote.user.repository;

import com.buildingnote.user.entity.Role;
import com.buildingnote.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * organization은 ManyToOne 관계이므로 nested property를 underscore로 명시.
     * Hibernate 6에서는 더 엄격하게 검사하므로 'organizationId' (붙여쓰기)로는 인식되지 않는다.
     */
    @Query("SELECT u FROM User u WHERE u.organization.id = :orgId")
    List<User> findByOrganizationId(@Param("orgId") UUID orgId);

    @Query("SELECT u FROM User u WHERE u.organization.id = :orgId AND u.role = :role")
    List<User> findByOrganizationIdAndRole(@Param("orgId") UUID orgId, @Param("role") Role role);
}
