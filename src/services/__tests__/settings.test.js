import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/utils/supabaseClient';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import {
  getSettingsByCategory, getCloudinaryConfig, saveSettings,
  listEmailTemplates, subscribeToSettings, settingsQueries, getSettingsRow,
} from '../settings';
import { STALE_TIME } from '../cachePolicy';

beforeEach(() => vi.clearAllMocks());

describe('getSettingsByCategory', () => {
  it('filters on setting_category', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: [], error: null } });
    await getSettingsByCategory('email');
    expect(builders.admin_settings.eq).toHaveBeenCalledWith('setting_category', 'email');
  });
});

describe('getCloudinaryConfig', () => {
  it('selects only the two public fields, never a secret', async () => {
    // The 2026-09-01 incident was a Cloudinary API secret readable by anon.
    // `select('*')` here would put it back on the wire.
    const builders = mockFrom(supabase, {
      admin_settings: { data: { cloud_name: 'x', upload_preset: 'y' }, error: null },
    });
    await getCloudinaryConfig();
    expect(builders.admin_settings.select).toHaveBeenCalledWith('cloud_name, upload_preset');
  });

  it('returns null rather than throwing when no row exists yet', async () => {
    mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await expect(getCloudinaryConfig()).resolves.toBeNull();
  });
});

describe('saveSettings', () => {
  it('updates the existing row when one exists', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: { id: 3 }, error: null } });
    await saveSettings({ site_name: 'Raslipwani' }, { category: 'general' });
    expect(builders.admin_settings.update).toHaveBeenCalled();
    expect(builders.admin_settings.eq).toHaveBeenCalledWith('id', 3);
    expect(builders.admin_settings.insert).not.toHaveBeenCalled();
  });

  it('inserts when the category has no row yet', async () => {
    // `maybeSingle` resolving to null data is "no row", not an error — which is
    // the case two of the six settings screens got wrong, each in its own way.
    const builders = mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await saveSettings({ site_name: 'Raslipwani' }, { category: 'general' });
    expect(builders.admin_settings.insert).toHaveBeenCalled();
  });

  it('stamps the category on the written row', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await saveSettings({ site_name: 'R' }, { category: 'general' });
    const [payload] = builders.admin_settings.insert.mock.calls[0];
    expect(payload.setting_category).toBe('general');
  });
});

describe('listEmailTemplates', () => {
  it('returns only active templates', async () => {
    const builders = mockFrom(supabase, { email_templates: { data: [], error: null } });
    await listEmailTemplates();
    expect(builders.email_templates.eq).toHaveBeenCalledWith('is_active', true);
  });
});

describe('subscribeToSettings', () => {
  it('opens a channel and hands back a working unsubscribe', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSettings(onChange);
    expect(supabase.channel).toHaveBeenCalled();
    unsubscribe();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});

describe('settingsQueries', () => {
  it('caches settings with the static lifetime', () => {
    expect(settingsQueries.general().staleTime).toBe(STALE_TIME.static);
  });
});

describe('getSettingsRow', () => {
  // Two of the six settings screens — BusinessHoursSettings.jsx and
  // CloudinarySettings.jsx — query admin_settings today with no category
  // filter at all. Guessing a category for them in the migration would
  // silently repoint an admin's saved configuration to a different row, so
  // this is the honest, uncategorised read Task 16 uses for those two
  // screens until someone reads the live table.
  it('selects everything with no category filter', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: { id: 1 }, error: null } });
    await getSettingsRow();
    expect(builders.admin_settings.select).toHaveBeenCalledWith('*');
    expect(builders.admin_settings.eq).not.toHaveBeenCalled();
  });

  it('returns null rather than throwing when no row exists', async () => {
    mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await expect(getSettingsRow()).resolves.toBeNull();
  });
});
