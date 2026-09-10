/**
 * Roster rules, and the single place a player name is cleaned up.
 *
 * Names reach the app from three directions — the setup screen, the mid-game
 * edit sheet, and browser storage (which the player can edit by hand, and which
 * can be left over from an older build). All three go through here, so
 * everything downstream can assume a roster is trimmed, bounded, free of
 * invisible characters, free of duplicates, and within the player cap.
 */

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

/**
 * Long enough for a full first name or a nickname, short enough that a chip
 * still fits across a phone and a name can be read off the card at arm's
 * length. Counted in code points, so an emoji or an accented letter costs one
 * instead of being sliced in half mid-character.
 */
export const MAX_NAME_LENGTH = 20;

/**
 * Control characters (`Cc`) and format characters (`Cf`). The second class is
 * the one that actually matters: a right-to-left override pasted into a name
 * visually reorders the rest of the sentence around it, and a zero-width joiner
 * makes two names that look identical compare as different.
 */
const INVISIBLE = /[\p{Cc}\p{Cf}]/gu;

/**
 * Clean one name, or return null if nothing usable is left. Accepts `unknown`
 * because half its callers are reading parsed JSON.
 */
export function normalisePlayerName(raw: unknown): string | null {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const cleaned = String(raw)
    // Tabs and newlines are control characters too, so they have to become
    // spaces before the strip below — otherwise a name pasted off two lines
    // comes back with its words glued together.
    .replace(/\s+/g, ' ')
    .replace(INVISIBLE, '')
    // Removing an invisible character can leave two spaces touching.
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return null;
  return Array.from(cleaned).slice(0, MAX_NAME_LENGTH).join('');
}

/**
 * The identity used to compare two names. Case- and accent-folded, so "alex"
 * does not join a game that already has "Alex" — the turn tally is keyed by
 * name, and two entries for one person would split their count and break the
 * end-of-night stat.
 */
export const nameKey = (name: string): string =>
  name.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();

export const hasName = (roster: readonly string[], name: string): boolean => {
  const key = nameKey(name);
  return roster.some((existing) => nameKey(existing) === key);
};

/** Clean a whole roster: drop the unusable, drop repeats, stop at the cap. */
export function normaliseRoster(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const roster: string[] = [];
  for (const entry of raw) {
    if (roster.length >= MAX_PLAYERS) break;
    const name = normalisePlayerName(entry);
    if (name && !hasName(roster, name)) roster.push(name);
  }
  return roster;
}
