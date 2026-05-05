-- =====================================================
-- V3__fix_organization_nulls.sql
-- Owner 계정의 데이터 저장 실패 문제 해결
--
-- 증상: owner 계정이 Building/Zone 저장 시 "ACCESS_DENIED" 오류
-- 원인: V2 마이그레이션 후 일부 데이터의 organization_id가 NULL로 남음
--
-- 이 마이그레이션은:
--  1. NULL organization_id 데이터 복구
--  2. NULL created_by 데이터 복구
--  3. 정합성 검증
-- =====================================================

DO $$
DECLARE
    v_org_id      UUID;
    v_owner_id    UUID;
    v_buildings_fixed INTEGER := 0;
    v_zones_fixed INTEGER := 0;
BEGIN
    -- ────────────────────────────────────────────────────
    -- 1. 안전 검증: organization이 정확히 1개여야 함
    -- ────────────────────────────────────────────────────
    SELECT COUNT(*) INTO v_buildings_fixed FROM organizations;

    IF v_buildings_fixed = 0 THEN
        RAISE EXCEPTION 'organization이 없습니다. V2 마이그레이션 실패 상태입니다.';
    END IF;

    IF v_buildings_fixed > 1 THEN
        RAISE WARNING '예상과 다른 organization 개수입니다 (%). 첫 번째 organization만 사용됩니다.', v_buildings_fixed;
    END IF;

    -- 메인 organization 선택 (가장 먼저 생성된 것)
    SELECT id INTO v_org_id
      FROM organizations
     ORDER BY created_at ASC
     LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'organization을 선택할 수 없습니다.';
    END IF;

    -- ────────────────────────────────────────────────────
    -- 2. BUILDING_OWNER 선택 (created_by 복구용)
    -- ────────────────────────────────────────────────────
    SELECT id INTO v_owner_id
      FROM users
     WHERE role = 'BUILDING_OWNER'
       AND organization_id = v_org_id
     ORDER BY created_at ASC
     LIMIT 1;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'BUILDING_OWNER가 없습니다. 옛 ADMIN 사용자가 존재하는지 확인하세요.';
    END IF;

    -- ────────────────────────────────────────────────────
    -- 3. NULL organization_id 복구
    -- ────────────────────────────────────────────────────

    -- buildings
    UPDATE buildings
       SET organization_id = v_org_id
     WHERE organization_id IS NULL;
    GET DIAGNOSTICS v_buildings_fixed = ROW_COUNT;

    IF v_buildings_fixed > 0 THEN
        RAISE NOTICE 'buildings: % 개 복구됨', v_buildings_fixed;
    END IF;

    -- zones
    UPDATE zones
       SET organization_id = v_org_id
     WHERE organization_id IS NULL;
    GET DIAGNOSTICS v_zones_fixed = ROW_COUNT;

    IF v_zones_fixed > 0 THEN
        RAISE NOTICE 'zones: % 개 복구됨', v_zones_fixed;
    END IF;

    -- ────────────────────────────────────────────────────
    -- 4. NULL created_by 복구 (buildings)
    -- ────────────────────────────────────────────────────
    UPDATE buildings
       SET created_by = v_owner_id
     WHERE created_by IS NULL
       AND organization_id = v_org_id;
    GET DIAGNOSTICS v_buildings_fixed = ROW_COUNT;

    IF v_buildings_fixed > 0 THEN
        RAISE NOTICE 'buildings created_by: % 개 복구됨', v_buildings_fixed;
    END IF;

    -- ────────────────────────────────────────────────────
    -- 5. NULL created_by 복구 (zones)
    -- ────────────────────────────────────────────────────
    UPDATE zones
       SET created_by = v_owner_id
     WHERE created_by IS NULL
       AND organization_id = v_org_id;
    GET DIAGNOSTICS v_zones_fixed = ROW_COUNT;

    IF v_zones_fixed > 0 THEN
        RAISE NOTICE 'zones created_by: % 개 복구됨', v_zones_fixed;
    END IF;

    -- ────────────────────────────────────────────────────
    -- 6. 최종 정합성 검증 (실패 시 마이그레이션 롤백)
    -- ────────────────────────────────────────────────────

    IF EXISTS (SELECT 1 FROM buildings WHERE organization_id IS NULL) THEN
        RAISE EXCEPTION 'buildings 복구 실패: 여전히 NULL organization_id 존재';
    END IF;

    IF EXISTS (SELECT 1 FROM zones WHERE organization_id IS NULL) THEN
        RAISE EXCEPTION 'zones 복구 실패: 여전히 NULL organization_id 존재';
    END IF;

    IF EXISTS (SELECT 1 FROM buildings WHERE created_by IS NULL AND organization_id = v_org_id) THEN
        RAISE EXCEPTION 'buildings 복구 실패: 여전히 NULL created_by 존재';
    END IF;

    IF EXISTS (SELECT 1 FROM zones WHERE created_by IS NULL AND organization_id = v_org_id) THEN
        RAISE EXCEPTION 'zones 복구 실패: 여전히 NULL created_by 존재';
    END IF;

    RAISE NOTICE 'V3 마이그레이션 완료: NULL organization_id/created_by 복구됨 (org_id: %)', v_org_id;

END $$;
