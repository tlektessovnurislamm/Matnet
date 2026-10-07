/* islands/functions.js — Linear Function Lighthouse (grade 7): y = kx + b. */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen, K = Kit, P = "functions";
  function T(o) { o.pre = P; return K.task(o); }
  function nzk() { var k = F.rnd(1, 4); return F.rnd(0, 1) ? k : -k; }
  function fillI(r) { return function () { return F.rnd(-r, r); }; }

  function yAt() { var k = nzk(), b = F.rnd(-5, 5), x = F.rnd(-4, 5), ans = k * x + b;
    return T({ q: "yAt", p: { f: K.lineStr(k, b), x: K.minus(x) }, ans: ans, wrong: [k * x - b, k + x + b, -ans, ans + 1], fill: fillI(25), step: "y = " + K.minus(k) + " · " + (x < 0 ? "(" + K.minus(x) + ")" : x) + K.sgn(b), verify: function (v) { return v - b === k * x; } }); }
  function readB() { var k = nzk(), b = F.rnd(-5, 5); if (b === k) b = k + 1 > 5 ? k - 1 : k + 1;
    return T({ q: "readB", p: { f: K.lineStr(k, b) }, ans: b, wrong: [k, -b, b + 1], fill: fillI(6), step: "x = 0:  y = " + K.minus(k) + " · 0" + K.sgn(b), visual: { k: k, b: b }, verify: function (v) { return v === k * 0 + b; } }); }
  function slope() { var k = nzk(), b = F.rnd(-3, 3);
    return T({ q: "slope", p: { b: K.minus(b), b1: K.minus(b + k) }, ans: k, wrong: [b, -k, b + k, k + 1], fill: fillI(5), step: K.minus(b + k) + " − (" + K.minus(b) + ") = " + K.minus(k), visual: { k: k, b: b, pts: 1 }, verify: function (v) { return v + b === b + k; } }); }
  function xAt() { var k = nzk(), x = F.rnd(-5, 5), b = F.rnd(-5, 5), y = k * x + b;
    return T({ q: "xAt", p: { f: K.lineStr(k, b), y: K.minus(y) }, ans: x, wrong: [y, -x, x + 1, y - b], fill: fillI(8), step: K.minus(k) + "x = " + K.minus(y) + " − (" + K.minus(b) + ") = " + K.minus(y - b), verify: function (v) { return k * v + b === y; } }); }
  function zero() { var k = nzk(), m = F.rnd(-5, 5), b = -k * m;
    return T({ q: "zero", p: { f: K.lineStr(k, b) }, ans: m, wrong: [b, -m, m + 1], fill: fillI(8), step: K.minus(k) + "x" + K.sgn(b) + " = 0", visual: { k: k, b: b }, verify: function (v) { return k * v + b === 0; } }); }

  TaskGen.register(P, { yAt: yAt, readB: readB, slope: slope, xAt: xAt, zero: zero });

  function table(k, b) { var h = '<table class="kit-table"><tr><th>x</th>'; var xs = [-1, 0, 1, 2];
    xs.forEach(function (x) { h += "<td>" + K.minus(x) + "</td>"; }); h += "</tr><tr><th>y</th>";
    xs.forEach(function (x) { h += "<td>" + K.minus(k * x + b) + "</td>"; }); return h + "</tr></table>"; }
  var sl = [{ id: "k", min: -3, max: 3, v: 2 }, { id: "b", min: -4, max: 4, v: 1 }];
  window.ISLAND_IMPL[P] = {
    renderLesson: function (el) { K.lesson(el, P, [
      function () { return '<p class="extra">y = 2x + 1</p>' + table(2, 1); },
      function () { return K.plane([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: -1, y: -1 }], { k: 2, b: 1 }); },
      function () { return K.plane([], { k: 2, b: 0 }) + '<p class="extra">k = 2</p>'; },
      function () { return K.plane([{ x: 0, y: -2, l: "b = −2" }], { k: 1, b: -2 }); },
      function () { return K.plane([], { k: -1, b: 3 }) + '<p class="extra">k = −1</p>'; }]); },
    renderSandbox: function (el) { K.sandbox(el, P, sl, function (v) {
      return '<p class="extra">' + K.lineStr(v.k, v.b).replace("y = x", "y = 1x").replace("0x", "0") + "</p>" + K.plane([{ x: 0, y: v.b }], { k: v.k, b: v.b }) + table(v.k, v.b); }); },
    gameTitleKey: P + ".gameTitle", gameIntroKey: P + ".gameIntro",
    generators: { easy: [yAt, readB, yAt], medium: [xAt, slope, readB], hard: [zero, xAt, slope] },
    renderVisual: function (v) { return K.plane(v.pts ? [{ x: 0, y: v.b }, { x: 1, y: v.b + v.k }] : [], { k: v.k, b: v.b }); }
  };
})();
