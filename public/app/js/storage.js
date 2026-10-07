/* storage.js — the only place that touches localStorage.
 * Everything the app remembers lives in one JSON object under one key.
 * Named "Store" because window.Storage already exists in browsers. */
var Store = (function () {
  var KEY = "mathIslands.v1";

  function defaults() {
    return {
      lang: null,                       // "kz" | "ru" | null (= detect)
      points: 0,
      unlocked: ["fractions"],          // island ids the child can open
      keys: [],                         // islands where a key was earned
      islands: {},                      // per island: {stars, attempts, correct, timeMs, plays, best}
      medals: [],
      streak: { count: 0, last: null }, // daily streak, last = "YYYY-MM-DD"
      settings: { sound: true, fontScale: 1 },
      avatar: { owned: [], worn: [] },
      askHistory: []                    // "Ask Fox": [{q, a, steps:[{k,p}], time}]
    };
  }

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY));
      var d = defaults();
      if (raw && typeof raw === "object") {
        for (var k in d) if (raw[k] !== undefined) d[k] = raw[k];
      }
      return d;
    } catch (e) {
      return defaults();
    }
  }

  var state = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: ignore */ }
    if (typeof window.onStoreSave === "function") window.onStoreSave(state);
  }
  /* Progress fields only (no lang/settings) — what gets synced to the student's cloud profile. */
  function progressPart() {
    var out = {}, d = defaults();
    for (var k in d) if (k !== "lang" && k !== "settings") out[k] = state[k];
    return out;
  }
  function setProgress(obj) {
    var keep = { lang: state.lang, settings: state.settings };
    state = defaults();
    if (obj && typeof obj === "object") for (var k in state) if (obj[k] !== undefined) state[k] = obj[k];
    state.lang = keep.lang; state.settings = keep.settings;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  return {
    get: function () { return state; },
    save: save,
    progressPart: progressPart,
    setProgress: setProgress,
    /* Reset learning progress but keep language and accessibility settings. */
    reset: function () {
      var keep = { lang: state.lang, settings: state.settings };
      state = defaults();
      state.lang = keep.lang;
      state.settings = keep.settings;
      save();
    }
  };
})();
