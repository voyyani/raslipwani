# International Market Database Schema

## Overview
Database schema extensions to support international clients, diaspora investors, UN staff, and foreign professionals.

## New Tables

### 1. International Clients Table
```sql
CREATE TABLE international_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Reference to main clients table
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- International specific info
  citizenship VARCHAR(100),
  residence_country VARCHAR(100),
  passport_number VARCHAR(50),
  visa_type VARCHAR(50), -- Tourist, Work Permit, Diplomatic, etc.
  visa_expiry DATE,
  
  -- UN/Diplomatic status
  is_un_staff BOOLEAN DEFAULT FALSE,
  un_organization VARCHAR(100), -- UNEP, UNDP, WHO, etc.
  un_contract_type VARCHAR(50), -- Staff, Consultant, Intern
  un_contract_end DATE,
  is_diplomat BOOLEAN DEFAULT FALSE,
  diplomatic_status VARCHAR(100),
  
  -- Diaspora info
  is_diaspora BOOLEAN DEFAULT FALSE,
  diaspora_country VARCHAR(100),
  diaspora_community VARCHAR(100),
  plans_to_relocate BOOLEAN DEFAULT FALSE,
  relocation_timeline VARCHAR(50),
  
  -- Financial preferences
  preferred_currency VARCHAR(3) DEFAULT 'USD', -- USD, EUR, GBP, KES
  payment_method VARCHAR(50), -- Wire Transfer, International CC, Mobile Money
  bank_country VARCHAR(100),
  
  -- Investment interests
  is_investor BOOLEAN DEFAULT FALSE,
  investment_budget_min DECIMAL(15, 2),
  investment_budget_max DECIMAL(15, 2),
  investment_type VARCHAR(50), -- Rental Income, Capital Appreciation, Both
  roi_expectation DECIMAL(5, 2), -- Expected ROI percentage
  
  -- Remote management needs
  needs_property_management BOOLEAN DEFAULT FALSE,
  management_level VARCHAR(50), -- Full, Partial, Consultation Only
  
  -- Communication preferences
  preferred_language VARCHAR(50) DEFAULT 'English',
  time_zone VARCHAR(50),
  contact_via VARCHAR(50), -- Email, WhatsApp, Video Call, etc.
  
  -- Additional notes
  special_requirements TEXT,
  notes TEXT
);

-- Indexes
CREATE INDEX idx_intl_clients_client_id ON international_clients(client_id);
CREATE INDEX idx_intl_clients_un_staff ON international_clients(is_un_staff) WHERE is_un_staff = TRUE;
CREATE INDEX idx_intl_clients_diplomat ON international_clients(is_diplomat) WHERE is_diplomat = TRUE;
CREATE INDEX idx_intl_clients_diaspora ON international_clients(is_diaspora) WHERE is_diaspora = TRUE;
CREATE INDEX idx_intl_clients_investor ON international_clients(is_investor) WHERE is_investor = TRUE;
CREATE INDEX idx_intl_clients_currency ON international_clients(preferred_currency);
```

