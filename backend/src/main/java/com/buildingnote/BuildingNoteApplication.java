package com.buildingnote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * BuildingNote 애플리케이션 진입점
 * 지도 기반 건물/호실 관리 서비스
 */
@SpringBootApplication
@EnableJpaAuditing  // BaseEntity의 @CreatedDate, @LastModifiedDate 활성화
public class BuildingNoteApplication {

    public static void main(String[] args) {
        SpringApplication.run(BuildingNoteApplication.class, args);
    }
}
