package com.buildingnote;

import com.buildingnote.building.entity.Building;
import com.buildingnote.building.repository.BuildingRepository;
import com.buildingnote.formschema.entity.FormField;
import com.buildingnote.formschema.entity.FormSchema;
import com.buildingnote.formschema.repository.FormSchemaRepository;
import com.buildingnote.record.entity.UnitRecord;
import com.buildingnote.record.repository.UnitRecordRepository;
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
import java.util.Map;

/**
 * 로컬 개발 환경 샘플 데이터 자동 삽입
 * @Profile("local")로 운영 환경에서는 실행되지 않음
 */
@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final BuildingRepository buildingRepository;
    private final UnitRepository unitRepository;
    private final FormSchemaRepository formSchemaRepository;
    private final UnitRecordRepository unitRecordRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // 이미 데이터가 있으면 스킵
        if (userRepository.count() > 0) {
            log.info("샘플 데이터 이미 존재 - 초기화 스킵");
            return;
        }

        log.info("===== 샘플 데이터 초기화 시작 =====");

        // 1. 사용자 생성
        User admin = createUser("admin@buildingnote.com", "admin1234", "관리자", Role.ADMIN);
        User user = createUser("user@buildingnote.com", "user1234", "일반사용자", Role.USER);

        // 2. 구역 생성 (서울 중심부 기준)
        Zone northZone = createZone("강북구역", admin, "#01696f", List.of(
                List.of(37.5800, 126.9600),
                List.of(37.5800, 126.9900),
                List.of(37.5650, 126.9900),
                List.of(37.5650, 126.9600)
        ));
        Zone southZone = createZone("강남구역", admin, "#e07b39", List.of(
                List.of(37.5100, 127.0200),
                List.of(37.5100, 127.0600),
                List.of(37.4900, 127.0600),
                List.of(37.4900, 127.0200)
        ));

        // 3. 건물 생성 (강북 2개, 강남 2개)
        Building b1 = createBuilding("종로타워", "서울특별시 종로구 종로 33", 37.5700, 126.9822, northZone, admin);
        Building b2 = createBuilding("광화문빌딩", "서울특별시 종로구 세종대로 209", 37.5759, 126.9768, northZone, admin);
        Building b3 = createBuilding("강남파이낸스센터", "서울특별시 강남구 테헤란로 152", 37.4996, 127.0360, southZone, admin);
        Building b4 = createBuilding("코엑스몰", "서울특별시 강남구 영동대로 513", 37.5115, 127.0590, southZone, admin);

        // 4. 폼 스키마 생성 (모든 건물 공통 스키마)
        List<FormField> commonFields = createCommonFormFields();
        createFormSchema(b1, commonFields);
        createFormSchema(b2, commonFields);
        createFormSchema(b3, commonFields);
        createFormSchema(b4, commonFields);

        // 5. 호실 생성 및 기록 삽입
        createUnitsAndRecords(b1, 6);
        createUnitsAndRecords(b2, 4);
        createUnitsAndRecords(b3, 8);
        createUnitsAndRecords(b4, 5);

        log.info("===== 샘플 데이터 초기화 완료 =====");
        log.info("관리자: admin@buildingnote.com / admin1234");
        log.info("사용자: user@buildingnote.com / user1234");
    }

    private User createUser(String email, String password, String name, Role role) {
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .role(role)
                .build();
        return userRepository.save(user);
    }

    private Zone createZone(String name, User admin, String color, List<List<Double>> polygon) {
        Zone zone = Zone.builder()
                .name(name)
                .polygon(polygon)
                .color(color)
                .createdBy(admin)
                .build();
        return zoneRepository.save(zone);
    }

    private Building createBuilding(String name, String address, double lat, double lng,
                                    Zone zone, User admin) {
        Building building = Building.builder()
                .name(name)
                .address(address)
                .lat(lat)
                .lng(lng)
                .zone(zone)
                .createdBy(admin)
                .build();
        return buildingRepository.save(building);
    }

    private List<FormField> createCommonFormFields() {
        return List.of(
                FormField.builder().id("f1").type("textarea").label("메모").required(false).sortOrder(0).build(),
                FormField.builder().id("f2").type("radio").label("입주상태")
                        .options(List.of("입주", "공실", "공사중")).required(true).sortOrder(1).build(),
                FormField.builder().id("f3").type("select").label("용도")
                        .options(List.of("사무실", "상가", "주거", "창고")).required(false).sortOrder(2).build(),
                FormField.builder().id("f4").type("text").label("담당자").required(false).sortOrder(3).build(),
                FormField.builder().id("f5").type("date").label("계약일").required(false).sortOrder(4).build(),
                FormField.builder().id("f6").type("checkbox").label("시설점검")
                        .options(List.of("소화기", "비상구", "CCTV", "냉난방")).required(false).sortOrder(5).build()
        );
    }

    private void createFormSchema(Building building, List<FormField> fields) {
        FormSchema schema = FormSchema.builder()
                .building(building)
                .fields(fields)
                .build();
        formSchemaRepository.save(schema);
    }

    private void createUnitsAndRecords(Building building, int count) {
        // 층별 호실 배치 (1층부터)
        String[] statuses = {"입주", "공실", "공사중", "입주", "입주", "공실", "입주", "공실"};
        String[] purposes = {"사무실", "상가", "주거", "사무실", "창고", "사무실", "상가", "주거"};
        String[] managers = {"홍길동", "", "김철수", "이영희", "", "박민준", "최지수", ""};

        for (int i = 0; i < count; i++) {
            int floor = (i / 4) + 1;
            int roomNum = (i % 4) + 1;
            String unitName = floor + "0" + roomNum + "호";

            Unit unit = Unit.builder()
                    .name(unitName)
                    .floor(floor)
                    .sortOrder(i)
                    .building(building)
                    .build();
            unit = unitRepository.save(unit);

            // 홀수 인덱스 호실에만 기록 데이터 삽입
            if (i % 2 == 0) {
                Map<String, Object> data = new java.util.HashMap<>();
                data.put("f1", i == 0 ? "정기 점검 완료. 에어컨 필터 교체 필요." : "");
                data.put("f2", statuses[i % statuses.length]);
                data.put("f3", purposes[i % purposes.length]);
                data.put("f4", managers[i % managers.length]);
                data.put("f5", "2025-0" + (i + 1) + "-01");
                data.put("f6", i == 0 ? List.of("소화기", "CCTV") : List.of());

                UnitRecord record = UnitRecord.builder()
                        .unit(unit)
                        .data(data)
                        .build();
                unitRecordRepository.save(record);
            }
        }
    }
}
