"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { ShieldAlert, Wine } from 'lucide-react';

const AGE_GATE_KEY = 'afterhours.ageConfirmed';

/**
 * Routes that are readable without passing the gate. The gate asks you to agree
 * to these documents, so gating them would mean agreeing to terms you cannot
 * read — and it would make the links on the gate loop straight back to it.
 * Keeping them open also means they prerender real content for the crawlers
 * robots.txt invites to them.
 */
const ALWAYS_READABLE = ['/terms', '/privacy'];

/**
 * Adults-only confirmation shown before the app is reachable.
 *
 * This is a client-side gate: it is an honest, visible statement of who the
 * product is for and a record that the visitor asserted their age, not a
 * security boundary. A gate that a determined visitor cannot step around needs
 * a server to enforce it, which arrives with the accounts work. Until then this
 * is the same control every comparable product ships, and it is what search
 * engines, filters, and app reviewers look for.
 *
 * The confirmation is remembered per-device in localStorage. When storage is
 * unavailable (private mode, storage blocked) the gate simply shows every
 * visit — failing closed is the right direction here.
 */
export function AgeGate({ children }: { children: React.ReactNode }) {
  // 'checking' keeps the app in the DOM but unpainted, so it never flashes
  // behind the gate on a first visit. It resolves in the first client effect.
  const [status, setStatus] = useState<'checking' | 'gated' | 'allowed'>('checking');
  const pathname = usePathname();

  useEffect(() => {
    try {
      setStatus(localStorage.getItem(AGE_GATE_KEY) === 'true' ? 'allowed' : 'gated');
    } catch {
      setStatus('gated');
    }
  }, []);

  const confirm = () => {
    try {
      localStorage.setItem(AGE_GATE_KEY, 'true');
    } catch {
      // Confirmed for this session only; the gate returns next visit.
    }
    setStatus('allowed');
  };

  // Declared after every hook so the hook order never changes between renders.
  if (ALWAYS_READABLE.includes(pathname)) return <>{children}</>;

  const blocked = status !== 'allowed';

  return (
    <>
      {/*
        The app stays mounted and in the markup even while the gate is up, and
        `display: none` keeps it off the screen. Returning null instead — which
        is what this did first — meant every prerendered route shipped an empty
        body, so crawlers and anything that does not run JS saw a blank page.
        `contents` makes the wrapper itself invisible to layout once the gate
        lifts, so the pages below lay out exactly as they would unwrapped.
      */}
      <div className={blocked ? 'hidden' : 'contents'}>{children}</div>

      {status === 'gated' && (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <main className="flex w-full max-w-md flex-col items-center text-center">
            <Logo className="mb-8 flex-col gap-3 text-center" />

            <div className="w-full rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur-md neon-border-primary">
              <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-destructive" />
              <h1 className="font-headline text-2xl font-bold text-white">Adults only</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                After Hours is an explicit party game for adults. It contains sexual
                content, strong language, and dares intended for consenting adults
                who know each other.
              </p>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-left">
                <Wine className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The game suggests drinking. Never play if you are under your local
                  legal drinking age, pregnant, driving, or on medication that
                  interacts with alcohol. Every prompt is optional — skip anything
                  you do not want to do, and never pressure anyone else.
                </p>
              </div>

              <Button
                onClick={confirm}
                className="mt-6 h-14 w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground neon-border-primary transition-transform active:scale-[0.98] touch-manipulation"
              >
                I&apos;m 18 or older — enter
              </Button>

              <p className="mt-4 text-xs text-muted-foreground/80">
                By entering you agree to our{' '}
                <Link href="/terms" className="text-primary underline underline-offset-2 hover:text-primary/80">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                  Privacy Policy
                </Link>
                , and confirm you are of legal age where you live.
              </p>
            </div>

            <p className="mt-6 text-xs text-muted-foreground/80">
              Not 18? Please close this page.
            </p>
          </main>
        </div>
      )}
    </>
  );
}
