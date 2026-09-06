/**
 * Three cache lifetimes, named for what they are for.
 *
 * Before this file, App.jsx set a global staleTime of 5 minutes and Home.jsx
 * quietly overrode it to 1 minute for featured properties — a disagreement
 * nobody could see, because each half was defensible on its own screen. Naming
 * the lifetimes makes the choice reviewable: a query is `live`, `standard`, or
 * `static`, and a fourth gets added here with a reason rather than typed into a
 * component.
 */
export const STALE_TIME = {
  /** Admin counters and queues, where a stale badge is actively misleading. */
  live: 30 * 1000,
  /** Everything a visitor reads. The app's default. */
  standard: 5 * 60 * 1000,
  /** Settings and email templates: changed by one admin, a few times a year. */
  static: 30 * 60 * 1000,
};