### 2. UN Properties Table
```sql
CREATE TABLE un_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Reference to main properties table
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  -- UN proximity info
  distance_to_un_complex INTEGER, -- in meters
  distance_to_un_gigiri INTEGER,
  distance_to_un_unon INTEGER,
  
  -- UN suitability
  suitable_for_un_staff BOOLEAN DEFAULT TRUE,
  suitable_for_diplomats BOOLEAN DEFAULT FALSE,
  security_level VARCHAR(50), -- Basic, Enhanced, Diplomatic Level
  
  -- Features important for UN staff
  has_generator BOOLEAN DEFAULT FALSE,
  has_water_backup BOOLEAN DEFAULT FALSE,
  has_high_speed_internet BOOLEAN DEFAULT FALSE,
  internet_speed VARCHAR(50), -- e.g., "100 Mbps"
  is_furnished BOOLEAN DEFAULT FALSE,
  furnishing_level VARCHAR(50), -- Basic, Standard, Executive, Luxury
  
  -- Lease terms
  accepts_short_term BOOLEAN DEFAULT FALSE, -- Less than 6 months
  minimum_lease_months INTEGER DEFAULT 6,
  accepts_corporate_lease BOOLEAN DEFAULT TRUE,
  accepts_diplomatic_lease BOOLEAN DEFAULT FALSE,
  
  -- Pricing
  diplomatic_discount_percent DECIMAL(5, 2),
  long_term_discount_percent DECIMAL(5, 2),
  
  -- Languages supported
  agent_speaks_english BOOLEAN DEFAULT TRUE,
  agent_speaks_french BOOLEAN DEFAULT FALSE,
  agent_speaks_spanish BOOLEAN DEFAULT FALSE,
  
  UNIQUE(property_id)
);

CREATE INDEX idx_un_props_property_id ON un_properties(property_id);
CREATE INDEX idx_un_props_distance ON un_properties(distance_to_un_complex);
CREATE INDEX idx_un_props_suitable ON un_properties(suitable_for_un_staff) WHERE suitable_for_un_staff = TRUE;
```

### 3. Investment Properties Table
```sql
CREATE TABLE investment_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Reference to main properties table
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Investment metrics
  purchase_price DECIMAL(15, 2),
  current_market_value DECIMAL(15, 2),
  estimated_rental_income_monthly DECIMAL(15, 2),
  actual_rental_income_monthly DECIMAL(15, 2),
  annual_appreciation_rate DECIMAL(5, 2),
  
  -- ROI calculations
  rental_yield DECIMAL(5, 2), -- Annual rental income / property value
  total_roi DECIMAL(5, 2), -- Including appreciation
  cash_on_cash_return DECIMAL(5, 2),
  
  -- Expenses
  annual_property_tax DECIMAL(15, 2),
  annual_insurance DECIMAL(15, 2),
  annual_maintenance DECIMAL(15, 2),
  management_fee_percent DECIMAL(5, 2) DEFAULT 10,
  
  -- Occupancy
  occupancy_rate DECIMAL(5, 2) DEFAULT 100,
  average_vacancy_days INTEGER DEFAULT 0,
  
  -- Tenant info
  current_tenant_type VARCHAR(50), -- UN Staff, Diplomat, Corporate, Individual
  lease_start_date DATE,
  lease_end_date DATE,
  
  -- Investment flags
  is_performing BOOLEAN DEFAULT TRUE,
  performance_notes TEXT,
  
  -- Ownership
  owner_client_id UUID REFERENCES clients(id),
  ownership_structure VARCHAR(50), -- Individual, Joint, Corporate
  
  -- Management
  under_property_management BOOLEAN DEFAULT FALSE,
  management_start_date DATE,
  
  UNIQUE(property_id)
);

CREATE INDEX idx_inv_props_property_id ON investment_properties(property_id);
CREATE INDEX idx_inv_props_owner ON investment_properties(owner_client_id);
CREATE INDEX idx_inv_props_roi ON investment_properties(total_roi DESC);
CREATE INDEX idx_inv_props_performing ON investment_properties(is_performing);
```

