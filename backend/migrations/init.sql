-- Animita MVP Database Schema (PostgreSQL + PostGIS)

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enumerated types kept intentionally small for MVP
CREATE TYPE memorial_type AS ENUM ('animita');
CREATE TYPE memorial_status AS ENUM ('draft', 'published');
CREATE TYPE memorial_detection_source AS ENUM ('manual_upload', 'community', 'yolo_model', 'street_view');
CREATE TYPE candle_status AS ENUM ('active', 'expired', 'extinguished');
CREATE TYPE account_type AS ENUM ('free', 'supporter', 'researcher');

-- Core memorials table
CREATE TABLE memorials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type memorial_type NOT NULL DEFAULT 'animita',
    name VARCHAR(255),
    description TEXT,
    story TEXT,
    location GEOMETRY(POINT, 4326) NOT NULL,
    image_url TEXT,
    locality VARCHAR(120),
    region VARCHAR(120),
    country_code CHAR(3) NOT NULL DEFAULT 'CL',
    detection_source memorial_detection_source NOT NULL DEFAULT 'manual_upload',
    confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
    status memorial_status NOT NULL DEFAULT 'draft',
    metadata JSONB NOT NULL DEFAULT '{}',
    heat_score INTEGER NOT NULL DEFAULT 0,
    last_candle_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community reports remain available for crowdsourcing feedback
