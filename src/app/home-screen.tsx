"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/Header';
import { Users, MinusCircle, PlusCircle, ShieldAlert, Flame } from 'lucide-react';
import { GAME_MODES, type GameMode } from '@/lib/prompts';
import { useToast } from '@/hooks/use-toast';
import { cn, playersToQuery, playersFromQuery } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


type Player = {
  name: string;
};

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
  const [players, setPlayers] = useState<Player[]>([
    { name: '' },
    { name: '' }
  ]);
  const [nsfwLevel, setNsfwLevel] = useState<GameMode>('Mild');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // "New Game" from the game screen hands the current roster and level back,
  // so a group can start a fresh deck without retyping every name.
  useEffect(() => {
    const names = playersFromQuery(searchParams);
    const nsfwLevelQuery = searchParams.get('nsfwLevel');
    if (names.length >= MIN_PLAYERS) {
      setPlayers(names.map(name => ({ name })));
    } else {
      // No roster handed over — offer the last group that played on this device.
      try {
        const saved = JSON.parse(localStorage.getItem(LAST_SETUP_KEY) ?? 'null');
        if (saved && Array.isArray(saved.players) && saved.players.length >= MIN_PLAYERS) {
          setPlayers(saved.players.slice(0, MAX_PLAYERS).map((name: unknown) => ({ name: String(name) })));
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
  }, [searchParams]);

  const handlePlayerNameChange = (index: number, name: string) => {
    setPlayers(prev => prev.map((p, i) => (i === index ? { ...p, name } : p)));
  };

  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, { name: '' }]);
    } else {
      toast({
        title: "Max players reached",
        description: `You can add up to ${MAX_PLAYERS} players.`,
        variant: "destructive",
      });
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > MIN_PLAYERS) {
      setPlayers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validCount = players.filter(p => p.name.trim() !== '').length;
  const canStart = validCount >= MIN_PLAYERS;

  const startGame = () => {
    const validPlayers = players.filter(p => p.name.trim() !== '');
    if (validPlayers.length < MIN_PLAYERS) return;
    const names = validPlayers.map(p => p.name.trim());
    try {
      localStorage.setItem(LAST_SETUP_KEY, JSON.stringify({ players: names, nsfwLevel }));
    } catch {
      // Best-effort convenience only.
    }
    router.push(`/game?${playersToQuery(names, nsfwLevel)}`);
  };

  const activeMode = GAME_MODES.find((m) => m.id === nsfwLevel);

  return (
    <div className="flex flex-col min-h-[100dvh] text-foreground touch-manipulation">
      <Header />
      <main className="flex-grow flex items-start sm:items-center justify-center p-4 pb-32">
        <Card className="w-full max-w-md shadow-2xl neon-border-primary bg-card/70 backdrop-blur-md">
          <CardHeader className="text-center">
            <Users className="mx-auto h-11 w-11 text-primary mb-1" />
            <CardTitle className="text-3xl font-headline text-primary neon-text-primary">Game Setup</CardTitle>
            <CardDescription className="text-muted-foreground">Where the night gets interesting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-accent flex items-center">
                <Users className="mr-2 h-5 w-5" /> Players
                <span className="ml-auto text-xs font-medium text-muted-foreground tabular-nums">
                  {validCount} ready
                </span>
              </Label>
              {players.map((player, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={`Player ${index + 1}`}
                    value={player.name}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    className="h-11 bg-input border-border focus:neon-border-accent text-foreground placeholder:text-muted-foreground"
                    aria-label={`Player ${index + 1} name`}
                  />
                   {players.length > MIN_PLAYERS && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePlayer(index)}
                      aria-label={`Remove player ${index + 1}`}
                      className="h-11 w-11 shrink-0 touch-manipulation"
                    >
                      <MinusCircle className="h-5 w-5 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {players.length < MAX_PLAYERS && (
                <Button variant="outline" onClick={addPlayer} className="w-full h-11 border-accent/60 text-accent hover:bg-accent/10 touch-manipulation">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Player
                </Button>
              )}
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
      </main>

      {/* Sticky Start bar — always reachable, even with a full 10-player roster. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-background/80 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-md">
          <Button
            onClick={startGame}
            disabled={!canStart}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold neon-border-primary transition-transform active:scale-[0.98] disabled:opacity-50 disabled:neon-border-primary disabled:active:scale-100 touch-manipulation"
          >
            {canStart ? `Start with ${validCount} ${validCount === 1 ? 'player' : 'players'}` : `Add at least ${MIN_PLAYERS} players`}
          </Button>
        </div>
      </div>
    </div>
  );
}
