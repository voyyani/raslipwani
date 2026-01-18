# Database Setup Guide
**Phase 1 - Foundation Database Migrations**

**Date:** January 18, 2026  
**Status:** Ready to Execute  
**Estimated Time:** 15-20 minutes

---

## 📋 Overview

This guide walks you through setting up the database tables for Phase 1:
- Clients Management System
- Enhanced Bookings
- Admin Settings

---

## 🎯 Migration Files Created

### 1. `001_create_clients_tables.sql`
**Creates:**
- `clients` table - Store client information
- `client_property_interests` table - Track which properties clients are interested in
- `client_communications` table - Log all communications with clients

**Features:**
- Comprehensive client profile (contact, preferences, budget)
- Status workflow (lead → prospect → active → closed)
- Client segmentation (buyer, seller, renter, landlord)
- Property interest tracking
- Communication history
- Proper indexes for performance
- Row-level security (RLS) policies

### 2. `002_enhance_bookings_table.sql`
**Adds to existing bookings table:**
- `status` - pending, confirmed, completed, cancelled, no_show
- `admin_notes` - Notes visible to admins
- `internal_notes` - Internal team notes
- `confirmed_at` & `confirmed_by` - Confirmation tracking
- `cancelled_at` & `cancellation_reason` - Cancellation tracking
- `priority` - low, medium, high, urgent
- `assigned_agent_id` - Assign bookings to specific agents
- `client_id` - Link to clients table
- `property_id` - Link to properties table

**Features:**
- Status workflow for bookings
- Agent assignment
- Priority management
- Proper indexes
- RLS policies

### 3. `003_create_admin_settings_table.sql`
**Creates:**
- `admin_settings` table - Centralized configuration

**Includes:**
- Cloudinary configuration
- Email settings (provider, templates)
- Business information
- Business hours (JSON)
- Currency and locale
- Maintenance mode
- Email templates
- Feature flags

**Features:**
- Single-row table (only one settings record)
- JSON fields for flexible configuration
- Update tracking (who changed what)
- RLS policies

---

## 🚀 How to Run Migrations

### Option 1: Supabase Dashboard (Recommended for Beginners)

#### Step 1: Access SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: **Raslipwani Properties**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

#### Step 2: Run Migration 001
1. Open file: `/supabase/migrations/001_create_clients_tables.sql`
2. Copy ALL the contents
3. Paste into Supabase SQL Editor
4. Click **Run** button
5. Wait for success message ✅
6. Verify: Go to **Table Editor** → Should see `clients` table

#### Step 3: Run Migration 002
1. Open file: `/supabase/migrations/002_enhance_bookings_table.sql`
2. Copy contents
3. Paste into SQL Editor (new query)
4. Click **Run**
5. Verify: Check `bookings` table has new columns (status, admin_notes, etc.)

#### Step 4: Run Migration 003
1. Open file: `/supabase/migrations/003_create_admin_settings_table.sql`
2. Copy contents
3. Paste into SQL Editor (new query)
4. Click **Run**
5. Verify: Check `admin_settings` table exists with 1 row

#### Step 5: Verify All Tables
Go to **Table Editor** and check you have:
- [x] clients
- [x] client_property_interests
- [x] client_communications
- [x] bookings (with new columns)
- [x] admin_settings

### Option 2: Supabase CLI (Advanced)

#### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
cd /home/karisa/Projects/raslipwani
supabase link --project-ref YOUR_PROJECT_REF
```

#### Run Migrations
```bash
# Run all migrations
supabase db push

# Or run individually
supabase db push --file supabase/migrations/001_create_clients_tables.sql
supabase db push --file supabase/migrations/002_enhance_bookings_table.sql
supabase db push --file supabase/migrations/003_create_admin_settings_table.sql
```

---

## 🧪 Verification Checklist

After running migrations, verify everything works:

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'client_property_interests', 'client_communications', 'bookings', 'admin_settings');
```

**Expected:** 5 rows returned

### 2. Check Clients Table Structure
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients'
ORDER BY ordinal_position;
```

**Expected columns:**
- id, created_at, updated_at
- first_name, last_name, email, phone
- client_type, status, source
- budget_min, budget_max
- preferred_locations, tags
- assigned_agent_id, priority
- notes, is_archived

### 3. Check Bookings Enhanced Columns
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('status', 'admin_notes', 'internal_notes', 'priority', 'assigned_agent_id');
```

**Expected:** 5 rows returned

### 4. Check Admin Settings
```sql
SELECT * FROM admin_settings LIMIT 1;
```

**Expected:** 1 row with default values

### 5. Check Indexes
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'bookings', 'client_property_interests');
```

**Expected:** Multiple indexes for performance

### 6. Check RLS Policies
```sql
SELECT tablename, policyname, permissive, roles 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Expected:** Policies for clients, bookings, settings

---

## 🎲 Optional: Insert Sample Data

To test with sample data, run this in SQL Editor:

