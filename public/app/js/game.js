/* game.js — shared "Treasure Hunt" game engine used by every island.
 * 10 questions, adaptive difficulty (3 right in a row → level up, 2 wrong in a row → level down),
 * 3-level help, gentle feedback. The island supplies generators per level and a renderVisual(). */
var Game = (function () {
  var LV = ["easy", "medium", "hard"];

  function start(root, cfg) {
    var total = cfg.total || 10;
    var s = { i: 0, level: cfg.startLevel || "easy", okRow: 0, badRow: 0, correct: 0 };

    function newTask() {
      var pool = cfg.generators[s.level];
      s.task = TaskGen.pick(pool)();
      s.tries = 0; s.hint = 0; s.done = false; s.solved = false; s.wrong = []; s.usedHelp = false; s.msg = null;
    }

    function chest(i) {
      var open = i < s.i || (i === s.i && s.solved);
      return '<span class="chest' + (open ? " open" : "") + (i === s.i ? " current" : "") + '" aria-hidden="true">' +
        '<svg viewBox="0 0 40 34"><rect class="chest-body" x="3" y="14" width="34" height="18" rx="3"/>' +
        '<g class="chest-lid"><rect x="3" y="6" width="34" height="10" rx="4"/></g><rect class="chest-lock" x="17" y="14" width="6" height="7" rx="1"/></svg></span>';
    }

    function render() {
      var tk = s.task, lvl = LV.indexOf(s.level);
      var promptText = t(tk.prompt.k, tk.prompt.p);
      var html = '<div class="chests">';
      for (var i = 0; i < total; i++) html += chest(i);
      html += "</div>";
      html += '<div class="game-meta"><span class="badge lv-' + s.level + '">' + UI.esc(t("common.level")) + ": " + UI.esc(t("common.levels." + s.level)) + "</span>" +
        "<span>" + UI.esc(t("common.questionOf", { i: s.i + 1, n: total })) + "</span></div>";
      html += '<div class="card task"><div class="prompt-row"><p class="prompt">' + UI.rich(promptText) + "</p>" + UI.speakBtn(promptText) + "</div>";
      if (tk.visual && cfg.renderVisual) html += '<div class="visual">' + cfg.renderVisual(tk.visual) + "</div>";
      html += '<div class="options" role="group">';
      tk.options.forEach(function (o, idx) {
        var cls = "opt";
        if (s.wrong.indexOf(o) >= 0) cls += " wrong";
        if (s.done && o === tk.answer) cls += " right";
        var label = o === "=" ? t("common.equal") : o;
        html += '<button class="' + cls + '" data-idx="' + idx + '"' + (s.done || s.wrong.indexOf(o) >= 0 ? " disabled" : "") +
          ' aria-label="' + UI.esc(label) + '">' + (o === "=" ? UI.esc(label) : UI.rich(o)) + "</button>";
      });
      html += "</div>";
      html += '<div class="help">';
      for (var h = 1; h <= 3; h++) {
        html += '<button class="btn btn-soft" data-help="' + h + '"' + (h > s.hint + 1 || h <= s.hint ? " disabled" : "") + ">" + UI.esc(t("common.help" + h)) + "</button>";
      }
      html += "</div>";
      if (s.hint > 0) {
        html += '<ol class="hints">';
        for (var k = 0; k < s.hint; k++) html += '<li class="hint-in">' + UI.rich(t(tk.hints[k].k, tk.hints[k].p)) + "</li>";
        html += "</ol>";
      }
      html += '<div class="feedback" aria-live="polite">';
      if (s.msg) html += '<p class="fb fb-' + s.msg.type + '">' + UI.esc(s.msg.text) + (s.msg.extra ? "<br><b>" + UI.esc(t(s.msg.extra)) + "</b>" : "") + "</p>";
      html += "</div>";
      if (s.done && s.tries > 0) html += '<a class="btn btn-soft" href="ask.html?q=' + encodeURIComponent(promptText) + "&a=" + encodeURIComponent(s.wrong[0]) + '">🦊 ' + UI.esc(t("ask.explainMistake")) + "</a>";
      if (s.done) html += '<button class="btn btn-primary btn-next">' + UI.esc(t("common.next")) + " →</button>";
      html += "</div>";
      root.innerHTML = html;

      root.querySelectorAll(".opt").forEach(function (b) {
        b.onclick = function () { answer(tk.options[Number(b.getAttribute("data-idx"))]); };
      });
      root.querySelectorAll("[data-help]").forEach(function (b) {
        b.onclick = function () { s.hint = Number(b.getAttribute("data-help")); s.usedHelp = true; Sound.play("tap"); render(); };
      });
      var nx = root.querySelector(".btn-next");
      if (nx) { nx.onclick = next; nx.focus(); }
      UI.refreshSpeak();
      if (lvl < 0) s.level = "easy";
    }

    function answer(opt) {
      if (s.done) return;
      var lvl = LV.indexOf(s.level);
      if (opt === s.task.answer) {
        s.done = true; s.solved = true;
        var first = s.tries === 0;
        if (first) s.correct++;
        var pts = first && !s.usedHelp ? 10 : 5;
        Progress.addPoints(pts);
        Progress.recordAnswer(cfg.islandId, first);
        s.okRow++; s.badRow = 0;
        s.msg = { type: "ok", text: TaskGen.pick(tList("common.praise")) + " " + t("common.pointsPlus", { n: pts }) };
        if (s.okRow >= 3 && lvl < 2) { s.level = LV[lvl + 1]; s.okRow = 0; s.msg.extra = "common.levelUp"; }
        Sound.play("ok");
        UI.mascotSay(s.msg.text);
      } else {
        s.tries++; s.wrong.push(opt); s.badRow++; s.okRow = 0;
        Sound.play("soft");
        if (s.tries === 1) {
          s.hint = Math.max(s.hint, 1);
          s.msg = { type: "try", text: TaskGen.pick(tList("common.wrong")) };
        } else {
          s.hint = 3; s.done = true;
          Progress.recordAnswer(cfg.islandId, false);
          s.msg = { type: "try", text: t("common.showSolution") };
        }
        if (s.badRow >= 2 && lvl > 0) { s.level = LV[lvl - 1]; s.badRow = 0; s.msg.extra = "common.levelDown"; }
        UI.mascotSay(s.msg.text);
      }
      render();
    }

    function next() {
      s.i++;
      if (s.i >= total) { cfg.onFinish(s.correct, total); return; }
      newTask(); render();
    }

    newTask(); render();
    return { render: render };
  }

  return { start: start };
})();
