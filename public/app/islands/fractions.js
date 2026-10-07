/* islands/fractions.js — Common Fractions Island.
 * Registers ISLAND_IMPL.fractions = { renderLesson, renderSandbox, generators, renderVisual }. */
window.ISLAND_IMPL = window.ISLAND_IMPL || {};
(function () {
  var F = TaskGen;

  /* ---------- Pizza SVG ----------
   * d slices, `on` = array of booleans (selected), opts.interactive adds focusable slices. */
  function pizza(d, on, opts) {
    opts = opts || {};
    var R = 100, out = '<svg class="pizza' + (opts.small ? " pizza-sm" : "") + '" viewBox="-115 -115 230 230" role="img" aria-label="' + (on.filter(Boolean).length) + "/" + d + '">';
    out += '<circle class="crust" r="108"/>';
    if (d === 1) {
      out += '<circle class="slice' + (on[0] ? " on" : "") + '" r="' + R + '" data-i="0"' + (opts.interactive ? ' tabindex="0" role="button"' : "") + "/>";
    } else {
      for (var i = 0; i < d; i++) {
        var a0 = (-90 + 360 * i / d) * Math.PI / 180, a1 = (-90 + 360 * (i + 1) / d) * Math.PI / 180, am = (a0 + a1) / 2;
        var x0 = R * Math.cos(a0), y0 = R * Math.sin(a0), x1 = R * Math.cos(a1), y1 = R * Math.sin(a1);
        var dx = (8 * Math.cos(am)).toFixed(1), dy = (8 * Math.sin(am)).toFixed(1);
        var path = "M0 0 L" + x0.toFixed(2) + " " + y0.toFixed(2) + " A" + R + " " + R + " 0 0 1 " + x1.toFixed(2) + " " + y1.toFixed(2) + "Z";
        out += '<g class="slice-g' + (on[i] ? " on" : "") + '" style="--dx:' + dx + "px;--dy:" + dy + "px;--i:" + i + '">' +
          '<path class="slice' + (on[i] ? " on" : "") + '" d="' + path + '" data-i="' + i + '"' +
          (opts.interactive ? ' tabindex="0" role="button" aria-pressed="' + !!on[i] + '" aria-label="' + UI.esc(t("fractions.slice", { i: i + 1 })) + '"' : "") + "/>" +
          '<circle class="pep" cx="' + (60 * Math.cos(am)).toFixed(1) + '" cy="' + (60 * Math.sin(am)).toFixed(1) + '" r="' + Math.max(4, 14 - d) + '"/></g>';
      }
    }
    return out + "</svg>";
  }
  function onArr(n, d) { var a = []; for (var i = 0; i < d; i++) a.push(i < n); return a; }

  function bigFrac(n, d) {
    return '<div class="big-frac"><div><span class="num">' + n + '</span><small>' + UI.esc(t("fractions.numerator")) + '</small></div>' +
      '<div class="bar"></div><div><span class="den">' + d + "</span><small>" + UI.esc(t("fractions.denominator")) + "</small></div></div>";
  }

  /* ---------- a) Mini-lesson (5 steps) ---------- */
  var lessonStep = 0;
  function renderLesson(el) {
    var steps = tList("fractions.lessonSteps");
    var st = lessonStep, vis;
    if (st === 0) vis = pizza(1, [true]);
    else if (st === 1) vis = pizza(4, onArr(0, 4));
    else if (st === 2) vis = '<div class="row">' + pizza(4, onArr(3, 4)) + bigFrac(3, 4) + "</div>";
    else if (st === 3) vis = '<div class="row eq">' + pizza(2, onArr(1, 2), { small: true }) + "<b>+</b>" + pizza(4, onArr(1, 4), { small: true }) + "<b>= ?</b></div>";
    else vis = '<div class="row eq">' + pizza(4, onArr(2, 4), { small: true }) + "<b>+</b>" + pizza(4, onArr(1, 4), { small: true }) + "<b>=</b>" + pizza(4, onArr(3, 4), { small: true }) + "</div>";
    el.innerHTML = '<div class="card lesson">' +
      '<div class="lesson-visual" key="' + st + '">' + vis + "</div>" +
      '<div class="prompt-row"><p class="lesson-text">' + UI.rich(steps[st]) + "</p>" + UI.speakBtn(steps[st]) + "</div>" +
      '<div class="dots" aria-hidden="true">' + steps.map(function (_, i) { return '<span class="' + (i === st ? "on" : "") + '"></span>'; }).join("") + "</div>" +
      '<div class="nav-row"><button class="btn btn-soft" id="ls-back"' + (st === 0 ? " disabled" : "") + ">← " + UI.esc(t("common.back")) + "</button>" +
      '<button class="btn btn-primary" id="ls-next">' + UI.esc(st === steps.length - 1 ? t("common.sandbox") : t("common.next")) + " →</button></div></div>";
    el.querySelector("#ls-back").onclick = function () { lessonStep--; Sound.play("tap"); renderLesson(el); };
    el.querySelector("#ls-next").onclick = function () {
      Sound.play("tap");
      if (lessonStep < steps.length - 1) { lessonStep++; renderLesson(el); }
      else document.dispatchEvent(new CustomEvent("gotab", { detail: "sandbox" }));
    };
  }

  /* ---------- b) Sandbox: tap slices, change denominator ---------- */
  var sb = { d: 6, on: onArr(0, 6) };
  function renderSandbox(el) {
    var n = sb.on.filter(Boolean).length;
    var s = F.simp(n, sb.d);
    var extra = n === sb.d ? t("fractions.whole") : (n > 0 && s[1] !== sb.d ? t("fractions.simplified", { f: F.frac(s[0], s[1]) }) : "");
    el.innerHTML = '<div class="card sandbox">' +
      '<p class="muted">' + UI.esc(t("fractions.sandboxHint")) + "</p>" +
      '<div class="row">' + pizza(sb.d, sb.on, { interactive: true }) +
      '<div class="side"><p>' + UI.esc(t("fractions.selected")) + "</p>" + bigFrac(n, sb.d) +
      '<p class="extra" aria-live="polite">' + UI.rich(extra) + "</p></div></div>" +
      '<div class="stepper"><button class="btn btn-round" id="sb-minus" aria-label="' + UI.esc(t("fractions.fewer")) + '"' + (sb.d <= 2 ? " disabled" : "") + ">−</button>" +
      "<span>" + UI.esc(t("fractions.parts", { d: sb.d })) + "</span>" +
      '<button class="btn btn-round" id="sb-plus" aria-label="' + UI.esc(t("fractions.more")) + '"' + (sb.d >= 12 ? " disabled" : "") + ">+</button></div></div>";
    function toggle(i) { sb.on[i] = !sb.on[i]; Sound.play("tap"); renderSandbox(el); var f = el.querySelector('.slice[data-i="' + i + '"]'); if (f) f.focus(); }
    el.querySelectorAll(".slice").forEach(function (p) {
      p.addEventListener("click", function () { toggle(Number(p.getAttribute("data-i"))); });
      p.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(Number(p.getAttribute("data-i"))); } });
    });
    el.querySelector("#sb-minus").onclick = function () { sb.d--; sb.on = onArr(0, sb.d); renderSandbox(el); };
    el.querySelector("#sb-plus").onclick = function () { sb.d++; sb.on = onArr(0, sb.d); renderSandbox(el); };
  }

  /* ---------- c) Task generators ---------- */
  var NICE = [2, 3, 4, 5, 6, 8, 10, 12];

  function identify() {
    var d = F.rnd(2, 8), n = F.rnd(1, d - 1), ans = F.frac(n, d);
    return {
      prompt: { k: "fractions.q.identify", p: {} }, visual: { n: n, d: d },
      options: F.makeOptions(ans, [n + "/" + (d - n), (d - n) + "/" + d, n + "/" + (d + 1), (n + 1) + "/" + d], function () { return F.rnd(1, 8) + "/" + F.rnd(2, 9); }),
      answer: ans,
      hints: [{ k: "fractions.h.identify1", p: {} }, { k: "fractions.h.identify2", p: { n: n, d: d } }, { k: "fractions.h.identify3", p: { n: n, d: d, f: ans } }],
      verify: function () { return F.near(F.val(ans), n / d); }
    };
  }

  function compareSame() {
    var d = F.rnd(3, 12), x = F.rnd(1, d - 1), y;
    do { y = F.rnd(1, d - 1); } while (y === x);
    var a = x + "/" + d, b = y + "/" + d, big = x > y ? a : b;
    return {
      prompt: { k: "fractions.q.compare", p: { a: a, b: b } },
      options: [a, b], answer: big,
      hints: [{ k: "fractions.h.compareSame1", p: {} }, { k: "fractions.h.compareSame2", p: { x: x, y: y } },
              { k: "fractions.h.compareSame3", p: { big: big, mx: Math.max(x, y), mn: Math.min(x, y) } }],
      verify: function () { return F.val(big) > F.val(big === a ? b : a); }
    };
  }

  function addSame() {
    var d = F.rnd(4, 12), x = F.rnd(1, d - 2), y = F.rnd(1, d - 1 - x), s = x + y;
    var a = x + "/" + d, b = y + "/" + d, ans = s + "/" + d;
    return {
      prompt: { k: "fractions.q.add", p: { a: a, b: b } },
      options: F.makeOptions(ans, [s + "/" + (2 * d), (s + 1) + "/" + d, (s > 1 ? s - 1 : s + 2) + "/" + d, x * y + "/" + d], function () { return F.rnd(1, d - 1) + "/" + d; }),
      answer: ans,
      hints: [{ k: "fractions.h.add1", p: {} }, { k: "fractions.h.add2", p: { x: x, y: y, s: s } }, { k: "fractions.h.add3", p: { a: a, b: b, r: ans } }],
      verify: function () { return F.near(F.val(ans), F.val(a) + F.val(b)); }
    };
  }

  function subSame() {
    var d = F.rnd(4, 12), x = F.rnd(2, d - 1), y = F.rnd(1, x - 1), s = x - y;
    var a = x + "/" + d, b = y + "/" + d, ans = s + "/" + d;
    return {
      prompt: { k: "fractions.q.sub", p: { a: a, b: b } },
      options: F.makeOptions(ans, [(x + y <= 12 ? x + y : s + 1) + "/" + d, (s + 1) + "/" + d, s + "/" + (2 * d), (s > 1 ? s - 1 : s + 2) + "/" + d], function () { return F.rnd(1, d - 1) + "/" + d; }),
      answer: ans,
      hints: [{ k: "fractions.h.sub1", p: {} }, { k: "fractions.h.sub2", p: { x: x, y: y, s: s } }, { k: "fractions.h.sub3", p: { a: a, b: b, r: ans } }],
      verify: function () { return F.near(F.val(ans), F.val(a) - F.val(b)); }
    };
  }

  function ofNumber() {
    var d = F.pick([2, 3, 4, 5, 6, 8, 10]), k = F.rnd(1, d - 1), q = F.rnd(2, 10), n = q * d, r = q * k, f = k + "/" + d;
    var ans = String(r);
    return {
      prompt: { k: "fractions.q.ofNumber", p: { n: n, f: f } },
      options: F.makeOptions(ans, [String(q), String(n - r), String(r + q), String(k * d)], function () { return String(F.rnd(1, n)); }),
      answer: ans,
      hints: [{ k: "fractions.h.of1", p: {} }, { k: "fractions.h.of2", p: { n: n, d: d, q: q } }, { k: "fractions.h.of3", p: { q: q, k: k, r: r } }],
      verify: function () { return Number(ans) === n * k / d && Number.isInteger(n * k / d); }
    };
  }

  /* Pick two fractions with different denominators, small common denominator (≤ 24). */
  function pair(sumBelowOne) {
    var d1, d2, n1, n2, l;
    do {
      d1 = F.pick(NICE); d2 = F.pick(NICE); n1 = F.rnd(1, d1 - 1); n2 = F.rnd(1, d2 - 1); l = F.lcm(d1, d2);
    } while (d1 === d2 || l > 24 || (sumBelowOne && n1 / d1 + n2 / d2 >= 1) || (!sumBelowOne && F.near(n1 / d1, n2 / d2)));
    return { d1: d1, d2: d2, n1: n1, n2: n2, l: l, a2: n1 * l / d1, b2: n2 * l / d2 };
  }

  function addDiff() {
    var p = pair(true), s = p.a2 + p.b2, sm = F.simp(s, p.l), ans = F.frac(sm[0], sm[1]);
    var a = p.n1 + "/" + p.d1, b = p.n2 + "/" + p.d2;
    return {
      prompt: { k: "fractions.q.addDiff", p: { a: a, b: b } },
      options: F.makeOptions(ans, [(p.n1 + p.n2) + "/" + (p.d1 + p.d2), (p.n1 + p.n2) + "/" + p.l, (s + 1) + "/" + p.l, (p.n1 * p.n2) + "/" + (p.d1 * p.d2)],
        function () { return F.rnd(1, p.l - 1) + "/" + p.l; }),
      answer: ans,
      hints: [{ k: "fractions.h.addDiff1", p: {} },
              { k: "fractions.h.addDiff2", p: { l: p.l, a: a, b: b, a2: p.a2 + "/" + p.l, b2: p.b2 + "/" + p.l } },
              { k: "fractions.h.addDiff3", p: { a2: p.a2 + "/" + p.l, b2: p.b2 + "/" + p.l, s: s + "/" + p.l, r: ans } }],
      verify: function () { var v = F.val(ans); var q = ans.split("/"); return F.near(v, p.n1 / p.d1 + p.n2 / p.d2) && (q.length === 1 || F.gcd(+q[0], +q[1]) === 1); }
    };
  }

  function compareDiff() {
    var p = pair(false), a = p.n1 + "/" + p.d1, b = p.n2 + "/" + p.d2, big = p.a2 > p.b2 ? a : b;
    return {
      prompt: { k: "fractions.q.compare", p: { a: a, b: b } },
      options: [a, b], answer: big,
      hints: [{ k: "fractions.h.compareDiff1", p: {} },
              { k: "fractions.h.compareDiff2", p: { l: p.l, a: a, b: b, a2: p.a2 + "/" + p.l, b2: p.b2 + "/" + p.l } },
              { k: "fractions.h.compareDiff3", p: { a2: p.a2 + "/" + p.l, b2: p.b2 + "/" + p.l, big: big } }],
      verify: function () { return F.val(big) > F.val(big === a ? b : a); }
    };
  }

  var all = { identify: identify, compareSame: compareSame, addSame: addSame, subSame: subSame, ofNumber: ofNumber, addDiff: addDiff, compareDiff: compareDiff };
  TaskGen.register("fractions", all);

  window.ISLAND_IMPL.fractions = {
    renderLesson: renderLesson,
    renderSandbox: renderSandbox,
    gameTitleKey: "fractions.gameTitle",
    gameIntroKey: "fractions.gameIntro",
    generators: {
      easy: [identify, compareSame],
      medium: [addSame, subSame, ofNumber],
      hard: [addDiff, compareDiff]
    },
    renderVisual: function (v) { return pizza(v.d, onArr(v.n, v.d)); }
  };
})();
