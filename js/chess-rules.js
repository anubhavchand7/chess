// Comprehensive Offline Chess Rules Engine
// Supports standard FIDE chess rules: legal move generation, castling, en passant,
// pawn promotion, check/checkmate/stalemate, 50-move rule, threefold repetition, FEN & PGN.

class ChessEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = this.createInitialBoard();
    this.turn = 'w'; // 'w' or 'b'
    this.castling = {
      w: { k: true, q: true },
      b: { k: true, q: true }
    };
    this.enPassant = null; // { row, col } or null
    this.halfMoves = 0; // for 50-move rule
    this.fullMoves = 1;
    this.history = []; // stack of completed moves
    this.future = []; // for redo if navigating
    this.positionCounts = {}; // for 3-fold repetition
    this.recordPosition();
  }

  createInitialBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Place Black major pieces (row 0)
    const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    for (let c = 0; c < 8; c++) {
      board[0][c] = { type: backRank[c], color: 'b' };
      board[1][c] = { type: 'p', color: 'b' };
      board[6][c] = { type: 'p', color: 'w' };
      board[7][c] = { type: backRank[c], color: 'w' };
    }
    return board;
  }

  cloneBoard(board = this.board) {
    return board.map(row => row.map(cell => cell ? { ...cell } : null));
  }

  getPiece(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row][col];
  }

  getPieceCode(piece) {
    if (!piece) return null;
    return piece.color + piece.type.toUpperCase();
  }

  isSquareOnBoard(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  // Generate key for 3-fold repetition
  getPositionKey() {
    let key = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        key += p ? p.color + p.type : '.';
      }
    }
    key += '|' + this.turn;
    key += '|' + (this.castling.w.k ? 'K' : '') + (this.castling.w.q ? 'Q' : '') +
                 (this.castling.b.k ? 'k' : '') + (this.castling.b.q ? 'q' : '');
    key += '|' + (this.enPassant ? `${this.enPassant.row},${this.enPassant.col}` : '-');
    return key;
  }

  recordPosition() {
    const key = this.getPositionKey();
    this.positionCounts[key] = (this.positionCounts[key] || 0) + 1;
  }

  unrecordPosition() {
    const key = this.getPositionKey();
    if (this.positionCounts[key]) {
      this.positionCounts[key]--;
      if (this.positionCounts[key] <= 0) {
        delete this.positionCounts[key];
      }
    }
  }

  findKing(color, board = this.board) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === color) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  isSquareAttacked(row, col, attackerColor, board = this.board) {
    // 1. Pawn attacks
    const pawnRowOffset = attackerColor === 'w' ? 1 : -1;
    const pawnAttackerRow = row + pawnRowOffset;
    if (pawnAttackerRow >= 0 && pawnAttackerRow < 8) {
      for (const cOffset of [-1, 1]) {
        const pawnAttackerCol = col + cOffset;
        if (pawnAttackerCol >= 0 && pawnAttackerCol < 8) {
          const piece = board[pawnAttackerRow][pawnAttackerCol];
          if (piece && piece.color === attackerColor && piece.type === 'p') {
            return true;
          }
        }
      }
    }

    // 2. Knight attacks
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightOffsets) {
      const r = row + dr;
      const c = col + dc;
      if (this.isSquareOnBoard(r, c)) {
        const piece = board[r][c];
        if (piece && piece.color === attackerColor && piece.type === 'n') {
          return true;
        }
      }
    }

    // 3. Bishop/Queen diagonal rays
    const diagDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirections) {
      let r = row + dr;
      let c = col + dc;
      while (this.isSquareOnBoard(r, c)) {
        const piece = board[r][c];
        if (piece) {
          if (piece.color === attackerColor && (piece.type === 'b' || piece.type === 'q')) {
            return true;
          }
          break;
        }
        r += dr;
        c += dc;
      }
    }

    // 4. Rook/Queen orthogonal rays
    const orthoDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of orthoDirections) {
      let r = row + dr;
      let c = col + dc;
      while (this.isSquareOnBoard(r, c)) {
        const piece = board[r][c];
        if (piece) {
          if (piece.color === attackerColor && (piece.type === 'r' || piece.type === 'q')) {
            return true;
          }
          break;
        }
        r += dr;
        c += dc;
      }
    }

    // 5. King adjacent
    const kingDirections = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    for (const [dr, dc] of kingDirections) {
      const r = row + dr;
      const c = col + dc;
      if (this.isSquareOnBoard(r, c)) {
        const piece = board[r][c];
        if (piece && piece.color === attackerColor && piece.type === 'k') {
          return true;
        }
      }
    }

    return false;
  }

  isInCheck(color = this.turn, board = this.board) {
    const kingPos = this.findKing(color, board);
    if (!kingPos) return false;
    const opponent = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(kingPos.row, kingPos.col, opponent, board);
  }

  // Generate pseudo-legal moves for a specific piece
  getPseudoMoves(row, col, board = this.board) {
    const piece = board[row][col];
    if (!piece) return [];
    const moves = [];
    const color = piece.color;
    const opponent = color === 'w' ? 'b' : 'w';

    if (piece.type === 'p') {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      const promoRow = color === 'w' ? 0 : 7;

      // Single step forward
      const fwdRow = row + dir;
      if (this.isSquareOnBoard(fwdRow, col) && !board[fwdRow][col]) {
        if (fwdRow === promoRow) {
          ['q', 'r', 'b', 'n'].forEach(promo => {
            moves.push({ from: { row, col }, to: { row: fwdRow, col }, promotion: promo });
          });
        } else {
          moves.push({ from: { row, col }, to: { row: fwdRow, col } });

          // Double step forward from starting rank
          const doubleRow = row + 2 * dir;
          if (row === startRow && !board[doubleRow][col]) {
            moves.push({ from: { row, col }, to: { row: doubleRow, col }, isDoublePawn: true });
          }
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const capRow = row + dir;
        const capCol = col + dc;
        if (this.isSquareOnBoard(capRow, capCol)) {
          const target = board[capRow][capCol];
          if (target && target.color === opponent) {
            if (capRow === promoRow) {
              ['q', 'r', 'b', 'n'].forEach(promo => {
                moves.push({ from: { row, col }, to: { row: capRow, col: capCol }, promotion: promo });
              });
            } else {
              moves.push({ from: { row, col }, to: { row: capRow, col: capCol } });
            }
          } else if (
            this.enPassant &&
            this.enPassant.row === capRow &&
            this.enPassant.col === capCol
          ) {
            // En Passant capture
            moves.push({ from: { row, col }, to: { row: capRow, col: capCol }, isEnPassant: true });
          }
        }
      }
    } else if (piece.type === 'n') {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightOffsets) {
        const r = row + dr;
        const c = col + dc;
        if (this.isSquareOnBoard(r, c)) {
          const target = board[r][c];
          if (!target || target.color === opponent) {
            moves.push({ from: { row, col }, to: { row: r, col: c } });
          }
        }
      }
    } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
      const directions = [];
      if (piece.type === 'b' || piece.type === 'q') {
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      }
      if (piece.type === 'r' || piece.type === 'q') {
        directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      }

      for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while (this.isSquareOnBoard(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ from: { row, col }, to: { row: r, col: c } });
          } else {
            if (target.color === opponent) {
              moves.push({ from: { row, col }, to: { row: r, col: c } });
            }
            break;
          }
          r += dr;
          c += dc;
        }
      }
    } else if (piece.type === 'k') {
      const kingDirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      for (const [dr, dc] of kingDirs) {
        const r = row + dr;
        const c = col + dc;
        if (this.isSquareOnBoard(r, c)) {
          const target = board[r][c];
          if (!target || target.color === opponent) {
            moves.push({ from: { row, col }, to: { row: r, col: c } });
          }
        }
      }

      // Castling
      const kingHomeRow = color === 'w' ? 7 : 0;
      if (row === kingHomeRow && col === 4) {
        // King must not currently be in check
        if (!this.isInCheck(color, board)) {
          // Kingside castling
          if (this.castling[color].k) {
            if (
              !board[kingHomeRow][5] &&
              !board[kingHomeRow][6] &&
              board[kingHomeRow][7] &&
              board[kingHomeRow][7].type === 'r' &&
              board[kingHomeRow][7].color === color
            ) {
              if (
                !this.isSquareAttacked(kingHomeRow, 5, opponent, board) &&
                !this.isSquareAttacked(kingHomeRow, 6, opponent, board)
              ) {
                moves.push({
                  from: { row, col },
                  to: { row: kingHomeRow, col: 6 },
                  isCastling: 'k'
                });
              }
            }
          }

          // Queenside castling
          if (this.castling[color].q) {
            if (
              !board[kingHomeRow][3] &&
              !board[kingHomeRow][2] &&
              !board[kingHomeRow][1] &&
              board[kingHomeRow][0] &&
              board[kingHomeRow][0].type === 'r' &&
              board[kingHomeRow][0].color === color
            ) {
              if (
                !this.isSquareAttacked(kingHomeRow, 3, opponent, board) &&
                !this.isSquareAttacked(kingHomeRow, 2, opponent, board)
              ) {
                moves.push({
                  from: { row, col },
                  to: { row: kingHomeRow, col: 2 },
                  isCastling: 'q'
                });
              }
            }
          }
        }
      }
    }

    return moves;
  }

  // Test if a move leaves the king in check
  isMoveLegal(move, color = this.turn) {
    const testBoard = this.cloneBoard();
    const { from, to, promotion, isEnPassant, isCastling } = move;
    const movingPiece = testBoard[from.row][from.col];
    if (!movingPiece || movingPiece.color !== color) return false;

    // Apply move to testBoard
    testBoard[to.row][to.col] = movingPiece;
    testBoard[from.row][from.col] = null;

    if (promotion) {
      testBoard[to.row][to.col] = { type: promotion, color };
    }

    if (isEnPassant) {
      const capRow = color === 'w' ? to.row + 1 : to.row - 1;
      testBoard[capRow][to.col] = null;
    }

    if (isCastling === 'k') {
      const r = from.row;
      testBoard[r][5] = testBoard[r][7];
      testBoard[r][7] = null;
    } else if (isCastling === 'q') {
      const r = from.row;
      testBoard[r][3] = testBoard[r][0];
      testBoard[r][0] = null;
    }

    return !this.isInCheck(color, testBoard);
  }

  // Get all legal moves for a specific square
  getLegalMovesForSquare(row, col) {
    const piece = this.board[row][col];
    if (!piece || piece.color !== this.turn) return [];
    const pseudo = this.getPseudoMoves(row, col);
    return pseudo.filter(m => this.isMoveLegal(m, this.turn));
  }

  // Get all legal moves for current player
  getAllLegalMoves(color = this.turn) {
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === color) {
          const pseudo = this.getPseudoMoves(r, c);
          for (const m of pseudo) {
            if (this.isMoveLegal(m, color)) {
              allMoves.push(m);
            }
          }
        }
      }
    }
    return allMoves;
  }

  // Format move in Standard Algebraic Notation (SAN)
  moveToSAN(move) {
    const { from, to, promotion, isCastling, isEnPassant } = move;
    const piece = this.board[from.row][from.col];
    if (!piece) return '';

    if (isCastling === 'k') return 'O-O';
    if (isCastling === 'q') return 'O-O-O';

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    let san = '';
    const isCapture = this.board[to.row][to.col] !== null || isEnPassant;

    if (piece.type === 'p') {
      if (isCapture) {
        san += files[from.col] + 'x' + files[to.col] + ranks[to.row];
      } else {
        san += files[to.col] + ranks[to.row];
      }
      if (promotion) {
        san += '=' + promotion.toUpperCase();
      }
    } else {
      san += piece.type.toUpperCase();

      // Disambiguation
      const candidates = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (r === from.row && c === from.col) continue;
          const p = this.board[r][c];
          if (p && p.type === piece.type && p.color === piece.color) {
            const legals = this.getLegalMovesForSquare(r, c);
            if (legals.some(m => m.to.row === to.row && m.to.col === to.col)) {
              candidates.push({ row: r, col: c });
            }
          }
        }
      }

      if (candidates.length > 0) {
        const sameCol = candidates.some(c => c.col === from.col);
        const sameRow = candidates.some(c => c.row === from.row);
        if (!sameCol) {
          san += files[from.col];
        } else if (!sameRow) {
          san += ranks[from.row];
        } else {
          san += files[from.col] + ranks[from.row];
        }
      }

      if (isCapture) {
        san += 'x';
      }
      san += files[to.col] + ranks[to.row];
    }

    return san;
  }

  // Execute a move on the game board
  makeMove(move) {
    const { from, to, promotion, isCastling, isEnPassant, isDoublePawn } = move;
    const piece = this.board[from.row][from.col];
    if (!piece) return false;

    const san = this.moveToSAN(move);
    const captured = isEnPassant
      ? { type: 'p', color: piece.color === 'w' ? 'b' : 'w' }
      : this.board[to.row][to.col];

    // Save state for undo
    const state = {
      move: { ...move },
      piece: { ...piece },
      captured: captured ? { ...captured } : null,
      castling: JSON.parse(JSON.stringify(this.castling)),
      enPassant: this.enPassant ? { ...this.enPassant } : null,
      halfMoves: this.halfMoves,
      fullMoves: this.fullMoves,
      turn: this.turn,
      san: san
    };

    // Apply piece movement
    this.board[to.row][to.col] = piece;
    this.board[from.row][from.col] = null;

    if (promotion) {
      this.board[to.row][to.col] = { type: promotion, color: piece.color };
    }

    if (isEnPassant) {
      const capRow = piece.color === 'w' ? to.row + 1 : to.row - 1;
      this.board[capRow][to.col] = null;
    }

    if (isCastling === 'k') {
      const r = from.row;
      this.board[r][5] = this.board[r][7];
      this.board[r][7] = null;
    } else if (isCastling === 'q') {
      const r = from.row;
      this.board[r][3] = this.board[r][0];
      this.board[r][0] = null;
    }

    // Update castling rights
    if (piece.type === 'k') {
      this.castling[piece.color].k = false;
      this.castling[piece.color].q = false;
    } else if (piece.type === 'r') {
      if (from.row === 7 && from.col === 7) this.castling.w.k = false;
      if (from.row === 7 && from.col === 0) this.castling.w.q = false;
      if (from.row === 0 && from.col === 7) this.castling.b.k = false;
      if (from.row === 0 && from.col === 0) this.castling.b.q = false;
    }

    // If a rook is captured, remove opponent's castling rights on that side
    if (captured && captured.type === 'r') {
      if (to.row === 7 && to.col === 7) this.castling.w.k = false;
      if (to.row === 7 && to.col === 0) this.castling.w.q = false;
      if (to.row === 0 && to.col === 7) this.castling.b.k = false;
      if (to.row === 0 && to.col === 0) this.castling.b.q = false;
    }

    // Update En Passant target
    if (isDoublePawn) {
      this.enPassant = {
        row: piece.color === 'w' ? from.row - 1 : from.row + 1,
        col: from.col
      };
    } else {
      this.enPassant = null;
    }

    // Half-moves for 50-move rule (reset on pawn move or capture)
    if (piece.type === 'p' || captured) {
      this.halfMoves = 0;
    } else {
      this.halfMoves++;
    }

    // Full move count
    if (this.turn === 'b') {
      this.fullMoves++;
    }

    // Toggle turn
    this.turn = this.turn === 'w' ? 'b' : 'w';

    // Append + or # to SAN if in check / checkmate
    const nextLegals = this.getAllLegalMoves(this.turn);
    const inCheck = this.isInCheck(this.turn);
    if (inCheck && nextLegals.length === 0) {
      state.san += '#';
    } else if (inCheck) {
      state.san += '+';
    }

    this.history.push(state);
    this.future = []; // Clear redo stack on new move
    this.recordPosition();

    return true;
  }

  // Undo the last move
  undoMove() {
    if (this.history.length === 0) return null;

    this.unrecordPosition();
    const last = this.history.pop();
    const { move, piece, captured, castling, enPassant, halfMoves, fullMoves, turn } = last;
    const { from, to, isCastling, isEnPassant } = move;

    // Restore board
    this.board[from.row][from.col] = piece;
    this.board[to.row][to.col] = isEnPassant ? null : captured;

    if (isEnPassant) {
      const capRow = piece.color === 'w' ? to.row + 1 : to.row - 1;
      this.board[capRow][to.col] = captured;
    }

    if (isCastling === 'k') {
      const r = from.row;
      this.board[r][7] = this.board[r][5];
      this.board[r][5] = null;
    } else if (isCastling === 'q') {
      const r = from.row;
      this.board[r][0] = this.board[r][3];
      this.board[r][3] = null;
    }

    this.castling = castling;
    this.enPassant = enPassant;
    this.halfMoves = halfMoves;
    this.fullMoves = fullMoves;
    this.turn = turn;

    this.future.push(last);
    return last;
  }

  // Redo previously undone move
  redoMove() {
    if (this.future.length === 0) return null;
    const next = this.future.pop();
    this.makeMove(next.move);
    return next;
  }

  // Check game termination status
  getGameStatus() {
    const legalMoves = this.getAllLegalMoves(this.turn);
    const inCheck = this.isInCheck(this.turn);

    if (legalMoves.length === 0) {
      if (inCheck) {
        return {
          isGameOver: true,
          winner: this.turn === 'w' ? 'b' : 'w',
          reason: 'Checkmate'
        };
      } else {
        return {
          isGameOver: true,
          winner: 'draw',
          reason: 'Stalemate'
        };
      }
    }

    if (this.isInsufficientMaterial()) {
      return {
        isGameOver: true,
        winner: 'draw',
        reason: 'Insufficient Material'
      };
    }

    if (this.halfMoves >= 100) {
      return {
        isGameOver: true,
        winner: 'draw',
        reason: '50-Move Rule'
      };
    }

    const currentKey = this.getPositionKey();
    if (this.positionCounts[currentKey] >= 3) {
      return {
        isGameOver: true,
        winner: 'draw',
        reason: 'Threefold Repetition'
      };
    }

    return {
      isGameOver: false,
      inCheck: inCheck,
      turn: this.turn
    };
  }

  // Insufficient material detection (K vs K, K+B vs K, K+N vs K, K+B vs K+B same color)
  isInsufficientMaterial() {
    const pieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) pieces.push({ ...p, r, c });
      }
    }

    // King vs King
    if (pieces.length === 2) return true;

    // King + minor vs King
    if (pieces.length === 3) {
      const nonKing = pieces.find(p => p.type !== 'k');
      if (nonKing && (nonKing.type === 'b' || nonKing.type === 'n')) {
        return true;
      }
    }

    // King + Bishop vs King + Bishop on same color squares
    if (pieces.length === 4) {
      const bishops = pieces.filter(p => p.type === 'b');
      if (bishops.length === 2 && bishops[0].color !== bishops[1].color) {
        const b1SquareColor = (bishops[0].r + bishops[0].c) % 2;
        const b2SquareColor = (bishops[1].r + bishops[1].c) % 2;
        if (b1SquareColor === b2SquareColor) {
          return true;
        }
      }
    }

    return false;
  }

  // Material evaluation difference (+ for White advantage, - for Black)
  getMaterialScore() {
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) {
          const val = values[p.type] || 0;
          score += (p.color === 'w' ? val : -val);
        }
      }
    }
    return score;
  }

  // Get captured pieces list
  getCapturedPieces() {
    const captured = { w: [], b: [] };
    const startingCounts = {
      p: 8, r: 2, n: 2, b: 2, q: 1, k: 1
    };

    const currentCounts = {
      w: { p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 },
      b: { p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 }
    };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) {
          currentCounts[p.color][p.type]++;
        }
      }
    }

    ['w', 'b'].forEach(col => {
      ['q', 'r', 'b', 'n', 'p'].forEach(type => {
        const diff = startingCounts[type] - currentCounts[col][type];
        for (let i = 0; i < diff; i++) {
          captured[col].push(type);
        }
      });
    });

    return captured;
  }

  // Generate FEN string
  getFEN() {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          fen += p.color === 'w' ? p.type.toUpperCase() : p.type.toLowerCase();
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    fen += ' ' + this.turn;
    let castlingStr = '';
    if (this.castling.w.k) castlingStr += 'K';
    if (this.castling.w.q) castlingStr += 'Q';
    if (this.castling.b.k) castlingStr += 'k';
    if (this.castling.b.q) castlingStr += 'q';
    fen += ' ' + (castlingStr || '-');

    if (this.enPassant) {
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
      fen += ' ' + files[this.enPassant.col] + ranks[this.enPassant.row];
    } else {
      fen += ' -';
    }

    fen += ' ' + this.halfMoves + ' ' + this.fullMoves;
    return fen;
  }

  // Load game from FEN
  loadFEN(fen) {
    const parts = fen.trim().split(/\s+/);
    if (parts.length < 4) return false;

    const boardStr = parts[0];
    const turn = parts[1];
    const castlingStr = parts[2];
    const epStr = parts[3];
    const halfMoves = parts[4] ? parseInt(parts[4], 10) : 0;
    const fullMoves = parts[5] ? parseInt(parts[5], 10) : 1;

    const rows = boardStr.split('/');
    if (rows.length !== 8) return false;

    const newBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const char of rows[r]) {
        if (/[1-8]/.test(char)) {
          c += parseInt(char, 10);
        } else {
          const color = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase();
          if (c < 8) {
            newBoard[r][c] = { type, color };
            c++;
          }
        }
      }
      if (c !== 8) return false;
    }

    this.board = newBoard;
    this.turn = turn === 'b' ? 'b' : 'w';
    this.castling = {
      w: { k: castlingStr.includes('K'), q: castlingStr.includes('Q') },
      b: { k: castlingStr.includes('k'), q: castlingStr.includes('q') }
    };

    if (epStr && epStr !== '-') {
      const file = epStr.charCodeAt(0) - 97;
      const rank = 8 - parseInt(epStr[1], 10);
      this.enPassant = { row: rank, col: file };
    } else {
      this.enPassant = null;
    }

    this.halfMoves = isNaN(halfMoves) ? 0 : halfMoves;
    this.fullMoves = isNaN(fullMoves) ? 1 : fullMoves;
    this.history = [];
    this.future = [];
    this.positionCounts = {};
    this.recordPosition();
    return true;
  }

  // Export PGN string
  getPGN(headers = {}) {
    let pgn = '';
    const defaultHeaders = {
      Event: 'Casual Offline Chess Match',
      Site: 'Offline Chess Web App',
      Date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      Round: '1',
      White: headers.White || 'Player 1',
      Black: headers.Black || 'Player 2',
      Result: '*'
    };

    const status = this.getGameStatus();
    if (status.isGameOver) {
      if (status.winner === 'w') defaultHeaders.Result = '1-0';
      else if (status.winner === 'b') defaultHeaders.Result = '0-1';
      else defaultHeaders.Result = '1/2-1/2';
    }

    for (const [key, val] of Object.entries(defaultHeaders)) {
      pgn += `[${key} "${val}"]\n`;
    }
    pgn += '\n';

    let moveNum = 1;
    for (let i = 0; i < this.history.length; i++) {
      if (i % 2 === 0) {
        pgn += `${moveNum}. `;
        moveNum++;
      }
      pgn += `${this.history[i].san} `;
    }

    pgn += defaultHeaders.Result;
    return pgn.trim();
  }
}

window.ChessEngine = ChessEngine;
