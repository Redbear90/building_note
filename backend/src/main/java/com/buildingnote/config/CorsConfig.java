package com.buildingnote.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * CORS 설정
 * 프론트엔드(Vite 개발 서버 + 배포 도메인)의 요청을 허용
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // 자격증명(쿠키, Authorization 헤더) 허용
        config.setAllowCredentials(true);

        // 허용 오리진 (개발 + 배포 도메인)
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",      // Vite 개발 서버
                "http://localhost:5173",      // Vite 기본 포트
                "http://localhost:4173",      // Vite preview 포트
                "http://192.168.*.*:5173",    // 로컬 네트워크 (모바일 테스트)
                "http://10.*.*.*:5173",       // 로컬 네트워크 (모바일 테스트)
                "https://*.buildingnote.com", // 배포 도메인
                "https://*.vercel.app",       // Vercel 배포 도메인
                "https://*.onrender.com"      // Render 도메인
        ));

        // 허용 HTTP 메서드
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 허용 헤더
        config.setAllowedHeaders(List.of("*"));

        // 클라이언트에서 읽을 수 있는 응답 헤더
        config.setExposedHeaders(List.of("Authorization", "Set-Cookie"));

        // Preflight 캐시 시간 (초)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
