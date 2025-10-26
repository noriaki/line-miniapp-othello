/**
 * useLiff Hook
 *
 * Custom hook for accessing LIFF context.
 * Provides type-safe access to LIFF state and operations.
 */

'use client';

import { useContext } from 'react';
import { LiffContext } from '@/contexts/LiffContext';
import type { LiffContextType } from '@/lib/liff/types';

/**
 * useLiff custom hook
 * Provides access to LIFF state and operations from LiffContext
 *
 * @returns LiffContextType - LIFF state and API functions
 * @throws Error if used outside LiffProvider
 */
export function useLiff(): LiffContextType {
  const context = useContext(LiffContext);

  // Ensure hook is used within LiffProvider
  if (!context) {
    throw new Error(
      'useLiff must be used within LiffProvider. ' +
        'Please wrap your component tree with <LiffProvider>.'
    );
  }

  return context;
}
