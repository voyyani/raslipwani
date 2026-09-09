import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import Icon from '../Icon';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * The theme control — three options, not a switch.
 *
 * A two-state switch is the obvious design and the wrong one. The provider
 * models `light | dark | system`, and a switch can only write two of those, so
 * the first time someone touches it their "follow my OS" preference is gone with
 * no way to ask for it back. Three segments cost about ninety pixels of header
 * and keep the preference expressible.
 *
 * ## Keyboard
 *
 * This is a `radiogroup`, so it follows the radio pattern rather than being three
 * tab stops: one stop for the whole control, arrow keys move between options and
 * select as they go, Home and End jump to the ends. That is what a screen-reader
 * user expects from a set of mutually exclusive choices, and it keeps the header
 * from growing three stops on the way to the navigation.
 *
 * Each option is icon-only, so each carries its own `aria-label`. `title` gives
 * the same text to a mouse user as a tooltip.
 */

const OPTIONS = [
  { value: 'light', icon: 'sun', label: 'Light theme' },
  { value: 'dark', icon: 'moon', label: 'Dark theme' },
  { value: 'system', icon: 'desktop', label: 'Match system theme' },
];

/**
 * Two grounds.
 *
 * `default` is the admin shell and any header that has the page's own surface
 * behind it. `media` is the public header while it is still transparent over the
 * hero photograph, where `surface-sunken` would appear as a pale slab floating
 * on the picture and `content-subtle` would be a coin flip against it. Same
 * control, same behaviour; it borrows `content-on-media` exactly as the links
 * beside it do.
 */
const TONES = {
  default: {
    group: 'border-line bg-surface-sunken',
    selected: 'bg-surface-raised text-content shadow-raised',
    unselected: 'text-content-subtle hover:text-content',
    ring: 'focus-visible:ring-offset-surface-sunken',
  },
  media: {
    group: 'border-line-media bg-content-on-media/10',
    selected: 'bg-content-on-media/25 text-content-on-media',
    unselected: 'text-content-on-media/70 hover:text-content-on-media',
    ring: 'focus-visible:ring-offset-transparent',
  },
};

const ThemeToggle = ({ tone = 'default', className = '' }) => {
  const { preference, setPreference } = useTheme();
  const groupRef = useRef(null);
  const skin = TONES[tone] ?? TONES.default;

  /** Moves selection by `step`, wrapping, and takes focus with it. */
  const move = (step) => {
    const index = OPTIONS.findIndex((option) => option.value === preference);
    const next = OPTIONS[(index + step + OPTIONS.length) % OPTIONS.length];
    setPreference(next.value);
    groupRef.current
      ?.querySelector(`[data-theme-option="${next.value}"]`)
      ?.focus();
  };

  const onKeyDown = (event) => {
    const jump = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (jump) {
      event.preventDefault();
      move(jump);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const target = event.key === 'Home' ? OPTIONS[0] : OPTIONS[OPTIONS.length - 1];
      setPreference(target.value);
      groupRef.current
        ?.querySelector(`[data-theme-option="${target.value}"]`)
        ?.focus();
    }
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Colour theme"
      onKeyDown={onKeyDown}
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${skin.group} ${className}`}
    >
      {OPTIONS.map(({ value, icon, label }) => {
        const selected = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            data-theme-option={value}
            // One tab stop for the group: only the selected option is reachable
            // by Tab, and the arrow keys move within. This is the radio pattern.
            tabIndex={selected ? 0 : -1}
            onClick={() => setPreference(value)}
            className={[
              'rounded-full p-1.5 transition-colors duration-fast motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1',
              skin.ring,
              selected ? skin.selected : skin.unselected,
            ].join(' ')}
          >
            <Icon name={icon} size={15} />
          </button>
        );
      })}
    </div>
  );
};

ThemeToggle.propTypes = {
  /** `media` for a header still floating on a photograph. See `TONES`. */
  tone: PropTypes.oneOf(['default', 'media']),
  /** Spacing for the surface it sits in. Colour comes from the token layer. */
  className: PropTypes.string,
};

export default ThemeToggle;
