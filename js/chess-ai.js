// Smart Offline Chess AI Engine
// Features: Minimax with Alpha-Beta Pruning, Quiescence Search, Piece-Square Tables (PST),
// MVV-LVA Move Ordering, and 4 Adjustable Difficulty Tiers.

class ChessAI {
  constructor() {
    // Piece Base Values (in centipawns)
    this.PIECE_VALUES = {
      p: 100,
      n: 320,
      b: 330,
      r: 500,
      q: 900,
      k: 20000
    };

    // Piece-Square Tables (White perspective, rank 0 is 8th rank, rank 7 is 1st rank)
    this.PST = {
      p: [
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [ 5,  5, 10, 25, 25, 10,  5,  5],
        [ 0,  0,  0, 20, 20,  0,  0,  0],
        [ 5, -5,-10,  0,  0,-10, -5,  5],
        [ 5, 10, 10,-20,-20, 10, 10,  5],
        [ 0,  0,  0,  0,  0,  0,  0,  0]
      ],
      n: [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
      ],
      b: [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
      ],
      r: [
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [ 5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [ 0,  0,  0,  5,  5,  0,  0,  0]
      ],
      q: [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [ -5,  0,  5,  5,  5,  5,  0, -5],
        [  0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
      ],
      k: [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [ 20, 20,  0,  0,  0,  0, 20, 20],
        [ 20, 30, 10,  0,  0, 10, 30, 20]
      ]
    };

    this.nodesEvaluated = 0;
  }

  // Get positional square value (flips coordinates for Black)
  getPstValue(piece, row, col) {
    const table = this.PST[piece.type];
    if (!table) return 0;
    if (piece.color === 'w') {
      return table[row][col];
    } else {
      // Flip vertically for Black
      return table[7 - row][col];
    }
  }

  // Static board evaluation function (Positive favors White, Negative favors Black)
  evaluateBoard(game) {
    this.nodesEvaluated++;
    const board = game.board;
    let score = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const val = this.PIECE_VALUES[piece.type] + this.getPstValue(piece, r, c);
          if (piece.color === 'w') {
            score += val;
          } else {
            score -= val;
          }
        }
      }
    }
    return score;
  }

  // Order moves to dramatically improve Alpha-Beta pruning efficiency (MVV-LVA)
  orderMoves(game, moves) {
    return moves.map(move => {
      let score = 0;
      const target = game.board[move.to.row][move.to.col];
      const piece = game.board[move.from.row][move.from.col];

      if (target) {
        // MVV-LVA: High value victim, low value attacker
        score += 10 * this.PIECE_VALUES[target.type] - this.PIECE_VALUES[piece.type];
      }
      if (move.promotion) {
        score += this.PIECE_VALUES[move.promotion];
      }
      if (move.isCastling) {
        score += 60;
      }
      return { move, score };
    }).sort((a, b) => b.score - a.score).map(item => item.move);
  }

  // Quiescence search: avoids horizon effect on dynamic capture sequences
  quiescence(game, alpha, beta, isMaximizing, depth = 0, maxQDepth = 3) {
    this.nodesEvaluated++;
    const standPat = this.evaluateBoard(game);

    if (depth >= maxQDepth) {
      return standPat;
    }

    if (isMaximizing) {
      if (standPat >= beta) return beta;
      if (alpha < standPat) alpha = standPat;

      // Only search capture moves in quiescence
      const captureMoves = game.getAllLegalMoves('w').filter(m =>
        game.board[m.to.row][m.to.col] !== null || m.isEnPassant
      );
      const ordered = this.orderMoves(game, captureMoves);

      for (const move of ordered) {
        game.makeMove(move);
        const score = this.quiescence(game, alpha, beta, false, depth + 1, maxQDepth);
        game.undoMove();

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      }
      return alpha;
    } else {
      if (standPat <= alpha) return alpha;
      if (beta > standPat) beta = standPat;

      const captureMoves = game.getAllLegalMoves('b').filter(m =>
        game.board[m.to.row][m.to.col] !== null || m.isEnPassant
      );
      const ordered = this.orderMoves(game, captureMoves);

      for (const move of ordered) {
        game.makeMove(move);
        const score = this.quiescence(game, alpha, beta, true, depth + 1, maxQDepth);
        game.undoMove();

        if (score <= alpha) return alpha;
        if (score < beta) beta = score;
      }
      return beta;
    }
  }

  // Minimax with Alpha-Beta Pruning
  minimax(game, depth, alpha, beta, isMaximizing, maxDepth) {
    const status = game.getGameStatus();
    if (status.isGameOver) {
      if (status.winner === 'w') return 100000 + depth;
      if (status.winner === 'b') return -100000 - depth;
      return 0; // Draw
    }

    if (depth === 0) {
      // At leaf nodes, use quiescence search to resolve unstable tactical positions
      return this.quiescence(game, alpha, beta, isMaximizing);
    }

    const currentTurn = isMaximizing ? 'w' : 'b';
    const rawMoves = game.getAllLegalMoves(currentTurn);
    const moves = this.orderMoves(game, rawMoves);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        game.makeMove(move);
        const evalScore = this.minimax(game, depth - 1, alpha, beta, false, maxDepth);
        game.undoMove();

        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // Beta cutoff
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        game.makeMove(move);
        const evalScore = this.minimax(game, depth - 1, alpha, beta, true, maxDepth);
        game.undoMove();

        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break; // Alpha cutoff
      }
      return minEval;
    }
  }

  // Choose the best move according to the selected difficulty
  async getBestMove(game, difficulty = 3) {
    this.nodesEvaluated = 0;
    const aiColor = game.turn;
    const legalMoves = game.getAllLegalMoves(aiColor);
    if (legalMoves.length === 0) return null;

    // Artificial thinking pause for human feel (250ms - 500ms)
    await new Promise(r => setTimeout(r, Math.min(450, 150 + difficulty * 100)));

    // Level 1: Beginner (Random with 60% capture bias)
    if (difficulty === 1) {
      const captures = legalMoves.filter(m => game.board[m.to.row][m.to.col] !== null);
      if (captures.length > 0 && Math.random() < 0.6) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    // Level 2: Casual (Depth 1 + PST positional evaluation)
    if (difficulty === 2) {
      let bestMove = legalMoves[0];
      let bestScore = aiColor === 'w' ? -Infinity : Infinity;

      for (const move of legalMoves) {
        game.makeMove(move);
        const score = this.evaluateBoard(game) + (Math.random() * 20 - 10);
        game.undoMove();

        if (aiColor === 'w' && score > bestScore) {
          bestScore = score;
          bestMove = move;
        } else if (aiColor === 'b' && score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      return bestMove;
    }

    // Level 3: Club Player (Depth 2 + Quiescence)
    // Level 4: Master (Depth 3-4 + Quiescence)
    const searchDepth = difficulty === 3 ? 2 : 3;
    const isMaximizing = aiColor === 'w';
    let bestMove = legalMoves[0];
    let bestScore = isMaximizing ? -Infinity : Infinity;

    const orderedMoves = this.orderMoves(game, legalMoves);
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of orderedMoves) {
      game.makeMove(move);
      const evalScore = this.minimax(game, searchDepth - 1, alpha, beta, !isMaximizing, searchDepth);
      game.undoMove();

      if (isMaximizing) {
        if (evalScore > bestScore) {
          bestScore = evalScore;
          bestMove = move;
        }
        alpha = Math.max(alpha, evalScore);
      } else {
        if (evalScore < bestScore) {
          bestScore = evalScore;
          bestMove = move;
        }
        beta = Math.min(beta, evalScore);
      }
    }

    return bestMove;
  }
}

window.ChessAI = ChessAI;
