/* islands/powers.js — Power Volcano (grade 7). */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen, K = Kit, P = "powers";
  function T(o) { o.pre = P; return K.task(o); }
  function near(x) { return function () { return Math.max(1, x + F.rnd(-10, 10)); }; }
  function pw(a, n) { return Math.pow(a, n); }
  function rep(a, n) { var r = []; for (var i = 0; i < n; i++) r.push(a); return r.join(" · "); }

  function square() { var a = F.rnd(2, 15), ans = a * a;
    return T({ q: "calc", p: { e: a + "²" }, ans: ans, wrong: [2 * a, a + 2, ans + a, ans - 1], fill: near(ans), step: a + " · " + a, verify: function (v) { return v === pw(a, 2); } }); }
  function cube() { var a = F.rnd(2, 6), ans = a * a * a;
    return T({ q: "calc", p: { e: a + "³" }, ans: ans, wrong: [3 * a, a * a, ans + a, a + 3], fill: near(ans), step: rep(a, 3), verify: function (v) { return v === pw(a, 3); } }); }
  function pow10() { var n = F.rnd(2, 6), ans = pw(10, n);
    return T({ q: "calc", p: { e: "10" + K.sup(n) }, ans: ans, wrong: [10 * n, ans * 10, ans / 10], fill: function () { return pw(10, F.rnd(1, 7)); }, step: "1" + "0".repeat(n) + "  (" + n + " × 0)", verify: function (v) { return v === pw(10, n); } }); }
  function pow2() { var b = F.pick([2, 2, 3]), n = b === 2 ? F.rnd(3, 10) : F.rnd(2, 5), ans = pw(b, n);
    return T({ q: "calc", p: { e: b + K.sup(n) }, ans: ans, wrong: [b * n, pw(b, n - 1), ans + b, pw(n, b) === ans ? ans * b : pw(n, b)], fill: near(ans), step: rep(b, n), verify: function (v) { return v === pw(b, n); } }); }
  function expr() { var a = F.rnd(2, 9), b = F.rnd(2, 4), ans = a * a + b * b * b;
    return T({ q: "calc", p: { e: a + "² + " + b + "³" }, ans: ans, wrong: [2 * a + 3 * b, pw(a + b, 2), ans + 1, a * a + b * 3], fill: near(ans), step: a * a + " + " + b * b * b, verify: function (v) { return v === pw(a, 2) + pw(b, 3); } }); }
  function findExp() { var b = F.pick([2, 3, 5, 10]), n = F.rnd(2, b === 2 ? 8 : 4), N = pw(b, n);
    return T({ q: "findExp", p: { b: b, n: N }, ans: n, wrong: [n + 1, n - 1, N / b], fill: function () { return F.rnd(1, 10); }, step: N + " = " + rep(b, n), verify: function (v) { return pw(b, v) === N; } }); }

  TaskGen.register(P, { square: square, cube: cube, pow10: pow10, pow2: pow2, expr: expr, findExp: findExp });

  function dots(a) { return K.rect(a, a, 1); }
  var sl = [{ id: "a", min: 1, max: 10, v: 2 }, { id: "n", min: 1, max: 6, v: 3 }];
  window.ISLAND_IMPL[P] = {
    renderLesson: function (el) { K.lesson(el, P, [
      function () { return '<p class="extra">2 · 2 · 2 = 2³ = 8</p>'; },
      function () { return '<p class="extra">2³: 2 — ' + UI.esc(t(P + ".base")) + ", 3 — " + UI.esc(t(P + ".exp")) + "</p>"; },
      function () { return dots(4) + '<p class="extra">4² = 16</p>'; },
      function () { return '<p class="extra">10³ = 1000<br>10⁶ = 1 000 000</p>'; },
      function () { return '<p class="extra">3 + 2² = 3 + 4 = 7</p>'; }]); },
    renderSandbox: function (el) { K.sandbox(el, P, sl, function (v) {
      return '<p class="extra">' + v.a + K.sup(v.n) + " = " + rep(v.a, v.n) + " = <b>" + pw(v.a, v.n) + "</b></p>" + (v.n === 2 ? dots(v.a) : ""); }); },
    gameTitleKey: P + ".gameTitle", gameIntroKey: P + ".gameIntro",
    generators: { easy: [square, cube, pow10], medium: [pow2, expr, cube], hard: [findExp, expr, pow2] },
    renderVisual: function () { return ""; }
  };
})();
