/* islands/coordinates.js — Coordinate Bay (grade 6): negative numbers and the coordinate plane. */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen, K = Kit, P = "coordinates";
  function T(o) { o.pre = P; return K.task(o); }
  function nz() { var v = F.rnd(1, 5); return F.rnd(0, 1) ? v : -v; }
  function fillI(r) { return function () { return F.rnd(-r, r); }; }
  function quad(x, y) { return x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3); }

  function readX() { var x = nz(), y = nz();
    return T({ q: "readX", p: {}, ans: x, wrong: [y, -x, x + 1], fill: fillI(5), step: "A(" + K.minus(x) + "; " + K.minus(y) + ")", visual: { pts: [{ x: x, y: y, l: "A" }] }, verify: function (v) { return v === x; } }); }
  function readY() { var x = nz(), y = nz();
    return T({ q: "readY", p: {}, ans: y, wrong: [x, -y, y - 1], fill: fillI(5), step: "A(" + K.minus(x) + "; " + K.minus(y) + ")", visual: { pts: [{ x: x, y: y, l: "A" }] }, verify: function (v) { return v === y; } }); }
  function quadrant() { var x = nz(), y = nz(), q = quad(x, y);
    return T({ q: "quadrant", p: { x: K.minus(x), y: K.minus(y) }, ans: q, wrong: [1, 2, 3, 4], fill: function () { return F.rnd(1, 4); }, step: "x " + (x > 0 ? "> 0" : "< 0") + ",  y " + (y > 0 ? "> 0" : "< 0"), verify: function (v) { return v === quad(x, y); } }); }
  function opposite() { var a = F.rnd(1, 50) * (F.rnd(0, 1) ? 1 : -1);
    return T({ q: "opposite", p: { a: K.minus(a) }, ans: -a, wrong: [a, -a + 1, -a - 1], fill: fillI(60), step: "−(" + K.minus(a) + ") = " + K.minus(-a), verify: function (v) { return v + a === 0; } }); }
  function addInt() { var a = F.rnd(-12, 12), b = F.rnd(-12, 12), ans = a + b;
    return T({ q: "addInt", p: { a: K.minus(a), b: b < 0 ? "(" + K.minus(b) + ")" : b }, ans: ans, wrong: [a - b, -ans, ans + 1, Math.abs(a) + Math.abs(b)], fill: fillI(25), step: K.minus(a) + K.sgn(b) + " = " + K.minus(ans), verify: function (v) { return v - b === a; } }); }
  function distance() { var a = F.rnd(-9, 0), b = F.rnd(1, 9), ans = b - a;
    return T({ q: "distance", p: { a: K.minus(a), b: b }, ans: ans, wrong: [b + a === ans ? ans + 2 : Math.abs(b + a), ans + 1, ans - 1], fill: function () { return F.rnd(1, 20); }, step: b + " − (" + K.minus(a) + ") = " + ans, verify: function (v) { return v === Math.abs(a - b); } }); }

  TaskGen.register(P, { readX: readX, readY: readY, quadrant: quadrant, opposite: opposite, addInt: addInt, distance: distance });

  function numLine() {
    var h = '<svg class="kit-svg" viewBox="0 0 260 60" role="img" aria-label="−5…5"><line x1="10" y1="30" x2="250" y2="30" class="kit-axis"/>';
    for (var i = -5; i <= 5; i++) { var x = 130 + i * 22; h += '<line x1="' + x + '" y1="24" x2="' + x + '" y2="36" class="kit-axis"/><text x="' + x + '" y="54" class="kit-s mid">' + K.minus(i) + "</text>"; }
    return h + "</svg>";
  }
  var sl = [{ id: "x", min: -5, max: 5, v: 3 }, { id: "y", min: -5, max: 5, v: 2 }];
  window.ISLAND_IMPL[P] = {
    renderLesson: function (el) { K.lesson(el, P, [
      numLine,
      function () { return K.plane([]); },
      function () { return K.plane([{ x: 3, y: 2, l: "A(3; 2)" }]); },
      function () { return K.plane([{ x: -4, y: 3, l: "B" }, { x: -2, y: -3, l: "C" }]); }]); },
    renderSandbox: function (el) { K.sandbox(el, P, sl, function (v) {
      var q = v.x && v.y ? t(P + ".sbQuad", { q: quad(v.x, v.y) }) : t(P + ".sbAxis");
      return K.plane([{ x: v.x, y: v.y, l: "A" }]) + '<p class="extra">A(' + K.minus(v.x) + "; " + K.minus(v.y) + ") — " + UI.esc(q) + "</p>"; }); },
    gameTitleKey: P + ".gameTitle", gameIntroKey: P + ".gameIntro",
    generators: { easy: [readX, readY, opposite], medium: [quadrant, addInt, readY], hard: [distance, addInt, quadrant] },
    renderVisual: function (v) { return K.plane(v.pts); }
  };
})();
