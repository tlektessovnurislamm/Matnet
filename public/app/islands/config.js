/* islands/config.js — the island list, in unlock order.
 * To add an island: add an entry here, create islands/<id>.js, add an i18n section "<id>"
 * and a name under I18N.<lang>.islands.<id>. "script: null" means the island isn't built yet.
 */
var ISLANDS = [
  { id: "fractions",      script: "islands/fractions.js", icon: "½",   grades: "4–5", hue: "coral" },
  { id: "decimals",       script: "islands/decimals.js",  icon: "0,5", grades: "5",   hue: "leaf" },
  { id: "percent",        script: "islands/percent.js",   icon: "%",   grades: "5–6", hue: "sun" },
  { id: "equations",      script: null,                   icon: "=",   grades: "5–6", hue: "sky" },
  { id: "proportion",     script: null,                   icon: "a:b", grades: "6",   hue: "berry" },
  { id: "geometry",       script: null,                   icon: "△",   grades: "4–6", hue: "leaf" },
  { id: "multiplication", script: null,                   icon: "×",   grades: "4",   hue: "sky" },
  { id: "orderOps",       script: null,                   icon: "( )", grades: "4–5", hue: "coral" },
  { id: "divisibility",   script: null,                   icon: "÷",   grades: "5–6", hue: "sun" },
  { id: "integers",       script: null,                   icon: "−3",  grades: "6",   hue: "sky" },
  { id: "coordinates",    script: null,                   icon: "xy",  grades: "6",   hue: "leaf" },
  { id: "data",           script: null,                   icon: "📊",  grades: "5–7", hue: "berry" },
  { id: "powers",         script: null,                   icon: "a²",  grades: "7",   hue: "coral" },
  { id: "algebra",        script: null,                   icon: "ab",  grades: "7",   hue: "sun" },
  { id: "functions",      script: null,                   icon: "y=kx", grades: "7",  hue: "sky" }
];
function islandById(id) { for (var i = 0; i < ISLANDS.length; i++) if (ISLANDS[i].id === id) return ISLANDS[i]; return null; }
