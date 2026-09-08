-- =============================================================================
-- Seed: UN and diplomatic inventory
--
-- This is a SEED, not a migration. It is applied by hand, once, and it exists
-- so the page has something real to render on the day the column ships.
--
-- The three rows below are transcribed from the hardcoded array in
-- UNHousing.jsx, MINUS everything that was invented: no Unsplash URLs, no
-- availability dates. Prices are carried across as they were and are marked for
-- the owner to confirm — a price nobody has verified is worse in a database
-- than in a component, because in a database it looks authoritative.
--
--   TODO(owner): confirm each price and add real photographs through the admin
--   CRM before the UN housing page is linked from the navigation.
--
-- Two transcription notes, both deliberate:
--
--   * `bathrooms` is INTEGER in the live schema and the array had 2.5 for the
--     townhouse. It is written as 2 here. That is a real loss of information;
--     the right fix is a numeric column, which is a schema change belonging to
--     whoever needs half-bathrooms across the whole table, not to this seed.
--   * `size` in the array was square METRES (150, 280, 180); `area_sqft` is
--     square feet. The values below are converted (x10.764). Getting this wrong
--     would advertise a 150-square-foot executive apartment.
-- =============================================================================

INSERT INTO public.properties
  (title, description, price, property_type, purpose, status, segment,
   location, address, city, bedrooms, bathrooms, area_sqft, amenities, images)
VALUES
  ('Executive Apartment - Gigiri',
   'Furnished executive apartment 500m from the UN complex. 24/7 armed security, two parking bays. Minimum six-month lease. Suited to UN staff, diplomats and international NGOs.',
   2500, 'apartment', 'rent', 'available', 'un-diplomatic',
   'Gigiri', '500m from UN Complex, Gigiri', 'Nairobi',
   3, 2, 1615,
   ARRAY['High-speed Internet', 'Generator Backup', 'Water Backup', 'DSTV', 'Gym', 'Swimming Pool'],
   ARRAY[]::TEXT[]),

  ('Luxury Villa - Runda',
   'Furnished villa in a gated Runda community, 3km from the UN complex. 24/7 security, three parking bays, staff quarters. Minimum twelve-month lease. Suited to senior UN officials and ambassadors.',
   4500, 'villa', 'rent', 'available', 'un-diplomatic',
   'Runda', 'Runda Estate, 3km from UN', 'Nairobi',
   4, 3, 3014,
   ARRAY['High-speed Internet', 'Generator', 'Water Backup', 'Garden', 'Staff Quarters', 'Swimming Pool'],
   ARRAY[]::TEXT[]),

  ('Modern Townhouse - Rosslyn',
   'Furnished townhouse in Rosslyn Valley, 4km from the UN complex. Perimeter wall and security guard, two parking bays. Flexible three-to-twelve-month lease. Suited to UN consultants and international professionals.',
   1800, 'townhouse', 'rent', 'available', 'un-diplomatic',
   'Rosslyn', 'Rosslyn Valley, 4km from UN', 'Nairobi',
   3, 2, 1938,
   ARRAY['High-speed Internet', 'Generator', 'DSTV', 'Modern Kitchen', 'Balcony'],
   ARRAY[]::TEXT[]);
