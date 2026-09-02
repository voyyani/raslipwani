import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Guards on the migration chain itself. Every rule below encodes a defect that
// actually shipped and cost production a table — see ROADMAP.md §2.2.
const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');

const files = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

const read = (f) => fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');

// Comments explain these defects at length; only executable SQL should fail.
const stripComments = (sql) =>
  sql
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('--'))
    .join('\n');

describe('migration chain', () => {
  it('has migrations to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('never uses CREATE POLICY IF NOT EXISTS', () => {
    // PostgreSQL has never supported this, in any version through 17. It is a
    // syntax error, so the migration aborts and rolls back — silently, if
    // nobody reads the SQL editor output. It is why `booking_notes` and
    // `email_templates` were missing from production for eight months.
    const offenders = files.filter((f) =>
      /CREATE\s+POLICY\s+IF\s+NOT\s+EXISTS/i.test(stripComments(read(f)))
    );
    expect(offenders).toEqual([]);
  });

  it('gives every migration a unique, totally ordered prefix', () => {
    // Two files once claimed `003_`, leaving their relative order undefined.
    const prefixes = files.map((f) => f.match(/^([0-9]+[a-z]?)_/)?.[1]);
    expect(prefixes.every(Boolean)).toBe(true);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it('starts from a baseline that creates the core tables', () => {
    // Without this, the chain ALTERs tables no migration creates and cannot
    // replay against an empty database.
    const baseline = stripComments(read('000_baseline.sql'));
    for (const table of ['properties', 'bookings']) {
      expect(baseline).toMatch(
        new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}`, 'i')
      );
    }
  });

  it('leaves no USING (true) policy in force after the lockdown', () => {
    // Migrations 007 onward are the security baseline; a permissive policy
    // reintroduced there would undo Phase 0 without anyone noticing.
    const post = files.filter((f) => /^0(0[7-9]|1[0-9])/.test(f));
    expect(post.length).toBeGreaterThan(0);

    for (const f of post) {
      const sql = stripComments(read(f));
      const policies = sql.match(/CREATE POLICY[\s\S]*?;/gi) ?? [];
      for (const policy of policies) {
        // `public reads` policies on published, non-sensitive tables are the
        // one legitimate use; they are scoped to SELECT.
        if (/FOR\s+SELECT/i.test(policy)) continue;
        expect(policy).not.toMatch(/USING\s*\(\s*true\s*\)/i);
      }
    }
  });
});
