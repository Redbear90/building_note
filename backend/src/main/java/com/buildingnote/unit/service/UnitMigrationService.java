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
 * 호실 이름 일괄 변환 (-101호 → B101호). 사이트 ADMIN 전용 일회성 작업.
 */
@Service
@RequiredArgsConstructor
public class UnitMigrationService {

    private static final Pattern NEGATIVE_FLOOR_PATTERN = Pattern.compile("^(-\\d+)(.*)$");

    private final UnitRepository unitRepository;

    @Transactional
    public int migrateNegativeFloorNames() {
        List<Unit> all = unitRepository.findAll();
        int count = 0;
        for (Unit unit : all) {
            Matcher m = NEGATIVE_FLOOR_PATTERN.matcher(unit.getName());
            if (m.matches()) {
                int negNum = Integer.parseInt(m.group(1));
                String rest = m.group(2);
                String newName = "B" + Math.abs(negNum) + rest;
                unit.update(newName, unit.getFloor(), unit.getSortOrder());
                count++;
            }
        }
        return count;
    }
}
