import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import Button from '../../components/ui/Button';
import { enter } from './homeMotion';

/**
 * The home page's closing call to action.
 *
 * Two changes worth naming. The gradient ran `primary → secondary`, two of the
 * five literal brand colours that survive from before the token layer; it now
 * runs between the two brand tokens, so it follows a theme instead of ignoring
 * one.
 *
 * And the two links were the same weight, which is not a hierarchy — the visitor
 * has to read both to find out which one this section is for. "Get in Touch" is
 * the one, so it is the button; browsing is the fallback, so it is a link. The
 * button is `secondary` rather than amber: the page's one amber element is the
 * hero's search, and a second halves the value of the first (DESIGN.md rule 3).
 */
const HomeCta = () => (
  <section className="bg-gradient-to-br from-brand to-brand-hover py-20 text-content-on-brand">
    <div className="container mx-auto px-4 text-center">
      <motion.h2 {...enter(0)} className="font-display text-3xl font-semibold tracking-tight">
        Ready to Begin Your Journey?
      </motion.h2>
      <motion.p {...enter(1)} className="mx-auto mt-4 max-w-2xl text-lg text-content-on-brand/90">
        Our experts are ready to guide you to your dream property in Kenya
      </motion.p>

      <motion.div
        {...enter(2)}
        className="mt-8 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8"
      >
        <Button to="/contact" variant="secondary" size="lg">
          Get in Touch
        </Button>
        <Link
          to="/properties"
          className="rounded-sm font-semibold underline decoration-content-on-brand/40 underline-offset-4 transition-colors duration-fast hover:decoration-content-on-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-brand motion-reduce:transition-none"
        >
          Browse Listings
        </Link>
      </motion.div>
    </div>
  </section>
);

export default HomeCta;
