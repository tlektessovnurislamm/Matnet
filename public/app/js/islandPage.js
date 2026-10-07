/* islandPage.js — loads the island's script from config and runs lesson → sandbox → game → summary. */
(function () {
  var id = new URLSearchParams(location.search).get("id") || "fractions";
  var cfg = islandById(id);
  var tab = "lesson", impl = null, game = null, result = null;

  UI.init();
  document.getElementById("fox").innerHTML = UI.foxSVG(Store.get().avatar.worn);

  if (!cfg || !cfg.script || Store.get().unlocked.indexOf(id) < 0) {
    document.getElementById("panel").innerHTML = '<div class="card"><p>' + UI.esc(t(cfg && cfg.script ? "common.locked" : "common.building")) +
      '</p><a class="btn btn-primary" href="index.html">' + UI.esc(t("common.toMap")) + "</a></div>";
    return;
  }

  /* Track time spent while the tab is visible. */
  setInterval(function () { if (!document.hidden) Progress.addTime(id, 5000); }, 5000);

  function renderTabs() {
    document.getElementById("isl-title").textContent = t("islands." + id);
    document.body.setAttribute("data-i18n-title", "islands." + id);
    document.title = t("islands." + id) + " · " + t("common.title");
    var tabs = ["lesson", "sandbox", "game"].concat(result ? ["summary"] : []);
    var el = document.getElementById("tabs");
    el.innerHTML = tabs.map(function (k) {
      return '<button role="tab" data-tab="' + k + '" aria-selected="' + (k === tab) + '">' + UI.esc(t("common." + k)) + "</button>";
    }).join("") + '<a class="btn btn-soft" href="index.html" style="margin-left:auto">← ' + UI.esc(t("common.toMap")) + "</a>";
    el.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-tab")); }; });
  }

  function go(k) { tab = k; if (k !== "game") game = null; renderTabs(); renderPanel(); }

  function renderPanel() {
    var p = document.getElementById("panel");
    if (tab === "lesson") { impl.renderLesson(p); UI.mascotSay(t("common.greet")); }
    else if (tab === "sandbox") { impl.renderSandbox(p); UI.mascotSay(t("common.effort")); }
    else if (tab === "game") {
      if (game) { game.render(); return; }
      p.innerHTML = '<div class="card" style="text-align:center"><h2>' + UI.esc(t(impl.gameTitleKey)) + "</h2><p>" + UI.esc(t(impl.gameIntroKey)) +
        "</p><p><b>" + UI.esc(t("common.chooseLevel")) + '</b></p><div class="level-pick">' +
        ["easy", "medium", "hard"].map(function (l) { return '<button class="btn btn-primary" data-lv="' + l + '">' + UI.esc(t("common.levels." + l)) + "</button>"; }).join("") + "</div></div>";
      UI.mascotSay(t(impl.gameIntroKey));
      p.querySelectorAll("[data-lv]").forEach(function (b) {
        b.onclick = function () {
          game = Game.start(p, {
            islandId: id, startLevel: b.getAttribute("data-lv"), total: 10,
            generators: impl.generators, renderVisual: impl.renderVisual,
            onFinish: function (correct, total) { result = Progress.finishIsland(id, correct, total); result.correct = correct; result.total = total; game = null; Sound.play("win"); go("summary"); }
          });
        };
      });
    } else if (tab === "summary") renderSummary(p);
  }

  function renderSummary(p) {
    var r = result, stars = "";
    for (var i = 1; i <= 3; i++) stars += i <= r.stars ? "★" : '<span class="off">★</span>';
    var keyText = r.keyEarned ? t("common.keyEarned") : r.hasKey ? t("common.keyHave") : t("common.keyNeed", { n: r.keyMin });
    var next = r.nextId && Store.get().unlocked.indexOf(r.nextId) >= 0 && islandById(r.nextId).script;
    p.innerHTML = '<div class="card summary"><div class="stars-big" aria-label="' + r.stars + '/3">' + stars + "</div>" +
      "<h2>" + UI.esc(t("common.resultLine", { c: r.correct, n: r.total })) + "</h2><p>" + UI.esc(t("common.effort")) + "</p>" +
      (r.hasKey ? '<div class="key" aria-hidden="true">🗝️</div>' : "") + "<p><b>" + UI.esc(keyText) + "</b></p>" +
      (r.newMedals.length ? "<p>" + UI.esc(t("common.medalsNew")) + " " + r.newMedals.map(function (m) { return '<span class="medal">🏅 ' + UI.esc(t("medals." + m)) + "</span>"; }).join(" ") + "</p>" : "") +
      '<div class="row"><button class="btn btn-primary" id="again">' + UI.esc(t("common.playAgain")) + "</button>" +
      (next ? '<a class="btn btn-accent" href="island.html?id=' + r.nextId + '">' + UI.esc(t("common.nextIsland")) + " →</a>" : "") +
      '<a class="btn btn-soft" href="index.html">' + UI.esc(t("common.toMap")) + "</a></div></div>";
    p.querySelector("#again").onclick = function () { go("game"); };
    UI.mascotSay(keyText);
  }

  document.addEventListener("gotab", function (e) { go(e.detail); });
  document.addEventListener("langchange", function () { renderTabs(); renderPanel(); });

  /* Load the island module dynamically (works from file:// too). */
  var sc = document.createElement("script");
  sc.src = cfg.script;
  sc.onload = function () { impl = window.ISLAND_IMPL[id]; renderTabs(); renderPanel(); };
  document.body.appendChild(sc);
})();
