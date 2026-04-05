# Rock Paper Scissors: Hexagonal Strategy — UX Rewrite Spec

## Overview

Complete visual and UX overhaul of the hexagonal Rock-Paper-Scissors strategy game. Adds 4 switchable visual skins, sidebar HUD layout, bilingual support (EN/RU), animated title/tutorial/game-over screens, a canvas particle system, and punchy-to-dramatic animations throughout.

Game logic (hex grid, neighbor calculation, capture rules, difficulty scaling) is preserved from the current implementation.

## File Structure

```
index.html          — shell: screen containers, sidebar skeleton, canvas overlay
styles.css          — base layout + 4 theme skins via CSS custom properties
script.js           — game engine (board state, turns, clearing logic)
ui.js               — UI controller (screens, animations, skin switching, sidebar)
particles.js        — canvas-based particle and effect system
i18n.js             — EN/RU string maps + language toggle logic
```

No build tools, no framework. Vanilla JS + CSS custom properties.

## Skin System

### Implementation

- `<body data-theme="neon|elegant|modern|fantasy">` toggles all visuals
- Each theme defines ~20 CSS custom properties:
  - `--bg`, `--bg-gradient` — page background
  - `--surface`, `--surface-elevated` — panels, sidebar
  - `--text`, `--text-muted` — typography colors
  - `--accent`, `--accent-dim`, `--accent-glow` — primary highlight
  - `--hex-empty`, `--hex-fill`, `--hex-edge`, `--hex-hover` — hex cell colors
  - `--particle-primary`, `--particle-secondary` — effect colors
  - `--btn-gradient`, `--btn-text` — button styling
  - `--overlay-bg` — modal backdrop
- Particle system reads CSS variables to match theme colors
- Skin selector: 4 colored dots in sidebar, click to switch. Active dot gets a ring.
- Persisted to `localStorage` key `scipaprock_theme`

### Theme Definitions

**Neon Arcade**: Deep navy/purple background, hot pink + cyan accents, neon glow on hexes, scanline overlay on board, monospace accent font.

**Elegant Minimalist**: Cream/warm white background, dark text, gold accents, serif heading font (Georgia), subtle shadows instead of glows, thin gold hex borders.

