/* islands/data.js — Statistics Shore (grades 5–7): charts, mean, range, mode, median. */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen, K = Kit, P = "data";
  function T(o) { o.pre = P; return K.task(o); }
  function near(x) { return function () { return Math.max(0, x + F.rnd(-6, 6)); }; }
  function sum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }
  function days() { return tList(P + ".days"); }
  function list(n, lo, hi) { var a = []; for (var i = 0; i < n; i++) a.push(F.rnd(lo, hi)); return a; }

  function bar() { var v = list(5, 1, 10), i = F.rnd(0, 4), d = days();
    return T({ q: "bar", p: { d: d[i] }, ans: v[i], wrong: [v[(i + 1) % 5], v[i] + 1, v[i] - 1], fill: near(v[i]), step: d[i] + ": " + v[i], visual: { v: v }, verify: function (x) { return x === v[i]; } }); }
  function total() { var v = list(5, 1, 9), s = sum(v);
    return T({ q: "total", p: {}, ans: s, wrong: [s + 1, s - 2, Math.max.apply(null, v) * 5], fill: near(s), step: v.join(" + "), visual: { v: v }, verify: function (x) { return x === sum(v); } }); }
  function range() { var v = list(F.rnd(5, 6), 2, 40), mx = Math.max.apply(null, v), mn = Math.min.apply(null, v); if (mx === mn) v[0] = mn + 5;
    mx = Math.max.apply(null, v); mn = Math.min.apply(null, v);
    return T({ q: "range", p: { l: v.join("; ") }, ans: mx - mn, wrong: [mx, mn, mx + mn], fill: near(mx - mn), step: mx + " − " + mn, verify: function (x) { return x === mx - mn; } }); }
  function mean() { var n = F.pick([3, 4, 5]), m = F.rnd(4, 20), v;
    do { v = list(n - 1, m - 5, m + 5); v.push(m * n - sum(v)); } while (v[n - 1] < 1);
    return T({ q: "mean", p: { l: v.join("; ") }, ans: m, wrong: [sum(v), m + 1, m - 1, Math.max.apply(null, v)], fill: near(m), step: "(" + v.join(" + ") + ") : " + n + " = " + sum(v) + " : " + n, verify: function (x) { return x * n === sum(v); } }); }
  function mode() { var m = F.rnd(1, 15), v = [m, m, m], o; while (v.length < 6) { o = F.rnd(1, 15); if (o !== m && v.filter(function (z) { return z === o; }).length < 2) v.push(o); } v = F.shuffle(v);
    return T({ q: "mode", p: { l: v.join("; ") }, ans: m, wrong: [v.filter(function (z) { return z !== m; })[0], m + 1, 3], fill: function () { return F.rnd(1, 15); }, step: m + " — 3", verify: function (x) { return v.filter(function (z) { return z === x; }).length === 3; } }); }
  function median() { var v = []; while (v.length < 5) { var r = F.rnd(1, 30); if (v.indexOf(r) < 0) v.push(r); } var s = v.slice().sort(function (a, b) { return a - b; }), md = s[2];
    return T({ q: "median", p: { l: v.join("; ") }, ans: md, wrong: [v[2] === md ? s[1] : v[2], s[3], Math.round(sum(v) / 5) === md ? md + 1 : Math.round(sum(v) / 5)], fill: function () { return F.rnd(1, 30); }, step: s.join("; "), verify: function (x) { return s.filter(function (z) { return z < x; }).length === 2 && s.indexOf(x) >= 0; } }); }

  TaskGen.register(P, { bar: bar, total: total, range: range, mean: mean, mode: mode, median: median });

  var sl = [{ id: "a", min: 0, max: 10, v: 4 }, { id: "b", min: 0, max: 10, v: 7 }, { id: "c", min: 0, max: 10, v: 3 }, { id: "d", min: 0, max: 10, v: 6 }];
  var fruits = ["🍎", "🍐", "🍌", "🍇"];
  window.ISLAND_IMPL[P] = {
    renderLesson: function (el) { K.lesson(el, P, [
      function () { return K.bars([4, 7, 3, 6], fruits); },
      function () { return K.bars([4, 7, 3, 6], fruits) + '<p class="extra">(4 + 7 + 3 + 6) : 4 = 5</p>'; },
      function () { return '<p class="extra">7 − 3 = 4</p>'; },
      function () { return '<p class="extra">2; 5; 5; 8; 5 → 5</p>'; },
      function () { return '<p class="extra">1; 3; <b>4</b>; 8; 9</p>'; }]); },
    renderSandbox: function (el) { K.sandbox(el, P, sl, function (v) {
      var a = [v.a, v.b, v.c, v.d], s = sum(a), mn = Math.min.apply(null, a), mx = Math.max.apply(null, a);
      return K.bars(a, fruits) + '<p class="extra">' + UI.esc(t(P + ".sbMean")) + ": " + s + " : 4 = " + F.dec(s * 25, 100) + "<br>" + UI.esc(t(P + ".sbRange")) + ": " + mx + " − " + mn + " = " + (mx - mn) + "</p>"; }); },
    gameTitleKey: P + ".gameTitle", gameIntroKey: P + ".gameIntro",
    generators: { easy: [bar, total, range], medium: [mean, mode, bar], hard: [median, mean, range] },
    renderVisual: function (v) { return K.bars(v.v, days().map(function (d) { return d.slice(0, 2); })); }
  };
})();
