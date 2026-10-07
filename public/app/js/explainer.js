/* explainer.js — offline, rule-based "Ask Fox". No AI, no network.
 * Explainer.explain(question, answer) → {steps:[{k,p}], kind} where every step is an i18n key + params,
 * so the explanation re-renders instantly when the language changes.
 * Understands: a/b ± c/d, a/b · c/d, a/b : c/d, comparing two numbers/fractions,
 * "k/d of n", "p% of n", integer + − · :, and key words (numerator, area, …). */
var Explainer = (function () {
  var F = TaskGen;
  var T = "^(\\d+)(?:/(\\d+))?$";

  function term(s) {
    var m = String(s).trim().match(new RegExp(T));
    if (!m) return null;
    var d = m[2] ? Number(m[2]) : 1;
    if (d === 0) return { zeroDen: true };
    return { n: Number(m[1]), d: d, isFrac: !!m[2], raw: m[2] ? m[1] + "/" + m[2] : m[1] };
  }
  function fs(n, d) { return F.frac(n, d); }

  function normalize(q) {
    return q.toLowerCase()
      .replace(/[−–—]/g, "-").replace(/÷/g, ":")
      .replace(/(\d)\s*[xх×·*]\s*(\d)/g, "$1*$2")
      .replace(/\s+/g, " ");
  }

  /* Adds "simplify" + final answer steps for n/d. Returns the result string. */
  function finish(steps, n, d) {
    var g = F.gcd(n, d), r = fs(n / g, d / g);
    if (g > 1) steps.push({ k: "ask.e.simplify", p: { g: g, f: n + "/" + d, r: r } });
    steps.push({ k: "ask.e.answer", p: { r: r } });
    return r;
  }

  function fracOp(a, b, op, steps) {
    var n, d;
    if (op === "+" || op === "-") {
      var word = op === "+" ? "ask.e.addNums" : "ask.e.subNums";
      var x = a.n, y = b.n;
      if (a.d === b.d) {
        d = a.d;
        steps.push({ k: "ask.e.sameDen", p: { d: d } });
      } else {
        d = F.lcm(a.d, b.d);
        x = a.n * d / a.d; y = b.n * d / b.d;
        steps.push({ k: "ask.e.lcm", p: { l: d, d1: a.d, d2: b.d } });
        steps.push({ k: "ask.e.convert", p: { a: a.raw, b: b.raw, a2: x + "/" + d, b2: y + "/" + d } });
      }
      n = op === "+" ? x + y : x - y;
      if (n < 0) { steps.push({ k: "ask.e.negative", p: {} }); return null; }
      if (n === 0) { steps.push({ k: "ask.e.answer", p: { r: "0" } }); return "0"; }
      steps.push({ k: word, p: { x: x, y: y, s: n, f: n + "/" + d } });
      return finish(steps, n, d);
    }
    if (op === "*") {
      n = a.n * b.n; d = a.d * b.d;
      steps.push({ k: "ask.e.mul", p: { a: a.raw, b: b.raw, f: n + "/" + d } });
      return finish(steps, n, d);
    }
    // division
    if (b.n === 0) { steps.push({ k: "ask.e.zero", p: {} }); return null; }
    n = a.n * b.d; d = a.d * b.n;
    steps.push({ k: "ask.e.div", p: { a: a.raw, b: b.raw, inv: b.d + "/" + b.n, f: n + "/" + d } });
    return finish(steps, n, d);
  }

  function intOp(a, b, op, steps) {
    var sym = { "+": "+", "-": "−", "*": "·", ":": ":" }[op], r;
    if (op === "+") r = a + b;
    else if (op === "-") { if (b > a) { steps.push({ k: "ask.e.negative", p: {} }); return null; } r = a - b; }
    else if (op === "*") r = a * b;
    else {
      if (b === 0) { steps.push({ k: "ask.e.zero", p: {} }); return null; }
      if (a % b !== 0) {
        var q = Math.floor(a / b), rem = a % b;
        steps.push({ k: "ask.e.intDivRem", p: { a: a, b: b, q: q, rem: rem } });
        return q + "r" + rem; // not comparable to a simple answer
      }
      r = a / b;
    }
    steps.push({ k: "ask.e.intOp", p: { a: a, b: b, op: sym, r: r } });
    steps.push({ k: "ask.e.answer", p: { r: r } });
    return String(r);
  }

  var FAQ = [
    ["common", /ортақ бөлім|общ\S* знаменат/],
    ["numerator", /алым|числител/],
    ["denominator", /бөлім|знаменат/],
    ["percent", /пайыз|процент/],
    ["perimeter", /периметр/],
    ["area", /аудан|площад/],
    ["angle", /бұрыш|угол|угл/],
    ["equation", /теңдеу|уравнен/]
  ];

  function explain(question, answer) {
    var q = normalize(question), steps = [], result = null, m, info = {};
    // Allow "1/2 + 1/4 = 2/6": text after "=" is the child's answer.
    var eq = q.match(/^(.*?)=\s*([\d\/]+)\s*\??\s*$/);
    if (eq) { q = eq[1]; if (!answer) answer = eq[2]; }

    var pct = q.match(/(\d+)\s*%/);
    if (pct) {
      var rest = q.replace(pct[0], " ").match(/\d+/);
      if (rest) {
        var p = Number(pct[1]), n = Number(rest[0]);
        var top = n * p;
        if (n % 100 === 0) {
          var one = n / 100;
          steps.push({ k: "ask.e.pct1", p: { p: p, n: n, one: one } });
          steps.push({ k: "ask.e.pct2", p: { p: p, one: one, r: one * p } });
          result = String(one * p);
          steps.push({ k: "ask.e.answer", p: { r: result } });
        } else if (top % 100 === 0) {
          result = String(top / 100);
          steps.push({ k: "ask.e.pct1", p: { p: p, n: n, one: n + "/100" } });
          steps.push({ k: "ask.e.pctFrac", p: { n: n, p: p, r: result } });
          steps.push({ k: "ask.e.answer", p: { r: result } });
        } else {
          steps.push({ k: "ask.e.pctFrac", p: { n: n, p: p, r: top + "/100" } });
          result = finish(steps, top, 100);
        }
        return check(steps, result, answer, info);
      }
    }

    m = q.match(/(\d+(?:\/\d+)?)\s*([+\-*:])\s*(\d+(?:\/\d+)?)/);
    if (m) {
      var a = term(m[1]), b = term(m[3]), op = m[2];
      if (!a || !b) return none();
      if (a.zeroDen || b.zeroDen) return { steps: [{ k: "ask.e.zero", p: {} }] };
      if (!a.isFrac && !b.isFrac) result = intOp(a.n, b.n, op, steps);
      else {
        result = fracOp(a, b, op, steps);
        if (op === "+" || op === "-") info.wrongDen = fs(op === "+" ? a.n + b.n : Math.abs(a.n - b.n), op === "+" ? a.d + b.d : Math.abs(a.d - b.d) || 1);
      }
      return check(steps, result, answer, info);
    }

    var nums = q.match(/\d+(?:\/\d+)?/g) || [];
    var fr = nums.filter(function (x) { return x.indexOf("/") > 0; });
    var ints = nums.filter(function (x) { return x.indexOf("/") < 0; });

    if (fr.length === 1 && ints.length === 1) {           // "3/8 of 24"
      var f = term(fr[0]), N = Number(ints[0]);
      if (f.zeroDen) return { steps: [{ k: "ask.e.zero", p: {} }] };
      if (N % f.d === 0) {
        var qq = N / f.d;
        steps.push({ k: "ask.e.of1", p: { f: f.raw, n: N, d: f.d, q: qq } });
        steps.push({ k: "ask.e.of2", p: { q: qq, k: f.n, r: qq * f.n } });
        result = String(qq * f.n);
        steps.push({ k: "ask.e.answer", p: { r: result } });
      } else {
        steps.push({ k: "ask.e.mul", p: { a: N, b: f.raw, f: (N * f.n) + "/" + f.d } });
        result = finish(steps, N * f.n, f.d);
      }
      return check(steps, result, answer, info);
    }

    if (nums.length === 2) {                                // compare two numbers
      var A = term(nums[0]), B = term(nums[1]);
      if (A.zeroDen || B.zeroDen) return { steps: [{ k: "ask.e.zero", p: {} }] };
      var x = A.n, y = B.n;
      if (A.d === B.d) { if (A.isFrac) steps.push({ k: "ask.e.compareSame", p: {} }); }
      else {
        var l = F.lcm(A.d, B.d); x = A.n * l / A.d; y = B.n * l / B.d;
        steps.push({ k: "ask.e.lcm", p: { l: l, d1: A.d, d2: B.d } });
        steps.push({ k: "ask.e.convert", p: { a: A.raw, b: B.raw, a2: fs(x, l), b2: fs(y, l) } });
        x = fs(x, l); y = fs(y, l);
      }
      var vx = A.n / A.d, vy = B.n / B.d, sign = F.near(vx, vy) ? "=" : vx > vy ? ">" : "<";
      steps.push({ k: "ask.e.compare", p: { x: x, y: y, sign: sign, a: A.raw, b: B.raw } });
      return { steps: steps, kind: "calc" };
    }

    for (var i = 0; i < FAQ.length; i++) if (FAQ[i][1].test(q)) return { steps: [{ k: "ask.faq." + FAQ[i][0], p: {} }], kind: "faq" };
    return none();
  }

  function none() { return { steps: [], kind: "none" }; }

  function check(steps, result, answer, info) {
    if (result && answer && result.indexOf("r") < 0) {
      var u = term(normalize(answer).replace(/\s/g, ""));
      if (u && !u.zeroDen) {
        if (F.near(u.n / u.d, F.val(result))) steps.push({ k: "ask.e.yourRight", p: { u: u.raw } });
        else {
          steps.push({ k: "ask.e.yourWrong", p: { u: u.raw, r: result } });
          if (info.wrongDen && F.near(u.n / u.d, F.val(info.wrongDen))) steps.push({ k: "ask.e.mistakeDen", p: {} });
        }
      }
    }
    return { steps: steps, kind: "calc" };
  }

  /* Self-check used by tests: known questions must give known answers. */
  function selfTest() {
    var cases = [["1/2 + 1/4", "3/4"], ["5/6 - 1/3", "1/2"], ["2/3 * 3/4", "1/2"], ["3/4 : 1/2", "3/2"],
                 ["3/8 от 24", "9"], ["15% от 200", "30"], ["56 : 7", "8"], ["2/5 + 3/5", "1"], ["20% от 150", "30"]];
    return cases.filter(function (c) {
      var r = explain(c[0], ""), last = r.steps.filter(function (s) { return s.k === "ask.e.answer"; })[0];
      return !last || String(last.p.r) !== c[1];
    }).map(function (c) { return c[0]; });
  }

  return { explain: explain, selfTest: selfTest };
})();