### 4. Remote Property Management Table
```sql
CREATE TABLE remote_property_management (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  owner_client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Management details
  management_type VARCHAR(50), -- Full, Rent Collection Only, Maintenance Only
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Fee structure
  monthly_fee DECIMAL(15, 2),
  commission_percent DECIMAL(5, 2),
  additional_charges TEXT,
  
  -- Services included
  includes_rent_collection BOOLEAN DEFAULT TRUE,
  includes_tenant_screening BOOLEAN DEFAULT TRUE,
  includes_maintenance BOOLEAN DEFAULT TRUE,
  includes_inspections BOOLEAN DEFAULT TRUE,
  includes_financial_reporting BOOLEAN DEFAULT TRUE,
  inspection_frequency VARCHAR(50), -- Monthly, Quarterly, Bi-annual
  
  -- Communication
  owner_receives_monthly_report BOOLEAN DEFAULT TRUE,
  owner_receives_photos BOOLEAN DEFAULT TRUE,
  owner_receives_video_updates BOOLEAN DEFAULT FALSE,
  
  -- Emergency protocols
  emergency_repair_limit DECIMAL(15, 2), -- Auto-approve up to this amount
  requires_owner_approval_above DECIMAL(15, 2),
  emergency_contact_method VARCHAR(50),
  
  -- Payment to owner
  payment_day_of_month INTEGER DEFAULT 5,
  payment_method VARCHAR(50), -- Wire Transfer, PayPal, Wise, etc.
  payment_currency VARCHAR(3) DEFAULT 'USD',
  
  UNIQUE(property_id)
);

CREATE INDEX idx_remote_mgmt_property ON remote_property_management(property_id);
CREATE INDEX idx_remote_mgmt_owner ON remote_property_management(owner_client_id);
CREATE INDEX idx_remote_mgmt_active ON remote_property_management(is_active) WHERE is_active = TRUE;
```

### 5. Currency Exchange Rates Table
```sql
CREATE TABLE currency_exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Exchange rate info
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15, 6) NOT NULL,
  
  -- Metadata
  source VARCHAR(50), -- Manual, API, Bank Rate
  effective_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT TRUE,
  
  -- Notes
  notes TEXT
);

CREATE INDEX idx_currency_from_to ON currency_exchange_rates(from_currency, to_currency, effective_date DESC);
CREATE INDEX idx_currency_current ON currency_exchange_rates(is_current) WHERE is_current = TRUE;

-- Default currency rates
INSERT INTO currency_exchange_rates (from_currency, to_currency, rate, source, effective_date) VALUES
('USD', 'USD', 1.000000, 'Manual', CURRENT_DATE),
('USD', 'KES', 129.500000, 'Manual', CURRENT_DATE),
('USD', 'EUR', 0.920000, 'Manual', CURRENT_DATE),
('USD', 'GBP', 0.790000, 'Manual', CURRENT_DATE);
```

### 6. Virtual Tours Table
```sql
CREATE TABLE virtual_tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Tour media
  video_url TEXT,
  video_platform VARCHAR(50), -- YouTube, Vimeo, Custom
  tour_360_url TEXT,
  matterport_url TEXT,
  
  -- Tour details
  duration_seconds INTEGER,
  has_narration BOOLEAN DEFAULT FALSE,
  narration_language VARCHAR(50),
  
  -- Availability
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_virtual_tours_property ON virtual_tours(property_id);
CREATE INDEX idx_virtual_tours_active ON virtual_tours(is_active) WHERE is_active = TRUE;
```

## Modifications to Existing Tables

### Properties Table Additions
```sql
ALTER TABLE properties 
ADD COLUMN is_international_listing BOOLEAN DEFAULT FALSE,
ADD COLUMN un_proximity_meters INTEGER,
ADD COLUMN accepts_foreign_currency BOOLEAN DEFAULT FALSE,
ADD COLUMN furnishing_status VARCHAR(50), -- Unfurnished, Partially, Fully
ADD COLUMN diplomatic_approved BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_properties_international ON properties(is_international_listing) WHERE is_international_listing = TRUE;
CREATE INDEX idx_properties_un_proximity ON properties(un_proximity_meters) WHERE un_proximity_meters IS NOT NULL;
```

### Bookings Table Additions
```sql
ALTER TABLE bookings 
ADD COLUMN is_international_client BOOLEAN DEFAULT FALSE,
ADD COLUMN tour_type VARCHAR(50), -- In-Person, Virtual, Phone
ADD COLUMN requires_translation BOOLEAN DEFAULT FALSE,
ADD COLUMN preferred_language VARCHAR(50);
```

