(function () {
  'use strict';

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
      best_score: 'Best Score',
      difficulty: 'Difficulty',
      your_turn: 'Pick a piece and place it on the board',
      computer_thinking: 'Computer is thinking',
      pick_weapon: 'Pick a weapon first',
      cell_occupied: 'Cell is occupied. Choose an empty one.',
      selected_item: 'Selected: {item}. Click a cell.',
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
      tutorial_step1_title: 'Pick a Piece',
      tutorial_step1: 'Choose rock, scissors, or paper from the panel.',
      tutorial_step2_title: 'Place It',
      tutorial_step2: 'Tap any empty cell on the board.',
      tutorial_step3_title: 'Capture',
      tutorial_step3: 'Your piece removes losing neighbours — as long as nothing nearby beats you.',
      skip: 'Skip',
      next: 'Next',
      prev: 'Back',
      mute: 'Sound',
      language: 'Language',
      skins: 'Theme',
      figures_word: 'pieces',
      computer_places: 'Computer places {n} pieces...',
      leaderboard: 'Leaderboard',
      enter_name: 'Your name',
      submit: 'Submit',
      no_scores: 'No scores yet',
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
      leaderboard: 'Таблица лидеров',
      enter_name: 'Ваше имя',
      submit: 'Отправить',
      no_scores: 'Пока нет результатов',
    },
  };

  let currentLang = 'en';

  function getLang() {
    return currentLang;
  }

  function setLang(code) {
    if (!strings[code]) return;
    currentLang = code;
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (_) {
      // localStorage may be unavailable (private browsing, etc.)
    }
  }

  function t(key, params) {
    const map = strings[currentLang] || strings['en'];
    let str = Object.prototype.hasOwnProperty.call(map, key)
      ? map[key]
      : (strings['en'][key] || key);

    if (params && typeof params === 'object') {
      str = str.replace(/\{(\w+)\}/g, function (match, name) {
        return Object.prototype.hasOwnProperty.call(params, name)
          ? params[name]
          : match;
      });
    }

    return str;
  }

  function applyLang() {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      el.textContent = t(el.dataset.i18n);
    }
    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholders.length; j++) {
      var el2 = placeholders[j];
      el2.placeholder = t(el2.dataset.i18nPlaceholder);
    }
  }

  function init() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}

    if (saved && strings[saved]) {
      currentLang = saved;
    } else {
      var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
      if (nav.startsWith('ru')) {
        currentLang = 'ru';
      } else {
        currentLang = 'en';
      }
    }

    applyLang();
  }

  window.I18n = {
    strings: strings,
    t: t,
    setLang: setLang,
    getLang: getLang,
    applyLang: applyLang,
    init: init,
  };
})();
