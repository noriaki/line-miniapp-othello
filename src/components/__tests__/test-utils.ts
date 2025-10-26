/**
 * Test utilities for GameBoard component tests
 *
 * Provides shared mock configurations for LIFF integration
 */

/**
 * Default LIFF mock state for GameBoard tests
 * Represents no LIFF features enabled (external browser, not logged in)
 */
export const DEFAULT_LIFF_MOCK = {
  isReady: true,
  error: null,
  isInClient: false,
  isLoggedIn: false,
  profile: null,
  login: jest.fn(),
  logout: jest.fn(),
};

/**
 * Setup useLiff mock for tests
 * Call this at the top of test files that render GameBoard
 *
 * @param mockState - Optional custom LIFF state (defaults to DEFAULT_LIFF_MOCK)
 */
export function setupUseLiffMock(mockState = DEFAULT_LIFF_MOCK) {
  jest.mock('@/hooks/useLiff', () => ({
    useLiff: () => mockState,
  }));
}
