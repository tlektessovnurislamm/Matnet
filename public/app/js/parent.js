/* parent.js — progress table, difficult topics, generator self-check, reset. */
(function () {
  UI.init();
  var check = null;

  function render() {
    var s = Store.get();
    document.getElementById("totals").textContent = t("parent.totals", { p: s.points, m: s.medals.length, s: s.streak.count });
    document.getElementById("report-date").textContent = t("report.date", { d: new Date().toLocaleDateString(getLang() === "kz" ? "kk-KZ" : "ru-RU") });
    var medalNames = s.medals.length ? s.medals.map(function (m) { return t("medals." + m); }).join(", ") : t("report.none");
    document.getElementById("report-sum").innerHTML = [["report.points", s.points], ["report.stars", Progress.totalStars()], ["report.streak", s.streak.count], ["report.medals", medalNames]]
      .map(function (x) { return '<div class="sum-box"><small>' + UI.esc(t(x[0])) + "</small><b>" + UI.esc(x[1]) + "</b></div>"; }).join("");
    var rows = ISLANDS.map(function (isl) {
      var r = s.islands[isl.id];
      var name = UI.esc(t("islands." + isl.id));
      if (!r || !r.attempts) return "<tr><td>" + name + "</td><td colspan='4'>" + t("parent.notPlayed") + "</td></tr>";
      return "<tr><td>" + name + "</td><td>" + "★".repeat(r.stars) + "</td><td>" + r.attempts + "</td><td>" + Math.round(100 * r.correct / r.attempts) + "%</td><td>" +
        UI.esc(t("parent.minutes", { m: Math.round(r.timeMs / 60000) })) + "</td></tr>";
    }).join("");
    document.getElementById("table").innerHTML = "<table><thead><tr><th>" + [t("parent.topic"), t("parent.stars"), t("parent.answers"), t("parent.correctPct"), t("parent.time")].map(UI.esc).join("</th><th>") +
      "</th></tr></thead><tbody>" + rows + "</tbody></table>";
    var hard = ISLANDS.filter(function (i) { var r = s.islands[i.id]; return r && r.attempts >= 5 && r.correct / r.attempts < 0.6; });
    document.getElementById("hard").innerHTML = hard.length ? hard.map(function (i) {
      var r = s.islands[i.id];
      return "<li>" + UI.esc(t("parent.hardItem", { name: t("islands." + i.id), pct: Math.round(100 * r.correct / r.attempts) })) + "</li>";
    }).join("") : "<li>" + UI.esc(t("parent.hardNone")) + "</li>";
    if (check) document.getElementById("check").textContent = check.failures.length ? t("parent.checkFail", { list: check.failures.join(", ") }) : t("parent.checkOk", { n: check.runs });
  }

  /* Load every built island's script, then self-test all registered generators. */
  var scripts = ISLANDS.filter(function (i) { return i.script; }), left = scripts.length;
  function done() {
    var runs = 0, fails = [];
    Object.keys(TaskGen.registry).forEach(function (k) { var r = TaskGen.selfTest(TaskGen.registry[k], 300); runs += r.runs; fails = fails.concat(r.failures.map(function (f) { return k + "." + f; })); });
    var ex = Explainer.selfTest(); runs += 9; fails = fails.concat(ex.map(function (q) { return "ask: " + q; }));
    check = { runs: runs, failures: fails }; render();
  }
  scripts.forEach(function (i) { var sc = document.createElement("script"); sc.src = i.script; sc.onload = sc.onerror = function () { if (--left === 0) done(); }; document.body.appendChild(sc); });

  document.getElementById("reset").onclick = function () {
    if (!confirm(t("parent.resetConfirm"))) return;
    Store.reset(); UI.renderTopbar(); render();
    document.getElementById("reset-msg").textContent = t("parent.resetDone");
  };
  document.getElementById("print").onclick = function () { window.print(); };
  document.addEventListener("langchange", render);
  render();
})();
