-- =============================================================================
-- 013 — property segments
--
-- UNHousing.jsx shipped a literal `unProperties` array: three listings with
-- Unsplash photographs, invented prices and availability dates in the past.
-- ROADMAP.md Block 3.4 calls that a known temporary defect; this is the schema
-- that closes it, so the admin CRM manages UN inventory like any other listing.
--
-- A column, not a table. UN housing is a property with an audience, and every
-- query, policy, admin screen and index that already exists for `properties`
-- applies to it unchanged. A parallel table would have needed all of them again.
--
-- Additive and idempotent, like every migration here: applying it twice does
-- nothing the second time, and it drops nothing.
-- =============================================================================

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS segment TEXT;

-- NULL means "an ordinary listing", which is what every existing row is. The
-- constraint names the vocabulary so a typo becomes an error at write time
-- rather than an empty page at read time.
ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_segment_check;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_segment_check
  CHECK (segment IS NULL OR segment IN ('un-diplomatic', 'corporate', 'student'));

-- Every load of the UN housing page filters on this. Partial, because the
-- overwhelming majority of rows are NULL and an index over them buys nothing.
CREATE INDEX IF NOT EXISTS idx_properties_segment
  ON public.properties(segment)
  WHERE segment IS NOT NULL;

COMMENT ON COLUMN public.properties.segment IS
  'Audience this listing is marketed to. NULL for the general market. Set by the admin CRM; read by the segment pages under /international.';

-- No policy changes. A segmented row is a property: it is read by whatever
-- policy 009 already installed for public reads and written by whatever policy
-- governs admin writes. Adding a policy here would be adding a second answer to
-- a question that already has one.
