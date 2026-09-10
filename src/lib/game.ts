/**
 * The game's pure logic, kept out of the play screen so it can be read and
 * tested on its own. Everything here is a plain function of its arguments —
 * no React, no storage, no DOM.
 */

import { PROMPTS, isNhiePrompt, isRoomPrompt, type GameMode, type Prompt } from './prompts';

/** The deck for a mode. NHIE is not a tier — it draws its cards from all three. */
export const filterDeck = (mode: GameMode): Prompt[] =>
  mode === 'NHIE' ? PROMPTS.filter(isNhiePrompt) : PROMPTS.filter((p) => p.nsfwLevel === mode);

/** Card lookup by id, for restoring a saved game. */
export const promptById = new Map(PROMPTS.map((prompt) => [prompt.id, prompt]));

/**
 * One shuffled "round" of player indices. Everyone goes once per round; the
 * avoidFirst guard stops the same player getting back-to-back turns across a
 * round boundary.
 */
export const shuffledIndices = (count: number, avoidFirst?: number): number[] => {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (count > 1 && order[0] === avoidFirst) {
    const swap = 1 + Math.floor(Math.random() * (count - 1));
    [order[0], order[swap]] = [order[swap], order[0]];
  }
  return order;
};

/**
 * Numeric durations only ("15 seconds", "2 minutes", "one-minute") —
 * spelled-out numbers are skipped on purpose, since those are usually
 * hypothetical ("if you had ten minutes alone...") rather than timed dares.
 */
export const extractDurationSeconds = (text: string): number | null => {
  const sec = text.match(/(\d+)\s*seconds?\b/i);
  if (sec) return parseInt(sec[1], 10);
  const min = text.match(/(\d+)\s*minutes?\b/i);
  if (min) return parseInt(min[1], 10) * 60;
  if (/\bone[- ]minute\b/i.test(text)) return 60;
  return null;
};

/** Substituted into `{{randomOtherPlayer}}` when nobody else is in the room. */
const NO_OTHER_PLAYER = 'another player';

const pickRandom = (names: string[]): string => names[Math.floor(Math.random() * names.length)];

/**
 * A prompt as it appears on the card: `{{randomOtherPlayer}}` filled in, and
 * the current player's name prepended when the sentence needs an addressee.
 *
 * `pickOther` is injectable so a test can pin the choice; the game leaves it at
 * the default and lets it be random.
 */
export function renderPromptText(
  prompt: Prompt,
  players: string[],
  currentPlayerIndex: number,
  pickOther: (names: string[]) => string = pickRandom,
): string {
  let text = prompt.text;
  const currentPlayerName = players[currentPlayerIndex];

  if (text.includes('{{randomOtherPlayer}}')) {
    const otherPlayers = players.filter((_, index) => index !== currentPlayerIndex);
    const substitute = otherPlayers.length > 0 ? pickOther(otherPlayers) : NO_OTHER_PLAYER;
    text = text.replace(/\{\{randomOtherPlayer\}\}/g, substitute);
  }

  const needsPrefix =
    // Room-wide cards are called out to everybody and are never personalised.
    // This is declared per prompt in the deck rather than guessed from how the
    // sentence opens.
    !isRoomPrompt(prompt) &&
    // A question is already directed by the turn indicator, and reads worse
    // with a name bolted on.
    !text.includes('?') &&
    // A prompt that opens by addressing another player never also takes the
    // "Name, ..." prefix — that would double-address it. Checked against the
    // raw text since the placeholder is already substituted.
    !prompt.text.trimStart().startsWith('{{randomOtherPlayer}}');

  if (text.length === 0) return text;
  return needsPrefix
    ? `${currentPlayerName}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`
    : `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}