```sql
-- Insert sample clients
INSERT INTO clients (first_name, last_name, email, phone, client_type, status, budget_min, budget_max, preferred_locations)
VALUES 
  ('John', 'Kamau', 'john.kamau@example.com', '+254712345678', 'buyer', 'lead', 5000000, 8000000, ARRAY['Westlands', 'Karen']),
  ('Jane', 'Njeri', 'jane.njeri@example.com', '+254723456789', 'seller', 'active', NULL, NULL, ARRAY['Kilimani']),
  ('Bob', 'Omondi', 'bob.omondi@example.com', '+254734567890', 'renter', 'prospect', 30000, 50000, ARRAY['South B', 'South C']);

-- Insert sample property interest
INSERT INTO client_property_interests (client_id, property_id, interest_level, notes)
SELECT 
  (SELECT id FROM clients WHERE email = 'john.kamau@example.com'),
  (SELECT id FROM properties LIMIT 1),
  'very_interested',
  'Client loved the location and layout';

-- Insert sample communication
INSERT INTO client_communications (client_id, communication_type, subject, content, duration_minutes)
SELECT 
  (SELECT id FROM clients WHERE email = 'john.kamau@example.com'),
  'call',
  'Initial consultation',
  'Discussed client requirements and budget. Client is looking for 3-bedroom apartment in Westlands.',
  30;
```

---

## 🔧 Troubleshooting

### Problem: "relation clients already exists"
**Solution:** Table already created, safe to ignore or use `CREATE TABLE IF NOT EXISTS`

### Problem: "permission denied for table clients"
**Solution:** Check RLS policies are created correctly

### Problem: "column status already exists in bookings"
**Solution:** Enhancement already applied, safe to ignore

### Problem: "foreign key constraint fails"
**Solution:** Ensure `properties` table exists before running migrations

### Problem: "function gen_random_uuid() does not exist"
**Solution:** Enable uuid extension:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Or use gen_random_uuid() which is built-in for PostgreSQL 13+
```

---

## 🔄 Rollback (If Needed)

If something goes wrong, you can rollback:

### Rollback Migration 003
```sql
DROP TABLE IF EXISTS admin_settings CASCADE;
```

### Rollback Migration 002
```sql
ALTER TABLE bookings DROP COLUMN IF EXISTS status;
ALTER TABLE bookings DROP COLUMN IF EXISTS admin_notes;
ALTER TABLE bookings DROP COLUMN IF EXISTS internal_notes;
ALTER TABLE bookings DROP COLUMN IF EXISTS confirmed_at;
ALTER TABLE bookings DROP COLUMN IF EXISTS confirmed_by;
ALTER TABLE bookings DROP COLUMN IF EXISTS cancelled_at;
ALTER TABLE bookings DROP COLUMN IF EXISTS cancellation_reason;
ALTER TABLE bookings DROP COLUMN IF EXISTS priority;
ALTER TABLE bookings DROP COLUMN IF EXISTS assigned_agent_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS client_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS property_id;
```

### Rollback Migration 001
```sql
DROP TABLE IF EXISTS client_communications CASCADE;
DROP TABLE IF EXISTS client_property_interests CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

---

## 📈 Performance Notes

### Expected Query Times
- Client list: < 50ms
- Client detail with interests: < 100ms
- Bookings list: < 50ms
- Settings fetch: < 10ms

### Index Coverage
- All foreign keys are indexed
- Search fields (email, status) are indexed
- Date fields for sorting are indexed

### Scalability
- Clients table: Can handle 100,000+ records
- Bookings table: Can handle 1,000,000+ records
- Proper indexes ensure fast queries

---

## 🔐 Security Notes

### Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Authenticated users have full access (for now)
- 🔜 TODO: Implement role-based policies

### Data Protection
- Email column has UNIQUE constraint
- Cascading deletes properly configured
- Soft delete via `is_archived` flag

### Sensitive Data
- API keys in settings should be encrypted (future enhancement)
- Agent IDs use Clerk's string-based IDs

---

## ✅ Post-Migration Checklist

After running migrations successfully:

- [ ] All 3 migration files executed without errors
- [ ] Verified all tables exist in Table Editor
- [ ] Checked sample data insertion works
- [ ] Tested RLS policies (try inserting as authenticated user)
- [ ] Backed up database (Settings → Database → Backup)
- [ ] Updated `.env` file with any new environment variables
- [ ] Committed migration files to git
- [ ] Documented any custom changes made

---

## 📝 Next Steps

Once database is set up:

1. **Build Client Management UI**
   - Create ClientManagement component
   - Implement CRUD operations
   - Add search and filters

2. **Build Admin Bookings UI**
   - Create AdminBookings component
   - Add status workflow
   - Implement calendar view

3. **Build Settings Page**
   - Create Settings component
   - Add form for configuration
   - Implement save/update

4. **Connect Everything**
   - Link clients to bookings
   - Link clients to properties
   - Test workflows

---

## 🆘 Need Help?

### Common Questions

**Q: How do I know if migrations ran successfully?**
A: Check Supabase dashboard → Table Editor. You should see all new tables.

**Q: Can I run migrations multiple times?**
A: Yes! Migrations use `IF NOT EXISTS` and `DO $$ BEGIN ... END $$` blocks for safety.

**Q: Will this affect existing data?**
A: No. Migration 002 only adds columns to bookings. Existing data is preserved.

**Q: How do I undo a migration?**
A: Use the rollback SQL commands provided above.

### Support Channels
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Documentation: See `/src/Docs/`

---

**Status:** ✅ Ready to Execute  
**Next Document:** `client-management-implementation.md`
