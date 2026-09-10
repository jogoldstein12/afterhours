import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GAME_STATE_KEY,
  HISTORY_LIMIT,
  LAST_SETUP_KEY,
  clearGame,
  isGameMode,
  isResumable,
  readGame,
  readLastSetup,
  writeGame,
  writeLastSetup,
  type StoredGame,
} from './session';
import { MAX_PLAYERS } from './roster';

/**
 * A minimal localStorage. `throwOnWrite` reproduces Safari private mode, where
 * `setItem` throws and the game must carry on regardless.
 */
class MemoryStorage {
  private data = new Map<string, string>();
  throwOnWrite = false;
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string) {
    if (this.throwOnWrite) throw new DOMException('QuotaExceededError');
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  raw(key: string) {
    return this.data.get(key);
  }
  put(key: string, value: string) {
    this.data.set(key, value);
  }
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
  vi.stubGlobal('window', { localStorage: storage });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const game = (over: Partial<StoredGame> = {}): StoredGame => ({
  players: ['Alex', 'Sam', 'Jordan'],
  nsfwLevel: 'Extreme',
  currentPlayerIndex: 1,
  currentPromptId: 42,
  processedPromptText: 'Sam, do the thing.',
  usedPromptIds: [1, 2, 3],
  upcomingTurns: [2, 0],
  turnsByName: { Alex: 2, Sam: 1 },
  history: [{ promptId: 1, playerIndex: 0, text: 'Alex, go.', upcoming: [1, 2], countedTurn: true }],
  gameEnded: false,
  ...over,
});

/** Write a record straight to storage, bypassing writeGame's stamping. */
const put = (record: unknown) => storage.put(GAME_STATE_KEY, JSON.stringify(record));
const stamped = (over: Record<string, unknown> = {}) => ({
  v: 1,
  savedAt: Date.now(),
  ...game(),
  ...over,
});

describe('round trip', () => {
  it('reads back exactly what was written', () => {
    const original = game();
    writeGame(original);
    expect(readGame()).toEqual(original);
  });

  it('survives storage that refuses to write', () => {
    storage.throwOnWrite = true;
    expect(() => writeGame(game())).not.toThrow();
    expect(readGame()).toBeNull();
  });

  it('clears', () => {
    writeGame(game());
    clearGame();
    expect(readGame()).toBeNull();
  });
});

describe('records that must be refused outright', () => {
  it('refuses missing, unparseable, or non-object storage', () => {
    expect(readGame()).toBeNull();
    storage.put(GAME_STATE_KEY, '{{{');
    expect(readGame()).toBeNull();
    storage.put(GAME_STATE_KEY, '"a string"');
    expect(readGame()).toBeNull();
    storage.put(GAME_STATE_KEY, 'null');
    expect(readGame()).toBeNull();
  });

  it('refuses a record from another schema version', () => {
    put(stamped({ v: 2 }));
    expect(readGame()).toBeNull();
  });

  it('refuses a record with no usable timestamp', () => {
    put(stamped({ savedAt: 'yesterday' }));
    expect(readGame()).toBeNull();
  });

  it('expires after twelve hours', () => {
    const now = Date.now();
    put(stamped({ savedAt: now - 11 * 3600_000 }));
    expect(readGame()).not.toBeNull();
    put(stamped({ savedAt: now - 13 * 3600_000 }));
    expect(readGame()).toBeNull();
  });

  it('refuses an unknown game mode', () => {
    put(stamped({ nsfwLevel: 'Nuclear' }));
    expect(readGame()).toBeNull();
  });

  it('refuses a roster below the minimum, however it got that way', () => {
    put(stamped({ players: ['Solo'] }));
    expect(readGame()).toBeNull();
    put(stamped({ players: 'Alex' }));
    expect(readGame()).toBeNull();
    // Deduplication can push a roster under the minimum.
    put(stamped({ players: ['Sam', 'sam', '   '] }));
    expect(readGame()).toBeNull();
  });
});

describe('records that are repaired rather than refused', () => {
  it('normalises the roster and caps it', () => {
    const many = Array.from({ length: 40 }, (_, i) => `P${i}`);
    put(stamped({ players: many, currentPlayerIndex: 0, upcomingTurns: [], history: [] }));
    expect(readGame()!.players).toHaveLength(MAX_PLAYERS);
  });

  it('clamps a seat number that is not in the roster', () => {
    put(stamped({ currentPlayerIndex: 99 }));
    expect(readGame()!.currentPlayerIndex).toBe(0);
    put(stamped({ currentPlayerIndex: -1 }));
    expect(readGame()!.currentPlayerIndex).toBe(0);
    put(stamped({ currentPlayerIndex: 1.5 }));
    expect(readGame()!.currentPlayerIndex).toBe(0);
  });

  it('drops queue entries that point at nobody', () => {
    put(stamped({ upcomingTurns: [0, 9, 2, -3, 'x', 1.5] }));
    expect(readGame()!.upcomingTurns).toEqual([0, 2]);
    put(stamped({ upcomingTurns: 'nope' }));
    expect(readGame()!.upcomingTurns).toEqual([]);
  });

  it('keeps prompt ids whole and unique, and leaves range-checking to the deck', () => {
    put(stamped({ usedPromptIds: [1, 1, 2, 'x', 2.5, -1, 999999] }));
    expect(readGame()!.usedPromptIds).toEqual([1, 2, 999999]);
  });

  it('bounds the card text', () => {
    put(stamped({ processedPromptText: 'z'.repeat(9000) }));
    expect(readGame()!.processedPromptText.length).toBeLessThanOrEqual(240);
    put(stamped({ processedPromptText: { not: 'a string' } }));
    expect(readGame()!.processedPromptText).toBe('');
  });

  it('keeps only whole non-negative tallies, and bounds how many', () => {
    put(stamped({ turnsByName: { Alex: 3, Sam: -1, Jordan: 'x', Kim: 2.5 } }));
    expect(readGame()!.turnsByName).toEqual({ Alex: 3 });

    const huge = Object.fromEntries(Array.from({ length: 500 }, (_, i) => [`P${i}`, 1]));
    put(stamped({ turnsByName: huge }));
    expect(Object.keys(readGame()!.turnsByName).length).toBeLessThanOrEqual(MAX_PLAYERS * 3);

    const longKey = { ['x'.repeat(500)]: 1, Alex: 1 };
    put(stamped({ turnsByName: longKey }));
    expect(readGame()!.turnsByName).toEqual({ Alex: 1 });
  });

  it('drops history entries that are malformed or point at nobody', () => {
    put(
      stamped({
        history: [
          { promptId: 1, playerIndex: 0, text: 'ok', upcoming: [1], countedTurn: true },
          { promptId: 2, playerIndex: 42, text: 'seat gone', upcoming: [], countedTurn: true },
          { playerIndex: 0, text: 'no prompt id', upcoming: [], countedTurn: false },
          'not an object',
          null,
        ],
      }),
    );
    const history = readGame()!.history;
    expect(history).toHaveLength(1);
    expect(history[0].promptId).toBe(1);
  });

  it('caps history at the undo depth', () => {
    const long = Array.from({ length: 200 }, (_, i) => ({
      promptId: i + 1,
      playerIndex: 0,
      text: `t${i}`,
      upcoming: [],
      countedTurn: true,
    }));
    put(stamped({ history: long }));
    const history = readGame()!.history;
    expect(history).toHaveLength(HISTORY_LIMIT);
    // The most recent entries are the ones Undo can still reach.
    expect(history[history.length - 1].promptId).toBe(200);
  });

  it('treats a missing gameEnded as not ended', () => {
    put(stamped({ gameEnded: 'yes' }));
    expect(readGame()!.gameEnded).toBe(false);
  });
});

describe('isResumable', () => {
  it('offers a night that is under way', () => {
    expect(isResumable(game())).toBe(true);
  });

  it('does not offer a night with nothing in it yet', () => {
    expect(isResumable(game({ usedPromptIds: [] }))).toBe(false);
  });

  it('does not offer a night that has finished', () => {
    expect(isResumable(game({ gameEnded: true }))).toBe(false);
  });

  it('does not offer nothing at all', () => {
    expect(isResumable(null)).toBe(false);
  });
});

describe('the remembered crew', () => {
  it('round-trips', () => {
    writeLastSetup({ players: ['Alex', 'Sam'], nsfwLevel: 'Medium' });
    expect(readLastSetup()).toEqual({ players: ['Alex', 'Sam'], nsfwLevel: 'Medium' });
  });

  it('falls back to Mild rather than refusing an unknown mode', () => {
    storage.put(LAST_SETUP_KEY, JSON.stringify({ players: ['Alex', 'Sam'], nsfwLevel: 'Nuclear' }));
    expect(readLastSetup()!.nsfwLevel).toBe('Mild');
  });

  it('refuses a crew too small to play', () => {
    storage.put(LAST_SETUP_KEY, JSON.stringify({ players: ['Alex'], nsfwLevel: 'Mild' }));
    expect(readLastSetup()).toBeNull();
  });

  it('is independent of the saved game', () => {
    writeLastSetup({ players: ['Alex', 'Sam'], nsfwLevel: 'Mild' });
    writeGame(game());
    clearGame();
    expect(readLastSetup()).not.toBeNull();
  });
});

describe('isGameMode', () => {
  it('accepts every real mode and nothing else', () => {
    for (const mode of ['Mild', 'Medium', 'Extreme', 'NHIE']) expect(isGameMode(mode)).toBe(true);
    for (const mode of ['mild', 'Nuclear', '', null, undefined, 3]) expect(isGameMode(mode)).toBe(false);
  });
});
