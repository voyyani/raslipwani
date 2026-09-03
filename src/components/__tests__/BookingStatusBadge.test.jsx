import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils/renderWithProviders';
import BookingStatusBadge from '../BookingStatusBadge';
import { statusClasses, statusLabel } from '../../design/status';
import { STATUSES } from '../../design/tokens';

/**
 * This suite used to assert literal classes — `bg-yellow-100`, `bg-blue-100` — and
 * in doing so it froze in place the very inconsistency Slice 4B removed: it
 * required `confirmed` to be blue while `BookingList` and `BookingRow` rendered
 * the same status green, and nothing failed because each site was tested against
 * its own opinion.
 *
 * It now asserts against `src/design/status.js`, the single map all of them read.
 * That is a weaker statement about any one colour and a much stronger one about
 * the system: the badge renders whatever the token layer says, and the token
 * layer is separately proven readable in both themes by `contrast.test.js`.
 */
describe('BookingStatusBadge', () => {
  it.each(STATUSES)('renders %s from the shared status tokens', (status) => {
    render(<BookingStatusBadge status={status} />);

    const badge = screen.getByText(statusLabel(status));
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(...statusClasses(status).split(' '));
  });

  it('never renders a literal palette class, so it can be themed', () => {
    const { container } = render(<BookingStatusBadge status="pending" />);
    expect(container.firstChild.className).not.toMatch(/-(?:yellow|blue|green|red)-\d{2,3}/);
  });

  it('displays an icon for each status', () => {
    const { rerender } = render(<BookingStatusBadge status="pending" />);

    for (const status of STATUSES) {
      rerender(<BookingStatusBadge status={status} />);
      expect(screen.getByText(statusLabel(status)).querySelector('svg')).toBeTruthy();
    }
  });

  it('falls back to the pending treatment for a status nobody anticipated', () => {
    render(<BookingStatusBadge status="rescheduled" />);

    const badge = screen.getByText('rescheduled');
    expect(badge).toHaveClass(...statusClasses('pending').split(' '));
  });

  it('applies custom className', () => {
    render(<BookingStatusBadge status="pending" className="custom-class" />);
    expect(screen.getByText('Pending')).toHaveClass('custom-class');
  });
});
