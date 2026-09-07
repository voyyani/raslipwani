import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import PropertyFilters from '../PropertyFilters';

describe('PropertyFilters', () => {
  const filters = { search: '', status: 'all', purpose: 'all' };

  it('reports a status change to its parent', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PropertyFilters filters={filters} onFilterChange={onFilterChange} onReset={vi.fn()} activeCount={0} />
    );
    await user.selectOptions(screen.getByLabelText(/status/i), 'available');
    expect(onFilterChange).toHaveBeenCalledWith('status', 'available');
  });

  it('gives every control an accessible name', () => {
    // Block 2 took unlabelled controls to zero and the axe gate holds them
    // there. Moving markup into a new file is exactly how one comes back.
    render(
      <PropertyFilters filters={filters} onFilterChange={vi.fn()} onReset={vi.fn()} activeCount={0} />
    );
    for (const control of screen.getAllByRole('combobox')) {
      expect(control).toHaveAccessibleName();
    }
  });
});
