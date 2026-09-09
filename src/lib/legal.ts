/**
 * Single source of truth for the identifying details in the legal pages.
 *
 * ⚠️ BEFORE PUBLIC LAUNCH: replace every placeholder below, and have a lawyer
 * in your jurisdiction review `src/app/terms/page.tsx` and
 * `src/app/privacy/page.tsx`. These documents were drafted to be accurate about
 * what the app actually does — they are a starting point, not legal advice.
 */
export const LEGAL = {
  /** Legal entity or individual publishing the app. */
  entity: '[ENTITY NAME]',
  /** Reachable inbox for legal, privacy, and takedown notices. */
  contactEmail: '[CONTACT EMAIL]',
  /** Governing law for the Terms, e.g. 'the State of New York, USA'. */
  jurisdiction: '[JURISDICTION]',
  /** Shown as "Last updated" on both documents. */
  lastUpdated: 'September 9, 2026',
} as const;

/** True while any placeholder is still unfilled, so the UI can say so plainly. */
export const LEGAL_IS_DRAFT = Object.values(LEGAL).some(
  (value) => typeof value === 'string' && value.startsWith('['),
);
