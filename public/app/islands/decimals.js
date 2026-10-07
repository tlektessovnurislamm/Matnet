/* islands/decimals.js — Decimal Fractions Forest (grade 5).
 * All arithmetic is done in integer hundredths (units of 0,01) so answers never have float errors. */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen, D = F.dec;

  /* ---------- visuals ---------- */
  function strip(k, n) {
    var h = '<div class="strip" role="img" aria-label="' + k + "/" + n + '">';
    for (var i = 0; i < n; i++) h += '<span class="' + (i < k ? "on" : "") + '"></span>';
    return h + "</div>";
  }
  /* Number line from 0 to max (in hundredths), point at v. */
  function numline(v, max, id) {
    max = max || 100;
    var W = 520, x0 = 20, x1 = 500, h = '<svg class="numline" viewBox="0 0 ' + W + ' 110" role="img" aria-label="' + D(v) + '">';
    h += '<line x1="' + x0 + '" y1="60" x2="' + x1 + '" y2="60"/>';
    var steps = max / 10;
    for (var i = 0; i <= 10; i++) {
      var x = x0 + (x1 - x0) * i / 10, big = (i * steps) % 100 === 0;
      h += '<line x1="' + x + '" y1="' + (big ? 46 : 52) + '" x2="' + x + '" y2="' + (big ? 74 : 68) + '"/>';
      h += '<text x="' + x + '" y="98">' + D(i * steps) + "</text>";
    }
    var px = x0 + (x1 - x0) * v / max;
    h += '<g class="pt"' + (id ? ' id="' + id + '"' : "") + ' style="transform:translateX(' + (id ? 0 : px - x0) + 'px)"><circle cx="' + x0 + '" cy="60" r="11"/><text x="' + x0 + '" y="32">' + D(v) + "</text></g>";
    return h + "</svg>";
  }
  function placeTable(units) {
    var ip = Math.floor(units / 100), t = Math.floor(units / 10) % 10, hd = units % 10;
    return '<table class="place"><tr><th>' + UI.esc(t_("units")) + "</th><th></th><th>" + UI.esc(t_("tenths")) + "</th><th>" + UI.esc(t_("hundredths")) +
      '</th></tr><tr><td>' + ip + '</td><td class="comma">,</td><td>' + t + "</td><td>" + hd + "</td></tr></table>";
  }
  function t_(k, p) { return t("decimals." + k, p); }
  function col(a, b, op, r) {
    return '<div class="col-calc"><div>' + a + "</div><div>" + op + " " + b + '</div><div class="line">' + r + "</div></div>";
  }

  /* ---------- a) lesson ---------- */
  var step = 0;
  function renderLesson(el) {
    var steps = tList("decimals.lessonSteps"), vis;
    if (step === 0) vis = strip(3, 10);
    else if (step === 1) vis = placeTable(235);
    else if (step === 2) vis = numline(70, 100, "lesson-pt");
    else if (step === 3) vis = '<div class="row eq">' + col("0,50", "", "", "") .replace('<div class="line"></div>', "") + "<b>&gt;</b>" + '<div class="col-calc"><div>0,45</div></div></div>';
    else vis = col("1,25", "0,60", "+", "1,85");
    el.innerHTML = '<div class="card lesson"><div class="lesson-visual">' + vis + '</div><div class="prompt-row"><p class="lesson-text">' + UI.rich(steps[step]) + "</p>" + UI.speakBtn(steps[step]) +
      '</div><div class="dots" aria-hidden="true">' + steps.map(function (_, i) { return '<span class="' + (i === step ? "on" : "") + '"></span>'; }).join("") +
      '</div><div class="nav-row"><button class="btn btn-soft" id="ls-back"' + (step === 0 ? " disabled" : "") + ">← " + UI.esc(t("common.back")) +
      '</button><button class="btn btn-primary" id="ls-next">' + UI.esc(step === steps.length - 1 ? t("common.sandbox") : t("common.next")) + " →</button></div></div>";
    if (step === 2) setTimeout(function () { var p = document.getElementById("lesson-pt"); if (p) p.style.transform = "translateX(" + (480 * 0.7) + "px)"; }, 300);
    el.querySelector("#ls-back").onclick = function () { step--; Sound.play("tap"); renderLesson(el); };
    el.querySelector("#ls-next").onclick = function () {
      Sound.play("tap");
      if (step < steps.length - 1) { step++; renderLesson(el); } else document.dispatchEvent(new CustomEvent("gotab", { detail: "sandbox" }));
    };
  }

  /* ---------- b) sandbox: slider on a 0..2 number line ---------- */
  var sv = 125;
  function renderSandbox(el) {
    var s = F.simp(sv, 100);
    el.innerHTML = '<div class="card sandbox"><p class="muted">' + UI.esc(t_("sbHint")) + '</p><div class="visual" id="sb-line">' + numline(sv, 200) +
      '</div><div class="slider-row"><label for="sb-r">' + UI.esc(t_("sbLabel")) + '</label><input type="range" id="sb-r" min="0" max="200" step="1" value="' + sv + '"></div>' +
      '<div class="row"><div id="sb-table">' + placeTable(sv) + '</div><div class="side"><p class="extra" id="sb-txt"></p></div></div></div>';
    function upd() {
      var s = F.simp(sv, 100);
      el.querySelector("#sb-line").innerHTML = numline(sv, 200);
      el.querySelector("#sb-table").innerHTML = placeTable(sv);
      el.querySelector("#sb-txt").innerHTML = UI.esc(t_("sbValue", { v: D(sv) })) + "<br>" + UI.rich(t_("sbFrac", { f: sv === 0 ? "0" : F.frac(s[0], s[1]) }));
    }
    el.querySelector("#sb-r").oninput = function (e) { sv = Number(e.target.value); upd(); };
    upd();
  }

  /* ---------- c) generators ---------- */
  function hint(k, p) { return { k: "decimals.h." + k, p: p || {} }; }
  function pad(units, places) { return D(units, 100, places); }

  function readStrip() {
    var k = F.rnd(1, 9), ans = D(k * 10);
    return {
      prompt: { k: "decimals.q.readStrip", p: {} }, visual: { k: k },
      options: F.makeOptions(ans, [D(k), String(k), D(100 + k * 10), D((10 - k) * 10)], function () { return D(F.rnd(1, 99)); }),
      answer: ans, hints: [hint("strip1"), hint("strip2", { k: k }), hint("strip3", { k: k, r: ans })],
      verify: function () { return F.near(F.val(ans), k / 10); }
    };
  }
  function fracToDec() {
    var hundred = Math.random() < 0.5, d = hundred ? 100 : 10, n = hundred ? F.rnd(1, 99) : F.rnd(1, 9);
    if (hundred && n % 10 === 0) n += 3;
    var units = hundred ? n : n * 10, ans = D(units), f = n + "/" + d;
    return {
      prompt: { k: "decimals.q.fracToDec", p: { f: f } },
      options: F.makeOptions(ans, [D(hundred ? n * 10 : n), String(n), D(hundred ? n * 100 : n * 100)], function () { return D(F.rnd(1, 150)); }),
      answer: ans, hints: [hint("f2d1", { z: hundred ? 2 : 1 }), hint("f2d2", { n: n, z: hundred ? 2 : 1 }), hint("f2d3", { f: f, r: ans })],
      verify: function () { return F.near(F.val(ans), n / d); }
    };
  }
  function compare() {
    var x, y;
    do { x = F.rnd(1, 9) * 10; y = F.rnd(11, 99); } while (y % 10 === 0 || x === y);
    if (Math.random() < 0.5) { var tmp = x; x = y; y = tmp; }
    var a = D(x), b = D(y), big = x > y ? a : b;
    return {
      prompt: { k: "decimals.q.compare", p: { a: a, b: b } }, options: [a, b], answer: big,
      hints: [hint("cmp1"), hint("cmp2", { a2: pad(x, 2), b2: pad(y, 2) }), hint("cmp3", { big: big })],
      verify: function () { return F.val(big) > F.val(big === a ? b : a); }
    };
  }
  function addSub(op) {
    return function () {
      var x = F.rnd(11, 499), y = F.rnd(5, 299);
      if (Math.random() < 0.5) x = Math.round(x / 10) * 10 || 10;   // mix 1 and 2 decimal places
      if (op === "-" && y >= x) { var t2 = x; x = y + 10; y = t2; }
      var r = op === "+" ? x + y : x - y, a = D(x), b = D(y), ans = D(r);
      var cand = [D(r + 10), D(Math.abs(r - 1)), D(r + 100), D(op === "+" ? r - 10 : r + 1)];
      return {
        prompt: { k: op === "+" ? "decimals.q.add" : "decimals.q.sub", p: { a: a, b: b } },
        options: F.makeOptions(ans, cand, function () { return D(F.rnd(1, 900)); }),
        answer: ans,
        hints: [hint("add1"), hint(op === "+" ? "add2" : "sub2", { a2: pad(x, 2), b2: pad(y, 2) }), hint(op === "+" ? "add3" : "sub3", { a: a, b: b, r: ans })],
        verify: function () { return F.near(F.val(ans), op === "+" ? F.val(a) + F.val(b) : F.val(a) - F.val(b)); }
      };
    };
  }
  function round() {
    var x; do { x = F.rnd(101, 999); } while (x % 10 === 0);
    var c = x % 10, tenths = Math.floor(x / 10) + (c >= 5 ? 1 : 0), ans = D(tenths * 10, 100, 1), a = D(x);
    return {
      prompt: { k: "decimals.q.round", p: { a: a } },
      options: F.makeOptions(ans, [D((c >= 5 ? tenths - 1 : tenths + 1) * 10, 100, 1), D(Math.round(x / 100) * 100, 100, 1), D(x - c + 100, 100, 1)], function () { return D(F.rnd(10, 99) * 10, 100, 1); }),
      answer: ans, hints: [hint("rnd1"), hint("rnd2", { c: c }), hint("rnd3", { a: a, r: ans })],
      verify: function () { return F.near(F.val(ans), Math.round(F.val(a) * 10 + 1e-9) / 10); }
    };
  }
  function mul10() {
    var x = F.rnd(11, 999), m = F.pick([10, 100, 1000]), z = String(m).length - 1, r = x * m, a = D(x), ans = D(r);
    return {
      prompt: { k: "decimals.q.mul", p: { a: a, m: m } },
      options: F.makeOptions(ans, [D(x * m / 10), D(x * m * 10), D(x)], function () { return D(x * F.pick([1, 10, 100, 10000])); }),
      answer: ans, hints: [hint("m101"), hint("m102", { m: m, z: z }), hint("m103", { a: a, m: m, r: ans })],
      verify: function () { return F.near(F.val(ans), F.val(a) * m); }
    };
  }
  function mulInt() {
    var tt = F.rnd(11, 99); if (tt % 10 === 0) tt++;
    var k = F.rnd(2, 9), p = tt * k, a = D(tt * 10), ans = D(p * 10);
    return {
      prompt: { k: "decimals.q.mul", p: { a: a, m: k } },
      options: F.makeOptions(ans, [String(p), D(p), D(p * 10 + 10)], function () { return D(F.rnd(20, 900) * 10); }),
      answer: ans, hints: [hint("mi1"), hint("mi2", { t: tt, k: k, p: p }), hint("mi3", { r: ans })],
      verify: function () { return F.near(F.val(ans), F.val(a) * k); }
    };
  }

  var add = addSub("+"), sub = addSub("-");
  TaskGen.register("decimals", { readStrip: readStrip, fracToDec: fracToDec, compare: compare, add: add, sub: sub, round: round, mul10: mul10, mulInt: mulInt });

  window.ISLAND_IMPL.decimals = {
    renderLesson: renderLesson, renderSandbox: renderSandbox,
    gameTitleKey: "decimals.gameTitle", gameIntroKey: "decimals.gameIntro",
    generators: { easy: [readStrip, fracToDec, compare], medium: [add, sub, round], hard: [mul10, mulInt, add] },
    renderVisual: function (v) { return strip(v.k, 10); }
  };
})();
