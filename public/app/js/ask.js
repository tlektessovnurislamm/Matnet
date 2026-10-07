/* ask.js — "Ask Fox": child types a question (and optionally their answer), the server asks an AI
 * model for a short step-by-step explanation. Needs internet; everything else in the app works offline. */
(function () {
  UI.init();
  document.getElementById("fox").innerHTML = UI.foxSVG(Store.get().avatar.worn);
  var form = document.getElementById("ask-form"), out = document.getElementById("result");
  var q = document.getElementById("q"), a = document.getElementById("a"), btn = document.getElementById("send");
  var lastText = null, lastMsgKey = null;

  function applyPh() {
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
  }

  /* Prefill from the game ("explain my mistake"): ask.html?q=...&a=... */
  var params = new URLSearchParams(location.search);
  if (params.get("q")) q.value = params.get("q");
  if (params.get("a")) a.value = params.get("a");

  function show(html) { out.hidden = false; out.innerHTML = html; }
  function showMsg(key) { lastMsgKey = key; lastText = null; show('<p class="fb fb-try">' + UI.esc(t(key)) + "</p>"); }
  function showText(text) {
    lastText = text; lastMsgKey = null;
    var clean = text.replace(/\*\*/g, "").replace(/^#+\s*/gm, "");
    var lines = clean.split(/\n+/).filter(function (l) { return l.trim(); });
    show('<div class="explain">' + lines.map(function (l) { return "<p>" + UI.rich(l) + "</p>"; }).join("") + "</div>" + UI.speakBtn(clean));
    UI.refreshSpeak();
  }

  form.onsubmit = function (e) {
    e.preventDefault();
    if (q.value.trim().length < 2) return showMsg("ask.empty");
    if (location.protocol === "file:" || !navigator.onLine) return showMsg("ask.offline");
    btn.disabled = true;
    show('<p class="thinking">' + UI.esc(t("ask.thinking")) + "</p>");
    fetch("/api/public/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: getLang(), question: q.value.trim(), answer: a.value.trim() })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, d: d }; });
    }).then(function (res) {
      if (res.ok && res.d.text) { showText(res.d.text); Sound.play("ok"); }
      else showMsg(res.status === 429 ? "ask.busy" : "ask.error");
    }).catch(function () { showMsg(navigator.onLine ? "ask.error" : "ask.offline"); })
      .then(function () { btn.disabled = false; });
  };

  applyPh();
  document.addEventListener("langchange", function () {
    applyPh();
    if (lastMsgKey) showMsg(lastMsgKey);
  });
})();
