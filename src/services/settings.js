import { supabase } from '@/utils/supabaseClient';
import { unwrap, unwrapList } from './unwrap';
import { queryKeys } from './queryKeys';
import { STALE_TIME } from './cachePolicy';

const TABLE = 'admin_settings';
const TEMPLATES_TABLE = 'email_templates';

export async function getSettingsByCategory(category) {
  return unwrapList(
    await supabase.from(TABLE).select('*').eq('setting_category', category),
    { table: TABLE, operation: 'getSettingsByCategory' }
  );
}

export async function getGeneralSettings() {
  return unwrap(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('setting_category', 'general')
      .maybeSingle(),
    { table: TABLE, operation: 'getGeneralSettings' }
  );
}

/**
 * Exactly two fields, named explicitly.
 *
 * `admin_settings` also holds credentials. Audit finding C-1 was a Cloudinary
 * API secret readable by `anon`; migration 010 moved the secrets out, and this
 * selection is the second lock — a `select('*')` here would put whatever lands
 * in that table next back onto the wire.
 *
 * No category filter, deliberately: the two screens this replaced
 * (AdminProperties.jsx and CloudinarySettings.jsx) both read the row with no
 * `setting_category` filter at all, and nothing in the repo establishes which
 * category the live Cloudinary row actually carries. Guessing 'general' here
 * silently returns no row and disables image uploads if the guess is wrong —
 * exactly what happened the first time this function carried that filter.
 */
export async function getCloudinaryConfig() {
  return unwrap(
    await supabase.from(TABLE).select('cloud_name, upload_preset').limit(1).maybeSingle(),
    { table: TABLE, operation: 'getCloudinaryConfig' }
  );
}

/**
 * Insert or update, decided once.
 *
 * Six settings screens each wrote their own version of this. Two of them
 * treated "no row yet" as an error and showed a red toast on a first save that
 * had in fact succeeded; one wrote without the category and produced a second
 * uncategorised row that the next read never saw.
 */
export async function saveSettings(values, { category }) {
  const existing = unwrap(
    await supabase.from(TABLE).select('id').eq('setting_category', category).maybeSingle(),
    { table: TABLE, operation: 'saveSettings.lookup' }
  );

  const payload = { ...values, setting_category: category, updated_at: new Date().toISOString() };

  if (existing?.id) {
    return unwrap(
      await supabase.from(TABLE).update(payload).eq('id', existing.id).select().single(),
      { table: TABLE, operation: 'saveSettings.update' }
    );
  }

  return unwrap(await supabase.from(TABLE).insert(payload).select().single(), {
    table: TABLE,
    operation: 'saveSettings.insert',
  });
}

/**
 * The uncategorised read.
 *
 * `SettingsContext.jsx`, `GeneralSettings.jsx` and `CloudinarySettings.jsx`
 * query `admin_settings` today with no category filter at all. Guessing a
 * category for them here would silently repoint an admin's saved
 * configuration to a different row, so this is the honest option those
 * screens keep using until someone reads the live table and gives them a
 * real category.
 */
export async function getSettingsRow() {
  return unwrap(await supabase.from(TABLE).select('*').maybeSingle(), {
    table: TABLE,
    operation: 'getSettingsRow',
  });
}

/**
 * Insert or update the single uncategorised row, decided once.
 *
 * `saveSettings` above is unsafe for `GeneralSettings.jsx` and
 * `CloudinarySettings.jsx`: it looks the existing row up by
 * `setting_category`, and the row those two screens read and write carries
 * no category. That lookup would miss, take the insert branch, and leave a
 * second row in the table that the next uncategorised read may or may not
 * see. This mirrors what those two screens' hand-rolled save code actually
 * does — look up the row with no category filter, update it if found,
 * insert it otherwise — and stamps no `setting_category` onto the payload.
 */
export async function saveSettingsRow(values) {
  const existing = unwrap(
    await supabase.from(TABLE).select('id').limit(1).maybeSingle(),
    { table: TABLE, operation: 'saveSettingsRow.lookup' }
  );

  const payload = { ...values, updated_at: new Date().toISOString() };

  if (existing?.id) {
    return unwrap(
      await supabase.from(TABLE).update(payload).eq('id', existing.id).select().single(),
      { table: TABLE, operation: 'saveSettingsRow.update' }
    );
  }

  return unwrap(await supabase.from(TABLE).insert(payload).select().single(), {
    table: TABLE,
    operation: 'saveSettingsRow.insert',
  });
}

/**
 * Rows selected by `setting_key`, for the screens that store several
 * key/value rows per category (`EmailSettings.jsx`, `AdvancedSettings.jsx`,
 * `LocalizationSettings.jsx`, `BusinessHoursSettings.jsx`) rather than one
 * flat row of columns.
 */
export async function getSettingsByKeys(keys) {
  return unwrapList(
    await supabase.from(TABLE).select('*').in('setting_key', keys),
    { table: TABLE, operation: 'getSettingsByKeys' }
  );
}

/**
 * Upsert several `setting_key` rows at once, keyed on conflict by
 * `setting_key`. This is the write half of the key/value screens above —
 * each screen builds its own array of `{ setting_key, setting_value,
 * setting_category }` rows and hands it here unchanged, so the category each
 * row carries (or, for `BusinessHoursSettings.jsx`, the category it carries
 * despite being read without one — see the comment on that screen) is
 * decided by the caller, not by this function.
 */
export async function upsertSettingRows(rows) {
  return unwrap(
    await supabase.from(TABLE).upsert(rows, { onConflict: 'setting_key' }),
    { table: TABLE, operation: 'upsertSettingRows' }
  );
}

export async function listEmailTemplates() {
  return unwrapList(
    await supabase.from(TEMPLATES_TABLE).select('*').eq('is_active', true),
    { table: TEMPLATES_TABLE, operation: 'listEmailTemplates' }
  );
}

export async function updateEmailTemplate(templateId, { subject, body }) {
  return unwrap(
    await supabase
      .from(TEMPLATES_TABLE)
      .update({ subject, body })
      .eq('id', templateId)
      .select()
      .single(),
    { table: TEMPLATES_TABLE, operation: 'updateEmailTemplate' }
  );
}

/**
 * Realtime settings changes. `SettingsContext` owns the subscription; this owns
 * the channel's shape, so the context does not import the client to build one.
 * Returns an unsubscribe suitable for a useEffect cleanup.
 */
export function subscribeToSettings(onChange) {
  const channel = supabase
    .channel('admin_settings_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export const settingsQueries = {
  category: (category) => ({
    queryKey: queryKeys.settings.category(category),
    queryFn: () => getSettingsByCategory(category),
    staleTime: STALE_TIME.static,
  }),
  general: () => ({
    queryKey: queryKeys.settings.general(),
    queryFn: () => getGeneralSettings(),
    staleTime: STALE_TIME.static,
  }),
  row: () => ({
    queryKey: queryKeys.settings.row(),
    queryFn: () => getSettingsRow(),
    staleTime: STALE_TIME.static,
  }),
  keys: (keys) => ({
    queryKey: queryKeys.settings.keys(keys),
    queryFn: () => getSettingsByKeys(keys),
    staleTime: STALE_TIME.static,
  }),
  cloudinary: () => ({
    queryKey: queryKeys.settings.cloudinary(),
    queryFn: () => getCloudinaryConfig(),
    staleTime: STALE_TIME.static,
  }),
  emailTemplates: () => ({
    queryKey: queryKeys.settings.emailTemplates(),
    queryFn: () => listEmailTemplates(),
    staleTime: STALE_TIME.static,
  }),
};
