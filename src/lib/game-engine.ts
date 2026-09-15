/**
 * The game loop as a pure state machine.
 *
 * Every way the game moves — dealing a card, passing the phone, skipping,
 * undoing, restarting, changing intensity, adding or dropping a player,
 * restoring a saved night — is one action and one transition here. Keeping it
 * pure (a plain function of state and action, no React, no storage, no DOM)
 * makes the loop testable without a browser and reusable by a native shell, and
 * it is what makes a double-apply structurally impossible: the play screen only
 * dispatches, it never mutates game state by hand.
 *
 * Randomness (the card dealt, a reshuffled round) is drawn inside the deal via
 * `./game` helpers. The screen-facing text of a card — `{{randomOtherPlayer}}`
 * substitution and the name prefix — is deliberately NOT owned here: it stays a
 * derived value on the play screen, tagged to its card id, because hydration
 * lands it over several renders and that machinery is easy to get subtly wrong.
 * The transitions carry the already-rendered `text` in their payload so it can
 * be stored on the undo stack.
 */

import { filterDeck, pickNextPrompt, advanceTurnQueue, remapAfterRemoval, promptById } from './game';
import { type GameMode } from './modes';
import { type Prompt } from './prompts';
import { HISTORY_LIMIT, type StoredGame } from './session';

/**
 * A played or skipped card, as the undo stack holds it. `countedTurn`
 * distinguishes a played card (which incremented the tally and advanced the
 * rotation) from a skipped one (which did neither), so Undo reverses each
 * correctly. `playerName` is who took the turn: the tally is keyed by name and a
 * player can be removed mid-game (which reindexes seats), so Undo attributes by
 * name and only falls back to `playerIndex` when that name is gone.
 */
export type TurnSnapshot = {
  prompt: Prompt;
  playerIndex: number;
  playerName: string;
  text: string;
  upcoming: number[];
  countedTurn: boolean;
};

export type GameState = {
  players: string[];
  nsfwLevel: GameMode;
  currentPlayerIndex: number;
  currentPrompt: Prompt | null;
  availablePrompts: Prompt[];
  usedPromptIds: Set<number>;
  /** Cards hidden on this device ("never show this"). Excluded from every deal. */
  hiddenIds: Set<number>;
  gameEnded: boolean;
  /** Bumped whenever a new card is dealt, to key the card-enter animation. */
  cardKey: number;
  upcomingTurns: number[];
  history: TurnSnapshot[];
  /** Cards answered per player, keyed by name so it survives roster edits. */
  turnsByName: Record<string, number>;
};

export type GameAction =
  // Fresh game from a roster (setup, or a legacy /game?player= link). `hiddenIds`
  // is the device's "never show this" list, read from storage by the caller.
  | { type: 'START'; players: string[]; nsfwLevel: GameMode; hiddenIds: number[] }
  // Rehydrate a saved night as it was; `hiddenIds` as for START.
  | { type: 'RESTORE'; saved: StoredGame; hiddenIds: number[] }
  // Pass the phone: count the turn, deal the next card. `text` is the card as
  // shown, stored for Undo.
  | { type: 'NEXT'; text: string }
  // Decline the card: deal a fresh one to the same player, no tally, no rotation.
  | { type: 'SKIP'; text: string }
  // "Never show this": hide the current card on this device and deal another to
  // the same player. Like a skip, but the card leaves the deck for good.
  | { type: 'HIDE' }
  | { type: 'UNDO' }
  | { type: 'RESTART' }
  | { type: 'SET_MODE'; nsfwLevel: GameMode }
  // The name is validated by the caller (roster.ts) before it reaches here.
  | { type: 'ADD_PLAYER'; name: string }
  // The minimum-players guard lives on the caller (it raises a toast).
  | { type: 'REMOVE_PLAYER'; index: number };

export const initialGameState: GameState = {
  players: [],
  nsfwLevel: 'Mild',
  currentPlayerIndex: 0,
  currentPrompt: null,
  availablePrompts: [],
  usedPromptIds: new Set(),
  hiddenIds: new Set(),
  gameEnded: false,
  cardKey: 0,
  upcomingTurns: [],
  history: [],
  turnsByName: {},
};

