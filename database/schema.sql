-- =====================================================
-- BuildingNote - PostgreSQL 스키마 정의
-- =====================================================

-- UUID 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 공간 인덱스를 위한 btree_gist 확장
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- =====================================================
-- 사용자 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,  -- BCrypt 해시
    name        VARCHAR(100),
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',  -- USER | ADMIN
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users          IS '서비스 사용자';
COMMENT ON COLUMN users.role     IS 'USER | ADMIN';
COMMENT ON COLUMN users.password IS 'BCrypt 해시값';

-- =====================================================
-- 구역 테이블 (지도 폴리곤)
-- =====================================================
CREATE TABLE IF NOT EXISTS zones (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    polygon     JSONB        NOT NULL,                  -- [[lat, lng], ...] 배열
    color       VARCHAR(20)  DEFAULT '#01696f',
    created_by  UUID         NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  zones         IS '지도 위에 표시되는 구역(폴리곤)';
COMMENT ON COLUMN zones.polygon IS '[[위도, 경도], ...] 형태의 JSON 배열';
COMMENT ON COLUMN zones.color   IS 'HEX 색상 코드';

-- =====================================================
-- 건물 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS buildings (
    id          UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(200)     NOT NULL,
    address     VARCHAR(500),
    lat         DOUBLE PRECISION NOT NULL,
    lng         DOUBLE PRECISION NOT NULL,
    zone_id     UUID             REFERENCES zones(id) ON DELETE SET NULL,
    created_by  UUID             NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP        NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP        NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  buildings     IS '지도 마커로 표시되는 건물';
COMMENT ON COLUMN buildings.lat IS '위도(latitude)';
COMMENT ON COLUMN buildings.lng IS '경도(longitude)';

-- =====================================================
-- 호실 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS units (
    id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,   -- "101호", "B-201" 등
    floor       INTEGER,
    sort_order  INTEGER   NOT NULL DEFAULT 0,
    building_id UUID      NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  units            IS '건물 내 개별 호실';
COMMENT ON COLUMN units.name       IS '호실 명칭 (예: 101호, B-201)';
COMMENT ON COLUMN units.sort_order IS '정렬 순서 (낮을수록 앞에 표시)';

-- =====================================================
-- 폼 스키마 테이블 (건물별 커스텀 필드 정의)
-- =====================================================
CREATE TABLE IF NOT EXISTS form_schemas (
    id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID      NOT NULL UNIQUE REFERENCES buildings(id) ON DELETE CASCADE,
    fields      JSONB     NOT NULL DEFAULT '[]',
    -- fields 예시:
    -- [
    --   { "id": "f1", "type": "textarea",  "label": "메모",   "required": false, "sortOrder": 0 },
    --   { "id": "f2", "type": "checkbox",  "label": "점검",   "options": ["완료","미완료"],       "required": false, "sortOrder": 1 },
    --   { "id": "f3", "type": "radio",     "label": "상태",   "options": ["입주","공실","공사중"], "required": true,  "sortOrder": 2 },
    --   { "id": "f4", "type": "select",    "label": "용도",   "options": ["사무실","상가","주거"], "required": false, "sortOrder": 3 },
    --   { "id": "f5", "type": "text",      "label": "담당자", "required": false, "sortOrder": 4 },
    --   { "id": "f6", "type": "date",      "label": "계약일", "required": false, "sortOrder": 5 }
    -- ]
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  form_schemas        IS '건물별 커스텀 폼 필드 정의';
COMMENT ON COLUMN form_schemas.fields IS '필드 정의 배열 (JSONB)';

-- =====================================================
-- 호실 기록 테이블 (사용자 입력 데이터)
-- =====================================================
CREATE TABLE IF NOT EXISTS unit_records (
    id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id     UUID      NOT NULL UNIQUE REFERENCES units(id) ON DELETE CASCADE,
    data        JSONB     NOT NULL DEFAULT '{}',
    -- data 예시:
    -- { "f1": "내용...", "f2": ["완료"], "f3": "입주", "f4": "사무실", "f5": "홍길동", "f6": "2025-01-01" }
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  unit_records      IS '호실별 커스텀 폼 입력 데이터';
COMMENT ON COLUMN unit_records.data IS '{ fieldId: value } 형태의 JSON 객체';

-- =====================================================
-- 인덱스
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_buildings_zone_id   ON buildings(zone_id);
CREATE INDEX IF NOT EXISTS idx_buildings_location  ON buildings USING gist(point(lng, lat));
CREATE INDEX IF NOT EXISTS idx_units_building_id   ON units(building_id);
CREATE INDEX IF NOT EXISTS idx_units_sort_order    ON units(building_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_zones_created_by    ON zones(created_by);
CREATE INDEX IF NOT EXISTS idx_buildings_created_by ON buildings(created_by);
