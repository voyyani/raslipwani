import { useSyncExternalStore } from 'react';

/**
 * Whether a media query currently matches, kept live.
 *
 * `useSyncExternalStore` rather than state-plus-effect so the first render
 * already has the right answer: a modal that decides its geometry from this
 * must not present as a centred panel for one frame and then jump to a sheet.
 * On the server, and in environments without `matchMedia`, it answers `false`.
 */
export default function useMediaQuery(query) {
  const subscribe = (onChange) => {
    if (typeof window === 'undefined' || !window.matchMedia) return () => {};
    const list = window.matchMedia(query);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  };

  const getSnapshot = () =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(query).matches
      : false;

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
