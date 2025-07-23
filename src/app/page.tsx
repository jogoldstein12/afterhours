"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/Header';
import { Users, MinusCircle, PlusCircle, ShieldAlert, Mars, Venus } from 'lucide-react';
import type { NsfwLevel } from '@/lib/prompts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


type Player = {
  name: string;
  gender: 'male' | 'female' | null;
};

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([
    { name: '', gender: null },
    { name: '', gender: null }
  ]);
  const [nsfwLevel, setNsfwLevel] = useState<NsfwLevel>('Mild');
  const router = useRouter();
  const { toast } = useToast();

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const handleGenderChange = (index: number, gender: 'male' | 'female') => {
    const newPlayers = [...players];
    // Toggle off if the same gender is clicked again
    newPlayers[index].gender = newPlayers[index].gender === gender ? null : gender;
    setPlayers(newPlayers);
  };


  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, { name: '', gender: null }]);
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
    const validPlayers = players.filter(p => p.name.trim() !== '');
    if (validPlayers.length < MIN_PLAYERS) {
      toast({
        title: 'Not Enough Players',
        description: `Please enter names for at least ${MIN_PLAYERS} players.`,
        variant: 'destructive',
      });
      return;
    }
    const playerQuery = encodeURIComponent(validPlayers.map(p => p.name.trim()).join(','));
    router.push(`/game?players=${playerQuery}&nsfwLevel=${nsfwLevel}`);
  };

  return (
    <TooltipProvider>
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
                    value={player.name}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    className="bg-input border-border focus:neon-border-accent text-foreground placeholder:text-muted-foreground"
                    aria-label={`Player ${index + 1} name`}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenderChange(index, 'male')}
                        className={cn('hover:bg-blue-500/20', player.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'text-muted-foreground')}
                        aria-label="Select male"
                      >
                        <Mars className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Male</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenderChange(index, 'female')}
                        className={cn('hover:bg-pink-500/20', player.gender === 'female' ? 'bg-pink-500/20 text-pink-400' : 'text-muted-foreground')}
                        aria-label="Select female"
                      >
                        <Venus className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Female</TooltipContent>
                  </Tooltip>
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
                className="grid grid-cols-3 gap-2 rounded-lg bg-input p-1"
              >
                {(['Mild', 'Medium', 'Extreme'] as NsfwLevel[]).map((level) => (
                    <Label 
                      key={level} 
                      htmlFor={`nsfw-${level.toLowerCase()}`} 
                      className={cn(
                        "flex items-center justify-center space-x-2 rounded-md px-3 py-2 text-center text-sm font-medium cursor-pointer transition-colors",
                        nsfwLevel === level ? 'bg-primary text-primary-foreground neon-border-primary shadow' : 'hover:bg-primary/20'
                      )}
                    >
                      <RadioGroupItem 
                        value={level} 
                        id={`nsfw-${level.toLowerCase()}`} 
                        className="sr-only"
                      />
                      {level}
                    </Label>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startGame} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 font-bold neon-border-primary">
              Start Game
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
    </TooltipProvider>
  );
}
