/**
 * The copy the home page renders. Kept out of the components so a wording change
 * is a content edit rather than a JSX edit.
 */

/**
 * The hero.
 *
 * The outgoing headline was "Your Trusted Real Estate Partner in Kenya" — a
 * sentence any competitor could run unchanged, which makes it worth nothing to
 * either of us. This one takes a position and names the place, which is the only
 * thing on the page a portal aggregator cannot copy.
 */
export const HERO = {
  headline: 'Kenyan property, handled properly.',
  subhead:
    'Homes, land and investment in Kenya , based on the coast at Kikambala — sold and let by ' +
    'people who answer the phone.',
};

/**
 * The four services the home page advertises. Lifted out of `Home.jsx`
 * (Task 26) unchanged.
 */
export const services = [
  {
    icon: "home",
    title: "Property Sales",
    description: "Strategic marketing to sell your property at optimal market value across Kenya"
  },
  {
    icon: "search-dollar",
    title: "Property Acquisition",
    description: "Expert guidance through the entire buying process nationwide"
  },
  {
    icon: "chart-line",
    title: "Property Valuation",
    description: "Accurate assessments to inform your investment decisions"
  },
  {
    icon: "tasks",
    title: "Property Management",
    description: "Comprehensive services to maximize your investment returns"
  }
];

/**
 * The reasons-to-choose-us strip.
 *
 * These were emoji — 👨‍💼, 🤝, 🇰🇪 — which render as a different picture on every
 * platform, share no stroke weight with anything else on the page, and are read
 * aloud by a screen reader as "man office worker". They are now drawn icons from
 * the one icon set, at one weight, marked decorative because the label beside
 * each already says the thing.
 */
export const BENEFITS = [
  { icon: 'users', text: 'Expert Team' },
  { icon: 'user-friends', text: 'Client-First' },
  { icon: 'shield-alt', text: 'Trusted' },
  { icon: 'globe', text: 'Nationwide' },
  { icon: 'dollar-sign', text: 'All Budgets' },
  { icon: 'home', text: 'End-to-End' },
];
