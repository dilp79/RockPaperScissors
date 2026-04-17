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
    const hintsBtn          = document.getElementById('hintsBtn');
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
    const mobileHintsBtn    = document.getElementById('mobileHintsBtn');
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
    let previewState  = null;
    let hintsEnabled  = false;
    let lastPointerType = '';
    let baseStatus    = { key: 'your_turn', params: null };
    const THEME_KEY   = 'scipaprock_theme';
    const HINTS_KEY   = 'scipaprock_hints';
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

    function loadHintsEnabled() {
      try {
        return localStorage.getItem(HINTS_KEY) === '1';
      } catch (_) {
        return false;
      }
    }

    function saveHintsEnabled() {
      try {
        localStorage.setItem(HINTS_KEY, hintsEnabled ? '1' : '0');
      } catch (_) {
        /* ignore */
      }
    }

    function getTranslatedParams(params) {
      if (!params) return null;
      var translated = Object.assign({}, params);
      if (translated.item) {
        translated.item = I18n.t(translated.item);
      }
      return translated;
    }

    function formatStatus(status) {
      if (!status || !status.key) return '';
      var text = I18n.t(status.key, getTranslatedParams(status.params));
      if (status.key === 'computer_thinking') {
        text += '...';
      }
      return text;
    }

    function renderStatus() {
      var activeStatus = hintsEnabled && previewState
        ? { key: previewState.statusKey, params: previewState.statusParams }
        : baseStatus;
      statusText.textContent = formatStatus(activeStatus);
    }

    function setBaseStatus(key, params) {
      baseStatus = { key: key, params: params || null };
      renderStatus();
    }

    function updateHintsButtons() {
      var label = I18n.t(hintsEnabled ? 'on' : 'off');
      [hintsBtn, mobileHintsBtn].forEach(function (btn) {
        btn.textContent = label;
        btn.classList.toggle('is-active', hintsEnabled);
      });
    }

    function setHintsEnabled(nextValue) {
      hintsEnabled = !!nextValue;
      saveHintsEnabled();
      updateHintsButtons();
      if (!hintsEnabled) {
        clearPreview();
      } else {
        renderStatus();
      }
    }

    function onHintsClick() {
      GameAudio.ensureContext();
      GameAudio.play('ui_click');
      setHintsEnabled(!hintsEnabled);
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
      setBaseStatus('selected_item', { item: item });
      if (previewState) {
        updatePreviewForCell(previewState.row, previewState.col);
      }
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
      clearPreview();
      setBaseStatus('your_turn');
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

      // Measure hex size from CSS variables
      var style = getComputedStyle(document.documentElement);
      var temp = document.createElement('div');
      temp.className = 'hex';
      temp.style.position = 'absolute';
      temp.style.visibility = 'hidden';
      hexGrid.appendChild(temp);
      var hexW = temp.offsetWidth;
      var hexH = temp.offsetHeight;
      hexGrid.removeChild(temp);

      // Pointy-top hex math
      var stepX = hexW + 1;             // horizontal spacing (hex width + small gap)
      var stepY = hexH * 0.75;          // vertical spacing (75% of hex height)
      var offsetX = stepX * 0.5;        // even-row horizontal shift (half step)

      // Total grid dimensions
      var totalW = GRID_SIZE * stepX + offsetX;
      var totalH = (GRID_SIZE - 1) * stepY + hexH;

      hexGrid.style.position = 'relative';
      hexGrid.style.width = totalW + 'px';
      hexGrid.style.height = totalH + 'px';

      for (var r = 0; r < GRID_SIZE; r++) {
        for (var c = 0; c < GRID_SIZE; c++) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'hex empty';
          btn.dataset.row = r;
          btn.dataset.col = c;

          // Position by hex formula
          var x = c * stepX + (r % 2 === 1 ? offsetX : 0);
          var y = r * stepY;

          btn.style.position = 'absolute';
          btn.style.left = x + 'px';
          btn.style.top = y + 'px';
          btn.style.width = hexW + 'px';
          btn.style.height = hexH + 'px';

          btn.addEventListener('pointerdown', onHexPointerDown);
          btn.addEventListener('pointerenter', (function (rr, cc) {
            return function (event) { onHexPointerEnter(rr, cc, event); };
          })(r, c));
          btn.addEventListener('pointerleave', (function (rr, cc) {
            return function (event) { onHexPointerLeave(rr, cc, event); };
          })(r, c));
          btn.addEventListener('focus', (function (rr, cc) {
            return function () { updatePreviewForCell(rr, cc); };
          })(r, c));
          btn.addEventListener('click', (function (rr, cc) {
            return function () { onHexClick(rr, cc); };
          })(r, c));
          hexGrid.appendChild(btn);
        }
      }
    }

    // -------------------------------------------------------------------------
    // Hex click handler
    // -------------------------------------------------------------------------
    function onHexPointerDown(event) {
      lastPointerType = event.pointerType || '';
    }

    function onHexPointerEnter(row, col, event) {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      updatePreviewForCell(row, col);
    }

    function onHexPointerLeave(row, col, event) {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      if (previewState && previewState.row === row && previewState.col === col) {
        clearPreview();
      }
    }

    function onHexClick(row, col) {
      var hex = getHex(row, col);
      var isEmptyCell = !!hex && hex.classList.contains('empty');

      if (!selectedItem) {
        if (!GameEngine.isBusy() && !GameEngine.isGameOver() && isEmptyCell) {
          setBaseStatus('pick_weapon');
          pulsePickers();
        }
        return;
      }

      if (GameEngine.isBusy() || GameEngine.isGameOver()) return;

      var preview = GameEngine.getMovePreview(row, col, selectedItem);
      if (hintsEnabled && preview && !preview.occupied && (lastPointerType === 'touch' || lastPointerType === 'pen')) {
        var samePreview = previewState &&
          previewState.row === row &&
          previewState.col === col &&
          previewState.item === selectedItem;

        if (!samePreview) {
          applyPreview(preview);
          return;
        }
      }

      clearPreview();
      GameAudio.ensureContext();
      GameEngine.playerMove(row, col, selectedItem).then(function (ok) {
        if (ok) clearSelection();
      });
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    function getHex(row, col) {
      return hexGrid.querySelector('.hex[data-row="' + row + '"][data-col="' + col + '"]');
    }

    function getHexCenter(row, col) {
      var hex = getHex(row, col);
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

    function pulsePickers() {
      document.querySelectorAll('.item-picker, .mobile-bottom-bar').forEach(function (el) {
        retriggerClass(el, 'picker-pulse');
        el.addEventListener('animationend', function handler() {
          el.classList.remove('picker-pulse');
          el.removeEventListener('animationend', handler);
        });
      });
    }

    function clearPreview() {
      if (!previewState) {
        renderStatus();
        return;
      }

      var anchorHex = getHex(previewState.row, previewState.col);
      if (anchorHex) {
        anchorHex.classList.remove('preview-anchor', 'preview-has-gain');
      }

      if (previewState.ghostEl && previewState.ghostEl.parentNode) {
        previewState.ghostEl.parentNode.removeChild(previewState.ghostEl);
      }

      if (previewState.gainEl && previewState.gainEl.parentNode) {
        previewState.gainEl.parentNode.removeChild(previewState.gainEl);
      }

      previewState.captures.forEach(function (cell) {
        var hex = getHex(cell.row, cell.col);
        if (hex) hex.classList.remove('preview-capture');
      });

      previewState.threats.forEach(function (cell) {
        var hex = getHex(cell.row, cell.col);
        if (hex) hex.classList.remove('preview-threat');
      });

      previewState = null;
      renderStatus();
    }

    function applyPreview(preview) {
      if (!hintsEnabled || !selectedItem || !preview || preview.occupied) {
        clearPreview();
        return false;
      }

      clearPreview();

      var anchorHex = getHex(preview.row, preview.col);
      if (!anchorHex) return false;

      var ghost = document.createElement('img');
      ghost.src = preview.item + '.png';
      ghost.alt = '';
      ghost.className = 'preview-ghost';
      ghost.setAttribute('aria-hidden', 'true');
      anchorHex.appendChild(ghost);
      anchorHex.classList.add('preview-anchor');

      var gainEl = null;
      if (preview.gain > 0) {
        gainEl = document.createElement('span');
        gainEl.className = 'preview-gain';
        gainEl.textContent = '+' + preview.gain;
        anchorHex.appendChild(gainEl);
        anchorHex.classList.add('preview-has-gain');
      }

      preview.captures.forEach(function (cell) {
        var hex = getHex(cell.row, cell.col);
        if (hex) hex.classList.add('preview-capture');
      });

      preview.threats.forEach(function (cell) {
        var hex = getHex(cell.row, cell.col);
        if (hex) hex.classList.add('preview-threat');
      });

      previewState = {
        row: preview.row,
        col: preview.col,
        item: preview.item,
        captures: preview.captures.slice(),
        threats: preview.threats.slice(),
        ghostEl: ghost,
        gainEl: gainEl,
        statusKey: preview.statusKey,
        statusParams: preview.statusParams || null
      };
      renderStatus();
      return true;
    }

    function updatePreviewForCell(row, col) {
      if (!hintsEnabled || !selectedItem || GameEngine.isBusy() || GameEngine.isGameOver()) {
        clearPreview();
        return false;
      }

      var preview = GameEngine.getMovePreview(row, col, selectedItem);
      if (!preview || preview.occupied) {
        clearPreview();
        return false;
      }

      return applyPreview(preview);
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
      if (isPlayer) {
        hex.classList.add('player-cell');
      }
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
              hex.classList.remove('is-clearing', 'player-cell');
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
      setBaseStatus(key, params);
    }

    function onComputerTurnStart() {
      clearPreview();
      setBaseStatus('computer_thinking');
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
          var hasImg = hex.querySelector('img:not(.preview-ghost)');

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
            hex.classList.remove('is-clearing', 'pop-in', 'hex-ripple', 'player-cell');
            hex.classList.add('empty');
          }
        }
      }
    }

    var lastGameScore = 0;

    function onGameOver(data) {
      GameAudio.play('gameover');
      lastGameScore = data.score;
      goPlaced.textContent = data.stats.totalPlaced;
      goCleared.textContent = data.stats.totalCleared;
      goTurns.textContent = data.stats.turnsPlayed;

      if (data.isNewRecord) {
        goNewRecord.style.display = '';
        setTimeout(function () { GameAudio.play('newrecord'); }, 600);
      } else {
        goNewRecord.style.display = 'none';
      }

      // Reset name input
      var goNameInput = document.getElementById('goNameInput');
      var goNameSection = document.getElementById('goNameSection');
      var goSubmitBtn = document.getElementById('goSubmitBtn');
      goNameInput.value = '';
      goNameSection.style.display = 'flex';
      goSubmitBtn.disabled = false;
      goSubmitBtn.textContent = I18n.t('submit');

      // Load and show leaderboard
      renderLeaderboard();

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
    // Leaderboard
    // -------------------------------------------------------------------------
    function renderLeaderboard(highlightName) {
      Leaderboard.getScores().then(function (scores) {
        var tbody = document.querySelector('#goLeaderboardTable tbody');
        tbody.innerHTML = '';
        if (scores.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" class="lb-empty">' + I18n.t('no_scores') + '</td></tr>';
          return;
        }
        for (var i = 0; i < scores.length; i++) {
          var s = scores[i];
          var tr = document.createElement('tr');
          if (highlightName && s.name === highlightName && s.score === lastGameScore) {
            tr.className = 'lb-highlight';
          }
          tr.innerHTML = '<td class="lb-rank">' + (i + 1) + '</td>' +
            '<td class="lb-name">' + escapeHtml(s.name) + '</td>' +
            '<td class="lb-score">' + s.score + '</td>' +
            '<td class="lb-date">' + s.date + '</td>';
          tbody.appendChild(tr);
        }
      });
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function onSubmitScore() {
      var goNameInput = document.getElementById('goNameInput');
      var goSubmitBtn = document.getElementById('goSubmitBtn');
      var name = goNameInput.value.trim();
      if (!name) {
        goNameInput.focus();
        return;
      }
      goSubmitBtn.disabled = true;
      goSubmitBtn.textContent = '...';
      Leaderboard.addScore(name, lastGameScore).then(function () {
        document.getElementById('goNameSection').style.display = 'none';
        renderLeaderboard(name);
      });
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
        requestAnimationFrame(function () { Particles.resize(); });
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
      // Resize particles now that board is fully visible
      requestAnimationFrame(function () { Particles.resize(); });
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
      updateHintsButtons();
      renderStatus();
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
      clearPreview();
      buildGrid();
      clearSelection();
      Particles.clear();
      GameEngine.startGame();
    }

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    // 1. Theme
    setTheme(loadTheme());
    hintsEnabled = loadHintsEnabled();

    // 2. I18n
    I18n.init();

    // 3. Audio
    GameAudio.init();

    // 4. Particles
    Particles.init(particleCanvas);

    // 5. Build grid
    buildGrid();

    // 5b. Resize particles canvas after grid is laid out
    requestAnimationFrame(function () {
      Particles.resize();
    });

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
    document.getElementById('goSubmitBtn').addEventListener('click', onSubmitScore);
    document.getElementById('goNameInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') onSubmitScore();
    });
    hintsBtn.addEventListener('click', onHintsClick);
    mobileHintsBtn.addEventListener('click', onHintsClick);
    muteBtn.addEventListener('click', onMuteClick);
    mobileMuteBtn.addEventListener('click', onMuteClick);
    langBtn.addEventListener('click', onLangClick);
    titleLangBtn.addEventListener('click', onLangClick);
    mobileLangBtn.addEventListener('click', onLangClick);
    hamburgerBtn.addEventListener('click', onHamburgerClick);
    hexGrid.addEventListener('mouseleave', function () {
      if (lastPointerType !== 'touch' && lastPointerType !== 'pen') {
        clearPreview();
      }
    });
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
    updateHintsButtons();
    updateMuteButtons();
    updateLangButtons();
    renderStatus();

    // 10. Title screen is already visible via HTML class

    // 11. Window resize
    window.addEventListener('resize', function () {
      Particles.resize();
    });
  });
}());
