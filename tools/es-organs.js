'use strict';
// Spanish names for the "organs & viscera" layer of Z-Anatomy (own translation,
// guided by the Terminologia Anatomica Latin names shipped with the atlas).
// Uncertain renderings carry the English name too: "Español / English".
// Z-Anatomy files some cerebral arteries and dural sinuses under this layer;
// they are kept as upstream ships them.
const BASE = {
  // groups
  'human body': 'Cuerpo humano', 'viscera': 'Vísceras', 'organs and viscera': 'Órganos y vísceras',
  'cardiovascular system': 'Sistema cardiovascular', 'arteries': 'Arterias', 'veins': 'Venas',
  // heart
  'atrium': 'Aurícula (atrio)', 'ventricle': 'Ventrículo', 'coronary sinus': 'Seno coronario',
  '????????': 'Estructura sin nombre del seno coronario / unnamed (coronary sinus)',
  'anterior papillary muscle of right ventricle': 'Músculo papilar anterior del ventrículo derecho',
  'inferior papillary muscle of left ventricle': 'Músculo papilar inferior (posterior) del ventrículo izquierdo',
  'inferior papillary muscle of right ventricle': 'Músculo papilar inferior (posterior) del ventrículo derecho',
  'septal papillary muscle of right ventricle': 'Músculo papilar septal del ventrículo derecho',
  'anterior semilunar leaflet of pulmonary valve': 'Valva semilunar anterior de la válvula pulmonar',
  'semilunar leaflet of pulmonary valve': 'Valva semilunar de la válvula pulmonar',
  'inferior leaflet of right atrioventricular valve': 'Valva inferior (posterior) de la válvula tricúspide',
  'septal leaflet of right atrioventricular valve': 'Valva septal de la válvula tricúspide',
  'posterior leaflet of left atrioventricular valve': 'Valva posterior de la válvula mitral',
  'aortic arch': 'Arco (cayado) aórtico',
  // respiratory
  'trachea': 'Tráquea', 'main bronchus': 'Bronquio principal', 'pleura': 'Pleura',
  'superior lobar bronchus': 'Bronquio lobar superior', 'middle lobar bronchus': 'Bronquio lobar medio',
  'inferior lobar bronchus': 'Bronquio lobar inferior', 'intermediate bronchus': 'Bronquio intermedio',
  'superior lobe of left lung': 'Lóbulo superior del pulmón izquierdo', 'inferior lobe of left lung': 'Lóbulo inferior del pulmón izquierdo',
  'superior lobe of right lung': 'Lóbulo superior del pulmón derecho', 'middle lobe of right lung': 'Lóbulo medio del pulmón derecho',
  'inferior lobe of right lung': 'Lóbulo inferior del pulmón derecho',
  'mucosa of nasal cavity': 'Mucosa de la cavidad nasal', 'nasopharynx': 'Nasofaringe (rinofaringe)',
  'oropharynx': 'Orofaringe', 'laryngopharynx': 'Laringofaringe (hipofaringe)',
  // digestive
  'tongue': 'Lengua', 'gingiva': 'Encía', 'soft palate': 'Paladar blando', 'uvula of palate': 'Úvula',
  'parotid gland': 'Glándula parótida', 'accessory parotid gland': 'Glándula parótida accesoria', 'parotid duct': 'Conducto parotídeo (de Stenon)',
  'submandibular gland': 'Glándula submandibular', 'submandibular duct': 'Conducto submandibular (de Wharton)', 'sublingual gland': 'Glándula sublingual',
  'oesophagus': 'Esófago', 'stomach': 'Estómago', 'duodenum': 'Duodeno', 'jejunum': 'Yeyuno',
  'ascending colon': 'Colon ascendente', 'transverse colon': 'Colon transverso', 'descending colon': 'Colon descendente',
  'sigmoid colon': 'Colon sigmoide', 'vermiform appendix': 'Apéndice vermiforme', 'meso-appendix': 'Mesoapéndice',
  'mesocolon': 'Mesocolon', 'free taenia': 'Tenia libre', 'mesocolic taenia': 'Tenia mesocólica', 'omental taenia': 'Tenia omental',
  'greater omentum': 'Omento mayor (epiplón mayor)', 'lesser omentum': 'Omento menor (epiplón menor)',
  'liver': 'Hígado', 'gallbladder': 'Vesícula biliar', 'bile duct': 'Colédoco (conducto biliar)',
  'pancreas': 'Páncreas', 'pancreatic duct': 'Conducto pancreático (de Wirsung)', 'accessory pancreatic duct': 'Conducto pancreático accesorio (de Santorini)',
  'posterior segment of liver (I)': 'Segmento posterior del hígado (I, lóbulo caudado)',
  'posterior lateral segment of liver (II)': 'Segmento lateral posterior del hígado (II)',
  'anterior lateral segment of liver (III)': 'Segmento lateral anterior del hígado (III)',
  'medial segment of liver (IV)': 'Segmento medial del hígado (IV)',
  'anterior medial segment of liver (V)': 'Segmento medial anterior del hígado (V)',
  'anterior lateral segment of liver (VI)': 'Segmento lateral anterior del hígado (VI)',
  'posterior lateral segment of liver (VII)': 'Segmento lateral posterior del hígado (VII)',
  'posterior medial segment of liver (VIII)': 'Segmento medial posterior del hígado (VIII)',
  // urinary & genital
  'renal pelvis': 'Pelvis renal', 'ureter': 'Uréter', 'urinary bladder': 'Vejiga urinaria', 'urethra': 'Uretra',
  'testis': 'Testículo', 'epididymis': 'Epidídimo', 'ductus deferens': 'Conducto deferente', 'seminal gland': 'Vesícula seminal',
  'ejaculatory duct': 'Conducto eyaculador', 'prostate': 'Próstata', 'glans penis': 'Glande',
  'corpus cavernosum of penis': 'Cuerpo cavernoso del pene', 'corpus spongiosum of penis': 'Cuerpo esponjoso del pene',
  // endocrine
  'thyroid gland': 'Glándula tiroides', 'superior parathyroid gland': 'Glándula paratiroides superior',
  'inferior parathyroid gland': 'Glándula paratiroides inferior', 'suprarenal gland': 'Glándula suprarrenal',
  'pineal gland': 'Glándula pineal (epífisis)', 'adenohypophysis': 'Adenohipófisis', 'neurohypophysis': 'Neurohipófisis',
  // vessels filed under this layer upstream
  'anterior cerebral artery': 'Arteria cerebral anterior', 'posterior cerebral artery': 'Arteria cerebral posterior',
  'middle cerebral artery (M1-segment)': 'Arteria cerebral media (segmento M1)',
  'middle cerebral artery (M3 segment)': 'Arteria cerebral media (segmento M3)', 'middle cerebral artery (M3-segment)': 'Arteria cerebral media (segmento M3)',
  'insular branches of middle cerebral artery (M2)': 'Ramas insulares de la arteria cerebral media (M2)',
  'insular branches of middle cerebral artery (M2-segment)': 'Ramas insulares de la arteria cerebral media (M2)',
  'temporal branches of middle cerebral artery': 'Ramas temporales de la arteria cerebral media',
  'parietal branches of middle cerebral artery': 'Ramas parietales de la arteria cerebral media',
  'orbitofrontal branches of anterior cerebral artery': 'Ramas orbitofrontales de la arteria cerebral anterior',
  'anterior temporal branch': 'Rama temporal anterior', 'posterior temporal branch': 'Rama temporal posterior',
  'temporo-occipital branch': 'Rama temporooccipital', 'branch to angular gyrus': 'Rama del giro angular',
  'proximal lateral striate branches': 'Ramas estriadas laterales proximales / proximal lateral striate branches',
  'distal lateral striate branches': 'Ramas estriadas laterales distales / distal lateral striate branches',
  'anterior inferior cerebellar artery': 'Arteria cerebelosa anteroinferior', 'posterior inferior cerebellar artery': 'Arteria cerebelosa posteroinferior',
  'superior cerebellar artery': 'Arteria cerebelosa superior', 'central retinal artery': 'Arteria central de la retina',
  'basilar artery': 'Arteria basilar', 'vertebral artery': 'Arteria vertebral', 'ophthalmic artery': 'Arteria oftálmica',
  'internal carotid artery': 'Arteria carótida interna', 'external carotid artery': 'Arteria carótida externa',
  'common carotid artery': 'Arteria carótida común', 'maxillary artery': 'Arteria maxilar', 'artery of pterygoid canal': 'Arteria del conducto pterigoideo (vidiana)',
  '?x': 'Estructura sin nombre (arteria del conducto pterigoideo) / unnamed',
  'subclavian artery': 'Arteria subclavia', 'axillary artery': 'Arteria axilar', 'brachial artery': 'Arteria braquial',
  'radial artery': 'Arteria radial', 'ulnar artery': 'Arteria cubital (ulnar)', 'deep palmar arch': 'Arco palmar profundo',
  'superficial palmar arch': 'Arco palmar superficial', 'dorsal carpal anastomosis': 'Red carpiana dorsal / dorsal carpal anastomosis',
  'femoral artery': 'Arteria femoral', 'popliteal artery': 'Arteria poplítea', 'posterior tibial artery': 'Arteria tibial posterior',
  'lateral plantar artery': 'Arteria plantar lateral', 'plantar arch': 'Arco plantar', 'patellar anastomosis': 'Red rotuliana (anastomosis patelar)',
  'cavernous sinus': 'Seno cavernoso', 'anterior intercavernous sinus': 'Seno intercavernoso anterior',
  'posterior intercavernous sinus': 'Seno intercavernoso posterior', 'superior petrosal sinus': 'Seno petroso superior',
  'inferior petrosal sinus': 'Seno petroso inferior', 'occipital sinus': 'Seno occipital', 'straight sinus': 'Seno recto',
  'sigmoid sinus': 'Seno sigmoideo', 'transverse sinus': 'Seno transverso', 'basilar venous plexus': 'Plexo venoso basilar',
};
const LOBE = { left: 'del pulmón izquierdo', right: 'del pulmón derecho' };
const SEG = { apical: 'apical', posterior: 'posterior', anterior: 'anterior', lateral: 'lateral', medial: 'medial', superior: 'superior',
  apicoposterior: 'apicoposterior', 'superior lingular': 'lingular superior', 'inferior lingular': 'lingular inferior',
  'anterior basal': 'basal anterior', 'medial basal': 'basal medial', 'lateral basal': 'basal lateral', 'posterior basal': 'basal posterior',
  'anteromedial basal': 'basal anteromedial' };
function core(n) {
  if (BASE[n]) return BASE[n];
  let m;
  if ((m = /^\((.+)\)$/.exec(n))) { const c = core(m[1].charAt(0).toLowerCase() + m[1].slice(1)); return c && `(${c})`; }
  if ((m = /^(.+) segmental bronchus of (left|right) lung(?: \(([BIVX+]+)\))?$/.exec(n)) && SEG[m[1]])
    return `Bronquio segmentario ${SEG[m[1]]} ${LOBE[m[2]]}${m[3] ? ` (${m[3]})` : ''}`;
  return null;
}
function toSpanish(name) {
  const n = name.trim();
  const m = /^(left|right) (.+)$/.exec(n);
  const c = core(m ? m[2] : n);
  if (!c) return null;
  return m ? `${c} (lado ${m[1] === 'left' ? 'izquierdo' : 'derecho'})` : c;
}
module.exports = { toSpanish };
