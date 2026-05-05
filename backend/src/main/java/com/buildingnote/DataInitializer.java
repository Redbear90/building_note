package com.buildingnote;

import com.buildingnote.building.entity.Building;
import com.buildingnote.building.repository.BuildingRepository;
import com.buildingnote.formschema.entity.FormField;
import com.buildingnote.formschema.entity.FormSchema;
import com.buildingnote.formschema.repository.FormSchemaRepository;
import com.buildingnote.organization.entity.Organization;
import com.buildingnote.organization.repository.OrganizationRepository;
import com.buildingnote.organization.service.InviteCodeGenerator;
import com.buildingnote.unit.entity.Unit;
import com.buildingnote.unit.repository.UnitRepository;
import com.buildingnote.user.entity.Role;
import com.buildingnote.user.entity.User;
import com.buildingnote.user.repository.UserRepository;
import com.buildingnote.zone.entity.Zone;
import com.buildingnote.zone.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 로컬 개발용 부트스트랩.
 * <ul>
 *   <li>{@link #ensureSiteAdmin()} — 사이트 운영자 계정이 항상 1명 존재하도록 보장. 매 시작 시 멱등.</li>
 *   <li>{@link #seedDemoWorkspace()} — DB가 사실상 비어있을 때만 데모 워크스페이스/빌딩/호실 시드.
 *       이미 운영 데이터가 있으면 스킵.</li>
 * </ul>
 */
@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private static final String SITE_ADMIN_EMAIL    = "Admin@buildingnote.com";
    private static final String SITE_ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final ZoneRepository zoneRepository;
    private final BuildingRepository buildingRepository;
    private final UnitRepository unitRepository;
    private final FormSchemaRepository formSchemaRepository;
    private final PasswordEncoder passwordEncoder;
    private final InviteCodeGenerator inviteCodeGenerator;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        ensureSiteAdmin();
        seedDemoWorkspaceIfEmpty();
    }

    /**
     * 사이트 운영자(ROLE=ADMIN, organization_id NULL)가 1명 이상 존재하도록 보장.
     * 동일 이메일이 이미 있으면 아무 것도 하지 않는다.
     */
    private void ensureSiteAdmin() {
        if (userRepository.existsByEmail(SITE_ADMIN_EMAIL)) {
            log.info("사이트 ADMIN 계정 존재 확인: {}", SITE_ADMIN_EMAIL);
            return;
        }
        User admin = User.builder()
                .email(SITE_ADMIN_EMAIL)
                .password(passwordEncoder.encode(SITE_ADMIN_PASSWORD))
                .name("사이트 관리자")
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);
        log.info("사이트 ADMIN 계정 생성: {} (비밀번호는 첫 로그인 후 변경하세요)", SITE_ADMIN_EMAIL);
    }

    /**
     * 빌딩/구역이 하나도 없을 때만 데모 데이터 시드.
     * 운영 DB가 V2 마이그레이션을 거쳐 기존 데이터를 보존한 경우에는 스킵된다.
     */
    private void seedDemoWorkspaceIfEmpty() {
        if (buildingRepository.count() > 0 || organizationRepository.count() > 0) {
            log.info("기존 워크스페이스/건물 데이터 존재 — 데모 시드 스킵");
            return;
        }

        log.info("데모 워크스페이스 시드 시작");

        Organization org = organizationRepository.save(Organization.builder()
                .name("Demo 부동산")
                .inviteCode(inviteCodeGenerator.generateUnique())
                .build());

        User owner = userRepository.save(User.builder()
                .email("owner@buildingnote.com")
                .password(passwordEncoder.encode("owner1234"))
                .name("김소유")
                .role(Role.BUILDING_OWNER)
                .organization(org)
                .build());

        userRepository.save(User.builder()
                .email("member@buildingnote.com")
                .password(passwordEncoder.encode("member1234"))
                .name("이멤버")
                .role(Role.MEMBER)
                .organization(org)
                .build());

        Zone northZone = zoneRepository.save(Zone.builder()
                .name("강북구역").color("#01696f")
                .organization(org).createdBy(owner)
                .polygon(List.of(
                        List.of(37.5800, 126.9600),
                        List.of(37.5800, 126.9900),
                        List.of(37.5650, 126.9900),
                        List.of(37.5650, 126.9600)))
                .build());

        Zone southZone = zoneRepository.save(Zone.builder()
                .name("강남구역").color("#e07b39")
                .organization(org).createdBy(owner)
                .polygon(List.of(
                        List.of(37.5100, 127.0200),
                        List.of(37.5100, 127.0600),
                        List.of(37.4900, 127.0600),
                        List.of(37.4900, 127.0200)))
                .build());

        Building b1 = buildingRepository.save(Building.builder()
                .name("종로타워").address("서울특별시 종로구 종로 33")
                .lat(37.5700).lng(126.9822)
                .zone(northZone).organization(org).createdBy(owner).build());
        Building b2 = buildingRepository.save(Building.builder()
                .name("강남파이낸스센터").address("서울특별시 강남구 테헤란로 152")
                .lat(37.4996).lng(127.0360)
                .zone(southZone).organization(org).createdBy(owner).build());

        List<FormField> commonFields = List.of(
                FormField.builder().id("f1").type("textarea").label("메모").sortOrder(0).build(),
                FormField.builder().id("f2").type("radio").label("입주상태")
                        .options(List.of("입주", "공실", "공사중")).required(true).sortOrder(1).build(),
                FormField.builder().id("f3").type("select").label("용도")
                        .options(List.of("사무실", "상가", "주거", "창고")).sortOrder(2).build()
        );
        formSchemaRepository.save(FormSchema.builder().building(b1).fields(commonFields).build());
        formSchemaRepository.save(FormSchema.builder().building(b2).fields(commonFields).build());

        for (int i = 0; i < 6; i++) {
            int floor = (i / 4) + 1;
            int roomNum = (i % 4) + 1;
            unitRepository.save(Unit.builder()
                    .name(floor + String.format("%02d", roomNum) + "호")
                    .floor(floor).sortOrder(i).building(b1).build());
        }
        for (int i = 0; i < 4; i++) {
            int floor = (i / 4) + 1;
            int roomNum = (i % 4) + 1;
            unitRepository.save(Unit.builder()
                    .name(floor + String.format("%02d", roomNum) + "호")
                    .floor(floor).sortOrder(i).building(b2).build());
        }

        log.info("데모 워크스페이스 시드 완료. invite_code={}", org.getInviteCode());
    }
}
