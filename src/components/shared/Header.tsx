import Link from 'next/link';

export function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border/50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-headline font-bold text-primary neon-text-primary hover:opacity-80 transition-opacity">
          After Hours Party Game
        </Link>
        <nav className="space-x-4">
          <Link href="/" className="text-accent hover:text-primary transition-colors">
            New Game
          </Link>
          <Link href="/moderator-test" className="text-accent hover:text-primary transition-colors">
            Moderator Test
          </Link>
        </nav>
      </div>
    </header>
  );
}
