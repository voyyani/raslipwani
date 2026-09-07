import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/utils/supabaseClient';
import { mockFrom } from '@/test/utils/supabaseQueryMock';
import {
  getSettingsByCategory, getCloudinaryConfig,
  listEmailTemplates, subscribeToSettings, settingsQueries, getSettingsRow,
  saveSettingsRow, getSettingsByKeys, upsertSettingRows,
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

  it('applies no category filter, matching the screens it replaced', async () => {
    // AdminProperties.jsx and CloudinarySettings.jsx both read this row with
    // no setting_category filter. A guessed 'general' filter here silently
    // returns no row — and no Cloudinary config — if the live row's category
    // is anything else, which is exactly the bug this test pins against.
    const builders = mockFrom(supabase, {
      admin_settings: { data: { cloud_name: 'x', upload_preset: 'y' }, error: null },
    });
    await getCloudinaryConfig();
    expect(builders.admin_settings.eq).not.toHaveBeenCalled();
    expect(builders.admin_settings.limit).toHaveBeenCalledWith(1);
  });

  it('returns null rather than throwing when no row exists yet', async () => {
    mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await expect(getCloudinaryConfig()).resolves.toBeNull();
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

describe('settingsQueries freshness', () => {
  // Fix round 1: these pin each query option's staleTime/refetchOnMount so
  // they cannot silently drift back onto STALE_TIME.static (30 minutes) —
  // right for a query with one reviewed 30-minute-cache consumer
  // (`cloudinary`, shared with AdminProperties.jsx), wrong for a settings
  // screen whose job is showing what another admin just changed.

  it('category(): no staleTime override — inherits the 5-minute global default, matching the original', () => {
    expect(settingsQueries.category('email').staleTime).toBeUndefined();
  });

  it('row(): staleTime 0 and refetchOnMount "always", matching GeneralSettings.jsx\'s original', () => {
    const options = settingsQueries.row();
    expect(options.staleTime).toBe(0);
    expect(options.refetchOnMount).toBe('always');
  });

  it('keys(): no staleTime override — inherits the 5-minute global default, matching BusinessHoursSettings.jsx\'s original', () => {
    expect(settingsQueries.keys(['business_hours', 'timezone']).staleTime).toBeUndefined();
  });

  it('cloudinary(): keeps STALE_TIME.static — AdminProperties.jsx also reads through this option', () => {
    expect(settingsQueries.cloudinary().staleTime).toBe(STALE_TIME.static);
  });

  it('emailTemplates(): no staleTime override — inherits the 5-minute global default, matching EmailSettings.jsx\'s original', () => {
    expect(settingsQueries.emailTemplates().staleTime).toBeUndefined();
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

describe('saveSettingsRow', () => {
  it('updates the existing uncategorised row when one exists', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: { id: 5 }, error: null } });
    await saveSettingsRow({ business_name: 'Raslipwani' });
    expect(builders.admin_settings.update).toHaveBeenCalled();
    expect(builders.admin_settings.eq).toHaveBeenCalledWith('id', 5);
    expect(builders.admin_settings.insert).not.toHaveBeenCalled();
  });

  it('inserts when no row exists yet', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await saveSettingsRow({ business_name: 'Raslipwani' });
    expect(builders.admin_settings.insert).toHaveBeenCalled();
  });

  it('applies no category filter to the lookup — this would fail if one were applied', async () => {
    // A categorised lookup (filtering by setting_category) would miss
    // against General and Cloudinary rows, which carry no category, and take
    // the insert branch — producing a second row on every save. That
    // function existed briefly during the migration and was deleted for
    // exactly this landmine. This test pins the opposite: no category
    // filter at all on the lookup.
    const builders = mockFrom(supabase, { admin_settings: { data: { id: 5 }, error: null } });
    await saveSettingsRow({ business_name: 'Raslipwani' });
    expect(builders.admin_settings.eq).not.toHaveBeenCalledWith('setting_category', expect.anything());
    expect(builders.admin_settings.limit).toHaveBeenCalledWith(1);
  });

  it('does not stamp a setting_category onto the written row', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await saveSettingsRow({ business_name: 'Raslipwani' });
    const [payload] = builders.admin_settings.insert.mock.calls[0];
    expect(payload.setting_category).toBeUndefined();
  });
});

describe('getSettingsByKeys', () => {
  it('filters on setting_key with `in`', async () => {
    const builders = mockFrom(supabase, { admin_settings: { data: [], error: null } });
    await getSettingsByKeys(['business_hours', 'timezone']);
    expect(builders.admin_settings.in).toHaveBeenCalledWith('setting_key', ['business_hours', 'timezone']);
  });
});

describe('upsertSettingRows', () => {
  it('upserts the given rows keyed by setting_key', async () => {
    const rows = [{ setting_key: 'currency', setting_value: { code: 'KES' }, setting_category: 'localization' }];
    const builders = mockFrom(supabase, { admin_settings: { data: null, error: null } });
    await upsertSettingRows(rows);
    expect(builders.admin_settings.upsert).toHaveBeenCalledWith(rows, { onConflict: 'setting_key' });
  });
});
