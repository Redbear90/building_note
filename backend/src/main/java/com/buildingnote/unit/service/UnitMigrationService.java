package com.buildingnote.unit.service;

import com.buildingnote.unit.entity.Unit;
import com.buildingnote.unit.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 호실 이름 일괄 마이그레이션 서비스
 * -101호 → B101호 형식으로 변환
 */
@Service
@RequiredArgsConstructor
public class UnitMigrationService {

    private final UnitRepository unitRepository;

    /** "-숫자" 로 시작하는 패턴 (예: -101호, -201) */
    private static final Pattern NEGATIVE_FLOOR_PATTERN = Pattern.compile("^(-\\d+)(.*)$");

    /**
     * 이름이 음수 층 형식(-숫자...)인 호실을 B숫자... 형식으로 일괄 수정
     * @return 수정된 호실 수
     */
    @Transactional
    public int migrateNegativeFloorNames() {
        List<Unit> all = unitRepository.findAll();
        int count = 0;

        for (Unit unit : all) {
            Matcher m = NEGATIVE_FLOOR_PATTERN.matcher(unit.getName());
            if (m.matches()) {
                int negNum = Integer.parseInt(m.group(1)); // 음수 값 (예: -101)
                String rest = m.group(2);                  // 나머지 (예: "호")
                String newName = "B" + Math.abs(negNum) + rest;
                unit.update(newName, unit.getFloor(), unit.getSortOrder());
                count++;
            }
        }

        return count;
    }
}
