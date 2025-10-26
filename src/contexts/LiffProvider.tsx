/**
 * LIFF Provider
 *
 * Client Component that initializes LIFF SDK and provides LIFF state
 * to the application through React Context.
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { LiffContext } from './LiffContext';
import { LiffClient } from '@/lib/liff/liff-client';
import type { LiffProfile } from '@/lib/liff/types';

interface LiffProviderProps {
  children: React.ReactNode;
}

/**
 * LiffProvider Component
 * Initializes LIFF SDK on mount and provides LIFF state to children
 */
export function LiffProvider({ children }: LiffProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInClient, setIsInClient] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);

  const liffClientRef = useRef<LiffClient | null>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate initialization
    if (initializingRef.current) {
      return;
    }

    initializingRef.current = true;

    const initializeLiff = async () => {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

      // Check if LIFF_ID is set
      if (!liffId) {
        console.warn('LIFF_ID not set: LIFF features are disabled');
        setIsReady(true);
        return;
      }

      // Create LiffClient instance
      const client = new LiffClient();
      liffClientRef.current = client;

      try {
        // Initialize LIFF SDK
        await client.initialize(liffId);

        // Check environment and login status
        const inClient = client.isInClient();
        const loggedIn = client.isLoggedIn();

        setIsInClient(inClient);
        setIsLoggedIn(loggedIn);

        // Try to get profile if logged in
        if (loggedIn) {
          try {
            const userProfile = await client.getProfile();
            setProfile(userProfile);
          } catch (profileError) {
            console.error('Profile retrieval failed:', profileError);
            setError(
              'Failed to retrieve profile information. Default icon will be displayed.'
            );
            // Keep isReady=true even if profile fails
          }
        }

        setIsReady(true);
      } catch (initError) {
        console.error('LIFF initialization failed:', initError);
        setError(
          'LINE integration is unavailable. You can continue playing in normal mode.'
        );
        setIsReady(true); // Set ready even on error (fallback mode)
      }
    };

    initializeLiff();
  }, []);

  // Login function for external browser
  const login = async () => {
    if (!liffClientRef.current) {
      throw new Error('LIFF not initialized');
    }
    await liffClientRef.current.login();
  };

  // Logout function
  const logout = async () => {
    if (!liffClientRef.current) {
      throw new Error('LIFF not initialized');
    }
    await liffClientRef.current.logout();
    setProfile(null);
    setIsLoggedIn(false);
  };

  const contextValue = {
    isReady,
    error,
    isInClient,
    isLoggedIn,
    profile,
    login,
    logout,
  };

  return (
    <LiffContext.Provider value={contextValue}>{children}</LiffContext.Provider>
  );
}
