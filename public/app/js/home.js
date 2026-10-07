/* home.js — island map, mascot greeting, avatar shop, medals. */
(function () {
  var SHOP = [{ id: "glasses", price: 20 }, { id: "hat", price: 30 }, { id: "scarf", price: 40 }];
  var firstToday = Progress.touchStreak();
  var greetKey = Store.get().points > 0 ? "common.greetBack" : "common.greet";

  function renderFox() { document.getElementById("fox-home").innerHTML = UI.foxSVG(Store.get().avatar.worn); }

  function renderMap() {
    var s = Store.get(), el = document.getElementById("map");
    var pts = ISLANDS.map(function (i) { return i.pos.x + " " + (i.pos.y * 0.625); }).join(" L");
    var html = '<svg class="route" viewBox="0 0 100 62.5" preserveAspectRatio="none" aria-hidden="true"><path d="M' + pts + '"/></svg>';
    ISLANDS.forEach(function (isl) {
      var unlocked = s.unlocked.indexOf(isl.id) >= 0, ready = !!isl.script;
      var stars = (s.islands[isl.id] || {}).stars || 0;
      var name = t("islands." + isl.id);
      html += '<button class="island hue-' + isl.hue + (unlocked && ready ? "" : " locked") + '" data-id="' + isl.id + '" style="left:' + isl.pos.x + "%;top:" + isl.pos.y + '%"' +
        ' aria-label="' + UI.esc(name + ". " + t("common.grades", { g: isl.grades })) + '">' +
        '<span class="ic" aria-hidden="true">' + (unlocked ? isl.icon : "🔒") + '</span><span class="nm">' + UI.esc(name) + "</span>" +
        '<span class="gr">' + UI.esc(t("common.grades", { g: isl.grades })) + '</span><span class="st" aria-hidden="true">' + "★★★".slice(0, stars) + "</span></button>";
    });
    el.innerHTML = html;
    el.querySelectorAll(".island").forEach(function (b) {
      b.onclick = function () {
        var isl = islandById(b.getAttribute("data-id"));
        if (Store.get().unlocked.indexOf(isl.id) < 0) return say(t("common.locked"));
        if (!isl.script) return say(t("common.building"));
        location.href = "island.html?id=" + isl.id;
      };
    });
  }

  function say(text) { UI.mascotSay(text); document.getElementById("toast").textContent = ""; Sound.play("tap"); }

  function renderShop() {
    var s = Store.get(), el = document.getElementById("shop");
    el.innerHTML = SHOP.map(function (it) {
      var owned = s.avatar.owned.indexOf(it.id) >= 0, worn = s.avatar.worn.indexOf(it.id) >= 0;
      var label = owned ? t(worn ? "shop.takeOff" : "shop.wear") : t("shop.buy", { n: it.price });
      return '<div class="shop-item"><div>' + UI.foxSVG([it.id]).replace('class="fox"', 'class="fox" style="width:64px;height:64px;animation:none"') + "</div><b>" + UI.esc(t("shop." + it.id)) +
        '</b><br><button class="btn btn-soft" data-item="' + it.id + '">' + UI.esc(label) + "</button></div>";
    }).join("");
    el.querySelectorAll("[data-item]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-item"), it = SHOP.filter(function (x) { return x.id === id; })[0];
        if (s.avatar.owned.indexOf(id) < 0) {
          if (s.points < it.price) { UI.mascotSay(t("shop.notEnough")); return; }
          s.points -= it.price; s.avatar.owned.push(id); s.avatar.worn.push(id);
          UI.mascotSay(t("shop.bought")); Sound.play("win");
        } else {
          var w = s.avatar.worn.indexOf(id);
          if (w >= 0) s.avatar.worn.splice(w, 1); else s.avatar.worn.push(id);
        }
        Store.save(); UI.refreshStats(); renderFox(); renderShop();
      };
    });
  }

  function renderMedals() {
    var m = Store.get().medals, el = document.getElementById("medals");
    el.innerHTML = m.length ? m.map(function (k) { return '<span class="medal">🏅 ' + UI.esc(t("medals." + k)) + "</span>"; }).join("")
      : '<p class="muted">' + UI.esc(t("common.noMedals")) + "</p>";
  }

  function renderAll() { renderFox(); renderMap(); renderShop(); renderMedals(); UI.mascotSay(t(greetKey)); }

  UI.init();
  renderAll();
  document.addEventListener("langchange", renderAll);
  if (firstToday && Store.get().streak.count > 1) document.getElementById("toast").textContent = t("common.streak", { n: Store.get().streak.count });
})();
