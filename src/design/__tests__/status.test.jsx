import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';

import { statusClasses, statusLabel, intentForStatus, INTENT_CLASSES } from '../status';
import { STATUSES } from '../tokens';
import BookingStatusBadge from '../../components/BookingStatusBadge';

describe('status tokens', () => {
  it.each(STATUSES)('gives %s a themed class triple', (status) => {
    const classes = statusClasses(status);
    expect(classes).toMatch(/bg-\w+-surface/);
    expect(classes).toMatch(/text-\w+-content/);
    expect(classes).toMatch(/border-\w+-border/);
  });

  it('never emits a literal palette class', () => {
    // The whole point of the map: these have to work in both themes.
    for (const classes of Object.values(INTENT_CLASSES)) {
      expect(classes).not.toMatch(/-(?:gray|slate|green|red|yellow|amber|blue)-\d{2,3}/);
    }
  });

  it('falls back rather than rendering an unstyled pill for an unknown status', () => {
    expect(intentForStatus('rescheduled')).toBe(intentForStatus('pending'));
    expect(statusLabel('rescheduled')).toBe('rescheduled');
  });

  it('distinguishes confirmed from completed', () => {
    expect(statusClasses('confirmed')).not.toBe(statusClasses('completed'));
  });
});

describe('BookingStatusBadge', () => {
  it.each(STATUSES)('renders %s with its label and token classes', (status) => {
    const { container } = render(<BookingStatusBadge status={status} />);

    expect(screen.getByText(statusLabel(status))).toBeInTheDocument();
    for (const cls of statusClasses(status).split(' ')) {
      expect(container.firstChild).toHaveClass(cls);
    }
  });

  it('hides its decorative icon from assistive technology', () => {
    const { container } = render(<BookingStatusBadge status="pending" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('no component decides status colour on its own any more', () => {
  // Five sites each carried their own map. Two of them rendered `completed`
  // in the pending colour because their ternary had no branch for it, and
  // `confirmed` was green in three files and blue in a fourth.
  const FILES = [
    'src/components/BookingList.jsx',
    'src/components/BookingRow.jsx',
    'src/components/BookingStatusBadge.jsx',
    'src/pages/admin/AdminBookings.jsx',
  ];

  it.each(FILES)('%s has no hand-rolled status palette', (file) => {
    const source = readFileSync(file, 'utf8');
    expect(source).not.toMatch(/bg-(?:green|red|yellow)-100 text-\w+-800/);
  });
});
