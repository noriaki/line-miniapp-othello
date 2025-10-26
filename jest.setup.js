// Jest setup file for React Testing Library
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@testing-library/jest-dom');

// Global mock for @line/liff SDK
// This ensures all tests can run without actual LIFF SDK
// Requirement 9.1: LIFF SDKのモック実装を使用
jest.mock('@line/liff', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    isInClient: jest.fn(),
    isLoggedIn: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}));
