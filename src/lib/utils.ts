import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * One neon color per player, drawn from the existing chart tokens (violet, pink,
 * blue, green, yellow). Assigned by seat index and derived the same way on every
 * screen, so a player keeps their color from the setup lobby through the status
 * strip and the end-of-night recap without threading it through the URL. Class
 * strings are written out in full (never interpolated) so Tailwind keeps them.
 */
export const PLAYER_COLORS = [
  { dot: 'bg-primary', text: 'text-primary', glow: 'shadow-[0_0_10px_hsl(var(--primary)/0.7)]' },
  { dot: 'bg-secondary', text: 'text-secondary', glow: 'shadow-[0_0_10px_hsl(var(--secondary)/0.7)]' },
  { dot: 'bg-[hsl(var(--chart-3))]', text: 'text-[hsl(var(--chart-3))]', glow: 'shadow-[0_0_10px_hsl(var(--chart-3)/0.7)]' },
  { dot: 'bg-[hsl(var(--chart-4))]', text: 'text-[hsl(var(--chart-4))]', glow: 'shadow-[0_0_10px_hsl(var(--chart-4)/0.7)]' },
  { dot: 'bg-[hsl(var(--chart-5))]', text: 'text-[hsl(var(--chart-5))]', glow: 'shadow-[0_0_10px_hsl(var(--chart-5)/0.7)]' },
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

export const playerColor = (index: number): PlayerColor =>
  PLAYER_COLORS[((index % PLAYER_COLORS.length) + PLAYER_COLORS.length) % PLAYER_COLORS.length];

/**
 * Reads a roster out of a legacy play URL.
 *
 * Rosters used to travel between the setup and game screens as repeated
 * `player` query params (and, before that, as one comma-joined `players`
 * param). They travel in `localStorage` now — see `src/lib/session.ts` — so
 * this exists only so a bookmark or a pasted link from an older build still
 * opens into a game. Both screens scrub the query out of the address bar once
 * they have read it.
 *
 * The names that come back are raw: run them through `normaliseRoster`.
 */
export function rosterFromQuery(searchParams: {
  getAll(name: string): string[];
  get(name: string): string | null;
}): string[] {
  const repeated = searchParams.getAll('player');
  if (repeated.length > 0) return repeated;
  const legacy = searchParams.get('players');
  if (!legacy) return [];
  return decodeURIComponent(legacy).split(',');
}
