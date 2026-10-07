/* sound.js — short synthesized sounds (Web Audio, no files) and read-aloud (Web Speech API). */
var Sound = (function () {
  var ctx = null;

  function tone(freq, start, dur, type) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur + 0.05);
  }

  /* kind: "ok" | "soft" (gentle, never harsh for wrong answers) | "win" | "tap" */
  function play(kind) {
    if (!Store.get().settings.sound) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (kind === "ok") { tone(660, 0, 0.15); tone(880, 0.12, 0.2); }
      else if (kind === "soft") { tone(330, 0, 0.25, "triangle"); }
      else if (kind === "win") { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.12, 0.25); }); }
      else { tone(520, 0, 0.06); }
    } catch (e) { /* audio not available */ }
  }

  function voiceFor(lang) {
    if (!("speechSynthesis" in window)) return null;
    var prefix = lang === "kz" ? "kk" : "ru";
    var vs = speechSynthesis.getVoices() || [];
    for (var i = 0; i < vs.length; i++) if ((vs[i].lang || "").toLowerCase().indexOf(prefix) === 0) return vs[i];
    return null;
  }

  function canSpeak() { return !!voiceFor(getLang()); }

  function speak(text) {
    var v = voiceFor(getLang());
    if (!v) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text.replace(/(\d+)\/(\d+)/g, "$1 / $2"));
    u.voice = v; u.lang = v.lang; u.rate = 0.9;
    speechSynthesis.speak(u);
  }

  /* Voices load asynchronously; tell the UI to re-check the read-aloud buttons. */
  if ("speechSynthesis" in window) {
    speechSynthesis.onvoiceschanged = function () { document.dispatchEvent(new CustomEvent("voiceschange")); };
  }

  return { play: play, speak: speak, canSpeak: canSpeak };
})();
