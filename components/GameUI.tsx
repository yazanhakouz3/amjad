import React, { useState } from 'react';
import type { Piece, PieceType, Color } from '../types';
import { Queen, Rook, Bishop, Knight } from './Piece';

interface GameUIProps {
  status: string;
  history: string[];
  onReset: () => void;
  isPromotionPending: boolean;
  onPromote: (piece: PieceType) => void;
  turn: Color;
  onUndo: () => void;
  canUndo: boolean;
  isCheckmate: boolean;
  winner: 'White' | 'Black' | null;
  onHint: () => void;
  isHintThinking: boolean;
  gameMode: 'pvp' | 'pva' | null;
}

// FIX: Correctly type pieceIconMap to only include promotable pieces, which resolves the TypeScript error.
const pieceIconMap: Record<Exclude<PieceType, 'p' | 'k'>, React.FC<{piece: Piece}>> = {
  q: Queen,
  r: Rook,
  b: Bishop,
  n: Knight,
};

const PromotionDialog: React.FC<{ onPromote: (piece: PieceType) => void, turn: Color }> = ({ onPromote, turn }) => {
  // FIX: Use a more specific type for promotion pieces to align with pieceIconMap.
  const promotionPieces: Exclude<PieceType, 'p' | 'k'>[] = ['q', 'r', 'b', 'n'];

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 fade-in-dialog">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-600">
        <h3 className="text-xl font-bold text-center mb-4 text-gray-200">Promote Pawn</h3>
        <div className="flex gap-4">
          {promotionPieces.map(pieceType => {
            const PieceIcon = pieceIconMap[pieceType];
            const piece: Piece = { type: pieceType, color: turn };
            return (
              <button
                key={pieceType}
                onClick={() => onPromote(pieceType)}
                className="w-16 h-16 p-2 bg-gray-700 hover:bg-blue-600 rounded-md transition-colors duration-200"
              >
                <PieceIcon piece={piece} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface CheckmateDialogProps {
  winner: 'White' | 'Black';
  onPlayAgain: () => void;
}

const CheckmateDialog: React.FC<CheckmateDialogProps> = ({ winner, onPlayAgain }) => {
  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 fade-in-dialog">
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl border-2 border-yellow-500">
        <h2 className="text-6xl font-bold text-yellow-400 mb-2">Checkmate!</h2>
        <p className="text-2xl text-gray-200 mb-6">{winner} wins!</p>
        <button
          onClick={onPlayAgain}
          className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-md text-white font-bold text-xl transition-colors duration-200 tracking-wider"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

interface GameSetupProps {
  onStart: (mode: 'pvp' | 'pva', difficulty?: number) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showInstallTip, setShowInstallTip] = useState(
    () => !localStorage.getItem('chessInstallTipDismissed')
  );

  const handleDismissTip = () => {
    localStorage.setItem('chessInstallTipDismissed', 'true');
    setShowInstallTip(false);
  };

  if (showDifficulty) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl border-2 border-blue-500 fade-in-dialog">
        <h2 className="text-4xl font-bold text-blue-300 mb-6">Select Difficulty</h2>
        <div className="flex flex-col gap-4">
          <button onClick={() => onStart('pva', 1)} className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-md text-white font-bold text-xl transition-colors duration-200">Easy</button>
          <button onClick={() => onStart('pva', 2)} className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-md text-white font-bold text-xl transition-colors duration-200">Medium</button>
          <button onClick={() => onStart('pva', 3)} className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-md text-white font-bold text-xl transition-colors duration-200">Hard</button>
        </div>
        <button onClick={() => setShowDifficulty(false)} className="mt-6 text-gray-400 hover:text-white transition-colors">Back</button>
      </div>
    );
  }

  return (
    <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl border-2 border-blue-500 fade-in-dialog">
      <h1 className="text-5xl font-bold text-gray-100 mb-8">Classic Chess</h1>
      <h2 className="text-3xl font-bold text-blue-300 mb-6">Choose Your Opponent</h2>
      <div className="flex flex-col gap-4 w-64 mx-auto">
        <button onClick={() => setShowDifficulty(true)} className="px-8 py-3 bg-blue-700 hover:bg-blue-600 rounded-md text-white font-bold text-xl transition-colors duration-200">Play vs AI</button>
        <button onClick={() => onStart('pvp')} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-bold text-xl transition-colors duration-200">Play vs Friend</button>
      </div>
      {showInstallTip && (
        <div className="mt-8 p-3 bg-gray-900/50 border border-gray-700 rounded-lg relative">
          <p className="text-sm text-gray-400 pr-6">
            Tip: You can install this game to your device for offline play! Look for the install icon in your browser's address bar.
          </p>
          <button onClick={handleDismissTip} className="absolute top-1 right-1 text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};


export const GameUI: React.FC<GameUIProps> = ({ status, history, onReset, isPromotionPending, onPromote, turn, onUndo, canUndo, isCheckmate, winner, onHint, isHintThinking, gameMode }) => {
  return (
    <div className="relative w-full max-w-sm lg:w-80 p-6 bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex flex-col gap-4">
      {isPromotionPending && <PromotionDialog onPromote={onPromote} turn={turn} />}
      {isCheckmate && winner && <CheckmateDialog winner={winner} onPlayAgain={onReset} />}
      
      <h1 className="text-5xl font-bold text-center text-gray-100">Classic Chess</h1>
      <div className="text-center p-3 bg-gray-900 rounded-md h-12 flex items-center justify-center">
        <p className="text-lg font-bold text-blue-300">{status}</p>
      </div>
      
      <div className="flex-grow bg-gray-900/70 p-2 rounded-md h-48 overflow-y-auto">
        <h3 className="font-bold text-gray-300 mb-2">Move History</h3>
        <ol className="list-decimal list-inside text-gray-300 columns-2 gap-4">
            {history.map((move, index) => (
                <li key={index}>{move}</li>
            ))}
        </ol>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
            <button
              onClick={onReset}
              className="w-full py-3 bg-blue-700 hover:bg-blue-600 rounded-md text-white font-bold text-lg transition-colors duration-200 tracking-wider"
            >
              New Game
            </button>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-bold text-lg transition-colors duration-200 tracking-wider disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Undo
            </button>
        </div>
        <button
            onClick={onHint}
            disabled={isHintThinking || isCheckmate || (gameMode === 'pva' && turn === 'b')}
            className="w-full py-3 bg-green-700 hover:bg-green-600 rounded-md text-white font-bold text-lg transition-colors duration-200 tracking-wider disabled:bg-green-900 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
            {isHintThinking ? 'Thinking...' : 'Hint'}
        </button>
      </div>
    </div>
  );
};