/** The mode's deck, minus the cards this device has hidden. */
const playableDeck = (mode: GameMode, hiddenIds: Set<number>): Prompt[] =>
  filterDeck(mode).filter((prompt) => !hiddenIds.has(prompt.id));

/** Deal from a fresh (fully unused) deck for `mode`; the shape a new game takes. */
const dealFreshDeck = (state: GameState, mode: GameMode): GameState => {
  const availablePrompts = playableDeck(mode, state.hiddenIds);
  const currentPrompt = pickNextPrompt(availablePrompts, new Set());
  return {
    ...state,
    nsfwLevel: mode,
    availablePrompts,
    usedPromptIds: new Set(),
    upcomingTurns: [],
    turnsByName: {},
    history: [],
    currentPrompt,
    gameEnded: currentPrompt === null,
    cardKey: state.cardKey + 1,
  };
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START': {
      const withHidden = { ...state, hiddenIds: new Set(action.hiddenIds) };
      return {
        ...dealFreshDeck(withHidden, action.nsfwLevel),
        players: action.players,
        currentPlayerIndex: 0,
      };
    }

    case 'RESTORE': {
      const { saved } = action;
      const hiddenIds = new Set(action.hiddenIds);
      const base = {
        ...state,
        hiddenIds,
        players: saved.players,
        nsfwLevel: saved.nsfwLevel,
        currentPlayerIndex: saved.currentPlayerIndex,
      };

      // Resolve the saved card, unless it has since been hidden on this device —
      // then treat it as gone and deal a replacement below.
      const resolved = saved.currentPromptId === null ? null : promptById.get(saved.currentPromptId) ?? null;
      const card = resolved && hiddenIds.has(resolved.id) ? null : resolved;

      // A record written by Start carries a roster and nothing else — treat it
      // as a fresh game and deal the first card. Anything with progress is
      // restored wholesale.
      if (saved.usedPromptIds.length === 0 && !card && !saved.gameEnded) {
        return { ...dealFreshDeck(base, saved.nsfwLevel), players: saved.players, currentPlayerIndex: saved.currentPlayerIndex };
      }

      const availablePrompts = playableDeck(saved.nsfwLevel, hiddenIds);
      const usedPromptIds = new Set(saved.usedPromptIds);
      // A card whose id has since left the deck is dropped from the undo stack.
      const history = saved.history.flatMap((turn) => {
        const prompt = promptById.get(turn.promptId);
        return prompt
          ? [{
              prompt,
              playerIndex: turn.playerIndex,
              playerName: turn.playerName,
              text: turn.text,
              upcoming: turn.upcoming,
              countedTurn: turn.countedTurn,
            }]
          : [];
      });

      let currentPrompt = card;
      let gameEnded = saved.gameEnded;
      let cardKey = state.cardKey;
      // The saved card's id no longer resolves (the deck changed under it) and
      // the night is not over: deal a replacement rather than leaving an empty
      // card the group can do nothing with.
      if (!card && !saved.gameEnded) {
        currentPrompt = pickNextPrompt(availablePrompts, usedPromptIds);
        gameEnded = currentPrompt === null;
        cardKey = state.cardKey + 1;
      }

      return {
        ...base,
        availablePrompts,
        usedPromptIds,
        upcomingTurns: saved.upcomingTurns,
        turnsByName: saved.turnsByName,
        history,
        currentPrompt,
        gameEnded,
        cardKey,
      };
    }

    case 'NEXT': {
      if (state.gameEnded || !state.currentPrompt) return state;
      const outgoing = state.players[state.currentPlayerIndex];
      const turnsByName = outgoing
        ? { ...state.turnsByName, [outgoing]: (state.turnsByName[outgoing] ?? 0) + 1 }
        : state.turnsByName;
      const history = [
        ...state.history.slice(-(HISTORY_LIMIT - 1)),
        {
          prompt: state.currentPrompt,
          playerIndex: state.currentPlayerIndex,
          playerName: outgoing ?? '',
          text: action.text,
          upcoming: state.upcomingTurns,
          countedTurn: true,
        },
      ];
      const usedPromptIds = new Set(state.usedPromptIds);
      usedPromptIds.add(state.currentPrompt.id);
      const { next, rest } = advanceTurnQueue(state.upcomingTurns, state.players.length, state.currentPlayerIndex);
      const currentPrompt = pickNextPrompt(state.availablePrompts, usedPromptIds);
      return {
        ...state,
        turnsByName,
        history,
        usedPromptIds,
        currentPlayerIndex: next,
        upcomingTurns: rest,
        currentPrompt,
        gameEnded: currentPrompt === null,
        cardKey: currentPrompt ? state.cardKey + 1 : state.cardKey,
      };
    }

    case 'SKIP': {
      if (state.gameEnded || !state.currentPrompt) return state;
      const history = [
        ...state.history.slice(-(HISTORY_LIMIT - 1)),
        {
          prompt: state.currentPrompt,
          playerIndex: state.currentPlayerIndex,
          playerName: state.players[state.currentPlayerIndex] ?? '',
          text: action.text,
          upcoming: state.upcomingTurns,
          countedTurn: false,
        },
      ];
      const usedPromptIds = new Set(state.usedPromptIds);
      usedPromptIds.add(state.currentPrompt.id);
      const currentPrompt = pickNextPrompt(state.availablePrompts, usedPromptIds);
      return {
        ...state,
        history,
        usedPromptIds,
        currentPrompt,
        gameEnded: currentPrompt === null,
        cardKey: currentPrompt ? state.cardKey + 1 : state.cardKey,
      };
    }

    case 'HIDE': {
      if (state.gameEnded || !state.currentPrompt) return state;
      const hiddenId = state.currentPrompt.id;
      const hiddenIds = new Set(state.hiddenIds);
      hiddenIds.add(hiddenId);
      // Drop the card from the deck entirely, then deal the same player another
      // one. No tally and no rotation (like a skip); no history, because "never
      // show this" is deliberate and the card is gone rather than undoable.
      const availablePrompts = state.availablePrompts.filter((prompt) => prompt.id !== hiddenId);
      const currentPrompt = pickNextPrompt(availablePrompts, state.usedPromptIds);
      return {
        ...state,
        hiddenIds,
        availablePrompts,
        currentPrompt,
        gameEnded: currentPrompt === null,
        cardKey: currentPrompt ? state.cardKey + 1 : state.cardKey,
      };
    }

    case 'UNDO': {
      const last = state.history[state.history.length - 1];
      if (!last) return state;
      // Attribute by name, not by the stored seat: a player removed since this
      // turn was taken has shifted every later seat. A skipped card never
      // incremented the tally, so undoing one must not decrement it.
      const turnsByName =
        last.playerName && last.countedTurn && state.turnsByName[last.playerName]
          ? { ...state.turnsByName, [last.playerName]: state.turnsByName[last.playerName] - 1 }
          : state.turnsByName;
      const usedPromptIds = new Set(state.usedPromptIds);
      usedPromptIds.delete(last.prompt.id);
      const restoredSeat = state.players.indexOf(last.playerName);
      return {
        ...state,
        turnsByName,
        history: state.history.slice(0, -1),
        usedPromptIds,
        gameEnded: false,
        currentPrompt: last.prompt,
        // If that player has left, fall back to the clamped stored seat.
        currentPlayerIndex: restoredSeat >= 0 ? restoredSeat : Math.min(last.playerIndex, state.players.length - 1),
        upcomingTurns: last.upcoming,
        cardKey: state.cardKey + 1,
      };
    }

    case 'RESTART':
      return { ...dealFreshDeck(state, state.nsfwLevel), currentPlayerIndex: 0 };

    case 'SET_MODE':
      // Switching intensity deals a fresh deck; the crew and whose turn it is
      // carry over.
      if (action.nsfwLevel === state.nsfwLevel) return state;
      return dealFreshDeck(state, action.nsfwLevel);

    case 'ADD_PLAYER': {
      const upcomingTurns = [...state.upcomingTurns];
      upcomingTurns.splice(Math.floor(Math.random() * (upcomingTurns.length + 1)), 0, state.players.length);
      return { ...state, upcomingTurns, players: [...state.players, action.name] };
    }

    case 'REMOVE_PLAYER': {
      const newLength = state.players.length - 1;
      const players = state.players.filter((_, index) => index !== action.index);
      const { currentIndex, queue } = remapAfterRemoval(action.index, state.currentPlayerIndex, state.upcomingTurns, newLength);
      return { ...state, players, currentPlayerIndex: currentIndex, upcomingTurns: queue };
    }

    default:
      return state;
  }
}
