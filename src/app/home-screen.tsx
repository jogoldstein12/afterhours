"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/Header';
import { Users, ShieldAlert, Flame, Plus, X, PlayCircle } from 'lucide-react';
import { GAME_MODES, type GameMode } from '@/lib/prompts';
import { useToast } from '@/hooks/use-toast';
import { cn, playerColor, rosterFromQuery } from '@/lib/utils';
import {
  MAX_NAME_LENGTH,
  MAX_PLAYERS,
  MIN_PLAYERS,
  hasName,
  normalisePlayerName,
  normaliseRoster,
} from '@/lib/roster';
import {
  clearGame,
  clearLastSetup,
  isGameMode,
  isResumable,
  readGame,
  readLastSetup,
  writeGame,
  writeLastSetup,
  type StoredGame,
} from '@/lib/session';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LegalFooter } from '@/components/shared/LegalFooter';

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
  // A game left in progress on this device, offered back rather than resumed
  // silently — arriving at setup is usually a deliberate "start something new".
  const [resumable, setResumable] = useState<StoredGame | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Rosters used to travel between the two screens in the query string. They
  // travel in `localStorage` now, but a link from before the change still has
  // to work, so the query is read once and then scrubbed out of the address bar.
  //
  // The read happens here rather than through `useSearchParams`, which opts the
  // whole route out of static prerendering and left `/` shipping an empty body
  // to crawlers. Nothing needs the value at render time.
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const fromQuery = normaliseRoster(rosterFromQuery(query));
    const levelFromQuery = query.get('nsfwLevel');
    if (query.toString()) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (fromQuery.length >= MIN_PLAYERS) {
      setPlayers(fromQuery);
    } else {
      const saved = readLastSetup();
      if (saved) {
        setPlayers(saved.players);
        if (!levelFromQuery) setNsfwLevel(saved.nsfwLevel);
      }
    }
    if (isGameMode(levelFromQuery)) setNsfwLevel(levelFromQuery);

    const inProgress = readGame();
    if (isResumable(inProgress)) setResumable(inProgress);
  }, []);

  const addPlayer = () => {
    const name = normalisePlayerName(draft);
    if (!name) return;
    if (players.length >= MAX_PLAYERS) {
      toast({
        title: 'Max players reached',
        description: `You can add up to ${MAX_PLAYERS} players.`,
        variant: 'destructive',
      });
      return;
    }
    // The turn tally is keyed by name, so two people entered as "Sam" would
    // share one count and one identity on the cards. Ask for a distinct name.
    if (hasName(players, name)) {
      toast({
        title: `${name} is already in`,
        description: 'Give the second one a different name — a last initial does it.',
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
    clearLastSetup();
  };

  const canStart = players.length >= MIN_PLAYERS;
  const needed = Math.max(0, MIN_PLAYERS - players.length);

  const startGame = () => {
    if (players.length < MIN_PLAYERS) return;
    writeLastSetup({ players, nsfwLevel });
    // The play screen reads its whole world out of this record, so a new game
    // starts by writing an empty one. It also replaces whatever was in
    // progress, which is what pressing Start means.
    writeGame({
      players,
      nsfwLevel,
      currentPlayerIndex: 0,
      currentPromptId: null,
      processedPromptText: '',
      usedPromptIds: [],
      upcomingTurns: [],
      turnsByName: {},
      history: [],
      gameEnded: false,
    });
    router.push('/game');
  };

  const discardResumable = () => {
    clearGame();
    setResumable(null);
  };

  const activeMode = GAME_MODES.find((m) => m.id === nsfwLevel);
  const resumableMode = resumable ? GAME_MODES.find((m) => m.id === resumable.nsfwLevel) : null;

  return (
    <div className="flex flex-col min-h-[100dvh] text-foreground touch-manipulation">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start sm:justify-center gap-6 p-4">
        {resumable && (
          <section
            aria-label="Game in progress"
            className="w-full max-w-md rounded-2xl border border-accent/40 bg-accent/[0.08] p-4 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <PlayCircle className="h-6 w-6 shrink-0 text-accent" />
              <div className="min-w-0">
                <p className="font-headline text-base font-bold text-white">Game in progress</p>
                <p className="truncate text-xs text-muted-foreground">
                  {resumable.players.length} players · {resumableMode?.label ?? resumable.nsfwLevel} ·{' '}
                  {resumable.usedPromptIds.length} cards in
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => router.push('/game')}
                className="h-11 flex-grow bg-accent text-accent-foreground hover:bg-accent/80 font-bold touch-manipulation"
              >
                Resume
              </Button>
              <Button
                onClick={discardResumable}
                variant="ghost"
                className="h-11 shrink-0 border border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white touch-manipulation"
              >
                Discard
              </Button>
            </div>
          </section>
        )}

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
                  maxLength={MAX_NAME_LENGTH}
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

        <div className="w-full max-w-md">
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
      </main>

      {/* Outside <main>, so the growing main column pushes it to the foot of
          the page on a short roster and it simply follows the content on a
          long one. */}
      <LegalFooter className="px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]" />
    </div>
  );
}
