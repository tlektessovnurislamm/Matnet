/* islands/algebra.js — Expressions Island (grades 5–7): order of operations, letters, like terms, brackets. */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen, K = Kit, P = "algebra";
  function T(o) { o.pre = P; return K.task(o); }
  function near(x) { return function () { return Math.max(1, x + F.rnd(-8, 8)); }; }

  function order() { var a = F.rnd(2, 20), b = F.rnd(2, 9), c = F.rnd(2, 9), ans = a + b * c;
    return T({ q: "calc", p: { e: a + " + " + b + " · " + c }, ans: ans, wrong: [(a + b) * c, a + b + c, ans + 1], fill: near(ans), step: b + " · " + c + " = " + b * c + ";  " + a + " + " + b * c, verify: function (v) { return v - a === b * c; } }); }
  function brackets() { var a = F.rnd(2, 12), b = F.rnd(2, 9), c = F.rnd(2, 6), ans = (a + b) * c;
    return T({ q: "calc", p: { e: "(" + a + " + " + b + ") · " + c }, ans: ans, wrong: [a + b * c, a * c + b, ans + c], fill: near(ans), step: a + " + " + b + " = " + (a + b) + ";  " + (a + b) + " · " + c, verify: function (v) { return v / c === a + b; } }); }
  function evaluate() { var k = F.rnd(2, 9), b = F.rnd(1, 15), x = F.rnd(1, 10), ans = k * x + b;
    return T({ q: "eval", p: { e: k + "a + " + b, v: x }, ans: ans, wrong: [k + x + b, k * (x + b), ans + k, Number(String(k) + String(x)) + b], fill: near(ans), step: k + " · " + x + " + " + b + " = " + k * x + " + " + b, verify: function (v) { return v === k * x + b; } }); }
  function like() { var k = F.rnd(2, 12), m = F.rnd(2, 12), sub = F.rnd(0, 1) && k > m, ans = sub ? k - m : k + m;
    return T({ q: "like", p: { e: k + "x " + (sub ? "−" : "+") + " " + m + "x" }, ans: ans, wrong: [sub ? k + m : Math.abs(k - m) || 1, k * m, ans + 1], fill: near(ans), step: "(" + k + (sub ? " − " : " + ") + m + ")x", verify: function (v) { return v === (sub ? k - m : k + m); } }); }
  function distrib() { var k = F.rnd(2, 9), m = F.rnd(2, 12), ans = k * m;
    return T({ q: "distrib", p: { e: k + "(x + " + m + ")", k: k }, ans: ans, wrong: [m, k + m, ans + k], fill: near(ans), step: k + " · x + " + k + " · " + m, verify: function (v) { return v === k * m; } }); }

  TaskGen.register(P, { order: order, brackets: brackets, evaluate: evaluate, like: like, distrib: distrib });

  var sl = [{ id: "a", min: 0, max: 10, v: 3 }];
  window.ISLAND_IMPL[P] = {
    renderLesson: function (el) { K.lesson(el, P, [
      function () { return '<p class="extra">2 + 3 · 4 = 2 + 12 = 14<br>(2 + 3) · 4 = 5 · 4 = 20</p>'; },
      function () { return '<p class="kit-emoji">🍬 = a</p><p class="extra">3a + 2</p>'; },
      function () { return '<p class="extra">a = 4:  3 · 4 + 2 = 14</p>'; },
      function () { return '<p class="extra">3x + 5x = 8x</p>'; },
      function () { return '<p class="extra">2(x + 3) = 2x + 6</p>'; }]); },
    renderSandbox: function (el) { K.sandbox(el, P, sl, function (v) {
      return '<p class="extra">2a + 3 = 2 · ' + v.a + " + 3 = <b>" + (2 * v.a + 3) + "</b><br>3(a + 1) = 3 · " + (v.a + 1) + " = <b>" + 3 * (v.a + 1) + "</b><br>a² = <b>" + v.a * v.a + "</b></p>"; }); },
    gameTitleKey: P + ".gameTitle", gameIntroKey: P + ".gameIntro",
    generators: { easy: [order, brackets, evaluate], medium: [evaluate, like, order], hard: [distrib, like, brackets] },
    renderVisual: function () { return ""; }
  };
})();
