package com.buildingnote.config;

import com.buildingnote.auth.jwt.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
 * Spring Security: JWT 기반 stateless 인증.
 * <ul>
 *   <li>공개: 회원가입, 로그인, 토큰 갱신, Swagger</li>
 *   <li>그 외 모든 API는 인증 필요. 역할 권한은 컨트롤러에서 @PreAuthorize로 검사.</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 공개 — 인증/문서/헬스체크
                        .requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/auth/refresh",
                                "/api/v1/auth/logout",
                                "/api/v1/auth/signup/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api-docs/**",
                                "/actuator/health"
                        ).permitAll()
                        // 그 외 모두 인증 필요. 세부 권한은 @PreAuthorize.
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> writeJson(
                                res, HttpServletResponse.SC_UNAUTHORIZED,
                                "로그인이 필요합니다.", "UNAUTHORIZED"))
                        .accessDeniedHandler((req, res, e) -> writeJson(
                                res, HttpServletResponse.SC_FORBIDDEN,
                                "접근 권한이 없습니다.", "ACCESS_DENIED"))
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private static void writeJson(HttpServletResponse response, int status, String message, String code)
            throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8");
        new ObjectMapper().writeValue(response.getWriter(),
                Map.of("success", false, "message", message, "code", code));
    }
}
