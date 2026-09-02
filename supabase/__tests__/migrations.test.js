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

  it('never guards a policy on a column no migration creates', () => {
    // This is the defect that stopped 007 and 009 from running at all.
    // `is_archived` was named in the bookings INSERT policy, but it is a column
    // on `clients` (001) and no migration ever adds it to `bookings`.
    // PostgreSQL evaluates WITH CHECK when the policy is CREATEd, so the whole
    // migration aborted with `column "is_archived" does not exist` — the fix
    // written to close a data-destruction exposure could not be applied.
    //
    // Only statically-written policies are checked. 009 assembles its booking
    // policy at run time from the columns that actually exist, which is a
    // stronger guarantee than this test can offer.
    const columnsOf = (table) => {
      const found = new Set();
      for (const f of files) {
        const sql = stripComments(read(f));
        const created = sql.match(
          new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\s*\\(([\\s\\S]*?)\\n\\);`, 'i')
        );
        if (created) {
          for (const line of created[1].split('\n')) {
            const m = line.trim().match(/^([a-z_][a-z0-9_]*)\s+[A-Za-z]/);
            if (m) found.add(m[1]);
          }
        }
        const alters = sql.matchAll(
          new RegExp(`ALTER TABLE (?:public\\.)?${table}\\b([\\s\\S]*?);`, 'gi')
        );
        for (const alter of alters) {
          for (const add of alter[1].matchAll(
            /ADD COLUMN\s+(?:IF NOT EXISTS\s+)?([a-z_][a-z0-9_]*)/gi
          )) {
            found.add(add[1]);
          }
        }
      }
      return found;
    };

    // SQL keywords, functions, roles and literals that appear inside a policy
    // expression and are not column references.
    const NOT_COLUMNS = new Set([
      'and', 'or', 'not', 'is', 'null', 'true', 'false', 'in', 'between',
      'length', 'trim', 'select', 'exists', 'from', 'where', 'on', 'to', 'for',
      'insert', 'update', 'delete', 'all', 'with', 'check', 'using', 'create',
      'policy', 'public', 'anon', 'authenticated', 'is_admin',
      'viewing', 'consultation', 'contact', 'pending', 'available',
    ]);

    // A DO $tag$ ... $tag$ block builds its SQL at run time and checks the
    // catalog before it does, so its text is not a static policy. Scanning it
    // would flag plpgsql variables as if they were columns.
    const stripDoBlocks = (sql) => sql.replace(/DO \$([a-z_]*)\$[\s\S]*?\$\1\$/gi, '');

    const violations = [];
    for (const table of ['bookings', 'properties']) {
      const known = columnsOf(table);
      expect(known.size).toBeGreaterThan(0);

      for (const f of files) {
        const sql = stripDoBlocks(stripComments(read(f)));
        const policies = sql.matchAll(
          new RegExp(`CREATE POLICY[^;]*?ON public\\.${table}\\b[\\s\\S]*?;`, 'gi')
        );
        for (const policy of policies) {
          // Drop the quoted policy name — its words are not column references.
          const expr = policy[0].replace(/"[^"]*"/g, '');
          const referenced = new Set(
            [...expr.matchAll(/\b([a-z_][a-z0-9_]*)\b/g)].map((m) => m[1])
          );
          for (const id of referenced) {
            if (NOT_COLUMNS.has(id) || id === table) continue;
            if (!known.has(id)) violations.push(`${f}: ${table}.${id}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
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
