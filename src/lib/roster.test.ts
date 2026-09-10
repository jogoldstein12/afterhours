import { describe, expect, it } from 'vitest';
import {
  MAX_NAME_LENGTH,
  MAX_PLAYERS,
  hasName,
  nameKey,
  normalisePlayerName,
  normaliseRoster,
} from './roster';

// Built from code points rather than pasted: these are invisible in an editor,
// and a literal one in this file would be indistinguishable from a typo.
const RLO = String.fromCharCode(0x202e); // right-to-left override
const ZWSP = String.fromCharCode(0x200b); // zero-width space
const BELL = String.fromCharCode(0x07); // a C0 control character
const PARTY = String.fromCodePoint(0x1f389); // an astral-plane character
const REPLACEMENT = String.fromCharCode(0xfffd); // what a half-sliced character becomes

describe('normalisePlayerName', () => {
  it('trims and collapses whitespace', () => {
    expect(normalisePlayerName('  Alex   J  ')).toBe('Alex J');
    expect(normalisePlayerName('Sam\t\nBrown')).toBe('Sam Brown');
  });

  it('rejects anything that leaves no name behind', () => {
    for (const input of ['', '   ', ZWSP, RLO, null, undefined, {}, [], true]) {
      expect(normalisePlayerName(input)).toBeNull();
    }
  });

  it('strips invisible characters that would rewrite the card around the name', () => {
    expect(normalisePlayerName(RLO + 'Zoe' + ZWSP)).toBe('Zoe');
    expect(normalisePlayerName('Al' + BELL + 'ex')).toBe('Alex');
    // Two names that look identical must not compare as different.
    expect(nameKey(normalisePlayerName('Sam' + ZWSP)!)).toBe(nameKey('Sam'));
  });

  it('caps length in code points, never mid-character', () => {
    expect(normalisePlayerName('x'.repeat(80))).toHaveLength(MAX_NAME_LENGTH);
    const capped = normalisePlayerName(PARTY.repeat(40));
    expect([...(capped ?? '')]).toHaveLength(MAX_NAME_LENGTH);
    expect(capped).not.toContain(REPLACEMENT);
  });

  it('accepts a number, because storage can hand one back', () => {
    expect(normalisePlayerName(7)).toBe('7');
  });
});

describe('nameKey', () => {
  it('folds case and accents so look-alike names collide', () => {
    expect(nameKey('Alex')).toBe(nameKey('alex'));
    expect(nameKey('José')).toBe(nameKey('jose'));
    expect(nameKey('Ana')).not.toBe(nameKey('Anna'));
  });
});

describe('hasName', () => {
  it('matches case-insensitively', () => {
    expect(hasName(['Sam'], 'sam')).toBe(true);
    expect(hasName(['Sam'], 'Sam B')).toBe(false);
    expect(hasName([], 'Sam')).toBe(false);
  });
});

describe('normaliseRoster', () => {
  it('returns an empty roster for anything that is not an array', () => {
    for (const input of [null, undefined, 'Alex', 42, { players: ['Alex'] }]) {
      expect(normaliseRoster(input)).toEqual([]);
    }
  });

  it('drops unusable entries and keeps the rest in order', () => {
    expect(normaliseRoster(['Alex', '', null, '  Sam  ', 0, {}, 'Jordan'])).toEqual([
      'Alex',
      'Sam',
      '0',
      'Jordan',
    ]);
  });

  it('keeps the first of a set of duplicates', () => {
    expect(normaliseRoster(['Sam', 'sam', 'SAM', 'Sám'])).toEqual(['Sam']);
  });

  it('stops at the player cap', () => {
    const many = Array.from({ length: 500 }, (_, i) => `P${i}`);
    const roster = normaliseRoster(many);
    expect(roster).toHaveLength(MAX_PLAYERS);
    // The cap takes the first ten, not a random ten.
    expect(roster[0]).toBe('P0');
    expect(roster[MAX_PLAYERS - 1]).toBe(`P${MAX_PLAYERS - 1}`);
  });

  it('counts toward the cap only after deduplication', () => {
    const withDupes = ['A', 'a', 'B', 'b', 'C', 'c', 'D', 'd', 'E', 'e', 'F', 'G', 'H'];
    expect(normaliseRoster(withDupes)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  });

  it('is idempotent', () => {
    const once = normaliseRoster(['  Alex ', 'Sam', 'x'.repeat(50)]);
    expect(normaliseRoster(once)).toEqual(once);
  });
});
