import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen, waitFor } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../SettingsContext';
import { getSettingsRow, subscribeToSettings } from '@/services/settings';

vi.mock('@/services/settings', () => ({
  getSettingsRow: vi.fn().mockResolvedValue({ business_name: 'Raslipwani Properties' }),
  // Resolves with the unsubscribe: the client is fetched on demand (Task 29).
  subscribeToSettings: vi.fn(async () => vi.fn()),
}));

const Probe = () => <span>{useSettings().siteName()}</span>;

describe('SettingsContext', () => {
  beforeEach(() => {
    vi.mocked(getSettingsRow).mockResolvedValue({ business_name: 'Raslipwani Properties' });
    vi.mocked(subscribeToSettings).mockResolvedValue(vi.fn());
  });

  it('reads its settings through the service, with no category filter', async () => {
    render(<SettingsProvider><Probe /></SettingsProvider>);
    expect(await screen.findByText('Raslipwani Properties')).toBeInTheDocument();
    expect(getSettingsRow).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', async () => {
    const stop = vi.fn();
    vi.mocked(subscribeToSettings).mockResolvedValue(stop);
    const { unmount } = render(<SettingsProvider><Probe /></SettingsProvider>);
    await screen.findByText('Raslipwani Properties');
    // Let the subscription resolve before unmounting, so this asserts the
    // cleanup path rather than the cancelled-before-it-arrived one.
    await waitFor(() => expect(subscribeToSettings).toHaveBeenCalled());
    unmount();
    await waitFor(() => expect(stop).toHaveBeenCalled());
  });

  it('unsubscribes even when the provider unmounts before the client arrives', async () => {
    // The client is fetched dynamically now, so the subscription can resolve
    // after the cleanup has already run. Without the provider's `cancelled`
    // flag that leaves a live channel with nothing left to close it.
    const stop = vi.fn();
    let resolveSubscription;
    vi.mocked(subscribeToSettings).mockReturnValue(
      new Promise((resolve) => { resolveSubscription = resolve; })
    );

    const { unmount } = render(<SettingsProvider><Probe /></SettingsProvider>);
    unmount();
    resolveSubscription(stop);

    await waitFor(() => expect(stop).toHaveBeenCalled());
  });

  it('imports no Supabase client', () => {
    expect(readFileSync('src/contexts/SettingsContext.jsx', 'utf8')).not.toMatch(/supabaseClient/);
  });

  it('imports no Supabase client in AuthContext either', () => {
    expect(readFileSync('src/contexts/AuthContext.jsx', 'utf8')).not.toMatch(/supabaseClient/);
  });
});
