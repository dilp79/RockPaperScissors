# UX Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete visual and UX overhaul — 4 switchable skins, sidebar HUD, bilingual EN/RU, animated screens, canvas particles, punchy animations, synthesized sounds.

**Architecture:** Vanilla JS modules loaded via `<script>` tags (no bundler). Game engine (`script.js`) decoupled from DOM via callbacks. UI layer (`ui.js`) orchestrates screens, animations, and wires engine events to visual effects. CSS custom properties drive theming.

**Tech Stack:** HTML5, CSS3 custom properties, vanilla ES6+ JS, Web Audio API, Canvas 2D.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `i18n.js` | Create | EN/RU string maps, `t()` function, language toggle |
| `audio.js` | Create | Web Audio API synth sounds, mp3 playback, mute toggle |
| `particles.js` | Create | Canvas particle bursts, chain lightning, combo text |
| `script.js` | Rewrite | Game engine: board state, turns, clearing — no DOM |
| `styles.css` | Rewrite | Base layout + 4 theme skins via CSS custom properties |
| `index.html` | Rewrite | Sidebar HUD shell, screen overlays, canvas layer |
| `ui.js` | Create | Screen manager, animations, skin switching, DOM binding |

---

### Task 1: i18n Module

**Files:**
- Create: `i18n.js`

- [ ] **Step 1: Create `i18n.js` with full string maps and API**

```js
// i18n.js — Internationalization module
(function () {
  const STORAGE_KEY = 'scipaprock_lang';

  const strings = {
    en: {
      title: 'Rock Paper Scissors',
      subtitle: 'Hexagonal Strategy',
      play: 'Play',
      play_again: 'Play Again',
      game_over: 'Game Over',
      new_record: 'New Record!',
      score: 'Score',
      best_score: 'Best',
      difficulty: 'Difficulty',
      your_turn: 'Choose a weapon and place it on the board',
      computer_thinking: 'Computer is thinking',
      pick_weapon: 'Pick a weapon first',
      cell_occupied: 'Cell is occupied. Choose an empty one.',
      selected_item: 'Selected: {item}. Click a hex to place.',
      stone: 'Rock',
      scissors: 'Scissors',
      paper: 'Paper',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      very_hard: 'Very Hard',
      pieces_placed: 'Placed',
      pieces_cleared: 'Cleared',
      turns_survived: 'Turns',
      combo: 'COMBO x{n}!',
      tutorial_step1_title: 'Choose Your Weapon',
      tutorial_step1: 'Pick rock, scissors, or paper from the sidebar.',
      tutorial_step2_title: 'Place It',
      tutorial_step2: 'Click any empty hex on the board.',
      tutorial_step3_title: 'Capture Enemies',
      tutorial_step3: 'Your piece removes adjacent losers — but only if no counter is nearby.',
      skip: 'Skip',
      next: 'Next',
      prev: 'Back',
      mute: 'Sound',
      language: 'Language',
      skins: 'Theme',
      figures_word: 'figures',
      computer_places: 'Computer places {n} figures...',
    },
    ru: {
      title: 'Камень Ножницы Бумага',
      subtitle: 'Шестиугольная Стратегия',
      play: 'Играть',
      play_again: 'Играть снова',
      game_over: 'Игра окончена',
      new_record: 'Новый рекорд!',
      score: 'Счёт',
      best_score: 'Рекорд',
      difficulty: 'Сложность',
      your_turn: 'Выберите фигуру и поставьте на поле',
      computer_thinking: 'Компьютер думает',
      pick_weapon: 'Сначала выберите фигуру',
      cell_occupied: 'Клетка занята. Выберите пустую.',
      selected_item: 'Выбрано: {item}. Нажмите на клетку.',
      stone: 'Камень',
      scissors: 'Ножницы',
      paper: 'Бумага',
      easy: 'Лёгкая',
      medium: 'Средняя',
      hard: 'Сложная',
      very_hard: 'Очень сложная',
      pieces_placed: 'Поставлено',
      pieces_cleared: 'Убрано',
      turns_survived: 'Ходов',
      combo: 'КОМБО x{n}!',
      tutorial_step1_title: 'Выберите фигуру',
      tutorial_step1: 'Выберите камень, ножницы или бумагу на панели.',
      tutorial_step2_title: 'Поставьте на поле',
      tutorial_step2: 'Нажмите на любую пустую клетку.',
      tutorial_step3_title: 'Захватывайте',
      tutorial_step3: 'Ваша фигура убирает проигрывающих соседей — если рядом нет того, кто бьёт вас.',
      skip: 'Пропустить',
      next: 'Далее',
      prev: 'Назад',
      mute: 'Звук',
      language: 'Язык',
      skins: 'Тема',
      figures_word: 'фигур',
      computer_places: 'Компьютер ставит {n} фигур...',
    }
  };

  let currentLang = 'en';

  function detectLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'ru') return saved;
    } catch (e) { /* ignore */ }
    return (navigator.language || '').startsWith('ru') ? 'ru' : 'en';
  }

  function t(key, params) {
    const str = (strings[currentLang] && strings[currentLang][key]) || strings.en[key] || key;
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => params[k] !== undefined ? params[k] : `{${k}}`);
  }

  function setLang(code) {
    if (code !== 'en' && code !== 'ru') return;
    currentLang = code;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }
    applyLang();
  }

  function getLang() { return currentLang; }

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    document.documentElement.lang = currentLang;
  }

  function init() {
    currentLang = detectLang();
    applyLang();
  }

  window.I18n = { t, setLang, getLang, init, applyLang };
})();
```

- [ ] **Step 2: Commit**

```bash
git add i18n.js
git commit -m "feat: add i18n module with EN/RU string maps"
```

---

### Task 2: Audio Module

**Files:**
- Create: `audio.js`

- [ ] **Step 1: Create `audio.js` with Web Audio API synth + mp3 playback**

```js
// audio.js — Sound manager with Web Audio API synthesis
(function () {
  const STORAGE_KEY = 'scipaprock_muted';
  let ctx = null;
  let muted = false;

  // Preloaded mp3 buffers
  const mp3Buffers = {};
  const mp3Files = {
    ui_click: 'button_click.mp3',
    capture: 'victory.mp3',
  };

  function ensureContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  async function loadMp3(name, url) {
    try {
      const resp = await fetch(url);
      const buf = await resp.arrayBuffer();
      mp3Buffers[name] = await ensureContext().decodeAudioData(buf);
    } catch (e) { /* fail silently */ }
  }

  function playBuffer(buffer, volume) {
    const c = ensureContext();
    const src = c.createBufferSource();
    const gain = c.createGain();
    gain.gain.value = volume || 0.5;
    src.buffer = buffer;
    src.connect(gain).connect(c.destination);
    src.start();
  }

  // Synth sound definitions
  function synthSelect() {
    const c = ensureContext();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.08);
  }

  function synthPlace() {
    const c = ensureContext();
    const osc = c.createOscillator();
    const noise = c.createOscillator();
    const gain = c.createGain();
    const noiseGain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = 200;
    gain.gain.setValueAtTime(0.2, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.12);
    noise.type = 'sawtooth';
    noise.frequency.value = 80;
    noiseGain.gain.setValueAtTime(0.08, c.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
    noise.connect(noiseGain).connect(c.destination);
    noise.start();
    noise.stop(c.currentTime + 0.06);
  }

  function synthCombo() {
    const c = ensureContext();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = c.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  function synthGameover() {
    const c = ensureContext();
    const notes = [440, 349.23, 293.66]; // A4, F4, D4
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = c.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  }

  function synthNewrecord() {
    const c = ensureContext();
    const notes = [261.63, 329.63, 392, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = c.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  const synthSounds = {
    select: synthSelect,
    place: synthPlace,
    combo: synthCombo,
    gameover: synthGameover,
    newrecord: synthNewrecord,
  };

  function play(name) {
    if (muted) return;
    if (mp3Buffers[name]) {
      playBuffer(mp3Buffers[name], 0.5);
      return;
    }
    if (synthSounds[name]) {
      synthSounds[name]();
      return;
    }
  }

  function setMuted(val) {
    muted = !!val;
    try { localStorage.setItem(STORAGE_KEY, muted ? 'true' : 'false'); } catch (e) { /* ignore */ }
  }

  function isMuted() { return muted; }

  function toggleMute() {
    setMuted(!muted);
    return muted;
  }

  async function init() {
    try {
      muted = localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) { /* ignore */ }
    for (const [name, url] of Object.entries(mp3Files)) {
      loadMp3(name, url);
    }
  }

  window.Audio = { play, setMuted, isMuted, toggleMute, init, ensureContext };
})();
```

