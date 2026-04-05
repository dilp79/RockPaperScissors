(function () {
  'use strict';

  const STORAGE_KEY = 'scipaprock_muted';

  let ctx = null;
  let muted = false;
  const buffers = {};

  // ---------------------------------------------------------------------------
  // Context management
  // ---------------------------------------------------------------------------

  function ensureContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // ---------------------------------------------------------------------------
  // Mute control
  // ---------------------------------------------------------------------------

  function setMuted(val) {
    muted = !!val;
    try {
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch (_) {}
  }

  function isMuted() {
    return muted;
  }

  function toggleMute() {
    setMuted(!muted);
    return muted;
  }

  // ---------------------------------------------------------------------------
  // MP3 buffer helpers
  // ---------------------------------------------------------------------------

  async function loadBuffer(name, path) {
    try {
      const ac = ensureContext();
      const response = await fetch(path);
      const arrayBuf = await response.arrayBuffer();
      const decoded = await ac.decodeAudioData(arrayBuf);
      buffers[name] = decoded;
    } catch (_) {
      // fail silently
    }
  }

  function playBuffer(buffer, volume) {
    if (!buffer) return;
    const ac = ensureContext();
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(volume !== undefined ? volume : 1, ac.currentTime);
    source.connect(gain);
    gain.connect(ac.destination);
    source.start();
  }

  // ---------------------------------------------------------------------------
  // Synthesized sounds
  // ---------------------------------------------------------------------------

  function playSelect() {
    const ac = ensureContext();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const now = ac.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  function playPlace() {
    const ac = ensureContext();
    const now = ac.currentTime;

    // 200Hz square wave thud, 120ms
    const osc1 = ac.createOscillator();
    const gain1 = ac.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(200, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ac.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // 80Hz sawtooth noise burst, 60ms
    const osc2 = ac.createOscillator();
    const gain2 = ac.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(80, now);
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc2.connect(gain2);
    gain2.connect(ac.destination);
    osc2.start(now);
    osc2.stop(now + 0.06);
  }

  function playCombo() {
    // C5-E5-G5 ascending arpeggio, 100ms each, triangle
    const ac = ensureContext();
    const notes = [523.25, 659.25, 783.99];
    const spacing = 0.1;
    const now = ac.currentTime;

    notes.forEach(function (freq, i) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const start = now + i * spacing;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.1);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + 0.1);
    });
  }

  function playGameover() {
    // A4-F4-D4 descending, 150ms spacing, sine, 600ms decay
    const ac = ensureContext();
    const notes = [440, 349.23, 293.66];
    const spacing = 0.15;
    const decay = 0.6;
    const now = ac.currentTime;

    notes.forEach(function (freq, i) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const start = now + i * spacing;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + decay);
    });
  }

  function playNewrecord() {
    // C4-E4-G4-C5 ascending, 80ms spacing, triangle, 300ms decay
    const ac = ensureContext();
    const notes = [261.63, 329.63, 392, 523.25];
    const spacing = 0.08;
    const decay = 0.3;
    const now = ac.currentTime;

    notes.forEach(function (freq, i) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const start = now + i * spacing;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + decay);
    });
  }

  // ---------------------------------------------------------------------------
  // Dispatch table
  // ---------------------------------------------------------------------------

  const synthSounds = {
    select: playSelect,
    place: playPlace,
    combo: playCombo,
    gameover: playGameover,
    newrecord: playNewrecord,
  };

  const mp3Sounds = {
    ui_click: 'button_click.mp3',
    capture: 'victory.mp3',
  };

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  function play(name) {
    if (muted) return;
    ensureContext();

    if (synthSounds[name]) {
      synthSounds[name]();
      return;
    }

    if (mp3Sounds[name] !== undefined) {
      playBuffer(buffers[name], 1);
      return;
    }
  }

  function init() {
    // Load mute preference
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        muted = stored === '1';
      }
    } catch (_) {}

    // Preload mp3 buffers
    Object.keys(mp3Sounds).forEach(function (name) {
      loadBuffer(name, mp3Sounds[name]);
    });
  }

  // ---------------------------------------------------------------------------
  // Expose on window
  // ---------------------------------------------------------------------------

  window.Audio = window.Audio || {};
  window.Audio = {
    play: play,
    setMuted: setMuted,
    isMuted: isMuted,
    toggleMute: toggleMute,
    ensureContext: ensureContext,
    init: init,
  };
})();
