-- =====================================================
-- diagnose_organization.sql
-- Owner 계정 저장 문제 진단 스크립트
--
-- 실행 방법:
--   psql -U buildnote -d building_note -f diagnose_organization.sql
-- =====================================================

\echo '======================================='
\echo '1. 조직(Organization) 현황'
\echo '======================================='
SELECT
    id,
    name,
    invite_code,
    created_at
FROM organizations
ORDER BY created_at;

\echo ''
\echo '======================================='
\echo '2. 사용자 현황'
\echo '======================================='
SELECT
    u.id,
    u.email,
    u.name,
    u.role,
    o.name AS organization_name,
    u.created_at
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
ORDER BY u.role, u.created_at;

\echo ''
\echo '======================================='
\echo '3. ⚠️  NULL organization_id 데이터 확인'
\echo '======================================='
\echo '(이 결과가 0이면 정상입니다)'
\echo ''

\echo 'buildings 중 NULL organization_id:'
SELECT COUNT(*) as count FROM buildings WHERE organization_id IS NULL;

\echo 'zones 중 NULL organization_id:'
SELECT COUNT(*) as count FROM zones WHERE organization_id IS NULL;

\echo 'buildings 중 NULL created_by:'
SELECT COUNT(*) as count FROM buildings WHERE created_by IS NULL AND organization_id IS NOT NULL;

\echo 'zones 중 NULL created_by:'
SELECT COUNT(*) as count FROM zones WHERE created_by IS NULL AND organization_id IS NOT NULL;

\echo ''
\echo '======================================='
\echo '4. Owner 계정 접근 가능 데이터 범위'
\echo '======================================='
WITH owner_info AS (
    SELECT id, email, organization_id FROM users
    WHERE role = 'BUILDING_OWNER'
    ORDER BY created_at ASC
    LIMIT 1
)
SELECT
    u.email AS owner_email,
    o.name AS workspace_name,
    COUNT(DISTINCT b.id) AS total_buildings,
    COUNT(DISTINCT z.id) AS total_zones,
    SUM(CASE WHEN b.organization_id IS NULL THEN 1 ELSE 0 END) AS inaccessible_buildings,
    SUM(CASE WHEN z.organization_id IS NULL THEN 1 ELSE 0 END) AS inaccessible_zones
FROM owner_info u
JOIN organizations o ON u.organization_id = o.id
LEFT JOIN buildings b ON (
    b.organization_id = u.organization_id
    OR b.organization_id IS NULL
)
LEFT JOIN zones z ON (
    z.organization_id = u.organization_id
    OR z.organization_id IS NULL
)
GROUP BY u.id, u.email, o.name;

\echo ''
\echo '======================================='
\echo '5. 데이터베이스 정합성 요약'
\echo '======================================='
SELECT
    (SELECT COUNT(*) FROM organizations) AS total_organizations,
    (SELECT COUNT(*) FROM users WHERE role = 'BUILDING_OWNER') AS building_owners,
    (SELECT COUNT(*) FROM users WHERE role = 'MEMBER') AS members,
    (SELECT COUNT(*) FROM buildings) AS total_buildings,
    (SELECT COUNT(*) FROM zones) AS total_zones,
    (SELECT COUNT(*) FROM units) AS total_units,
    (SELECT COUNT(*) FROM unit_records) AS total_records,
    (SELECT COUNT(*) FROM unit_comments) AS total_comments;

\echo ''
\echo '======================================='
\echo '6. 🔧 권장 조치'
\echo '======================================='
\echo ''
\echo '위의 "NULL organization_id 데이터 확인"에서 0이 아닌 값이 나오면:'
\echo '1. 백엔드를 다시 시작 (V3 마이그레이션 자동 실행)'
\echo '2. 또는 다음 명령어로 수동 실행:'
\echo '   psql -U buildnote -d building_note -f V3__fix_organization_nulls.sql'
\echo ''
\echo '이후 Owner 계정의 Building/Zone 저장이 정상 작동합니다.'
\echo ''
