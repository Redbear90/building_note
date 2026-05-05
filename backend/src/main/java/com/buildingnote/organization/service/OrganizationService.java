package com.buildingnote.organization.service;

import com.buildingnote.common.exception.BusinessException;
import com.buildingnote.common.exception.ErrorCode;
import com.buildingnote.common.security.SecurityUtils;
import com.buildingnote.organization.dto.MemberResponse;
import com.buildingnote.organization.dto.OrganizationResponse;
import com.buildingnote.organization.entity.Organization;
import com.buildingnote.organization.repository.OrganizationRepository;
import com.buildingnote.user.entity.Role;
import com.buildingnote.user.entity.User;
import com.buildingnote.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 워크스페이스 + 멤버 관리. BUILDING_OWNER만 사용.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final InviteCodeGenerator inviteCodeGenerator;

    public OrganizationResponse getMyOrganization() {
        User me = SecurityUtils.currentUser();
        if (me.isAdmin() || me.getOrganization() == null) {
            throw new BusinessException(ErrorCode.ORGANIZATION_NOT_FOUND);
        }
        return OrganizationResponse.from(me.getOrganization());
    }

    public List<MemberResponse> listMembers() {
        UUID orgId = requireOwnerOrgId();
        return userRepository.findByOrganizationId(orgId).stream()
                .map(MemberResponse::from)
                .toList();
    }

    @Transactional
    public OrganizationResponse rotateInviteCode() {
        Organization org = requireOwnerOrg();
        org.rotateInviteCode(inviteCodeGenerator.generateUnique());
        return OrganizationResponse.from(org);
    }

    @Transactional
    public void removeMember(UUID memberId) {
        Organization org = requireOwnerOrg();
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (member.getOrganization() == null
                || !member.getOrganization().getId().equals(org.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        if (member.getRole() != Role.MEMBER) {
            // OWNER 자기 자신/다른 OWNER 삭제 금지
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        userRepository.delete(member);
    }

    private Organization requireOwnerOrg() {
        User me = SecurityUtils.currentUser();
        if (!me.isBuildingOwner() || me.getOrganization() == null) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        return me.getOrganization();
    }

    private UUID requireOwnerOrgId() {
        return requireOwnerOrg().getId();
    }
}
