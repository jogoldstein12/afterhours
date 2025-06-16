"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/Header';
import { Users, MinusCircle, PlusCircle, ShieldAlert, Zap } from 'lucide-react';
import type { NsfwLevel } from '@/lib/prompts';
import { useToast } from '@/hooks/use-toast';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10; // Arbitrary limit

export default function HomePage() {
  const [players, setPlayers] = useState<string[]>(['', '']);
  const [nsfwLevel, setNsfwLevel] = useState<NsfwLevel>('Mild');
  const router = useRouter();
  const { toast } = useToast();

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, '']);
    } else {
      toast({
        title: "Max Players Reached",
        description: `You can add up to ${MAX_PLAYERS} players.`,
        variant: "destructive",
      });
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > MIN_PLAYERS) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    } else {
       toast({
        title: "Minimum Players",
        description: `You need at least ${MIN_PLAYERS} players.`,
        variant: "destructive",
      });
    }
  };

  const startGame = () => {
    const validPlayers = players.map(p => p.trim()).filter(p => p !== '');
    if (validPlayers.length < MIN_PLAYERS) {
      toast({
        title: 'Not Enough Players',
        description: `Please enter names for at least ${MIN_PLAYERS} players.`,
        variant: 'destructive',
      });
      return;
    }
    const playerQuery = encodeURIComponent(validPlayers.join(','));
    router.push(`/game?players=${playerQuery}&nsfwLevel=${nsfwLevel}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl neon-border-primary bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <Users className="mx-auto h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-3xl font-headline text-primary neon-text-primary">Game Setup</CardTitle>
            <CardDescription className="text-muted-foreground">Get ready for some after hours fun!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-lg font-medium text-accent neon-text-accent flex items-center">
                <Users className="mr-2 h-5 w-5" /> Players
              </Label>
              {players.map((player, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder={`Player ${index + 1}`}
                    value={player}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    className="bg-input border-border focus:neon-border-accent text-foreground placeholder:text-muted-foreground"
                    aria-label={`Player ${index + 1} name`}
                  />
                  {players.length > MIN_PLAYERS && (
                    <Button variant="ghost" size="icon" onClick={() => removePlayer(index)} aria-label={`Remove player ${index + 1}`}>
                      <MinusCircle className="h-5 w-5 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {players.length < MAX_PLAYERS && (
                <Button variant="outline" onClick={addPlayer} className="w-full border-accent text-accent hover:bg-accent/10">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Player
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              <Label className="text-lg font-medium text-accent neon-text-accent flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5" /> NSFW Level
              </Label>
              <RadioGroup
                value={nsfwLevel}
                onValueChange={(value: string) => setNsfwLevel(value as NsfwLevel)}
                className="flex space-x-2 md:space-x-4 justify-center"
              >
                {(['Mild', 'Medium', 'Extreme'] as NsfwLevel[]).map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={level} 
                      id={`nsfw-${level.toLowerCase()}`} 
                      className="text-primary border-primary focus:ring-primary checked:bg-primary checked:text-primary-foreground"
                    />
                    <Label htmlFor={`nsfw-${level.toLowerCase()}`} className="text-foreground cursor-pointer hover:text-accent transition-colors">{level}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startGame} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 font-bold neon-border-primary">
              <Zap className="mr-2 h-5 w-5" /> Start Game
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Remember to play responsibly! For ages 17+.
      </footer>
    </div>
  );
}
