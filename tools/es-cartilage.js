'use strict';
// Spanish names for the "cartilage & discs" layer of Z-Anatomy (Terminologia Anatomica).
const { make } = require('./es-make');
const ORD = { first: 'primera', second: 'segunda', third: 'tercera', fourth: 'cuarta', fifth: 'quinta', sixth: 'sexta', seventh: 'séptima', eighth: 'octava', ninth: 'novena', tenth: 'décima', eleventh: 'undécima', twelfth: 'duodécima' };
const BASE = {
  'human body': 'Cuerpo humano', 'skeletal system': 'Sistema esquelético', 'joints and ligaments': 'Articulaciones y ligamentos', 'viscera': 'Vísceras', 'cartilage': 'Cartílago',
  'articular disc of acromioclavicular joint': 'Disco articular de la articulación acromioclavicular',
  'articular disc of distal radio-ulnar joint': 'Disco articular de la articulación radiocubital distal (fibrocartílago triangular)',
  'articular disc of sternoclavicular joint': 'Disco articular de la articulación esternoclavicular',
  'articular disc of temporomandibular joint': 'Disco articular de la articulación temporomandibular',
  'arytenoid cartilage': 'Cartílago aritenoides', 'corniculate cartilage': 'Cartílago corniculado (de Santorini)', 'cricoid cartilage': 'Cartílago cricoides',
  'thyroid cartilage': 'Cartílago tiroides', 'epiglottis': 'Epiglotis', 'nasal septal cartilage': 'Cartílago del tabique nasal',
  'lateral process of nasal septal cartilage': 'Proceso lateral del cartílago del tabique nasal (cartílago lateral de la nariz)',
  'major alar cartilage': 'Cartílago alar mayor', 'triradiate cartilage': 'Cartílago trirradiado (en Y) del acetábulo',
};
module.exports = make(BASE, [
  [/^costal cartilage of (\w+) rib$/, r => ORD[r[1]] && `Cartílago costal de la ${ORD[r[1]]} costilla`],
  [/^intervertebral disc ([CTLS]\d+)-([CTLS]\d+)$/, r => `Disco intervertebral ${r[1]}-${r[2]}`],
]);
