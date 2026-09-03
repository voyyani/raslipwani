import React from 'react';
import PropTypes from 'prop-types';

import Icon from './Icon';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Modal from './ui/Modal';

/**
 * A booking, read-only, with the two actions an operator takes on one.
 *
 * It used to render its own overlay: a `fixed inset-0` div, a white panel, and
 * a close button — and, like the other ten hand-rolled dialogs, no focus trap,
 * no focus restoration and no Escape. `ServicesMain` opens this one from the
 * public site, so that gap was not confined to the admin console.
 *
 * The status pill is `Badge status=` rather than a local ternary. Four
 * components previously each decided what "confirmed" looked like and two of
 * them disagreed; the pill's colour and label now come from `design/status.js`
 * and the caller gets no say.
 */

/** One definition, because the two blocks below formatted dates differently. */
const formatDate = (value) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** A labelled read-only value. `-` is the empty state, never a blank gap. */
const Detail = ({ label, children }) => (
  <div>
    <p className="text-sm text-content-muted">{label}</p>
    <div className="font-medium text-content">{children ?? '-'}</div>
  </div>
);

Detail.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };

const Section = ({ icon, title, children }) => (
  <section className="bg-surface-sunken p-4 rounded-lg">
    <h4 className="font-medium text-content mb-4 flex items-center gap-2">
      <Icon name={icon} size={16} className="text-brand-content" />
      {title}
    </h4>
    {children}
  </section>
);

Section.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const BookingModal = ({ isOpen, booking, viewFilter, onClose, onArchive, onExport }) => {
  // `Modal` handles the closed case, but `booking` is read unconditionally
  // below, so the null check has to happen before the render.
  if (!booking) return null;

  const archived = viewFilter !== 'active';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant={archived ? 'primary' : 'secondary'}
            onClick={() => onArchive(booking.id, !archived)}
          >
            <Icon name={archived ? 'trash-restore' : 'archive'} size={16} />
            {archived ? 'Restore Booking' : 'Archive Booking'}
          </Button>
          <Button variant="accent" onClick={onExport}>
            <Icon name="file-export" size={16} />
            Export Details
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Section icon="user" title="Client Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail label="Full Name">{booking.name}</Detail>
            <Detail label="Email">{booking.email}</Detail>
            <Detail label="Phone">{booking.phone}</Detail>
            <Detail label="Booking ID">
              {booking.id ? <span className="text-sm">{booking.id}</span> : null}
            </Detail>
          </div>
        </Section>

        <Section icon="calendar-check" title="Booking Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail label="Booking Type">{booking.type}</Detail>
            <Detail label="Status">
              {booking.status ? <Badge status={booking.status} /> : null}
            </Detail>
            <Detail label="Service/Viewing Type">
              {booking.service || booking.viewing_type}
            </Detail>
            <Detail label="Appointment Date">{formatDate(booking.appointment_at)}</Detail>
            <Detail label="Created At">{formatDate(booking.created_at)}</Detail>
            <Detail label="Subject">{booking.subject}</Detail>
          </div>
        </Section>

        <Section icon="sticky-note" title="Messages & Notes">
          <div className="space-y-4">
            {booking.message && (
              <div>
                <p className="text-sm text-content-muted">Client Message</p>
                <p className="mt-1 p-3 bg-surface border border-line rounded-lg text-content">
                  {booking.message}
                </p>
              </div>
            )}
            {booking.notes && (
              <div>
                <p className="text-sm text-content-muted">Internal Notes</p>
                <p className="mt-1 p-3 bg-surface border border-line rounded-lg text-content">
                  {booking.notes}
                </p>
              </div>
            )}
            {!booking.message && !booking.notes && (
              <p className="text-content-muted italic">No messages or notes available</p>
            )}
          </div>
        </Section>
      </div>
    </Modal>
  );
};

BookingModal.propTypes = {
  isOpen: PropTypes.bool,
  booking: PropTypes.object,
  /** `'active'` shows Archive; anything else shows Restore. */
  viewFilter: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
};

export default BookingModal;
