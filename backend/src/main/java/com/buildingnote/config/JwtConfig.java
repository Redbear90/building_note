package com.buildingnote.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT 관련 설정값을 application.yml에서 바인딩
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {

    /** JWT 서명 비밀키 (최소 256bit 이상 권장) */
    private String secret;

    /** 액세스 토큰 만료 시간 (밀리초) */
    private long accessTokenExpiration;

    /** 리프레시 토큰 만료 시간 (밀리초) */
    private long refreshTokenExpiration;
}