- [ ] **Step 2: Commit**

```bash
git add audio.js
git commit -m "feat: add audio module with Web Audio API synth sounds"
```

---

### Task 3: Particle System

**Files:**
- Create: `particles.js`

- [ ] **Step 1: Create `particles.js` with particle bursts, chain lightning, combo text**

```js
// particles.js — Canvas-based particle and effect system
(function () {
  let canvas = null;
  let ctx = null;
  let particles = [];
  let lightnings = [];
  let floatingTexts = [];
  let animId = null;
  let running = false;

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  function getThemeColors() {
    const style = getComputedStyle(document.body);
    return {
      primary: style.getPropertyValue('--particle-primary').trim() || '#5cdb95',
      secondary: style.getPropertyValue('--particle-secondary').trim() || '#ffb86c',
    };
  }

  // --- Particles ---
  function burst(x, y, count, spread) {
    const colors = getThemeColors();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    for (let i = 0; i < (count || 15); i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = (spread || 80) * (0.5 + Math.random() * 0.5);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? colors.primary : colors.secondary,
      });
    }
    ensureRunning();
  }

  // --- Chain Lightning ---
  function lightning(points) {
    const colors = getThemeColors();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || points.length < 2) return;
    lightnings.push({
      points,
      life: 1,
      decay: 0.04,
      color: colors.primary,
      width: 2,
    });
    ensureRunning();
  }

  // --- Floating Combo Text ---
  function comboText(x, y, text) {
    const colors = getThemeColors();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    floatingTexts.push({
      x, y,
      text,
      life: 1,
      decay: 0.012,
      color: colors.secondary,
      scale: 0.5,
      targetScale: 1.2,
    });
    ensureRunning();
  }

  // --- Flash overlay ---
  let flashAlpha = 0;
  function flash() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    flashAlpha = 0.1;
    ensureRunning();
  }

  // --- Animation loop ---
  function ensureRunning() {
    if (running) return;
    running = true;
    animId = requestAnimationFrame(tick);
  }

  function tick(time) {
    if (!ctx || !canvas) { running = false; return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Flash
    if (flashAlpha > 0.001) {
      ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      flashAlpha *= 0.85;
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lightning
    for (let i = lightnings.length - 1; i >= 0; i--) {
      const l = lightnings[i];
      l.life -= l.decay;
      if (l.life <= 0) { lightnings.splice(i, 1); continue; }
      ctx.globalAlpha = l.life;
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.width * l.life;
      ctx.shadowColor = l.color;
      ctx.shadowBlur = 8 * l.life;
      ctx.beginPath();
      for (let j = 0; j < l.points.length; j++) {
        const pt = l.points[j];
        // Add jitter for electric feel
        const jx = pt.x + (Math.random() - 0.5) * 4 * l.life;
        const jy = pt.y + (Math.random() - 0.5) * 4 * l.life;
        if (j === 0) ctx.moveTo(jx, jy);
        else ctx.lineTo(jx, jy);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Floating text
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.life -= ft.decay;
      ft.y -= 0.8;
      ft.scale += (ft.targetScale - ft.scale) * 0.1;
      if (ft.life <= 0) { floatingTexts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(ft.life * 2, 1);
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${Math.round(24 * ft.scale)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;

    // Continue or stop
    if (particles.length || lightnings.length || floatingTexts.length || flashAlpha > 0.001) {
      animId = requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }

  function clear() {
    particles = [];
    lightnings = [];
    floatingTexts = [];
    flashAlpha = 0;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  window.Particles = { init, resize, burst, lightning, comboText, flash, clear };
})();
```

- [ ] **Step 2: Commit**

```bash
git add particles.js
git commit -m "feat: add canvas particle system with bursts, lightning, combo text"
```

---

### Task 4: Game Engine Refactor

**Files:**
- Rewrite: `script.js`

The engine must be fully decoupled from the DOM. It manages board state and game rules only, emitting callbacks for the UI layer.

- [ ] **Step 1: Rewrite `script.js` as a pure logic engine**

