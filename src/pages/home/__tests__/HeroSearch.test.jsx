import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { render, screen } from '@/test/utils/renderWithProviders';
import HeroSearch from '../HeroSearch';

describe('HeroSearch', () => {
  it('labels every control', () => {
    render(<HeroSearch onSearch={() => {}} />);
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/looking for/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/budget/i)).toBeInTheDocument();
  });

  it('submits the criteria the visitor entered', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<HeroSearch onSearch={onSearch} />);

    await user.type(screen.getByLabelText(/location/i), 'Kikambala');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ location: 'Kikambala' }));
  });

  it('submits on Enter, because a search field that ignores Enter is broken', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<HeroSearch onSearch={onSearch} />);
    await user.type(screen.getByLabelText(/location/i), 'Mombasa{Enter}');

    expect(onSearch).toHaveBeenCalled();
  });

  it('treats an empty budget as no maximum, not as zero', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<HeroSearch onSearch={onSearch} />);
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ maxPrice: null }));
  });

  it('passes the budget as a number once one is entered', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<HeroSearch onSearch={onSearch} />);
    await user.type(screen.getByLabelText(/budget/i), '8500000');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ maxPrice: 8500000 }));
  });

  it('floats on the photograph rather than covering it', () => {
    // `media`, not `strong`: dark-theme `strong` glass over a bright image
    // measures 1.13:1. The tone is the fix, so the tone is what is asserted.
    const { container } = render(<HeroSearch onSearch={() => {}} />);
    const panel = container.querySelector('[data-glass]');

    expect(panel).toHaveAttribute('data-glass', 'media');
    expect(panel.tagName).toBe('FORM');
  });
});
