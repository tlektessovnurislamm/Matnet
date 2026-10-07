/* taskGenerator.js — shared math helpers for task generators + automated self-check.
 *
 * A generator is a function returning a task object:
 * {
 *   prompt:  {k: "i18n.key", p: {params}},
 *   visual:  optional data the island knows how to draw,
 *   options: ["3/4", "1/2", ...]   (strings: integers or "n/d"),
 *   answer:  one of options,
 *   hints:   [{k,p}, {k,p}, {k,p}]  (1 hint, 2 partial, 3 full solution),
 *   verify:  function → true if the answer is mathematically correct (independent recomputation)
 * }
 */
var TaskGen = (function () {
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function simp(n, d) { var g = gcd(n, d) || 1; return [n / g, d / g]; }
  function frac(n, d) { return d === 1 ? String(n) : n + "/" + d; }
  function val(s) { s = String(s); if (s.indexOf("/") < 0) return Number(s); var p = s.split("/"); return Number(p[0]) / Number(p[1]); }
  function valid(s) {
    s = String(s);
    if (s.indexOf("/") < 0) return /^\d+$/.test(s);
    var p = s.split("/");
    return /^\d+$/.test(p[0]) && /^\d+$/.test(p[1]) && Number(p[1]) > 0 && Number(p[0]) > 0;
  }
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* Build answer options. Distractors never have the same VALUE as the answer
   * (so "2/4" can't appear as a wrong option when the answer is "1/2"). */
  function makeOptions(answer, candidates, filler, count) {
    count = count || 4;
    var list = [answer];
    function tryAdd(c) {
      if (c == null || !valid(c)) return;
      for (var i = 0; i < list.length; i++) if (list[i] === c || near(val(list[i]), val(c))) return;
      list.push(c);
    }
    candidates.forEach(function (c) { if (list.length < count) tryAdd(c); });
    var guard = 0;
    while (list.length < count && guard++ < 300) tryAdd(filler());
    return shuffle(list);
  }

  /* Run every generator many times and check: answer is in options, options are distinct,
   * values are valid, and verify() confirms the math. Returns {runs, failures:[names]}. */
  function selfTest(named, runs) {
    runs = runs || 300;
    var total = 0, failures = [];
    Object.keys(named).forEach(function (name) {
      for (var i = 0; i < runs; i++) {
        total++;
        var ok = false;
        try {
          var tk = named[name]();
          var vals = tk.options.map(val);
          var distinct = vals.every(function (v, j) { return vals.findIndex(function (w) { return near(v, w); }) === j; });
          ok = tk.options.length >= 2 && tk.options.indexOf(tk.answer) >= 0 && distinct &&
               tk.options.every(function (o) { return o === "=" || valid(o); }) && tk.hints.length === 3 && tk.verify();
        } catch (e) { ok = false; }
        if (!ok) { failures.push(name); break; }
      }
    });
    return { runs: total, failures: failures };
  }

  /* Registry so the parent page can self-test every loaded island. */
  var registry = {};
  function register(islandId, named) { registry[islandId] = named; }

  return { rnd: rnd, pick: pick, gcd: gcd, lcm: lcm, simp: simp, frac: frac, val: val, near: near,
           shuffle: shuffle, makeOptions: makeOptions, selfTest: selfTest, register: register, registry: registry };
})();