```js
// script.js — Game engine (no DOM)
(function () {
  const GRID_SIZE = 10;
  const ITEMS = ['stone', 'scissors', 'paper'];
  const STORAGE_KEY = 'scipaprock_best_score';

  let gameBoard = [];
  let playerCells = [];
  let score = 0;
  let bestScore = 0;
  let gameOver = false;
  let gameStarted = false;
  let turnBusy = false;
  let stats = { turnsPlayed: 0, totalPlaced: 0, totalCleared: 0 };

  // Callbacks — set by UI layer
  let callbacks = {
    onPiecePlaced: null,      // (row, col, item, isPlayer)
    onPiecesCleared: null,    // (cells[])
    onComputerTurnStart: null,// ()
    onComputerTurnEnd: null,  // ()
    onGameOver: null,         // ({score, bestScore, isNewRecord, stats})
    onScoreChanged: null,     // (score, bestScore)
    onDifficultyChanged: null,// (label, count)
    onStatusChanged: null,    // (messageKey, params)
  };

  function emit(name, ...args) {
    if (callbacks[name]) callbacks[name](...args);
  }

  function loadBestScore() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v !== null ? parseInt(v, 10) : 0;
    } catch (e) { return 0; }
  }

  function saveBestScore() {
    try { localStorage.setItem(STORAGE_KEY, String(bestScore)); } catch (e) { /* ignore */ }
  }

  function getNeighbors(row, col) {
    const isEvenRow = row % 2 === 0;
    const neighbors = [
      { row: row - 1, col: isEvenRow ? col - 1 : col },
      { row: row - 1, col: isEvenRow ? col : col + 1 },
      { row: row, col: col - 1 },
      { row: row, col: col + 1 },
      { row: row + 1, col: isEvenRow ? col - 1 : col },
      { row: row + 1, col: isEvenRow ? col : col + 1 },
    ];
    return neighbors.filter(
      n => n.row >= 0 && n.row < GRID_SIZE && n.col >= 0 && n.col < GRID_SIZE
    );
  }

  function beats(a, b) {
    return (a === 'stone' && b === 'scissors') ||
           (a === 'scissors' && b === 'paper') ||
           (a === 'paper' && b === 'stone');
  }

  function getEmptyCells() {
    const empty = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (gameBoard[r][c] === null) empty.push({ row: r, col: c });
      }
    }
    return empty;
  }

  function isBoardFull() {
    return getEmptyCells().length === 0;
  }

  function getDifficulty() {
    if (score >= 60) return { label: 'very_hard', count: 6 };
    if (score >= 40) return { label: 'hard', count: 5 };
    if (score >= 20) return { label: 'medium', count: 4 };
    return { label: 'easy', count: 3 };
  }

  function checkAndClear() {
    const cellsToClear = [];
    for (const pc of playerCells) {
      const { row, col } = pc;
      const currentItem = gameBoard[row][col];
      if (!currentItem) continue;
      const neighbors = getNeighbors(row, col);
      let hasWin = false;
      let hasLoss = false;
      for (const n of neighbors) {
        const ni = gameBoard[n.row][n.col];
        if (!ni) continue;
        if (beats(currentItem, ni)) hasWin = true;
        if (beats(ni, currentItem)) hasLoss = true;
      }
      if (hasWin && !hasLoss) {
        for (const n of neighbors) {
          const ni = gameBoard[n.row][n.col];
          if (ni && beats(currentItem, ni)) {
            cellsToClear.push(n);
          }
        }
      }
    }
    const unique = [...new Map(cellsToClear.map(c => [`${c.row}-${c.col}`, c])).values()];
    if (unique.length > 0) {
      for (const c of unique) {
        gameBoard[c.row][c.col] = null;
        playerCells = playerCells.filter(p => !(p.row === c.row && p.col === c.col));
      }
      score += unique.length;
      stats.totalCleared += unique.length;
      emit('onPiecesCleared', unique);
      emit('onScoreChanged', score, bestScore);
      const diff = getDifficulty();
      emit('onDifficultyChanged', diff.label, diff.count);
    }
    return unique.length;
  }

  function placeItem(row, col, item, isPlayer) {
    if (gameBoard[row][col] !== null) return false;
    gameBoard[row][col] = item;
    if (isPlayer) {
      playerCells.push({ row, col, item });
      stats.totalPlaced++;
    }
    emit('onPiecePlaced', row, col, item, isPlayer);
    return true;
  }

  function endGame() {
    gameOver = true;
    const isNewRecord = score > bestScore;
    if (isNewRecord) {
      bestScore = score;
      saveBestScore();
    }
    emit('onGameOver', { score, bestScore, isNewRecord, stats: { ...stats } });
  }

  async function computerTurn() {
    const diff = getDifficulty();
    emit('onComputerTurnStart');
    emit('onDifficultyChanged', diff.label, diff.count);
    emit('onStatusChanged', 'computer_places', { n: diff.count });

    let placed = 0;
    let attempts = 0;
    const maxAttempts = diff.count * 4;

    while (placed < diff.count && attempts < maxAttempts) {
      attempts++;
      if (isBoardFull()) { endGame(); return; }
      const empty = getEmptyCells();
      if (empty.length === 0) { endGame(); return; }
      const cell = empty[Math.floor(Math.random() * empty.length)];
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      if (placeItem(cell.row, cell.col, item, false)) {
        placed++;
        // Stagger delay for UI animation
        await new Promise(r => setTimeout(r, 200));
      }
    }

    checkAndClear();
    emit('onComputerTurnEnd');

    if (isBoardFull()) {
      endGame();
    } else {
      emit('onStatusChanged', 'your_turn');
    }
  }

  async function playerMove(row, col, item) {
    if (turnBusy || gameOver || !item) return false;
    if (gameBoard[row][col] !== null) {
      emit('onStatusChanged', 'cell_occupied');
      return false;
    }
    turnBusy = true;
    try {
      placeItem(row, col, item, true);
      stats.turnsPlayed++;
      checkAndClear();
      if (isBoardFull()) { endGame(); return true; }
      await computerTurn();
      return true;
    } finally {
      turnBusy = false;
    }
  }

  function initGame() {
    gameBoard = [];
    playerCells = [];
    score = 0;
    gameOver = false;
    turnBusy = false;
    stats = { turnsPlayed: 0, totalPlaced: 0, totalCleared: 0 };
    for (let r = 0; r < GRID_SIZE; r++) {
      gameBoard.push(new Array(GRID_SIZE).fill(null));
    }
    bestScore = loadBestScore();
    emit('onScoreChanged', score, bestScore);
    const diff = getDifficulty();
    emit('onDifficultyChanged', diff.label, diff.count);
  }

  async function startGame() {
    initGame();
    gameStarted = true;
    await computerTurn();
  }

  function setCallbacks(cbs) {
    Object.assign(callbacks, cbs);
  }

  function getBoard() { return gameBoard; }
  function getScore() { return score; }
  function getBestScore() { return bestScore; }
  function isGameOver() { return gameOver; }
  function isBusy() { return turnBusy; }
  function getGridSize() { return GRID_SIZE; }

  window.GameEngine = {
    setCallbacks, startGame, playerMove, getBoard, getScore, getBestScore,
    isGameOver, isBusy, getGridSize, getNeighbors, initGame,
  };
})();
```

- [ ] **Step 2: Commit**

```bash
git add script.js
git commit -m "refactor: decouple game engine from DOM, add callback system"
```

---

### Task 5: CSS Themes and Layout

**Files:**
- Rewrite: `styles.css`

- [ ] **Step 1: Rewrite `styles.css` with base layout + 4 theme skins**

This is a large file. Key sections:
1. Reset + base layout (sidebar HUD)
2. Theme custom properties (4 themes)
3. Sidebar styling
4. Hex grid styling
5. Screen overlays (title, tutorial, game over)
6. Animations (@keyframes)
7. Mobile responsive (< 768px)

