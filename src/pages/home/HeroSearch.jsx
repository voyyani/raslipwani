import React, { useState } from 'react';
import PropTypes from 'prop-types';

import GlassPanel from '@/components/ui/GlassPanel';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

/**
 * The hero's actual product.
 *
 * The outgoing hero was a stock photograph, a flat dark overlay and a headline
 * any competitor could have run unchanged. Everything a visitor could *do* with
 * it was below the fold. This puts the first step of all three audiences' jobs —
 * find a place, in a location, within a budget — in the first viewport, floating
 * on the photograph rather than covering it.
 *
 * The three options in "Looking for" are the three audiences PRODUCT.md names,
 * in their own words rather than in the database's. `Properties` translates them
 * into what the data can actually answer; nothing here invents a column.
 */

const SEGMENTS = [
  { value: '', label: 'Any property' },
  { value: 'residential', label: 'A home to live in' },
  { value: 'investment', label: 'An investment' },
  { value: 'un-diplomatic', label: 'UN or diplomatic housing' },
];

function HeroSearch({ onSearch }) {
  const [location, setLocation] = useState('');
  const [segment, setSegment] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const submit = (event) => {
    event.preventDefault();
    onSearch({
      location: location.trim(),
      segment,
      // An empty budget means "no maximum". Coercing it to 0 would silently
      // return nothing, which reads as "no properties" rather than "no filter".
      maxPrice: maxPrice === '' ? null : Number(maxPrice),
    });
  };

  return (
    <GlassPanel
      as="form"
      // `media`, not `strong`: this panel sits on a photograph, and dark-theme
      // `strong` glass over a bright image measures 1.13:1. The controls inside
      // keep their own opaque `surface-raised` ground from the Field primitive,
      // so only the panel's own text depends on this tone.
      tone="media"
      onSubmit={submit}
      aria-label="Search properties"
      className="w-full max-w-3xl p-4 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Location"
          name="location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Kikambala, Mombasa…"
          autoComplete="off"
        />
        <Select
          label="Looking for"
          name="segment"
          value={segment}
          onChange={(event) => setSegment(event.target.value)}
        >
          {SEGMENTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input
          label="Budget (KSh)"
          name="maxPrice"
          type="number"
          inputMode="numeric"
          min="0"
          step="100000"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          placeholder="No maximum"
        />
      </div>

      {/* The one amber element in this view — DESIGN.md rule 3. Every other call
          to action on Home is primary or secondary. */}
      <Button type="submit" variant="accent" size="lg" fullWidth className="mt-4">
        Search properties
      </Button>
    </GlassPanel>
  );
}

HeroSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default HeroSearch;
