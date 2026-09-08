import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * The last step of both booking flows: who to contact, and when they would
 * like the appointment. `ServicesMain` and `ViewingExperience` each carried
 * their own copy of these six fields — the same six, in the same order, with
 * the same required rules — differing only in field density, label copy, the
 * id prefix, and what sits beside the time field. Those are the props below.
 *
 * Two things the copies did not agree on, resolved here:
 * - the notes textarea now always has a label bound to it by `htmlFor`;
 *   ServicesMain's copy had a floating `<label>` pointing at nothing.
 * - the fields are their own `<form>`. ServicesMain wrapped all four wizard
 *   steps in one form, so Enter on a radio button in step one submitted an
 *   empty booking — the required fields that would have stopped it were on a
 *   step that had not rendered yet.
 */
const DENSITY = {
  comfortable: {
    field: 'w-full p-3 border border-line-strong rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors',
    label: 'block text-content-muted mb-2 text-sm font-medium',
    gap: 'space-y-6',
  },
  compact: {
    field: 'w-full p-2.5 border border-line-strong rounded-lg text-sm',
    label: 'block text-content-muted mb-1 text-sm',
    gap: 'space-y-5',
  },
};

const ContactDetailsStep = ({
  idPrefix,
  density,
  values,
  onChange,
  onSubmit,
  minDate,
  notesLabel,
  notesPlaceholder,
  aside = null,
  onBack = null,
  submitLabel,
  busyLabel,
  isSubmitting,
}) => {
  const style = DENSITY[density];
  const id = (name) => `${idPrefix}-${name}`;
  const field = (name) => ({
    id: id(name),
    name,
    value: values[name],
    onChange: (e) => onChange(name, e.target.value),
    className: style.field,
  });

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={style.gap}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id('name')} className={style.label}>Full Name *</label>
          <input type="text" required placeholder="Your full name" {...field('name')} />
        </div>
        <div>
          <label htmlFor={id('email')} className={style.label}>Email *</label>
          <input type="email" required placeholder="your.email@example.com" {...field('email')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id('phone')} className={style.label}>Phone *</label>
          <input type="tel" required placeholder="+254 700 000 000" {...field('phone')} />
        </div>
        <div>
          <label htmlFor={id('date')} className={style.label}>Preferred Date *</label>
          <input type="date" required min={minDate} {...field('date')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id('time')} className={style.label}>Preferred Time *</label>
          <input type="time" required {...field('time')} />
        </div>
        {aside && <div className="flex items-end">{aside}</div>}
      </div>

      <div>
        <label htmlFor={id('notes')} className={style.label}>{notesLabel}</label>
        <textarea rows="3" placeholder={notesPlaceholder} {...field('notes')} />
      </div>

      <div className={onBack ? 'flex justify-between pt-4' : 'pt-3'}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-line-strong rounded-lg font-medium hover:bg-surface transition-colors"
          >
            Back
          </button>
        )}
        <motion.button
          whileHover={{ scale: onBack ? 1.02 : 1.01 }}
          whileTap={{ scale: onBack ? 0.98 : 0.99 }}
          type="submit"
          disabled={isSubmitting}
          className={
            onBack
              ? 'bg-primary text-content-on-brand font-medium py-3.5 px-8 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-70 transition-all flex items-center'
              : 'w-full bg-primary text-content-on-brand font-medium py-2.5 px-5 rounded-lg shadow hover:shadow-md disabled:opacity-70 text-sm'
          }
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-line-media border-t-transparent rounded-full mr-2 inline-block"
              />
              {busyLabel}
            </span>
          ) : (
            submitLabel
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

ContactDetailsStep.propTypes = {
  idPrefix: PropTypes.string.isRequired,
  density: PropTypes.oneOf(['comfortable', 'compact']).isRequired,
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  minDate: PropTypes.string,
  notesLabel: PropTypes.string.isRequired,
  notesPlaceholder: PropTypes.string,
  aside: PropTypes.node,
  onBack: PropTypes.func,
  submitLabel: PropTypes.node.isRequired,
  busyLabel: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};


export default ContactDetailsStep;