```css
/* ===== RESET ===== */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

/* ===== THEME: NEON ARCADE (default) ===== */
[data-theme="neon"], :root {
  --bg: #0a0a2e;
  --bg-gradient: linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 40%, #2d1b69 100%);
  --surface: #1a1040;
  --surface-elevated: #251560;
  --text: #e8e0ff;
  --text-muted: #9a8cbf;
  --accent: #00ffff;
  --accent-dim: rgba(0, 255, 255, 0.12);
  --accent-glow: rgba(0, 255, 255, 0.4);
  --hex-empty: #1e1250;
  --hex-fill: #160e3a;
  --hex-edge: rgba(0, 255, 255, 0.25);
  --hex-hover: #2a1a70;
  --particle-primary: #00ffff;
  --particle-secondary: #ff0066;
  --btn-gradient: linear-gradient(135deg, #ff0066, #cc0052);
  --btn-text: #fff;
  --overlay-bg: rgba(5, 5, 20, 0.88);
  --heading-font: 'Courier New', monospace;
  --scanline: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px);
}

/* ===== THEME: ELEGANT MINIMALIST ===== */
[data-theme="elegant"] {
  --bg: #fef9ef;
  --bg-gradient: linear-gradient(180deg, #fef9ef 0%, #f5ead6 100%);
  --surface: #fff8ee;
  --surface-elevated: #f0e6d2;
  --text: #3a3028;
  --text-muted: #8a7a6a;
  --accent: #c4a874;
  --accent-dim: rgba(196, 168, 116, 0.15);
  --accent-glow: rgba(196, 168, 116, 0.3);
  --hex-empty: #efe4cf;
  --hex-fill: #f8f0e0;
  --hex-edge: rgba(196, 168, 116, 0.4);
  --hex-hover: #e8dcc4;
  --particle-primary: #c4a874;
  --particle-secondary: #8b6914;
  --btn-gradient: linear-gradient(135deg, #c4a874, #a88a50);
  --btn-text: #fff;
  --overlay-bg: rgba(254, 249, 239, 0.92);
  --heading-font: Georgia, 'Times New Roman', serif;
  --scanline: none;
}

/* ===== THEME: MODERN GAMING ===== */
[data-theme="modern"] {
  --bg: #1b2838;
  --bg-gradient: linear-gradient(135deg, #1b2838 0%, #2a475e 100%);
  --surface: #1e3044;
  --surface-elevated: #253d54;
  --text: #c7d5e0;
  --text-muted: #7a8fa0;
  --accent: #66c0f4;
  --accent-dim: rgba(102, 192, 244, 0.12);
  --accent-glow: rgba(102, 192, 244, 0.35);
  --hex-empty: #1e3348;
  --hex-fill: #18293a;
  --hex-edge: rgba(102, 192, 244, 0.3);
  --hex-hover: #2c4a65;
  --particle-primary: #66c0f4;
  --particle-secondary: #4fa3d6;
  --btn-gradient: linear-gradient(135deg, #66c0f4, #4fa3d6);
  --btn-text: #0e1c28;
  --overlay-bg: rgba(15, 22, 32, 0.9);
  --heading-font: system-ui, -apple-system, sans-serif;
  --scanline: none;
}

/* ===== THEME: DARK FANTASY ===== */
[data-theme="fantasy"] {
  --bg: #0d0a14;
  --bg-gradient: linear-gradient(135deg, #2d1f3d 0%, #1a1128 50%, #0d0a14 100%);
  --surface: #1a1228;
  --surface-elevated: #251a38;
  --text: #e8d8f0;
  --text-muted: #9a7eb5;
  --accent: #ff4d6d;
  --accent-dim: rgba(255, 77, 109, 0.12);
  --accent-glow: rgba(255, 77, 109, 0.4);
  --hex-empty: #201535;
  --hex-fill: #180f28;
  --hex-edge: rgba(255, 77, 109, 0.25);
  --hex-hover: #2d1a45;
  --particle-primary: #ff4d6d;
  --particle-secondary: #ff8fa3;
  --btn-gradient: linear-gradient(135deg, #ff4d6d, #cc3055);
  --btn-text: #fff;
  --overlay-bg: rgba(8, 5, 12, 0.9);
  --heading-font: system-ui, -apple-system, sans-serif;
  --scanline: none;
}

/* ===== BASE LAYOUT ===== */
html, body {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-gradient);
  color: var(--text);
  display: flex;
  line-height: 1.45;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 220px;
  min-width: 220px;
  height: 100vh;
  background: var(--surface);
  border-right: 1px solid var(--hex-edge);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  gap: 16px;
  overflow-y: auto;
  z-index: 20;
}

.sidebar-logo {
  font-family: var(--heading-font);
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.3;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-value.best {
  font-size: 1rem;
  color: var(--text-muted);
}

.difficulty-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--accent-dim);
  color: var(--accent);
  text-align: center;
}

/* ===== ITEM PICKER ===== */
.item-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 2px solid transparent;
  border-radius: 10px;
  background: var(--surface-elevated);
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, opacity 0.2s, box-shadow 0.2s;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
}

.item-btn img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.item-btn:hover {
  border-color: rgba(255,255,255,0.15);
}

.item-btn.selected {
  border-color: var(--accent);
  background: var(--accent-dim);
  box-shadow: 0 0 12px var(--accent-glow);
}

.item-btn:not(.selected) {
  opacity: 1;
}

.item-picker.has-selection .item-btn:not(.selected) {
  opacity: 0.5;
}

/* ===== STATUS ===== */
.status-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  text-align: center;
  min-height: 2.4em;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== SIDEBAR BOTTOM ===== */
.sidebar-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--hex-edge);
  padding-top: 12px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-btn {
  background: none;
  border: 1px solid var(--hex-edge);
  border-radius: 6px;
  color: var(--text);
  padding: 4px 10px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  font-family: inherit;
}

.toggle-btn:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.toggle-btn.active {
  background: var(--accent-dim);
  border-color: var(--accent);
}

/* ===== SKIN SELECTOR ===== */
.skin-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.skin-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}

.skin-dot:hover { transform: scale(1.15); }

.skin-dot.active {
  border-color: var(--text);
  box-shadow: 0 0 8px var(--accent-glow);
}

.skin-dot[data-skin="neon"] { background: linear-gradient(135deg, #0a0a2e, #00ffff); }
.skin-dot[data-skin="elegant"] { background: linear-gradient(135deg, #fef9ef, #c4a874); }
.skin-dot[data-skin="modern"] { background: linear-gradient(135deg, #1b2838, #66c0f4); }
.skin-dot[data-skin="fantasy"] { background: linear-gradient(135deg, #2d1f3d, #ff4d6d); }

/* ===== MAIN AREA ===== */
.main-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 16px;
}

.board-wrapper {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--hex-edge);
  border-radius: 12px;
  padding: clamp(12px, 2vw, 20px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.board-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: var(--scanline);
  pointer-events: none;
  z-index: 1;
}

#particleCanvas {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

/* ===== HEX GRID ===== */
.hex-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  --hex-w: clamp(32px, 6vw, 48px);
  --hex-h: calc(var(--hex-w) * 1.15);
  --row-overlap: calc(var(--hex-h) * -0.25);
  --row-shift: calc(var(--hex-w) * 0.51);
}

.hex-row {
  display: flex;
  justify-content: center;
  margin-bottom: var(--row-overlap);
  height: var(--hex-h);
}

.hex-row:nth-child(even) {
  margin-left: var(--row-shift);
}

/* ===== HEX CELL ===== */
.hex {
  -webkit-appearance: none;
  appearance: none;
  border: none;
  font: inherit;
  color: inherit;
  padding: 0;
  width: var(--hex-w);
  height: var(--hex-h);
  background: transparent;
  position: relative;
  margin: 0 1px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  isolation: isolate;
  filter: drop-shadow(0 0 0.5px var(--hex-edge));
}

.hex::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: linear-gradient(165deg, var(--hex-empty) 0%, var(--hex-fill) 100%);
  pointer-events: none;
}

.hex::after {
  content: '';
  position: absolute;
  inset: 2px;
  z-index: 0;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  border: 1px solid var(--hex-edge);
  opacity: 0.7;
  pointer-events: none;
}

.hex.empty:hover::before {
  background: linear-gradient(165deg, var(--hex-hover) 0%, var(--hex-fill) 100%);
}

.hex:hover {
  transform: scale(1.06);
  z-index: 10;
  filter: drop-shadow(0 0 4px var(--accent-glow));
}

.hex:focus { outline: none; }
.hex:focus-visible {
  z-index: 12;
  filter: drop-shadow(0 0 6px var(--accent-glow));
}

.hex img {
  position: relative;
  z-index: 1;
  width: 78%;
  height: 78%;
  object-fit: contain;
  pointer-events: none;
}

.hex img.player {
  filter: drop-shadow(0 0 6px var(--accent-glow));
  border-radius: 50%;
  outline: 2px solid var(--accent);
  outline-offset: -3px;
}

/* ===== HEX ANIMATIONS ===== */
.hex.ripple::before {
  animation: hexRipple 0.3s ease-out;
}

@keyframes hexRipple {
  0% { box-shadow: inset 0 0 0 0 var(--accent-glow); }
  50% { box-shadow: inset 0 0 20px 2px var(--accent-glow); }
  100% { box-shadow: inset 0 0 0 0 transparent; }
}

.hex.pop-in img {
  animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes popIn {
  0% { transform: scale(0.3); opacity: 0; }
  70% { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
}

.hex.is-clearing img {
  animation: pieceVanish 0.4s cubic-bezier(0.4, 0, 0.8, 0.45) forwards;
}

@keyframes pieceVanish {
  0% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0); }
  55% { opacity: 0.85; transform: scale(0.88) rotate(-6deg); }
  100% { opacity: 0; transform: scale(0.35) rotate(-14deg); filter: blur(2px); }
}

/* ===== SCREEN SHAKE ===== */
.board-wrapper.shake {
  animation: screenShake 0.2s ease-out;
}

@keyframes screenShake {
  0%, 100% { transform: translate(0, 0); }
  15% { transform: translate(-3px, 1px); }
  30% { transform: translate(3px, -2px); }
  45% { transform: translate(-2px, 2px); }
  60% { transform: translate(2px, -1px); }
  75% { transform: translate(-1px, 1px); }
}

/* ===== OVERLAYS ===== */
.overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.overlay.visible {
  opacity: 1;
  pointer-events: all;
}

.overlay-box {
  background: var(--surface);
  border: 1px solid var(--hex-edge);
  border-radius: 16px;
  padding: clamp(24px, 5vw, 40px);
  text-align: center;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
  transform: scale(0.9);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.overlay.visible .overlay-box {
  transform: scale(1);
}

.overlay-box h2 {
  font-family: var(--heading-font);
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.overlay-box p {
  color: var(--text-muted);
  margin-bottom: 6px;
  font-size: 0.95rem;
}

/* ===== TITLE SCREEN ===== */
.title-screen {
  z-index: 200;
}

.title-bg-hexes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.title-bg-hexes .float-hex {
  position: absolute;
  width: 60px;
  height: 69px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: var(--accent-dim);
  opacity: 0.3;
  animation: floatHex 20s ease-in-out infinite;
}

.title-bg-hexes .float-hex:nth-child(2) {
  width: 80px; height: 92px; left: 70%; top: 20%;
  animation-delay: -5s; animation-duration: 25s;
}
.title-bg-hexes .float-hex:nth-child(3) {
  width: 40px; height: 46px; left: 20%; top: 60%;
  animation-delay: -10s; animation-duration: 18s;
}
.title-bg-hexes .float-hex:nth-child(4) {
  width: 50px; height: 57px; left: 80%; top: 70%;
  animation-delay: -15s; animation-duration: 22s;
}
.title-bg-hexes .float-hex:nth-child(1) {
  left: 10%; top: 15%;
}

@keyframes floatHex {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-30px) rotate(5deg); }
  50% { transform: translateY(10px) rotate(-3deg); }
  75% { transform: translateY(-15px) rotate(2deg); }
}

.title-content {
  position: relative;
  z-index: 1;
}

.title-content h1 {
  font-family: var(--heading-font);
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 8px;
}

[data-theme="neon"] .title-content h1 {
  text-shadow: 0 0 20px var(--accent-glow), 0 0 40px var(--accent-dim);
}
[data-theme="fantasy"] .title-content h1 {
  background: linear-gradient(135deg, #ff4d6d, #ff8fa3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ===== BUTTONS ===== */
.btn-primary {
  display: inline-block;
  padding: 12px 32px;
  border: none;
  border-radius: 10px;
  background: var(--btn-gradient);
  color: var(--btn-text);
  font-size: 1.05rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s, box-shadow 0.15s;
  animation: pulse 2s ease-in-out infinite;
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-glow);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--accent-dim); }
  50% { box-shadow: 0 0 0 8px transparent; }
}

.btn-secondary {
  display: inline-block;
  padding: 8px 20px;
  border: 1px solid var(--hex-edge);
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--text);
}

/* ===== TUTORIAL ===== */
.tutorial-overlay {
  z-index: 150;
}

.tutorial-step {
  display: none;
}

.tutorial-step.active {
  display: block;
}

.tutorial-step h3 {
  font-family: var(--heading-font);
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: var(--accent);
}

.tutorial-step p {
  margin-bottom: 16px;
}

.tutorial-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
}

.tutorial-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--hex-edge);
  transition: background 0.2s;
}

.tutorial-dots span.active {
  background: var(--accent);
}

.tutorial-nav {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* ===== GAME OVER ===== */
.gameover-stats {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 16px 0;
}

.gameover-stat {
  text-align: center;
}

.gameover-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
}

.gameover-stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.new-record-flash {
  color: #ffd700;
  font-weight: 700;
  font-size: 1.2rem;
  animation: recordBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes recordBounce {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.score-countup {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent);
}

/* ===== MOBILE ===== */
.mobile-top-bar {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: var(--surface);
  border-bottom: 1px solid var(--hex-edge);
  z-index: 30;
  align-items: center;
  padding: 0 12px;
  justify-content: space-between;
}

.mobile-bottom-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--surface);
  border-top: 1px solid var(--hex-edge);
  z-index: 30;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 16px;
}

.mobile-bottom-bar .item-btn {
  flex-direction: column;
  gap: 2px;
  padding: 6px 14px;
  font-size: 0.72rem;
}

.mobile-bottom-bar .item-btn img {
  width: 28px;
  height: 28px;
}

.hamburger-btn {
  background: none;
  border: none;
  color: var(--text);
  font-size: 1.4rem;
  cursor: pointer;
  padding: 4px;
}

.mobile-panel {
  display: none;
  position: fixed;
  bottom: 64px;
  left: 0;
  right: 0;
  background: var(--surface);
  border-top: 1px solid var(--hex-edge);
  padding: 20px;
  z-index: 25;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.mobile-panel.open {
  transform: translateY(0);
}

@media (max-width: 767px) {
  .sidebar { display: none; }
  .mobile-top-bar { display: flex; }
  .mobile-bottom-bar { display: flex; }
  .mobile-panel { display: block; }

  .main-area {
    padding: 52px 8px 72px;
  }

  .hex-grid {
    --hex-w: clamp(28px, 8vw, 38px);
  }
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .board-wrapper.shake { animation: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "feat: rewrite CSS with 4 theme skins and sidebar HUD layout"
```

