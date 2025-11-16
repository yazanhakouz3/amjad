import { ChessGame } from './logic';
import type { Move } from '../types';

// Piece values for board evaluation
const pieceValues = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };

/**
 * Evaluates the board from the perspective of White.
 * Positive score is good for White, negative is good for Black.
 */
function evaluateBoard(game: ChessGame): number {
  if (game.isCheckmate()) {
    // The player whose turn it is has been checkmated
    return game.turn === 'w' ? -Infinity : Infinity;
  }
  if (game.isStalemate() || game.isDraw()) {
    return 0;
  }

  let total = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.board[r][c];
      if (piece) {
        total += pieceValues[piece.type] * (piece.color === 'w' ? 1 : -1);
      }
    }
  }
  return total;
}

/**
 * Minimax algorithm with alpha-beta pruning.
 */
function minimax(
  game: ChessGame,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.getAllValidMoves();

  if (isMaximizingPlayer) { // White's turn
    let maxEval = -Infinity;
    for (const move of moves) {
      const newGame = game.clone();
      newGame.move(move);
      const evaluation = minimax(newGame, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else { // Black's turn
    let minEval = Infinity;
    for (const move of moves) {
      const newGame = game.clone();
      newGame.move(move);
      const evaluation = minimax(newGame, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
}

/**
 * Finds the best move for the current player.
 */
export function findBestMove(game: ChessGame, depth: number): Move | null {
  const moves = game.getAllValidMoves();
  if (moves.length === 0) {
    return null;
  }

  const isMaximizingPlayer = game.turn === 'w';
  let bestMove: Move | null = null;
  let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

  for (const move of moves) {
    const newGame = game.clone();
    newGame.move(move);
    // The next player is the opposite of the current one
    const boardValue = minimax(newGame, depth - 1, -Infinity, Infinity, !isMaximizingPlayer);

    if (isMaximizingPlayer) {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    } else {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
  }
  
  // Fallback to a random move if no best move is found
  if (!bestMove) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  return bestMove;
}