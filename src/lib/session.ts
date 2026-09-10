/**
 * The saved game, and the only reader/writer for it.
 *
 * A game in progress used to live in the play URL's query string, which meant
 * real people's names landed in browser history, omnibox autocomplete, server
 * access logs, and the address bar of every screenshot — on a game whose whole
 * premise is handing the phone to somebody else. It lives here instead, and
 * `/game` carries no query string at all.
 *
 * Everything this module returns has been validated. Browser storage is
 * editable by hand, shared with older builds of the app, and survives deck
 * changes, so a record read back is treated as untrusted input: bad shapes are
 * rejected, out-of-range values are clamped, and anything unrecognised is
 * dropped rather than handed to the game screen.
 */

import { GAME_MODES, type GameMode } from './prompts';
import { MAX_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS, normaliseRoster } from './roster';

/** The game in progress. Cleared when a night ends or the crew heads back to setup. */
export const GAME_STATE_KEY = 'afterhours.game';
/** The last crew to play on this device, so setup prefills. Outlives the game above. */
export const LAST_SETUP_KEY = 'afterhours.lastSetup';

/**
 * A saved game is a party in progress, not an archive. Twelve hours covers
 * "somebody locked the phone and we picked it up after another round" and
 * expires well before last weekend's roster could resurface at this weekend's.
 */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

/** Bumped when the shape below changes; an older record is discarded, not migrated. */
const SCHEMA_VERSION = 1;

/** How far back Undo can reach. Also bounds the history a saved record may carry. */
export const HISTORY_LIMIT = 20;

/** The longest prompt in the deck is 171 characters; a name prefix adds at most 22. */
const MAX_PROMPT_TEXT = 240;

/** Roster churn over a night can leave tallies for people who have since left. */
const MAX_TALLY_ENTRIES = MAX_PLAYERS * 3;

/**
 * A played or skipped card, as stored. Prompts are held by `promptId` rather
 * than by value: ids are stable (the deck is never renumbered) and a card whose
 * text changed between sessions should come back as the text now in the deck.
 */
export type StoredTurn = {
  promptId: number;
  playerIndex: number;
  text: string;
  upcoming: number[];
  countedTurn: boolean;
};

export type StoredGame = {
  players: string[];
  nsfwLevel: GameMode;
  currentPlayerIndex: number;
  currentPromptId: number | null;
  /**
   * The card exactly as it was on screen. Stored because `{{randomOtherPlayer}}`
   * is substituted at draw time — re-deriving it on resume would silently swap
   * the name in the middle of a card the group is looking at.
   */
  processedPromptText: string;
  usedPromptIds: number[];
  upcomingTurns: number[];
  turnsByName: Record<string, number>;
  history: StoredTurn[];
  gameEnded: boolean;
};

export type LastSetup = {
  players: string[];
  nsfwLevel: GameMode;
};

// --- storage plumbing -------------------------------------------------------
// Every access is wrapped: Safari's private mode throws on write, storage can
// be disabled outright, and a quota error must never take down a game.

const readJson = (key: string): unknown => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is a convenience; play continues without it.
  }
};

const remove = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // As above.
  }
};

// --- validators -------------------------------------------------------------

export const isGameMode = (value: unknown): value is GameMode =>
  GAME_MODES.some((mode) => mode.id === value);

const isWholeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

/** A seat number that actually exists in the given roster, or null. */
const asSeat = (value: unknown, seats: number): number | null =>
  isWholeNumber(value) && value < seats ? value : null;

const asSeatList = (value: unknown, seats: number): number[] =>
  Array.isArray(value) ? value.filter((n): n is number => asSeat(n, seats) !== null) : [];

/**
 * Prompt ids are not range-checked here — that would mean importing the deck
 * into every module that touches storage. The game screen resolves them against
 * `PROMPTS` and ignores any that no longer exist.
 */