---

### Task 6: HTML Shell

**Files:**
- Rewrite: `index.html`

- [ ] **Step 1: Rewrite `index.html` with sidebar HUD, screens, canvas**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Turn-based Rock Paper Scissors on a hexagonal board.">
  <meta name="theme-color" content="#0a0a2e">
  <title>Rock Paper Scissors: Hexagonal Strategy</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body data-theme="neon">

  <!-- === SIDEBAR (desktop) === -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo" data-i18n="title">Rock Paper Scissors</div>

    <div class="sidebar-section">
      <div class="stat-row">
        <span class="sidebar-label" data-i18n="score">Score</span>
        <span class="stat-value" id="scoreValue">0</span>
      </div>
      <div class="stat-row">
        <span class="sidebar-label" data-i18n="best_score">Best</span>
        <span class="stat-value best" id="bestScoreValue">0</span>
      </div>
      <div class="difficulty-badge" id="difficultyBadge">Easy (3)</div>
    </div>

    <div class="sidebar-section">
      <span class="sidebar-label">&#9876;</span>
      <div class="item-picker" id="itemPicker">
        <button type="button" class="item-btn" data-item="stone">
          <img src="stone.png" alt="">
          <span data-i18n="stone">Rock</span>
        </button>
        <button type="button" class="item-btn" data-item="scissors">
          <img src="scissors.png" alt="">
          <span data-i18n="scissors">Scissors</span>
        </button>
        <button type="button" class="item-btn" data-item="paper">
          <img src="paper.png" alt="">
          <span data-i18n="paper">Paper</span>
        </button>
      </div>
    </div>

    <div class="status-text" id="statusText" data-i18n="your_turn">Choose a weapon and place it on the board</div>

    <div class="sidebar-bottom">
      <div class="settings-row">
        <span class="sidebar-label" data-i18n="mute">Sound</span>
        <button type="button" class="toggle-btn" id="muteBtn">&#128264;</button>
      </div>
      <div class="settings-row">
        <span class="sidebar-label" data-i18n="language">Language</span>
        <button type="button" class="toggle-btn" id="langBtn">EN</button>
      </div>
      <div class="settings-row">
        <span class="sidebar-label" data-i18n="skins">Theme</span>
        <div class="skin-dots" id="skinDots">
          <span class="skin-dot active" data-skin="neon" title="Neon Arcade"></span>
          <span class="skin-dot" data-skin="elegant" title="Elegant"></span>
          <span class="skin-dot" data-skin="modern" title="Modern"></span>
          <span class="skin-dot" data-skin="fantasy" title="Fantasy"></span>
        </div>
      </div>
    </div>
  </aside>

  <!-- === MAIN AREA === -->
  <main class="main-area">
    <div class="board-wrapper" id="boardWrapper">
      <div class="hex-grid" id="hexGrid"></div>
      <canvas id="particleCanvas"></canvas>
    </div>
  </main>

  <!-- === MOBILE TOP BAR === -->
  <div class="mobile-top-bar" id="mobileTopBar">
    <span class="sidebar-logo" style="font-size:0.85rem;" data-i18n="title">Rock Paper Scissors</span>
    <span class="stat-value" id="mobileScore" style="font-size:1rem;">0</span>
  </div>

  <!-- === MOBILE BOTTOM BAR === -->
  <div class="mobile-bottom-bar" id="mobileBottomBar">
    <button type="button" class="item-btn" data-item="stone">
      <img src="stone.png" alt=""><span data-i18n="stone">Rock</span>
    </button>
    <button type="button" class="item-btn" data-item="scissors">
      <img src="scissors.png" alt=""><span data-i18n="scissors">Scissors</span>
    </button>
    <button type="button" class="item-btn" data-item="paper">
      <img src="paper.png" alt=""><span data-i18n="paper">Paper</span>
    </button>
    <button type="button" class="hamburger-btn" id="hamburgerBtn">&#9776;</button>
  </div>

  <!-- === MOBILE SLIDE-UP PANEL === -->
  <div class="mobile-panel" id="mobilePanel">
    <div class="sidebar-section" style="margin-bottom:12px;">
      <div class="stat-row">
        <span class="sidebar-label" data-i18n="score">Score</span>
        <span class="stat-value" id="mobilePanelScore">0</span>
      </div>
      <div class="stat-row">
        <span class="sidebar-label" data-i18n="best_score">Best</span>
        <span class="stat-value best" id="mobilePanelBest">0</span>
      </div>
    </div>
    <div class="settings-row" style="margin-bottom:8px;">
      <span class="sidebar-label" data-i18n="mute">Sound</span>
      <button type="button" class="toggle-btn" id="mobileMuteBtn">&#128264;</button>
    </div>
    <div class="settings-row" style="margin-bottom:8px;">
      <span class="sidebar-label" data-i18n="language">Language</span>
      <button type="button" class="toggle-btn" id="mobileLangBtn">EN</button>
    </div>
    <div class="settings-row">
      <span class="sidebar-label" data-i18n="skins">Theme</span>
      <div class="skin-dots" id="mobileSkinDots">
        <span class="skin-dot active" data-skin="neon"></span>
        <span class="skin-dot" data-skin="elegant"></span>
        <span class="skin-dot" data-skin="modern"></span>
        <span class="skin-dot" data-skin="fantasy"></span>
      </div>
    </div>
  </div>

  <!-- === TITLE SCREEN === -->
  <div class="overlay title-screen visible" id="titleScreen">
    <div class="title-bg-hexes">
      <div class="float-hex"></div>
      <div class="float-hex"></div>
      <div class="float-hex"></div>
      <div class="float-hex"></div>
    </div>
    <div class="overlay-box title-content">
      <h1 data-i18n="title">Rock Paper Scissors</h1>
      <p data-i18n="subtitle">Hexagonal Strategy</p>
      <div style="margin:20px 0 16px;">
        <div class="skin-dots" id="titleSkinDots">
          <span class="skin-dot active" data-skin="neon" title="Neon Arcade"></span>
          <span class="skin-dot" data-skin="elegant" title="Elegant"></span>
          <span class="skin-dot" data-skin="modern" title="Modern"></span>
          <span class="skin-dot" data-skin="fantasy" title="Fantasy"></span>
        </div>
      </div>
      <div style="margin-bottom:12px;">
        <button type="button" class="toggle-btn" id="titleLangBtn">EN</button>
      </div>
      <button type="button" class="btn-primary" id="playBtn" data-i18n="play">Play</button>
    </div>
  </div>

  <!-- === TUTORIAL === -->
  <div class="overlay tutorial-overlay" id="tutorialOverlay">
    <div class="overlay-box">
      <div class="tutorial-step active" data-step="0">
        <h3 data-i18n="tutorial_step1_title">Choose Your Weapon</h3>
        <p data-i18n="tutorial_step1">Pick rock, scissors, or paper from the sidebar.</p>
        <div style="font-size:48px;margin:12px 0;">&#9994; &#9996; &#9995;</div>
      </div>
      <div class="tutorial-step" data-step="1">
        <h3 data-i18n="tutorial_step2_title">Place It</h3>
        <p data-i18n="tutorial_step2">Click any empty hex on the board.</p>
        <div style="font-size:48px;margin:12px 0;">&#11042;</div>
      </div>
      <div class="tutorial-step" data-step="2">
        <h3 data-i18n="tutorial_step3_title">Capture Enemies</h3>
        <p data-i18n="tutorial_step3">Your piece removes adjacent losers — but only if no counter is nearby.</p>
        <div style="font-size:36px;margin:12px 0;">&#9994; &#10060; &#9996;</div>
      </div>
      <div class="tutorial-dots">
        <span class="active"></span><span></span><span></span>
      </div>
      <div class="tutorial-nav">
        <button type="button" class="btn-secondary" id="tutorialSkipBtn" data-i18n="skip">Skip</button>
        <button type="button" class="btn-primary" id="tutorialNextBtn" data-i18n="next">Next</button>
      </div>
    </div>
  </div>

  <!-- === GAME OVER === -->
  <div class="overlay" id="gameOverOverlay">
    <div class="overlay-box">
      <h2 data-i18n="game_over">Game Over</h2>
      <div class="score-countup" id="goScore">0</div>
      <div class="new-record-flash" id="goNewRecord" style="display:none;" data-i18n="new_record">New Record!</div>
      <div class="gameover-stats">
        <div class="gameover-stat">
          <div class="gameover-stat-value" id="goPlaced">0</div>
          <div class="gameover-stat-label" data-i18n="pieces_placed">Placed</div>
        </div>
        <div class="gameover-stat">
          <div class="gameover-stat-value" id="goCleared">0</div>
          <div class="gameover-stat-label" data-i18n="pieces_cleared">Cleared</div>
        </div>
        <div class="gameover-stat">
          <div class="gameover-stat-value" id="goTurns">0</div>
          <div class="gameover-stat-label" data-i18n="turns_survived">Turns</div>
        </div>
      </div>
      <div style="margin:12px 0;">
        <div class="skin-dots" id="goSkinDots">
          <span class="skin-dot active" data-skin="neon"></span>
          <span class="skin-dot" data-skin="elegant"></span>
          <span class="skin-dot" data-skin="modern"></span>
          <span class="skin-dot" data-skin="fantasy"></span>
        </div>
      </div>
      <button type="button" class="btn-primary" id="playAgainBtn" data-i18n="play_again">Play Again</button>
    </div>
  </div>

  <!-- Scripts (order matters) -->
  <script src="i18n.js"></script>
  <script src="audio.js"></script>
  <script src="particles.js"></script>
  <script src="script.js"></script>
  <script src="ui.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: rewrite HTML with sidebar HUD, screen overlays, canvas layer"
