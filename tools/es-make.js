'use strict';
// Shared lookup for the per-system Spanish tables (es-<system>.js):
// exact match, then "(name)" wrappers, then optional pattern rules; "left/right X" gets the side.
function make(BASE, rules = []) {
  const lc = new Map(Object.entries(BASE).map(([k, v]) => [k.toLowerCase(), v]));
  function core(n) {
    const hit = BASE[n] || lc.get(n.toLowerCase());
    if (hit) return hit;
    const m = /^\((.+)\)$/.exec(n);
    if (m) { const c = core(m[1]); return c && `(${c})`; }
    for (const [re, f] of rules) { const r = re.exec(n); if (r) { const v = f(r, core); if (v) return v; } }
    return null;
  }
  function toSpanish(name) {
    const n = name.trim();
    const whole = BASE[n] || lc.get(n.toLowerCase());
    if (whole) return whole; // names where left/right is part of the term (left colic artery)
    const m = /^(left|right)\s+(.+)$/i.exec(n);
    const c = core(m ? m[2] : n);
    if (!c) return null;
    return m ? `${c} (lado ${m[1].toLowerCase() === 'left' ? 'izquierdo' : 'derecho'})` : c;
  }
  return { toSpanish, core };
}
module.exports = { make };