const asPromptIds = (value: unknown): number[] =>
  Array.isArray(value) ? Array.from(new Set(value.filter(isWholeNumber))) : [];

const asText = (value: unknown): string =>
  typeof value === 'string' ? value.slice(0, MAX_PROMPT_TEXT) : '';

const asTurn = (value: unknown, seats: number): StoredTurn | null => {
  if (!value || typeof value !== 'object') return null;
  const turn = value as Record<string, unknown>;
  if (!isWholeNumber(turn.promptId)) return null;
  const playerIndex = asSeat(turn.playerIndex, seats);
  if (playerIndex === null) return null;
  return {
    promptId: turn.promptId,
    playerIndex,
    text: asText(turn.text),
    upcoming: asSeatList(turn.upcoming, seats),
    countedTurn: turn.countedTurn === true,
  };
};

const asTally = (value: unknown): Record<string, number> => {
  const tally: Record<string, number> = {};
  if (!value || typeof value !== 'object') return tally;
  for (const [name, count] of Object.entries(value as Record<string, unknown>)) {
    if (Object.keys(tally).length >= MAX_TALLY_ENTRIES) break;
    if (!name || name.length > MAX_NAME_LENGTH) continue;
    if (isWholeNumber(count)) tally[name] = count;
  }
  return tally;
};

// --- the saved game ---------------------------------------------------------

export function readGame(): StoredGame | null {
  const raw = readJson(GAME_STATE_KEY);
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;

  if (record.v !== SCHEMA_VERSION) return null;
  if (!isWholeNumber(record.savedAt) || Date.now() - record.savedAt > MAX_AGE_MS) return null;

  // The roster gates everything else: seat numbers elsewhere in the record are
  // only meaningful against it, so a roster that fails validation voids the
  // whole record rather than leaving indexes pointing at nobody.
  const players = normaliseRoster(record.players);
  if (players.length < MIN_PLAYERS) return null;
  if (!isGameMode(record.nsfwLevel)) return null;

  const history = Array.isArray(record.history)
    ? record.history
        .slice(-HISTORY_LIMIT)
        .map((entry) => asTurn(entry, players.length))
        .filter((turn): turn is StoredTurn => turn !== null)
    : [];

  return {
    players,
    nsfwLevel: record.nsfwLevel,
    currentPlayerIndex: asSeat(record.currentPlayerIndex, players.length) ?? 0,
    currentPromptId: isWholeNumber(record.currentPromptId) ? record.currentPromptId : null,
    processedPromptText: asText(record.processedPromptText),
    usedPromptIds: asPromptIds(record.usedPromptIds),
    upcomingTurns: asSeatList(record.upcomingTurns, players.length),
    turnsByName: asTally(record.turnsByName),
    history,
    gameEnded: record.gameEnded === true,
  };
}

export const writeGame = (game: StoredGame): void =>
  writeJson(GAME_STATE_KEY, { v: SCHEMA_VERSION, savedAt: Date.now(), ...game });

export const clearGame = (): void => remove(GAME_STATE_KEY);

/**
 * A saved game that has cards left in it and is therefore worth offering to
 * resume. A finished night is kept (so a refresh on the finale screen does not
 * dump the group back to setup) but is not something to come back to.
 */
export const isResumable = (game: StoredGame | null): game is StoredGame =>
  game !== null && !game.gameEnded && game.usedPromptIds.length > 0;

// --- the remembered crew ----------------------------------------------------

export function readLastSetup(): LastSetup | null {
  const raw = readJson(LAST_SETUP_KEY);
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const players = normaliseRoster(record.players);
  if (players.length < MIN_PLAYERS) return null;
  return {
    players,
    nsfwLevel: isGameMode(record.nsfwLevel) ? record.nsfwLevel : 'Mild',
  };
}

export const writeLastSetup = (setup: LastSetup): void => writeJson(LAST_SETUP_KEY, setup);

export const clearLastSetup = (): void => remove(LAST_SETUP_KEY);
