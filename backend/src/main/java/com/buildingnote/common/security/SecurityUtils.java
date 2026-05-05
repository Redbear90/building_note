package com.buildingnote.common.security;

import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.user.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * SecurityContext에서 현재 인증된 {@link User} 엔티티를 꺼내는 헬퍼.
 * JwtAuthenticationFilter가 principal에 User를 담아두므로 안전하게 캐스팅한다.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof User user)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return user;
    }

    public static UUID currentUserId() {
        return currentUser().getId();
    }

    /**
     * 현재 사용자의 organization_id. ADMIN은 organization이 없으므로 null이 반환되고,
     * 호출 측에서 ADMIN 처리 분기를 명시적으로 해야 한다.
     */
    public static UUID currentOrgId() {
        return currentUser().getOrganizationId();
    }

    /**
     * organization 단위 데이터에 접근할 때 사용. ADMIN이면 어느 org든 통과.
     * 그 외 사용자는 자기 org가 아니면 ACCESS_DENIED.
     */
    public static void assertOrgAccess(UUID resourceOrgId) {
        User user = currentUser();
        if (user.isAdmin()) return;
        if (resourceOrgId == null || !resourceOrgId.equals(user.getOrganizationId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }
}
