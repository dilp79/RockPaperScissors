/**
 * UI Controller — wires GameEngine, Particles, Audio, and I18n to the DOM.
 * Loaded last, after i18n.js, audio.js, particles.js, script.js.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // -------------------------------------------------------------------------
    // DOM references
    // -------------------------------------------------------------------------
    const sidebar           = document.getElementById('sidebar');
    const scoreValue        = document.getElementById('scoreValue');
    const bestScoreValue    = document.getElementById('bestScoreValue');
    const difficultyBadge   = document.getElementById('difficultyBadge');
    const itemPicker        = document.getElementById('itemPicker');
    const statusText        = document.getElementById('statusText');
    const muteBtn           = document.getElementById('muteBtn');
    const langBtn           = document.getElementById('langBtn');
    const skinDots          = document.getElementById('skinDots');

    const boardWrapper      = document.getElementById('boardWrapper');
    const hexGrid           = document.getElementById('hexGrid');
    const particleCanvas    = document.getElementById('particleCanvas');

    const mobileTopBar      = document.getElementById('mobileTopBar');
    const mobileScore       = document.getElementById('mobileScore');
    const mobileBottomBar   = document.getElementById('mobileBottomBar');
    const hamburgerBtn      = document.getElementById('hamburgerBtn');
    const mobilePanel       = document.getElementById('mobilePanel');
    const mobilePanelScore  = document.getElementById('mobilePanelScore');
    const mobilePanelBest   = document.getElementById('mobilePanelBest');
    const mobileMuteBtn     = document.getElementById('mobileMuteBtn');
    const mobileLangBtn     = document.getElementById('mobileLangBtn');
    const mobileSkinDots    = document.getElementById('mobileSkinDots');

    const titleScreen       = document.getElementById('titleScreen');
    const titleSkinDots     = document.getElementById('titleSkinDots');
    const titleLangBtn      = document.getElementById('titleLangBtn');
    const playBtn           = document.getElementById('playBtn');

    const tutorialOverlay   = document.getElementById('tutorialOverlay');
    const tutorialSkipBtn   = document.getElementById('tutorialSkipBtn');
    const tutorialNextBtn   = document.getElementById('tutorialNextBtn');

    const gameOverOverlay   = document.getElementById('gameOverOverlay');
    const goScore           = document.getElementById('goScore');
    const goNewRecord       = document.getElementById('goNewRecord');
    const goPlaced          = document.getElementById('goPlaced');
    const goCleared         = document.getElementById('goCleared');
    const goTurns           = document.getElementById('goTurns');
    const goSkinDots        = document.getElementById('goSkinDots');
    const playAgainBtn      = document.getElementById('playAgainBtn');

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    let selectedItem  = null;
    let tutorialStep  = 0;
    const THEME_KEY   = 'scipaprock_theme';
    const TUTORIAL_KEY = 'scipaprock_tutorial_done';
    const GRID_SIZE   = GameEngine.getGridSize();

    // -------------------------------------------------------------------------
    // Theme management
    // -------------------------------------------------------------------------
    function loadTheme() {
      try {
        return localStorage.getItem(THEME_KEY) || 'neon';
      } catch (_) {
        return 'neon';
      }
    }

    function setTheme(theme) {
      document.body.dataset.theme = theme;
      try { localStorage.setItem(THEME_KEY, theme); } catch (_) { /* ignore */ }
      document.querySelectorAll('.skin-dot').forEach(function (dot) {
        dot.classList.toggle('active', dot.dataset.skin === theme);
      });
    }

    function handleSkinDotClick(e) {
      var dot = e.target.closest('.skin-dot');
      if (!dot || !dot.dataset.skin) return;
      setTheme(dot.dataset.skin);
    }

    // -------------------------------------------------------------------------
    // Item selection
    // -------------------------------------------------------------------------
    function selectItem(item) {
      selectedItem = item;
      document.querySelectorAll('.item-btn').forEach(function (btn) {
        btn.classList.toggle('selected', btn.dataset.item === item);
      });
      document.querySelectorAll('.item-picker, .mobile-bottom-bar').forEach(function (el) {
        el.classList.add('has-selection');
      });
      statusText.textContent = I18n.t('selected_item', { item: I18n.t(item) });
      GameAudio.play('select');
    }

    function clearSelection() {
      selectedItem = null;
      document.querySelectorAll('.item-btn').forEach(function (btn) {
        btn.classList.remove('selected');
      });
      document.querySelectorAll('.item-picker, .mobile-bottom-bar').forEach(function (el) {
        el.classList.remove('has-selection');
      });
      statusText.textContent = I18n.t('your_turn');
    }

    function handleItemBtnClick(e) {
      var btn = e.target.closest('.item-btn');
      if (!btn || !btn.dataset.item) return;
      selectItem(btn.dataset.item);
    }

    // -------------------------------------------------------------------------
    // Hex grid
    // -------------------------------------------------------------------------
    function buildGrid() {
      hexGrid.innerHTML = '';
      for (var r = 0; r < GRID_SIZE; r++) {
        var row = document.createElement('div');
        row.className = 'hex-row';
        for (var c = 0; c < GRID_SIZE; c++) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'hex empty';
          btn.dataset.row = r;
          btn.dataset.col = c;
          btn.addEventListener('click', (function (rr, cc) {
            return function () { onHexClick(rr, cc); };
          })(r, c));
          row.appendChild(btn);
        }
        hexGrid.appendChild(row);
      }
    }

    // -------------------------------------------------------------------------
    // Hex click handler
    // -------------------------------------------------------------------------
    function onHexClick(row, col) {
      if (!selectedItem || GameEngine.isBusy() || GameEngine.isGameOver()) return;
      GameAudio.ensureContext();
      GameEngine.playerMove(row, col, selectedItem).then(function (ok) {
        if (ok) clearSelection();
      });
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    function getHexCenter(row, col) {
      var hex = hexGrid.querySelector('.hex[data-row="' + row + '"][data-col="' + col + '"]');
      if (!hex) return null;
      var hr = hex.getBoundingClientRect();
      var cr = particleCanvas.getBoundingClientRect();
      return { x: hr.left + hr.width / 2 - cr.left, y: hr.top + hr.height / 2 - cr.top };
    }

    function retriggerClass(el, cls) {
      el.classList.remove(cls);
      void el.offsetWidth; // force reflow
      el.classList.add(cls);
    }

    // -------------------------------------------------------------------------
    // Overlays
    // -------------------------------------------------------------------------
    function showOverlay(el) { el.classList.add('visible'); }
    function hideOverlay(el) { el.classList.remove('visible'); }

    // -------------------------------------------------------------------------
    // Engine callbacks
    // -------------------------------------------------------------------------
    function onPiecePlaced(row, col, item, isPlayer) {
      var hex = hexGrid.querySelector('.hex[data-row="' + row + '"][data-col="' + col + '"]');
      if (!hex) return;
      hex.classList.remove('empty');
      var img = document.createElement('img');
      img.src = item + '.png';
      img.alt = I18n.t(item);
      if (isPlayer) img.classList.add('player');
      hex.innerHTML = '';
      hex.appendChild(img);
      retriggerClass(hex, 'pop-in');
      retriggerClass(hex, 'hex-ripple');
      GameAudio.play('place');
    }

    function onPiecesCleared(cells) {
      GameAudio.play('capture');
      retriggerClass(boardWrapper, 'shake');
      boardWrapper.addEventListener('animationend', function handler() {
        boardWrapper.classList.remove('shake');
        boardWrapper.removeEventListener('animationend', handler);
      });

      var centers = [];
      cells.forEach(function (cell) {
        var hex = hexGrid.querySelector('.hex[data-row="' + cell.row + '"][data-col="' + cell.col + '"]');
        if (hex) {
          hex.classList.add('is-clearing');
          var img = hex.querySelector('img');
          if (img) img.classList.add('piece-vanish');
          var snapshot = img;
          setTimeout(function () {
            // Only wipe if the cell wasn't re-populated during the animation
            if (hex.querySelector('img') === snapshot) {
              hex.innerHTML = '';
              hex.classList.remove('is-clearing');
              hex.classList.add('empty');
            } else {
              // Cell was re-populated; just remove the clearing flag
              hex.classList.remove('is-clearing');
            }
          }, 420);
        }
        var center = getHexCenter(cell.row, cell.col);
        if (center) {
          centers.push(center);
          Particles.burst(center.x, center.y, 12, 40);
        }
      });

      if (cells.length >= 2 && centers.length >= 2) {
        Particles.lightning(centers);
      }

      if (cells.length >= 3) {
        GameAudio.play('combo');
        Particles.flash();
        var midX = 0, midY = 0;
        centers.forEach(function (c) { midX += c.x; midY += c.y; });
        midX /= centers.length;
        midY /= centers.length;
        Particles.comboText(midX, midY, I18n.t('combo', { n: cells.length }));
      }
    }

    function onScoreChanged(score, best) {
      scoreValue.textContent     = score;
      bestScoreValue.textContent = best;
      mobileScore.textContent    = score;
      mobilePanelScore.textContent = score;
      mobilePanelBest.textContent  = best;
    }

    function onDifficultyChanged(label, count) {
      difficultyBadge.textContent = I18n.t(label) + ' (' + count + ')';
    }

    function onStatusChanged(key, params) {
      statusText.textContent = I18n.t(key, params);
    }

    function onComputerTurnStart() {
      statusText.textContent = I18n.t('computer_thinking') + '...';
    }

    function onComputerTurnEnd() {
      // Force-sync DOM with engine state to fix any desync from clearing animations
      syncBoard();
    }

    function syncBoard() {
      var board = GameEngine.getBoard();
      var size = GameEngine.getGridSize();
      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          var hex = hexGrid.querySelector('.hex[data-row="' + r + '"][data-col="' + c + '"]');
          if (!hex) continue;
          var engineItem = board[r][c];
          var hasImg = hex.querySelector('img');

          if (engineItem && !hasImg) {
            // Engine says occupied but DOM is empty — fix it
            hex.classList.remove('empty', 'is-clearing');
            var img = document.createElement('img');
            img.src = engineItem + '.png';
            img.alt = I18n.t(engineItem);
            hex.innerHTML = '';
            hex.appendChild(img);
          } else if (!engineItem && hasImg) {
            // Engine says empty but DOM has content — fix it
            hex.innerHTML = '';
            hex.classList.remove('is-clearing', 'pop-in', 'hex-ripple');
            hex.classList.add('empty');
          }
        }
      }
    }

    function onGameOver(data) {
      GameAudio.play('gameover');
      goPlaced.textContent = data.stats.totalPlaced;
      goCleared.textContent = data.stats.totalCleared;
      goTurns.textContent = data.stats.turnsPlayed;

      if (data.isNewRecord) {
        goNewRecord.style.display = '';
        setTimeout(function () { GameAudio.play('newrecord'); }, 600);
      } else {
        goNewRecord.style.display = 'none';
      }

      showOverlay(gameOverOverlay);

      // Animated score count-up
      var startTime = null;
      var duration = 1500;
      var targetScore = data.score;
      function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
      function animateScore(ts) {
        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var current = Math.round(easeOutCubic(progress) * targetScore);
        goScore.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(animateScore);
        }
      }
      requestAnimationFrame(animateScore);
    }

    // -------------------------------------------------------------------------
    // Title screen flow
    // -------------------------------------------------------------------------
    function onPlayClick() {
      GameAudio.ensureContext();
      GameAudio.play('ui_click');
      hideOverlay(titleScreen);

      var tutorialDone = false;
      try { tutorialDone = localStorage.getItem(TUTORIAL_KEY) === 'true'; } catch (_) {}

      if (!tutorialDone) {
        tutorialStep = 0;
        updateTutorialStep();
        showOverlay(tutorialOverlay);
      } else {
        GameEngine.startGame();
      }
    }

    // -------------------------------------------------------------------------
    // Tutorial
    // -------------------------------------------------------------------------
    function updateTutorialStep() {
      tutorialOverlay.querySelectorAll('.tutorial-step').forEach(function (el) {
        el.classList.toggle('active', parseInt(el.dataset.step, 10) === tutorialStep);
      });
      var dots = tutorialOverlay.querySelectorAll('.tutorial-dots span');
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === tutorialStep);
      });
      tutorialNextBtn.textContent = tutorialStep === 2 ? I18n.t('play') : I18n.t('next');
    }

    function finishTutorial() {
      hideOverlay(tutorialOverlay);
      try { localStorage.setItem(TUTORIAL_KEY, 'true'); } catch (_) {}
      GameEngine.startGame();
    }

    function onTutorialNext() {
      if (tutorialStep < 2) {
        tutorialStep++;
        updateTutorialStep();
      } else {
        finishTutorial();
      }
    }

    // -------------------------------------------------------------------------
    // Mute toggle
    // -------------------------------------------------------------------------
    function updateMuteButtons() {
      var icon = GameAudio.isMuted() ? '\u{1F507}' : '\u{1F50A}';
      muteBtn.textContent = icon;
      mobileMuteBtn.textContent = icon;
    }

    function onMuteClick() {
      GameAudio.ensureContext();
      GameAudio.toggleMute();
      updateMuteButtons();
    }

    // -------------------------------------------------------------------------
    // Language toggle
    // -------------------------------------------------------------------------
    function updateLangButtons() {
      var code = I18n.getLang().toUpperCase();
      langBtn.textContent = code;
      titleLangBtn.textContent = code;
      mobileLangBtn.textContent = code;
    }

    function onLangClick() {
      var next = I18n.getLang() === 'en' ? 'ru' : 'en';
      I18n.setLang(next);
      I18n.applyLang();
      updateLangButtons();
      // Re-apply dynamic status text
      if (selectedItem) {
        statusText.textContent = I18n.t('selected_item', { item: I18n.t(selectedItem) });
      } else if (!GameEngine.isBusy() && !GameEngine.isGameOver()) {
        statusText.textContent = I18n.t('your_turn');
      }
      // Update difficulty badge
      var score = GameEngine.getScore();
      if (score >= 60) {
        difficultyBadge.textContent = I18n.t('very_hard') + ' (6)';
      } else if (score >= 40) {
        difficultyBadge.textContent = I18n.t('hard') + ' (5)';
      } else if (score >= 20) {
        difficultyBadge.textContent = I18n.t('medium') + ' (4)';
      } else {
        difficultyBadge.textContent = I18n.t('easy') + ' (3)';
      }
      // Update tutorial button if visible
      if (tutorialOverlay.classList.contains('visible')) {
        tutorialNextBtn.textContent = tutorialStep === 2 ? I18n.t('play') : I18n.t('next');
      }
    }

    // -------------------------------------------------------------------------
    // Mobile
    // -------------------------------------------------------------------------
    function onHamburgerClick() {
      mobilePanel.classList.toggle('open');
    }

    // -------------------------------------------------------------------------
    // Keyboard
    // -------------------------------------------------------------------------
    function onKeyDown(e) {
      // Only when no overlay is visible
      if (titleScreen.classList.contains('visible') ||
          tutorialOverlay.classList.contains('visible') ||
          gameOverOverlay.classList.contains('visible')) {
        return;
      }
      switch (e.key) {
        case '1': selectItem('stone');    break;
        case '2': selectItem('scissors'); break;
        case '3': selectItem('paper');    break;
        case 'Escape': clearSelection();  break;
      }
    }

    // -------------------------------------------------------------------------
    // Play Again
    // -------------------------------------------------------------------------
    function onPlayAgain() {
      GameAudio.play('ui_click');
      hideOverlay(gameOverOverlay);
      buildGrid();
      Particles.clear();
      GameEngine.startGame();
    }

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    // 1. Theme
    setTheme(loadTheme());

    // 2. I18n
    I18n.init();

    // 3. Audio
    GameAudio.init();

    // 4. Particles
    Particles.init(particleCanvas);

    // 5. Build grid
    buildGrid();

    // 6. Engine callbacks
    GameEngine.setCallbacks({
      onPiecePlaced:       onPiecePlaced,
      onPiecesCleared:     onPiecesCleared,
      onComputerTurnStart: onComputerTurnStart,
      onComputerTurnEnd:   onComputerTurnEnd,
      onGameOver:          onGameOver,
      onScoreChanged:      onScoreChanged,
      onDifficultyChanged: onDifficultyChanged,
      onStatusChanged:     onStatusChanged
    });

    // 7. Init game state (no first turn yet)
    GameEngine.initGame();

    // 8. Wire event listeners
    playBtn.addEventListener('click', onPlayClick);
    playAgainBtn.addEventListener('click', onPlayAgain);
    tutorialNextBtn.addEventListener('click', onTutorialNext);
    tutorialSkipBtn.addEventListener('click', finishTutorial);
    muteBtn.addEventListener('click', onMuteClick);
    mobileMuteBtn.addEventListener('click', onMuteClick);
    langBtn.addEventListener('click', onLangClick);
    titleLangBtn.addEventListener('click', onLangClick);
    mobileLangBtn.addEventListener('click', onLangClick);
    hamburgerBtn.addEventListener('click', onHamburgerClick);
    document.addEventListener('keydown', onKeyDown);

    // Skin dot click delegation
    skinDots.addEventListener('click', handleSkinDotClick);
    mobileSkinDots.addEventListener('click', handleSkinDotClick);
    titleSkinDots.addEventListener('click', handleSkinDotClick);
    goSkinDots.addEventListener('click', handleSkinDotClick);

    // Item button clicks (sidebar + mobile)
    itemPicker.addEventListener('click', handleItemBtnClick);
    mobileBottomBar.addEventListener('click', handleItemBtnClick);

    // 9. Update mute/lang button states
    updateMuteButtons();
    updateLangButtons();

    // 10. Title screen is already visible via HTML class

    // 11. Window resize
    window.addEventListener('resize', function () {
      Particles.resize();
    });
  });
}());
