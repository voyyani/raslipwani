import { expect } from 'vitest';
import axe from 'axe-core';

/**
 * Runs axe-core over a rendered container and fails with the violations spelled
 * out, rather than with a bare "expected 3 to be 0".
 *
 * Scoped to the WCAG 2.1 A and AA rule sets on purpose. axe ships best-practice
 * rules alongside the normative ones, and a build that fails on "this landmark
 * would be nicer with a label" teaches people to switch the gate off. The bar
 * this project committed to is AA, so that is the bar the build enforces.
 *
 * What this cannot see: `color-contrast` needs real layout and jsdom has none,
 * so axe reports it as incomplete and it is excluded here rather than passing
 * silently. Contrast is covered instead by the 102 assertions over the token
 * pairs in src/design — that is the surface where it can actually be decided,
 * since every colour on these pages now comes from a token.
 */
export const AXE_OPTIONS = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },
  rules: {
    'color-contrast': { enabled: false },
  },
};

const describeViolation = (violation) => {
  const where = violation.nodes
    .map((node) => `      ${node.target.join(' ')}\n        ${node.failureSummary?.split('\n').join('\n        ')}`)
    .join('\n');
  return `  [${violation.impact}] ${violation.id} — ${violation.help}\n    ${violation.helpUrl}\n${where}`;
};

export async function expectNoAxeViolations(container) {
  const results = await axe.run(container, AXE_OPTIONS);

  if (results.violations.length > 0) {
    const report = results.violations.map(describeViolation).join('\n\n');
    expect.fail(
      `${results.violations.length} accessibility violation(s):\n\n${report}\n`
    );
  }

  return results;
}
