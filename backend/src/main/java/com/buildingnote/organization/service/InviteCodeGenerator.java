package com.buildingnote.organization.service;

import com.buildingnote.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * 충돌 없는 8자리 영숫자 초대 코드 생성기.
 * 혼동되기 쉬운 0/O/1/I/l 등은 제외.
 */
@Component
@RequiredArgsConstructor
public class InviteCodeGenerator {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int LENGTH = 8;
    private static final int MAX_ATTEMPTS = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrganizationRepository organizationRepository;

    public String generateUnique() {
        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            String code = randomCode();
            if (!organizationRepository.existsByInviteCode(code)) {
                return code;
            }
        }
        // 거의 발생하지 않음. 중복은 통계적으로 1/32^8 수준.
        throw new IllegalStateException("초대 코드 생성 실패: 재시도 한도 초과");
    }

    private String randomCode() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
