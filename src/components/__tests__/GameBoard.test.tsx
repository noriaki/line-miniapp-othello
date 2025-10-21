import React from 'react';
import { render, screen } from '@testing-library/react';
import GameBoard from '../GameBoard';

// Mock useAIPlayer hook to avoid import.meta issues in tests
jest.mock('@/hooks/useAIPlayer', () => ({
  useAIPlayer: () => ({
    calculateMove: jest.fn().mockResolvedValue({ row: 0, col: 0 }),
  }),
}));

describe('GameBoard Component', () => {
  it('正しくレンダリングされること', () => {
    render(<GameBoard />);
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });

  it('初期状態で8x8のボードを表示すること', () => {
    render(<GameBoard />);
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(64);
  });

  it('初期配置で中央に4つの石が配置されていること', () => {
    const { container } = render(<GameBoard />);
    // 中央4マスに石があることを確認
    const blackStones = container.querySelectorAll('[data-stone="black"]');
    const whiteStones = container.querySelectorAll('[data-stone="white"]');
    expect(blackStones.length).toBe(2);
    expect(whiteStones.length).toBe(2);
  });

  it('現在のターンを表示すること', () => {
    render(<GameBoard />);
    expect(screen.getByText(/黒のターン/)).toBeInTheDocument();
  });

  it('石数をリアルタイムで表示すること', () => {
    render(<GameBoard />);
    // 初期状態: 黒2個、白2個
    expect(screen.getByText(/黒.*2/)).toBeInTheDocument();
    expect(screen.getByText(/白.*2/)).toBeInTheDocument();
  });
});
