import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10 text-center">
      <Logo className="mb-10 flex-col gap-3" />
      <p className="font-headline text-6xl font-bold text-primary neon-text-primary">404</p>
      <h1 className="mt-4 font-headline text-2xl font-bold text-white">Wrong door</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        There&apos;s nothing here. The party is back the other way.
      </p>
      <Button
        asChild
        className="mt-8 h-14 w-full max-w-xs rounded-2xl bg-primary text-lg font-bold text-primary-foreground neon-border-primary touch-manipulation"
      >
        <Link href="/">Back to setup</Link>
      </Button>
    </div>
  );
}
