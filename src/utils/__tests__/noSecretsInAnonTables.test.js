import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const repoRoot = path.resolve(__dirname, '../../..');

/** Every `.jsx`/`.js` under `src/`, excluding tests and their mocks. */
function sourceFiles(dir = path.join(repoRoot, 'src'), acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__' && entry.name !== 'test') sourceFiles(full, acc);
    } else if (/\.jsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * Strip comments so the guard does not trip on the prose that explains why a
 * secret was removed. A guard rail that fails on its own documentation teaches
 * people to delete the documentation.
 */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/**
 * Columns that live on tables the public anon key can read. Anything written
 * into one of these is published to every visitor the moment it is saved.
 */
const SECRET_COLUMNS = [
  'cloudinary_api_secret',
  'cloudinary_api_key',
  'resend_api_key',
  'service_role_key',
];

describe('secrets in anon-readable tables', () => {
  /**
   * `CloudinarySettings.jsx` used to write `cloudinary_api_secret` into
   * `admin_settings`, whose columns are readable with the public anon key.
   * The values were NULL, so nothing had leaked — but saving the form once
   * would have published the secret. The fields are gone; these credentials
   * belong in server-side configuration.
   *
   * This test is what stops the next settings form from re-adding them,
   * because storing a credential next to the settings it configures always
   * looks like the tidy choice.
   */
  it('are not read or written by any client-side source file', () => {
    const offenders = [];

    for (const file of sourceFiles()) {
      const body = code(fs.readFileSync(file, 'utf8'));
      const rel = path.relative(repoRoot, file);

      for (const column of SECRET_COLUMNS) {
        const pattern = new RegExp(`\\b${column}\\b`, 'g');
        for (const match of body.matchAll(pattern)) {
          const line = body.slice(0, match.index).split('\n').length;
          offenders.push(`${rel}:${line} — ${column}`);
        }
      }
    }

    expect(
      offenders,
      `These columns are anon-readable. Move the credential to server-side ` +
        `configuration instead of storing it in the database:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
