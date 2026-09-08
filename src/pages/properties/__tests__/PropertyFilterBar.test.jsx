import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import PropertyFilterBar from '../PropertyFilterBar';

const filters = { type: 'all', purpose: 'all', search: '', sort: 'newest' };

describe('PropertyFilterBar', () => {
  it('reports each change to its parent rather than owning the state', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PropertyFilterBar
        filters={filters}
        isOpen
        onFilterChange={onFilterChange}
        onReset={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await user.selectOptions(screen.getByLabelText(/property type/i), 'villa');
    expect(onFilterChange).toHaveBeenCalledWith('type', 'villa');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-low');
    expect(onFilterChange).toHaveBeenCalledWith('sort', 'price-low');

    await user.click(screen.getByRole('button', { name: /for sale/i }));
    expect(onFilterChange).toHaveBeenCalledWith('purpose', 'sale');
  });

  it('labels every control', () => {
    render(
      <PropertyFilterBar
        filters={filters}
        isOpen
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
        onClose={vi.fn()}
      />
    );
    for (const control of [...screen.getAllByRole('combobox'), ...screen.getAllByRole('button')]) {
      expect(control).toHaveAccessibleName();
    }
  });

  it('marks the selected purpose as pressed, and only that one', () => {
    render(
      <PropertyFilterBar
        filters={{ ...filters, purpose: 'rent' }}
        isOpen
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /for rent/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /for sale/i })).toHaveAttribute('aria-pressed', 'false');
  });
});
