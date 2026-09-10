import Link from 'next/link';
import { Logo } from './Logo';

export function Header() {
  return (
    <header className="py-3 px-4 md:py-4 md:px-8 border-b border-border/50 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="container mx-auto flex justify-center">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
      </div>
    </header>
  );
}