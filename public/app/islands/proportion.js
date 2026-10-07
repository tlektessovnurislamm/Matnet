/* islands/proportion.js — Proportion Mountain (grade 6). */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen, K = Kit, P = "proportion";
  function T(o) { o.pre = P; return K.task(o); }
  function near(x) { return function () { return Math.max(1, x + F.rnd(-8, 8)); }; }

  function ratio() { var p = F.rnd(1, 7), q = F.rnd(2, 9); if (p === q || F.gcd(p, q) !== 1) { p = 2; q = 3; } var m = F.rnd(2, 6), a = p * m, b = q * m, ans = F.frac(p, q);
    return T({ q: "ratio", p: { a: a, b: b }, ans: ans, wrong: [F.frac(q, p), (p + 1) + "/" + q, p + "/" + (q + 1), a + "/" + (b + m)], fill: function () { return F.rnd(1, 5) + "/" + F.rnd(6, 11); }, step: a + " : " + b + " = (" + a + " : " + m + ") : (" + b + " : " + m + ")", verify: function (v) { return F.near(v, a / b); } }); }
  function missing() { var a = F.rnd(1, 9), b = F.rnd(2, 9), k = F.rnd(2, 6), c = a * k, x = b * k;
    return T({ q: "missing", p: { a: a, b: b, c: c }, ans: x, wrong: [b + k, c * b, x + b, x - 1], fill: near(x), step: "x = " + b + " · " + c + " : " + a, verify: function (v) { return a * v === b * c; } }); }
  function price() { var n = F.rnd(2, 6), p = 10 * F.rnd(2, 30), m = F.rnd(2, 9); if (m === n) m++; var ans = m * p;
    return T({ q: "price", p: { n: n, c: n * p, m: m }, ans: ans, wrong: [n * p + m, p, n * p, ans + p], fill: near(ans), step: n * p + " : " + n + " = " + p + ";  " + p + " · " + m, verify: function (v) { return v * n === m * n * p; } }); }
  function scale() { var s = F.pick([1000, 10000, 100000]), d = F.rnd(2, 9), ans = d * s / 100;
    return T({ q: "scale", p: { s: s, d: d }, ans: ans, wrong: [d * s, ans / 10, ans * 10, d * 100], fill: near(ans), step: d + " · " + s + " = " + d * s + " см = " + ans + " м", verify: function (v) { return v * 100 === d * s; } }); }
  function inverse() { var w = F.rnd(2, 6), k = F.pick([2, 3]), w2 = w * k, d = k * F.rnd(2, 6), ans = d / k;
    return T({ q: "inverse", p: { w: w, d: d, w2: w2 }, ans: ans, wrong: [d * k, d + k, d, ans + 1], fill: near(ans), step: w + " · " + d + " = " + w * d + ";  " + w * d + " : " + w2, verify: function (v) { return v * w2 === w * d; } }); }
  function divide() { var a = F.rnd(1, 5), b = F.rnd(1, 5); if (a === b) b++; var m = F.rnd(2, 12), n = (a + b) * m, ans = a * m;
    return T({ q: "divide", p: { n: n, a: a, b: b }, ans: ans, wrong: [b * m, n / 2 === Math.floor(n / 2) ? n / 2 : ans + 1, m, n - a], fill: near(ans), step: n + " : (" + a + " + " + b + ") = " + m + ";  " + m + " · " + a, verify: function (v) { return v * (a + b) === a * n; } }); }

  TaskGen.register(P, { ratio: ratio, missing: missing, price: price, scale: scale, inverse: inverse, divide: divide });

  function apples(n, c) { var s = ""; for (var i = 0; i < n; i++) s += c; return '<p class="kit-emoji">' + s + "</p>"; }
  var sl = [{ id: "n", min: 1, max: 10, v: 2 }];
  window.ISLAND_IMPL[P] = {
    renderLesson: function (el) { K.lesson(el, P, [
      function () { return apples(2, "🍎") + apples(3, "🍐"); },
      function () { return apples(4, "🍎") + apples(6, "🍐"); },
      function () { return '<p class="extra">2/3 = 4/6</p>'; },
      function () { return '<p class="kit-emoji">🥞 × 2 → 🥚🥚</p><p class="kit-emoji">🥞 × 4 → 🥚🥚🥚🥚</p>'; },
      function () { return '<p class="kit-emoji">👷👷 → 6 📅<br>👷👷👷👷 → 3 📅</p>'; }]); },
    renderSandbox: function (el) { K.sandbox(el, P, sl, function (v) {
      return apples(v.n, "🥞") + '<p class="extra">' + UI.esc(t(P + ".sbRecipe", { e: v.n, m: 150 * v.n, f: 100 * v.n })) + "</p>"; }); },
    gameTitleKey: P + ".gameTitle", gameIntroKey: P + ".gameIntro",
    generators: { easy: [ratio, price, missing], medium: [missing, price, scale], hard: [inverse, divide, scale] },
    renderVisual: function () { return ""; }
  };
})();
