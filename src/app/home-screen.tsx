"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/Header';
import { Users, ShieldAlert, Flame, Plus, X } from 'lucide-react';
import { GAME_MODES, type GameMode } from '@/lib/prompts';
import { useToast } from '@/hooks/use-toast';
import { cn, playersToQuery, playersFromQuery, playerColor } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LegalFooter } from '@/components/shared/LegalFooter';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const LAST_SETUP_KEY = 'afterhours.lastSetup';

// Selected pill lights up in each mode's own color instead of always violet, so
// the choice previews the intensity you are about to play.
const MODE_SELECTED: Record<GameMode, string> = {
  Mild: 'bg-primary text-white shadow-[0_0_12px_hsl(var(--primary)/0.6)]',
  Medium: 'bg-secondary text-white shadow-[0_0_12px_hsl(var(--secondary)/0.6)]',
  Extreme: 'bg-destructive text-white shadow-[0_0_12px_hsl(var(--destructive)/0.6)]',
  NHIE: 'bg-[hsl(var(--chart-3))] text-black shadow-[0_0_12px_hsl(var(--chart-3)/0.6)]',
};
const MODE_ACCENT_TEXT: Record<GameMode, string> = {
  Mild: 'text-primary',
  Medium: 'text-secondary',
  Extreme: 'text-destructive',
  NHIE: 'text-[hsl(var(--chart-3))]',
};

