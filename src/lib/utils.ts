import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Players travel between the setup and game screens as repeated `player`
 * query params, so names can contain any character (including commas).
 * The legacy comma-joined `players` param is still read for old URLs.
 */
export function playersToQuery(players: string[], nsfwLevel: string): string {
  const params = new URLSearchParams();
  players.forEach((name) => params.append('player', name));
  params.set('nsfwLevel', nsfwLevel);
  return params.toString();
}

export function playersFromQuery(searchParams: { getAll(name: string): string[]; get(name: string): string | null }): string[] {
  const repeated = searchParams.getAll('player').map((n) => n.trim()).filter(Boolean);
  if (repeated.length > 0) return repeated;
  const legacy = searchParams.get('players');
  if (!legacy) return [];
  return decodeURIComponent(legacy).split(',').map((n) => n.trim()).filter(Boolean);
}