## Views for Common Queries

### UN Properties View
```sql
CREATE VIEW vw_un_properties AS
SELECT 
  p.*,
  up.distance_to_un_complex,
  up.security_level,
  up.is_furnished,
  up.minimum_lease_months,
  up.accepts_corporate_lease
FROM properties p
INNER JOIN un_properties up ON p.id = up.property_id
WHERE p.status = 'available'
  AND up.suitable_for_un_staff = TRUE
ORDER BY up.distance_to_un_complex ASC;
```

### Investment Portfolio View
```sql
CREATE VIEW vw_investment_portfolio AS
SELECT 
  c.first_name,
  c.last_name,
  ic.preferred_currency,
  p.address,
  p.price,
  ip.current_market_value,
  ip.actual_rental_income_monthly,
  ip.rental_yield,
  ip.total_roi,
  ip.occupancy_rate,
  ip.is_performing
FROM clients c
INNER JOIN international_clients ic ON c.id = ic.client_id
INNER JOIN investment_properties ip ON c.id = ip.owner_client_id
INNER JOIN properties p ON ip.property_id = p.id
WHERE ic.is_investor = TRUE;
```

## Functions

### Calculate Property ROI
```sql
CREATE OR REPLACE FUNCTION calculate_property_roi(
  p_property_id UUID
) RETURNS TABLE (
  rental_yield DECIMAL,
  total_roi DECIMAL,
  cash_on_cash DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (ip.actual_rental_income_monthly * 12 / ip.current_market_value * 100)::DECIMAL as rental_yield,
    ((ip.actual_rental_income_monthly * 12 + 
      (ip.current_market_value - ip.purchase_price)) / 
      ip.purchase_price * 100)::DECIMAL as total_roi,
    (ip.actual_rental_income_monthly * 12 / 
      (ip.purchase_price * 0.3) * 100)::DECIMAL as cash_on_cash
  FROM investment_properties ip
  WHERE ip.property_id = p_property_id;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS) Policies

### International Clients - Owners can view their own data
```sql
ALTER TABLE international_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own international data"
  ON international_clients
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE email = current_user_email()
    )
  );
```

### Investment Properties - Owners can view their own investments
```sql
ALTER TABLE investment_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own investments"
  ON investment_properties
  FOR SELECT
  USING (
    owner_client_id IN (
      SELECT id FROM clients WHERE email = current_user_email()
    )
  );
```

## Migration Script

```sql
-- Run this script to add international features to existing database
BEGIN;

-- Create new tables
-- (Include all CREATE TABLE statements from above)

-- Modify existing tables
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS is_international_listing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS un_proximity_meters INTEGER,
ADD COLUMN IF NOT EXISTS accepts_foreign_currency BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS furnishing_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS diplomatic_approved BOOLEAN DEFAULT FALSE;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS is_international_client BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tour_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS requires_translation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(50);

-- Create views
-- (Include all CREATE VIEW statements from above)

-- Insert default data
-- (Include currency rates, etc.)

COMMIT;
```

## Notes

1. **Currency Management**: Exchange rates should be updated regularly via API or manual entry
2. **Performance**: Indexes are created on frequently queried columns
3. **Security**: RLS policies ensure data privacy for international clients
4. **Scalability**: Schema supports thousands of international clients and properties
5. **Compliance**: Store visa and passport data securely, comply with GDPR/data protection laws
6. **Reporting**: Views provide quick access to common dashboards and reports

## API Integration Points

Consider integrating with:
- **Exchange Rate APIs**: OpenExchangeRates, Fixer.io
- **Payment Gateways**: Stripe, PayPal, Wise (TransferWise)
- **Video Platforms**: YouTube API, Vimeo API for virtual tours
- **Communication**: Twilio for international SMS, WhatsApp Business API

---

**Last Updated**: January 18, 2026
**Version**: 1.0