export function HomeScreen() {
  // The roster is a list of committed names (chips), not a column of blank
  // inputs — anticipation should read like a guest list, not a form.
  const [players, setPlayers] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [nsfwLevel, setNsfwLevel] = useState<GameMode>('Mild');
  const router = useRouter();
  const { toast } = useToast();

  // "New Game" from the game screen hands the current roster and level back,
  // so a group can start a fresh deck without retyping every name.
  //
  // The query string is read here from `window.location` rather than through
  // `useSearchParams`. Calling that hook during render opts the whole route
  // out of static prerendering, which left `/` shipping an empty body to
  // crawlers. Nothing here needs the value at render time — only on mount,
  // and arriving from /game remounts this screen — so reading it in the
  // effect keeps the page fully prerendered.
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const names = playersFromQuery(query);
    const nsfwLevelQuery = query.get('nsfwLevel');
    if (names.length >= MIN_PLAYERS) {
      setPlayers(names.slice(0, MAX_PLAYERS));
    } else {
      // No roster handed over — offer the last group that played on this device.
      try {
        const saved = JSON.parse(localStorage.getItem(LAST_SETUP_KEY) ?? 'null');
        if (saved && Array.isArray(saved.players) && saved.players.length >= MIN_PLAYERS) {
          setPlayers(saved.players.slice(0, MAX_PLAYERS).map((name: unknown) => String(name)));
          if (!nsfwLevelQuery && GAME_MODES.some((m) => m.id === saved.nsfwLevel)) {
            setNsfwLevel(saved.nsfwLevel as GameMode);
          }
        }
      } catch {
        // Storage unavailable or corrupted — start from a blank setup.
      }
    }
    if (nsfwLevelQuery && GAME_MODES.some((m) => m.id === nsfwLevelQuery)) {
      setNsfwLevel(nsfwLevelQuery as GameMode);
    }
  }, []);

  const addPlayer = () => {
    const name = draft.trim();
    if (!name) return;
    if (players.length >= MAX_PLAYERS) {
      toast({
        title: 'Max players reached',
        description: `You can add up to ${MAX_PLAYERS} players.`,
        variant: 'destructive',
      });
      return;
    }
    setPlayers((prev) => [...prev, name]);
    setDraft('');
  };

  const removePlayer = (index: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  // Wipe the whole roster in one tap to start a fresh game, and forget the
  // remembered group so a reload doesn't bring it back.
  const clearAll = () => {
    setPlayers([]);
    setDraft('');
    try { localStorage.removeItem(LAST_SETUP_KEY); } catch { /* storage unavailable */ }
  };

  const canStart = players.length >= MIN_PLAYERS;
  const needed = Math.max(0, MIN_PLAYERS - players.length);

  const startGame = () => {
    if (players.length < MIN_PLAYERS) return;
    try {
      localStorage.setItem(LAST_SETUP_KEY, JSON.stringify({ players, nsfwLevel }));
    } catch {
      // Best-effort convenience only.
    }
    router.push(`/game?${playersToQuery(players, nsfwLevel)}`);
  };

  const activeMode = GAME_MODES.find((m) => m.id === nsfwLevel);

  return (
    <div className="flex flex-col min-h-[100dvh] text-foreground touch-manipulation">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start sm:justify-center gap-8 p-4 pb-32">
        <Card className="w-full max-w-md shadow-2xl neon-border-primary bg-card/70 backdrop-blur-md">
          <CardHeader className="text-center">
            <Users className="mx-auto h-11 w-11 text-primary mb-1" />
            <CardTitle className="text-3xl font-headline text-primary neon-text-primary">Game Setup</CardTitle>
            <CardDescription className="text-muted-foreground">Where the night gets interesting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="add-player" className="text-base font-semibold text-accent flex items-center">
                  <Users className="mr-2 h-5 w-5" /> Who&apos;s playing?
                </Label>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {players.length} in
                  </span>
                  {players.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="rounded-md px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  id="add-player"
                  type="text"
                  placeholder={players.length >= MAX_PLAYERS ? 'Roster full' : 'Add a name, hit +'}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPlayer(); } }}
                  disabled={players.length >= MAX_PLAYERS}
                  className="h-11 bg-input border-border focus:neon-border-accent text-foreground placeholder:text-muted-foreground disabled:opacity-60"
                  aria-label="Add a player"
                  autoComplete="off"
                  enterKeyHint="done"
                />
                <Button
                  onClick={addPlayer}
                  size="icon"
                  disabled={!draft.trim() || players.length >= MAX_PLAYERS}
                  aria-label="Add player"
                  className="h-11 w-11 shrink-0 bg-accent text-accent-foreground hover:bg-accent/80 disabled:opacity-40 touch-manipulation"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              {players.length > 0 ? (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {players.map((name, index) => {
                    const color = playerColor(index);
                    return (
                      <li
                        key={`${name}-${index}`}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] py-1.5 pl-3 pr-1.5 text-sm"
                      >
                        <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', color.dot, color.glow)} />
                        <span className="max-w-[9rem] truncate font-medium text-white">{name}</span>
                        <button
                          type="button"
                          onClick={() => removePlayer(index)}
                          aria-label={`Remove ${name}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-accent flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5" /> Game Mode
              </Label>
               <RadioGroup
                value={nsfwLevel}
                onValueChange={(value: string) => setNsfwLevel(value as GameMode)}
                className="grid grid-cols-3 gap-2 rounded-xl bg-input p-1.5"
              >
                {GAME_MODES.map((mode) => (
                    <Label
                      key={mode.id}
                      htmlFor={`nsfw-${mode.id.toLowerCase()}`}
                      className={cn(
                        "flex items-center justify-center min-h-[44px] px-3 rounded-lg text-center text-sm font-medium cursor-pointer transition-all touch-manipulation has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
                        mode.wide && 'col-span-3',
                        nsfwLevel === mode.id ? MODE_SELECTED[mode.id] : 'text-white/70 hover:bg-primary/15 hover:text-white'
                      )}
                    >
                      <RadioGroupItem
                        value={mode.id}
                        id={`nsfw-${mode.id.toLowerCase()}`}
                        className="sr-only"
                      />
                      {mode.label}
                    </Label>
                ))}
              </RadioGroup>
              {activeMode && (
                <div className="flex items-start justify-between gap-3 rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2.5">
                  <p className="text-sm text-muted-foreground leading-snug">{activeMode.description}</p>
                  <div className="flex shrink-0 items-center gap-0.5 pt-0.5" aria-label={`Spice level ${activeMode.spice} of 4`}>
                    {[1, 2, 3, 4].map((pip) => (
                      <Flame
                        key={pip}
                        className={cn("h-3.5 w-3.5", pip <= activeMode.spice ? MODE_ACCENT_TEXT[nsfwLevel] : 'text-white/15')}
                        fill={pip <= activeMode.spice ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <LegalFooter />
      </main>

      {/* Sticky Start bar — always reachable, even with a full 10-player roster. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-background/80 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-md">
          <Button
            onClick={startGame}
            disabled={!canStart}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold neon-border-primary transition-transform active:scale-[0.98] disabled:opacity-50 disabled:neon-border-primary disabled:active:scale-100 touch-manipulation"
          >
            {canStart
              ? `Start with ${players.length} ${players.length === 1 ? 'player' : 'players'}`
              : `Add ${needed} more ${needed === 1 ? 'player' : 'players'}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
