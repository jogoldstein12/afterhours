import { describe, expect, it } from 'vitest';
import {
  extractDurationSeconds,
  filterDeck,
  promptById,
  renderPromptText,
  shuffledIndices,
} from './game';
import { PROMPTS, isNhiePrompt, type Prompt } from './prompts';

const card = (over: Partial<Prompt> = {}): Prompt => ({
  id: 1,
  text: 'Do the thing.',
  nsfwLevel: 'Mild',
  ...over,
});

/** Pins the {{randomOtherPlayer}} draw so a test asserts text, not luck. */
const first = (names: string[]) => names[0];

describe('renderPromptText', () => {
  const players = ['Alex', 'Sam', 'Jordan'];

  it('prefixes a plain dare with the current player, lowercasing the first word', () => {
    expect(renderPromptText(card({ text: 'Do a shot.' }), players, 1)).toBe('Sam, do a shot.');
  });

  it('leaves a question unprefixed — the turn indicator already directs it', () => {
    expect(renderPromptText(card({ text: 'What is your worst date?' }), players, 1)).toBe(
      'What is your worst date?',
    );
  });

  it('never prefixes a room card, however it is phrased', () => {
    const room = card({ text: 'Drink if you have ever been caught.', scope: 'room' });
    expect(renderPromptText(room, players, 1)).toBe('Drink if you have ever been caught.');
  });

  it('prefixes a "Drink if" card that is scoped to a player', () => {
    const solo = card({ text: 'Drink if you have ever been caught.' });
    expect(renderPromptText(solo, players, 0)).toBe('Alex, drink if you have ever been caught.');
  });

  it('substitutes {{randomOtherPlayer}} with somebody who is not the current player', () => {
    const text = renderPromptText(card({ text: 'Kiss {{randomOtherPlayer}}.' }), players, 0, first);
    expect(text).toBe('Alex, kiss Sam.');
    for (let i = 0; i < 200; i++) {
      const rendered = renderPromptText(card({ text: 'Kiss {{randomOtherPlayer}}.' }), players, 0);
      expect(rendered).not.toContain('{{randomOtherPlayer}}');
      expect(rendered).not.toBe('Alex, kiss Alex.');
    }
  });

  it('substitutes every occurrence, not just the first', () => {
    const two = card({ text: 'Tell {{randomOtherPlayer}} what you think of {{randomOtherPlayer}}.' });
    expect(renderPromptText(two, players, 0, first)).toBe(
      'Alex, tell Sam what you think of Sam.',
    );
  });

  it('does not double-address a card that opens on the other player', () => {
    const opener = card({ text: '{{randomOtherPlayer}} picks your next dare.' });
    expect(renderPromptText(opener, players, 0, first)).toBe('Sam picks your next dare.');
  });

  it('falls back to a generic name when there is nobody else', () => {
    expect(renderPromptText(card({ text: 'Kiss {{randomOtherPlayer}}.' }), ['Alex'], 0)).toBe(
      'Alex, kiss another player.',
    );
  });

  it('capitalises an unprefixed card', () => {
    const room = card({ text: 'everybody drinks.', scope: 'room' });
    expect(renderPromptText(room, players, 0)).toBe('Everybody drinks.');
  });

  it('renders every card in the deck without leaving a placeholder or an empty card', () => {
    for (const prompt of PROMPTS) {
      for (const seat of [0, 1, 2]) {
        const text = renderPromptText(prompt, players, seat);
        expect(text).not.toContain('{{');
        expect(text.length).toBeGreaterThan(0);
        // A prefixed card must never name the same player twice in a row.
        expect(text).not.toMatch(new RegExp(`^${players[seat]}, ${players[seat]}\\b`));
      }
    }
  });

  it('renders every card at the two-player minimum', () => {
    for (const prompt of PROMPTS) {
      const text = renderPromptText(prompt, ['Alex', 'Sam'], 0, first);
      expect(text).not.toContain('{{');
      // With two players the placeholder always resolves to the other one, so
      // the "nobody else is here" fallback must never fire. Checked this way
      // rather than by searching the output for that phrase, because one card
      // uses the words "another player" in its own text.
      if (prompt.text.includes('{{randomOtherPlayer}}')) expect(text).toContain('Sam');
    }
  });
});

describe('filterDeck', () => {
  it('gives each tier only its own cards', () => {
    for (const mode of ['Mild', 'Medium', 'Extreme'] as const) {
      const deck = filterDeck(mode);
      expect(deck.length).toBeGreaterThan(0);
      expect(deck.every((p) => p.nsfwLevel === mode)).toBe(true);
    }
  });

  it('draws NHIE from every tier and nothing else', () => {
    const deck = filterDeck('NHIE');
    expect(deck.length).toBeGreaterThan(0);
    expect(deck.every(isNhiePrompt)).toBe(true);
    expect(new Set(deck.map((p) => p.nsfwLevel)).size).toBeGreaterThan(1);
  });

  it('accounts for every card exactly once across the three tiers', () => {
    const tiered = ['Mild', 'Medium', 'Extreme'].flatMap((m) => filterDeck(m as 'Mild'));
    expect(tiered).toHaveLength(PROMPTS.length);
    expect(new Set(tiered.map((p) => p.id)).size).toBe(PROMPTS.length);
  });
});

describe('promptById', () => {
  it('has an entry for every card and nothing more', () => {
    expect(promptById.size).toBe(PROMPTS.length);
    for (const prompt of PROMPTS) expect(promptById.get(prompt.id)).toBe(prompt);
  });
});

describe('shuffledIndices', () => {
  it('gives everybody exactly one turn per round', () => {
    for (let count = 2; count <= 10; count++) {
      const order = shuffledIndices(count);
      expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: count }, (_, i) => i));
    }
  });

  it('never opens a round on the player who just went', () => {
    for (let i = 0; i < 500; i++) {
      expect(shuffledIndices(4, 2)[0]).not.toBe(2);
      expect(shuffledIndices(2, 0)[0]).not.toBe(0);
    }
  });

  it('is fair over many rounds — nobody is systematically first', () => {
    const firsts = new Array(5).fill(0);
    for (let i = 0; i < 5000; i++) firsts[shuffledIndices(5)[0]] += 1;
    // Expected 1000 each; a 40% band catches a stuck or biased shuffle without
    // failing on ordinary variance.
    for (const n of firsts) expect(n).toBeGreaterThan(600);
    for (const n of firsts) expect(n).toBeLessThan(1400);
  });

  it('copes with a single player', () => {
    expect(shuffledIndices(1)).toEqual([0]);
    expect(shuffledIndices(1, 0)).toEqual([0]);
    expect(shuffledIndices(0)).toEqual([]);
  });
});

describe('extractDurationSeconds', () => {
  it('reads numeric seconds and minutes', () => {
    expect(extractDurationSeconds('Hold it for 15 seconds.')).toBe(15);
    expect(extractDurationSeconds('Talk for 1 second.')).toBe(1);
    expect(extractDurationSeconds('Dance for 2 minutes.')).toBe(120);
    expect(extractDurationSeconds('A one-minute rant.')).toBe(60);
    expect(extractDurationSeconds('A one minute rant.')).toBe(60);
  });

  it('prefers seconds when a card mentions both', () => {
    expect(extractDurationSeconds('30 seconds, not 2 minutes.')).toBe(30);
  });

  it('ignores spelled-out numbers, which are usually hypothetical', () => {
    expect(extractDurationSeconds('If you had ten minutes alone with them...')).toBeNull();
    expect(extractDurationSeconds('No timing here.')).toBeNull();
  });
});