**Modern Gaming UI**: Dark blue-gray (#1b2838 → #2a475e), ice-blue accent (#66c0f4), system-ui font, clean borders, top accent line on panels.

**Dark Fantasy**: Near-black with deep purple (#2d1f3d → #0d0a14), crimson accent (#ff4d6d), bold condensed headings, dramatic gradients, hex cells have inner glow.

## Layout: Sidebar HUD

### Desktop (>= 768px)

```
┌──────────┬─────────────────────────────┐
│ SIDEBAR  │                             │
│ (220px)  │         HEX BOARD           │
│          │        (centered)           │
│ Logo     │                             │
│ Score    │                             │
│ Best     │                             │
│ Diff     │                             │
│          │                             │
│ [Rock]   │                             │
│ [Scissor]│                             │
│ [Paper]  │                             │
│          │                             │
│ Status   │                             │
│          │                             │
│ ── ── ── │                             │
│ 🔊 EN/RU │                             │
│ ● ● ● ● │                             │
└──────────┴─────────────────────────────┘
```

- Sidebar: fixed 220px, flex column, full viewport height
- Top section: game title (themed), score display, best score, difficulty badge
- Middle section: item picker — 3 buttons stacked vertically, selected state with accent border + glow
- Status text: "Your turn" / "Computer placing..." / "Pick a weapon first"
- Bottom section: volume toggle, language toggle (EN/RU with flag icons), skin selector dots
- Main area: remaining width, hex board centered both axes
- Canvas overlay: absolute-positioned over the board area for particle effects

### Mobile (< 768px)

- Sidebar collapses to a fixed bottom bar (56px)
- Bottom bar contains: item picker (3 horizontal buttons), hamburger menu icon
- Hamburger opens a slide-up panel with: score, settings, skin selector, language toggle
- Board takes full width above the bottom bar
- Title and score shown as a thin top bar

## Screens

### 1. Title Screen

- Full-screen overlay over the game
- Animated background: slowly drifting hex shapes (CSS animations, not canvas — lightweight)
- Game title with theme-appropriate styling (neon glow / gold serif / clean sans / dramatic gradient)
- Subtitle: "Hexagonal Strategy" (localized)
- "Play" button with breathing pulse animation
- 4 skin preview thumbnails at bottom — clickable to set theme before starting
- Language toggle visible
- Fade-out transition when Play is clicked (300ms)

### 2. Tutorial (First Play)

Triggered on first visit (tracked via `localStorage` key `scipaprock_tutorial_done`).

3-step overlay walkthrough with spotlight effect (dim everything except highlighted area):

- **Step 1**: Spotlight on item picker. Text: "Choose your weapon — rock, scissors, or paper." Arrow pointing to the buttons.
- **Step 2**: Spotlight on hex grid. Text: "Place it on any empty hex on the board." Animated cursor mockup clicking a cell.
- **Step 3**: Full board visible. Text: "Your piece captures adjacent enemies — but only if no counter is nearby." Animated example: rock next to scissors (no paper nearby) → scissors cleared with particle burst.

Navigation: "Next" button, "Skip" button. Step indicators (dots).

After completion or skip, game starts normally (computer makes first move).

### 3. Game Over Screen

- Overlay with dramatic entrance (scale up from center, 400ms)
- "Game Over" title with theme styling
- Score with count-up animation (0 → final score over 1.5s, easing)
- If new best score: golden flash effect + "New Record!" text with bounce
- Stats row: pieces placed | pieces cleared | turns survived (tracked in game engine)
- "Play Again" button with pulse
- Skin selector visible (can switch before replaying)
- Fade-out on restart

## Animations & Effects

### Piece Placement
- Hex cell: brief ripple (CSS radial gradient animation, 300ms)
- Piece image: scale(0.3) → scale(1.08) → scale(1) with opacity 0→1 (250ms, cubic-bezier overshoot)
- Player pieces: accent-colored ring (current green outline, themed)

### Piece Selection (Item Picker)
- Selected button: border becomes accent, background becomes accent-dim, subtle glow shadow
- Other buttons: dim slightly (opacity 0.6)
- Transition: 200ms ease

### Capture / Clear
- Cleared hex: particle burst — 12-18 particles radiating outward, colors from theme variables, fade out over 600ms
- Chain lightning: if multiple hexes cleared, thin glowing line connects them briefly (canvas, 400ms)
- Screen shake: translateX/Y oscillation on the board container (±3px, 200ms, 3 cycles)
- Cleared piece: shrink + rotate + blur out (current animation, kept)

### Combo (3+ cleared at once)
- Floating text: "+N COMBO!" rises from board center, scales up, fades (800ms)
- Enhanced particle burst: 2x particle count, larger spread
- Brief flash overlay on board (white at 10% opacity, 150ms)

### Computer Turn
- Pieces appear sequentially with 200ms stagger delay (not all at once)
- Each piece pops in with the standard placement animation
- Sidebar status shows "Computer is thinking..." with animated dots

### Hover
- Hex cells: scale(1.06), elevated shadow, accent glow border (themed)
- Only on empty cells when an item is selected
- Cursor changes to pointer on valid cells

### Screen Transitions
- Title → Game: fade out title (300ms), sidebar slides in from left (400ms)
- Game → Game Over: board dims (200ms), overlay scales in (400ms)
- Game Over → Game: overlay fades out (300ms), board resets with stagger animation

## Sound Design

### Sound Sources
- Reuse `button_click.mp3` as `ui_click` sound
- Reuse `victory.mp3` as `capture` sound
- Generate remaining sounds via Web Audio API (oscillator + gain envelope):
  - `select`: short 800Hz sine ping, 80ms, fast decay
  - `place`: 200Hz square wave thud, 120ms, medium decay + noise burst
  - `combo`: ascending arpeggio (C5-E5-G5), 100ms each, triangle wave
  - `gameover`: descending minor chord (Am), 600ms, slow decay
  - `newrecord`: ascending major chord (C-E-G-C), 400ms, bright triangle wave

### Audio Manager
- `audio.js` or integrated in `ui.js`
- `playSound(name)` function — looks up sound, respects mute state
- Web Audio API context created on first user interaction
- Mute toggle in sidebar, saved to `localStorage` key `scipaprock_muted`

## i18n

### Implementation
- `i18n.js` exports:
  - `strings` object: `{ en: { title: "Rock Paper Scissors", ... }, ru: { title: "Камень Ножницы Бумага", ... } }`
  - `t(key)` function: returns string for current language
  - `setLang(code)` / `getLang()`: getter/setter, persisted to `localStorage` key `scipaprock_lang`
- All visible text in HTML uses `data-i18n="key"` attributes
- `applyLang()` function: queries all `[data-i18n]` elements, sets `textContent = t(el.dataset.i18n)`
- Called on page load, language switch, and screen transitions
- Default language: detect from `navigator.language` (starts with "ru" → RU, else EN)

### String Keys (partial list)
- `title`, `subtitle`, `play`, `play_again`, `game_over`, `new_record`
- `score`, `best_score`, `difficulty`, `your_turn`, `computer_thinking`, `pick_weapon`
- `tutorial_step1`, `tutorial_step2`, `tutorial_step3`, `skip`, `next`
- `stone`, `scissors`, `paper`
- `cell_empty`, `cell_occupied`
- `easy`, `medium`, `hard`, `very_hard`
- `pieces_placed`, `pieces_cleared`, `turns_survived`
- `combo` (with `{n}` placeholder for count)

## Game Engine Changes

Minimal changes to current `script.js`:

- Extract board state and logic into clean functions (no DOM coupling)
- Add tracking for: `turnsPlayed`, `totalPlaced`, `totalCleared` (for game-over stats)
- Expose events/callbacks for UI layer:
  - `onPiecePlaced(row, col, item, isPlayer)`
  - `onPiecesCleared(cells[])`
  - `onComputerTurnStart()` / `onComputerTurnEnd()`
  - `onGameOver(stats)`
- Computer turn placement uses `async` with stagger delays (already async, just add delay between placements)
- Keep all existing logic: grid size (10), neighbor calculation, capture rules, difficulty scaling

## localStorage Keys

| Key | Values | Default |
|-----|--------|---------|
| `scipaprock_theme` | `neon`, `elegant`, `modern`, `fantasy` | `neon` |
| `scipaprock_lang` | `en`, `ru` | browser detect |
| `scipaprock_muted` | `true`, `false` | `false` |
| `scipaprock_tutorial_done` | `true` | absent |
| `scipaprock_best_score` | number | `0` |

## Browser Support

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge — last 2 versions)
- CSS clip-path for hexagons (already used)
- Web Audio API for synthesized sounds
- CSS custom properties for theming
- `prefers-reduced-motion`: disable particles, screen shake, use instant transitions
