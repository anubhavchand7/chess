// Offline Chess App Controller
// Handles UI rendering, user interaction, clocks, drag-and-drop, sounds, and AI turns.

class ChessApp {
  constructor() {
    this.game = new ChessEngine();
    this.ai = new ChessAI();

    // Game configurations
    this.gameMode = 'ai'; // 'ai' | '2p' | 'analysis'
    this.aiDifficulty = 3; // 1: Novice, 2: Casual, 3: Club, 4: Master
    this.playerColor = 'w'; // 'w' | 'b' | 'random'
    this.userColor = 'w'; // actual assigned user color
    this.isBoardFlipped = false;
    this.isAiThinking = false;

    // Board interaction state
    this.selectedSquare = null; // { row, col }
    this.currentLegalMoves = [];
    this.viewMoveIndex = -1; // -1 means live current position; >= 0 means viewing past state
    this.pendingPromotionMove = null;

    // Time Control & Clocks
    this.timeControl = '10|0'; // initial rapid 10m
    this.clocks = { w: 600, b: 600 };
    this.clockIncrement = 0;
    this.timerInterval = null;
    this.isClockRunning = false;

    // Cache DOM elements
    this.initElements();
    this.initEvents();
    this.loadPreferences();

    // Start fresh game
    this.startNewGame();
  }

  initElements() {
    this.boardEl = document.getElementById('chessboard');
    this.aiThinkingEl = document.getElementById('aiThinkingPill');
    this.moveListEl = document.getElementById('moveList');
    this.turnStatusBadge = document.getElementById('turnStatusBadge');

    // Clocks and players
    this.topPlayerBar = document.getElementById('topPlayerBar');
    this.bottomPlayerBar = document.getElementById('bottomPlayerBar');
    this.topPlayerClock = document.getElementById('topPlayerClock');
    this.bottomPlayerClock = document.getElementById('bottomPlayerClock');
    this.topPlayerName = document.getElementById('topPlayerName');
    this.bottomPlayerName = document.getElementById('bottomPlayerName');
    this.topPlayerBadge = document.getElementById('topPlayerBadge');
    this.bottomPlayerBadge = document.getElementById('bottomPlayerBadge');
    this.topPlayerAvatar = document.getElementById('topPlayerAvatar');
    this.bottomPlayerAvatar = document.getElementById('bottomPlayerAvatar');
    this.topCapturedEl = document.getElementById('topCapturedPieces');
    this.bottomCapturedEl = document.getElementById('bottomCapturedPieces');

    // Navigation buttons
    this.stepFirstBtn = document.getElementById('stepFirstBtn');
    this.stepPrevBtn = document.getElementById('stepPrevBtn');
    this.stepNextBtn = document.getElementById('stepNextBtn');
    this.stepLastBtn = document.getElementById('stepLastBtn');

    // Modals
    this.promoModal = document.getElementById('promoModal');
    this.promoChoices = document.getElementById('promoChoices');
    this.gameOverModal = document.getElementById('gameOverModal');
    this.gameOverTitle = document.getElementById('gameOverTitle');
    this.gameOverDesc = document.getElementById('gameOverDesc');
    this.gameOverIcon = document.getElementById('gameOverIcon');
    this.exportModal = document.getElementById('exportModal');
    this.helpModal = document.getElementById('helpModal');
    this.toastEl = document.getElementById('toast');
  }

