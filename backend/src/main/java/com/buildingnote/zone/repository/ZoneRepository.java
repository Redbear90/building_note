package com.buildingnote.zone.repository;

import com.buildingnote.zone.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * 구역 JPA 리포지터리
 */
public interface ZoneRepository extends JpaRepository<Zone, UUID> {
}
