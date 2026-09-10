# **App Name**: After Hours

An explicit pass-the-phone party game for adults, shipped as a Next.js web
app.

## Core Features

- **Age gate**: an adults-only confirmation before anything else is reachable, remembered per device. `/terms` and `/privacy` stay readable without passing it.
- **Player Setup**: 2–10 named players, entered as chips rather than a column of inputs. Names are unique within a game and capped at 20 characters. The last roster is remembered on the device and can be handed back from the game screen.
- **Resume**: the game in progress is saved on the device, so a refresh, a locked phone, or a reclaimed tab returns to the same card with the same player up. Setup offers it back for twelve hours. Nothing about a game travels in the URL.
- **Game Modes**: three intensity tiers — `Mild`, `Medium`, `Extreme` — plus `Never Have I Ever`, which draws the NHIE prompts out of every tier rather than being a tier of its own.
- **Randomizer**: prompts are drawn at random from the active deck without repeating, with `{{randomOtherPlayer}}` substitution so cards name the people in the room.
- **Pass-the-Phone**: one device moves around the group; the screen names the current player and the turn order is randomised.
- **Game Screen**: current player, prompt card typed by category (dare, question, drink, timed, NHIE), deck position, and a dock of Skip / Undo / Group / End.
- **Skip**: every prompt is declinable. Skipping consumes the card without counting the turn, so the same player stays up.
- **Mid-game controls**: switch intensity, add or remove players, restart the deck, or return to setup with the roster intact.

## Style Guidelines

- Primary color: saturated violet `#BE52F2` (`--primary: 283 85% 63%`) to match the nightclub and neon aesthetic.
- Background color: very dark violet `#0A040F` (`--background: 285 56% 5%`) for a dark-mode aesthetic.
- Accent color: saturated pink `#F252A9` (`--accent: 328 86% 64%`), closely analogous to the violet, for calls to action and highlights.
- Every colour is an HSL custom property in `src/app/globals.css`; nothing hard-codes a hex value.
- Text on a solid brand fill is the near-black ink, not white: white on the neon violet is 3.7:1 and on the pink 3.2:1, both under WCAG AA. The palette itself is never darkened to fix this, so the glows, borders and filaments keep their colour.
- Every text run on every screen meets WCAG AA (4.5:1, or 3:1 for large text), enforced by `e2e/contrast.js` rather than by eye.
- Headline and body font: 'Space Grotesk' for a computerized, techy look, falling back to Inter.
- Minimalist icons (lucide) appropriate to the content of each prompt.
- Simple, smooth transition animations between turns.
