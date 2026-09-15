/**
 * Game-mode metadata: the intensity tiers, the Never Have I Ever mode, and the
 * selector copy for each. Deliberately kept free of any reference to `PROMPTS`
 * (the 874-card deck in `./prompts`). The setup screen and the saved-game
 * boundary need only these few small values, so importing them must not drag
 * the whole deck into the home-page bundle. Anything that needs the deck itself
 * imports from `./prompts` (or the deck helpers in `./game`), which land on the
 * play route where the deck belongs.
 */

export type NsfwLevel = 'Mild' | 'Medium' | 'Extreme';

/**
 * Game modes are the three intensity tiers plus 'NHIE', a Never Have I Ever
 * mode that draws the NHIE prompts out of every tier rather than being a tier
 * of its own. Prompts keep their nsfwLevel either way.
 */
export type GameMode = NsfwLevel | 'NHIE';

/** A prompt starting with "Never have I ever" belongs to the NHIE mode. */
export const NHIE_PATTERN = /^never have i ever\b/i;

export const GAME_MODES: {
  id: GameMode;
  label: string;
  badge: string;
  /** One-line description shown under the selector so the choice isn't blind. */
  description: string;
  /** 1-4 chili rating for the spice meter on the setup screen. */
  spice: number;
  wide?: boolean;
}[] = [
  { id: 'Mild', label: 'Mild', badge: 'Mild Mode', description: 'Icebreakers and embarrassing stories.', spice: 1 },
  { id: 'Medium', label: 'Medium', badge: 'Medium Mode', description: 'Flirty confessions and light dares.', spice: 2 },
  { id: 'Extreme', label: 'Extreme', badge: 'Extreme Mode', description: 'No limits. You have been warned.', spice: 4 },
  {
    id: 'NHIE',
    label: 'Never Have I Ever',
    badge: 'Never Have I Ever',
    description: 'Every intensity, phrased as Never Have I Ever — includes Extreme.',
    // Spice 4: the NHIE pool is majority-Extreme, so the meter must read as hot
    // as the deck actually plays rather than sitting a notch below it.
    spice: 4,
    wide: true,
  },
];
