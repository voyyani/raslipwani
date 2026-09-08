import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const sql = readFileSync('supabase/migrations/013_property_segments.sql', 'utf8');

describe('013_property_segments', () => {
  it('is additive and idempotent, like every migration in this repo', () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS/i);
    expect(sql).not.toMatch(/DROP COLUMN/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });

  it('indexes the segment, because every UN page load filters on it', () => {
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS.*segment/is);
  });

  it('does not widen any grant to anon', () => {
    // Block 1 spent a day closing these. A migration that re-opens one would
    // undo it silently.
    expect(sql).not.toMatch(/GRANT .* TO anon/i);
    expect(sql).not.toMatch(/USING \(true\)/i);
  });

  it('constrains the segment to known values', () => {
    expect(sql).toMatch(/CHECK/i);
  });
});
