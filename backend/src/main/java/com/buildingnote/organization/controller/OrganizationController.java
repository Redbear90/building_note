package com.buildingnote.organization.controller;

import com.buildingnote.common.response.ApiResponse;
import com.buildingnote.organization.dto.MemberResponse;
import com.buildingnote.organization.dto.OrganizationResponse;
import com.buildingnote.organization.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "워크스페이스", description = "워크스페이스 / 멤버 / 초대 코드 관리")
@RestController
@RequestMapping("/api/v1/organization")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @Operation(summary = "내 워크스페이스 조회 (BUILDING_OWNER, MEMBER)")
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('BUILDING_OWNER','MEMBER')")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getMine() {
        return ResponseEntity.ok(ApiResponse.success(organizationService.getMyOrganization()));
    }

    @Operation(summary = "멤버 목록 (BUILDING_OWNER)")
    @GetMapping("/members")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> listMembers() {
        return ResponseEntity.ok(ApiResponse.success(organizationService.listMembers()));
    }

    @Operation(summary = "초대 코드 재발급 (BUILDING_OWNER)")
    @PostMapping("/invite-code/rotate")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<OrganizationResponse>> rotate() {
        return ResponseEntity.ok(ApiResponse.success(
                organizationService.rotateInviteCode(), "초대 코드가 재발급되었습니다."));
    }

    @Operation(summary = "멤버 제거 (BUILDING_OWNER)")
    @DeleteMapping("/members/{memberId}")
    @PreAuthorize("hasRole('BUILDING_OWNER')")
    public ResponseEntity<ApiResponse<Void>> removeMember(@PathVariable UUID memberId) {
        organizationService.removeMember(memberId);
        return ResponseEntity.ok(ApiResponse.success(null, "멤버가 제거되었습니다."));
    }
}
