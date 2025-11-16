import type { Piece, Color, PieceType, Square, BoardState, Move } from '../types';

const FILES = 'abcdefgh';
const RANKS = '12345678';

export class ChessGame {
  board: BoardState;
  turn: Color = 'w';
  history: { move: Move; board: BoardState }[] = [];
  gameOver = false;
  
  constructor() {
    this.board = this.createInitialBoard();
  }

  createInitialBoard(): BoardState {
    const board: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));
    const setupPiece = (square: Square, type: PieceType, color: Color) => {
      const { row, col } = this.squareToCoords(square);
      board[row][col] = { type, color };
    };

    // Pawns
    for (let i = 0; i < 8; i++) {
      setupPiece(`${FILES[i]}2` as Square, 'p', 'w');
      setupPiece(`${FILES[i]}7` as Square, 'p', 'b');
    }
    // Rooks
    setupPiece('a1', 'r', 'w'); setupPiece('h1', 'r', 'w');
    setupPiece('a8', 'r', 'b'); setupPiece('h8', 'r', 'b');
    // Knights
    setupPiece('b1', 'n', 'w'); setupPiece('g1', 'n', 'w');
    setupPiece('b8', 'n', 'b'); setupPiece('g8', 'n', 'b');
    // Bishops
    setupPiece('c1', 'b', 'w'); setupPiece('f1', 'b', 'w');
    setupPiece('c8', 'b', 'b'); setupPiece('f8', 'b', 'b');
    // Queens
    setupPiece('d1', 'q', 'w');
    setupPiece('d8', 'q', 'b');
    // Kings
    setupPiece('e1', 'k', 'w');
    setupPiece('e8', 'k', 'b');

    return board;
  }
  
  squareToCoords(square: Square): { row: number; col: number } {
    const col = FILES.indexOf(square[0]);
    const row = RANKS.indexOf(square[1]);
    return { row, col };
  }

  coordsToSquare(row: number, col: number): Square {
    return `${FILES[col]}${RANKS[row]}` as Square;
  }

  getPiece(square: Square): Piece | null {
    const { row, col } = this.squareToCoords(square);
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row][col];
  }

  getValidMoves(square: Square): Square[] {
    const piece = this.getPiece(square);
    if (!piece || piece.color !== this.turn) return [];
    
    const allMoves = this.generateMovesForPiece(square, piece);

    // Filter out moves that leave the king in check
    return allMoves.filter(to => {
      const testGame = this.clone();
      testGame.performMove({ from: square, to });
      return !testGame.isKingInCheck(this.turn);
    });
  }

  private generateMovesForPiece(square: Square, piece: Piece): Square[] {
    const { row, col } = this.squareToCoords(square);
    const moves: Square[] = [];
    
    const addMove = (r: number, c: number) => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetPiece = this.board[r][c];
        if (!targetPiece) {
          moves.push(this.coordsToSquare(r, c));
          return true; // continue sliding
        }
        if (targetPiece.color !== piece.color) {
          moves.push(this.coordsToSquare(r, c));
        }
      }
      return false; // stop sliding
    }

    const addSlidingMoves = (directions: number[][]) => {
      for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while(addMove(r, c)) {
          r += dr;
          c += dc;
        }
      }
    }

    switch (piece.type) {
      case 'p':
        const dir = piece.color === 'w' ? 1 : -1;
        const startRow = piece.color === 'w' ? 1 : 6;
        // Forward 1
        if (row + dir >= 0 && row + dir < 8 && !this.board[row+dir][col]) {
            moves.push(this.coordsToSquare(row+dir, col));
            // Forward 2 from start
            if(row === startRow && !this.board[row+2*dir][col]) {
                moves.push(this.coordsToSquare(row+2*dir, col));
            }
        }
        // Captures
        for(const captureDir of [-1, 1]) {
            const r = row + dir;
            const c = col + captureDir;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const target = this.board[r][c];
                if(target && target.color !== piece.color) {
                    moves.push(this.coordsToSquare(r, c));
                }
            }
        }
        break;
      case 'n':
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        for(const [dr, dc] of knightMoves) {
            addMove(row + dr, col + dc);
        }
        break;
      case 'b':
        addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
        break;
      case 'r':
        addSlidingMoves([[-1, 0], [1, 0], [0, -1], [0, 1]]);
        break;
      case 'q':
        addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
        break;
      case 'k':
        const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        for(const [dr, dc] of kingMoves) {
            addMove(row + dr, col + dc);
        }
        break;
    }
    return moves;
  }
  
  isKingInCheck(color: Color): boolean {
    const kingSquare = this.findKing(color);
    if (!kingSquare) return true; // Should not happen
    const opponentColor = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(kingSquare, opponentColor);
  }

  private findKing(color: Color): Square | null {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.type === 'k' && piece.color === color) {
          return this.coordsToSquare(r, c);
        }
      }
    }
    return null;
  }

  private isSquareAttacked(square: Square, attackerColor: Color): boolean {
      const attackedSquares = this.getAllSquaresUnderAttackByColor(attackerColor);
      return attackedSquares.includes(square);
  }

  private getAllSquaresUnderAttackByColor(attackerColor: Color): Square[] {
    let allAttacked: Square[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === attackerColor) {
          const attackedByPiece = this.getSquaresUnderAttackByPiece(this.coordsToSquare(r,c));
          allAttacked = allAttacked.concat(attackedByPiece);
        }
      }
    }
    return Array.from(new Set(allAttacked));
  }

  public getSquaresUnderAttackByPiece(square: Square): Square[] {
    const piece = this.getPiece(square);
    if (!piece) return [];
    
    const { row, col } = this.squareToCoords(square);
    const squares: Square[] = [];
    
    const addSquareAndContinue = (r: number, c: number): boolean => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        squares.push(this.coordsToSquare(r, c));
        // Sliding pieces are blocked by any piece.
        return this.board[r][c] === null;
      }
      return false; // Off board
    };

    const addSlidingMoves = (directions: number[][]) => {
      for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while(addSquareAndContinue(r, c)) {
          r += dr;
          c += dc;
        }
      }
    };

    switch (piece.type) {
      case 'p':
        const dir = piece.color === 'w' ? 1 : -1;
        for(const captureDir of [-1, 1]) {
            const r = row + dir;
            const c = col + captureDir;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                squares.push(this.coordsToSquare(r, c));
            }
        }
        break;
      case 'n':
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        for(const [dr, dc] of knightMoves) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                squares.push(this.coordsToSquare(r, c));
            }
        }
        break;
      case 'b':
        addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
        break;
      case 'r':
        addSlidingMoves([[-1, 0], [1, 0], [0, -1], [0, 1]]);
        break;
      case 'q':
        addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
        break;
      case 'k':
        const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        for(const [dr, dc] of kingMoves) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                squares.push(this.coordsToSquare(r, c));
            }
        }
        break;
    }
    return squares;
  }
  
  move(move: Move): { capturedPiece: Piece | null } {
    if (this.gameOver) return { capturedPiece: null };
    // For performance, AI clones don't need history. The main game instance does.
    if (!this.history) this.history = [];
    this.history.push({ move, board: this.board.map(row => row.slice()) });
    const capturedPiece = this.performMove(move);
    this.turn = this.turn === 'w' ? 'b' : 'w';
    
    if (this.isCheckmate() || this.isStalemate() || this.isDraw()) {
      this.gameOver = true;
    }
    return { capturedPiece };
  }
  
  undoMove(): boolean {
    if (this.history.length === 0) {
      return false;
    }

    const lastState = this.history.pop();
    if (lastState) {
        this.board = lastState.board;
        this.turn = this.turn === 'w' ? 'b' : 'w';
        this.gameOver = false;
        return true;
    }
    return false;
  }

  private performMove(move: Move): Piece | null {
    const { from, to, promotion } = move;
    const { row: fromRow, col: fromCol } = this.squareToCoords(from);
    const { row: toRow, col: toCol } = this.squareToCoords(to);

    const piece = this.board[fromRow][fromCol];
    if (!piece) return null;

    const capturedPiece = this.board[toRow][toCol];

    if (promotion) {
      this.board[toRow][toCol] = { type: promotion, color: piece.color };
    } else {
      this.board[toRow][toCol] = piece;
    }
    this.board[fromRow][fromCol] = null;
    return capturedPiece;
  }

  isPromotion(move: Move): boolean {
    const piece = this.getPiece(move.from);
    if (!piece || piece.type !== 'p') return false;
    const promotionRank = piece.color === 'w' ? '8' : '1';
    return move.to[1] === promotionRank;
  }

  private hasLegalMoves(): boolean {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const square = this.coordsToSquare(r, c);
        const piece = this.getPiece(square);
        if (piece && piece.color === this.turn) {
          if (this.getValidMoves(square).length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  inCheck(): boolean {
    return this.isKingInCheck(this.turn);
  }
  
  isCheckmate(): boolean {
    return this.inCheck() && !this.hasLegalMoves();
  }

  isStalemate(): boolean {
    return !this.inCheck() && !this.hasLegalMoves();
  }
  
  isDraw(): boolean {
    // Basic draw condition for now
    return this.isStalemate();
  }
  
  isGameOver(): boolean {
      return this.gameOver;
  }

  getBoard(): BoardState {
    return this.board;
  }

  getHistory(): string[] {
    return this.history.map(({move}) => `${move.from}${move.to}`);
  }

  getAllValidMoves(): Move[] {
    const moves: Move[] = [];
    if (this.isGameOver()) {
        return moves;
    }
    const color = this.turn;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const square = this.coordsToSquare(r, c);
        const piece = this.getPiece(square);
        if (piece && piece.color === color) {
          const validMoves = this.getValidMoves(square);
          for (const to of validMoves) {
            moves.push({ from: square, to });
          }
        }
      }
    }
    return moves;
  }

  clone(): ChessGame {
    const newGame = new ChessGame();
    newGame.board = this.board.map(row => row.slice());
    newGame.turn = this.turn;
    newGame.gameOver = this.gameOver;
    newGame.history = []; // Clones used for AI simulation don't need history
    return newGame;
  }
}