```

---

### Task 7: UI Controller

**Files:**
- Create: `ui.js`

This is the largest module — wires everything together.

- [ ] **Step 1: Create `ui.js` — screen management, skin switching, DOM binding, animations**

```js
// ui.js — UI controller: wires engine, particles, audio, i18n to DOM
(function () {
  const GRID_SIZE = 10;
  const THEME_KEY = 'scipaprock_theme';
  const TUTORIAL_KEY = 'scipaprock_tutorial_done';

  let selectedItem = null;
  let currentTheme = 'neon';

  // --- DOM refs ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const hexGrid = $('#hexGrid');
  const boardWrapper = $('#boardWrapper');
  const particleCanvas = $('#particleCanvas');
  const scoreValue = $('#scoreValue');
  const bestScoreValue = $('#bestScoreValue');
  const difficultyBadge = $('#difficultyBadge');
  const statusText = $('#statusText');
  const muteBtn = $('#muteBtn');
  const langBtn = $('#langBtn');
  const titleScreen = $('#titleScreen');
  const playBtn = $('#playBtn');
  const titleLangBtn = $('#titleLangBtn');
  const tutorialOverlay = $('#tutorialOverlay');
  const tutorialNextBtn = $('#tutorialNextBtn');
  const tutorialSkipBtn = $('#tutorialSkipBtn');
  const gameOverOverlay = $('#gameOverOverlay');
  const playAgainBtn = $('#playAgainBtn');
  const goScore = $('#goScore');
  const goNewRecord = $('#goNewRecord');
  const goPlaced = $('#goPlaced');
  const goCleared = $('#goCleared');
  const goTurns = $('#goTurns');
  const hamburgerBtn = $('#hamburgerBtn');
  const mobilePanel = $('#mobilePanel');
  const mobileScore = $('#mobileScore');
  const mobilePanelScore = $('#mobilePanelScore');
  const mobilePanelBest = $('#mobilePanelBest');
  const mobileMuteBtn = $('#mobileMuteBtn');
  const mobileLangBtn = $('#mobileLangBtn');

  // --- Theme ---
  function setTheme(theme) {
    currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    $$('.skin-dot').forEach(d => d.classList.toggle('active', d.dataset.skin === theme));
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
  }

  function loadTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (['neon', 'elegant', 'modern', 'fantasy'].includes(saved)) return saved;
    } catch (e) { /* ignore */ }
    return 'neon';
  }

  // --- Skin dot click handlers ---
  function initSkinDots() {
    $$('.skin-dots').forEach(container => {
      container.addEventListener('click', (e) => {
        const dot = e.target.closest('.skin-dot');
        if (dot && dot.dataset.skin) {
          setTheme(dot.dataset.skin);
          window.Audio.play('select');
        }
      });
    });
  }

  // --- Item picker ---
  function selectItem(item) {
    selectedItem = item;
    // Update all item buttons (sidebar + mobile)
    $$('.item-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.item === item);
    });
    $$('.item-picker, .mobile-bottom-bar').forEach(el => {
      el.classList.toggle('has-selection', !!item);
    });
    if (item) {
      statusText.textContent = I18n.t('selected_item', { item: I18n.t(item) });
      window.Audio.play('select');
    }
  }

  function clearSelection() {
    selectedItem = null;
    $$('.item-btn').forEach(btn => btn.classList.remove('selected'));
    $$('.item-picker, .mobile-bottom-bar').forEach(el => el.classList.remove('has-selection'));
    statusText.textContent = I18n.t('your_turn');
  }

  function initItemPickers() {
    $$('.item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.Audio.ensureContext();
        selectItem(btn.dataset.item);
      });
    });
  }

  // --- Hex grid ---
  function buildGrid() {
    hexGrid.innerHTML = '';
    for (let row = 0; row < GRID_SIZE; row++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'hex-row';
      for (let col = 0; col < GRID_SIZE; col++) {
        const hex = document.createElement('button');
        hex.type = 'button';
        hex.className = 'hex empty';
        hex.dataset.row = String(row);
        hex.dataset.col = String(col);
        hex.addEventListener('click', () => onHexClick(row, col));
        rowEl.appendChild(hex);
      }
      hexGrid.appendChild(rowEl);
    }
  }

  async function onHexClick(row, col) {
    if (!selectedItem || GameEngine.isGameOver() || GameEngine.isBusy()) return;
    window.Audio.ensureContext();
    const ok = await GameEngine.playerMove(row, col, selectedItem);
    if (ok) clearSelection();
  }

  function getHex(row, col) {
    return hexGrid.querySelector(`.hex[data-row="${row}"][data-col="${col}"]`);
  }

  // Get center position of a hex relative to the board wrapper
  function getHexCenter(row, col) {
    const hex = getHex(row, col);
    if (!hex) return null;
    const hr = hex.getBoundingClientRect();
    const cr = particleCanvas.getBoundingClientRect();
    return { x: hr.left + hr.width / 2 - cr.left, y: hr.top + hr.height / 2 - cr.top };
  }

  // --- Engine callbacks ---
  function onPiecePlaced(row, col, item, isPlayer) {
    const hex = getHex(row, col);
    if (!hex) return;
    hex.classList.remove('empty');
    const img = document.createElement('img');
    img.src = `${item}.png`;
    img.alt = I18n.t(item);
    img.decoding = 'async';
    if (isPlayer) img.classList.add('player');
    hex.innerHTML = '';
    hex.appendChild(img);
    hex.classList.remove('pop-in', 'ripple');
    void hex.offsetWidth;
    hex.classList.add('pop-in', 'ripple');
    window.Audio.play('place');
  }

  function onPiecesCleared(cells) {
    if (cells.length === 0) return;

    window.Audio.play('capture');

    // Screen shake
    boardWrapper.classList.remove('shake');
    void boardWrapper.offsetWidth;
    boardWrapper.classList.add('shake');

    // Particle bursts and collect centers for lightning
    const centers = [];
    const isCombo = cells.length >= 3;

    cells.forEach(c => {
      const hex = getHex(c.row, c.col);
      if (hex) {
        hex.classList.add('is-clearing');
        // Remove after animation
        setTimeout(() => {
          hex.innerHTML = '';
          hex.classList.remove('is-clearing', 'pop-in', 'ripple');
          hex.classList.add('empty');
        }, 420);
      }
      const center = getHexCenter(c.row, c.col);
      if (center) {
        centers.push(center);
        Particles.burst(center.x, center.y, isCombo ? 30 : 15, isCombo ? 120 : 80);
      }
    });

    // Chain lightning
    if (centers.length >= 2) {
      Particles.lightning(centers);
    }

    // Combo
    if (isCombo) {
      window.Audio.play('combo');
      Particles.flash();
      const mid = centers.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y }), { x: 0, y: 0 });
      mid.x /= centers.length;
      mid.y /= centers.length;
      Particles.comboText(mid.x, mid.y, I18n.t('combo', { n: cells.length }));
    }
  }

  function onScoreChanged(score, best) {
    scoreValue.textContent = score;
    bestScoreValue.textContent = best;
    if (mobileScore) mobileScore.textContent = score;
    if (mobilePanelScore) mobilePanelScore.textContent = score;
    if (mobilePanelBest) mobilePanelBest.textContent = best;
  }

  function onDifficultyChanged(label, count) {
    difficultyBadge.textContent = `${I18n.t(label)} (${count})`;
  }

  function onStatusChanged(key, params) {
    statusText.textContent = I18n.t(key, params);
  }

  function onComputerTurnStart() {
    statusText.textContent = I18n.t('computer_thinking') + '...';
  }

  function onComputerTurnEnd() {
    // Status will be set by engine
  }

  function onGameOver(data) {
    window.Audio.play('gameover');

    // Count-up animation
    goScore.textContent = '0';
    goPlaced.textContent = data.stats.totalPlaced;
    goCleared.textContent = data.stats.totalCleared;
    goTurns.textContent = data.stats.turnsPlayed;

    goNewRecord.style.display = data.isNewRecord ? 'block' : 'none';
    if (data.isNewRecord) {
      setTimeout(() => window.Audio.play('newrecord'), 600);
    }

    showOverlay(gameOverOverlay);

    // Animate score count-up
    let current = 0;
    const target = data.score;
    const duration = 1500;
    const start = performance.now();
    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * target);
      goScore.textContent = current;
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  // --- Overlays ---
  function showOverlay(el) {
    el.classList.add('visible');
  }

  function hideOverlay(el) {
    el.classList.remove('visible');
  }

  // --- Tutorial ---
  let tutorialStep = 0;

  function showTutorial() {
    tutorialStep = 0;
    updateTutorialStep();
    showOverlay(tutorialOverlay);
  }

  function updateTutorialStep() {
    $$('.tutorial-step').forEach((s, i) => s.classList.toggle('active', i === tutorialStep));
    $$('.tutorial-dots span').forEach((d, i) => d.classList.toggle('active', i === tutorialStep));
    tutorialNextBtn.textContent = tutorialStep === 2 ? I18n.t('play') : I18n.t('next');
  }

  function finishTutorial() {
    hideOverlay(tutorialOverlay);
    try { localStorage.setItem(TUTORIAL_KEY, 'true'); } catch (e) { /* ignore */ }
    GameEngine.startGame();
  }

  // --- Mute ---
  function updateMuteBtn() {
    const icon = window.Audio.isMuted() ? '\u{1F507}' : '\u{1F50A}';
    if (muteBtn) muteBtn.textContent = icon;
    if (mobileMuteBtn) mobileMuteBtn.textContent = icon;
  }

  function toggleMute() {
    window.Audio.ensureContext();
    window.Audio.toggleMute();
    updateMuteBtn();
  }

  // --- Language ---
  function updateLangBtn() {
    const lang = I18n.getLang().toUpperCase();
    if (langBtn) langBtn.textContent = lang;
    if (titleLangBtn) titleLangBtn.textContent = lang;
    if (mobileLangBtn) mobileLangBtn.textContent = lang;
  }

  function toggleLang() {
    const next = I18n.getLang() === 'en' ? 'ru' : 'en';
    I18n.setLang(next);
    updateLangBtn();
    // Refresh dynamic text
    const diff = { label: difficultyBadge.textContent.split(' ')[0], count: '' };
    if (!GameEngine.isGameOver() && !GameEngine.isBusy()) {
      statusText.textContent = selectedItem
        ? I18n.t('selected_item', { item: I18n.t(selectedItem) })
        : I18n.t('your_turn');
    }
  }

  // --- Mobile ---
  function initMobile() {
    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', () => {
        mobilePanel.classList.toggle('open');
      });
    }
  }

  // --- Keyboard ---
  function initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (GameEngine.isGameOver() || !titleScreen.classList.contains('visible') === false) return;
      if (e.key === '1') selectItem('stone');
      else if (e.key === '2') selectItem('scissors');
      else if (e.key === '3') selectItem('paper');
      else if (e.key === 'Escape') clearSelection();
    });
  }

  // --- Start Game Flow ---
  function startGameFlow() {
    window.Audio.ensureContext();
    window.Audio.play('ui_click');
    hideOverlay(titleScreen);

    const tutorialDone = (() => {
      try { return localStorage.getItem(TUTORIAL_KEY) === 'true'; } catch (e) { return false; }
    })();

    if (!tutorialDone) {
      showTutorial();
    } else {
      GameEngine.startGame();
    }
  }

  // --- Init ---
  function init() {
    // Load preferences
    currentTheme = loadTheme();
    setTheme(currentTheme);

    // Init modules
    I18n.init();
    window.Audio.init();
    Particles.init(particleCanvas);

    // Build grid
    buildGrid();

    // Wire engine callbacks
    GameEngine.setCallbacks({
      onPiecePlaced,
      onPiecesCleared,
      onScoreChanged,
      onDifficultyChanged,
      onStatusChanged,
      onComputerTurnStart,
      onComputerTurnEnd,
      onGameOver,
    });

    // Init game state (but don't start yet)
    GameEngine.initGame();

    // Wire UI
    initSkinDots();
    initItemPickers();
    initMobile();
    initKeyboard();
    updateMuteBtn();
    updateLangBtn();

    // Buttons
    playBtn.addEventListener('click', startGameFlow);
    playAgainBtn.addEventListener('click', () => {
      window.Audio.play('ui_click');
      hideOverlay(gameOverOverlay);
      buildGrid();
      Particles.clear();
      GameEngine.startGame();
    });

    tutorialNextBtn.addEventListener('click', () => {
      window.Audio.play('ui_click');
      if (tutorialStep < 2) {
        tutorialStep++;
        updateTutorialStep();
      } else {
        finishTutorial();
      }
    });

    tutorialSkipBtn.addEventListener('click', () => {
      window.Audio.play('ui_click');
      finishTutorial();
    });

    // Mute buttons
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);
    if (mobileMuteBtn) mobileMuteBtn.addEventListener('click', toggleMute);

    // Lang buttons
    [langBtn, titleLangBtn, mobileLangBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', toggleLang);
    });

    // Resize handler for particles
    window.addEventListener('resize', () => Particles.resize());

    // Show title screen
    showOverlay(titleScreen);
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Commit**

