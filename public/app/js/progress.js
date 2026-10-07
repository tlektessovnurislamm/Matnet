/* progress.js — points, stars, keys, medals, streak and per-topic statistics. */
var Progress = (function () {
  var KEY_MIN = 6; // correct answers (out of 10) needed for a key

  function isl(id) {
    var s = Store.get();
    if (!s.islands[id]) s.islands[id] = { stars: 0, attempts: 0, correct: 0, timeMs: 0, plays: 0, best: 0 };
    return s.islands[id];
  }

  function addPoints(n) { Store.get().points += n; checkMedals(); Store.save(); UI.refreshStats(); }

  function recordAnswer(id, correct) {
    var r = isl(id);
    r.attempts++;
    if (correct) r.correct++;
    Store.save();
  }

  function addTime(id, ms) { isl(id).timeMs += ms; Store.save(); }

  function starsFor(correct) { return correct >= 9 ? 3 : correct >= 7 ? 2 : 1; } // effort always earns 1 star

  /* Called at the end of a game. Returns what happened so the summary can celebrate it. */
  function finishIsland(id, correct, total) {
    var s = Store.get(), r = isl(id);
    var stars = starsFor(correct);
    r.plays++;
    r.stars = Math.max(r.stars, stars);
    r.best = Math.max(r.best, correct);
    var keyEarned = false, nextId = null;
    var idx = ISLANDS.map(function (x) { return x.id; }).indexOf(id);
    if (idx >= 0 && idx + 1 < ISLANDS.length) nextId = ISLANDS[idx + 1].id;
    if (correct >= KEY_MIN && s.keys.indexOf(id) < 0) {
      s.keys.push(id);
      keyEarned = true;
      if (nextId && s.unlocked.indexOf(nextId) < 0) s.unlocked.push(nextId);
    }
    var before = s.medals.slice();
    if (correct === total) award("perfect");
    if (stars === 3) award("threeStars");
    checkMedals();
    Store.save();
    UI.refreshStats();
    return {
      stars: stars, keyEarned: keyEarned, hasKey: s.keys.indexOf(id) >= 0, nextId: nextId, keyMin: KEY_MIN,
      newMedals: s.medals.filter(function (m) { return before.indexOf(m) < 0; })
    };
  }

  function award(m) { var s = Store.get(); if (s.medals.indexOf(m) < 0) s.medals.push(m); }

  function checkMedals() {
    var s = Store.get();
    if (s.keys.length > 0) award("firstKey");
    if (s.points >= 100) award("points100");
    if (s.streak.count >= 3) award("streak3");
  }

  function dayStr(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  /* Daily streak: visiting on consecutive days increases it. Returns true if it's the first visit today. */
  function touchStreak() {
    var s = Store.get(), now = new Date(), today = dayStr(now);
    var y = new Date(now); y.setDate(now.getDate() - 1);
    if (s.streak.last === today) return false;
    s.streak.count = s.streak.last === dayStr(y) ? s.streak.count + 1 : 1;
    s.streak.last = today;
    checkMedals();
    Store.save();
    return true;
  }

  function totalStars() {
    var s = Store.get(), n = 0;
    for (var k in s.islands) n += s.islands[k].stars;
    return n;
  }

  return { addPoints: addPoints, recordAnswer: recordAnswer, addTime: addTime, finishIsland: finishIsland,
           touchStreak: touchStreak, totalStars: totalStars, isl: isl };
})();
