'use client';

import React, { useCallback, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAIPlayer } from '@/hooks/useAIPlayer';
import { applyMove, validateMove } from '@/lib/game/game-logic';
import { checkGameEnd } from '@/lib/game/game-end';
import type { Position } from '@/lib/game/types';
import './GameBoard.css';

export interface GameBoardProps {
  initialSettings?: Record<string, unknown>; // Future settings can be added here
}

/**
 * GameBoard Client Component
 * Manages the entire game UI and user interaction
 */
export default function GameBoard(): JSX.Element {
  const {
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
  } = useGameState();

  const { calculateMove } = useAIPlayer();

  // Check if position is a valid move
  const isValidMove = useCallback(
    (position: Position): boolean => {
      return validMoves.some(
        (move) => move.row === position.row && move.col === position.col
      );
    },
    [validMoves]
  );

  // Handle cell click
  const handleCellClick = useCallback(
    async (position: Position) => {
      if (gameStatus.type !== 'playing' || isAIThinking) return;
      if (currentPlayer !== 'black') return; // Only allow user moves

      const moveResult = validateMove(board, position, currentPlayer);
      if (!moveResult.success) {
        // Show error feedback (visual indication handled by CSS)
        return;
      }

      const applyResult = applyMove(board, position, currentPlayer);
      if (!applyResult.success) return;

      updateBoard(applyResult.value);

      // Check game end
      const aiValidMoves = validMoves;
      const userValidMoves = validMoves;
      const endResult = checkGameEnd(
        applyResult.value,
        userValidMoves,
        aiValidMoves
      );

      if (endResult.ended) {
        updateGameStatus({
          type: 'finished',
          winner: endResult.winner,
        });
        return;
      }

      // Switch to AI turn
      switchPlayer();
    },
    [
      board,
      currentPlayer,
      gameStatus,
      isAIThinking,
      validMoves,
      updateBoard,
      switchPlayer,
      updateGameStatus,
    ]
  );

  // AI turn handling
  useEffect(() => {
    if (
      gameStatus.type !== 'playing' ||
      currentPlayer !== 'white' ||
      isAIThinking
    ) {
      return;
    }

    setAIThinking(true);

    calculateMove(board, currentPlayer)
      .then((move) => {
        const applyResult = applyMove(board, move, currentPlayer);
        if (applyResult.success) {
          updateBoard(applyResult.value);

          // Check game end
          const endResult = checkGameEnd(applyResult.value, [], []);
          if (endResult.ended) {
            updateGameStatus({
              type: 'finished',
              winner: endResult.winner,
            });
          } else {
            switchPlayer();
          }
        }
      })
      .catch((error) => {
        console.error('AI calculation failed:', error);
        // Fallback: skip AI turn
        switchPlayer();
      })
      .finally(() => {
        setAIThinking(false);
      });
  }, [
    currentPlayer,
    gameStatus,
    board,
    isAIThinking,
    calculateMove,
    updateBoard,
    switchPlayer,
    updateGameStatus,
    setAIThinking,
  ]);

  return (
    <div data-testid="game-board" className="game-board">
      {/* Game Status Display */}
      <div className="game-status">
        <div className="turn-indicator">
          {gameStatus.type === 'playing' && (
            <p className="text-lg font-bold">
              {currentPlayer === 'black' ? '黒のターン' : '白のターン (AI)'}
              {isAIThinking && ' (思考中...)'}
            </p>
          )}
          {gameStatus.type === 'finished' && (
            <p className="text-xl font-bold">
              ゲーム終了！
              {gameStatus.winner === 'draw'
                ? '引き分け'
                : gameStatus.winner === 'black'
                  ? '黒の勝利!'
                  : '白の勝利!'}
            </p>
          )}
        </div>

        {/* Stone Count */}
        <div className="stone-count flex gap-4 mt-2">
          <span>黒: {blackCount}</span>
          <span>白: {whiteCount}</span>
        </div>
      </div>

      {/* Board Grid */}
      <div className="board-grid">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const position: Position = { row: rowIndex, col: colIndex };
            const isValid = isValidMove(position);

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`board-cell ${isValid ? 'valid-move' : ''}`}
                onClick={() => handleCellClick(position)}
                disabled={
                  gameStatus.type !== 'playing' || currentPlayer !== 'black'
                }
                data-stone={cell || undefined}
              >
                {cell === 'black' && <div className="stone stone-black" />}
                {cell === 'white' && <div className="stone stone-white" />}
                {cell === null && isValid && <div className="valid-hint" />}
              </button>
            );
          })
        )}
      </div>

      {/* Game Over Screen */}
      {gameStatus.type === 'finished' && (
        <div className="game-result mt-4">
          <button
            onClick={resetGame}
            className="reset-button px-6 py-2 bg-line-green text-white rounded"
          >
            新しいゲームを開始
          </button>
        </div>
      )}
    </div>
  );
}
