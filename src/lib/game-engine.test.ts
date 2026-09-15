import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gameReducer, initialGameState, type GameState } from './game-engine';
import type { Prompt } from './prompts';
import type { StoredGame } from './session';

const P = (id: number): Prompt => ({ id, text: `Card ${id}.`, nsfwLevel: 'Mild' });

const base = (over: Partial<GameState> = {}): GameState => ({
  ...initialGameState,
  players: ['Alex', 'Sam', 'Jordan'],
  availablePrompts: [P(1), P(2), P(3), P(4)],
  currentPrompt: P(1),
  ...over,
});

beforeEach(() => {
  // Pin every deal and shuffle so a transition is deterministic; the randomness
  // itself is covered in game.test.ts.
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('NEXT', () => {
  it('counts the outgoing turn, records it, and deals a fresh card', () => {
    const state = base({ currentPlayerIndex: 0, usedPromptIds: new Set(), upcomingTurns: [] });
    const next = gameReducer(state, { type: 'NEXT', text: 'Alex, card 1.' });

    expect(next.turnsByName.Alex).toBe(1);
    expect(next.usedPromptIds.has(1)).toBe(true);
    expect(next.history).toHaveLength(1);
    expect(next.history[0]).toMatchObject({ playerName: 'Alex', playerIndex: 0, countedTurn: true, text: 'Alex, card 1.' });
    expect(next.currentPrompt).not.toBeNull();
    expect(next.currentPrompt!.id).not.toBe(1); // a different card than the one just played
    expect(next.cardKey).toBe(state.cardKey + 1);
  });

  it('ends the night when the last card is played', () => {
    const state = base({ availablePrompts: [P(1)], currentPrompt: P(1), usedPromptIds: new Set() });
    const next = gameReducer(state, { type: 'NEXT', text: 'x' });
    expect(next.gameEnded).toBe(true);
    expect(next.currentPrompt).toBeNull();
  });

  it('does nothing once the game has ended', () => {
    const state = base({ gameEnded: true, currentPrompt: null });
    expect(gameReducer(state, { type: 'NEXT', text: 'x' })).toBe(state);
  });
});

describe('SKIP', () => {
  it('records an uncounted turn, keeps the same player, and deals again', () => {
    const state = base({ currentPlayerIndex: 2, usedPromptIds: new Set(), turnsByName: {} });
    const next = gameReducer(state, { type: 'SKIP', text: 'skip me' });

    expect(next.turnsByName).toEqual({}); // no tally
    expect(next.currentPlayerIndex).toBe(2); // same player up
    expect(next.history[0]).toMatchObject({ countedTurn: false, playerName: 'Jordan' });
    expect(next.usedPromptIds.has(1)).toBe(true);
  });
});

describe('HIDE', () => {
  it('hides the card, drops it from the deck, and deals another to the same player', () => {
    const state = base({ currentPlayerIndex: 1, currentPrompt: P(1), usedPromptIds: new Set(), turnsByName: {} });
    const hidden = gameReducer(state, { type: 'HIDE' });

    expect(hidden.hiddenIds.has(1)).toBe(true);
    expect(hidden.availablePrompts.some((p) => p.id === 1)).toBe(false);
    expect(hidden.currentPlayerIndex).toBe(1); // same player up
    expect(hidden.turnsByName).toEqual({}); // no tally
    expect(hidden.history).toHaveLength(0); // deliberate, not undoable
    expect(hidden.currentPrompt).not.toBeNull();
    expect(hidden.currentPrompt!.id).not.toBe(1);
  });

  it('ends the night when the hidden card was the last one', () => {
    const state = base({ availablePrompts: [P(1)], currentPrompt: P(1), usedPromptIds: new Set() });
    const hidden = gameReducer(state, { type: 'HIDE' });
    expect(hidden.gameEnded).toBe(true);
    expect(hidden.currentPrompt).toBeNull();
  });

  it('does nothing once the game has ended', () => {
    const state = base({ gameEnded: true, currentPrompt: null });
    expect(gameReducer(state, { type: 'HIDE' })).toBe(state);
  });
});

describe('hidden cards keep out of the deck', () => {
  // 1177 is a Mild card, so it is in a Mild deck unless the device has hidden it.
  it('START excludes a hidden id from the fresh deck', () => {
    const started = gameReducer(initialGameState, {
      type: 'START', players: ['A', 'B'], nsfwLevel: 'Mild', hiddenIds: [1177],
    });
    expect(started.availablePrompts.some((p) => p.id === 1177)).toBe(false);
  });

  it('RESTORE excludes a hidden id, one fewer card than without it', () => {
    const restore = (hiddenIds: number[]) =>
      gameReducer(initialGameState, {
        type: 'RESTORE',
        saved: {
          players: ['Alex', 'Sam'], nsfwLevel: 'Mild', currentPlayerIndex: 0,
          currentPromptId: null, processedPromptText: '', usedPromptIds: [],
          upcomingTurns: [], turnsByName: {}, history: [], gameEnded: false,
        },
        hiddenIds,
      });
    const full = restore([]).availablePrompts.length;
    const trimmed = restore([1177]);
    expect(trimmed.availablePrompts.some((p) => p.id === 1177)).toBe(false);
    expect(trimmed.availablePrompts.length).toBe(full - 1);
  });
});

describe('UNDO', () => {
  it('reverses a counted turn: tally, used id, prompt and seat', () => {
    const state = base({
      currentPlayerIndex: 1,
      currentPrompt: P(2),
      usedPromptIds: new Set([1]),
      turnsByName: { Alex: 1 },
      history: [{ prompt: P(1), playerIndex: 0, playerName: 'Alex', text: 'Alex, card 1.', upcoming: [1, 2], countedTurn: true }],
    });
    const undone = gameReducer(state, { type: 'UNDO' });

    expect(undone.turnsByName.Alex).toBe(0);
    expect(undone.usedPromptIds.has(1)).toBe(false);
    expect(undone.currentPrompt).toEqual(P(1));
    expect(undone.currentPlayerIndex).toBe(0);
    expect(undone.history).toHaveLength(0);
    expect(undone.gameEnded).toBe(false);
  });

  it('does not decrement the tally for an undone skip', () => {
    const state = base({
      turnsByName: { Sam: 2 },
      history: [{ prompt: P(1), playerIndex: 1, playerName: 'Sam', text: 'x', upcoming: [], countedTurn: false }],
    });
    expect(gameReducer(state, { type: 'UNDO' }).turnsByName.Sam).toBe(2);
  });

  it('attributes by name after a removal shifted the seats', () => {
    // Sam took a turn from seat 1, then Alex (seat 0) was removed: the roster is
    // now [Sam, Jordan], so seat 1 is Jordan. Undo must credit Sam, not Jordan.
    const state = base({
      players: ['Sam', 'Jordan'],
      currentPlayerIndex: 1,
      currentPrompt: P(2),
      usedPromptIds: new Set([1]),
      turnsByName: { Sam: 1 },
      history: [{ prompt: P(1), playerIndex: 1, playerName: 'Sam', text: 'x', upcoming: [], countedTurn: true }],
    });
    const undone = gameReducer(state, { type: 'UNDO' });
    expect(undone.turnsByName.Sam).toBe(0);
    expect(undone.turnsByName.Jordan).toBeUndefined();
    expect(undone.currentPlayerIndex).toBe(0); // Sam's current seat
  });

  it('is a no-op with nothing to undo', () => {
    const state = base({ history: [] });
    expect(gameReducer(state, { type: 'UNDO' })).toBe(state);
  });
});

describe('RESTART', () => {
  it('resets progress, seats the first player, and deals', () => {
    const state = base({
      currentPlayerIndex: 2,
      usedPromptIds: new Set([1, 2]),
      turnsByName: { Alex: 3 },
      history: [{ prompt: P(1), playerIndex: 0, playerName: 'Alex', text: 'x', upcoming: [], countedTurn: true }],
      gameEnded: true,
    });
    const restarted = gameReducer(state, { type: 'RESTART' });

    expect(restarted.currentPlayerIndex).toBe(0);
    expect(restarted.usedPromptIds.size).toBe(0);
    expect(restarted.history).toHaveLength(0);
    expect(restarted.turnsByName).toEqual({});
    expect(restarted.gameEnded).toBe(false);
    expect(restarted.currentPrompt).not.toBeNull();
    expect(restarted.players).toEqual(['Alex', 'Sam', 'Jordan']); // crew kept
  });
});

describe('SET_MODE', () => {
  it('deals a fresh deck and resets progress but keeps the crew and seat', () => {
    const state = base({ nsfwLevel: 'Mild', currentPlayerIndex: 2, usedPromptIds: new Set([1]), turnsByName: { Sam: 1 } });
    const switched = gameReducer(state, { type: 'SET_MODE', nsfwLevel: 'Extreme' });

    expect(switched.nsfwLevel).toBe('Extreme');
    expect(switched.currentPlayerIndex).toBe(2); // seat carries over
    expect(switched.usedPromptIds.size).toBe(0);
    expect(switched.turnsByName).toEqual({});
    expect(switched.currentPrompt).not.toBeNull();
  });

  it('is a no-op when the mode is unchanged', () => {
    const state = base({ nsfwLevel: 'Mild' });
    expect(gameReducer(state, { type: 'SET_MODE', nsfwLevel: 'Mild' })).toBe(state);
  });
});

describe('ADD_PLAYER / REMOVE_PLAYER', () => {
  it('appends a player and grows the queue', () => {
    const state = base({ players: ['Alex', 'Sam'], upcomingTurns: [1] });
    const added = gameReducer(state, { type: 'ADD_PLAYER', name: 'Kim' });
    expect(added.players).toEqual(['Alex', 'Sam', 'Kim']);
    expect(added.upcomingTurns).toContain(2); // new seat is queued
    expect(added.upcomingTurns).toHaveLength(2);
  });

  it('removes a player and remaps the seat and queue', () => {
    const state = base({ players: ['Alex', 'Sam', 'Jordan'], currentPlayerIndex: 2, upcomingTurns: [1] });
    const removed = gameReducer(state, { type: 'REMOVE_PLAYER', index: 0 });
    expect(removed.players).toEqual(['Sam', 'Jordan']);
    expect(removed.currentPlayerIndex).toBe(1); // Jordan, shifted down from seat 2
    expect(removed.upcomingTurns).toEqual([0]); // seat 1 shifted down to 0
  });
});

describe('RESTORE', () => {
  const stored = (over: Partial<StoredGame> = {}): StoredGame => ({
    players: ['Alex', 'Sam', 'Jordan'],
    nsfwLevel: 'Mild',
    currentPlayerIndex: 1,
    currentPromptId: 1,
    processedPromptText: '',
    usedPromptIds: [1],
    upcomingTurns: [2, 0],
    turnsByName: { Alex: 1 },
    history: [],
    gameEnded: false,
    ...over,
  });

  it('rehydrates a night in progress', () => {
    const state = gameReducer(initialGameState, { type: 'RESTORE', saved: stored(), hiddenIds: [] });
    expect(state.players).toEqual(['Alex', 'Sam', 'Jordan']);
    expect(state.currentPlayerIndex).toBe(1);
    expect([...state.usedPromptIds]).toEqual([1]);
    expect(state.currentPrompt?.id).toBe(1);
    expect(state.turnsByName).toEqual({ Alex: 1 });
    expect(state.availablePrompts.length).toBeGreaterThan(0);
  });

  it('deals a first card for a roster-only record (a fresh start)', () => {
    const state = gameReducer(initialGameState, {
      type: 'RESTORE',
      saved: stored({ currentPromptId: null, usedPromptIds: [], upcomingTurns: [], turnsByName: {}, gameEnded: false }),
      hiddenIds: [],
    });
    expect(state.currentPrompt).not.toBeNull();
    expect(state.usedPromptIds.size).toBe(0);
  });

  it('deals a replacement when the saved card has left the deck', () => {
    const state = gameReducer(initialGameState, {
      type: 'RESTORE',
      saved: stored({ currentPromptId: 9_999_999, usedPromptIds: [1] }),
      hiddenIds: [],
    });
    expect(state.currentPrompt).not.toBeNull();
    expect(state.currentPrompt?.id).not.toBe(9_999_999);
    expect(state.gameEnded).toBe(false);
  });

  it('drops undo entries whose card id has left the deck', () => {
    const state = gameReducer(initialGameState, {
      type: 'RESTORE',
      saved: stored({
        history: [
          { promptId: 1, playerIndex: 0, playerName: 'Alex', text: 'ok', upcoming: [], countedTurn: true },
          { promptId: 9_999_999, playerIndex: 1, playerName: 'Sam', text: 'gone', upcoming: [], countedTurn: true },
        ],
      }),
      hiddenIds: [],
    });
    expect(state.history).toHaveLength(1);
    expect(state.history[0].prompt.id).toBe(1);
  });
});
