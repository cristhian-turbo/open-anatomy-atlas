'use strict';
// Spanish names for the skeletal system (own translation, guided by the
// Terminologia Anatomica Latin names shipped with Z-Anatomy).
const BASE = {
  'human body': 'Cuerpo humano', 'skeletal system': 'Sistema esquelético', 'bones and teeth': 'Huesos y dientes',
  'atlas (C1)': 'Atlas (C1)', 'axis (C2)': 'Axis (C2)', 'body of sternum': 'Cuerpo del esternón',
  'manubrium of sternum': 'Manubrio del esternón', 'xiphoid process': 'Apófisis xifoides',
  'calcaneus': 'Calcáneo', 'capitate bone': 'Hueso grande (capitado)', 'clavicle': 'Clavícula', 'coccyx': 'Cóccix',
  'cuboid bone': 'Cuboides', 'ethmoid bone': 'Etmoides', 'anterior cells of ethmoid bone': 'Celdillas etmoidales anteriores',
  'middle cells of ethmoid bone': 'Celdillas etmoidales medias', 'posterior cells of ethmoid bone': 'Celdillas etmoidales posteriores',
  'femur': 'Fémur', 'fibula': 'Peroné (fíbula)', 'frontal bone': 'Hueso frontal', 'sinus of frontal bone': 'Seno frontal',
  'hamate bone': 'Ganchoso (hamato)', 'hip bone': 'Coxal (hueso de la cadera)', 'humerus': 'Húmero', 'hyoid bone': 'Hioides',
  'incus': 'Yunque', 'malleus': 'Martillo', 'stapes': 'Estribo', 'inferior nasal concha bone': 'Cornete nasal inferior',
  'intermediate cuneiform bone': 'Cuneiforme intermedio', 'lateral cuneiform bone': 'Cuneiforme lateral', 'medial cuneiform bone': 'Cuneiforme medial',
  'lacrimal bone': 'Hueso lagrimal', 'lunate bone': 'Semilunar', 'mandible': 'Mandíbula', 'maxilla': 'Maxilar',
  'nasal bone': 'Hueso nasal', 'navicular bone': 'Navicular (escafoides del pie)', 'occipital bone': 'Hueso occipital',
  'palatine bone': 'Hueso palatino', 'parietal bone': 'Hueso parietal', 'patella': 'Rótula (patela)', 'pisiform bone': 'Pisiforme',
  'radius': 'Radio', 'sacrum': 'Sacro', 'scaphoid bone': 'Escafoides', 'scapula': 'Escápula (omóplato)',
  'sesamoid bones of foot': 'Huesos sesamoideos del pie', 'sphenoid bone': 'Esfenoides', 'sinus of sphenoid bone': 'Seno esfenoidal',
  'talus': 'Astrágalo (talus)', 'temporal bone': 'Hueso temporal', 'tibia': 'Tibia', 'trapezium bone': 'Trapecio',
  'trapezoid bone': 'Trapezoide', 'triquetrum bone': 'Piramidal (triquetro)', 'ulna': 'Cúbito (ulna)', 'vomer': 'Vómer',
  'zygomatic bone': 'Hueso cigomático (malar)',
};
const ORD_M = { first: 'primer', second: 'segundo', third: 'tercer', fourth: 'cuarto', fifth: 'quinto', sixth: 'sexto', seventh: 'séptimo', eighth: 'octavo', ninth: 'noveno', tenth: 'décimo', eleventh: 'undécimo', twelfth: 'duodécimo' };
const ORD_F = { first: 'primera', second: 'segunda', third: 'tercera', fourth: 'cuarta', fifth: 'quinta' };
const FINGER_H = { first: 'pulgar (1.er dedo)', second: 'índice (2.º dedo)', third: 'medio (3.er dedo)', fourth: 'anular (4.º dedo)', fifth: 'meñique (5.º dedo)' };
const TOE = { first: 'dedo gordo (1.er dedo)', second: '2.º dedo', third: '3.er dedo', fourth: '4.º dedo', fifth: '5.º dedo' };
const PH = { distal: 'distal', middle: 'media', proximal: 'proximal' };
const VERT = { C: 'cervical', T: 'torácica', L: 'lumbar' };

function core(n) {
  if (BASE[n]) return BASE[n];
  let m;
  if ((m = /^(distal|middle|proximal) phalanx of (\w+) finger of (hand|foot)$/.exec(n)))
    return `Falange ${PH[m[1]]} del ${(m[3] === 'hand' ? FINGER_H : TOE)[m[2]]} ${m[3] === 'hand' ? 'de la mano' : 'del pie'}`;
  if ((m = /^(\w+) rib$/.exec(n))) return `${cap(ORD_F[m[1]] ? ORD_F[m[1]] : ORD_F2(m[1]))} costilla`;
  if ((m = /^(\w+) (metacarpal|metatarsal) bone$/.exec(n))) return `${cap(ORD_M[m[1]])} ${m[2] === 'metacarpal' ? 'metacarpiano' : 'metatarsiano'}`;
  if ((m = /^vertebra ([CTL])(\d+)$/.exec(n))) return `Vértebra ${VERT[m[1]]} ${m[1]}${m[2]}`;
  if ((m = /^(upper|lower) (.+)$/.exec(n))) {
    const t = m[2].replace(/ tooth$/, ''), arc = m[1] === 'upper' ? 'superior' : 'inferior';
    const T = { 'canine': 'Canino', 'first molar': 'Primer molar', 'second molar': 'Segundo molar', 'first premolar': 'Primer premolar',
      'second premolar': 'Segundo premolar', 'lateral incisor': 'Incisivo lateral', 'medial incisor': 'Incisivo central (medial)' }[t];
    if (T) return `${T} ${arc}`;
  }
  return null;
}
function ORD_F2(w) { return { sixth: 'sexta', seventh: 'séptima', eighth: 'octava', ninth: 'novena', tenth: 'décima', eleventh: 'undécima', twelfth: 'duodécima' }[w]; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function toSpanish(name) {
  const n = name.trim();
  const m = /^(left|right) (.+)$/.exec(n);
  const c = core(m ? m[2] : n);
  if (!c) return null;
  return m ? `${c} (lado ${m[1] === 'left' ? 'izquierdo' : 'derecho'})` : c;
}
module.exports = { toSpanish };
