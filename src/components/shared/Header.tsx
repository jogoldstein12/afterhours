import Link from 'next/link';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  onNewGameClick?: () => void;
};

export function Header({ onNewGameClick }: HeaderProps) {
  return (
    <header className="py-4 px-4 md:py-6 md:px-8 border-b border-border/50">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-0">
        <Link href="/" className="text-2xl sm:text-3xl font-headline font-bold text-primary neon-text-primary hover:opacity-80 transition-opacity text-center sm:text-left">
          After Hours
        </Link>
        <nav className="flex justify-center sm:justify-end items-center space-x-4">
          {onNewGameClick ? (
            <Button variant="link" onClick={onNewGameClick} className="text-xl md:text-base text-accent hover:text-primary transition-colors px-0">
              New Game
            </Button>
          ) : (
            <Link href="/" className="text-xl md:text-base text-accent hover:text-primary transition-colors">
              New Game
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
