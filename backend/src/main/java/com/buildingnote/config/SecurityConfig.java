package com.buildingnote.config;

import com.buildingnote.auth.jwt.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Map;

/**
 * Spring Security 설정
 * - JWT 기반 Stateless 인증
 * - CORS는 CorsConfig에서 분리 처리
 * - 엔드포인트별 접근 권한 설정
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // @PreAuthorize 어노테이션 활성화
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화 (JWT 사용으로 불필요)
                .csrf(AbstractHttpConfigurer::disable)

                // 세션 사용 안 함 (Stateless)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 요청별 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // Swagger UI 허용
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                        // 인증 API 허용
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // GET 요청 공개 (건물, 구역, 호실, 폼 스키마 조회)
                        .requestMatchers(HttpMethod.GET, "/api/v1/zones/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/buildings/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/units/**").permitAll()
                        // 기록 조회는 공개, 저장은 인증 필요
                        .requestMatchers(HttpMethod.GET, "/api/v1/units/*/record").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/units/*/record").authenticated()
                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )

                // 인증/인가 실패 처리 (JSON 형식 반환)
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8");
                            ObjectMapper mapper = new ObjectMapper();
                            response.getWriter().write(mapper.writeValueAsString(
                                    Map.of("success", false, "message", "로그인이 필요합니다.", "code", "UNAUTHORIZED")
                            ));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8");
                            ObjectMapper mapper = new ObjectMapper();
                            response.getWriter().write(mapper.writeValueAsString(
                                    Map.of("success", false, "message", "접근 권한이 없습니다.", "code", "ACCESS_DENIED")
                            ));
                        })
                )

                // JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
