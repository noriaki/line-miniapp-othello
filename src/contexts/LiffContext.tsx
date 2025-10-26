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
 *
 * Note: Set to undefined to allow useLiff hook to detect usage outside provider
 */
const defaultContextValue: LiffContextType | undefined = undefined;

/**
 * LIFF Context
 * Provides LIFF state and operations to consuming components
 */
export const LiffContext = createContext<LiffContextType | undefined>(
  defaultContextValue
);
