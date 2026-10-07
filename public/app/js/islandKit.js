/* islandKit.js — shared building blocks for islands: lesson stepper, slider sandbox,
 * task builder and small SVG drawings (balance, coordinate plane, bar chart, shapes). */
var Kit = (function () {
  var F = TaskGen, steps = {};
  function minus(n) { return n < 0 ? "−" + Math.abs(n) : String(n); }
  function sgn(n) { return n < 0 ? " − " + Math.abs(n) : " + " + n; }

  /* Lesson: texts from <pre>.lessonSteps, visuals[i]() returns HTML. */
  function lesson(el, pre, visuals) {
    var st = steps[pre] || 0, list = tList(pre + ".lessonSteps");
    if (st >= list.length) st = 0;
    var vis = visuals[st] ? visuals[st]() : "";
    el.innerHTML = '<div class="card lesson"><div class="lesson-visual">' + vis + '</div><div class="prompt-row"><p class="lesson-text">' + UI.rich(list[st]) + "</p>" + UI.speakBtn(list[st]) +
      '</div><div class="dots" aria-hidden="true">' + list.map(function (_, i) { return '<span class="' + (i === st ? "on" : "") + '"></span>'; }).join("") +
      '</div><div class="nav-row"><button class="btn btn-soft" id="ls-back"' + (st === 0 ? " disabled" : "") + ">← " + UI.esc(t("common.back")) +
      '</button><button class="btn btn-primary" id="ls-next">' + UI.esc(st === list.length - 1 ? t("common.sandbox") : t("common.next")) + " →</button></div></div>";
    el.querySelector("#ls-back").onclick = function () { steps[pre] = st - 1; Sound.play("tap"); lesson(el, pre, visuals); };
    el.querySelector("#ls-next").onclick = function () {
      Sound.play("tap");
      if (st < list.length - 1) { steps[pre] = st + 1; lesson(el, pre, visuals); } else document.dispatchEvent(new CustomEvent("gotab", { detail: "sandbox" }));
    };
  }

  /* Sandbox: sliders [{id,min,max,step,v}] (values kept in the objects), render(vals) → HTML. */
  function sandbox(el, pre, sliders, render) {
    var h = '<div class="card sandbox"><p class="muted">' + UI.esc(t(pre + ".sbHint")) + '</p><div id="sb-out"></div>';
    sliders.forEach(function (s) {
      h += '<div class="slider-row"><label for="sb-' + s.id + '">' + UI.esc(t(pre + ".sl." + s.id)) + ' <b id="sbv-' + s.id + '"></b></label><input type="range" id="sb-' + s.id +
        '" min="' + s.min + '" max="' + s.max + '" step="' + (s.step || 1) + '" value="' + s.v + '"></div>';
    });
    el.innerHTML = h + "</div>";
    function upd() {
      var vals = {};
      sliders.forEach(function (s) { vals[s.id] = s.v; el.querySelector("#sbv-" + s.id).textContent = minus(s.v); });
      el.querySelector("#sb-out").innerHTML = render(vals);
    }
    sliders.forEach(function (s) { el.querySelector("#sb-" + s.id).oninput = function (e) { s.v = Number(e.target.value); upd(); }; });
    upd();
  }

  /* Task: {pre,q,p,ans,wrong,fill,step,verify,visual}. Hint 1 = <pre>.h.<q>, 2 = worked step, 3 = answer. */
  function task(o) {
    var ans = String(o.ans), p = o.p || {};
    return {
      prompt: { k: o.pre + ".q." + o.q, p: p }, visual: o.visual,
      options: F.makeOptions(ans, o.wrong.map(String), function () { return String(o.fill()); }),
      answer: ans,
      hints: [{ k: o.pre + ".h." + o.q, p: p }, { k: "kit.s", p: { s: o.step } }, { k: "kit.ans", p: { s: minus(F.val(ans)) } }],
      verify: function () { return o.verify(F.val(ans)); }
    };
  }

  /* ---- drawings ---- */
  function balance(left, right, tilt) {
    var a = tilt > 0 ? 8 : tilt < 0 ? -8 : 0;
    return '<svg class="kit-svg" viewBox="0 0 260 150" role="img" aria-label="' + UI.esc(left + " = " + right) + '">' +
      '<polygon points="130,60 112,140 148,140" class="kit-stand"/><g transform="rotate(' + a + ' 130 60)"><rect x="20" y="56" width="220" height="8" rx="4" class="kit-beam"/>' +
      '<rect x="20" y="20" width="80" height="36" rx="10" class="kit-pan"/><text x="60" y="44" class="kit-t">' + UI.esc(left) + '</text>' +
      '<rect x="160" y="20" width="80" height="36" rx="10" class="kit-pan"/><text x="200" y="44" class="kit-t">' + UI.esc(right) + "</text></g></svg>";
  }
  /* plane: points [{x,y,l}], line {k,b} optional; range −6..6 */
  function plane(points, line) {
    var S = 20, X = function (x) { return (x + 6) * S; }, Y = function (y) { return (6 - y) * S; }, h = '<svg class="kit-svg plane" viewBox="0 0 240 240" role="img" aria-label="xy">';
    for (var i = -6; i <= 6; i++) { h += '<line x1="' + X(i) + '" y1="0" x2="' + X(i) + '" y2="240" class="kit-grid"/><line x1="0" y1="' + Y(i) + '" x2="240" y2="' + Y(i) + '" class="kit-grid"/>'; }
    h += '<line x1="0" y1="120" x2="240" y2="120" class="kit-axis"/><line x1="120" y1="0" x2="120" y2="240" class="kit-axis"/>' +
      '<text x="232" y="114" class="kit-s">x</text><text x="126" y="12" class="kit-s">y</text><text x="124" y="134" class="kit-s">0</text>' +
      '<text x="' + (X(1) - 3) + '" y="134" class="kit-s">1</text><text x="124" y="' + (Y(1) + 4) + '" class="kit-s">1</text>';
    if (line) h += '<line x1="' + X(-6) + '" y1="' + Y(line.k * -6 + line.b) + '" x2="' + X(6) + '" y2="' + Y(line.k * 6 + line.b) + '" class="kit-line"/>';
    (points || []).forEach(function (p) { h += '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="5" class="kit-pt"/>' + (p.l ? '<text x="' + (X(p.x) + 7) + '" y="' + (Y(p.y) - 6) + '" class="kit-t sm">' + UI.esc(p.l) + "</text>" : ""); });
    return h + "</svg>";
  }
  function bars(vals, labels) {
    var max = Math.max.apply(null, vals.concat([1])), w = 260 / vals.length, h = '<svg class="kit-svg" viewBox="0 0 280 170" role="img" aria-label="chart">';
    for (var g = 0; g <= max; g += Math.max(1, Math.ceil(max / 5))) { var gy = 140 - g / max * 120; h += '<line x1="20" y1="' + gy + '" x2="280" y2="' + gy + '" class="kit-grid"/><text x="2" y="' + (gy + 4) + '" class="kit-s">' + g + "</text>"; }
    vals.forEach(function (v, i) {
      var bh = v / max * 120, x = 24 + i * w;
      h += '<rect x="' + (x + 4) + '" y="' + (140 - bh) + '" width="' + (w - 10) + '" height="' + bh + '" rx="4" class="kit-bar b' + (i % 5) + '"/>' +
        '<text x="' + (x + w / 2) + '" y="158" class="kit-s mid">' + UI.esc(labels[i]) + "</text>";
    });
    return h + "</svg>";
  }
  function rect(a, b, grid) {
    var s = Math.min(200 / a, 110 / b), W = a * s, H = b * s, h = '<svg class="kit-svg" viewBox="0 0 260 160" role="img" aria-label="' + a + "×" + b + '">';
    h += '<rect x="30" y="20" width="' + W + '" height="' + H + '" class="kit-shape"/>';
    if (grid) for (var i = 1; i < a; i++) h += '<line x1="' + (30 + i * s) + '" y1="20" x2="' + (30 + i * s) + '" y2="' + (20 + H) + '" class="kit-grid"/>';
    if (grid) for (var j = 1; j < b; j++) h += '<line x1="30" y1="' + (20 + j * s) + '" x2="' + (30 + W) + '" y2="' + (20 + j * s) + '" class="kit-grid"/>';
    return h + '<text x="' + (30 + W / 2) + '" y="' + (36 + H) + '" class="kit-t sm">' + a + '</text><text x="' + (38 + W) + '" y="' + (24 + H / 2) + '" class="kit-t sm start">' + b + "</text></svg>";
  }
  function triangle(a, b, c) {
    return '<svg class="kit-svg" viewBox="0 0 260 150" role="img" aria-label="triangle"><polygon points="30,130 230,130 90,25" class="kit-shape"/>' +
      '<text x="52" y="122" class="kit-t sm">' + a + '°</text><text x="200" y="122" class="kit-t sm">' + b + '°</text><text x="92" y="52" class="kit-t sm">' + c + "</text></svg>";
  }
  function sup(n) { return String(n).split("").map(function (d) { return "⁰¹²³⁴⁵⁶⁷⁸⁹".charAt(Number(d)); }).join(""); }
  function lineStr(k, b) { var ks = k === 1 ? "" : k === -1 ? "−" : minus(k); return "y = " + ks + "x" + (b === 0 ? "" : sgn(b)); }

  return { lesson: lesson, sandbox: sandbox, task: task, balance: balance, plane: plane, bars: bars, rect: rect, triangle: triangle,
           minus: minus, sgn: sgn, sup: sup, lineStr: lineStr };
})();
