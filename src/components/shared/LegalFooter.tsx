import Link from 'next/link';

/**
 * Legal links and the standing responsible-play line. Rendered on the setup
 * lobby and the legal pages; the play screen is a full-height surface with its
 * own dock, and the age gate already puts both links in front of every visitor.
 */
export function LegalFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`w-full text-center text-xs text-muted-foreground/70 ${className}`}>
      <p className="mb-2">
        18+ only. Please drink responsibly — every prompt is optional.
      </p>
      <nav className="flex items-center justify-center gap-3">
        <Link href="/terms" className="transition-colors hover:text-primary">
          Terms
        </Link>
        <span aria-hidden className="text-white/15">·</span>
        <Link href="/privacy" className="transition-colors hover:text-primary">
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
