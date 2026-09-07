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
 * There is deliberately no categorised sibling of this function (no
 * `saveSettings(values, { category })`) in this file any more. One existed
 * briefly during the migration and was deleted: its existing-row lookup
 * filtered by `setting_category`, which — against `GeneralSettings.jsx`'s
 * and `CloudinarySettings.jsx`'s row, which carries no category — would miss
 * every time, take the insert branch, and leave a second row in the table
 * that the next uncategorised read may or may not see. Nothing in production
 * ever called it safely, and a function that corrupts data the moment
 * someone reaches for its obvious name is worse than no function at all.
 * This one mirrors what those two screens' hand-rolled save code actually
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
  /**
   * No `staleTime` here, deliberately. `EmailSettings.jsx`, `AdvancedSettings.jsx`
   * and `LocalizationSettings.jsx` — the only callers — never set one before
   * this migration either, so this falls through to the app's global default
   * (`staleTime: 5 * 60 * 1000` in App.jsx) rather than `STALE_TIME.static`
   * (30 minutes). A settings screen's whole job is showing current
   * configuration; a change made by another admin, or in another browser
   * tab, should not take up to half an hour to appear.
   */
  category: (category) => ({
    queryKey: queryKeys.settings.category(category),
    queryFn: () => getSettingsByCategory(category),
  }),
  /**
   * Matches `GeneralSettings.jsx`'s original `staleTime: 0, refetchOnMount:
   * 'always'` — its only caller — rather than `STALE_TIME.static`: this
   * screen always considered its row stale, so a save is visible the moment
   * the tab is reopened rather than after a 30-minute cache window.
   */
  row: () => ({
    queryKey: queryKeys.settings.row(),
    queryFn: () => getSettingsRow(),
    staleTime: 0,
    refetchOnMount: 'always',
  }),
  /** No `staleTime` override — see the comment on `category` above.
   * `BusinessHoursSettings.jsx`, the only caller, never set one either. */
  keys: (keys) => ({
    queryKey: queryKeys.settings.keys(keys),
    queryFn: () => getSettingsByKeys(keys),
  }),
  /**
   * `STALE_TIME.static` here is deliberate and must stay: `AdminProperties.jsx`
   * also reads through this query option, and its 30-minute cache is
   * established, reviewed behaviour outside this file's scope.
   * `CloudinarySettings.jsx` needs different freshness (its row can change
   * from this same screen in another tab) and overrides `staleTime` and
   * `refetchOnMount` at its own call site rather than here.
   */
  cloudinary: () => ({
    queryKey: queryKeys.settings.cloudinary(),
    queryFn: () => getCloudinaryConfig(),
    staleTime: STALE_TIME.static,
  }),
  /** No `staleTime` override — `EmailSettings.jsx`'s original template list
   * query never set one either; inherits the 5-minute global default. */
  emailTemplates: () => ({
    queryKey: queryKeys.settings.emailTemplates(),
    queryFn: () => listEmailTemplates(),
  }),
};
