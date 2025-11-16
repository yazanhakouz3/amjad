import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Board } from './components/Board';
import { GameUI, GameSetup } from './components/GameUI';
import { ChessGame } from './game/logic';
import type { Square, PieceType, Move } from './types';
import { findBestMove } from './game/ai';

const App: React.FC = () => {
  const [game, setGame] = useState(() => new ChessGame());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [draggedPieceSquare, setDraggedPieceSquare] = useState<Square | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null);
  const [_, setTick] = useState(0);
  const [gameMode, setGameMode] = useState<'pvp' | 'pva' | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState(2); // Default: Medium
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hintMove, setHintMove] = useState<Move | null>(null);
  const [isHintThinking, setIsHintThinking] = useState(false);
  const [threatenedSquares, setThreatenedSquares] = useState<Square[]>([]);


  const captureSound = useMemo(() => new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3'), []);
  const moveSound = useMemo(() => new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3'), []);

  const playCaptureSound = useCallback(() => {
    captureSound.currentTime = 0;
    captureSound.play().catch(error => console.error("Error playing sound:", error));
  }, [captureSound]);
  
  const playMoveSound = useCallback(() => {
    moveSound.currentTime = 0;
    moveSound.play().catch(error => console.error("Error playing sound:", error));
  }, [moveSound]);

  const forceUpdate = useCallback(() => setTick(tick => tick + 1), []);
  
  useEffect(() => {
    if (gameMode === 'pva' && game.turn === 'b' && !game.isGameOver()) {
      setIsAiThinking(true);
      setHintMove(null);
      // Use a timeout to make the "thinking" state visible and feel more natural
      setTimeout(() => {
        const bestMove = findBestMove(game, aiDifficulty);
        if (bestMove) {
          const { capturedPiece } = game.move(bestMove);
          if (capturedPiece) {
            playCaptureSound();
          } else {
            playMoveSound();
          }
          setHistory(game.getHistory());
          forceUpdate();
        }
        setIsAiThinking(false);
      }, 500);
    }
  }, [game.turn, gameMode, aiDifficulty, playCaptureSound, forceUpdate, game, playMoveSound]);


  const isInCheck = useMemo(() => game.inCheck(), [game, _]);
  const isCheckmate = useMemo(() => game.isCheckmate(), [game, _]);
  const winner = useMemo(() => isCheckmate ? (game.turn === 'w' ? 'Black' : 'White') : null, [isCheckmate, game.turn]);

  const gameStatus = useMemo(() => {
    if (isAiThinking) {
      return "AI is thinking...";
    }
    if (isCheckmate) {
      return `Checkmate! ${winner} wins.`;
    }
    if (game.isStalemate()) {
      return 'Stalemate! The game is a draw.';
    }
    if (game.isDraw()) {
      return 'Draw by insufficient material or threefold repetition.';
    }
    const turnText = game.turn === 'w' ? 'White' : 'Black';
    let statusText = `${turnText}'s turn`;
    if (isInCheck) {
      statusText += ' - Check!';
    }
    return statusText;
  }, [game, _, isInCheck, isCheckmate, winner, isAiThinking]);

  const handlePieceDragStart = (square: Square) => {
    if (hintMove) setHintMove(null);
    if (promotionMove || game.isGameOver() || isAiThinking || (gameMode === 'pva' && game.turn === 'b')) return;

    const piece = game.getPiece(square);
    if (piece && piece.color === game.turn) {
        setSelectedSquare(square);
        setValidMoves(game.getValidMoves(square));
        setDraggedPieceSquare(square);
    }
  };
  
  const handlePieceDragEnd = () => {
      setSelectedSquare(null);
      setValidMoves([]);
      setDraggedPieceSquare(null);
  };

  const handleSquareDrop = (toSquare: Square) => {
    if (!selectedSquare || !validMoves.includes(toSquare)) {
      return; // Invalid drop
    }

    const move = { from: selectedSquare, to: toSquare };
    const promotion = game.isPromotion(move);
    if (promotion) {
      setPromotionMove(move);
    } else {
      const { capturedPiece } = game.move(move);
      if (capturedPiece) {
        playCaptureSound();
      } else {
        playMoveSound();
      }
      setHistory(game.getHistory());
      forceUpdate();
    }
    // State cleanup will happen in handlePieceDragEnd, which is always called after a drop.
  };

  const handlePromotion = (piece: PieceType) => {
    if (promotionMove) {
      const { capturedPiece } = game.move({ ...promotionMove, promotion: piece });
      if (capturedPiece) {
        playCaptureSound();
      } else {
        playMoveSound();
      }
      setHistory(game.getHistory());
      setPromotionMove(null);
      setSelectedSquare(null);
      setValidMoves([]);
      setHintMove(null);
      forceUpdate();
    }
  };

  const resetGameState = () => {
    setGame(new ChessGame());
    setSelectedSquare(null);
    setValidMoves([]);
    setHistory([]);
    setPromotionMove(null);
    setHintMove(null);
    setIsHintThinking(false);
    setDraggedPieceSquare(null);
  };

  const handleStartGame = (mode: 'pvp' | 'pva', difficulty: number = 2) => {
    resetGameState();
    setGameMode(mode);
    setAiDifficulty(difficulty);
  };

  const handleNewGame = () => {
    setGameMode(null);
  };
  
  const handleUndo = () => {
    // In PvA, undo both the player's and the AI's move
    const movesToUndo = (gameMode === 'pva' && game.turn === 'w') ? 2 : 1;
    for (let i = 0; i < movesToUndo; i++) {
        game.undoMove();
    }
    setHistory(game.getHistory());
    setSelectedSquare(null);
    setValidMoves([]);
    setPromotionMove(null);
    setHintMove(null);
    forceUpdate();
  };

  const handleHint = useCallback(() => {
    if (game.isGameOver() || isHintThinking) return;
    setIsHintThinking(true);
    setTimeout(() => {
        // Use depth 2 for hints - a good balance of speed and quality.
        const bestMove = findBestMove(game, 2);
        setHintMove(bestMove);
        setIsHintThinking(false);
    }, 100);
  }, [game, isHintThinking]);
  
  const handlePieceHoverStart = useCallback((square: Square) => {
    const piece = game.getPiece(square);
    if (piece && piece.color === game.turn && !draggedPieceSquare) {
      const attacked = game.getSquaresUnderAttackByPiece(square);
      const threats = attacked.filter(s => {
          const target = game.getPiece(s);
          return target && target.color !== piece.color;
      });
      setThreatenedSquares(threats);
    }
  }, [game, draggedPieceSquare]);

  const handlePieceHoverEnd = useCallback(() => {
    setThreatenedSquares([]);
  }, []);


  const canUndo = history.length > 0;
  
  if (!gameMode) {
    return (
      <main className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center p-4">
        <GameSetup onStart={handleStartGame} />
      </main>
    );
  }

  return (
    <main className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="relative">
          <Board
            board={game.getBoard()}
            onPieceDragStart={handlePieceDragStart}
            onSquareDrop={handleSquareDrop}
            onPieceDragEnd={handlePieceDragEnd}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            inCheck={isInCheck}
            turn={game.turn}
            hintMove={hintMove}
            draggedPieceSquare={draggedPieceSquare}
            threatenedSquares={threatenedSquares}
            onPieceHoverStart={handlePieceHoverStart}
            onPieceHoverEnd={handlePieceHoverEnd}
          />
        </div>
        <GameUI
          status={gameStatus}
          history={history}
          onReset={handleNewGame}
          isPromotionPending={!!promotionMove}
          onPromote={handlePromotion}
          turn={game.turn}
          onUndo={handleUndo}
          canUndo={canUndo}
          isCheckmate={isCheckmate}
          winner={winner}
          onHint={handleHint}
          isHintThinking={isHintThinking}
          gameMode={gameMode}
        />
      </div>
    </main>
  );
};

export default App;