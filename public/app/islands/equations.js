/* islands/equations.js — Equation Scales (grades 5–6). */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen, K = Kit, P = "equations";
  function T(o) { o.pre = P; return K.task(o); }
  function near(x) { return function () { return Math.max(1, x + F.rnd(-6, 6)); }; }

  function add() { var x = F.rnd(2, 60), a = F.rnd(2, 40), b = x + a;
    return T({ q: "add", p: { a: a, b: b }, ans: x, wrong: [b + a, x + 1, x - 1, a], fill: near(x), step: "x = " + b + " − " + a, visual: { l: "x + " + a, r: b }, verify: function (v) { return v + a === b; } }); }
  function sub() { var x = F.rnd(10, 80), a = F.rnd(2, x - 1), b = x - a;
    return T({ q: "sub", p: { a: a, b: b }, ans: x, wrong: [b - a > 0 ? b - a : b + 1, x + 1, x - 10, a], fill: near(x), step: "x = " + b + " + " + a, visual: { l: "x − " + a, r: b }, verify: function (v) { return v - a === b; } }); }
  function mul() { var a = F.rnd(2, 9), x = F.rnd(2, 12), b = a * x;
    return T({ q: "mul", p: { a: a, b: b }, ans: x, wrong: [b - a, b + a, x + 1, x * 2], fill: near(x), step: "x = " + b + " : " + a, visual: { l: a + "x", r: b }, verify: function (v) { return a * v === b; } }); }
  function div() { var a = F.rnd(2, 9), b = F.rnd(2, 12), x = a * b;
    return T({ q: "div", p: { a: a, b: b }, ans: x, wrong: [a + b, x + a, x - b, b], fill: near(x), step: "x = " + b + " · " + a, visual: { l: "x : " + a, r: b }, verify: function (v) { return v / a === b; } }); }
  function subx() { var a = F.rnd(20, 99), x = F.rnd(2, a - 2), b = a - x;
    return T({ q: "subx", p: { a: a, b: b }, ans: x, wrong: [a + b, x + 1, x - 1, b], fill: near(x), step: "x = " + a + " − " + b, visual: { l: a + " − x", r: b }, verify: function (v) { return a - v === b; } }); }
  function two() { var a = F.rnd(2, 6), x = F.rnd(2, 10), b = F.rnd(1, 15), c = a * x + b;
    return T({ q: "two", p: { a: a, b: b, c: c }, ans: x, wrong: [(c + b) / a === Math.floor((c + b) / a) ? (c + b) / a : x + 2, c - b, x + 1, x - 1], fill: near(x), step: a + "x = " + c + " − " + b + " = " + (c - b) + ";  x = " + (c - b) + " : " + a, visual: { l: a + "x + " + b, r: c }, verify: function (v) { return a * v + b === c; } }); }

  TaskGen.register(P, { add: add, sub: sub, mul: mul, div: div, subx: subx, two: two });

  var sl = [{ id: "x", min: 0, max: 10, v: 2 }];
  window.ISLAND_IMPL[P] = {
    renderLesson: function (el) { K.lesson(el, P, [
      function () { return K.balance("5", "5", 0); },
      function () { return K.balance("x + 3", "7", 0); },
      function () { return K.balance("x", "7 − 3", 0); },
      function () { return K.balance("3x", "12", 0); },
      function () { return K.balance("4 + 3", "7", 0); }]); },
    renderSandbox: function (el) { K.sandbox(el, P, sl, function (v) { var l = 2 * v.x + 3;
      return K.balance("2·" + v.x + " + 3", "11", l > 11 ? -1 : l < 11 ? 1 : 0) + '<p class="extra">2 · ' + v.x + " + 3 = " + l + "  " + (l === 11 ? "= 11 ✔ " + UI.esc(t(P + ".sbYes")) : (l < 11 ? "<" : ">") + " 11") + "</p>"; }); },
    gameTitleKey: P + ".gameTitle", gameIntroKey: P + ".gameIntro",
    generators: { easy: [add, sub, mul], medium: [mul, div, subx], hard: [two, subx, div] },
    renderVisual: function (v) { return K.balance(v.l, String(v.r), 0); }
  };
})();
