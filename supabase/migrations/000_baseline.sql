-- =============================================================================
-- Migration: 000_baseline.sql
-- Purpose:   Create the two tables the entire product runs on — `properties`
--            and `bookings` — plus the legacy `settings` table and the shared
--            `update_updated_at_column()` trigger function.
-- Date:      2026-09-02  ·  Rewritten from the live schema 2026-09-02
-- =============================================================================
--
-- WHY THIS FILE EXISTS
--
-- `properties` and `bookings` predate the migrations folder. Until now the
-- repository could not rebuild its own database: migrations 001-009 all ALTER
-- tables that no migration ever CREATEs, so the chain fails on statement one
-- against an empty database. That means no staging environment, no local
-- reproduction, and no way to reason about live schema from the code.
--
-- HOW THIS FILE WAS BUILT
--
-- ✅ 2026-09-02: this is no longer a reconstruction. Every column, type,
--    default, nullability and constraint below was read directly out of the
--    live database (project `gihgdouvltxlpynpuyde`) via
--    `information_schema.columns` + `pg_get_constraintdef`, and transcribed.
--
--    The previous version of this file was inferred from application code, and
--    it was wrong in ways that mattered:
--
--      • `bookings.id` was declared BIGINT identity. It is `uuid` defaulting to
--        `uuid_generate_v4()`.
--      • `bookings` was missing `message`, `is_archived` and `archived_at`
--        entirely. `is_archived` is the column that 007 and 009 guard, so a
--        test derived from this file concluded — wrongly — that the guard
--        referenced a column that does not exist. The DATABASE was right and
--        the BASELINE was wrong.
--      • `bookings` declared `inquiry_type`, `property_type`, `location` and
--        `budget`, none of which exist in production.
--      • `bookings.email` and `.phone` are NOT NULL in production; this file
--        had them nullable. A booking insert that omits `phone` fails on the
--        column constraint, whatever the RLS policy says.
--      • `properties.id` is `integer` from a sequence, `images`/`amenities` are
--        `text[]` and not `jsonb`, and the table carries `city`, `state`,
--        `zip_code` and `year_built`, which this file did not mention.
--      • `settings` has `api_key`, `api_secret` and `secure` columns — the
--        Cloudinary credential store — which this file omitted.
--
--    The lesson is recorded rather than quietly fixed: a baseline inferred from
--    application code reads like documentation and behaves like a guess. This
--    one is now transcribed from `pg_catalog`, and should be regenerated the
--    same way whenever production changes.
--
-- Every statement remains idempotent and additive — `CREATE TABLE IF NOT EXISTS`
-- and `ADD COLUMN IF NOT EXISTS` — so applying it against the live database
-- cannot drop or retype anything.
--
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Extensions the live schema depends on
-- -----------------------------------------------------------------------------
-- bookings.id defaults to uuid_generate_v4(), which lives in uuid-ossp.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Shared trigger function
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- properties — transcribed from the live schema 2026-09-02
-- -----------------------------------------------------------------------------
-- `id` is an integer sequence, NOT a uuid: 002 declares
-- `property_id INTEGER REFERENCES properties(id)`, and production agrees.
-- `images` and `amenities` are text[] and NOT jsonb.
CREATE TABLE IF NOT EXISTS public.properties (
  id            SERIAL PRIMARY KEY,

  -- Listing
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  price         NUMERIC NOT NULL,

  -- Classification
  property_type VARCHAR(50),
  purpose       VARCHAR DEFAULT '',
  status        VARCHAR(20) DEFAULT 'available',

  -- Location
  location      VARCHAR(255),
  address       VARCHAR(255),
  city          VARCHAR(100),
  state         VARCHAR(50),
  zip_code      VARCHAR(20),

  -- Specification
  bedrooms      INTEGER,
  bathrooms     INTEGER,
  area_sqft     INTEGER,
  lot_size_sqft INTEGER,
  year_built    INTEGER,

  -- Features
  has_pool      BOOLEAN DEFAULT FALSE,
  has_garden    BOOLEAN DEFAULT FALSE,
  featured      BOOLEAN DEFAULT FALSE,

  -- Cloudinary URLs / free-text amenity labels
  images        TEXT[],
  amenities     TEXT[],

  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additive, for databases created against an older version of this file.
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS city          VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state         VARCHAR(50),
  ADD COLUMN IF NOT EXISTS zip_code      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS year_built    INTEGER,
  ADD COLUMN IF NOT EXISTS lot_size_sqft INTEGER,
  ADD COLUMN IF NOT EXISTS has_pool      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_garden    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS featured      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS purpose       VARCHAR DEFAULT '',
  ADD COLUMN IF NOT EXISTS status        VARCHAR(20) DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_properties_status     ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_purpose    ON public.properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_featured   ON public.properties(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.properties;
CREATE TRIGGER trigger_set_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- bookings — transcribed from the live schema 2026-09-02
-- -----------------------------------------------------------------------------
-- ⚠️  `email` and `phone` are NOT NULL in production. Any insert path that omits
--     phone fails on the column constraint before RLS is even consulted.
--
-- ⚠️  `is_archived` and `archived_at` exist here and are guarded by the booking
--     INSERT policy in 007/009. An earlier version of this file omitted them,
--     which made those guards look like references to a non-existent column.
--
-- `confirmed_by` and `assigned_agent_id` are `text` because they once held Clerk
-- user IDs. 009 converts them to `uuid REFERENCES auth.users(id)`.
CREATE TABLE IF NOT EXISTS public.bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  type          TEXT NOT NULL,

  -- Contact details supplied by the prospect
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,

  -- Viewing / consultation path
  service        TEXT,
  viewing_type   TEXT,
  appointment_at TIMESTAMP WITH TIME ZONE,

  -- General-enquiry path
  subject       TEXT,
  message       TEXT,
  notes         TEXT,

  -- Workflow
  status        TEXT DEFAULT 'pending',
  is_archived   BOOLEAN DEFAULT FALSE,
  archived_at   TIMESTAMP WITH TIME ZONE,

  -- Admin-only fields. The INSERT policy requires every one of these to be NULL
  -- on submission, so a prospect cannot self-confirm or self-assign.
  admin_notes         TEXT,
  internal_notes      TEXT,
  confirmed_at        TIMESTAMP WITH TIME ZONE,
  confirmed_by        TEXT,
  cancelled_at        TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  priority            VARCHAR(10) DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_agent_id   TEXT,

  -- client_id carries no REFERENCES here on purpose: `clients` is created by
  -- 001, which runs after this file. 002 adds the foreign key once it exists.
  client_id     UUID,
  property_id   INTEGER REFERENCES public.properties(id) ON DELETE SET NULL,

  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additive, for databases created against an older version of this file.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS message     TEXT,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_bookings_created_at     ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_type           ON public.bookings(type);
CREATE INDEX IF NOT EXISTS idx_bookings_status         ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_is_archived    ON public.bookings(is_archived);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_at ON public.bookings(appointment_at);

-- -----------------------------------------------------------------------------
-- settings — the legacy Cloudinary credential table
-- -----------------------------------------------------------------------------
-- ⚠️  `api_secret` is a live Cloudinary credential and was anon-readable until
--     007. It must be rotated and moved to a server-side environment variable;
--     010 retires this table. See ROADMAP Phase 0.2.
CREATE TABLE IF NOT EXISTS public.settings (
  id            SERIAL PRIMARY KEY,
  cloud_name    VARCHAR(100) NOT NULL,
  api_key       VARCHAR(100) NOT NULL,
  api_secret    VARCHAR(100) NOT NULL,
  upload_preset VARCHAR(100),
  secure        BOOLEAN   DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- DRIFT CHECK — re-run whenever production changes
-- =============================================================================
--
--   SELECT table_name, column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name IN ('properties','bookings','settings')
--   ORDER BY table_name, ordinal_position;
--
-- Compare against this file. A baseline that has drifted is worse than no
-- baseline, because it is trusted.
-- =============================================================================
