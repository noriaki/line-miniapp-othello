/**
 * LIFF Integration Type Definitions
 *
 * All LIFF-related type definitions are centralized in this file to avoid circular dependencies
 * and maintain consistency with existing type definition patterns (e.g., /src/lib/game/types.ts)
 */

/**
 * LINE Profile Information
 * Subset of LIFF SDK Profile type with commonly used fields
 */
export interface LiffProfile {
  /** LINE internal user ID */
  userId: string;

  /** Display name */
  displayName: string;

  /** Profile picture URL (optional) */
  pictureUrl?: string;

  /** Status message (optional) */
  statusMessage?: string;
}

/**
 * LIFF Context Type
 * Defines the shape of LIFF state provided through React Context
 */
export interface LiffContextType {
  /** LIFF SDK initialization complete flag */
  isReady: boolean;

  /** LIFF initialization error (null if successful) */
  error: string | null;

  /** LINE app execution environment check (null if undetermined) */
  isInClient: boolean | null;

  /** Login state (null if undetermined) */
  isLoggedIn: boolean | null;

  /** Profile information (null if not retrieved or not logged in) */
  profile: LiffProfile | null;

  /** Execute login (for external browser) */
  login: () => Promise<void>;

  /** Execute logout */
  logout: () => Promise<void>;
}

/**
 * LIFF Client Interface
 * Type-safe wrapper for LIFF SDK API operations
 */
export interface LiffClientInterface {
  /**
   * Initialize LIFF SDK
   * @param liffId - LIFF ID from environment variables
   * @returns Promise that resolves on success, rejects on failure
   * @throws Error if LIFF ID is not set or initialization fails
   */
  initialize(liffId: string): Promise<void>;

  /**
   * Check if running inside LINE app
   * @returns true if inside LINE app, false if external browser
   */
  isInClient(): boolean;

  /**
   * Check login state
   * @returns true if logged in, false if not logged in
   */
  isLoggedIn(): boolean;

  /**
   * Execute login (for external browser)
   * @returns Promise that starts login flow
   */
  login(): Promise<void>;

  /**
   * Execute logout
   * @returns Promise that completes logout
   */
  logout(): Promise<void>;

  /**
   * Get profile information
   * @returns Promise with profile information
   * @throws Error if not logged in or API call fails
   */
  getProfile(): Promise<LiffProfile>;
}
