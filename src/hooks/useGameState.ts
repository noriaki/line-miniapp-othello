import { useState, useCallback } from 'react';
import type { Board, Player, Position, GameStatus } from '@/lib/game/types';
import { createInitialBoard, countStones } from '@/lib/game/board';
import { calculateValidMoves } from '@/lib/game/game-logic';
import {
  positionToNotation,
  generateNotationString,
} from '@/lib/game/move-history';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  validMoves: Position[];
  gameStatus: GameStatus;
  blackCount: number;
  whiteCount: number;
  isAIThinking: boolean;
  consecutivePassCount: number;
  moveHistory: readonly string[];
  notationString: string;
  incrementPassCount: () => void;
  resetPassCount: () => void;
}

export function useGameState() {
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [gameStatus, setGameStatus] = useState<GameStatus>({ type: 'playing' });
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [consecutivePassCount, setConsecutivePassCount] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const validMoves = calculateValidMoves(board, currentPlayer);
  const { black: blackCount, white: whiteCount } = countStones(board);
  const notationString = generateNotationString(moveHistory);

  const updateBoard = useCallback((newBoard: Board, lastMove?: Position) => {
    setBoard(newBoard);
    if (lastMove) {
      const notation = positionToNotation(lastMove);
      setMoveHistory((prev) => [...prev, notation]);
    }
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

  const incrementPassCount = useCallback(() => {
    setConsecutivePassCount((prev) => Math.min(prev + 1, 2));
  }, []);

  const resetPassCount = useCallback(() => {
    setConsecutivePassCount(0);
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentPlayer('black');
    setGameStatus({ type: 'playing' });
    setIsAIThinking(false);
    setConsecutivePassCount(0);
    setMoveHistory([]);
  }, []);

  return {
    board,
    currentPlayer,
    validMoves,
    gameStatus,
    blackCount,
    whiteCount,
    isAIThinking,
    consecutivePassCount,
    moveHistory,
    notationString,
    updateBoard,
    switchPlayer,
    updateGameStatus,
    setAIThinking,
    incrementPassCount,
    resetPassCount,
    resetGame,
  };
}
