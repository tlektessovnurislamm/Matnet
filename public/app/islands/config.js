/* islands/config.js — the island list, in unlock order.
 * To add an island: add an entry here, create islands/<id>.js, add an i18n section "<id>"
 * and a name under I18N.<lang>.islands.<id>. "script: null" means the island isn't built yet.
 * pos = position on the map in percent. */
var ISLANDS = [
  { id: "fractions",      script: "islands/fractions.js", icon: "½",   grades: "4–5", hue: "coral", pos: { x: 14, y: 26 } },
  { id: "decimals",       script: null,                   icon: "0,5", grades: "5",   hue: "leaf",  pos: { x: 40, y: 14 } },
  { id: "percent",        script: null,                   icon: "%",   grades: "5–6", hue: "sun",   pos: { x: 68, y: 22 } },
  { id: "equations",      script: null,                   icon: "=",   grades: "5–6", hue: "sky",   pos: { x: 84, y: 52 } },
  { id: "proportion",     script: null,                   icon: "a:b", grades: "6",   hue: "berry", pos: { x: 60, y: 74 } },
  { id: "geometry",       script: null,                   icon: "△",   grades: "4–6", hue: "leaf",  pos: { x: 32, y: 78 } },
  { id: "multiplication", script: null,                   icon: "×",   grades: "4",   hue: "sky",   pos: { x: 12, y: 58 } }
];
function islandById(id) { for (var i = 0; i < ISLANDS.length; i++) if (ISLANDS[i].id === id) return ISLANDS[i]; return null; }
