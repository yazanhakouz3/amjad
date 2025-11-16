import React, { useEffect, useState } from 'react';
import type { Piece, Square } from '../types';

interface PieceProps {
  piece: Piece;
  square: Square;
  isInCheck?: boolean;
  onDragStart: (square: Square) => void;
  onDragEnd: () => void;
  isDragged: boolean;
  onHoverStart: (square: Square) => void;
  onHoverEnd: () => void;
}

const FILES = 'abcdefgh';

const squareToCoords = (square: Square) => {
  const file = square[0];
  const rank = parseInt(square[1], 10);
  const x = FILES.indexOf(file);
  const y = 8 - rank;
  return { x, y };
};

export const King: React.FC<{ piece: Piece; isInCheck?: boolean }> = ({ piece, isInCheck }) => {
    const strokeClass = 'stroke-gray-900';
    const fillClass = piece.color === 'w' ? 'fill-gray-200' : 'fill-gray-700';
    return (
        <svg viewBox="0 0 45 45" className={`w-full h-full ${isInCheck ? 'king-in-check' : ''}`}>
            <g fill="none" fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
                <path d="M22.5 11.63V6M20 8h5" />
                <path d="M22.5 25s4.5-7.5 3-10.5c0-4-3-4-3-4s-3 0-3 4c-1.5 3 3 10.5 3 10.5" className={fillClass} />
                <path d="M12.5 37c5.5-8 14.5-8 20 0h-20z" />
                <path d="M12.5 30c5.5-8 14.5-8 20 0" />
                <path d="M12.5 30h20" />
                <path d="M12.5 37v-7h20v7z" className={fillClass} />
            </g>
        </svg>
    );
}

export const Queen: React.FC<{ piece: Piece }> = ({ piece }) => {
    const strokeClass = 'stroke-gray-900';
    const fillClass = piece.color === 'w' ? 'fill-gray-200' : 'fill-gray-700';
    return (
        <svg viewBox="0 0 45 45" className={`w-full h-full`}>
            <g fill="none" fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
                <path d="M13 13.5s1 4.5 9.5 4.5 9.5-4.5 9.5-4.5L35 8l-5 3-7.5-4-7.5 4-5-3 3 5.5z" className={fillClass} />
                <path d="M13 13.5C13 18 22.5 27 22.5 27S32 18 32 13.5" className={fillClass} />
                <path d="M12 37.5s4-8 10.5-8 10.5 8 10.5 8h-21z" />
                <path d="M12 30.5c5-8 16-8 21 0" />
                <path d="M12 37.5v-7h21v7z" className={fillClass} />
                <path d="M12 30.5h21" />
            </g>
        </svg>
    );
}

export const Bishop: React.FC<{ piece: Piece }> = ({ piece }) => {
    const strokeClass = 'stroke-gray-900';
    const fillClass = piece.color === 'w' ? 'fill-gray-200' : 'fill-gray-700';
    return (
        <svg viewBox="0 0 45 45" className={`w-full h-full`}>
            <g fill="none" fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
                <path d="M9 36h27v-2H9v2z" className={fillClass} />
                <path d="M15 34h15v-2.5c0-2-2.5-4-7.5-4s-7.5 2-7.5 4V34z" />
                <path d="M22.5 27.5C17.5 25 15 20 15 17.5 15 13.36 18.36 10 22.5 10s7.5 3.36 7.5 7.5c0 2.5-2.5 7.5-7.5 10z" className={fillClass}/>
                <path d="M22.5 27.5C17.5 25 15 20 15 17.5 15 13.36 18.36 10 22.5 10s7.5 3.36 7.5 7.5c0 2.5-2.5 7.5-7.5 10z" />
                <path d="M24.5 12.5l-4 4" strokeLinecap="butt" />
            </g>
        </svg>
    );
}

export const Knight: React.FC<{ piece: Piece }> = ({ piece }) => {
    const strokeClass = 'stroke-gray-900';
    const fillClass = piece.color === 'w' ? 'fill-gray-200' : 'fill-gray-700';
    return (
        <svg viewBox="0 0 45 45" className={`w-full h-full`}>
            <g fill="none" fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
                <path d="M12 38 h21 v-3 h-21 z" className={fillClass} />
                <path d="M15.5 35 C 15.5 30 18 29.5 20 29 C 22 28.5 25.5 29.5 25.5 29.5 C 22.5 26 22 20 25.5 17" />
                <path d="M25.5 17 C 29 14 31 14 31 11 C 31 8 28 7 26 9 C 24 11 25.5 14 25.5 17" className={fillClass} />
                <path d="M25.5 17 C 26.5 18 28.5 18 30.5 17" />
                <path d="M23 11 L 24.5 9 M26 9 L 27.5 7" />
            </g>
        </svg>
    );
}

export const Rook: React.FC<{ piece: Piece }> = ({ piece }) => {
    const strokeClass = 'stroke-gray-900';
    const fillClass = piece.color === 'w' ? 'fill-gray-200' : 'fill-gray-700';
    return (
        <svg viewBox="0 0 45 45" className={`w-full h-full`}>
            <g fill="none" fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
                <path d="M9 39h27v-3H9v3z" className={fillClass} />
                <path d="M12.5 36v-22h20v22" className={fillClass} />
                <path d="M12.5 36v-22h20v22" />
                <path d="M12.5 14l-3-3h26l-3 3" />
                <path d="M12.5 14h20" />
                <path d="M12.5 11h20" />
            </g>
        </svg>
    );
}

export const Pawn: React.FC<{ piece: Piece }> = ({ piece }) => {
    const strokeClass = 'stroke-gray-900';
    const fillClass = piece.color === 'w' ? 'fill-gray-200' : 'fill-gray-700';
    return (
        <svg viewBox="0 0 45 45" className={`w-full h-full`}>
            <g fill="none" fillRule="evenodd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
                <path d="M22.5 12c2 0 4 2 4 4 0 2-4 6-4 6s-4-4-4-6c0-2 2-4 4-4z" className={fillClass} />
                <path d="M15.5 38.5h14v-3h-14v3z" className={fillClass} />
                <path d="M15.5 35.5c0-4.5 3-8 7-8s7 3.5 7 8" />
                <path d="M15.5 35.5h14" />
            </g>
        </svg>
    );
}


const pieceMap: Record<Piece['type'], React.FC<{ piece: Piece; isInCheck?: boolean }>> = {
  k: King,
  q: Queen,
  b: Bishop,
  n: Knight,
  r: Rook,
  p: Pawn,
};

export const PieceComponent: React.FC<PieceProps> = ({ piece, square, isInCheck, onDragStart, onDragEnd, isDragged, onHoverStart, onHoverEnd }) => {
  const [position, setPosition] = useState(squareToCoords(square));

  useEffect(() => {
    setPosition(squareToCoords(square));
  }, [square]);

  const PieceIcon = pieceMap[piece.type];
  
  const style: React.CSSProperties = {
    transform: `translate(${position.x * 100}%, ${position.y * 100}%)`,
    transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
    pointerEvents: 'auto',
    cursor: 'grab',
  };

  return (
    <div
      className={`absolute w-[12.5%] h-[12.5%] p-1 ${isDragged ? 'opacity-0' : ''} drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]`}
      style={style}
      draggable={true}
      onDragStart={() => onDragStart(square)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => onHoverStart(square)}
      onMouseLeave={onHoverEnd}
    >
      <PieceIcon piece={piece} isInCheck={isInCheck} />
    </div>
  );
};