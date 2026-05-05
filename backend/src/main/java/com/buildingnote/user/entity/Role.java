package com.buildingnote.user.entity;

/**
 * 사용자 역할.
 * <ul>
 *   <li>{@link #ADMIN} — 사이트 운영자. 어떤 organization에도 속하지 않으며 전체 데이터에 접근.</li>
 *   <li>{@link #BUILDING_OWNER} — 워크스페이스 소유자. 자기 organization의 빌딩/구역/호실/폼/멤버 CRUD.</li>
 *   <li>{@link #MEMBER} — 일반 회원. 슬라이드 토글, 본인 노트/댓글 작성·관리.</li>
 * </ul>
 */
public enum Role {
    ADMIN,
    BUILDING_OWNER,
    MEMBER
}
