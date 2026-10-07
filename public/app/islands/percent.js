/* islands/percent.js — Percent City (grades 5–6). Game format: "Shop" (prices, discounts, price rises). */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen;
  function t_(k, p) { return t("percent." + k, p); }

  /* 10×10 grid with k cells filled (column by column, like counting tens). */
  function grid(k, k2) {
    var h = '<svg class="grid100" viewBox="0 0 100 100" role="img" aria-label="' + k + '%">';
    for (var i = 0; i < 100; i++) {
      var col = Math.floor(i / 10), row = i % 10;
      h += '<rect x="' + (col * 10) + '" y="' + (row * 10) + '" width="10" height="10" class="' + (i < k ? (k2 && i < k2 ? "on2" : "on") : "") + '"/>';
    }
    return h + "</svg>";
  }
  function tag(price, newPrice, p) {
    return '<div class="tag">' + (newPrice != null ? "<s>" + price + "</s>" + newPrice : price) + " " + UI.esc(t_("tenge")) + (p ? "<small>−" + p + "%</small>" : "") + "</div>";
  }

  /* ---------- a) lesson ---------- */
  var step = 0;
  function renderLesson(el) {
    var steps = tList("percent.lessonSteps"), vis;
    vis = [grid(1), grid(25), '<div class="row">' + grid(50) + grid(100) + "</div>", '<div class="row">' + tag(2000) + grid(20) + "</div>", tag(2000, 1600, 20)][step];
    el.innerHTML = '<div class="card lesson"><div class="lesson-visual">' + vis + '</div><div class="prompt-row"><p class="lesson-text">' + UI.rich(steps[step]) + "</p>" + UI.speakBtn(steps[step]) +
      '</div><div class="dots" aria-hidden="true">' + steps.map(function (_, i) { return '<span class="' + (i === step ? "on" : "") + '"></span>'; }).join("") +
      '</div><div class="nav-row"><button class="btn btn-soft" id="ls-back"' + (step === 0 ? " disabled" : "") + ">← " + UI.esc(t("common.back")) +
      '</button><button class="btn btn-primary" id="ls-next">' + UI.esc(step === steps.length - 1 ? t("common.sandbox") : t("common.next")) + " →</button></div></div>";
    el.querySelector("#ls-back").onclick = function () { step--; Sound.play("tap"); renderLesson(el); };
    el.querySelector("#ls-next").onclick = function () {
      Sound.play("tap");
      if (step < steps.length - 1) { step++; renderLesson(el); } else document.dispatchEvent(new CustomEvent("gotab", { detail: "sandbox" }));
    };
  }

  /* ---------- b) sandbox: percent grid + shop discount calculator ---------- */
  var sp = 30, price = 2500;
  function renderSandbox(el) {
    el.innerHTML = '<div class="card sandbox"><p class="muted">' + UI.esc(t_("sbHint")) + '</p><div class="row"><div id="sb-grid"></div><div class="side" id="sb-info"></div></div>' +
      '<div class="slider-row"><label for="sb-p">' + UI.esc(t_("sbPctLabel")) + '</label><input type="range" id="sb-p" min="0" max="100" value="' + sp + '"></div>' +
      '<div class="slider-row"><label for="sb-pr">' + UI.esc(t_("sbPriceLabel")) + '</label><input type="range" id="sb-pr" min="100" max="5000" step="100" value="' + price + '"></div></div>';
    function upd() {
      var s = F.simp(sp, 100), off = price * sp / 100;
      el.querySelector("#sb-grid").innerHTML = grid(sp);
      el.querySelector("#sb-info").innerHTML = '<p class="extra">' + UI.rich(t_("sbPct", { p: sp, f: sp === 0 ? "0" : F.frac(s[0], s[1]) })) + "</p>" + tag(price, price - off, sp) +
        "<p>" + UI.esc(t_("sbPrice", { n: price })) + "<br>" + UI.esc(t_("sbOff", { p: sp, off: off })) + "<br><b>" + UI.esc(t_("sbNew", { r: price - off })) + "</b></p>";
    }
    el.querySelector("#sb-p").oninput = function (e) { sp = Number(e.target.value); upd(); };
    el.querySelector("#sb-pr").oninput = function (e) { price = Number(e.target.value); upd(); };
    upd();
  }

  /* ---------- c) generators ---------- */
  function hint(k, p) { return { k: "percent.h." + k, p: p || {} }; }
  var NICE = [10, 20, 25, 50, 5, 40, 75];

  function gridTask() {
    var k = F.rnd(3, 97), ans = k + "%";
    return {
      prompt: { k: "percent.q.grid", p: {} }, visual: { k: k },
      options: F.makeOptions(ans, [(100 - k) + "%", (k + 10 > 100 ? k - 10 : k + 10) + "%", (k % 10) * 10 + Math.floor(k / 10) + "%"], function () { return F.rnd(1, 99) + "%"; }),
      answer: ans, hints: [hint("grid1"), hint("grid2"), hint("grid3", { k: k })],
      verify: function () { return F.val(ans) === k; }
    };
  }
  function toFrac() {
    var p = F.pick(NICE), s = F.simp(p, 100), g = F.gcd(p, 100), ans = F.frac(s[0], s[1]);
    return {
      prompt: { k: "percent.q.toFrac", p: { p: p } },
      options: F.makeOptions(ans, ["1/" + p, p + "/10", s[0] + "/" + (s[1] + 1), "1/" + Math.round(100 / p + 1)], function () { return F.rnd(1, 3) + "/" + F.pick([2, 3, 4, 5, 8, 10, 20]); }),
      answer: ans, hints: [hint("fr1", { p: p }), hint("fr2", { g: g }), hint("fr3", { p: p, r: ans })],
      verify: function () { return F.near(F.val(ans), p / 100) && F.gcd(s[0], s[1]) === 1; }
    };
  }
  function of() {
    var p = F.pick([10, 20, 25, 50, 5, 15, 30, 75]), n = 100 * F.rnd(1, 12), one = n / 100, r = one * p, ans = String(r);
    return {
      prompt: { k: "percent.q.of", p: { n: n, p: p } },
      options: F.makeOptions(ans, [String(n - r), String(r * 10), String(p), String(n + r)], function () { return String(F.rnd(1, n)); }),
      answer: ans, hints: [hint("of1"), hint("of2", { n: n, one: one }), hint("of3", { one: one, p: p, r: r })],
      verify: function () { return F.near(Number(ans), n * p / 100); }
    };
  }
  function discount() {
    var p = F.pick([10, 20, 25, 50, 30]), price = 100 * F.rnd(3, 50), off = price * p / 100, r = price - off, ans = String(r);
    return {
      prompt: { k: "percent.q.discount", p: { price: price, p: p } },
      options: F.makeOptions(ans, [String(off), String(price - p), String(price + off)], function () { return String(100 * F.rnd(1, 50)); }),
      answer: ans, hints: [hint("dc1"), hint("dc2", { price: price, p: p, off: off }), hint("dc3", { price: price, off: off, r: r })],
      verify: function () { return Number(ans) === price * (100 - p) / 100; }
    };
  }
  function whole() {
    var p = F.pick([10, 20, 25, 50, 5]), one = F.rnd(2, 12), a = one * p, r = one * 100, ans = String(r);
    return {
      prompt: { k: "percent.q.whole", p: { p: p, a: a } },
      options: F.makeOptions(ans, [String(a * p), String(a + p), String(r / 10), String(a)], function () { return String(F.rnd(1, 15) * 50); }),
      answer: ans, hints: [hint("wh1"), hint("wh2", { a: a, p: p, one: one }), hint("wh3", { one: one, r: r })],
      verify: function () { return F.near(Number(ans) * p / 100, a); }
    };
  }
  function what() {
    var p = F.pick([10, 20, 25, 50, 75, 40]), b = F.pick([20, 40, 60, 80, 200, 400]), a = b * p / 100;
    if (a !== Math.floor(a)) { b = 200; a = 2 * p; }
    var s = F.simp(a, b), ans = p + "%";
    return {
      prompt: { k: "percent.q.what", p: { a: a, b: b } },
      options: F.makeOptions(ans, [a + "%", (100 - p) + "%", Math.round(b / a) + "%"], function () { return F.pick([5, 15, 30, 60, 80, 90]) + "%"; }),
      answer: ans, hints: [hint("wt1", { a: a, b: b }), hint("wt2", { a: a, b: b, f: F.frac(s[0], s[1]) }), hint("wt3", { f: F.frac(s[0], s[1]), r: p })],
      verify: function () { return F.near(a / b * 100, p); }
    };
  }
  function increase() {
    var p = F.pick([10, 20, 25, 50]), price = 100 * F.rnd(2, 40), up = price * p / 100, r = price + up, ans = String(r);
    return {
      prompt: { k: "percent.q.increase", p: { price: price, p: p } },
      options: F.makeOptions(ans, [String(price - up), String(price + p), String(up)], function () { return String(100 * F.rnd(1, 60)); }),
      answer: ans, hints: [hint("in1"), hint("in2", { price: price, p: p, up: up }), hint("in3", { price: price, up: up, r: r })],
      verify: function () { return Number(ans) === price * (100 + p) / 100; }
    };
  }

  TaskGen.register("percent", { grid: gridTask, toFrac: toFrac, of: of, discount: discount, whole: whole, what: what, increase: increase });

  window.ISLAND_IMPL.percent = {
    renderLesson: renderLesson, renderSandbox: renderSandbox,
    gameTitleKey: "percent.gameTitle", gameIntroKey: "percent.gameIntro",
    generators: { easy: [gridTask, toFrac, of], medium: [of, discount, increase], hard: [whole, what, discount] },
    renderVisual: function (v) { return grid(v.k); }
  };
})();
