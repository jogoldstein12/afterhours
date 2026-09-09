"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import { RotateCcw } from 'lucide-react';
import { reportError } from '@/lib/monitoring';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10 text-center">
      <Logo className="mb-10 flex-col gap-3" />
      <h1 className="font-headline text-2xl font-bold text-white">The lights went out</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Something broke on our side. Your group and your setup are safe — try
        again, or head back and start a fresh round.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          ref {error.digest}
        </p>
      )}
      <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
        <Button
          onClick={reset}
          className="h-14 w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground neon-border-primary touch-manipulation"
        >
          <RotateCcw className="mr-2 h-5 w-5" /> Try again
        </Button>
        <Button
          asChild
          variant="ghost"
          className="h-12 w-full rounded-2xl text-base font-medium text-white/70 hover:bg-white/5 hover:text-white touch-manipulation"
        >
          <Link href="/">Back to setup</Link>
        </Button>
      </div>
    </div>
  );
}
