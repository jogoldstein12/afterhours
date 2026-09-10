# **App Name**: After Hours

An explicit pass-the-phone party game for adults, shipped as a Next.js web
app.

## Core Features

- **Age gate**: an adults-only confirmation before anything else is reachable, remembered per device. `/terms` and `/privacy` stay readable without passing it.
- **Player Setup**: 2–10 named players, entered as chips rather than a column of inputs. The last roster is remembered on the device and can be handed back from the game screen.
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
- Headline and body font: 'Space Grotesk' for a computerized, techy look, falling back to Inter.
- Minimalist icons (lucide) appropriate to the content of each prompt.
- Simple, smooth transition animations between turns.
