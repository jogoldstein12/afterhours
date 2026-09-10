/**
 * Single source of truth for the identifying details in the legal pages.
 *
 * ⚠️ These documents were drafted to be accurate about what the app actually
 * does. They have NOT been reviewed by a lawyer — do that before launch.
 * Anything here that changes (a new registered address, a different support
 * inbox) needs changing once, here.
 */
export const LEGAL = {
  /** Legal entity or individual publishing the app. */
  entity: 'After Hours Party Game, LLC',
  /** Reachable inbox for legal, privacy, and takedown notices. */
  contactEmail: 'Support@afterhoursgame.com',
  /** Governing law for the Terms. */
  jurisdiction: 'the State of New York, USA',
  /** Shown as "Last updated" on the Terms. Bump when the Terms change. */
  termsLastUpdated: 'September 9, 2026',
  /** Shown as "Last updated" on the Privacy Policy. Bump when it changes. */
  privacyLastUpdated: 'September 10, 2026',
} as const;

/** True while any placeholder is still unfilled, so the UI can say so plainly. */
export const LEGAL_IS_DRAFT = Object.values(LEGAL).some(
  (value) => typeof value === 'string' && value.startsWith('['),
);
