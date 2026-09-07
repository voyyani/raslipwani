import { readFileSync } from 'node:fs';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/utils/renderWithProviders';
import AdminProperties from '../AdminProperties';
import { queryKeys } from '@/services/queryKeys';

const row = {
  id: 7,
  title: 'Gigiri Apartment',
  location: 'Gigiri',
  price: 100,
  status: 'available',
  purpose: 'sale',
  property_type: 'residential',
  featured: false,
  images: [],
  amenities: [],
};

vi.mock('@/services/properties', () => ({
  propertyQueries: {
    page: vi.fn((params = {}) => ({
      queryKey: ['properties', 'page', params],
      queryFn: () => Promise.resolve({ rows: [row], count: 47 }),
    })),
  },
  createProperty: vi.fn(),
  updateProperty: vi.fn(),
  deleteProperty: vi.fn(),
  setFeatured: vi.fn(),
}));

vi.mock('@/services/settings', () => ({
  settingsQueries: {
    cloudinary: vi.fn(() => ({
      queryKey: ['settings', 'cloudinary'],
      queryFn: () => Promise.resolve({ cloud_name: 'demo', upload_preset: 'preset' }),
    })),
  },
  // renderWithProviders wraps every page in SettingsProvider, which now reads
  // through this same module — not because this test cares about it, but
  // because a module-level vi.mock replaces the whole module for every
  // component rendered in this file.
  getSettingsRow: vi.fn().mockResolvedValue(null),
  subscribeToSettings: vi.fn(() => () => {}),
}));

describe('AdminProperties data access', () => {
  const source = () => readFileSync('src/pages/admin/AdminProperties.jsx', 'utf8');

  it('does not import the Supabase client', () => {
    expect(source()).not.toMatch(/supabaseClient/);
  });

  it('reads the Cloudinary config through the settings service', () => {
    // This screen used to select from admin_settings itself, which is how a
    // second copy of the "which columns are safe to read" decision came to
    // exist. There is one now, in settings.js, and it names two columns.
    expect(source()).toMatch(/settingsQueries\.cloudinary/);
    expect(source()).not.toMatch(/from\('admin_settings'\)/);
  });

  it('invalidates the properties domain after a write', () => {
    expect(source()).toMatch(/queryKeys\.properties\.all/);
    expect(source()).not.toMatch(/queryKey:\s*\[\s*['"]featured-properties/);
  });
});

describe('AdminProperties rendering', () => {
  it('renders the page the service returns and the count-derived pagination summary', async () => {
    render(<AdminProperties />);

    expect((await screen.findAllByText('Gigiri Apartment')).length).toBeGreaterThan(0);
    // 47 rows at the admin table's page size (20) means "Showing 1 to 20 of 47" —
    // if the component still did its own range() arithmetic instead of trusting
    // propertyQueries.page's count, this would drift.
    expect(await screen.findByText(/Showing 1 to 20 of 47/)).toBeInTheDocument();
  });

  it('uses the properties root key so a save invalidates the whole domain', () => {
    expect(queryKeys.properties.all).toEqual(['properties']);
  });
});
