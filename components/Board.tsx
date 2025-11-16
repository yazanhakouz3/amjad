import React from 'react';
import type { BoardState, Square, Color, Move } from '../types';
import { PieceComponent } from './Piece';

interface BoardProps {
  board: BoardState;
  onPieceDragStart: (square: Square) => void;
  onSquareDrop: (square: Square) => void;
  onPieceDragEnd: () => void;
  selectedSquare: Square | null;
  validMoves: Square[];
  inCheck: boolean;
  turn: Color;
  hintMove: Move | null;
  draggedPieceSquare: Square | null;
  threatenedSquares: Square[];
  onPieceHoverStart: (square: Square) => void;
  onPieceHoverEnd: () => void;
}

const FILES = 'abcdefgh';
const RANKS = '8765454321'; // Reversed for rendering from top-left

export const Board: React.FC<BoardProps> = ({ 
  board, 
  onPieceDragStart, 
  onSquareDrop, 
  onPieceDragEnd, 
  selectedSquare, 
  validMoves, 
  inCheck, 
  turn, 
  hintMove, 
  draggedPieceSquare,
  threatenedSquares,
  onPieceHoverStart,
  onPieceHoverEnd
}) => {
  const renderSquares = () => {
    const squares = [];
    for (let r = 7; r >= 0; r--) {
      for (let c = 0; c < 8; c++) {
        const squareName = `${FILES[c]}${r + 1}` as Square;
        const isLight = (r + c) % 2 !== 0;
        const isSelected = selectedSquare === squareName;
        const isValidMove = validMoves.includes(squareName);
        const isThreatened = threatenedSquares.includes(squareName);

        const isHintFrom = hintMove?.from === squareName;
        const isHintTo = hintMove?.to === squareName;

        let hintClass = '';
        if (isHintFrom) hintClass = 'hint-from-square';
        if (isHintTo) hintClass = 'hint-to-square';

        const baseBg = isLight ? 'bg-stone-200' : 'bg-green-700';
        const hoverClass = isValidMove ? (isLight ? 'hover:bg-stone-300' : 'hover:bg-green-600') : '';

        squares.push(
          <div
            key={squareName}
            onDrop={() => onSquareDrop(squareName)}
            onDragOver={(e) => e.preventDefault()}
            className={`w-full h-full ${baseBg} ${hoverClass} ${hintClass} relative flex items-center justify-center transition-colors duration-150 ease-in-out`}
          >
            {isSelected && <div className="absolute inset-0 bg-yellow-500/50" />}
            {isValidMove && (
              <div className="absolute w-1/4 h-1/4 bg-slate-500/70 rounded-full valid-move-indicator" />
            )}
            {isThreatened && <div className="targeting-reticle" />}
            <span className={`absolute top-0 left-1 text-xs ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                {squareName}
            </span>
          </div>
        );
      }
    }
    return squares;
  };

  const renderPieces = () => {
    const pieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const square = `${FILES[c]}${r + 1}` as Square;
          const isKingInCheck = inCheck && piece.type === 'k' && piece.color === turn;
          pieces.push(
            <PieceComponent 
              key={square} 
              piece={piece} 
              square={square} 
              isInCheck={isKingInCheck}
              onDragStart={onPieceDragStart}
              onDragEnd={onPieceDragEnd}
              isDragged={draggedPieceSquare === square}
              onHoverStart={onPieceHoverStart}
              onHoverEnd={onPieceHoverEnd}
            />
          );
        }
      }
    }
    return pieces;
  };

  return (
    <div className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] lg:w-[700px] lg:h-[700px] relative border-4 border-amber-900 shadow-2xl shadow-black/50">
      <div className="w-full h-full grid grid-cols-8 grid-rows-8">
        {renderSquares()}
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {renderPieces()}
      </div>
    </div>
  );
};