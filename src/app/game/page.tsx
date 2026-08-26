"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PROMPTS, Prompt, GameMode, isNhiePrompt, GAME_MODES } from '@/lib/prompts';
import { ArrowRightCircle, RotateCcw, Trash2, UserPlus, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn, playersToQuery, playersFromQuery } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/shared/Logo';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

// Numeric durations only ("15 seconds", "2 minutes", "one-minute") — spelled-out
// numbers are skipped on purpose, since those are usually hypothetical
// ("if you had ten minutes alone...") rather than timed dares.
const extractDurationSeconds = (text: string): number | null => {
  const sec = text.match(/(\d+)\s*seconds?\b/i);
  if (sec) return parseInt(sec[1], 10);
  const min = text.match(/(\d+)\s*minutes?\b/i);
  if (min) return parseInt(min[1], 10) * 60;
  if (/\bone[- ]minute\b/i.test(text)) return 60;
  return null;
};

const formatSeconds = (total: number): string =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [players, setPlayers] = useState<string[]>([]);
  const [nsfwLevel, setNsfwLevel] = useState<GameMode>('Mild');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [processedPromptText, setProcessedPromptText] = useState<string>('');
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [usedPromptIds, setUsedPromptIds] = useState<Set<number>>(new Set());
  const [gameEnded, setGameEnded] = useState(false);
  const [cardKey, setCardKey] = useState(0); 
  const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const timerTotal = currentPrompt ? extractDurationSeconds(currentPrompt.text) : null;

  // A fresh prompt resets the timer to its full duration, stopped.
  useEffect(() => {
    setTimerRunning(false);
    setTimeLeft(currentPrompt ? extractDurationSeconds(currentPrompt.text) : null);
  }, [currentPrompt]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          setTimerRunning(false);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([100, 50, 100]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const startTimer = () => {
    setTimeLeft(timerTotal);
    setTimerRunning(true);
  };

  useEffect(() => {
    const names = playersFromQuery(searchParams);
    const nsfwLevelQuery = searchParams.get('nsfwLevel') as GameMode;

    if (names.length > 0) {
      setPlayers(names);
    }
    if (nsfwLevelQuery && GAME_MODES.some((m) => m.id === nsfwLevelQuery)) {
      setNsfwLevel(nsfwLevelQuery);
    }
  }, [searchParams]);

  const selectNewPrompt = useCallback((promptsToUse: Prompt[], currentUsedIds: Set<number>) => {
    const remainingPrompts = promptsToUse.filter(p => !currentUsedIds.has(p.id));
    if (remainingPrompts.length === 0) {
      setGameEnded(true);
      setCurrentPrompt(null);
      return null;
    }
    const randomIndex = Math.floor(Math.random() * remainingPrompts.length);
    const newPrompt = remainingPrompts[randomIndex];
    setCurrentPrompt(newPrompt);
    setCardKey(prevKey => prevKey + 1); 
    return newPrompt;
  }, []);
  
  const loadAndFilterPrompts = useCallback(() => {
    const filtered = nsfwLevel === 'NHIE'
      ? PROMPTS.filter(isNhiePrompt)
      : PROMPTS.filter(p => p.nsfwLevel === nsfwLevel);
    setAvailablePrompts(filtered);
    setUsedPromptIds(new Set()); 
    setGameEnded(false); 
    return filtered;
  }, [nsfwLevel]);

  const restartGame = useCallback(() => {
    setCurrentPlayerIndex(0);
    const freshPrompts = loadAndFilterPrompts();
    if (freshPrompts.length > 0) {
      selectNewPrompt(freshPrompts, new Set());
    } else {
      setCurrentPrompt(null);
      setGameEnded(true);
    }
    setIsNewGameDialogOpen(false);
  }, [loadAndFilterPrompts, selectNewPrompt]);

  const handleNsfwLevelChange = (newLevel: GameMode) => {
    setNsfwLevel(newLevel);
  };
  
  // The deck only (re)loads when the level changes, never on roster changes —
  // adding or removing a player mid-game must not reset progress.
  const deckLevelRef = useRef<GameMode | null>(null);
  useEffect(() => {
    if (players.length === 0 || deckLevelRef.current === nsfwLevel) return;
    deckLevelRef.current = nsfwLevel;
    const newPrompts = loadAndFilterPrompts();
    selectNewPrompt(newPrompts, new Set());
  }, [nsfwLevel, players.length, loadAndFilterPrompts, selectNewPrompt]);

  useEffect(() => {
    if (gameEnded) {
      setProcessedPromptText("Game Over! You've gone through all the prompts for this level.");
    } else if (currentPrompt && players.length > 0) {
      let text = currentPrompt.text;
      const currentPlayerName = players[currentPlayerIndex];

      if (text.includes('{{randomOtherPlayer}}')) {
        const otherPlayers = players.filter((_, index) => index !== currentPlayerIndex);
        if (otherPlayers.length > 0) {
          const randomPlayerName = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
          text = text.replace(/\{\{randomOtherPlayer\}\}/g, randomPlayerName);
        } else {
          text = text.replace(/\{\{randomOtherPlayer\}\}/g, 'another player');
        }
      }
       
      const trimmedLower = text.trim().toLowerCase();
      const needsPrefix = !text.includes('?') &&
                         // A prompt that opens by addressing another player never
                         // also takes the "Name, ..." prefix — that would
                         // double-address it. Checked against the raw text since
                         // the placeholder is already substituted by now.
                         !currentPrompt.text.trimStart().startsWith('{{randomOtherPlayer}}') &&
                         // "Never have I ever" is called out to the whole room,
                         // so it never takes the "Name, ..." prefix.
                         !["if", "everyone", "anybody", "anyone", "any ", "the ", "girls", "men", "women", "no one", "shortest", "youngest", "dominant", "never have i ever"].some(word => trimmedLower.startsWith(word));

      if (needsPrefix && text.length > 0) {
        text = `${currentPlayerName}, ${text.charAt(0).toLowerCase() + text.slice(1)}`;
      } else if (text.length > 0) {
        text = text.charAt(0).toUpperCase() + text.slice(1);
      }

      setProcessedPromptText(text);
    }
  }, [currentPrompt, players, currentPlayerIndex, gameEnded]);

  const handleNextPlayer = () => {
    if (gameEnded || !currentPrompt) return;

    const newUsedPromptIds = new Set(usedPromptIds);
    newUsedPromptIds.add(currentPrompt.id);
    setUsedPromptIds(newUsedPromptIds);

    const nextPlayerIndex = Math.floor(Math.random() * players.length);
    setCurrentPlayerIndex(nextPlayerIndex);

    selectNewPrompt(availablePrompts, newUsedPromptIds);
  };

  const handleAddPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return toast({ title: 'Player name cannot be empty.', variant: 'destructive' });
    if (players.length >= MAX_PLAYERS) return toast({ title: `Limit: ${MAX_PLAYERS} players.`, variant: 'destructive' });
    
    setPlayers(prev => [...prev, name]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (indexToRemove: number) => {
    if (players.length <= MIN_PLAYERS) {
      return toast({ title: `Minimum ${MIN_PLAYERS} players required.`, variant: 'destructive' });
    }
    const newLength = players.length - 1;
    setPlayers(prev => prev.filter((_, index) => index !== indexToRemove));
    setCurrentPlayerIndex(prev => {
      if (indexToRemove < prev) return prev - 1; // same person keeps the turn
      if (indexToRemove === prev) return prev % newLength; // turn passes to the next player
      return prev;
    });
  };

  if (players.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center glass-card">
          <CardHeader><CardTitle className="text-primary neon-text-primary">Initializing Deck...</CardTitle></CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={isNewGameDialogOpen} onOpenChange={setIsNewGameDialogOpen}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Start a New Session?</AlertDialogTitle>
            <AlertDialogDescription>Restart the current deck or head back to setup.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(`/?${playersToQuery(players, nsfwLevel)}`)}
              className="bg-destructive text-white"
            >New Game</AlertDialogAction>
            <AlertDialogAction onClick={restartGame} className="bg-primary text-white">Restart Deck</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="glass-card border-l-white/10">
          <SheetHeader>
            <SheetTitle>Game Settings</SheetTitle>
            <SheetDescription>Modify players and intensity on the fly.</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-8">
            <div className="space-y-4">
              <Label className="text-accent neon-text-accent uppercase tracking-tighter text-xs">Manage Players</Label>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {players.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="font-medium">{player}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemovePlayer(index)} disabled={players.length <= MIN_PLAYERS}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Input value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="Player Name" onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()} className="bg-white/5" />
                <Button onClick={handleAddPlayer} size="icon" className="bg-accent hover:bg-accent/80"><UserPlus className="h-4 w-4" /></Button>
              </div>
            </div>
            <Separator className="bg-white/10" />
            <div className="space-y-4">
              <Label className="text-accent neon-text-accent uppercase tracking-tighter text-xs">Game Mode</Label>
              <RadioGroup value={nsfwLevel} onValueChange={(v) => handleNsfwLevelChange(v as GameMode)} className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl">
                {GAME_MODES.map((mode) => (
                  <Label key={mode.id} className={cn("flex items-center justify-center py-2 rounded-lg cursor-pointer transition-all text-sm", mode.wide && 'col-span-3', nsfwLevel === mode.id ? 'bg-primary text-white shadow-[0_0_10px_rgba(190,82,242,0.5)]' : 'hover:bg-white/5')}>
                    <RadioGroupItem value={mode.id} className="sr-only" />{mode.label}
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>
          <SheetFooter><Button onClick={() => setIsEditSheetOpen(false)} className="w-full">Save Changes</Button></SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className={cn(
            "w-full max-w-4xl transition-all duration-500 glass-card overflow-hidden border-[1px]",
            nsfwLevel === 'Mild' && "neon-border-violet",
            nsfwLevel === 'Medium' && "neon-border-pink",
            nsfwLevel === 'Extreme' && "border-destructive shadow-[0_0_20px_rgba(255,0,0,0.4)]",
            nsfwLevel === 'NHIE' && "border-chart-3 shadow-[0_0_20px_hsl(var(--chart-3)/0.45)]"
          )}>
            <CardHeader className="border-b border-white/5 bg-white/5 p-4 md:p-6 relative min-h-[90px] flex items-center">
              <div className="flex justify-between items-start w-full relative z-10">
                {/* Left Side: Mode Badge and Player Name centered under it */}
                <div className="flex flex-col gap-1 items-center min-w-[100px]">
                  <Badge variant="outline" className="text-[9px] sm:text-[10px] px-2 py-0 uppercase tracking-widest border-white/20 text-white/50 shrink-0">
                    {GAME_MODES.find((m) => m.id === nsfwLevel)?.badge ?? nsfwLevel}
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-white tracking-tight leading-none h-[28px] sm:h-[32px] flex items-center">
                    {players[currentPlayerIndex]}
                  </CardTitle>
                </div>
                
                {/* Middle: Centered Logo - Absolutely positioned for perfect alignment */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.6] sm:scale-[0.75] z-0">
                  <Logo />
                </div>

                {/* Right Side: Group Label and Player Count below it */}
                <div className="flex flex-col gap-1 items-center min-w-[100px]">
                  <Badge variant="outline" className="text-[9px] sm:text-[10px] px-2 py-0 uppercase tracking-widest border-white/20 text-white/50 shrink-0">
                    # Of Players
                  </Badge>
                  <div className="flex items-center gap-1.5 opacity-50 h-[28px] sm:h-[32px]">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-tighter">{players.length} Players</span>
                  </div>
                </div>
              </div>
            </CardHeader>
                        
            <CardContent aria-live="polite" className="min-h-[25vh] md:min-h-[30vh] flex items-center justify-center p-6 md:p-10">
              {gameEnded ? (
                <div className="space-y-4 animate-fade-in text-center">
                  <p className="text-3xl font-bold text-secondary neon-text-accent">Last Call!</p>
                  <p className="text-muted-foreground text-lg italic">The deck is empty. Pass the phone and restart.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <p key={cardKey} className="text-xl md:text-3xl font-medium leading-tight text-white text-center animate-card-enter drop-shadow-md">
                    {processedPromptText}
                  </p>
                  {timerTotal !== null && (
                    <div className="flex items-center gap-3">
                      {timerRunning ? (
                        <span className="text-3xl font-bold tabular-nums text-accent neon-text-accent" aria-live="off">
                          ⏱ {formatSeconds(timeLeft ?? 0)}
                        </span>
                      ) : timeLeft === 0 ? (
                        <span className="text-2xl font-bold text-secondary neon-text-accent animate-fade-in">⏰ Time&apos;s up!</span>
                      ) : null}
                      {!timerRunning && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startTimer}
                          className="rounded-full border-accent/40 text-accent hover:bg-accent/10 text-xs uppercase tracking-widest"
                        >
                          {timeLeft === 0 ? 'Restart Timer' : `Start ${formatSeconds(timerTotal)} Timer`}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-white/5 p-4 md:p-6 flex flex-col gap-4">
              <Button
                onClick={gameEnded ? restartGame : handleNextPlayer}
                className="w-full sm:w-auto min-w-[200px] text-lg font-bold py-6 rounded-xl bg-primary text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl mx-auto"
              >
                {gameEnded ? "Restart Deck" : "Next Player"}
                <ArrowRightCircle className="ml-2 h-5 w-5" />
              </Button>
              
              <div className="flex items-center justify-center gap-4 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditSheetOpen(true)} className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-white/5">
                  <Users className="mr-2 h-3 w-3" /> Manage Group
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsNewGameDialogOpen(true)} className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-white/5">
                  <RotateCcw className="mr-2 h-3 w-3" /> End Game
                </Button>
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen text-primary text-2xl font-headline animate-pulse">Charging Neon...</div>}>
      <GamePageContent />
    </Suspense>
  );
}