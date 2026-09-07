import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../SettingsContext';
import { getSettingsRow, subscribeToSettings } from '@/services/settings';

vi.mock('@/services/settings', () => ({
  getSettingsRow: vi.fn().mockResolvedValue({ business_name: 'Raslipwani Properties' }),
  subscribeToSettings: vi.fn(() => vi.fn()),
}));

const Probe = () => <span>{useSettings().siteName()}</span>;

describe('SettingsContext', () => {
  beforeEach(() => {
    vi.mocked(getSettingsRow).mockResolvedValue({ business_name: 'Raslipwani Properties' });
    vi.mocked(subscribeToSettings).mockReturnValue(vi.fn());
  });

  it('reads its settings through the service, with no category filter', async () => {
    render(<SettingsProvider><Probe /></SettingsProvider>);
    expect(await screen.findByText('Raslipwani Properties')).toBeInTheDocument();
    expect(getSettingsRow).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', async () => {
    const stop = vi.fn();
    vi.mocked(subscribeToSettings).mockReturnValue(stop);
    const { unmount } = render(<SettingsProvider><Probe /></SettingsProvider>);
    await screen.findByText('Raslipwani Properties');
    unmount();
    expect(stop).toHaveBeenCalled();
  });

  it('imports no Supabase client', () => {
    expect(readFileSync('src/contexts/SettingsContext.jsx', 'utf8')).not.toMatch(/supabaseClient/);
  });

  it('imports no Supabase client in AuthContext either', () => {
    expect(readFileSync('src/contexts/AuthContext.jsx', 'utf8')).not.toMatch(/supabaseClient/);
  });
});
