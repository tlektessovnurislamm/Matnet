/* ui.js — shared UI: top bar (stats, A-/A+, sound, KZ|RU), mascot, rich text with fractions. */
var UI = (function () {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* Escapes text, then turns "3/4" into a stacked fraction (numerator / denominator colored). */
  function fracHTML(n, d) {
    return '<span class="frac" aria-label="' + n + "/" + d + '"><span class="num">' + n + '</span><span class="den">' + d + "</span></span>";
  }
  function rich(s) { return esc(s).replace(/(\d+)\/(\d+)/g, function (m, n, d) { return fracHTML(n, d); }); }

  function applyFont() {
    document.documentElement.style.setProperty("--font-scale", Store.get().settings.fontScale);
  }

  function renderTopbar() {
    var el = document.getElementById("topbar");
    if (!el) return;
    var s = Store.get();
    el.innerHTML =
      '<a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">½</span><span>' + esc(t("common.title")) + "</span></a>" +
      '<div class="stats">' +
        '<span class="pill" title="' + esc(t("common.stars")) + '"><span aria-hidden="true">★</span> <b id="st-stars">' + Progress.totalStars() + '</b><span class="sr">' + esc(t("common.stars")) + "</span></span>" +
        '<span class="pill" title="' + esc(t("common.points")) + '"><span aria-hidden="true">●</span> <b id="st-points">' + s.points + '</b><span class="sr">' + esc(t("common.points")) + "</span></span>" +
        (s.streak.count > 1 ? '<span class="pill pill-hot">' + esc(t("common.streak", { n: s.streak.count })) + "</span>" : "") +
      "</div>" +
      '<div class="tools">' +
        '<button class="icon-btn" id="fs-minus" aria-label="' + esc(t("common.fontSmaller")) + '">A−</button>' +
        '<button class="icon-btn" id="fs-plus" aria-label="' + esc(t("common.fontBigger")) + '">A+</button>' +
        '<button class="icon-btn" id="snd" aria-pressed="' + s.settings.sound + '" aria-label="' + esc(t(s.settings.sound ? "common.soundOn" : "common.soundOff")) + '">' + (s.settings.sound ? "♪" : "×♪") + "</button>" +
        '<div class="lang" role="group" aria-label="' + esc(t("common.langGroup")) + '">' +
          '<button data-lang="kz" aria-pressed="' + (getLang() === "kz") + '">KZ</button>' +
          '<button data-lang="ru" aria-pressed="' + (getLang() === "ru") + '">RU</button>' +
        "</div>" +
      "</div>";
    el.querySelector("#fs-minus").onclick = function () { changeFont(-0.1); };
    el.querySelector("#fs-plus").onclick = function () { changeFont(0.1); };
    el.querySelector("#snd").onclick = function () { s.settings.sound = !s.settings.sound; Store.save(); renderTopbar(); };
    el.querySelectorAll("[data-lang]").forEach(function (b) { b.onclick = function () { setLang(b.getAttribute("data-lang")); }; });
  }

  function changeFont(delta) {
    var st = Store.get().settings;
    st.fontScale = Math.round(Math.min(1.5, Math.max(0.8, st.fontScale + delta)) * 10) / 10;
    Store.save(); applyFont();
  }

  function refreshStats() {
    var a = document.getElementById("st-points"), b = document.getElementById("st-stars");
    if (a) a.textContent = Store.get().points;
    if (b) b.textContent = Progress.totalStars();
  }

  /* Fox mascot as inline SVG. worn = ["hat","glasses","scarf"] */
  function foxSVG(worn) {
    worn = worn || [];
    return '<svg class="fox" viewBox="0 0 200 200" aria-hidden="true">' +
      '<path class="fox-ear" d="M45 85 L60 20 L95 62Z"/><path class="fox-ear" d="M155 85 L140 20 L105 62Z"/>' +
      '<path class="fox-ear-in" d="M58 70 L64 38 L84 60Z"/><path class="fox-ear-in" d="M142 70 L136 38 L116 60Z"/>' +
      '<path class="fox-head" d="M30 95 Q40 55 100 52 Q160 55 170 95 Q160 150 100 175 Q40 150 30 95Z"/>' +
      '<path class="fox-cheek" d="M40 110 Q70 115 100 175 Q55 160 40 110Z"/><path class="fox-cheek" d="M160 110 Q130 115 100 175 Q145 160 160 110Z"/>' +
      '<g class="fox-eyes"><ellipse cx="75" cy="100" rx="8" ry="10"/><ellipse cx="125" cy="100" rx="8" ry="10"/></g>' +
      '<circle class="fox-shine" cx="78" cy="96" r="3"/><circle class="fox-shine" cx="128" cy="96" r="3"/>' +
      '<ellipse class="fox-nose" cx="100" cy="148" rx="9" ry="7"/>' +
      '<path class="fox-mouth" d="M88 158 Q100 166 112 158"/>' +
      (worn.indexOf("glasses") >= 0 ? '<g class="acc-glasses"><circle cx="75" cy="100" r="17"/><circle cx="125" cy="100" r="17"/><path d="M92 100 H108"/></g>' : "") +
      (worn.indexOf("hat") >= 0 ? '<g class="acc-hat"><path d="M65 60 L100 0 L135 60Z"/><circle cx="100" cy="2" r="8"/></g>' : "") +
      (worn.indexOf("scarf") >= 0 ? '<path class="acc-scarf" d="M50 160 Q100 195 150 160 L155 178 Q100 210 45 178Z"/>' : "") +
      "</svg>";
  }

  function mascotSay(text) {
    var b = document.getElementById("bubble");
    if (!b) return;
    b.textContent = text;
    b.classList.remove("bubble-in"); void b.offsetWidth; b.classList.add("bubble-in");
  }

  /* Show/hide all read-aloud buttons depending on voice availability. */
  function refreshSpeak() {
    var ok = Sound.canSpeak();
    document.querySelectorAll(".speak-btn").forEach(function (b) { b.hidden = !ok; });
  }
  function speakBtn(text) {
    return '<button class="icon-btn speak-btn" hidden data-say="' + esc(text) + '" aria-label="' + esc(t("common.readAloud")) + '">🔊</button>';
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".speak-btn");
    if (b) Sound.speak(b.getAttribute("data-say"));
  });
  document.addEventListener("voiceschange", refreshSpeak);

  /* Common page bootstrap. */
  function init() {
    applyFont();
    applyI18n();
    renderTopbar();
    document.addEventListener("langchange", function () { renderTopbar(); setTimeout(refreshSpeak, 0); });
    setTimeout(refreshSpeak, 300);
  }

  return { esc: esc, rich: rich, fracHTML: fracHTML, renderTopbar: renderTopbar, refreshStats: refreshStats,
           foxSVG: foxSVG, mascotSay: mascotSay, refreshSpeak: refreshSpeak, speakBtn: speakBtn, init: init };
})();
