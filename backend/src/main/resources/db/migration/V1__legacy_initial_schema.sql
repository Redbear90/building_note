-- =====================================================
-- V1__legacy_initial_schema.sql
-- 옛(멀티테넌트 도입 전) 스키마. 운영 DB의 baseline과 일치.
-- 빈 DB에서 시작하면 V1 → V2 순서로 적용되어 결국 새 모델에 도달한다.
-- 이미 옛 스키마로 운영 중인 DB는 Flyway가 baseline-on-migrate로 V1을 통과시킨 뒤 V2부터 적용.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ── users ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(100),
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── zones ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zones (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    polygon     JSONB        NOT NULL,
    color       VARCHAR(20)  DEFAULT '#01696f',
    created_by  UUID         REFERENCES users(id),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_zones_created_by ON zones(created_by);

-- ── buildings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS buildings (
    id          UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(200)     NOT NULL,
    address     VARCHAR(500),
    lat         DOUBLE PRECISION NOT NULL,
    lng         DOUBLE PRECISION NOT NULL,
    zone_id     UUID             REFERENCES zones(id) ON DELETE SET NULL,
    created_by  UUID             REFERENCES users(id),
    created_at  TIMESTAMP        NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP        NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_buildings_created_by ON buildings(created_by);
CREATE INDEX IF NOT EXISTS idx_buildings_zone_id    ON buildings(zone_id);
CREATE INDEX IF NOT EXISTS idx_buildings_location   ON buildings USING gist(point(lng, lat));

-- ── units ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS units (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    floor       INTEGER,
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    building_id UUID         NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_units_building_id ON units(building_id);
CREATE INDEX IF NOT EXISTS idx_units_sort_order  ON units(building_id, sort_order);

-- ── form_schemas ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_schemas (
    id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID      NOT NULL UNIQUE REFERENCES buildings(id) ON DELETE CASCADE,
    fields      JSONB     NOT NULL DEFAULT '[]',
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── unit_records (옛 모델: unit당 1건) ─────────────────
CREATE TABLE IF NOT EXISTS unit_records (
    id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id     UUID      NOT NULL UNIQUE REFERENCES units(id) ON DELETE CASCADE,
    data        JSONB     NOT NULL DEFAULT '{}',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── unit_comments (옛 모델: author는 VARCHAR 닉네임) ───
CREATE TABLE IF NOT EXISTS unit_comments (
    id          UUID            PRIMARY KEY,
    unit_id     UUID            NOT NULL REFERENCES units(id),
    author      VARCHAR(50)     NOT NULL,
    content     VARCHAR(500)    NOT NULL,
    created_at  TIMESTAMP(6)    NOT NULL
);
