# ♟️ Offline Chess Master

A feature-rich, high-performance, and 100% offline chess application built with modern web technologies. Designed with rich glassmorphism aesthetics, intelligent AI with 4 difficulty levels, interactive 2-player pass & play, full FIDE rules engine, procedural audio effects, and zero external dependencies.

---

## 🌟 Key Features

### 1. 🛡️ 100% Zero-Dependency & Offline Guaranteed
- **Embedded Vector Graphics**: High-definition Staunton SVGs embedded directly in the codebase—sharp and crisp on any display scale without downloading external images.
- **Web Audio API Procedural Sound**: Tactile piece moves, captures, checks, castling, victory fanfares, and ticking low-time warnings generated purely through mathematics and browser audio synthesizers. No external MP3/WAV files needed.
- **Local Storage Memory**: Remembers your preferred board theme and sound preferences across sessions.

### 2. 🧠 Smart Multi-Tier AI Engine
- **Minimax with Alpha-Beta Pruning**: Deep positional evaluation and tree search.
- **Quiescence Search**: Resolves volatile capture sequences to avoid the horizon effect.
- **Piece-Square Tables (PST)**: Contextual square values for center control, piece mobility, pawn structures, and king safety.
- **MVV-LVA Move Ordering**: Most Valuable Victim - Least Valuable Attacker heuristic ensures rapid pruning and fast response times.
- **4 Configurable AI Tiers**:
  1. **Novice (~800 ELO)**: Fast, friendly for beginners, with a gentle capture bias.
  2. **Casual (~1200 ELO)**: 1-ply tactical search with piece-square positional evaluation.
  3. **Club (~1600 ELO)**: 2-ply minimax search with alpha-beta pruning and tactical awareness.
  4. **Master (~2000 ELO)**: 3-4 ply minimax search with quiescence capture analysis.

### 3. ⚖️ Complete FIDE Chess Rules
- **Castling**: Kingside (`O-O`) and Queenside (`O-O-O`) with path and attack checks.
- **En Passant**: Accurate one-turn expiration and pawn removal.
- **Pawn Promotion**: Interactive selection modal (Queen, Rook, Bishop, Knight).
- **Draw Conditions**: Stalemate, Insufficient Material (K vs K, K+B vs K, K+N vs K, K+B vs K+B same color), 50-Move rule, and Threefold repetition.
- **Standard Algebraic Notation (SAN)**: Full disambiguation (e.g. `Rad1`, `Nbd7`, `Bxf7+`, `Qxd8#`).

### 4. 🎨 Visual Excellence & Themes
- **Themes**:
  - 🌿 **Emerald Classic**: Elegant tournament green & ivory.
  - 🌌 **Slate OLED**: High-contrast, cool monochromatic dark aesthetic.
  - 🪵 **Walnut Timber**: Warm mahogany and honey maple wood grain.
  - ⚡ **Cyberpunk Neon**: Radiant ultraviolet and electric cyan glow.
- **Highlights & Indicators**:
  - Selected piece highlight.
  - Last move start and destination squares.
  - Radial red pulse on king in check.
  - Subtle destination dots for empty legal squares and red targeting rings on captures.
- **Trophy Graveyard & Material Delta**: Displays captured pieces for both sides with live calculated advantage (`+1`, `+3`, etc.).

### 5. ⏱️ Match Formats & Chess Clocks
- **Formats**: Casual (No clock), Bullet 1 min, Blitz 3|2, Blitz 5|3, Rapid 10 min, Rapid 15|10.
- **Dynamic Clock Pulsation**: Ticking warning and glowing red animation when time drops below 30 seconds.

### 6. 📁 Move History & Data Export
- Step backward and forward through past moves using navigation buttons (`<<`, `<`, `>`, `>>`) or keyboard arrows.
- Click any move in the history log to preview that position.
- Export and import FEN strings or copy the complete match in standard PGN format.

---

## 🚀 How to Run

### Method 1: Standalone Native Executable (`OfflineChess.exe`) ⭐ Recommended
Simply double-click [`OfflineChess.exe`](file:///C:/Users/Anubhav/.gemini/antigravity-ide/scratch/offline-chess/OfflineChess.exe).
- **Standalone single-file executable**: Everything (rules, AI engine, SVG graphics, procedural sounds, HTML/CSS) is packaged inside.
- **Dedicated desktop window**: Runs without browser tabs, bookmarks, or URL bars—feels just like a native Windows desktop app.
- **Custom Icon**: Features the embedded high-resolution chess icon.

### Method 2: Instant Native Launcher (`OfflineChess_Fast.exe`)
Double-click [`OfflineChess_Fast.exe`](file:///C:/Users/Anubhav/.gemini/antigravity-ide/scratch/offline-chess/OfflineChess_Fast.exe).
- Ultra-lightweight (12 KB) native C# executable compiled with zero startup delay.

### Method 3: Windows Batch Launcher
Double-click [`run_offline_chess.bat`](file:///C:/Users/Anubhav/.gemini/antigravity-ide/scratch/offline-chess/run_offline_chess.bat).

### Method 4: Direct Browser
Open [`index.html`](file:///C:/Users/Anubhav/.gemini/antigravity-ide/scratch/offline-chess/index.html) in any browser.

---

## ⌨️ Keyboard Shortcuts
| Key | Action |
| --- | --- |
| `Z` or `Ctrl+Z` | Take back / Undo last move |
| `F` | Flip board perspective (White / Black) |
| `N` | Start a new game |
| `←` / `→` | Step back / forward through move history |
