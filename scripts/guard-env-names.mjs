#!/usr/bin/env node
/**
 * Fails the build when a secret-shaped name is exposed to the client bundle.
 *
 * Vite inlines every `VITE_*` variable into the output as a string literal.
 * That is the whole mechanism behind Phase 0 of ROADMAP.md: a `service_role`
 * JWT was set as `VITE_SUPABASE_SERVICE_KEY` and shipped, readable, from the
 * CDN. Rotating the key closed that instance. This closes the class.
 *
 * Two checks, because the mistake can arrive from either direction:
 *   1. the ambient environment (what Vercel and CI actually build with)
 *   2. any committed or local `.env*` file
 *
 * Runs as `prebuild`, so it guards local builds, CI builds, and Vercel builds
 * without anyone having to remember it.
 */
import { readdirSync, readFileSync } from 'node:fs';

const FORBIDDEN = /SERVICE|SECRET|PRIVATE|PASSWORD|CREDENTIAL/i;

// `VITE_SUPABASE_KEY` is the anon key. It is *designed* to be public — the
// protection for it is RLS, not obscurity — and it does not match the pattern
// anyway. Listed here so the next reader does not "fix" its absence.
const violations = [];

for (const name of Object.keys(process.env)) {
  if (name.startsWith('VITE_') && FORBIDDEN.test(name)) {
    violations.push({ name, where: 'build environment' });
  }
}

let envFiles = [];
try {
  envFiles = readdirSync(process.cwd()).filter((f) => f.startsWith('.env'));
} catch {
  // Unreadable cwd is not this script's problem to report.
}

for (const file of envFiles) {
  let contents;
  try {
    contents = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  contents.split('\n').forEach((line, i) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match) return;
    const name = match[1];
    if (name.startsWith('VITE_') && FORBIDDEN.test(name)) {
      violations.push({ name, where: `${file}:${i + 1}` });
    }
  });
}

if (violations.length === 0) {
  console.log('✓ env-name guard: no secret-shaped VITE_* variables');
  process.exit(0);
}

// Deliberately does not print values. A build log is not a safe place to
// widen the disclosure that this check exists to prevent.
console.error('\n✗ env-name guard: secret-shaped VITE_* variable(s) found\n');
for (const { name, where } of violations) {
  console.error(`    ${name}  (${where})`);
}
console.error(`
Vite inlines every VITE_* variable into the client bundle as a plain string.
A name matching /${FORBIDDEN.source}/i must never carry that prefix.

To fix:
  - a browser-safe value  → rename it without the secret-shaped word
  - an actual secret      → drop the VITE_ prefix and read it server-side only

If the value has already been built and served, rotate it. Removing the
variable does not invalidate a key already published in a shipped bundle.
`);
process.exit(1);
