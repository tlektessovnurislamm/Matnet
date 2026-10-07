/* islands/geometry.js — Geometry Island (grades 4–6): perimeter, area, angles, volume. */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen, K = Kit, P = "geometry";
  function T(o) { o.pre = P; return K.task(o); }
  function near(x) { return function () { return Math.max(1, x + F.rnd(-8, 8)); }; }

  function perim() { var a = F.rnd(3, 15), b = F.rnd(2, 12); if (a === b) a++; var ans = 2 * (a + b);
    return T({ q: "perim", p: { a: a, b: b }, ans: ans, wrong: [a * b, a + b, ans + 2, 2 * a + b], fill: near(ans), step: "P = 2 · (" + a + " + " + b + ")", visual: { r: [a, b] }, verify: function (v) { return v === a + b + a + b; } }); }
  function area() { var a = F.rnd(3, 12), b = F.rnd(2, 9); if (a === b) a++; var ans = a * b;
    return T({ q: "area", p: { a: a, b: b }, ans: ans, wrong: [2 * (a + b), a + b, ans + a, ans - b], fill: near(ans), step: "S = " + a + " · " + b, visual: { r: [a, b], g: 1 }, verify: function (v) { return v / a === b; } }); }
  function square() { var a = F.rnd(2, 12), ar = F.rnd(0, 1), ans = ar ? a * a : 4 * a;
    return T({ q: ar ? "sqArea" : "sqPerim", p: { a: a }, ans: ans, wrong: [ar ? 4 * a : a * a, 2 * a, ans + a, a + 4], fill: near(ans), step: ar ? "S = " + a + " · " + a : "P = 4 · " + a, visual: { r: [a, a], g: ar }, verify: function (v) { return ar ? v === a * a : v === a + a + a + a; } }); }
  function angle() { var a = F.rnd(30, 90), b = F.rnd(20, 150 - a), ans = 180 - a - b;
    return T({ q: "angle", p: { a: a, b: b }, ans: ans, wrong: [360 - a - b, a + b, 90 - a > 0 ? 90 - a : ans + 10, ans + 10], fill: near(ans), step: "180° − " + a + "° − " + b + "°", visual: { t: [a, b] }, verify: function (v) { return v + a + b === 180; } }); }
  function rightTri() { var a = 2 * F.rnd(1, 7), b = F.rnd(2, 12), ans = a * b / 2;
    return T({ q: "rightTri", p: { a: a, b: b }, ans: ans, wrong: [a * b, a + b, ans + 1, 2 * (a + b)], fill: near(ans), step: "S = " + a + " · " + b + " : 2", visual: { r: [a, b] }, verify: function (v) { return 2 * v === a * b; } }); }
  function side() { var a = F.rnd(2, 12), b = F.rnd(2, 12), s = a * b;
    return T({ q: "side", p: { s: s, a: a }, ans: b, wrong: [s - a, s / 2 === Math.floor(s / 2) ? s / 2 : b + 2, b + 1, a], fill: near(b), step: "b = " + s + " : " + a, verify: function (v) { return v * a === s; } }); }
  function volume() { var a = F.rnd(2, 8), b = F.rnd(2, 6), c = F.rnd(2, 5), ans = a * b * c;
    return T({ q: "volume", p: { a: a, b: b, c: c }, ans: ans, wrong: [a + b + c, a * b, 2 * (a * b + b * c + a * c), ans + c], fill: near(ans), step: "V = " + a + " · " + b + " · " + c, verify: function (v) { return v / c === a * b; } }); }

  TaskGen.register(P, { perim: perim, area: area, square: square, angle: angle, rightTri: rightTri, side: side, volume: volume });

  var sl = [{ id: "a", min: 1, max: 10, v: 5 }, { id: "b", min: 1, max: 6, v: 3 }];
  window.ISLAND_IMPL[P] = {
    renderLesson: function (el) { K.lesson(el, P, [
      function () { return K.rect(5, 3, 0); },
      function () { return K.rect(5, 3, 1); },
      function () { return K.rect(4, 4, 1); },
      function () { return K.triangle(60, 50, "70°"); },
      function () { return '<p class="kit-emoji">📦</p><p class="extra">V = a · b · c</p>'; }]); },
    renderSandbox: function (el) { K.sandbox(el, P, sl, function (v) {
      return K.rect(v.a, v.b, 1) + '<p class="extra">P = 2 · (' + v.a + " + " + v.b + ") = " + 2 * (v.a + v.b) + "<br>S = " + v.a + " · " + v.b + " = " + v.a * v.b + "</p>"; }); },
    gameTitleKey: P + ".gameTitle", gameIntroKey: P + ".gameIntro",
    generators: { easy: [perim, area, square], medium: [angle, rightTri, side], hard: [volume, angle, side] },
    renderVisual: function (v) { return v.t ? K.triangle(v.t[0], v.t[1], "?") : K.rect(v.r[0], v.r[1], v.g); }
  };
})();
