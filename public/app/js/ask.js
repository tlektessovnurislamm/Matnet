/* ask.js — "Ask Fox" page. Explanations come from explainer.js (offline, no AI).
 * Every question and its explanation is saved in localStorage (askHistory, newest first, max 30). */
(function () {
  UI.init();
  document.getElementById("fox").innerHTML = UI.foxSVG(Store.get().avatar.worn);
  var form = document.getElementById("ask-form"), out = document.getElementById("result");
  var q = document.getElementById("q"), a = document.getElementById("a");
  var current = null; // {q, a, steps, kind} | {msg}

  function applyPh() {
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
  }

  var params = new URLSearchParams(location.search);
  if (params.get("q")) q.value = params.get("q");
  if (params.get("a")) a.value = params.get("a");

  function renderResult() {
    if (!current) { out.hidden = true; return; }
    out.hidden = false;
    if (current.msg) { out.innerHTML = '<p class="fb fb-try">' + UI.esc(t(current.msg)) + "</p>"; return; }
    if (current.kind === "none") {
      out.innerHTML = '<p class="fb fb-try">' + UI.esc(t("ask.notUnderstood")) + '</p><div class="examples">' +
        tList("ask.examples").map(function (ex) { return '<button class="btn btn-soft ex" type="button">' + UI.rich(ex) + "</button>"; }).join("") +
        '</div><p class="muted">' + UI.esc(t("ask.words")) + "</p>";
      out.querySelectorAll(".ex").forEach(function (b, i) { b.onclick = function () { q.value = tList("ask.examples")[i]; a.value = ""; ask(); }; });
      return;
    }
    var lines = current.steps.map(function (s, i) {
      var txt = t(s.k, s.p), last = s.k === "ask.e.answer";
      return '<p class="' + (last ? "answer-line" : "") + '">' + (current.kind === "calc" && !/your|mistake/.test(s.k) && !last ? (i + 1) + ". " : "") + UI.rich(txt) + "</p>";
    });
    var all = current.steps.map(function (s) { return t(s.k, s.p); }).join(" ");
    out.innerHTML = '<p class="muted ask-q">' + UI.rich(current.q + (current.a ? "  →  " + current.a : "")) + '</p><div class="explain">' + lines.join("") +
      '</div><p class="effort">' + UI.esc(t("common.effort")) + "</p>" + UI.speakBtn(all);
    UI.refreshSpeak();
  }

  function renderHistory() {
    var h = Store.get().askHistory || [], el = document.getElementById("history");
    el.innerHTML = h.length ? '<ul class="hist">' + h.map(function (it, i) {
      return '<li><button class="hist-item" type="button" data-i="' + i + '">' + UI.rich(it.q + (it.a ? "  →  " + it.a : "")) + "</button></li>";
    }).join("") + "</ul>" : '<p class="muted">' + UI.esc(t("ask.historyEmpty")) + "</p>";
    el.querySelectorAll(".hist-item").forEach(function (b) {
      b.onclick = function () { var it = h[Number(b.getAttribute("data-i"))]; current = it; q.value = it.q; a.value = it.a || ""; renderResult(); out.scrollIntoView({ behavior: "smooth" }); };
    });
    document.getElementById("clear").hidden = !h.length;
  }

  function ask() {
    var question = q.value.trim(), answer = a.value.trim();
    if (question.length < 1) { current = { msg: "ask.empty" }; renderResult(); return; }
    var r = Explainer.explain(question, answer);
    current = { q: question, a: answer, steps: r.steps, kind: r.kind, time: Date.now() };
    renderResult();
    if (r.kind !== "none") {
      var s = Store.get();
      s.askHistory = (s.askHistory || []).filter(function (x) { return !(x.q === question && x.a === answer); });
      s.askHistory.unshift(current);
      s.askHistory = s.askHistory.slice(0, 30);
      Store.save();
      renderHistory();
      Sound.play("ok");
      UI.mascotSay(t("ask.saved"));
    }
  }

  form.onsubmit = function (e) { e.preventDefault(); ask(); };
  document.getElementById("clear").onclick = function () { Store.get().askHistory = []; Store.save(); renderHistory(); };

  applyPh();
  renderHistory();
  if (params.get("q")) ask();
  document.addEventListener("langchange", function () { applyPh(); renderResult(); renderHistory(); });
})();
