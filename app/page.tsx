import React from 'react';
import GameBoard from '@/components/GameBoard';

/**
 * Game Page (Server Component)
 * Generates static HTML and mounts the GameBoard Client Component
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-line-light">
      <GameBoard />
    </main>
  );
}
