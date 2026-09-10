import { describe, expect, it } from 'vitest';
import {
  GAME_MODES,
  NHIE_PATTERN,
  PROMPTS,
  getPromptCategory,
  isNhiePrompt,
  isRoomPrompt,
  type Prompt,
} from './prompts';

const card = (over: Partial<Prompt> = {}): Prompt => ({ id: 1, text: 'Go.', nsfwLevel: 'Mild', ...over });

/**
 * Conventions from CLAUDE.md, enforced. These are structural: they catch a
 * malformed or off-convention card without pinning any count, so an ordinary
 * deck edit does not fail the suite.
 */
describe('deck integrity', () => {
  it('has a unique whole-number id on every card', () => {
    const ids = PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(PROMPTS.length);
    expect(ids.filter((id) => !Number.isInteger(id) || id <= 0)).toEqual([]);
  });

  it('has no empty or untrimmed card', () => {
    expect(PROMPTS.filter((p) => p.text.trim() !== p.text || p.text.length === 0)).toEqual([]);
  });

  it('has no card written twice', () => {
    const seen = new Map<string, number>();
    const duplicates: string[] = [];
    for (const p of PROMPTS) {
      if (seen.has(p.text)) duplicates.push(`${seen.get(p.text)} and ${p.id}: ${p.text}`);
      else seen.set(p.text, p.id);
    }
    expect(duplicates).toEqual([]);
  });

  it('uses no placeholder the game does not substitute', () => {
    const used = new Set(
      PROMPTS.flatMap((p) => [...p.text.matchAll(/\{\{[^}]*\}\}/g)].map((m) => m[0])),
    );
    expect([...used]).toEqual(['{{randomOtherPlayer}}']);
  });

  it('tags every card with a real intensity tier', () => {
    const tiers = new Set(PROMPTS.map((p) => p.nsfwLevel));
    expect([...tiers].sort()).toEqual(['Extreme', 'Medium', 'Mild']);
  });

  it('only ever marks scope explicitly to say "room"', () => {
    // 'player' is the default and is left absent, so a stray `scope: 'player'`
    // means somebody was working from the wrong mental model.
    const values = new Set(PROMPTS.map((p) => p.scope ?? 'absent'));
    expect([...values].sort()).toEqual(['absent', 'room']);
  });

  it('scopes every Never Have I Ever card to the room', () => {
    const misScoped = PROMPTS.filter(isNhiePrompt).filter((p) => !isRoomPrompt(p));
    expect(misScoped.map((p) => p.id)).toEqual([]);
  });

  it('keeps every opt-out on one of the four rungs of the ladder', () => {
    const RUNGS = ['or take a drink', 'or take 2 drinks', 'or take 3 drinks', 'or take a shot'];
    const offLadder = PROMPTS.filter((p) => /\bor take\b/i.test(p.text)).filter(
      (p) => !RUNGS.some((rung) => p.text.includes(rung)),
    );
    expect(offLadder.map((p) => `${p.id}: ${p.text}`)).toEqual([]);
  });

  it('gives each tier and the NHIE draw something to deal', () => {
    for (const tier of ['Mild', 'Medium', 'Extreme'] as const) {
      expect(PROMPTS.filter((p) => p.nsfwLevel === tier).length).toBeGreaterThan(0);
    }
    expect(PROMPTS.filter(isNhiePrompt).length).toBeGreaterThan(0);
  });
});

describe('GAME_MODES', () => {
  it('offers the three tiers plus NHIE, in that order', () => {
    expect(GAME_MODES.map((m) => m.id)).toEqual(['Mild', 'Medium', 'Extreme', 'NHIE']);
  });

  it('gives every mode a label, a badge, a description and a spice rating in range', () => {
    for (const mode of GAME_MODES) {
      expect(mode.label.length).toBeGreaterThan(0);
      expect(mode.badge.length).toBeGreaterThan(0);
      expect(mode.description.length).toBeGreaterThan(0);
      expect(mode.spice).toBeGreaterThanOrEqual(1);
      expect(mode.spice).toBeLessThanOrEqual(4);
    }
  });
});

describe('isNhiePrompt', () => {
  it('matches only a card that opens with the phrase', () => {
    expect(isNhiePrompt(card({ text: 'Never have I ever done that.' }))).toBe(true);
    expect(isNhiePrompt(card({ text: '  never have i ever done that.' }))).toBe(true);
    expect(isNhiePrompt(card({ text: 'Say never have I ever.' }))).toBe(false);
    expect(isNhiePrompt(card({ text: 'Never have I everest.' }))).toBe(false);
  });

  it('agrees with the exported pattern', () => {
    for (const p of PROMPTS) expect(isNhiePrompt(p)).toBe(NHIE_PATTERN.test(p.text.trim()));
  });
});

describe('isRoomPrompt', () => {
  it('is true only for a card marked room', () => {
    expect(isRoomPrompt(card({ scope: 'room' }))).toBe(true);
    expect(isRoomPrompt(card())).toBe(false);
    expect(isRoomPrompt(card({ scope: 'player' }))).toBe(false);
  });
});

describe('getPromptCategory', () => {
  it('sorts each kind of card, with NHIE and timed winning over the generic buckets', () => {
    expect(getPromptCategory(card({ text: 'Never have I ever, for 30 seconds?' }))).toBe('nhie');
    expect(getPromptCategory(card({ text: 'Hold a plank for 30 seconds.' }))).toBe('timed');
    expect(getPromptCategory(card({ text: 'Drink if you have ever lied.' }))).toBe('drink');
    expect(getPromptCategory(card({ text: 'Take a shot.' }))).toBe('drink');
    expect(getPromptCategory(card({ text: 'What is your worst habit?' }))).toBe('question');
    expect(getPromptCategory(card({ text: 'Do your best impression.' }))).toBe('dare');
  });

  it('returns a known category for every card in the deck', () => {
    const known = new Set(['nhie', 'timed', 'drink', 'question', 'dare']);
    for (const p of PROMPTS) expect(known.has(getPromptCategory(p))).toBe(true);
  });
});
