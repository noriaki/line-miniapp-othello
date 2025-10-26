/**
 * LIFF Context
 *
 * React Context for sharing LIFF state across the application.
 * Provides LIFF initialization status, login state, and profile information.
 */

'use client';

import { createContext } from 'react';
import type { LiffContextType } from '@/lib/liff/types';

/**
 * Default context value with initial state
 * Used before LiffProvider initialization
 */
const defaultContextValue: LiffContextType = {
  isReady: false,
  error: null,
  isInClient: null,
  isLoggedIn: null,
  profile: null,
  login: async () => {
    throw new Error('LiffProvider not mounted');
  },
  logout: async () => {
    throw new Error('LiffProvider not mounted');
  },
};

/**
 * LIFF Context
 * Provides LIFF state and operations to consuming components
 */
export const LiffContext = createContext<LiffContextType>(defaultContextValue);