CREATE TABLE community_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
    reporter_session VARCHAR(100) NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('correction', 'verification', 'flag', 'additional_info')),
    suggested_type memorial_type DEFAULT 'animita',
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(120),
    account_type account_type NOT NULL DEFAULT 'free',
    free_candles_remaining INTEGER NOT NULL DEFAULT 3,
    candles_reset_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE candles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message VARCHAR(280),
    status candle_status NOT NULL DEFAULT 'active',
    lit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    relit_from_id UUID REFERENCES candles(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE testimonies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    candle_id UUID REFERENCES candles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    has_candle BOOLEAN NOT NULL DEFAULT FALSE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detection jobs and stats left untouched for backlog automation
CREATE TABLE detection_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('mapillary_region', 'streetview_region', 'single_image')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    region_bbox GEOMETRY(POLYGON, 4326),
    image_url TEXT,
    parameters JSONB NOT NULL DEFAULT '{}',
    results JSONB NOT NULL DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE daily_stats (
    date DATE PRIMARY KEY,
    total_memorials INTEGER DEFAULT 0,
    published_memorials INTEGER DEFAULT 0,
    new_reports INTEGER DEFAULT 0,
    community_reports INTEGER DEFAULT 0,
    stats_by_region JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_memorials_location ON memorials USING GIST(location);
CREATE INDEX idx_memorials_status ON memorials(status);
CREATE INDEX idx_memorials_created_at ON memorials(created_at DESC);
CREATE INDEX idx_memorials_detection_source ON memorials(detection_source);
CREATE INDEX idx_memorials_last_candle ON memorials(last_candle_at);

CREATE INDEX idx_community_reports_memorial_id ON community_reports(memorial_id);
CREATE INDEX idx_community_reports_created_at ON community_reports(created_at DESC);
CREATE INDEX idx_users_account_type ON users(account_type);
CREATE INDEX idx_candles_memorial_id ON candles(memorial_id);
CREATE INDEX idx_candles_user_id ON candles(user_id);
CREATE INDEX idx_candles_expires_at ON candles(expires_at);
CREATE INDEX idx_testimonies_memorial_id ON testimonies(memorial_id);
CREATE INDEX idx_testimonies_user_id ON testimonies(user_id);
CREATE INDEX idx_detection_jobs_status ON detection_jobs(status);
CREATE INDEX idx_detection_jobs_created_at ON detection_jobs(created_at DESC);
CREATE INDEX idx_detection_jobs_region_bbox ON detection_jobs USING GIST(region_bbox);

-- Trigger for automatic updated_at maintenance
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_memorials_updated_at
    BEFORE UPDATE ON memorials
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_candles_updated_at
    BEFORE UPDATE ON candles
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_testimonies_updated_at
    BEFORE UPDATE ON testimonies
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();

-- Helper function for approximate distance (meters)
CREATE OR REPLACE FUNCTION calculate_distance_meters(
    lat1 FLOAT,
    lon1 FLOAT,
    lat2 FLOAT,
    lon2 FLOAT
) RETURNS FLOAT AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    );
END;
$$ LANGUAGE plpgsql;

-- Nearby lookup helper
CREATE OR REPLACE FUNCTION find_nearby_memorials(
    search_lat FLOAT,
    search_lon FLOAT,
    radius_meters FLOAT DEFAULT 50
) RETURNS TABLE(
    id UUID,
    type memorial_type,
    distance_meters FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.type,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(search_lon, search_lat), 4326)::geography,
            m.location::geography
        ) AS distance_meters
    FROM memorials m
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(search_lon, search_lat), 4326)::geography,
        m.location::geography,
        radius_meters
    )
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Simple viewport helper
CREATE OR REPLACE FUNCTION get_memorials_in_bbox(
    west FLOAT,
    south FLOAT,
    east FLOAT,
    north FLOAT
) RETURNS TABLE(
    id UUID,
    latitude FLOAT,
    longitude FLOAT,
    status memorial_status,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        ST_Y(m.location) AS latitude,
        ST_X(m.location) AS longitude,
        m.status,
        m.image_url
    FROM memorials m
    WHERE ST_Contains(
        ST_MakeEnvelope(west, south, east, north, 4326),
        m.location
    );
END;
$$ LANGUAGE plpgsql;

-- Seed a couple memorials for local development
INSERT INTO memorials (id, name, description, story, location, locality, region, country_code, image_url, detection_source, confidence, status, metadata, heat_score, last_candle_at)
VALUES
    (
        '3f4b0f24-dfb4-4fd7-9c44-740249bca110',
        'Animita de Mercedes Rojas',
        'Altar comunitario levantado tras un accidente en 1998.',
        'Vecinos cuentan que Mercedes cuida a quienes transitan por la avenida. Este altar se mantiene vivo con flores y cintas de agradecimiento.',
        ST_SetSRID(ST_MakePoint(-70.6505, -33.4691), 4326),
        'Santiago',
        'Metropolitana',
        'CL',
        'https://example.org/images/animita-mercedes.jpg',
        'community',
        0.92,
        'published',
        '{"notes": "Vecinos mantienen flores frescas cada semana."}',
        48,
        NOW()
    ),
    (
        '5cc28f01-9bc0-4760-a97e-0a90c9e0564d',
        'Animita Ruta 5 Km 118',
        'Pequeña cruz con cintas reflectantes para viajeros nocturnos.',
        'Transportistas atribuyen protección a esta animita; en invierno, conductores dejan termos y velas para quienes viajan de noche.',
        ST_SetSRID(ST_MakePoint(-71.2341, -34.9852), 4326),
        'San Fernando',
        'Libertador General Bernardo O''Higgins',
        'CL',
        'https://example.org/images/animita-ruta5.jpg',
        'manual_upload',
        0.75,
        'draft',
        '{"hazards": ["Curva pronunciada", "Poca iluminación"]}',
        12,
        NULL
    );

INSERT INTO users (id, email, display_name, account_type, free_candles_remaining, candles_reset_at)
VALUES
    (
        'd7a91737-7e68-4de2-9b72-4f72b31f8f11',
        'dev@animitas.cl',
        'Equipo Animita',
        'free',
        1,
        NOW()
    ),
    (
        'ec1aca80-1aad-4cba-9e13-07d7a5f2c1f8',
        'investigador@animitas.cl',
        'Investigadora Patrimonio',
        'researcher',
        3,
        NOW()
    );

INSERT INTO candles (id, memorial_id, user_id, message, status, lit_at, expires_at, metadata)
VALUES
    (
        '9d9fdad6-8d44-4d46-92b4-31cdccb7901a',
        '3f4b0f24-dfb4-4fd7-9c44-740249bca110',
        'd7a91737-7e68-4de2-9b72-4f72b31f8f11',
        'Gracias por acompañar a mi familia este mes.',
        'active',
        NOW() - INTERVAL '6 hours',
        NOW() + INTERVAL '18 hours',
        '{"origin": "web"}'
    ),
    (
        'b4bc01e0-2a17-41d0-a29a-5e06aa868b47',
        '5cc28f01-9bc0-4760-a97e-0a90c9e0564d',
        'ec1aca80-1aad-4cba-9e13-07d7a5f2c1f8',
        'Por los viajeros nocturnos, que lleguen a salvo.',
        'expired',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '1 day',
        '{"origin": "mobile"}'
    );

INSERT INTO testimonies (id, memorial_id, user_id, candle_id, content, has_candle, metadata)
VALUES
    (
        '1d1fe06b-0127-4d35-b3aa-63b7beeac6c4',
        '3f4b0f24-dfb4-4fd7-9c44-740249bca110',
        'd7a91737-7e68-4de2-9b72-4f72b31f8f11',
        '9d9fdad6-8d44-4d46-92b4-31cdccb7901a',
        'Mercedes nos ayudó a encontrar trabajo cuando más lo necesitábamos.',
        TRUE,
        '{"emotion": "gratitude"}'
    ),
    (
        '8a404ac5-2bad-45e5-9d3e-9c9ffdf31e52',
        '5cc28f01-9bc0-4760-a97e-0a90c9e0564d',
        NULL,
        NULL,
        'Siempre dejo una cinta cuando viajo al sur, me siento acompañada.',
        FALSE,
        '{"origin": "anonymous"}'
    );

-- Public view with only safe fields
CREATE VIEW public_memorials AS
SELECT
    id,
    ST_Y(location) AS latitude,
    ST_X(location) AS longitude,
    name,
    description,
    story,
    status,
    image_url,
    heat_score,
    last_candle_at,
    metadata,
    created_at,
    updated_at
FROM memorials
WHERE status = 'published';

GRANT SELECT ON public_memorials TO PUBLIC;

COMMENT ON TABLE memorials IS 'Core table storing memorial records (MVP: roadside shrines)';
COMMENT ON COLUMN memorials.location IS 'Point geometry in EPSG:4326';
COMMENT ON COLUMN memorials.metadata IS 'Flexible JSONB for early MVP experimentation';
COMMENT ON TABLE community_reports IS 'Crowdsourced feedback tied to memorials';
