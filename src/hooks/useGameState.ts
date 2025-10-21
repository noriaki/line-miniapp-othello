import { useState, useCallback } from 'react';
import type { Board, Player, Position, GameStatus } from '@/lib/game/types';
import { createInitialBoard, countStones } from '@/lib/game/board';
import { calculateValidMoves } from '@/lib/game/game-logic';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  validMoves: Position[];
  gameStatus: GameStatus;
  blackCount: number;
  whiteCount: number;
  isAIThinking: boolean;
}

export function useGameState() {
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [gameStatus, setGameStatus] = useState<GameStatus>({ type: 'playing' });
  const [isAIThinking, setIsAIThinking] = useState(false);

  const validMoves = calculateValidMoves(board, currentPlayer);
  const { black: blackCount, white: whiteCount } = countStones(board);

  const updateBoard = useCallback((newBoard: Board) => {
    setBoard(newBoard);
  }, []);

  const switchPlayer = useCallback(() => {
    setCurrentPlayer((prev) => (prev === 'black' ? 'white' : 'black'));
  }, []);

  const updateGameStatus = useCallback((status: GameStatus) => {
    setGameStatus(status);
  }, []);

  const setAIThinking = useCallback((thinking: boolean) => {
    setIsAIThinking(thinking);
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentPlayer('black');
    setGameStatus({ type: 'playing' });
    setIsAIThinking(false);
  }, []);

  return {
    board,
    currentPlayer,
    validMoves,
    gameStatus,
    blackCount,
    whiteCount,
    isAIThinking,
    updateBoard,
    switchPlayer,
    updateGameStatus,
    setAIThinking,
    resetGame,
  };
}
