import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  onNewGameClick?: () => void;
  onEditPlayersClick?: () => void;
};

export function Header({ onNewGameClick, onEditPlayersClick }: HeaderProps) {
    const router = useRouter();
  return (
    <header className="py-2 px-4 md:py-4 md:px-8 border-b border-border/50">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0">
        <Link href="/" className="text-xl sm:text-2xl font-headline font-bold text-primary neon-text-primary hover:opacity-80 transition-opacity text-center sm:text-left">
          After Hours Party Game
        </Link>
        <nav className="flex justify-center sm:justify-end items-center space-x-2 md:space-x-4">
          {onEditPlayersClick && (
             <Button variant="link" onClick={onEditPlayersClick} className="text-md md:text-base text-accent hover:text-primary transition-colors px-1 md:px-2">
              <Users className="mr-2 h-4 w-4" />
              Players
            </Button>
          )}
          {onNewGameClick ? (
            <Button variant="link" onClick={onNewGameClick} className="text-md md:text-base text-accent hover:text-primary transition-colors px-1 md:px-2">
              New Game
            </Button>
          ) : (
            <Link href="/" className="text-md md:text-base text-accent hover:text-primary transition-colors">
              New Game
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
