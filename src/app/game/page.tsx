"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/Header';
import { PROMPTS, Prompt, NsfwLevel } from '@/lib/prompts';
import { ArrowRightCircle, Home, RotateCcw, Trash2, UserPlus } from 'lucide-react';
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

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [players, setPlayers] = useState<string[]>([]);
  const [nsfwLevel, setNsfwLevel] = useState<NsfwLevel>('Mild');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [processedPromptText, setProcessedPromptText] = useState<string>('');
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [usedPromptIds, setUsedPromptIds] = useState<Set<number>>(new Set());
  const [gameEnded, setGameEnded] = useState(false);
  const [cardKey, setCardKey] = useState(0); // For re-triggering animation
  const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');


  useEffect(() => {
    const playersQuery = searchParams.get('players');
    const nsfwLevelQuery = searchParams.get('nsfwLevel') as NsfwLevel;

    if (playersQuery) {
      setPlayers(decodeURIComponent(playersQuery).split(','));
    }
    if (nsfwLevelQuery) {
      setNsfwLevel(nsfwLevelQuery);
    }
  }, [searchParams]);

  const loadAndFilterPrompts = useCallback(() => {
    const filtered = PROMPTS.filter(p => p.nsfwLevel === nsfwLevel);
    setAvailablePrompts(filtered);
    setUsedPromptIds(new Set()); // Reset used prompts when level/players change (or on initial load)
    return filtered;
  }, [nsfwLevel]);

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
    setCardKey(prevKey => prevKey + 1); // Update key to re-trigger animation
    return newPrompt;
  }, []);
  
  const restartGame = useCallback(() => {
    setCurrentPlayerIndex(0);
    const freshPrompts = loadAndFilterPrompts();
    if (freshPrompts.length > 0) {
      selectNewPrompt(freshPrompts, new Set());
      setGameEnded(false);
    } else {
      setCurrentPrompt(null);
      setGameEnded(true);
    }
    setIsNewGameDialogOpen(false);
  }, [loadAndFilterPrompts, selectNewPrompt]);

  useEffect(() => {
    if (players.length > 0 && nsfwLevel) {
      const initialPrompts = loadAndFilterPrompts();
      if (initialPrompts.length > 0) {
        selectNewPrompt(initialPrompts, new Set());
      } else {
        setCurrentPrompt(null); // No prompts available for this level
      }
    }
  }, [players, nsfwLevel, loadAndFilterPrompts, selectNewPrompt]);


  useEffect(() => {
    if (gameEnded) {
      setProcessedPromptText("Game Over! You've gone through all the prompts for this level.");
    } else if (currentPrompt && players.length > 0) {
      let text = currentPrompt.text;
      const currentPlayerName = players[currentPlayerIndex]; // Get current player's name

      // Handle {{randomOtherPlayer}} placeholder
      if (text.includes('{{randomOtherPlayer}}')) {
        if (players.length > 1) {
          // Get players other than the current player
          const otherPlayers = players.filter((_, index) => index !== currentPlayerIndex);
          if (otherPlayers.length > 0) {
            const randomPlayerName = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
            text = text.replace(/\{\{randomOtherPlayer\}\}/g, randomPlayerName);
          } else {
            text = text.replace(/\{\{randomOtherPlayer\}\}/g, 'another player');
          }
        } else {
          // Only one player in the game, cannot select another
          text = text.replace(/\{\{randomOtherPlayer\}\}/g, 'another player');
        }
      }
       
      const trimmedLower = text.trim().toLowerCase();
      if (
        !text.includes('?') &&
        !trimmedLower.startsWith('if') &&
        !trimmedLower.startsWith('everyone') &&
        !trimmedLower.startsWith('anybody') &&
        !trimmedLower.startsWith('anyone') &&
        !trimmedLower.startsWith('the ') &&
        !trimmedLower.startsWith('girls') &&
        !trimmedLower.startsWith('men') &&
        !trimmedLower.startsWith('women') &&
        !trimmedLower.startsWith('no one') &&
        !trimmedLower.startsWith('shortest') &&
        !trimmedLower.startsWith('dominant')
      ) {
        if (text.length > 0) {
          text = text.charAt(0).toLowerCase() + text.slice(1);
        }
        text = `${currentPlayerName}, ${text}`;
      } else {
         if(text.length > 0) {
           text = text.charAt(0).toUpperCase() + text.slice(1);
         }
      }

      setProcessedPromptText(text);
    } else if (players.length > 0) {
      setProcessedPromptText("No prompts available for this level. Try restarting or changing the NSFW level.");
    } else {
      setProcessedPromptText("Loading prompt...");
    }
  }, [currentPrompt, players, currentPlayerIndex, gameEnded]);


  const handleNextPlayer = () => {
    if (gameEnded || !currentPrompt) return;

    const newUsedPromptIds = new Set(usedPromptIds);
    if (currentPrompt) {
      newUsedPromptIds.add(currentPrompt.id);
    }
    setUsedPromptIds(newUsedPromptIds);

    const nextPlayerIndex = Math.floor(Math.random() * players.length);
    setCurrentPlayerIndex(nextPlayerIndex);

    selectNewPrompt(availablePrompts, newUsedPromptIds);
  };

  const handleAddPlayer = () => {
    const trimmedName = newPlayerName.trim();
    if (trimmedName === '') {
      toast({ title: 'Player name cannot be empty.', variant: 'destructive' });
      return;
    }
    if (players.length >= MAX_PLAYERS) {
      toast({ title: `Cannot add more than ${MAX_PLAYERS} players.`, variant: 'destructive' });
      return;
    }
    setPlayers(prev => [...prev, trimmedName]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (indexToRemove: number) => {
    if (players.length <= MIN_PLAYERS) {
      toast({ title: `You need at least ${MIN_PLAYERS} players.`, description: "Go to the home page to start a new game with fewer players.", variant: 'destructive' });
      return;
    }

    setPlayers(prev => prev.filter((_, index) => index !== indexToRemove));

    // Adjust currentPlayerIndex if necessary
    if (currentPlayerIndex >= indexToRemove) {
      // If the removed player was before or at the current player's index,
      // shift the current index back. The modulo will handle wrapping around.
      setCurrentPlayerIndex(prev => (prev - 1 + players.length) % (players.length - 1));
    }
  };


  if (players.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-primary neon-text-primary">Loading Game...</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">If this takes too long, please return to the home page and start a new game.</p>
              <Button onClick={() => router.push('/')} variant="outline" className="mt-4 text-accent border-accent hover:bg-accent/10">
                <Home className="mr-2 h-4 w-4" /> Go Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={isNewGameDialogOpen} onOpenChange={setIsNewGameDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a New Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to restart with the same players or go back to the setup screen to enter new players?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/')}>New Players</AlertDialogAction>
            <AlertDialogAction onClick={restartGame}>Restart Game</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Players</SheetTitle>
            <SheetDescription>
              Add or remove players from the current game.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <Label>Current Players</Label>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                   <span className="font-medium">{player}</span>
                   <Button variant="ghost" size="icon" onClick={() => handleRemovePlayer(index)} disabled={players.length <= MIN_PLAYERS}>
                     <Trash2 className="h-4 w-4 text-destructive" />
                   </Button>
                </div>
              ))}
            </div>
             <div className="space-y-2 pt-4">
                <Label htmlFor="new-player-name">Add New Player</Label>
                <div className="flex gap-2">
                  <Input 
                    id="new-player-name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="New player name"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                  />
                  <Button onClick={handleAddPlayer} disabled={players.length >= MAX_PLAYERS}>
                    <UserPlus />
                  </Button>
                </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={() => setIsEditSheetOpen(false)}>Done</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>


      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header onNewGameClick={() => setIsNewGameDialogOpen(true)} onEditPlayersClick={() => setIsEditSheetOpen(true)} />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl neon-border-accent bg-card/80 backdrop-blur-sm text-center overflow-hidden">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-headline text-primary neon-text-primary">
                Current Prompt
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                NSFW Level: <span className="font-semibold text-accent">{nsfwLevel}</span> | Player: <span className="font-semibold text-primary">{players[currentPlayerIndex]}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] md:min-h-[250px] flex items-center justify-center p-6">
              {gameEnded ? (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-2xl font-semibold text-accent">Game Over!</p>
                  <p className="text-muted-foreground">You've gone through all the prompts for this level.</p>
                </div>
              ) : currentPrompt ? (
                <p key={cardKey} className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed text-foreground animate-card-enter">
                  {processedPromptText}
                </p>
              ) : (
                <p className="text-xl text-muted-foreground animate-fade-in">{processedPromptText}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              {gameEnded || !currentPrompt ? (
                <Button onClick={restartGame} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-lg">
                  <RotateCcw className="mr-2 h-5 w-5" /> Restart Game
                </Button>
              ) : (
                <Button onClick={handleNextPlayer} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg neon-border-primary">
                  Next Player <ArrowRightCircle className="ml-2 h-5 w-5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </main>
      </div>
    </>
  );
}


export default function GamePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen text-primary text-xl">Loading game settings...</div>}>
      <GamePageContent />
    </Suspense>
  );
}
