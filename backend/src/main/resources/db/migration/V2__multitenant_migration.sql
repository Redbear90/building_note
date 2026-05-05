-- =====================================================
-- V2__multitenant_migration.sql
-- 옛 단일 워크스페이스 → 멀티테넌트(organization) 모델로 전환.
-- 기존 데이터 손실 없이 보존:
--   · 옛 ADMIN(admin@naver.com) → BUILDING_OWNER (워크스페이스 소유자)
--   · 옛 USER(user@naver.com)   → MEMBER
--   · 모든 zones/buildings → "기본 워크스페이스"로 귀속
--   · units.is_active 컬럼은 unit_records.data->>'__active' 값에서 끌어올림
--   · 모든 unit_records, unit_comments는 BUILDING_OWNER 한 명에게 귀속 (옛 모델은 작성자 추적 안 함)
-- =====================================================

-- ── 1. organizations 테이블 ────────────────────────────
CREATE TABLE organizations (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         VARCHAR(200) NOT NULL,
    invite_code  VARCHAR(20)  NOT NULL UNIQUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  organizations             IS '워크스페이스 (BUILDING_OWNER 1명 + MEMBER N명)';
COMMENT ON COLUMN organizations.invite_code IS '멤버 초대용 영숫자 코드';

-- ── 2. users — organization_id, 새 role ────────────────
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_users_organization_id ON users(organization_id);

-- ── 3. zones / buildings — organization_id 컬럼 추가 ────
ALTER TABLE zones     ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE buildings ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- ── 4. units.is_active ─────────────────────────────────
ALTER TABLE units ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE;
COMMENT ON COLUMN units.is_active IS '슬라이드 버튼 ON/OFF — 멤버 누구나 토글';

-- ── 5. unit_records — author_id, soft delete ───────────
ALTER TABLE unit_records ADD COLUMN author_id  UUID REFERENCES users(id);
ALTER TABLE unit_records ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE unit_records ADD COLUMN deleted_by UUID REFERENCES users(id);

-- ── 6. unit_comments — author_id, soft delete ─────────
-- 기존 author(VARCHAR) 컬럼은 legacy_author_name으로 보존
ALTER TABLE unit_comments RENAME COLUMN author TO legacy_author_name;
ALTER TABLE unit_comments ALTER COLUMN legacy_author_name DROP NOT NULL;
ALTER TABLE unit_comments ADD COLUMN author_id  UUID REFERENCES users(id);
ALTER TABLE unit_comments ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE unit_comments ADD COLUMN deleted_by UUID REFERENCES users(id);

-- ── 7. 데이터 백필 (한 트랜잭션) ────────────────────────
DO $$
DECLARE
    v_org_id      UUID;
    v_owner_id    UUID;
    v_invite_code VARCHAR(20);
BEGIN
    -- 7-a. "기본 워크스페이스" 1개 생성. 충돌 없는 8자리 영숫자 invite_code 생성.
    v_invite_code := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
    INSERT INTO organizations (name, invite_code)
    VALUES ('기본 워크스페이스', v_invite_code)
    RETURNING id INTO v_org_id;

    -- 7-b. 기존 사용자 역할 변환 + 워크스페이스 귀속
    --      옛 ADMIN → BUILDING_OWNER (워크스페이스 소유자)
    --      옛 USER  → MEMBER
    UPDATE users
       SET role = 'BUILDING_OWNER',
           organization_id = v_org_id
     WHERE role = 'ADMIN';

    UPDATE users
       SET role = 'MEMBER',
           organization_id = v_org_id
     WHERE role = 'USER';

    -- 7-c. BUILDING_OWNER 한 명을 record/comment 귀속 대상으로 선정
    --      (사용자 결정: 옛 admin@naver.com 한 명)
    SELECT id INTO v_owner_id
      FROM users
     WHERE role = 'BUILDING_OWNER' AND organization_id = v_org_id
     ORDER BY created_at ASC
     LIMIT 1;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'BUILDING_OWNER가 없습니다. 옛 ADMIN 사용자가 존재하는지 확인하세요.';
    END IF;

    -- 7-d. zones / buildings 워크스페이스 귀속
    UPDATE zones     SET organization_id = v_org_id;
    UPDATE buildings SET organization_id = v_org_id;

    -- 7-e. zones / buildings created_by NULL 백필 → 워크스페이스 소유자
    UPDATE zones     SET created_by = v_owner_id WHERE created_by IS NULL;
    UPDATE buildings SET created_by = v_owner_id WHERE created_by IS NULL;

    -- 7-f. units.is_active를 unit_records.data->>'__active' 에서 끌어옴
    UPDATE units u
       SET is_active = TRUE
      FROM unit_records r
     WHERE r.unit_id = u.id
       AND r.data ->> '__active' = 'true';

    -- 7-g. 모든 unit_records를 워크스페이스 소유자에게 귀속
    UPDATE unit_records SET author_id = v_owner_id;

    -- 7-h. unit_records.data 에서 더 이상 쓰지 않는 __active 키 제거
    UPDATE unit_records SET data = data - '__active' WHERE data ? '__active';

    -- 7-i. 모든 unit_comments를 워크스페이스 소유자에게 귀속
    UPDATE unit_comments SET author_id = v_owner_id;

    RAISE NOTICE '워크스페이스 생성됨: id=%, invite_code=%', v_org_id, v_invite_code;
END $$;

-- ── 8. NOT NULL 제약 + 새 인덱스/CHECK 추가 ────────────

-- users
ALTER TABLE users
    ADD CONSTRAINT users_role_org_chk
    CHECK ((role = 'ADMIN' AND organization_id IS NULL)
        OR (role IN ('BUILDING_OWNER', 'MEMBER') AND organization_id IS NOT NULL));

-- zones
ALTER TABLE zones ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE zones ALTER COLUMN created_by      SET NOT NULL;
ALTER TABLE zones ALTER COLUMN color           SET NOT NULL;
CREATE INDEX idx_zones_organization_id ON zones(organization_id);
DROP INDEX IF EXISTS idx_zones_created_by;

-- buildings
ALTER TABLE buildings ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE buildings ALTER COLUMN created_by      SET NOT NULL;
CREATE INDEX idx_buildings_organization_id ON buildings(organization_id);
DROP INDEX IF EXISTS idx_buildings_created_by;

-- unit_records
--   · 옛 unique(unit_id) → partial unique (unit_id, author_id) WHERE deleted_at IS NULL
ALTER TABLE unit_records ALTER COLUMN author_id SET NOT NULL;
ALTER TABLE unit_records DROP CONSTRAINT unit_records_unit_id_key;
CREATE UNIQUE INDEX uq_unit_records_unit_author_active
    ON unit_records(unit_id, author_id)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_unit_records_unit_id   ON unit_records(unit_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_unit_records_author_id ON unit_records(author_id) WHERE deleted_at IS NULL;

-- unit_comments
ALTER TABLE unit_comments ALTER COLUMN author_id SET NOT NULL;
CREATE INDEX idx_unit_comments_unit_id_active
    ON unit_comments(unit_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- ── 9. 정합성 검증 (실패 시 마이그레이션 롤백) ─────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE role NOT IN ('ADMIN', 'BUILDING_OWNER', 'MEMBER')) THEN
        RAISE EXCEPTION 'role 변환 실패: 옛 USER/ADMIN 값이 남아있음';
    END IF;
    IF EXISTS (SELECT 1 FROM zones WHERE organization_id IS NULL OR created_by IS NULL) THEN
        RAISE EXCEPTION 'zones 백필 실패';
    END IF;
    IF EXISTS (SELECT 1 FROM buildings WHERE organization_id IS NULL OR created_by IS NULL) THEN
        RAISE EXCEPTION 'buildings 백필 실패';
    END IF;
    IF EXISTS (SELECT 1 FROM unit_records WHERE author_id IS NULL) THEN
        RAISE EXCEPTION 'unit_records.author_id 백필 실패';
    END IF;
    IF EXISTS (SELECT 1 FROM unit_comments WHERE author_id IS NULL) THEN
        RAISE EXCEPTION 'unit_comments.author_id 백필 실패';
    END IF;
END $$;