```bash
git add ui.js
git commit -m "feat: add UI controller — screens, animations, skin switching, DOM binding"
```

---

### Task 8: Cleanup and Integration Fixes

**Files:**
- Modify: `.gitignore`
- Delete: `game.py`, `game.py:Zone.Identifier`, `requirements.txt`

- [ ] **Step 1: Update `.gitignore` to include `.superpowers/`**

Read current `.gitignore` and add `.superpowers/` line.

- [ ] **Step 2: Remove unused Python files**

```bash
git rm game.py "game.py:Zone.Identifier" requirements.txt
```

- [ ] **Step 3: Open `index.html` in browser and test**

Verify:
- Title screen appears with floating hexes and all 4 skin dots
- Clicking skin dots changes the theme instantly (colors, fonts)
- Language toggle switches EN/RU on all text
- Play button starts the game (or tutorial on first visit)
- Tutorial 3 steps work with Next/Skip
- Hex grid renders 10x10
- Item picker works (sidebar on desktop, bottom bar on mobile)
- Placing pieces triggers pop-in animation + sound
- Captures show particles, chain lightning, screen shake
- Combos show floating text
- Game over shows score count-up, stats, new record flash
- Mute toggle works
- Mobile layout at < 768px width

- [ ] **Step 4: Fix any integration issues found during testing**

Common issues to watch for:
- Canvas sizing (call `Particles.resize()` after board is visible)
- Audio context suspended (ensure `ensureContext()` on first click)
- i18n keys not matching between `i18n.js` and `data-i18n` attributes
- Theme CSS variables not cascading to overlays (overlays are outside sidebar)

- [ ] **Step 5: Commit all fixes**

```bash
git add -A
git commit -m "fix: integration fixes and cleanup"
```

---

### Task 9: Push to Remote

- [ ] **Step 1: Push master branch**

```bash
git push origin master
```

- [ ] **Step 2: Push gh-pages branch (for GitHub Pages deployment)**

```bash
git checkout gh-pages
git merge master
git push origin gh-pages
git checkout master
```
