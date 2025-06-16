"use client";

import { Header } from '@/components/shared/Header';
import { ModeratorTestForm } from '@/components/moderator/ModeratorTestForm';

export default function ModeratorTestPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <ModeratorTestForm />
      </main>
       <footer className="text-center p-4 text-sm text-muted-foreground">
        AI moderation is a tool, always review sensitive content.
      </footer>
    </div>
  );
}
