"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NsfwLevel } from '@/lib/prompts';
import { moderateContent, ModerateContentInput, ModerateContentOutput } from '@/ai/flows/content-moderator';
import { AlertCircle, CheckCircle2, Loader2, ShieldQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ModeratorTestForm() {
  const [content, setContent] = useState('');
  const [nsfwLevel, setNsfwLevel] = useState<NsfwLevel>('Mild');
  const [result, setResult] = useState<ModerateContentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter some content to moderate.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const input: ModerateContentInput = { content, nsfwLevel };
      const moderationResult = await moderateContent(input);
      setResult(moderationResult);
    } catch (error) {
      console.error('Error moderating content:', error);
      toast({
        title: 'Moderation Error',
        description: 'Failed to moderate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl neon-border-primary bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <ShieldQuestion className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="text-3xl font-headline text-primary neon-text-primary">Content Moderator Test</CardTitle>
        <CardDescription className="text-muted-foreground">
          Test the AI's content moderation capabilities.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content-input" className="text-lg text-accent neon-text-accent">Content to Moderate</Label>
            <Textarea
              id="content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter text for moderation..."
              rows={4}
              className="bg-input border-border focus:neon-border-accent text-foreground placeholder:text-muted-foreground"
              aria-label="Content to moderate"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-lg text-accent neon-text-accent">Target NSFW Level</Label>
            <RadioGroup
              value={nsfwLevel}
              onValueChange={(value: string) => setNsfwLevel(value as NsfwLevel)}
              className="flex space-x-2 md:space-x-4 justify-around"
            >
              {(['Mild', 'Medium', 'Extreme'] as NsfwLevel[]).map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={level} 
                    id={`mod-nsfw-${level.toLowerCase()}`}
                    className="text-primary border-primary focus:ring-primary checked:bg-primary checked:text-primary-foreground"
                  />
                  <Label htmlFor={`mod-nsfw-${level.toLowerCase()}`} className="text-foreground cursor-pointer hover:text-accent transition-colors">{level}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 neon-border-primary">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShieldQuestion className="mr-2 h-5 w-5" />
            )}
            Moderate Content
          </Button>
          {result && (
            <div className={`mt-4 p-4 rounded-md w-full text-center ${result.isAppropriate ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'} border animate-fade-in`}>
              {result.isAppropriate ? (
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="mr-2 h-6 w-6 text-green-400" />
                  <p className="text-lg font-semibold text-green-300">Content is Appropriate</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 h-6 w-6 text-red-400" />
                    <p className="text-lg font-semibold text-red-300">Content Flagged</p>
                  </div>
                  {result.flagReason && (
                    <p className="mt-1 text-sm text-red-200">Reason: {result.flagReason}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