  initEvents() {
    // Theme Selector
    const themeSelector = document.getElementById('themeSelector');
    themeSelector.addEventListener('change', (e) => {
      document.body.className = e.target.value;
      localStorage.setItem('chess_theme', e.target.value);
    });

    // Sound Toggle
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    soundToggleBtn.addEventListener('click', () => {
      const enabled = window.soundEngine.toggleSound();
      document.getElementById('soundIconOn').style.display = enabled ? 'block' : 'none';
      document.getElementById('soundIconOff').style.display = enabled ? 'none' : 'block';
      soundToggleBtn.classList.toggle('active', enabled);
      this.showToast(enabled ? 'Sound turned On' : 'Sound turned Off');
      localStorage.setItem('chess_sound', enabled);
    });

    // Mode Tabs
    document.getElementById('modeAiTab').addEventListener('click', () => this.switchMode('ai'));
    document.getElementById('mode2pTab').addEventListener('click', () => this.switchMode('2p'));
    document.getElementById('modeAnalysisTab').addEventListener('click', () => this.switchMode('analysis'));

    // Difficulty buttons
    const diffButtons = document.querySelectorAll('.diff-btn');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.aiDifficulty = parseInt(btn.dataset.diff, 10);
        const labels = { 1: 'Novice (800)', 2: 'Casual (1200)', 3: 'Club (1600)', 4: 'Master (2000)' };
        document.getElementById('diffLabel').textContent = labels[this.aiDifficulty];
        this.updatePlayerHeaders();
      });
    });

    // Color Selector
    document.getElementById('userColorSelect').addEventListener('change', (e) => {
      this.playerColor = e.target.value;
    });

    // Time Control Selector
    document.getElementById('timeControlSelect').addEventListener('change', (e) => {
      this.timeControl = e.target.value;
      this.resetClocks();
    });

    // Action buttons
    document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
    document.getElementById('undoMoveBtn').addEventListener('click', () => this.handleUndo());
    document.getElementById('flipBoardBtn').addEventListener('click', () => this.toggleBoardFlip());
    document.getElementById('resignBtn').addEventListener('click', () => this.handleResign());
    document.getElementById('exportImportBtn').addEventListener('click', () => this.openExportModal());

    // Navigation step buttons
    this.stepFirstBtn.addEventListener('click', () => this.navigateToMove(0));
    this.stepPrevBtn.addEventListener('click', () => this.navigateToMove(this.viewMoveIndex === -1 ? this.game.history.length - 1 : this.viewMoveIndex - 1));
    this.stepNextBtn.addEventListener('click', () => this.navigateToMove(this.viewMoveIndex + 1));
    this.stepLastBtn.addEventListener('click', () => this.navigateToMove(-1));

    // Modals buttons
    document.getElementById('modalRematchBtn').addEventListener('click', () => {
      this.gameOverModal.classList.remove('open');
      this.startNewGame();
    });
    document.getElementById('modalReviewBtn').addEventListener('click', () => {
      this.gameOverModal.classList.remove('open');
    });

    // Export Modal controls
    document.getElementById('loadFenBtn').addEventListener('click', () => this.loadCustomFEN());
    document.getElementById('copyFenBtn').addEventListener('click', () => this.copyFEN());
    document.getElementById('copyPgnBtn').addEventListener('click', () => this.copyPGN());
    document.getElementById('closeExportModalBtn').addEventListener('click', () => {
      this.exportModal.classList.remove('open');
    });

    // Help Modal controls
    document.getElementById('helpBtn').addEventListener('click', () => this.helpModal.classList.add('open'));
    document.getElementById('closeHelpModalBtn').addEventListener('click', () => this.helpModal.classList.remove('open'));

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'z' || (e.ctrlKey && e.key === 'z')) {
        e.preventDefault();
        this.handleUndo();
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleBoardFlip();
      } else if (e.key === 'n' || e.key === 'N') {
        this.startNewGame();
      } else if (e.key === 'ArrowLeft') {
        if (!this.stepPrevBtn.disabled) this.stepPrevBtn.click();
      } else if (e.key === 'ArrowRight') {
        if (!this.stepNextBtn.disabled) this.stepNextBtn.click();
      }
    });

    // Drag-and-drop support
    this.initDragAndDrop();
  }

  loadPreferences() {
    const savedTheme = localStorage.getItem('chess_theme');
    if (savedTheme) {
      document.body.className = savedTheme;
      document.getElementById('themeSelector').value = savedTheme;
    }

    const savedSound = localStorage.getItem('chess_sound');
    if (savedSound !== null && savedSound === 'false') {
      window.soundEngine.enabled = false;
      document.getElementById('soundIconOn').style.display = 'none';
      document.getElementById('soundIconOff').style.display = 'block';
      document.getElementById('soundToggleBtn').classList.remove('active');
    }
  }

  switchMode(mode) {
    this.gameMode = mode;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'ai') document.getElementById('modeAiTab').classList.add('active');
    else if (mode === '2p') document.getElementById('mode2pTab').classList.add('active');
    else if (mode === 'analysis') document.getElementById('modeAnalysisTab').classList.add('active');

    document.getElementById('aiConfigSection').style.display = mode === 'ai' ? 'block' : 'none';
    this.startNewGame();
  }

  startNewGame() {
    this.stopClock();
    this.game.reset();
    this.selectedSquare = null;
    this.currentLegalMoves = [];
    this.viewMoveIndex = -1;
    this.isAiThinking = false;
    this.aiThinkingEl.classList.remove('show');
    this.gameOverModal.classList.remove('open');
    this.promoModal.classList.remove('open');

    // Assign color
    if (this.gameMode === 'ai') {
      if (this.playerColor === 'random') {
        this.userColor = Math.random() < 0.5 ? 'w' : 'b';
      } else {
        this.userColor = this.playerColor;
      }
      this.isBoardFlipped = this.userColor === 'b';
    } else {
      this.userColor = 'w';
      this.isBoardFlipped = false;
    }

    this.boardEl.classList.toggle('flipped', this.isBoardFlipped);
    this.resetClocks();
    this.updatePlayerHeaders();
    this.render();
    this.updateMoveList();
    this.updateStatus();

    // If AI is White, trigger AI move
    if (this.gameMode === 'ai' && this.userColor === 'b') {
      this.triggerAiMove();
    }
  }

  resetClocks() {
    this.stopClock();
    if (this.timeControl === 'none') {
      this.topPlayerClock.textContent = '∞';
      this.bottomPlayerClock.textContent = '∞';
      this.clocks = { w: null, b: null };
      return;
    }

    const [minutes, inc] = this.timeControl.split('|').map(Number);
    const totalSeconds = minutes * 60;
    this.clocks = { w: totalSeconds, b: totalSeconds };
    this.clockIncrement = inc || 0;
    this.updateClockDisplay('w');
    this.updateClockDisplay('b');
  }

  startClock() {
    if (this.timeControl === 'none') return;
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.isClockRunning = true;
    this.timerInterval = setInterval(() => {
      const turn = this.game.turn;
      if (this.clocks[turn] === null) return;

      this.clocks[turn]--;
      this.updateClockDisplay(turn);

      if (this.clocks[turn] <= 10 && this.clocks[turn] > 0) {
        window.soundEngine.playLowTime();
      }

      if (this.clocks[turn] <= 0) {
        this.stopClock();
        const winner = turn === 'w' ? 'b' : 'w';
        this.handleTimeout(winner);
      }
    }, 1000);
  }

  stopClock() {
    this.isClockRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateClockDisplay(color) {
    const isTopPlayer = (color === 'b' && !this.isBoardFlipped) || (color === 'w' && this.isBoardFlipped);
    const clockEl = isTopPlayer ? this.topPlayerClock : this.bottomPlayerClock;

    if (this.clocks[color] === null) {
      clockEl.textContent = '∞';
      clockEl.classList.remove('low-time');
      return;
    }

    const totalSec = Math.max(0, this.clocks[color]);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    clockEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (totalSec <= 30) {
      clockEl.classList.add('low-time');
    } else {
      clockEl.classList.remove('low-time');
    }
  }

  handleTimeout(winner) {
    const winnerName = winner === 'w' ? 'White' : 'Black';
    window.soundEngine.playGameOver(this.gameMode === 'ai' ? winner === this.userColor : true);
    this.showGameOverModal('Time Out!', `${winnerName} wins on time.`);
  }

  updatePlayerHeaders() {
    const diffNames = { 1: 'Novice', 2: 'Casual', 3: 'Club', 4: 'Master' };
    const isWhiteBottom = !this.isBoardFlipped;

    if (this.gameMode === 'ai') {
      if (this.userColor === 'w') {
        this.topPlayerName.textContent = 'AI Engine';
        this.topPlayerBadge.textContent = diffNames[this.aiDifficulty];
        this.topPlayerAvatar.textContent = '🤖';
        this.bottomPlayerName.textContent = 'You (White)';
        this.bottomPlayerBadge.textContent = 'Player';
        this.bottomPlayerAvatar.textContent = '👤';
      } else {
        this.topPlayerName.textContent = 'AI Engine';
        this.topPlayerBadge.textContent = diffNames[this.aiDifficulty];
        this.topPlayerAvatar.textContent = '🤖';
        this.bottomPlayerName.textContent = 'You (Black)';
        this.bottomPlayerBadge.textContent = 'Player';
        this.bottomPlayerAvatar.textContent = '👤';
      }
    } else if (this.gameMode === '2p') {
      this.topPlayerName.textContent = isWhiteBottom ? 'Player 2 (Black)' : 'Player 1 (White)';
      this.topPlayerBadge.textContent = 'Pass & Play';
      this.topPlayerAvatar.textContent = '♟️';
      this.bottomPlayerName.textContent = isWhiteBottom ? 'Player 1 (White)' : 'Player 2 (Black)';
      this.bottomPlayerBadge.textContent = 'Pass & Play';
      this.bottomPlayerAvatar.textContent = '♙';
    } else {
      this.topPlayerName.textContent = 'Board Analysis';
      this.topPlayerBadge.textContent = 'Sandbox';
      this.topPlayerAvatar.textContent = '🔍';
      this.bottomPlayerName.textContent = 'Free Analysis';
      this.bottomPlayerBadge.textContent = 'Sandbox';
      this.bottomPlayerAvatar.textContent = '💡';
    }
  }

  toggleBoardFlip() {
    this.isBoardFlipped = !this.isBoardFlipped;
    this.boardEl.classList.toggle('flipped', this.isBoardFlipped);
    this.updatePlayerHeaders();
    this.render();
  }

  // Render the 8x8 Chessboard
  render() {
    this.boardEl.innerHTML = '';
    const boardState = this.viewMoveIndex === -1 ? this.game.board : this.getBoardAtMoveIndex(this.viewMoveIndex);
    const lastMove = this.getLastMove();
    const inCheckKingPos = this.game.isInCheck(this.game.turn) ? this.game.findKing(this.game.turn, boardState) : null;

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const square = document.createElement('div');
        square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
        square.dataset.row = r;
        square.dataset.col = c;

        // Selected highlight
        if (this.selectedSquare && this.selectedSquare.row === r && this.selectedSquare.col === c) {
          square.classList.add('selected');
        }

        // Last move highlight
        if (lastMove && ((lastMove.from.row === r && lastMove.from.col === c) || (lastMove.to.row === r && lastMove.to.col === c))) {
          square.classList.add('last-move');
        }

        // King in check highlight
        if (inCheckKingPos && inCheckKingPos.row === r && inCheckKingPos.col === c) {
          square.classList.add('in-check');
        }

        // Algebraic coordinates labels
        if (c === 7) {
          const rankLabel = document.createElement('span');
          rankLabel.className = 'coord-rank';
          rankLabel.textContent = ranks[r];
          square.appendChild(rankLabel);
        }
        if (r === 7) {
          const fileLabel = document.createElement('span');
          fileLabel.className = 'coord-file';
          fileLabel.textContent = files[c];
          square.appendChild(fileLabel);
        }

        // Render Chess Piece
        const piece = boardState[r][c];
        if (piece) {
          const pieceCode = piece.color + piece.type.toUpperCase();
          const pieceDiv = document.createElement('div');
          pieceDiv.className = 'piece-container';
          pieceDiv.draggable = (this.viewMoveIndex === -1 && !this.isAiThinking);
          pieceDiv.innerHTML = CHESS_PIECE_SVGS[pieceCode] || '';
          square.appendChild(pieceDiv);
        }

        // Render Move Target Dot / Capture Ring
        const targetMove = this.currentLegalMoves.find(m => m.to.row === r && m.to.col === c);
        if (targetMove) {
          const indicator = document.createElement('div');
          indicator.className = `move-indicator ${piece || targetMove.isEnPassant ? 'capture' : ''}`;
          square.appendChild(indicator);
        }

        // Click handler
        square.addEventListener('click', () => this.handleSquareClick(r, c));

        this.boardEl.appendChild(square);
      }
    }

    this.updateCapturedPieces();
  }

  // Handle Square Clicks
  handleSquareClick(row, col) {
    if (this.viewMoveIndex !== -1) {
      // If browsing history, clicking snaps back to live state
      this.navigateToMove(-1);
      return;
    }

    if (this.isAiThinking) return;

    // Check if player's turn in vs AI mode
    if (this.gameMode === 'ai' && this.game.turn !== this.userColor) {
      return;
    }

    // If clicking on an already highlighted valid move target
    const targetMove = this.currentLegalMoves.find(m => m.to.row === row && m.to.col === col);
    if (targetMove) {
      this.executePlayerMove(targetMove);
      return;
    }

    // Otherwise selecting a piece of the current turn
    const clickedPiece = this.game.board[row][col];
    if (clickedPiece && clickedPiece.color === this.game.turn) {
      this.selectedSquare = { row, col };
      this.currentLegalMoves = this.game.getLegalMovesForSquare(row, col);
      this.render();
    } else {
      this.selectedSquare = null;
      this.currentLegalMoves = [];
      this.render();
    }
  }

  // Drag and drop setup
  initDragAndDrop() {
    let draggedFrom = null;

    this.boardEl.addEventListener('dragstart', (e) => {
      if (this.viewMoveIndex !== -1 || this.isAiThinking) {
        e.preventDefault();
        return;
      }
      if (this.gameMode === 'ai' && this.game.turn !== this.userColor) {
        e.preventDefault();
        return;
      }

      const square = e.target.closest('.square');
      if (!square) return;

      const r = parseInt(square.dataset.row, 10);
      const c = parseInt(square.dataset.col, 10);
      const piece = this.game.board[r][c];

      if (!piece || piece.color !== this.game.turn) {
        e.preventDefault();
        return;
      }

      draggedFrom = { row: r, col: c };
      this.selectedSquare = draggedFrom;
      this.currentLegalMoves = this.game.getLegalMovesForSquare(r, c);
      this.render();
      e.dataTransfer.setData('text/plain', `${r},${c}`);
    });

    this.boardEl.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    this.boardEl.addEventListener('drop', (e) => {
      e.preventDefault();
      const square = e.target.closest('.square');
      if (!square || !draggedFrom) return;

      const r = parseInt(square.dataset.row, 10);
      const c = parseInt(square.dataset.col, 10);

      const move = this.currentLegalMoves.find(m => m.to.row === r && m.to.col === c);
      if (move) {
        this.executePlayerMove(move);
      } else {
        this.selectedSquare = null;
        this.currentLegalMoves = [];
        this.render();
      }
      draggedFrom = null;
    });
  }

  // Execute a verified player move
  executePlayerMove(move) {
    const piece = this.game.board[move.from.row][move.from.col];

    // Check for Pawn Promotion requirement
    const promoRow = piece.color === 'w' ? 0 : 7;
    if (piece.type === 'p' && move.to.row === promoRow && !move.promotion) {
      this.promptPromotion(move, piece.color);
      return;
    }

    this.completeMove(move);
  }

  promptPromotion(baseMove, color) {
    this.pendingPromotionMove = baseMove;
    this.promoChoices.innerHTML = '';

    const choices = ['q', 'r', 'b', 'n'];
    choices.forEach(type => {
      const btn = document.createElement('button');
      btn.className = 'promo-piece-btn';
      btn.innerHTML = CHESS_PIECE_SVGS[color + type.toUpperCase()];
      btn.addEventListener('click', () => {
        this.promoModal.classList.remove('open');
        const finalMove = { ...this.pendingPromotionMove, promotion: type };
        this.pendingPromotionMove = null;
        this.completeMove(finalMove);
      });
      this.promoChoices.appendChild(btn);
    });

    this.promoModal.classList.add('open');
  }

  completeMove(move) {
    const isCapture = this.game.board[move.to.row][move.to.col] !== null || move.isEnPassant;
    const isCastle = !!move.isCastling;
    const movingColor = this.game.turn;

    // Apply move to engine
    this.game.makeMove(move);

    // Apply clock increment
    if (this.timeControl !== 'none' && this.clocks[movingColor] !== null) {
      this.clocks[movingColor] += this.clockIncrement;
      this.updateClockDisplay(movingColor);
    }

    // Start clock on first move
    if (!this.isClockRunning && this.timeControl !== 'none') {
      this.startClock();
    }

    // Sound effect
    const status = this.game.getGameStatus();
    if (status.isGameOver) {
      this.stopClock();
      window.soundEngine.playGameOver(this.gameMode === 'ai' ? status.winner === this.userColor : true);
    } else if (status.inCheck) {
      window.soundEngine.playCheck();
    } else if (isCastle) {
      window.soundEngine.playCastle();
    } else if (isCapture) {
      window.soundEngine.playCapture();
    } else {
      window.soundEngine.playMove();
    }

    // Reset selection state
    this.selectedSquare = null;
    this.currentLegalMoves = [];
    this.viewMoveIndex = -1;

    // Refresh UI
    this.render();
    this.updateMoveList();
    this.updateStatus();

    // Handle Game Over
    if (status.isGameOver) {
      this.handleGameOver(status);
      return;
    }

    // Trigger AI move if in AI mode and it's AI's turn
    if (this.gameMode === 'ai' && this.game.turn !== this.userColor) {
      this.triggerAiMove();
    }
  }

  async triggerAiMove() {
    this.isAiThinking = true;
    this.aiThinkingEl.classList.add('show');

    try {
      const bestMove = await this.ai.getBestMove(this.game, this.aiDifficulty);
      this.isAiThinking = false;
      this.aiThinkingEl.classList.remove('show');

      if (bestMove) {
        this.completeMove(bestMove);
      }
    } catch (err) {
      console.error('AI calculation error:', err);
      this.isAiThinking = false;
      this.aiThinkingEl.classList.remove('show');
    }
  }

  handleGameOver(status) {
    let title = '';
    let desc = '';
    let icon = '🏆';

    if (status.reason === 'Checkmate') {
      const winnerName = status.winner === 'w' ? 'White' : 'Black';
      title = 'Checkmate!';
      desc = `${winnerName} emerges victorious by checkmate.`;
      icon = (this.gameMode === 'ai' && status.winner === this.userColor) || this.gameMode !== 'ai' ? '🏆' : '💀';
    } else {
      title = 'Game Drawn!';
      desc = `Match finished in a draw by ${status.reason}.`;
      icon = '🤝';
    }

    this.showGameOverModal(title, desc, icon);
  }

  showGameOverModal(title, desc, icon = '🏆') {
    this.gameOverTitle.textContent = title;
    this.gameOverDesc.textContent = desc;
    this.gameOverIcon.textContent = icon;
    this.gameOverModal.classList.add('open');
  }

  handleUndo() {
    if (this.isAiThinking) return;

    if (this.gameMode === 'ai') {
      // In AI mode, undo twice to revert both AI and player moves
      this.game.undoMove();
      this.game.undoMove();
    } else {
      this.game.undoMove();
    }

    this.selectedSquare = null;
    this.currentLegalMoves = [];
    this.viewMoveIndex = -1;
    this.render();
    this.updateMoveList();
    this.updateStatus();
    this.showToast('Move undone');
  }

  handleResign() {
    if (this.game.history.length === 0) return;
    const resigningColor = this.game.turn;
    const winnerColor = resigningColor === 'w' ? 'b' : 'w';
    const winnerName = winnerColor === 'w' ? 'White' : 'Black';
    this.stopClock();
    window.soundEngine.playGameOver(false);
    this.showGameOverModal('Resignation', `${winnerName} wins by resignation.`);
  }

  updateStatus() {
    const turn = this.game.turn;
    const inCheck = this.game.isInCheck(turn);
    const turnText = turn === 'w' ? 'White' : 'Black';

    this.turnStatusBadge.textContent = inCheck ? `${turnText} is in Check!` : `${turnText} to move`;
    this.turnStatusBadge.style.background = inCheck ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.15)';
    this.turnStatusBadge.style.color = inCheck ? '#f87171' : '#818cf8';

    // Highlight active player card
    const isTopTurn = (turn === 'b' && !this.isBoardFlipped) || (turn === 'w' && this.isBoardFlipped);
    this.topPlayerBar.classList.toggle('active-turn', isTopTurn);
    this.bottomPlayerBar.classList.toggle('active-turn', !isTopTurn);
  }

  updateMoveList() {
    this.moveListEl.innerHTML = '';
    const history = this.game.history;

    for (let i = 0; i < history.length; i += 2) {
      const moveRow = document.createElement('div');
      moveRow.className = 'move-row';

      const moveNum = document.createElement('span');
      moveNum.className = 'move-num';
      moveNum.textContent = `${Math.floor(i / 2) + 1}.`;
      moveRow.appendChild(moveNum);

      // White move
      const whiteMove = document.createElement('span');
      whiteMove.className = `move-item ${this.viewMoveIndex === i ? 'active' : ''}`;
      whiteMove.textContent = history[i].san;
      whiteMove.addEventListener('click', () => this.navigateToMove(i));
      moveRow.appendChild(whiteMove);

      // Black move
      if (i + 1 < history.length) {
        const blackMove = document.createElement('span');
        blackMove.className = `move-item ${this.viewMoveIndex === i + 1 ? 'active' : ''}`;
        blackMove.textContent = history[i + 1].san;
        blackMove.addEventListener('click', () => this.navigateToMove(i + 1));
        moveRow.appendChild(blackMove);
      }

      this.moveListEl.appendChild(moveRow);
    }

    // Auto-scroll to bottom of move list
    this.moveListEl.scrollTop = this.moveListEl.scrollHeight;

    // Update navigation button states
    const hasHistory = history.length > 0;
    this.stepFirstBtn.disabled = !hasHistory || this.viewMoveIndex === 0;
    this.stepPrevBtn.disabled = !hasHistory || this.viewMoveIndex === 0;
    this.stepNextBtn.disabled = !hasHistory || this.viewMoveIndex === -1;
    this.stepLastBtn.disabled = !hasHistory || this.viewMoveIndex === -1;
  }

  navigateToMove(index) {
    if (this.game.history.length === 0) return;
    if (index >= this.game.history.length || index < -1) return;

    this.viewMoveIndex = index;
    this.selectedSquare = null;
    this.currentLegalMoves = [];
    this.render();
    this.updateMoveList();
  }

  getBoardAtMoveIndex(targetIndex) {
    const tempEngine = new ChessEngine();
    for (let i = 0; i <= targetIndex; i++) {
      tempEngine.makeMove(this.game.history[i].move);
    }
    return tempEngine.board;
  }

  getLastMove() {
    if (this.viewMoveIndex !== -1 && this.viewMoveIndex < this.game.history.length) {
      return this.game.history[this.viewMoveIndex].move;
    }
    return this.game.history.length > 0 ? this.game.history[this.game.history.length - 1].move : null;
  }

  updateCapturedPieces() {
    const captured = this.game.getCapturedPieces();
    const score = this.game.getMaterialScore(); // Positive favors White, Negative favors Black

    // White trophies = Black pieces captured by White
    // Black trophies = White pieces captured by Black
    const whiteTrophies = captured.b;
    const blackTrophies = captured.w;

    const isTopWhite = this.isBoardFlipped;
    const topTrophies = isTopWhite ? whiteTrophies : blackTrophies;
    const topTrophyColor = isTopWhite ? 'b' : 'w';
    const topScoreDiff = isTopWhite ? score : -score;

    const bottomTrophies = isTopWhite ? blackTrophies : whiteTrophies;
    const bottomTrophyColor = isTopWhite ? 'w' : 'b';
    const bottomScoreDiff = isTopWhite ? -score : score;

    this.renderCapturedList(this.topCapturedEl, topTrophies, topTrophyColor, topScoreDiff);
    this.renderCapturedList(this.bottomCapturedEl, bottomTrophies, bottomTrophyColor, bottomScoreDiff);
  }

  renderCapturedList(element, pieces, pieceColor, diff) {
    element.innerHTML = '';
    const counts = {};
    pieces.forEach(p => { counts[p] = (counts[p] || 0) + 1; });

    ['q', 'r', 'b', 'n', 'p'].forEach(type => {
      if (counts[type]) {
        for (let i = 0; i < counts[type]; i++) {
          const pieceSpan = document.createElement('span');
          pieceSpan.className = 'captured-piece';
          const pCode = pieceColor + type.toUpperCase();
          pieceSpan.innerHTML = CHESS_PIECE_SVGS[pCode] || '';
          element.appendChild(pieceSpan);
        }
      }
    });

    if (diff > 0) {
      const diffBadge = document.createElement('span');
      diffBadge.className = 'material-diff';
      diffBadge.textContent = `+${diff}`;
      element.appendChild(diffBadge);
    }
  }

  openExportModal() {
    document.getElementById('fenTextArea').value = this.game.getFEN();
    document.getElementById('pgnTextArea').value = this.game.getPGN({
      White: this.gameMode === 'ai' ? (this.userColor === 'w' ? 'You' : 'AI Bot') : 'Player 1',
      Black: this.gameMode === 'ai' ? (this.userColor === 'b' ? 'You' : 'AI Bot') : 'Player 2'
    });
    this.exportModal.classList.add('open');
  }

  loadCustomFEN() {
    const fen = document.getElementById('fenTextArea').value.trim();
    if (this.game.loadFEN(fen)) {
      this.exportModal.classList.remove('open');
      this.selectedSquare = null;
      this.currentLegalMoves = [];
      this.viewMoveIndex = -1;
      this.render();
      this.updateMoveList();
      this.updateStatus();
      this.showToast('Custom FEN loaded successfully');
    } else {
      alert('Invalid FEN notation format. Please verify and try again.');
    }
  }

  copyFEN() {
    const fen = document.getElementById('fenTextArea').value;
    navigator.clipboard.writeText(fen).then(() => {
      this.showToast('FEN copied to clipboard!');
    });
  }

  copyPGN() {
    const pgn = document.getElementById('pgnTextArea').value;
    navigator.clipboard.writeText(pgn).then(() => {
      this.showToast('PGN copied to clipboard!');
    });
  }

  showToast(message) {
    this.toastEl.textContent = message;
    this.toastEl.classList.add('show');
    setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 2400);
  }
}

// Instantiate application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.chessApp = new ChessApp();
});
