import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import HeroSearch from './HeroSearch';
import { HERO } from './homeContent';
import { enterOnMount } from './homeMotion';

/**
 * The first viewport.
 *
 * What changed, and why:
 *
 * - **The overlay.** It was a flat `surface-inverse/40 → /70` wash across the
 *   whole image, which dims the photograph everywhere and is darkest exactly
 *   where the sky is. It is now a scrim that is strongest at the bottom edge,
 *   where the search panel and the headline sit, and nearly absent at the top,
 *   where the picture is. Photography is the product; the interface frames it.
 * - **The two buttons.** "Browse Properties" and "Our Services" were the only
 *   things a visitor could do here, and both of them just moved them somewhere
 *   else to start over. The search panel does the first step of the job in
 *   place, so the buttons are gone rather than sitting beside it competing.
 * - **The headline.** See `homeContent.js`.
 *
 * This section holds **one** of the page's three permitted live blur surfaces:
 * the search panel. The header (which is transparent while the hero is on
 * screen) is the second. Nothing else on Home blurs.
 */
const HeroSection = ({ heroLoaded, onHeroLoad }) => {
  const navigate = useNavigate();

  // The criteria travel as query parameters rather than as router state, so a
  // search is a link a visitor can send to someone else — which, for the
  // diaspora audience buying on someone else's advice, is the point.
  const search = ({ location, segment, maxPrice }) => {
    const params = new URLSearchParams();
    if (location) params.set('search', location);
    if (segment) params.set('segment', segment);
    if (maxPrice !== null && maxPrice !== undefined && !Number.isNaN(maxPrice)) {
      params.set('maxPrice', String(maxPrice));
    }

    const query = params.toString();
    navigate(query ? `/properties?${query}` : '/properties');
  };

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
      {/* Served from `public/`, so it is one file at one size rather than the
          three Cloudinary widths this used to request. It is still the page's
          LCP element, so it keeps `eager` and `fetchpriority="high"` — and the
          intrinsic dimensions stay on the tag, because without them the layout
          shifts by the height of the viewport while it loads. */}
      <img
        src="/hero.jpg"
        alt="Coastal property at Kikambala on the Kenyan coast"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
        width="1452"
        height="870"
        onLoad={onHeroLoad}
      />

      {/* Two scrims, each with a job, instead of one flat wash over everything.
          The stops are not taste: `scrim` is pure black, so 55% of it over the
          brightest thing a photograph can be still puts white text at 4.75:1,
          and 85% at the bottom edge puts it at 9:1. Above 45% the gradient is
          gone and the picture is the picture. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-gradient-to-t from-scrim/85 via-45% via-scrim/55 to-transparent"
      />
      {/* The header is transparent while it is over this photograph (see
          Header.jsx). This is what its white links read against — 5.7:1 over a
          blown-out sky, and invisible over a dark one. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-scrim/60 to-transparent"
      />

      {!heroLoaded && (
        <div aria-hidden="true" className="absolute inset-0 z-0 animate-pulse bg-surface-sunken" />
      )}

      <div className="container relative z-10 mx-auto px-4 pb-14 pt-32 sm:pb-20">
        <motion.div {...enterOnMount(0)} className="max-w-3xl text-content-on-media">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {HERO.headline}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-content-on-media/90 sm:text-xl">
            {HERO.subhead}
          </p>
        </motion.div>

        <motion.div {...enterOnMount(1)} className="mt-8">
          <HeroSearch onSearch={search} />
        </motion.div>
      </div>
    </section>
  );
};

HeroSection.propTypes = {
  heroLoaded: PropTypes.bool.isRequired,
  onHeroLoad: PropTypes.func.isRequired,
};

export default HeroSection;
