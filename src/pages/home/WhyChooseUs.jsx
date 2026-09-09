import React from 'react';
import { motion } from 'framer-motion';

import Icon from '../../components/Icon';
import { BENEFITS } from './homeContent';
import { enter } from './homeMotion';

/**
 * The condensed strip of reasons to choose us.
 *
 * The six items were emoji — see `homeContent.js` for why they are drawn icons
 * now. The strip also imported a `BenefitCard` it never rendered; that component
 * has been deleted rather than left as a second, unused way to say the same
 * thing.
 */
const WhyChooseUs = () => (
  <section className="border-y border-line bg-surface-raised py-10 md:py-14">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center gap-6">
        <motion.h2
          {...enter(0)}
          className="font-display text-lg font-semibold tracking-tight text-content md:text-xl"
        >
          Why Raslipwani?
        </motion.h2>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:gap-x-10">
          {BENEFITS.map((item, index) => (
            <motion.li key={item.text} {...enter(index)} className="flex items-center gap-2">
              <Icon
                name={item.icon}
                size={18}
                aria-hidden="true"
                className="text-brand-content"
              />
              <span className="text-xs font-medium text-content md:text-sm">{item.text}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
