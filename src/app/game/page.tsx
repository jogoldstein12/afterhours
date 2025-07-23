"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/Header';
import { PROMPTS, Prompt, NsfwLevel } from '@/lib/prompts';
import { ArrowRightCircle, Home, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [players, setPlayers] = useState<string[]>([]);
  const [nsfwLevel, setNsfwLevel] = useState<NsfwLevel>('Mild');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [processedPromptText, setProcessedPromptText] = useState<string>('');
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [usedPromptIds, setUsedPromptIds] = useState<Set<number>>(new Set());
  const [gameEnded, setGameEnded] = useState(false);
  const [cardKey, setCardKey] = useState(0); // For re-triggering animation

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

  useEffect(() => {
    if (players.length > 0 && nsfwLevel) {
      const initialPrompts = loadAndFilterPrompts();
      if (initialPrompts.length > 0) {
        selectNewPrompt(initialPrompts, new Set());
      } else {
        setCurrentPrompt(null); // No prompts available for this level
      }
    }
  }, [players, nsfwLevel, loadAndFilterPrompts]);


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
            // This case should ideally not be reached if MIN_PLAYERS is 2 and currentPlayerIndex is valid
            text = text.replace(/\{\{randomOtherPlayer\}\}/g, 'another player (error: no other players found)');
          }
        } else {
          // Only one player in the game, cannot select another
          text = text.replace(/\{\{randomOtherPlayer\}\}/g, 'another player (error: only one player)');
        }
      }
       // Convert the first letter of the prompt text to lowercase
       if (text.length > 0) {
        text = text.charAt(0).toLowerCase() + text.slice(1);
      }

      // Adjust phrasing based on whether the prompt is a question or starts with "if"
      if (text.trim().endsWith('?')) {
        text = `${currentPlayerName}, ${text}`;
      } else if (text.trim().toLowerCase().startsWith('if')) {
        text = `${currentPlayerName}, ${text}`;
      }
      else {
        text = `${currentPlayerName} must ${text}`;
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

    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayerIndex);

    const newPrompt = selectNewPrompt(availablePrompts, newUsedPromptIds);
    if (!newPrompt) {
      // Game has ended because all prompts were used
    }
  };

  const restartGame = () => {
    setCurrentPlayerIndex(0);
    const freshPrompts = loadAndFilterPrompts();
    if (freshPrompts.length > 0) {
      selectNewPrompt(freshPrompts, new Set());
      setGameEnded(false);
    } else {
      setCurrentPrompt(null);
      setGameEnded(true);
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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl neon-border-accent bg-card/80 backdrop-blur-sm text-center overflow-hidden">
          <CardHeader>
            {/* Changed CardTitle to be a generic title or removed if preferred */}
            <CardTitle className="text-3xl md:text-4xl font-headline text-primary neon-text-primary">
              Current Prompt {/* Or something like "GlowUp After Hours" */}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              NSFW Level: <span className="font-semibold text-accent">{nsfwLevel}</span>
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
          <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6">
            {gameEnded || !currentPrompt ? (
              <Button onClick={restartGame} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-lg">
                <RotateCcw className="mr-2 h-5 w-5" /> Restart Game
              </Button>
            ) : (
              <Button onClick={handleNextPlayer} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg neon-border-primary">
                Next Player <ArrowRightCircle className="ml-2 h-5 w-5" />
              </Button>
            )}
            <Button onClick={() => router.push('/')} variant="outline" className="w-full sm:w-auto text-accent border-accent hover:bg-accent/10 py-3 text-lg">
              <Home className="mr-2 h-5 w-5" /> End Game
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}


export default function GamePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen text-primary text-xl">Loading game settings...</div>}>
      <GamePageContent />
    </Suspense>
  );
}
