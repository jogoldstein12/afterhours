import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LegalFooter } from './LegalFooter';
import { LEGAL, LEGAL_IS_DRAFT } from '@/lib/legal';

/**
 * Shared reading layout for the Terms and Privacy pages: comfortable measure,
 * on-brand but calm (no neon glow on body copy), and a way back to the game.
 */
export function LegalShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  /** Each document carries its own date; changing one must not restamp the other. */
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the game
        </Link>

        <h1 className="font-headline text-3xl font-bold text-primary neon-text-primary">{title}</h1>
        <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground/70">
          Last updated {lastUpdated}
        </p>

        {LEGAL_IS_DRAFT && (
          <p className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
            <strong className="font-semibold">Draft — not yet in force.</strong> This
            document still contains placeholders and has not been reviewed by a
            lawyer. Complete <code className="text-xs">src/lib/legal.ts</code> and
            take legal advice before launch.
          </p>
        )}

        <article className="legal-prose mt-8 flex-1 text-sm leading-relaxed text-muted-foreground">
          {children}
        </article>

        <LegalFooter className="mt-12" />
      </div>
    </div>
  );
}
