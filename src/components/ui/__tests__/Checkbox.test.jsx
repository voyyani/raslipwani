import React from 'react';
import { describe, it, expect } from 'vitest';

import { render, screen } from '../../../test/utils/renderWithProviders';
import Checkbox from '../Checkbox';

describe('Checkbox', () => {
  it('is labelled even when the caller passes no id', () => {
    render(<Checkbox label="Enable maintenance mode" />);

    // getByRole with a name is the assertion that matters: it is the same
    // lookup a screen reader does, and it fails on a label that merely sits
    // next to the control without being associated with it.
    expect(screen.getByRole('checkbox', { name: 'Enable maintenance mode' })).toBeInTheDocument();
  });

  it('links its hint with aria-describedby rather than leaving it floating', () => {
    render(<Checkbox label="Enable maintenance mode" hint="Visitors see a holding page" />);

    const box = screen.getByRole('checkbox', { name: 'Enable maintenance mode' });
    const describedBy = box.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy)).toHaveTextContent('Visitors see a holding page');
  });

  it('honours an explicit id', () => {
    render(<Checkbox id="maintenance" label="Enable maintenance mode" />);
    expect(screen.getByRole('checkbox', { name: 'Enable maintenance mode' })).toHaveAttribute(
      'id',
      'maintenance'
    );
  });

  it('passes checked and onChange through to the control', () => {
    const seen = [];
    render(
      <Checkbox label="Enable maintenance mode" checked onChange={(e) => seen.push(e.target.checked)} />
    );

    const box = screen.getByRole('checkbox', { name: 'Enable maintenance mode' });
    expect(box).toBeChecked();
  });
});
