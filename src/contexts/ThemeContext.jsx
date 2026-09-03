import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * The theme provider — the thing the whole token layer was built to feed.
 *
 * Three choices, not two. `system` is a real option rather than an initial
 * default, because "follow my OS" is a preference people hold and losing it the
 * first time they touch a toggle is the bug every naive implementation ships.
 * That is also why `darkMode` is `'class'` in tailwind.config.js: a media-query
 * theme can only ever offer what the OS says.
 *
 * Two pieces of state, deliberately distinct:
 *   - `preference` — what the person chose: 'light' | 'dark' | 'system'.
 *   - `resolved`   — what is actually painted: 'light' | 'dark'.
 * A toggle that reads `resolved` and writes `preference` is the only way both
 * "switch to dark" and "go back to following the OS" can be expressed.
 *
 * The first paint is handled in index.html, not here. React mounts after the
 * browser has already painted, so a class applied in this effect arrives one
 * frame late and a dark-mode user sees a white flash on every load. The inline
 * script there reads the same key and applies the same class; this provider is
 * the authority afterwards.
 */

export const THEME_STORAGE_KEY = 'raslipwani:theme';

const PREFERENCES = ['light', 'dark', 'system'];

const prefersDark = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
 * Reads the stored preference, tolerating everything storage can do to it.
 *
 * `localStorage` throws rather than returning null in a browser configured to
 * block site data, and the stored value can be anything if it was hand-edited or
 * written by an older build. Both cases fall back to `system`, which is the
 * right answer when we do not know what the person wanted.
 */
export const readStoredPreference = () => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return PREFERENCES.includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
};

/** What a given preference actually paints, right now. */
export const resolveTheme = (preference) =>
  preference === 'system' ? (prefersDark() ? 'dark' : 'light') : preference;

/** Applies the resolved theme to the document. The one place that touches DOM. */
export const applyTheme = (resolved) => {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  // `color-scheme` is what makes form controls, scrollbars and the space beyond
  // the page paint dark. Tokens alone cannot reach those.
  root.style.colorScheme = resolved;
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readStoredPreference);
  const [resolved, setResolved] = useState(() => resolveTheme(readStoredPreference()));

  useEffect(() => {
    const next = resolveTheme(preference);
    setResolved(next);
    applyTheme(next);
  }, [preference]);

  // Only while following the system: a person who explicitly chose light does
  // not want their laptop's sunset switching it out from under them.
  useEffect(() => {
    if (preference !== 'system') return undefined;
    if (typeof window.matchMedia !== 'function') return undefined;

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next = prefersDark() ? 'dark' : 'light';
      setResolved(next);
      applyTheme(next);
    };

    // Safari below 14 has only the deprecated listener API, and this app's
    // market runs a long tail of older mobile Safari.
    if (query.addEventListener) query.addEventListener('change', onChange);
    else query.addListener(onChange);

    return () => {
      if (query.removeEventListener) query.removeEventListener('change', onChange);
      else query.removeListener(onChange);
    };
  }, [preference]);

  const setPreference = useCallback((next) => {
    if (!PREFERENCES.includes(next)) return;
    setPreferenceState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // A blocked storage costs persistence across reloads, not the theme
      // itself. Failing the switch here would be the worse trade.
    }
  }, []);

  /** What the header button does: flip what is currently on screen. */
  const toggle = useCallback(() => {
    setPreference(resolveTheme(preference) === 'dark' ? 'light' : 'dark');
  }, [preference, setPreference]);

  const value = useMemo(
    () => ({ preference, resolved, setPreference, toggle, preferences: PREFERENCES }),
    [preference, resolved, setPreference, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
