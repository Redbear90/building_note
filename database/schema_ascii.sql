CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(100),
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zones (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    polygon     JSONB        NOT NULL,
    color       VARCHAR(20)  DEFAULT '#01696f',
    created_by  UUID         NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS units (
    id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    floor       INTEGER,
    sort_order  INTEGER   NOT NULL DEFAULT 0,
    building_id UUID      NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_schemas (
    id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID      NOT NULL UNIQUE REFERENCES buildings(id) ON DELETE CASCADE,
    fields      JSONB     NOT NULL DEFAULT '[]',
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS unit_records (
    id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id     UUID      NOT NULL UNIQUE REFERENCES units(id) ON DELETE CASCADE,
    data        JSONB     NOT NULL DEFAULT '{}',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buildings_zone_id    ON buildings(zone_id);
CREATE INDEX IF NOT EXISTS idx_buildings_location   ON buildings USING gist(point(lng, lat));
CREATE INDEX IF NOT EXISTS idx_units_building_id    ON units(building_id);
CREATE INDEX IF NOT EXISTS idx_units_sort_order     ON units(building_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_zones_created_by     ON zones(created_by);
CREATE INDEX IF NOT EXISTS idx_buildings_created_by ON buildings(created_by);
