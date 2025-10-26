/**
 * GameBoard LIFF Integration Tests
 *
 * Tests for LINE profile icon display and LIFF feature integration
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GameBoard from '../GameBoard';

// Mock useLiff hook
let mockLiffState: any = {
  isReady: false,
  error: null,
  isInClient: null,
  isLoggedIn: null,
  profile: null,
  login: jest.fn(),
  logout: jest.fn(),
};

jest.mock('@/hooks/useLiff', () => ({
  useLiff: () => mockLiffState,
}));

// Mock useAIPlayer to avoid import.meta issues
jest.mock('@/hooks/useAIPlayer', () => ({
  useAIPlayer: () => ({
    calculateMove: jest.fn().mockResolvedValue({ row: 0, col: 0 }),
  }),
}));

describe('GameBoard - LIFF Integration', () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockLiffState = {
      isReady: false,
      error: null,
      isInClient: null,
      isLoggedIn: null,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };
  });

  describe('Task 4.1: Profile Icon Display', () => {
    it('should display LINE profile icon when profile is available', () => {
      // Mock LIFF with profile
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: true,
        isLoggedIn: true,
        profile: {
          userId: 'U1234567890',
          displayName: 'Test User',
          pictureUrl: 'https://example.com/profile.jpg',
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should display profile icon
      const profileIcon = screen.getByTestId('profile-icon');
      expect(profileIcon).toBeInTheDocument();
      expect(profileIcon).toHaveAttribute(
        'src',
        'https://example.com/profile.jpg'
      );
      expect(profileIcon).toHaveAttribute('alt', 'Test User');
    });

    it('should display default icon when profile is not available', () => {
      // Mock LIFF without profile
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: false,
        isLoggedIn: false,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should display default icon
      const defaultIcon = screen.getByTestId('default-profile-icon');
      expect(defaultIcon).toBeInTheDocument();
    });

    it('should display default icon when pictureUrl is missing', () => {
      // Mock LIFF with profile but no pictureUrl
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: true,
        isLoggedIn: true,
        profile: {
          userId: 'U1234567890',
          displayName: 'Test User',
          // No pictureUrl
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should display default icon
      const defaultIcon = screen.getByTestId('default-profile-icon');
      expect(defaultIcon).toBeInTheDocument();
    });

    it('should display default icon during LIFF initialization', () => {
      // Mock LIFF not ready
      mockLiffState = {
        isReady: false,
        error: null,
        isInClient: null,
        isLoggedIn: null,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should display default icon while initializing
      const defaultIcon = screen.getByTestId('default-profile-icon');
      expect(defaultIcon).toBeInTheDocument();
    });

    it('should display default icon when LIFF has error', () => {
      // Mock LIFF with error
      mockLiffState = {
        isReady: true,
        error: 'LIFF initialization failed',
        isInClient: null,
        isLoggedIn: null,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should display default icon on error
      const defaultIcon = screen.getByTestId('default-profile-icon');
      expect(defaultIcon).toBeInTheDocument();
    });

    it('should render profile icon in circular shape', () => {
      // Mock LIFF with profile
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: true,
        isLoggedIn: true,
        profile: {
          userId: 'U1234567890',
          displayName: 'Test User',
          pictureUrl: 'https://example.com/profile.jpg',
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const profileIcon = screen.getByTestId('profile-icon');
      // Check for circular styling (rounded-full class)
      expect(profileIcon).toHaveClass('rounded-full');
    });
  });

  describe('Task 4.2: External Browser Login UI', () => {
    it('should display login button when in external browser and not logged in', () => {
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: false, // External browser
        isLoggedIn: false, // Not logged in
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const loginButton = screen.getByTestId('liff-login-button');
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveTextContent(/LINE.*ログイン/i);
    });

    it('should NOT display login button when in LINE app', () => {
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: true, // Inside LINE app
        isLoggedIn: false,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const loginButton = screen.queryByTestId('liff-login-button');
      expect(loginButton).not.toBeInTheDocument();
    });

    it('should NOT display login button when already logged in', () => {
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: false,
        isLoggedIn: true, // Already logged in
        profile: {
          userId: 'U1234567890',
          displayName: 'Test User',
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const loginButton = screen.queryByTestId('liff-login-button');
      expect(loginButton).not.toBeInTheDocument();
    });

    it('should NOT display login button during LIFF initialization', () => {
      mockLiffState = {
        isReady: false, // Not ready
        error: null,
        isInClient: null,
        isLoggedIn: null,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const loginButton = screen.queryByTestId('liff-login-button');
      expect(loginButton).not.toBeInTheDocument();
    });

    it('should call login function when login button is clicked', async () => {
      const user = userEvent.setup();
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: false,
        isLoggedIn: false,
        profile: null,
        login: mockLogin,
        logout: jest.fn(),
      };

      render(<GameBoard />);

      const loginButton = screen.getByTestId('liff-login-button');
      await user.click(loginButton);

      expect(mockLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Task 4.3: Login State UI Updates', () => {
    it('should display profile name when logged in', () => {
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: true,
        isLoggedIn: true,
        profile: {
          userId: 'U1234567890',
          displayName: 'テストユーザー',
          pictureUrl: 'https://example.com/profile.jpg',
        },
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Profile name should be displayed
      expect(screen.getByText(/テストユーザー/)).toBeInTheDocument();
    });

    it('should NOT display profile name when not logged in', () => {
      mockLiffState = {
        isReady: true,
        error: null,
        isInClient: false,
        isLoggedIn: false,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Profile name should not exist
      expect(screen.queryByText(/テストユーザー/)).not.toBeInTheDocument();
    });

    it('should show default UI during LIFF initialization', () => {
      mockLiffState = {
        isReady: false, // Still initializing
        error: null,
        isInClient: null,
        isLoggedIn: null,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
      };

      render(<GameBoard />);

      // Should show default icon
      expect(screen.getByTestId('default-profile-icon')).toBeInTheDocument();
      // Should NOT show login button
      expect(screen.queryByTestId('liff-login-button')).not.toBeInTheDocument();
    });
  });
});
