# Phase 1 Quick Start Guide
**Implementation:** Admin Booking Management + Settings System  
**Date:** January 18, 2026

---

## 🚀 Getting Started in 3 Steps

### Step 1: Run Database Migrations (5 minutes)

**Important:** These migrations add required tables and columns.

1. Open your Supabase Dashboard → SQL Editor
2. Run these migrations in order:

**Migration 1: Booking Enhancements**
```bash
# Copy content from: supabase/migrations/003_enhance_bookings_admin.sql
# Paste into Supabase SQL Editor and run
```

**Migration 2: Settings System**
```bash
# Copy content from: supabase/migrations/004_create_admin_settings.sql
# Paste into Supabase SQL Editor and run
```

### Step 2: Test Booking Management (10 minutes)

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Navigate to booking management:**
   - Go to: `http://localhost:5173/admin/bookings`
   - You should see the FullCalendar interface

3. **Try these features:**
   - ✅ Switch between Day/Week/Month/List views
   - ✅ Click an event to open detail modal
   - ✅ Drag an event to a different date/time
   - ✅ Change booking status (Pending → Confirmed → Completed)
   - ✅ Add an internal note
   - ✅ Use filters (status, priority, search)
   - ✅ Export bookings to CSV

### Step 3: Test Settings System (10 minutes)

1. **Navigate to settings:**
   - Go to: `http://localhost:5173/admin/settings`
   - You should see 6 tabs

2. **Configure each module:**
   
   **General Settings:**
   - Set site name
   - Add company logo URL
   - Update contact info
   - Add social media links

   **Cloudinary Settings:**
   - Add your Cloudinary credentials
   - Test connection
   
   **Email Settings:**
   - Toggle notification preferences
   - Edit email template (try the rich text editor!)
   
   **Business Hours:**
   - Set operating hours for each day
   - Mark closed days
   
   **Localization:**
   - Select currency
   - Choose date/time format
   - See live preview
   
   **Advanced:**
   - Try maintenance mode toggle (be careful!)
   - Add analytics IDs

3. **Save and verify:**
   - Click "Save Changes" on any module
   - Check that toast notification appears
   - Refresh page to verify settings persist

---

## 🧪 Run Tests (Optional)

```bash
# Run all tests
npm test

# Open Vitest UI (recommended)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## 📱 Navigation Quick Reference

### Admin Routes
- `/admin` - Dashboard
- `/admin/properties` - Property Management
- `/admin/viewings` - Old viewing appointments
- `/admin/bookings` ⭐ NEW - Professional booking calendar
- `/admin/clients` - Client Management (Week 1)
- `/admin/clients/:id` - Client Detail
- `/admin/settings` ⭐ NEW - System configuration

---

## 🐛 Troubleshooting

### Issue: Bookings page shows empty calendar
**Solution:** Make sure bookings table has data and migrations are run

### Issue: Settings not saving
**Solution:** Check that admin_settings table exists (run migration 004)

### Issue: Drag-and-drop not working
**Solution:** Ensure FullCalendar dependencies are installed:
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list
```

### Issue: Rich text editor not showing
**Solution:** Install React Quill:
```bash
npm install react-quill
```

### Issue: Tests failing
**Solution:** Install test dependencies:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

---

## 📊 What's Working

✅ **Booking Management**
- Calendar views (all 4 types)
- Drag-and-drop rescheduling
- Status workflow
- Internal notes
- Filters and search
- Statistics dashboard
- CSV export

✅ **Settings**
- All 6 modules functional
- Email template editor
- Connection testing
- Real-time preview
- Data persistence

✅ **Testing**
- Vitest configured
- 3 test suites passing
- Mock system working
- Coverage tracking enabled

---

## ⏰ What's Next (Week 4)

- Expand test coverage to 90%
- Email sending implementation
- Performance optimization
- Production checklist
- User guide
- Video tutorials

---

## 📞 Need Help?

**Documentation:**
- [Session Plan](./sessionplan.md) - Complete implementation blueprint
- [Implementation Log](./week2-3-implementation.md) - Detailed technical docs
- [Phase Summary](./PHASE1-SUMMARY.md) - High-level overview
- [Change Log](./datalog.md) - Development activity log

**Key Features Documentation:**
- FullCalendar: https://fullcalendar.io/docs
- React Quill: https://github.com/zenoamaro/react-quill
- Vitest: https://vitest.dev/

---

**Ready to rock! Start with Step 1 above. 🚀**
