import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Fix round 1: `CloudinarySettings.jsx` originally used `staleTime: 0,
 * refetchOnMount: 'always'` so a save (from this tab or another) is visible
 * the moment the Cloudinary tab is reopened. `settingsQueries.cloudinary()`
 * itself must stay on `STALE_TIME.static` — it is shared with
 * `AdminProperties.jsx`'s own, unrelated, established 30-minute cache — so
 * the override has to live at this screen's own call site instead. This
 * pins that override in source so it cannot silently be dropped by a future
 * edit that only touches the shared query option.
 */
describe('CloudinarySettings freshness', () => {
  const source = () => readFileSync('src/pages/admin/settings/CloudinarySettings.jsx', 'utf8');

  it('overrides staleTime to 0 at its own call site', () => {
    expect(source()).toMatch(/staleTime:\s*0/);
  });

  it("overrides refetchOnMount to 'always' at its own call site", () => {
    expect(source()).toMatch(/refetchOnMount:\s*'always'/);
  });
});
