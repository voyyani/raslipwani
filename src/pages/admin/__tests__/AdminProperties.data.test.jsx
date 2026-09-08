import { readFileSync } from 'node:fs';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '../../../test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import AdminProperties from '../AdminProperties';
import { queryKeys } from '@/services/queryKeys';
import { deleteProperty } from '@/services/properties';

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
  // Resolves with the unsubscribe: the client is fetched on demand (Task 29).
  subscribeToSettings: vi.fn(async () => () => {}),
}));

describe('AdminProperties data access', () => {
  const source = () => readFileSync('src/pages/admin/AdminProperties.jsx', 'utf8');
  // Task 22 split the screen into src/pages/admin/properties/*; the
  // Cloudinary read now lives in PropertyFormModal, which owns the create/
  // edit mutation and the upload it feeds. The invariant this file checks —
  // no direct admin_settings read, one settings-service call — still has to
  // hold, just possibly in a different module of the same feature.
  const featureSource = () =>
    [
      source(),
      readFileSync('src/pages/admin/properties/PropertyFormModal.jsx', 'utf8'),
    ].join('\n');

  it('does not import the Supabase client', () => {
    expect(source()).not.toMatch(/supabaseClient/);
  });

  it('reads the Cloudinary config through the settings service', () => {
    // This screen used to select from admin_settings itself, which is how a
    // second copy of the "which columns are safe to read" decision came to
    // exist. There is one now, in settings.js, and it names two columns.
    expect(featureSource()).toMatch(/settingsQueries\.cloudinary/);
    expect(featureSource()).not.toMatch(/from\('admin_settings'\)/);
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

  it('gates the table while a delete is in flight, so a second click cannot hit it', async () => {
    // Regression pin: Task 22's first pass dropped the pre-existing
    // `loading = isPageLoading || isSubmitting` gate, leaving the table (and
    // every row's Delete button) mounted and clickable for the duration of a
    // delete. A slow or double click could then fire the mutation twice.
    let resolveDelete;
    deleteProperty.mockImplementation(
      () => new Promise((resolve) => { resolveDelete = resolve; })
    );

    const user = userEvent.setup();
    render(<AdminProperties />);

    await screen.findAllByText('Gigiri Apartment');

    const deleteButton = screen.getByTitle('Delete property');
    await user.click(deleteButton);

    const dialog = await screen.findByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete property' });
    await user.click(confirmButton);

    // The delete is now in flight (deleteProperty's promise hasn't resolved).
    // The gated loading state replaces the table with a skeleton, so the row
    // — and its Delete button — is gone from the document, not merely
    // disabled: a second click has nothing to land on.
    await waitFor(() => {
      expect(screen.queryByTitle('Delete property')).not.toBeInTheDocument();
    });

    resolveDelete();

    // Once the delete settles, the gate lifts and the row (now removed from
    // the mocked data by the surrounding describe's fixture) or an empty
    // state returns — either way the page is no longer stuck loading.
    await waitFor(() => {
      expect(screen.queryByText(/^Showing \d/)).toBeInTheDocument();
    });
  });
});
