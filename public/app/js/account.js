/* account.js — student profiles (full name + grade + password) stored in Lovable Cloud.
 * Talks to the cloud with plain fetch (no libraries). The login is derived from the
 * normalized full name + grade, so a child only types what they know.
 * Progress is pulled on sign-in and pushed (debounced) on every Store.save(). */
var Account = (function () {
  var URL_ = "https://anejcbbslncnclxlqjxf.supabase.co";
  var KEY_ = "sb_publishable_r7uPZ6h1eq8sySzGwY_acw_uhpWIlpg";
  var SKEY = "mathIslands.session";

  function getSession() { try { return JSON.parse(localStorage.getItem(SKEY)); } catch (e) { return null; } }
  function setSession(s) { if (s) localStorage.setItem(SKEY, JSON.stringify(s)); else localStorage.removeItem(SKEY); }

  function normName(n) { return String(n || "").trim().replace(/\s+/g, " ").toLowerCase().replace(/ё/g, "е"); }
  /* Two independent 53-bit hashes -> stable email-safe login id. */
  function hash(str, seed) {
    var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (var i = 0; i < str.length; i++) { var c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  function emailFor(name, grade) { var s = normName(name) + "|" + grade; return "s" + hash(s, 1) + hash(s, 7) + "@student.mathislands.app"; }

  function api(path, opts) {
    opts = opts || {};
    var h = { apikey: KEY_, "Content-Type": "application/json" };
    var s = getSession();
    if (opts.auth && s) h.Authorization = "Bearer " + s.access_token;
    for (var k in (opts.headers || {})) h[k] = opts.headers[k];
    return fetch(URL_ + path, { method: opts.method || "GET", headers: h, body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) { return r.text().then(function (t) { var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {} return { ok: r.ok, status: r.status, data: j }; }); });
  }
  function keep(d) {
    setSession({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() + (d.expires_in || 3600) * 1000, user_id: d.user.id });
  }
  function fresh() {
    var s = getSession();
    if (!s) return Promise.reject(new Error("nosession"));
    if (s.expires_at - Date.now() > 60000) return Promise.resolve(s);
    return api("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: s.refresh_token } })
      .then(function (r) { if (!r.ok) { setSession(null); throw new Error("expired"); } keep(r.data); return getSession(); });
  }

  function pull() {
    return fresh().then(function (s) {
      return api("/rest/v1/students?id=eq." + s.user_id + "&select=full_name,grade,progress", { auth: true });
    }).then(function (r) {
      var row = r.ok && r.data && r.data[0];
      if (!row) throw new Error("noprofile");
      var s = getSession(); s.full_name = row.full_name; s.grade = row.grade; setSession(s);
      Store.setProgress(row.progress || {});
      return row;
    });
  }
  var timer = null, pending = false;
  function push() {
    if (!getSession()) return Promise.resolve();
    pending = false;
    return fresh().then(function (s) {
      return api("/rest/v1/students?id=eq." + s.user_id, { method: "PATCH", auth: true, headers: { Prefer: "return=minimal" }, body: { progress: Store.progressPart() } });
    }).catch(function () { pending = true; });
  }
  window.onStoreSave = function () {
    if (!getSession()) return;
    pending = true;
    clearTimeout(timer); timer = setTimeout(push, 800);
  };
  window.addEventListener("pagehide", function () { if (pending) push(); });
  window.addEventListener("online", function () { if (pending) push(); });

  function err(r) {
    var m = (r.data && (r.data.msg || r.data.error_description || r.data.message || r.data.code)) || "";
    if (/already|exists/i.test(m)) return "account.errExists";
    if (/invalid.*cred/i.test(m)) return "account.errWrong";
    if (/password/i.test(m)) return "account.errPassword";
    return "account.errNet";
  }

  function register(name, grade, password) {
    name = String(name).trim().replace(/\s+/g, " ");
    return api("/auth/v1/signup", { method: "POST", body: { email: emailFor(name, grade), password: password, data: { full_name: name, grade: grade } } })
      .then(function (r) {
        if (!r.ok || !r.data || !r.data.access_token) throw new Error(r.ok ? "account.errExists" : err(r));
        keep(r.data);
        Store.setProgress({});
        return api("/rest/v1/students", { method: "POST", auth: true, headers: { Prefer: "return=minimal" }, body: { id: r.data.user.id, full_name: name, grade: grade, progress: Store.progressPart() } });
      }).then(function (r) {
        if (!r.ok) throw new Error("account.errNet");
        var s = getSession(); s.full_name = name; s.grade = grade; setSession(s);
      });
  }
  function login(name, grade, password) {
    return api("/auth/v1/token?grant_type=password", { method: "POST", body: { email: emailFor(name, grade), password: password } })
      .then(function (r) { if (!r.ok) throw new Error(err(r)); keep(r.data); return pull(); });
  }
  function logout() {
    var go = function () { setSession(null); Store.setProgress({}); location.href = "login.html"; };
    push().then(function () { return api("/auth/v1/logout", { method: "POST", auth: true }); }).then(go, go);
  }

  /* Guard: every page except login.html needs a signed-in student. */
  var isLogin = /login\.html$/.test(location.pathname);
  if (!isLogin && !getSession()) location.replace("login.html");
  if (!isLogin && getSession()) {
    // Refresh from the cloud in the background (another device may have newer progress).
    pull().then(function () { if (window.UI && UI.renderTopbar) { UI.renderTopbar(); } }).catch(function (e) {
      if (e && (e.message === "expired" || e.message === "noprofile")) { setSession(null); location.replace("login.html"); }
    });
  }

  return { register: register, login: login, logout: logout, session: getSession };
})();
