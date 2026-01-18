import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import Settings from '../Settings';
import { supabase } from '../../../utils/supabaseClient';

vi.mock('../../../utils/supabaseClient');

// Mock sub-components
vi.mock('../settings/GeneralSettings', () => ({
  default: () => <div data-testid="general-settings">General Settings</div>
}));

vi.mock('../settings/CloudinarySettings', () => ({
  default: () => <div data-testid="cloudinary-settings">Cloudinary Settings</div>
}));

vi.mock('../settings/EmailSettings', () => ({
  default: () => <div data-testid="email-settings">Email Settings</div>
}));

vi.mock('../settings/BusinessHoursSettings', () => ({
  default: () => <div data-testid="business-hours-settings">Business Hours Settings</div>
}));

vi.mock('../settings/LocalizationSettings', () => ({
  default: () => <div data-testid="localization-settings">Localization Settings</div>
}));

vi.mock('../settings/AdvancedSettings', () => ({
  default: () => <div data-testid="advanced-settings">Advanced Settings</div>
}));

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings page with tabs', () => {
    render(<Settings />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cloudinary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /business hours/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /localization/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /advanced/i })).toBeInTheDocument();
  });

  it('displays general settings by default', () => {
    render(<Settings />);

    expect(screen.getByTestId('general-settings')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    // Click Cloudinary tab
    const cloudinaryTab = screen.getByRole('button', { name: /cloudinary/i });
    await user.click(cloudinaryTab);

    await waitFor(() => {
      expect(screen.getByTestId('cloudinary-settings')).toBeInTheDocument();
    });

    // Click Email tab
    const emailTab = screen.getByRole('button', { name: /email/i });
    await user.click(emailTab);

    await waitFor(() => {
      expect(screen.getByTestId('email-settings')).toBeInTheDocument();
    });
  });

  it('maintains active tab styling', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    const generalTab = screen.getByRole('button', { name: /general/i });
    const cloudinaryTab = screen.getByRole('button', { name: /cloudinary/i });

    // General should be active initially
    expect(generalTab).toHaveClass('text-blue-600');

    // Click Cloudinary
    await user.click(cloudinaryTab);

    await waitFor(() => {
      expect(cloudinaryTab).toHaveClass('text-blue-600');
    });
  });
});
