// leaderboard.js — Leaderboard with localStorage + optional remote backend
(function () {
  'use strict';

  var STORAGE_KEY = 'scipaprock_leaderboard';
  var MAX_ENTRIES = 10;

  // Remote backend config — set these to enable cloud leaderboard
  // For jsonbin.io: set BIN_ID and API_KEY
  var BIN_ID = '';  // e.g. '665f...'
  var API_KEY = ''; // e.g. '$2a$10$...'

  function getLocal() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(data)) return data;
    } catch (_) {}
    return [];
  }

  function saveLocal(scores) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, MAX_ENTRIES)));
    } catch (_) {}
  }

  // Fetch remote scores (jsonbin.io)
  async function fetchRemote() {
    if (!BIN_ID) return null;
    try {
      var url = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
      var headers = {};
      if (API_KEY) headers['X-Master-Key'] = API_KEY;
      var resp = await fetch(url, { headers: headers });
      if (!resp.ok) return null;
      var json = await resp.json();
      var data = json.record || json;
      return Array.isArray(data.scores) ? data.scores : null;
    } catch (_) {
      return null;
    }
  }

  // Push scores to remote
  async function pushRemote(scores) {
    if (!BIN_ID || !API_KEY) return;
    try {
      await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
        },
        body: JSON.stringify({ scores: scores.slice(0, MAX_ENTRIES) }),
      });
    } catch (_) {}
  }

  // Get merged leaderboard (local + remote)
  async function getScores() {
    var local = getLocal();
    var remote = await fetchRemote();
    if (!remote) return local;

    // Merge: combine, dedupe by name+score+date, sort, take top N
    var all = local.concat(remote);
    var seen = {};
    var unique = [];
    for (var i = 0; i < all.length; i++) {
      var key = all[i].name + '|' + all[i].score + '|' + all[i].date;
      if (!seen[key]) {
        seen[key] = true;
        unique.push(all[i]);
      }
    }
    unique.sort(function (a, b) { return b.score - a.score; });
    return unique.slice(0, MAX_ENTRIES);
  }

  // Add a score entry
  async function addScore(name, score) {
    var entry = {
      name: name.trim().substring(0, 20),
      score: score,
      date: new Date().toISOString().split('T')[0],
    };

    var scores = await getScores();
    scores.push(entry);
    scores.sort(function (a, b) { return b.score - a.score; });
    scores = scores.slice(0, MAX_ENTRIES);

    saveLocal(scores);
    pushRemote(scores); // fire and forget

    return scores;
  }

  // Check if score qualifies for leaderboard
  function qualifies(score) {
    var local = getLocal();
    if (local.length < MAX_ENTRIES) return true;
    return score > local[local.length - 1].score;
  }

  window.Leaderboard = {
    getScores: getScores,
    addScore: addScore,
    qualifies: qualifies,
  };
})();
