import { useEffect, useRef, useCallback } from 'react';
import type { Board, Player, Position } from '@/lib/game/types';

export function useAIPlayer() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize worker on mount
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        // Check if running in test environment
        if (process.env.NODE_ENV === 'test') {
          // Mock worker in tests
          return;
        }
        workerRef.current = new Worker(
          new URL('../workers/ai-worker.ts', import.meta.url),
          { type: 'module' }
        );
      } catch (error) {
        console.error('Failed to initialize AI worker:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculateMove = useCallback(
    async (board: Board, player: Player): Promise<Position> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }

        // Set up timeout (3 seconds per requirement)
        const timeout = setTimeout(() => {
          reject(new Error('AI calculation timeout (>3s)'));
        }, 3000);

        // Set up message listener
        const handleMessage = (event: MessageEvent) => {
          clearTimeout(timeout);
          workerRef.current?.removeEventListener('message', handleMessage);

          if (event.data.type === 'success') {
            resolve(event.data.payload.move);
          } else {
            reject(new Error(event.data.payload.error));
          }
        };

        workerRef.current.addEventListener('message', handleMessage);

        // Send calculation request to worker
        workerRef.current.postMessage({
          type: 'calculate',
          payload: { board, currentPlayer: player, timeoutMs: 3000 },
        });
      });
    },
    []
  );

  return { calculateMove };
}
