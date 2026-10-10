// Spanish names for anatomical structures, one table per body system
// (own translation, guided by the Terminologia Anatomica Latin names shipped with Z-Anatomy).
// Loaded by i18n.js: OAA_NAMES.es(name) returns the Spanish name or null.
(function () {
  'use strict';
  const modules = {};
  const require = (p) => modules[p.replace('./', '')];
  const define = (id, fn) => { const module = { exports: {} }; fn(module, require); modules[id] = module.exports; };

  define('es-make', (module, require) => {
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
  });

  define('es-bones', (module, require) => {
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
  });

  define('es-muscles', (module, require) => {
    // Spanish names for the "muscles" layer of Z-Anatomy (own translation, guided by
    // Terminologia Anatomica). Includes the bursae, tendon sheaths, retinacula and
    // fasciae that Z-Anatomy files under this layer.
    // Uncertain renderings carry the English name too: "Español / English".
    const BASE = {
      // groups
      'human body': 'Cuerpo humano', 'muscular system': 'Sistema muscular', 'muscles and tendons': 'Músculos y tendones', 'fasciae': 'Fascias',
      // head & face
      'frontalis muscle': 'Músculo frontal', 'occipitalis muscle': 'Músculo occipital', 'epicranial aponeurosis': 'Aponeurosis epicraneal (galea aponeurótica)',
      'temporoparietalis muscle': 'Músculo temporoparietal', 'procerus muscle': 'Músculo prócer (piramidal de la nariz)', 'nasalis muscle': 'Músculo nasal',
      'depressor septi nasi': 'Músculo depresor del tabique nasal', 'levator nasolabialis': 'Músculo elevador del labio superior y del ala de la nariz',
      'levator labii superioris': 'Músculo elevador del labio superior', 'levator anguli oris': 'Músculo elevador del ángulo de la boca',
      'zygomaticus major muscle': 'Músculo cigomático mayor', 'zygomaticus minor muscle': 'Músculo cigomático menor', 'risorius muscle': 'Músculo risorio',
      'depressor anguli oris': 'Músculo depresor del ángulo de la boca', 'depressor labii inferioris': 'Músculo depresor del labio inferior',
      'mentalis muscle': 'Músculo mentoniano (borla del mentón)', 'orbicularis oris muscle': 'Músculo orbicular de la boca', 'bucinator': 'Músculo buccinador',
      'corrugator supercilii': 'Músculo corrugador de la ceja', 'orbital part of orbicularis oculi': 'Porción orbitaria del músculo orbicular del ojo',
      'palpebral part of orbicularis oculi': 'Porción palpebral del músculo orbicular del ojo', 'platysma': 'Platisma (cutáneo del cuello)',
      'temporalis muscle': 'Músculo temporal', 'superficial part of masseter': 'Porción superficial del músculo masetero', 'deep part of masseter': 'Porción profunda del músculo masetero',
      'medial pterygoid muscle': 'Músculo pterigoideo medial', 'superior head of lateral pterygoid muscle': 'Cabeza superior del músculo pterigoideo lateral',
      'inferior head of lateral pterygoid muscle': 'Cabeza inferior del músculo pterigoideo lateral',
      // eye
      'levator palpebrae superioris': 'Músculo elevador del párpado superior', 'superior rectus muscle': 'Músculo recto superior', 'inferior rectus muscle': 'Músculo recto inferior',
      'medial rectus muscle': 'Músculo recto medial', 'lateral rectus muscle': 'Músculo recto lateral', 'superior oblique muscle': 'Músculo oblicuo superior',
      'inferior oblique muscle': 'Músculo oblicuo inferior', 'trochlea of superior oblique muscle': 'Tróclea del músculo oblicuo superior',
      'common tendinous ring': 'Anillo tendinoso común (de Zinn)', 'superior tarsus': 'Tarso superior', 'inferior tarsus': 'Tarso inferior',
      // tongue, pharynx, larynx
      'genioglossus muscle': 'Músculo geniogloso', 'hyoglossus muscle': 'Músculo hiogloso', 'palatopharyngeus muscle': 'Músculo palatofaríngeo',
      'stylopharyngeus muscle': 'Músculo estilofaríngeo', 'superior pharyngeal constrictor': 'Músculo constrictor superior de la faringe',
      'middle pharyngeal constrictor': 'Músculo constrictor medio de la faringe', 'inferior pharyngeal constrictor': 'Músculo constrictor inferior de la faringe',
      'oblique part of cricothyroid muscle': 'Porción oblicua del músculo cricotiroideo', 'straight part of cricothyroid muscle': 'Porción recta del músculo cricotiroideo',
      'posterior crico-arytenoid muscle': 'Músculo cricoaritenoideo posterior', 'lateral crico-arytenoid muscle': 'Músculo cricoaritenoideo lateral',
      'transverse arytenoid muscle': 'Músculo aritenoideo transverso', 'ary-epiglottic part of oblique arytenoid muscle': 'Porción ariepiglótica del músculo aritenoideo oblicuo',
      'external part of thyro-arytenoid muscle': 'Porción externa del músculo tiroaritenoideo', 'thyro-epiglottic part of thyro-arytenoid muscle': 'Porción tiroepiglótica del músculo tiroaritenoideo',
      // neck
      'sternocleidomastoid muscle': 'Músculo esternocleidomastoideo', 'anterior belly of digastric muscle': 'Vientre anterior del músculo digástrico',
      'posterior belly of digastric muscle': 'Vientre posterior del músculo digástrico', 'intermediate tendon of digastric muscle': 'Tendón intermedio del músculo digástrico',
      'mylohyoid muscle': 'Músculo milohioideo', 'geniohyoid muscle': 'Músculo genihioideo', 'stylohyoid muscle': 'Músculo estilohioideo',
      'omohyoid muscle': 'Músculo omohioideo', 'sternohyoid muscle': 'Músculo esternohioideo', 'sternothyroid muscle': 'Músculo esternotiroideo', 'thyrohyoid muscle': 'Músculo tirohioideo',
      'scalenus anterior muscle': 'Músculo escaleno anterior', 'scalenus medius muscle': 'Músculo escaleno medio', 'scalenus posterior muscle': 'Músculo escaleno posterior',
      'longus capitis muscle': 'Músculo largo de la cabeza', 'longus colli muscle': 'Músculo largo del cuello',
      'rectus anterior capitis muscle': 'Músculo recto anterior de la cabeza', 'rectus lateralis capitis muscle': 'Músculo recto lateral de la cabeza',
      'rectus posterior major capitis muscle': 'Músculo recto posterior mayor de la cabeza', 'rectus posterior minor capitis muscle': 'Músculo recto posterior menor de la cabeza',
      'obliquus superior capitis muscle': 'Músculo oblicuo superior de la cabeza', 'obliquus inferior capitis muscle': 'Músculo oblicuo inferior de la cabeza',
      'splenius capitis muscle': 'Músculo esplenio de la cabeza', 'splenius colli muscle': 'Músculo esplenio del cuello',
      // back
      'descending part of trapezius muscle': 'Porción descendente del músculo trapecio', 'transverse part of trapezius muscle': 'Porción transversa del músculo trapecio',
      'ascending part of trapezius muscle': 'Porción ascendente del músculo trapecio', 'latissimus dorsi muscle': 'Músculo dorsal ancho',
      'levator scapulae': 'Músculo elevador de la escápula', 'rhomboid major muscle': 'Músculo romboides mayor', 'rhomboid minor muscle': 'Músculo romboides menor',
      'serratus posterior superior muscle': 'Músculo serrato posterior superior', 'serratus posterior inferior muscle': 'Músculo serrato posterior inferior',
      'iliocostalis colli muscle': 'Músculo iliocostal del cuello', 'iliocostalis thoracis muscle': 'Músculo iliocostal torácico', 'iliocostalis lumborum muscle': 'Músculo iliocostal lumbar',
      'longissimus capitis muscle': 'Músculo longísimo de la cabeza', 'longissimus colli muscle': 'Músculo longísimo del cuello', 'longissimus thoracis muscle': 'Músculo longísimo torácico',
      'spinalis capitis muscle': 'Músculo espinoso de la cabeza', 'spinalis colli muscle': 'Músculo espinoso del cuello', 'spinalis thoracis muscle': 'Músculo espinoso torácico',
      'semispinalis colli muscle': 'Músculo semiespinoso del cuello', 'semispinalis thoracis muscle': 'Músculo semiespinoso torácico',
      'multifidus colli muscle': 'Músculo multífido del cuello', 'multifidus thoracis muscle': 'Músculo multífido torácico', 'multifidus lumborum muscle': 'Músculo multífido lumbar',
      'rotatores': 'Músculos rotadores', 'interspinales colli muscles': 'Músculos interespinosos del cuello', 'interspinales thoracis muscles': 'Músculos interespinosos torácicos',
      'interspinales lumborum muscles': 'Músculos interespinosos lumbares',
      'dorsal parts of lateral intertransversarii lumborum muscles': 'Porciones dorsales de los músculos intertransversos laterales lumbares',
      'ventral parts of lateral intertransversarii lumborum muscles': 'Porciones ventrales de los músculos intertransversos laterales lumbares',
      'levatores breves costarum': 'Músculos elevadores cortos de las costillas', 'levatores longi costarum': 'Músculos elevadores largos de las costillas',
      'quadratus lumborum muscle': 'Músculo cuadrado lumbar',
      // thorax
      'clavicular head of pectoralis major muscle': 'Cabeza clavicular del músculo pectoral mayor', 'sternocostal head of pectoralis major muscle': 'Cabeza esternocostal del músculo pectoral mayor',
      'Abdominal part of pectoralis major muscle': 'Porción abdominal del músculo pectoral mayor', 'abdominal part of pectoralis major muscle': 'Porción abdominal del músculo pectoral mayor',
      'pectoralis minor muscle': 'Músculo pectoral menor', 'subclavius muscle': 'Músculo subclavio', 'serratus anterior muscle': 'Músculo serrato anterior',
      'external intercostal muscles': 'Músculos intercostales externos', 'internal intercostal muscles': 'Músculos intercostales internos',
      'innermost intercostal muscles': 'Músculos intercostales íntimos', 'transversus thoracis muscle': 'Músculo transverso del tórax', 'diaphragm': 'Diafragma',
      // abdomen & pelvis
      'rectus abdominis muscle': 'Músculo recto del abdomen', 'pyramidalis muscle': 'Músculo piramidal del abdomen', 'external abdominal oblique muscle': 'Músculo oblicuo externo del abdomen',
      'internal abdominal oblique muscle': 'Músculo oblicuo interno del abdomen', 'transversus abdominis muscle': 'Músculo transverso del abdomen', 'linea alba': 'Línea alba',
      'psoas major': 'Músculo psoas mayor', 'iliacus muscle': 'Músculo ilíaco', 'iliopectineal arch': 'Arco iliopectíneo',
      'coccygeus muscle': 'Músculo coccígeo (isquiococcígeo)', 'iliococcygeus muscle': 'Músculo iliococcígeo', 'pubococcygeus muscle': 'Músculo pubococcígeo',
      'pubo-analis muscle': 'Músculo puboanal', 'tendinous arch of levator ani': 'Arco tendinoso del músculo elevador del ano', 'external anal sphincter': 'Músculo esfínter externo del ano',
      // shoulder & arm
      'clavicular part of deltoid muscle': 'Porción clavicular del músculo deltoides', 'acromial part of deltoid muscle': 'Porción acromial del músculo deltoides',
      'scapular spinal part of deltoid muscle': 'Porción espinal (escapular) del músculo deltoides', 'supraspinatus muscle': 'Músculo supraespinoso',
      'infraspinatus muscle': 'Músculo infraespinoso', 'teres minor muscle': 'Músculo redondo menor', 'teres major muscle': 'Músculo redondo mayor',
      'subscapularis muscle': 'Músculo subescapular', 'coracobrachialis muscle': 'Músculo coracobraquial', 'long head of biceps brachii': 'Cabeza larga del músculo bíceps braquial',
      'short head of biceps brachii': 'Cabeza corta del músculo bíceps braquial', 'brachialis muscle': 'Músculo braquial',
      'long head of triceps brachii': 'Cabeza larga del músculo tríceps braquial', 'lateral head of triceps brachii': 'Cabeza lateral del músculo tríceps braquial',
      'medial head of triceps brachii': 'Cabeza medial del músculo tríceps braquial', 'anconeus muscle': 'Músculo ancóneo',
      'medial intermuscular septum of arm': 'Tabique intermuscular medial del brazo', 'lateral intermuscular septum of arm': 'Tabique intermuscular lateral del brazo',
      // forearm
      'superficial head of pronator teres': 'Cabeza humeral (superficial) del músculo pronador redondo', 'deep head of pronator teres': 'Cabeza cubital (profunda) del músculo pronador redondo',
      'flexor carpi radialis': 'Músculo flexor radial del carpo', 'palmaris longus muscle': 'Músculo palmar largo',
      'humeral head of flexor carpi ulnaris': 'Cabeza humeral del músculo flexor cubital del carpo', 'ulnar head of flexor carpi ulnaris': 'Cabeza cubital del músculo flexor cubital del carpo',
      'humero-ulnar head of flexor digitorum superficialis': 'Cabeza humerocubital del músculo flexor superficial de los dedos',
      'radial head of flexor digitorum superficialis': 'Cabeza radial del músculo flexor superficial de los dedos',
      'flexor digitorum profundus': 'Músculo flexor profundo de los dedos', 'flexor pollicis longus': 'Músculo flexor largo del pulgar', 'pronator quadratus': 'Músculo pronador cuadrado',
      'brachioradialis muscle': 'Músculo braquiorradial (supinador largo)', 'extensor carpi radialis longus': 'Músculo extensor radial largo del carpo',
      'extensor carpi radialis brevis': 'Músculo extensor radial corto del carpo', 'extensor digitorum': 'Músculo extensor de los dedos',
      'extensor digiti minimi': 'Músculo extensor del meñique', 'humeral head of extensor carpi ulnaris': 'Cabeza humeral del músculo extensor cubital del carpo',
      'ulnar head of extensor carpi ulnaris': 'Cabeza cubital del músculo extensor cubital del carpo', 'supinator': 'Músculo supinador',
      'abductor pollicis longus': 'Músculo abductor largo del pulgar', 'extensor pollicis brevis': 'Músculo extensor corto del pulgar',
      'extensor pollicis longus': 'Músculo extensor largo del pulgar', 'extensor indicis': 'Músculo extensor del índice',
      'antebrachial fascia': 'Fascia antebraquial', 'flexor retinaculum of wrist': 'Retináculo de los flexores de la muñeca', 'extensor retinaculum of wrist': 'Retináculo de los extensores de la muñeca',
      // hand
      'abductor pollicis brevis': 'Músculo abductor corto del pulgar', 'superficial head of flexor pollicis brevis': 'Cabeza superficial del músculo flexor corto del pulgar',
      'deep head of flexor pollicis brevis': 'Cabeza profunda del músculo flexor corto del pulgar', 'opponens pollicis muscle': 'Músculo oponente del pulgar',
      'oblique head of adductor pollicis': 'Cabeza oblicua del músculo aductor del pulgar', 'transverse head of adductor pollicis': 'Cabeza transversa del músculo aductor del pulgar',
      'abductor digiti minimi of hand': 'Músculo abductor del meñique de la mano', 'flexor digiti minimi of hand': 'Músculo flexor corto del meñique de la mano',
      'opponens digiti minimi muscle of hand': 'Músculo oponente del meñique de la mano', 'lumbrical muscles of hand': 'Músculos lumbricales de la mano',
      'dorsal interossei muscles of hand': 'Músculos interóseos dorsales de la mano', 'palmar interossei muscles': 'Músculos interóseos palmares',
      'palmar aponeurosis': 'Aponeurosis palmar', 'synovial sheaths of digits of hand': 'Vainas sinoviales de los dedos de la mano',
      'cruciform part of fibrous sheath of digit of hand': 'Porción cruciforme de la vaina fibrosa de los dedos de la mano',
      'common flexor tendon sheath': 'Vaina común de los tendones flexores',
      'tendon sheath - abd. pollicis longus - ext. pollicis brevis': 'Vaina tendinosa del abductor largo y del extensor corto del pulgar',
      'tendon sheath of extensors carpi radialis': 'Vaina tendinosa de los extensores radiales del carpo',
      'tendon sheath of extensor digitorum and extensor indicis': 'Vaina tendinosa del extensor de los dedos y del extensor del índice',
      // hip & thigh
      'gluteus maximus muscle': 'Músculo glúteo mayor', 'gluteus medius muscle': 'Músculo glúteo medio', 'gluteus minimus muscle': 'Músculo glúteo menor',
      'tensor fasciae latae': 'Músculo tensor de la fascia lata', 'piriformis muscle': 'Músculo piriforme', 'superior gemellus muscle': 'Músculo gemelo superior',
      'inferior gemellus muscle': 'Músculo gemelo inferior', 'obturator internus': 'Músculo obturador interno', 'obturator externus': 'Músculo obturador externo',
      'quadratus femoris muscle': 'Músculo cuadrado femoral', 'iliotibial tract': 'Tracto (cintilla) iliotibial', 'sartorius muscle': 'Músculo sartorio',
      'rectus femoris muscle': 'Músculo recto femoral', 'vastus lateralis muscle': 'Músculo vasto lateral', 'vastus medialis muscle': 'Músculo vasto medial',
      'vastus intermedius muscle': 'Músculo vasto intermedio', 'pectineus muscle': 'Músculo pectíneo', 'adductor longus': 'Músculo aductor largo',
      'adductor brevis': 'Músculo aductor corto', 'adductor magnus': 'Músculo aductor mayor', 'adductor minimus': 'Músculo aductor mínimo', 'Adductor minimus': 'Músculo aductor mínimo',
      'gracilis muscle': 'Músculo grácil (recto interno)', 'long head of biceps femoris': 'Cabeza larga del músculo bíceps femoral',
      'short head of biceps femoris': 'Cabeza corta del músculo bíceps femoral', 'semitendinosus muscle': 'Músculo semitendinoso', 'semimembranosus muscle': 'Músculo semimembranoso',
      'lateral femoral intermuscular septum': 'Tabique intermuscular femoral lateral', 'medial femoral intermuscular septum': 'Tabique intermuscular femoral medial',
      'lateral patellar retinaculum': 'Retináculo rotuliano lateral', 'medial patellar retinaculum': 'Retináculo rotuliano medial',
      // leg
      'tibialis anterior muscle': 'Músculo tibial anterior', 'extensor digitorum longus': 'Músculo extensor largo de los dedos', 'extensor hallucis longus': 'Músculo extensor largo del dedo gordo',
      'fibularis tertius muscle': 'Músculo peroneo (fibular) tercero', 'fibularis longus muscle': 'Músculo peroneo (fibular) largo', 'fibularis brevis muscle': 'Músculo peroneo (fibular) corto',
      'lateral head of gastrocnemius': 'Cabeza lateral del músculo gastrocnemio (gemelo externo)', 'medial head of gastrocnemius': 'Cabeza medial del músculo gastrocnemio (gemelo interno)',
      'soleus muscle': 'Músculo sóleo', 'plantaris muscle': 'Músculo plantar', 'calcaneal tendon': 'Tendón calcáneo (de Aquiles)', 'popliteus muscle': 'Músculo poplíteo',
      'tibialis posterior muscle': 'Músculo tibial posterior', 'flexor digitorum longus': 'Músculo flexor largo de los dedos', 'flexor hallucis longus': 'Músculo flexor largo del dedo gordo',
      'anterior intermuscular septum of leg': 'Tabique intermuscular anterior de la pierna', 'posterior intermuscular septum of leg': 'Tabique intermuscular posterior de la pierna',
      'transverse intermuscular septum of leg': 'Tabique intermuscular transverso de la pierna', 'tendon of extensor digitorum longus': 'Tendón del músculo extensor largo de los dedos',
      'superior extensor retinaculum of ankle': 'Retináculo superior de los extensores del tobillo', 'inferior extensor retinaculum of ankle': 'Retináculo inferior de los extensores del tobillo',
      'flexor retinaculum of ankle': 'Retináculo de los flexores del tobillo', 'superior fibular retinaculum': 'Retináculo superior de los peroneos', 'inferior fibular retinaculum': 'Retináculo inferior de los peroneos',
      'tendon sheath of tibialis anterior': 'Vaina tendinosa del tibial anterior', 'tendon sheath of tibialis posterior muscle': 'Vaina tendinosa del tibial posterior',
      'tendon sheath of extensor digitorum longus': 'Vaina tendinosa del extensor largo de los dedos', 'tendon sheath of flexor digitorum longus': 'Vaina tendinosa del flexor largo de los dedos',
      'tendon sheath of flexor hallucis longus': 'Vaina tendinosa del flexor largo del dedo gordo', 'common tendon sheath of fibularis muscles': 'Vaina tendinosa común de los peroneos',
      'plantar tendon sheath of fibularis longus muscle': 'Vaina tendinosa plantar del peroneo largo',
      // foot
      'extensor digitorum brevis': 'Músculo extensor corto de los dedos', 'extensor hallucis brevis': 'Músculo extensor corto del dedo gordo',
      'abductor hallucis': 'Músculo abductor del dedo gordo', 'medial head of flexor hallucis brevis': 'Cabeza medial del músculo flexor corto del dedo gordo',
      'lateral head of flexor hallucis brevis': 'Cabeza lateral del músculo flexor corto del dedo gordo', 'oblique head of adductor hallucis': 'Cabeza oblicua del músculo aductor del dedo gordo',
      'transverse head of adductor hallucis': 'Cabeza transversa del músculo aductor del dedo gordo', 'flexor digitorum brevis': 'Músculo flexor corto de los dedos',
      'quadratus plantae muscle': 'Músculo cuadrado plantar', 'abductor digiti minimi of foot': 'Músculo abductor del quinto dedo del pie',
      'flexor digiti minimi of foot': 'Músculo flexor corto del quinto dedo del pie', 'opponens digiti minimi muscle of foot': 'Músculo oponente del quinto dedo del pie',
      'Opponens digiti minimi muscle of foot': 'Músculo oponente del quinto dedo del pie', 'lumbrical muscles of foot': 'Músculos lumbricales del pie',
      'dorsal interossei muscles of foot': 'Músculos interóseos dorsales del pie', 'plantar interossei muscles': 'Músculos interóseos plantares', 'plantar aponeurosis': 'Aponeurosis plantar',
      // bursae
      'subacromial bursa': 'Bolsa subacromial', 'subdeltoid bursa': 'Bolsa subdeltoidea', 'subcutaneous acromial bursa': 'Bolsa subcutánea acromial',
      'coracobrachial bursa': 'Bolsa coracobraquial', 'bicipitoradial bursa': 'Bolsa bicipitorradial', 'subtendinous bursa of trapezius muscle': 'Bolsa subtendinosa del trapecio',
      'subtendinous bursa of infraspinatus muscle': 'Bolsa subtendinosa del infraespinoso', 'subtendinous bursa of teres major muscle': 'Bolsa subtendinosa del redondo mayor',
      'subtendinous bursa of triceps brachii muscle': 'Bolsa subtendinosa del tríceps braquial', 'subtendinous bursa of iliacus muscle': 'Bolsa subtendinosa del ilíaco',
      'Iliopectineal bursa': 'Bolsa iliopectínea', 'iliopectineal bursa': 'Bolsa iliopectínea', 'intermuscular gluteal bursae': 'Bolsas intermusculares glúteas',
      'subcutaneous trochanteric bursa': 'Bolsa subcutánea trocantérea', 'trochanteric bursa of gluteus maximus muscle': 'Bolsa trocantérea del glúteo mayor',
      'trochanteric bursa of gluteus medius muscle': 'Bolsa trocantérea del glúteo medio', 'trochanteric bursa of gluteus minimus muscle': 'Bolsa trocantérea del glúteo menor',
      'sciatic bursa of gluteus maximus muscle': 'Bolsa isquiática del glúteo mayor', 'sciatic bursa of obturator internus': 'Bolsa isquiática del obturador interno',
      'subtendinous bursa of obturator internus': 'Bolsa subtendinosa del obturador interno', 'bursa of piriformis muscle': 'Bolsa del músculo piriforme',
      'superior bursa of biceps femoris muscle': 'Bolsa superior del bíceps femoral', 'inferior subtendinous bursa of biceps femoris muscle': 'Bolsa subtendinosa inferior del bíceps femoral',
      'semimembranosus bursa': 'Bolsa del semimembranoso', 'anserine bursa': 'Bolsa anserina (de la pata de ganso)', 'subtendinous bursa of sartorius muscle': 'Bolsa subtendinosa del sartorio',
      'suprapatellar bursa': 'Bolsa suprarrotuliana', 'subcutaneous prepatellar bursa': 'Bolsa prerrotuliana subcutánea', 'subfacial prepatellar bursa': 'Bolsa prerrotuliana subfascial',
      'subtendinous prepatellar bursa': 'Bolsa prerrotuliana subtendinosa', 'subcutaneous infrapatellar bursa': 'Bolsa infrarrotuliana subcutánea',
      'deep infrapatellar bursa': 'Bolsa infrarrotuliana profunda', 'subcutaneous bursa of tuberosity of tibia': 'Bolsa subcutánea de la tuberosidad tibial',
      'lateral subtendinous bursa of gastrocnemius muscle': 'Bolsa subtendinosa lateral del gastrocnemio', 'medial subtendinous bursa of gastrocnemius muscle': 'Bolsa subtendinosa medial del gastrocnemio',
      'subtendinous bursa of tibialis anterior': 'Bolsa subtendinosa del tibial anterior', 'subcutaneous bursa of lateral malleolus': 'Bolsa subcutánea del maléolo lateral',
      'subcutaneous bursa of medial malleolus': 'Bolsa subcutánea del maléolo medial', 'subcutaneous calcaneal bursa': 'Bolsa subcutánea calcánea', 'subtendinous calcaneal bursa': 'Bolsa subtendinosa calcánea (retrocalcánea)',
    };
    function core(n) {
      if (BASE[n]) return BASE[n];
      const m = /^\((.+)\)$/.exec(n);
      if (m) { const c = core(m[1]) || core(m[1].charAt(0).toLowerCase() + m[1].slice(1)); return c && `(${c})`; }
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
  });

  define('es-organs', (module, require) => {
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
  });

  define('es-arteries', (module, require) => {
    // Spanish names for the arteries layer of Z-Anatomy (Terminologia Anatomica).
    const { make } = require('./es-make');
    const A = {
      'abdominal aorta': 'Aorta abdominal', 'angular artery': 'Arteria angular', 'anterior cerebral artery': 'Arteria cerebral anterior',
      'anterior circumflex humeral artery': 'Arteria circunfleja humeral anterior', 'anterior communicating artery': 'Arteria comunicante anterior',
      'anterior deep temporal artery': 'Arteria temporal profunda anterior', 'anterior ethmoidal artery': 'Arteria etmoidal anterior',
      'anterior inferior pancreaticoduodenal artery': 'Arteria pancreaticoduodenal inferior anterior', 'anterior interventricular artery': 'Arteria interventricular anterior (descendente anterior)',
      'anterior spinal artery': 'Arteria espinal anterior', 'anterior tibial artery': 'Arteria tibial anterior', 'aortic arch': 'Arco (cayado) de la aorta', 'appendicular artery': 'Arteria apendicular',
      'arcuate artery': 'Arteria arqueada', 'artery of central sulcus': 'Arteria del surco central (rolándica)', 'artery of precentral sulcus': 'Arteria del surco precentral (prerrolándica)',
      'artery of pterygoid canal': 'Arteria del conducto pterigoideo (vidiana)', 'ascending aorta': 'Aorta ascendente', 'ascending pharyngeal artery': 'Arteria faríngea ascendente',
      'axillary artery': 'Arteria axilar', 'basilar artery': 'Arteria basilar', 'bifurcation of pulmonary trunk': 'Bifurcación del tronco pulmonar', 'brachial artery': 'Arteria braquial (humeral)',
      'brachiocephalic trunk': 'Tronco braquiocefálico', 'buccal artery': 'Arteria bucal', 'callosomarginal artery': 'Arteria callosomarginal', 'circumflex artery of heart': 'Arteria circunfleja (rama circunfleja de la coronaria izquierda)',
      'circumflex scapular artery': 'Arteria circunfleja escapular', 'coeliac trunk': 'Tronco celíaco', 'colic artery': 'Arteria cólica', 'common carotid artery': 'Arteria carótida común (primitiva)',
      'common hepatic artery': 'Arteria hepática común', 'common iliac artery': 'Arteria ilíaca común (primitiva)', 'common interosseous artery': 'Arteria interósea común',
      'common palmar digital arteries': 'Arterias digitales palmares comunes', 'common plantar digital arteries': 'Arterias digitales plantares comunes', 'coronary artery': 'Arteria coronaria',
      'coronary leaflet': 'Valva coronaria (de la válvula aórtica)', 'non-coronary leaflet': 'Valva no coronaria (de la válvula aórtica)', 'coronary sinus': 'Seno coronario',
      'costocervical trunk': 'Tronco costocervical', 'deep artery of penis': 'Arteria profunda del pene', 'deep brachial artery': 'Arteria braquial profunda (humeral profunda)',
      'deep cervical artery': 'Arteria cervical profunda', 'deep external pudendal artery': 'Arteria pudenda externa profunda', 'deep femoral artery': 'Arteria femoral profunda',
      'deep palmar arch': 'Arco palmar profundo', 'deep plantar artery': 'Arteria plantar profunda', 'descending palatine artery': 'Arteria palatina descendente', 'dorsal artery of penis': 'Arteria dorsal del pene',
      'dorsal carpal anastomosis': 'Red (anastomosis) carpiana dorsal', 'dorsal digital arteries of foot': 'Arterias digitales dorsales del pie', 'dorsal digital arteries of hand': 'Arterias digitales dorsales de la mano',
      'dorsal metacarpal arteries': 'Arterias metacarpianas dorsales', 'dorsal metatarsal arteries': 'Arterias metatarsianas dorsales', 'dorsalis pedis artery': 'Arteria dorsal del pie (pedia)',
      'external carotid artery': 'Arteria carótida externa', 'external iliac artery': 'Arteria ilíaca externa', 'facial artery': 'Arteria facial', 'femoral artery': 'Arteria femoral',
      'fibular artery': 'Arteria peronea (fibular)', 'first posterior intercostal artery': 'Primera arteria intercostal posterior', 'second posterior intercostal artery': 'Segunda arteria intercostal posterior',
      'gastric artery': 'Arteria gástrica', 'gastroduodenal artery': 'Arteria gastroduodenal', 'greater palatine artery': 'Arteria palatina mayor', 'ileocolic artery': 'Arteria ileocólica',
      'iliolumbar artery': 'Arteria iliolumbar', 'inferior alveolar artery': 'Arteria alveolar inferior', 'inferior epigastric artery': 'Arteria epigástrica inferior', 'inferior gluteal artery': 'Arteria glútea inferior',
      'inferior labial artery': 'Arteria labial inferior', 'inferior lateral genicular artery': 'Arteria genicular inferior lateral', 'inferior medial genicular artery': 'Arteria genicular inferior medial',
      'inferior mesenteric artery': 'Arteria mesentérica inferior', 'inferior pancreaticoduodenal artery': 'Arteria pancreaticoduodenal inferior', 'inferior phrenic artery': 'Arteria frénica inferior',
      'inferior suprarenal artery': 'Arteria suprarrenal inferior', 'inferior thyroid artery': 'Arteria tiroidea inferior', 'inferior ulnar collateral artery': 'Arteria colateral cubital inferior',
      'infra-orbital artery': 'Arteria infraorbitaria', 'internal carotid artery': 'Arteria carótida interna', 'internal iliac artery': 'Arteria ilíaca interna', 'internal pudendal artery': 'Arteria pudenda interna',
      'internal thoracic artery': 'Arteria torácica interna (mamaria interna)', 'intrarenal arteries of left kidney': 'Arterias intrarrenales del riñón izquierdo', 'intrarenal arteries of right kidney': 'Arterias intrarrenales del riñón derecho',
      'lacrimal artery': 'Arteria lagrimal', 'lateral circumflex femoral artery': 'Arteria circunfleja femoral lateral', 'lateral frontobasal artery': 'Arteria frontobasal lateral (orbitofrontal lateral)',
      'lateral occipital artery': 'Arteria occipital lateral', 'lateral plantar artery': 'Arteria plantar lateral', 'lateral tarsal artery': 'Arteria tarsiana lateral', 'lateral thoracic artery': 'Arteria torácica lateral',
      'long posterior ciliary arteries': 'Arterias ciliares posteriores largas', 'short posterior ciliary arteries': 'Arterias ciliares posteriores cortas', 'lumbar arteries': 'Arterias lumbares',
      'marginal artery': 'Arteria marginal (del colon, de Drummond)', 'maxillary artery': 'Arteria maxilar', 'medial circumflex femoral artery': 'Arteria circunfleja femoral medial',
      'medial occipital artery': 'Arteria occipital medial', 'medial plantar artery': 'Arteria plantar medial', 'median sacral artery': 'Arteria sacra media', 'middle colic artery': 'Arteria cólica media',
      'middle collateral artery': 'Arteria colateral media', 'middle genicular artery': 'Arteria genicular media', 'middle meningeal artery': 'Arteria meníngea media', 'musculophrenic artery': 'Arteria musculofrénica',
      'obturator artery': 'Arteria obturatriz', 'occipital artery': 'Arteria occipital', 'ophthalmic artery': 'Arteria oftálmica', 'palmar metacarpal arteries': 'Arterias metacarpianas palmares',
      'parieto-occipital artery': 'Arteria parietooccipital', 'perforating femoral arteries': 'Arterias perforantes femorales', 'pericallosal artery': 'Arteria pericallosa', 'plantar arch': 'Arco plantar',
      'plantar metatarsal arteries': 'Arterias metatarsianas plantares', 'popliteal artery': 'Arteria poplítea', 'postcentral arterial branch': 'Rama arterial poscentral (arteria del surco poscentral)',
      'posterior cerebral artery': 'Arteria cerebral posterior', 'posterior circumflex humeral artery': 'Arteria circunfleja humeral posterior', 'posterior communicating artery': 'Arteria comunicante posterior',
      'posterior deep temporal artery': 'Arteria temporal profunda posterior', 'posterior ethmoidal artery': 'Arteria etmoidal posterior', 'posterior intercostal arteries': 'Arterias intercostales posteriores',
      'posterior interosseous artery': 'Arteria interósea posterior', 'posterior parietal artery': 'Arteria parietal posterior', 'posterior superior alveolar artery': 'Arteria alveolar superior posterior',
      'posterior tibial artery': 'Arteria tibial posterior', 'prefrontal artery': 'Arteria prefrontal', 'proper hepatic artery': 'Arteria hepática propia', 'proper palmar digital arteries': 'Arterias digitales palmares propias',
      'proper plantar digital arteries': 'Arterias digitales plantares propias', 'pulmonary artery': 'Arteria pulmonar', 'pulmonary trunk': 'Tronco pulmonar', 'radial artery': 'Arteria radial',
      'radial collateral artery': 'Arteria colateral radial', 'recurrent interosseous artery': 'Arteria interósea recurrente', 'renal artery': 'Arteria renal', 'right testicular artery': 'Arteria testicular derecha',
      'sigmoid arteries': 'Arterias sigmoideas', 'splenic artery': 'Arteria esplénica', 'subclavian artery': 'Arteria subclavia', 'subcostal artery': 'Arteria subcostal', 'submental artery': 'Arteria submentoniana',
      'subscapular artery': 'Arteria subescapular', 'superficial epigastric artery': 'Arteria epigástrica superficial', 'superficial external pudendal artery': 'Arteria pudenda externa superficial',
      'superficial palmar arch': 'Arco palmar superficial', 'superficial temporal artery': 'Arteria temporal superficial', 'superior anorectal artery': 'Arteria rectal superior (anorrectal superior)',
      'superior epigastric artery': 'Arteria epigástrica superior', 'superior gluteal artery': 'Arteria glútea superior', 'superior labial artery': 'Arteria labial superior',
      'superior lateral genicular artery': 'Arteria genicular superior lateral', 'superior medial genicular artery': 'Arteria genicular superior medial', 'superior mesenteric artery': 'Arteria mesentérica superior',
      'superior phrenic arteries': 'Arterias frénicas superiores', 'superior ulnar collateral artery': 'Arteria colateral cubital superior', 'supra-orbital artery': 'Arteria supraorbitaria',
      'suprascapular artery': 'Arteria supraescapular', 'supratrochlear artery': 'Arteria supratroclear', 'supreme intercostal artery': 'Arteria intercostal suprema', 'testicular artery': 'Arteria testicular',
      'thoracic aorta': 'Aorta torácica', 'thoraco-acromial artery': 'Arteria toracoacromial', 'thoracodorsal artery': 'Arteria toracodorsal', 'thyrocervical trunk': 'Tronco tirocervical',
      'transverse cervical artery': 'Arteria cervical transversa', 'transverse facial artery': 'Arteria facial transversa', 'ulnar artery': 'Arteria cubital (ulnar)', 'vertebral artery': 'Arteria vertebral',
      'ulnar recurrent artery': 'Arteria recurrente cubital', 'sphenopalatine artery': 'Arteria esfenopalatina', 'left colic artery': 'Arteria cólica izquierda', 'right coronary artery': 'Arteria coronaria derecha',
      'middle cerebral artery': 'Arteria cerebral media',
    };
    const BASE = {
      'left colic artery': 'Arteria cólica izquierda', 'right colic artery': 'Arteria cólica derecha', 'left coronary artery': 'Arteria coronaria izquierda', 'right coronary artery': 'Arteria coronaria derecha',
      'left gastric artery': 'Arteria gástrica izquierda', 'right gastric artery': 'Arteria gástrica derecha', 'left coronary leaflet': 'Valva coronaria izquierda (de la válvula aórtica)', 'right coronary leaflet': 'Valva coronaria derecha (de la válvula aórtica)',
      'left pulmonary artery': 'Arteria pulmonar izquierda', 'right pulmonary artery': 'Arteria pulmonar derecha', 'left gastro-omental artery': 'Arteria gastroomental (gastroepiploica) izquierda', 'right gastro-omental artery': 'Arteria gastroomental (gastroepiploica) derecha',
      ...A, 'human body': 'Cuerpo humano', 'cardiovascular system': 'Sistema cardiovascular', 'arteries': 'Arterias', 'organs and viscera': 'Órganos y vísceras',
      'anterior division of internal iliac artery': 'División anterior de la arteria ilíaca interna', 'posterior division of internal iliac artery': 'División posterior de la arteria ilíaca interna',
      'anterior branch of renal artery': 'Rama anterior de la arteria renal', 'posterior branch of renal artery': 'Rama posterior de la arteria renal',
      'accessory branch of middle meningeal artery': 'Rama accesoria de la arteria meníngea media', 'deep branch of transverse cervical artery': 'Rama profunda de la arteria cervical transversa',
      'superficial branch of transverse cervical artery': 'Rama superficial de la arteria cervical transversa', 'superficial branch of medial plantar artery': 'Rama superficial de la arteria plantar medial',
      'anterior septal branches of anterior ethmoidal artery': 'Ramas septales anteriores de la arteria etmoidal anterior', 'septal branches of posterior ethmoidal artery': 'Ramas septales de la arteria etmoidal posterior',
      'posterior septal branches of sphenopalatine artery': 'Ramas septales posteriores de la arteria esfenopalatina',
      'posterior lateral nasal branches of sphenopalatine artery.': 'Ramas nasales posteriores laterales de la arteria esfenopalatina',
      'septal branches of anterior interventricular artery': 'Ramas septales de la arteria interventricular anterior',
      'ascending branch of left colic artery': 'Rama ascendente de la arteria cólica izquierda', 'descending branch of left colic artery': 'Rama descendente de la arteria cólica izquierda',
      'descending branch of lateral circumflex femoral artery': 'Rama descendente de la arteria circunfleja femoral lateral',
      'calcaneal branches of fibular artery': 'Ramas calcáneas de la arteria peronea (fibular)', 'calcaneal branches of posterior tibial artery': 'Ramas calcáneas de la arteria tibial posterior',
      'colic branch of ileocolic artery': 'Rama cólica de la arteria ileocólica', 'ileal branch of ileocolic artery': 'Rama ileal de la arteria ileocólica',
      'dorsal carpal branch of ulnar artery': 'Rama carpiana dorsal de la arteria cubital', 'palmar carpal branch of radial artery': 'Rama carpiana palmar de la arteria radial',
      'frontal branch of superficial temporal artery': 'Rama frontal de la arteria temporal superficial', 'frontal branches of callosomarginal artery': 'Ramas frontales de la arteria callosomarginal',
      'iliacus branch of iliolumbar artery': 'Rama ilíaca de la arteria iliolumbar', 'lumbar branch of iliolumbar artery': 'Rama lumbar de la arteria iliolumbar', 'spinal branch of iliolumbar artery': 'Rama espinal de la arteria iliolumbar',
      'inferolateral branch of right coronary artery': 'Rama inferolateral (marginal derecha) de la arteria coronaria derecha',
      'insular branches of middle cerebral artery (M2)': 'Ramas insulares de la arteria cerebral media (M2)', 'insular branches of middle cerebral artery (M2-segment)': 'Ramas insulares de la arteria cerebral media (segmento M2)',
      'middle cerebral artery (M1-segment)': 'Arteria cerebral media (segmento M1)', 'middle cerebral artery (M3 segment)': 'Arteria cerebral media (segmento M3)', 'middle cerebral artery (M3-segment)': 'Arteria cerebral media (segmento M3)',
      'lateral pontine branches of basilar artery': 'Ramas pontinas laterales de la arteria basilar', 'medial pontine branches of basilar artery': 'Ramas pontinas mediales de la arteria basilar',
      'mental branch of inferior alveolar artery': 'Rama mentoniana de la arteria alveolar inferior', 'mylohyoid branch of inferior alveolar artery': 'Rama milohioidea de la arteria alveolar inferior',
      'pectoral branches of thoraco-acromial artery': 'Ramas pectorales de la arteria toracoacromial', 'perforating branches of plantar metatarsal arteries': 'Ramas perforantes de las arterias metatarsianas plantares',
      'inferior lingular artery of left lung': 'Arteria lingular inferior del pulmón izquierdo', 'superior lingular artery of left lung': 'Arteria lingular superior del pulmón izquierdo',
      'inferior lobar artery of right lung': 'Arteria lobular inferior del pulmón derecho', 'middle lobar artery of right lung': 'Arteria lobular media del pulmón derecho', 'superior lobar artery of right lung': 'Arteria lobular superior del pulmón derecho',
    };
    const SEG = { 'anterior basal': 'basal anterior', 'lateral basal': 'basal lateral', 'medial basal': 'basal medial', 'posterior basal': 'basal posterior', anterior: 'anterior', apical: 'apical',
      posterior: 'posterior', lateral: 'lateral', medial: 'medial', superior: 'superior' };
    module.exports = make(BASE, [
      [/^(.+) segmental artery of (left|right) lung$/, r => SEG[r[1]] && `Arteria segmentaria ${SEG[r[1]]} del pulmón ${r[2] === 'left' ? 'izquierdo' : 'derecho'}`],
    ]);
  });

  define('es-veins', (module, require) => {
    // Spanish names for the veins layer of Z-Anatomy (Terminologia Anatomica).
    const { make } = require('./es-make');
    const BASE = {
      'left colic vein': 'Vena cólica izquierda', 'right colic vein': 'Vena cólica derecha', 'left gastric vein': 'Vena gástrica izquierda', 'right gastric vein': 'Vena gástrica derecha',
      'left gastro-omental vein': 'Vena gastroomental (gastroepiploica) izquierda', 'right gastro-omental vein': 'Vena gastroomental (gastroepiploica) derecha',
      'human body': 'Cuerpo humano', 'cardiovascular system': 'Sistema cardiovascular', 'arteries': 'Arterias', 'veins': 'Venas',
      'accessory hemi-azygos vein': 'Vena hemiácigos accesoria', 'angular vein': 'Vena angular', 'anterior circumflex humeral vein': 'Vena circunfleja humeral anterior',
      'anterior division of retromandibular vein': 'División anterior de la vena retromandibular', 'anterior jugular vein': 'Vena yugular anterior', 'anterior tibial veins': 'Venas tibiales anteriores',
      'anterior vein of left lung': 'Vena anterior del pulmón izquierdo', 'anterior vein of right lung': 'Vena anterior del pulmón derecho', 'apical vein of right lung': 'Vena apical del pulmón derecho',
      'apicoposterior vein of left lung': 'Vena apicoposterior del pulmón izquierdo', 'ascending lumbar vein': 'Vena lumbar ascendente', 'axillary vein': 'Vena axilar', 'azygos vein': 'Vena ácigos',
      'basilic vein': 'Vena basílica', 'brachial veins': 'Venas braquiales', 'brachiocephalic vein': 'Vena braquiocefálica (tronco venoso braquiocefálico)', 'cephalic vein': 'Vena cefálica',
      'circumflex scapular vein': 'Vena circunfleja escapular', 'colic vein': 'Vena cólica', 'common facial vein': 'Vena facial común', 'common iliac vein': 'Vena ilíaca común',
      'coronary sinus': 'Seno coronario', 'deep dorsal vein of penis': 'Vena dorsal profunda del pene', 'deep femoral vein': 'Vena femoral profunda', 'deep venous palmar arch': 'Arco venoso palmar profundo',
      'dorsal digital veins of foot': 'Venas digitales dorsales del pie', 'dorsal digital veins of hand': 'Venas digitales dorsales de la mano', 'dorsal metatarsal veins': 'Venas metatarsianas dorsales',
      'dorsal venous arch of foot': 'Arco venoso dorsal del pie', 'dorsal venous network of hand': 'Red venosa dorsal de la mano', 'external iliac vein': 'Vena ilíaca externa',
      'external jugular vein': 'Vena yugular externa', 'external pudendal veins': 'Venas pudendas externas', 'facial vein': 'Vena facial', 'femoral vein': 'Vena femoral', 'fibular veins': 'Venas peroneas (fibulares)',
      'gastro-omental vein': 'Vena gastroomental (gastroepiploica)', 'genicular veins': 'Venas geniculares', 'great cardiac vein': 'Vena cardíaca magna', 'great saphenous vein': 'Vena safena magna (mayor)',
      'hemi-azygos vein': 'Vena hemiácigos', 'hepatic portal vein': 'Vena porta hepática', 'hepatic veins': 'Venas hepáticas (suprahepáticas)', 'iliolumbar vein': 'Vena iliolumbar',
      'inferior basal vein of left lung': 'Vena basal inferior del pulmón izquierdo', 'inferior basal vein of right lung': 'Vena basal inferior del pulmón derecho',
      'inferior epigastric vein': 'Vena epigástrica inferior', 'inferior gluteal veins': 'Venas glúteas inferiores', 'inferior labial veins': 'Venas labiales inferiores',
      'inferior lingular vein of left lung': 'Vena lingular inferior del pulmón izquierdo', 'inferior mesenteric vein': 'Vena mesentérica inferior', 'inferior ophthalmic vein': 'Vena oftálmica inferior',
      'inferior pulmonary vein': 'Vena pulmonar inferior', 'inferior sagittal sinus': 'Seno sagital inferior', 'inferior vein of left ventricle': 'Vena posterior del ventrículo izquierdo',
      "inferior vein of left ventricle (//Posterior '')": 'Vena posterior (inferior) del ventrículo izquierdo',
      'inferior vena cava (abdominal part)': 'Vena cava inferior (porción abdominal)', 'inferior vena cava (thoracic part)': 'Vena cava inferior (porción torácica)',
      'intercapitular veins of foot': 'Venas intercapitulares del pie', 'internal iliac vein': 'Vena ilíaca interna', 'internal jugular vein': 'Vena yugular interna',
      'internal pudendal vein': 'Vena pudenda interna', 'internal thoracic veins': 'Venas torácicas internas', 'intrarenal veins of left kidney': 'Venas intrarrenales del riñón izquierdo',
      'intrarenal veins of right kidney': 'Venas intrarrenales del riñón derecho', 'lateral circumflex femoral veins': 'Venas circunflejas femorales laterales', 'lateral plantar veins': 'Venas plantares laterales',
      'lateral sacral veins': 'Venas sacras laterales', 'lateral thoracic vein': 'Vena torácica lateral', 'lateral vein of right lung': 'Vena lateral del pulmón derecho', 'lingual vein': 'Vena lingual',
      'lingular vein of left lung': 'Vena lingular del pulmón izquierdo', 'lumbar veins': 'Venas lumbares', 'maxillary veins': 'Venas maxilares', 'medial circumflex femoral veins': 'Venas circunflejas femorales mediales',
      'medial plantar veins': 'Venas plantares mediales', 'medial vein of right lung': 'Vena medial del pulmón derecho', 'median antebrachial vein': 'Vena mediana del antebrazo',
      'median cubital vein': 'Vena mediana del codo (mediana cubital)', 'middle cardiac vein': 'Vena cardíaca media', 'middle colic vein': 'Vena cólica media', 'musculophrenic veins': 'Venas musculofrénicas',
      'occipital vein': 'Vena occipital', 'palmar digital veins': 'Venas digitales palmares', 'perforating veins': 'Venas perforantes', 'plantar digital veins': 'Venas digitales plantares',
      'plantar metatarsal veins': 'Venas metatarsianas plantares', 'plantar venous arch': 'Arco venoso plantar', 'popliteal vein': 'Vena poplítea', 'posterior auricular vein': 'Vena auricular posterior',
      'posterior circumflex humeral vein': 'Vena circunfleja humeral posterior', 'posterior division of retromandibular vein': 'División posterior de la vena retromandibular',
      'posterior tibial veins': 'Venas tibiales posteriores', 'posterior vein of right lung': 'Vena posterior del pulmón derecho', 'radial veins': 'Venas radiales', 'renal vein': 'Vena renal',
      'retromandibular vein': 'Vena retromandibular', 'sigmoid sinus': 'Seno sigmoideo', 'sigmoid veins': 'Venas sigmoideas', 'small saphenous vein': 'Vena safena parva (menor)', 'splenic vein': 'Vena esplénica',
      'subclavian vein': 'Vena subclavia', 'subcostal vein': 'Vena subcostal', 'submental vein': 'Vena submentoniana', 'subscapular vein': 'Vena subescapular',
      'superficial dorsal veins of penis': 'Venas dorsales superficiales del pene', 'superficial epigastric vein': 'Vena epigástrica superficial', 'superficial temporal veins': 'Venas temporales superficiales',
      'superficial venous palmar arch': 'Arco venoso palmar superficial', 'superior basal vein of left lung': 'Vena basal superior del pulmón izquierdo', 'superior basal vein of right lung': 'Vena basal superior del pulmón derecho',
      'superior epigastric veins': 'Venas epigástricas superiores', 'superior gluteal veins': 'Venas glúteas superiores', 'superior intercostal vein': 'Vena intercostal superior', 'superior labial vein': 'Vena labial superior',
      'superior lingular vein of left lung': 'Vena lingular superior del pulmón izquierdo', 'superior mesenteric vein': 'Vena mesentérica superior', 'superior ophthalmic vein': 'Vena oftálmica superior',
      'superior phrenic vein': 'Vena frénica superior', 'superior pulmonary vein': 'Vena pulmonar superior', 'superior sagittal sinus': 'Seno sagital superior', 'superior thyroid vein': 'Vena tiroidea superior',
      'superior vein of left lung': 'Vena superior del pulmón izquierdo', 'superior vein of right lung': 'Vena superior del pulmón derecho', 'superior vena cava': 'Vena cava superior',
      'suprascapular vein': 'Vena supraescapular', 'testicular vein': 'Vena testicular', 'thoracodorsal vein': 'Vena toracodorsal', 'transverse sinus': 'Seno transverso', 'ulnar veins': 'Venas cubitales (ulnares)',
      'vertebral vein': 'Vena vertebral',
    };
    module.exports = make(BASE);
  });

  define('es-nerves', (module, require) => {
    // Spanish names for the nervous-system layer of Z-Anatomy (Terminologia Anatomica):
    // peripheral nerves, brain and spinal cord, and the eye/lacrimal parts filed here.
    // Cranial nerves keep their Roman numeral; asterisks are kept as in the source
    // (Destrieux atlas labels without a TA term).
    const { make } = require('./es-make');
    const BASE = {
      'human body': 'Cuerpo humano', 'nervous system': 'Sistema nervioso',
      // cranial nerves
      'olfactory nerve (I)': 'Nervio olfatorio (I)', 'optic nerve (II)': 'Nervio óptico (II)', 'oculomotor nerve (III)': 'Nervio oculomotor (motor ocular común, III)',
      'trochlear nerve (IV)': 'Nervio troclear (patético, IV)', 'trigeminal nerve (V)': 'Nervio trigémino (V)', 'abducens nerve (VI)': 'Nervio abducens (motor ocular externo, VI)',
      'facial nerve (VII)': 'Nervio facial (VII)', 'vestibulocochlear nerve (VIII)': 'Nervio vestibulococlear (auditivo, VIII)', 'glossopharyngeal nerve (IX)': 'Nervio glosofaríngeo (IX)',
      'vagus nerve (X)': 'Nervio vago (neumogástrico, X)', 'left vagus nerve (X)': 'Nervio vago izquierdo (X)', 'right vagus nerve (X)': 'Nervio vago derecho (X)',
      'accessory nerve (XI)': 'Nervio accesorio (espinal, XI)', 'hypoglossal nerve (XII)': 'Nervio hipogloso (XII)',
      'ophthalmic nerve': 'Nervio oftálmico', 'maxillary nerve': 'Nervio maxilar', 'meningeal branch of maxillary nerve': 'Rama meníngea del nervio maxilar',
      'anterior division of mandibular nerve': 'División anterior del nervio mandibular', 'posterior division of mandibular nerve': 'División posterior del nervio mandibular',
      'motor root of trigeminal nerve': 'Raíz motora del nervio trigémino', 'sensory root of trigeminal nerve': 'Raíz sensitiva del nervio trigémino', 'buccal nerve': 'Nervio bucal',
      'inferior alveolar nerve': 'Nervio alveolar inferior', 'lingual nerve': 'Nervio lingual', 'mental nerve': 'Nervio mentoniano', 'nerve to mylohyoid muscle': 'Nervio del músculo milohioideo',
      'chorda tympani': 'Cuerda del tímpano', 'cochlear nerve': 'Nervio coclear', 'vestibular nerve': 'Nervio vestibular',
      // brachial plexus & upper limb
      'roots of brachial plexus': 'Raíces del plexo braquial', 'superior trunk of brachial plexus': 'Tronco superior del plexo braquial', 'middle trunk of brachial plexus': 'Tronco medio del plexo braquial',
      'inferior trunk of brachial plexus': 'Tronco inferior del plexo braquial', 'posterior cord of brachial plexus': 'Fascículo (cordón) posterior del plexo braquial',
      'anterior division of superior trunk of brachial plexus': 'División anterior del tronco superior del plexo braquial', 'posterior division of superior trunk of brachial plexus': 'División posterior del tronco superior del plexo braquial',
      'anterior division of middle trunk of brachial plexus': 'División anterior del tronco medio del plexo braquial', 'posterior division of middle trunk of brachial plexus': 'División posterior del tronco medio del plexo braquial',
      'anterior division of inferior trunk of brachial plexus': 'División anterior del tronco inferior del plexo braquial', 'posterior division of inferior trunk of brachial plexus': 'División posterior del tronco inferior del plexo braquial',
      'axillary nerve': 'Nervio axilar (circunflejo)', 'muscular branches of axillary nerve': 'Ramas musculares del nervio axilar', 'dorsal scapular nerve': 'Nervio dorsal de la escápula',
      'long thoracic nerve': 'Nervio torácico largo (de Bell)', 'lateral pectoral nerve': 'Nervio pectoral lateral', 'medial pectoral nerve': 'Nervio pectoral medial', 'subclavian nerve': 'Nervio subclavio',
      'suprascapular nerve': 'Nervio supraescapular', 'superior subscapular nerve': 'Nervio subescapular superior', 'inferior subscapular nerve': 'Nervio subescapular inferior', 'thoracodorsal nerve': 'Nervio toracodorsal',
      'musculocutaneous nerve': 'Nervio musculocutáneo', 'median nerve': 'Nervio mediano', 'ulnar nerve': 'Nervio cubital (ulnar)', 'radial nerve': 'Nervio radial',
      'muscular branches of median nerve': 'Ramas musculares del nervio mediano', 'muscular branches of radial nerve': 'Ramas musculares del nervio radial', 'muscular branches of ulnar nerve': 'Ramas musculares del nervio cubital',
      'palmar branch of median nerve': 'Rama palmar del nervio mediano', 'palmar branch of ulnar nerve': 'Rama palmar del nervio cubital', 'dorsal branch of ulnar nerve': 'Rama dorsal del nervio cubital',
      'deep branch of radial nerve': 'Rama profunda del nervio radial', 'superficial branch of radial nerve': 'Rama superficial del nervio radial', 'deep branch of ulnar nerve': 'Rama profunda del nervio cubital',
      'superficial branch of ulnar nerve': 'Rama superficial del nervio cubital', 'communicating branch of median nerve with ulnar nerve': 'Ramo comunicante del nervio mediano con el nervio cubital',
      'common palmar digital branches of median nerve': 'Nervios digitales palmares comunes del nervio mediano', 'proper palmar digital branches of median nerve': 'Nervios digitales palmares propios del nervio mediano',
      'common palmar digital branches of ulnar nerve': 'Nervios digitales palmares comunes del nervio cubital', 'proper palmar digital branches of ulnar nerve': 'Nervios digitales palmares propios del nervio cubital',
      'dorsal digital branches of radial nerve': 'Nervios digitales dorsales del nervio radial', 'dorsal digital branches of ulnar nerve': 'Nervios digitales dorsales del nervio cubital',
      'anterior interosseous nerve of forearm': 'Nervio interóseo anterior del antebrazo', 'posterior interosseous nerve of forearm': 'Nervio interóseo posterior del antebrazo',
      'medial brachial cutaneous nerve': 'Nervio cutáneo medial del brazo', 'superior lateral brachial cutaneous nerve': 'Nervio cutáneo lateral superior del brazo',
      'inferior lateral brachial cutaneous nerve': 'Nervio cutáneo lateral inferior del brazo', 'lateral antebrachial cutaneous nerve': 'Nervio cutáneo lateral del antebrazo',
      'medial antebrachial cutaneous nerve': 'Nervio cutáneo medial del antebrazo', 'posterior antebrachial cutaneous nerve': 'Nervio cutáneo posterior del antebrazo',
      'anterior branch of medial antebrachial cutaneous nerve': 'Rama anterior del nervio cutáneo medial del antebrazo', 'posterior branch of medial antebrachial cutaneous nerve': 'Rama posterior del nervio cutáneo medial del antebrazo',
      // trunk, lumbosacral & lower limb
      'intercostal nerves': 'Nervios intercostales', 'iliohypogastric nerve': 'Nervio iliohipogástrico', 'ilio-inguinal nerve': 'Nervio ilioinguinal', 'genitofemoral nerve': 'Nervio genitofemoral',
      'femoral branch of genitofemoral nerve': 'Rama femoral del nervio genitofemoral', 'genital branch of genitofemoral nerve': 'Rama genital del nervio genitofemoral',
      'lateral femoral cutaneous nerve': 'Nervio cutáneo femoral lateral', 'posterior femoral cutaneous nerve': 'Nervio cutáneo femoral posterior',
      'anterior root of posterior femoral cutaneous nerve': 'Raíz anterior del nervio cutáneo femoral posterior', 'posterior root of posterior femoral cutaneous nerve': 'Raíz posterior del nervio cutáneo femoral posterior',
      'femoral nerve': 'Nervio femoral (crural)', 'anterior cutaneous branches of femoral nerve': 'Ramas cutáneas anteriores del nervio femoral', 'saphenous nerve': 'Nervio safeno',
      'infrapatellar branch of saphenous nerve': 'Rama infrarrotuliana del nervio safeno', 'medial crural cutaneous branches of saphenous nerve': 'Ramas cutáneas mediales de la pierna del nervio safeno',
      'obturator nerve': 'Nervio obturador', 'anterior branch of obturator nerve': 'Rama anterior del nervio obturador', 'posterior branch of obturator nerve': 'Rama posterior del nervio obturador',
      'superior gluteal nerve': 'Nervio glúteo superior', 'nerve to piriformis muscle': 'Nervio del músculo piriforme', 'nerve to quadratus femoris muscle': 'Nervio del músculo cuadrado femoral',
      'pudendal nerve': 'Nervio pudendo', 'sciatic nerve': 'Nervio ciático', 'tibial nerve': 'Nervio tibial', 'common fibular nerve': 'Nervio peroneo (fibular) común',
      'deep fibular nerve': 'Nervio peroneo (fibular) profundo', 'superficial fibular nerve': 'Nervio peroneo (fibular) superficial', 'muscular branches of deep fibular nerve': 'Ramas musculares del nervio peroneo profundo',
      'dorsal digital branches of deep fibular nerve': 'Nervios digitales dorsales del nervio peroneo profundo', 'dorsal digital branches of superficial fibular nerve': 'Nervios digitales dorsales del nervio peroneo superficial',
      'sural communicating branch of common fibular nerve': 'Ramo comunicante sural del nervio peroneo común', 'medial sural cutaneous nerve': 'Nervio cutáneo sural medial', 'sural nerve': 'Nervio sural (safeno externo)',
      'intermediate dorsal cutaneous nerve of foot': 'Nervio cutáneo dorsal intermedio del pie', 'medial dorsal cutaneous nerve of foot': 'Nervio cutáneo dorsal medial del pie',
      'lateral plantar nerve': 'Nervio plantar lateral', 'medial plantar nerve': 'Nervio plantar medial',
      'common plantar digital branches of lateral plantar nerve': 'Nervios digitales plantares comunes del nervio plantar lateral', 'common plantar digital branches of medial plantar nerve': 'Nervios digitales plantares comunes del nervio plantar medial',
      'proper plantar digital branches of lateral plantar nerve': 'Nervios digitales plantares propios del nervio plantar lateral', 'proper plantar digital branches of medial plantar nerve': 'Nervios digitales plantares propios del nervio plantar medial',
      'sympathetic trunk': 'Tronco simpático', 'ganglia of sympathetic trunk': 'Ganglios del tronco simpático', 'sympathetic nerves': 'Nervios simpáticos', 'cauda equina': 'Cola de caballo',
      'spinal ganglion': 'Ganglio espinal (de la raíz posterior)', 'anterior root of spinal nerve': 'Raíz anterior del nervio espinal', 'posterior root of spinal nerve': 'Raíz posterior del nervio espinal',
      // spinal cord
      'spinal dura': 'Duramadre espinal', 'central canal': 'Conducto central (canal ependimario)', "central canal'": 'Conducto central (canal ependimario)', 'anterior horn of spinal cord': 'Asta anterior de la médula espinal',
      'posterior horn of spinal cord': 'Asta posterior de la médula espinal', 'white matter of spinal cord': 'Sustancia blanca de la médula espinal', 'lateral intermediate substance': 'Sustancia intermedia lateral',
      'intermediolateral nucleus': 'Núcleo intermediolateral', 'intermediomedial nucleus': 'Núcleo intermediomedial', 'nucleus proprius': 'Núcleo propio (del asta posterior)', 'spinal reticular process': 'Formación reticular espinal (proceso reticular)',
      'anterior corticospinal tract': 'Tracto corticoespinal anterior', 'lateral corticospinal tract': 'Tracto corticoespinal lateral', 'anterior spinocerebellar tract': 'Tracto espinocerebeloso anterior',
      'posterior spinocerebellar tract': 'Tracto espinocerebeloso posterior', 'anterior spinothalamic tract': 'Tracto espinotalámico anterior', 'lateral spinothalamic tract': 'Tracto espinotalámico lateral',
      'lateral reticulospinal tract': 'Tracto reticuloespinal lateral', 'medial reticulospinal tract': 'Tracto reticuloespinal medial', 'lateral vestibulospinal tract': 'Tracto vestibuloespinal lateral',
      'medial vestibulospinal tract': 'Tracto vestibuloespinal medial', 'rubrospinal tract': 'Tracto rubroespinal', 'spinotectal tract': 'Tracto espinotectal', 'tectospinal tract': 'Tracto tectoespinal',
      'posterolateral tract': 'Tracto posterolateral (de Lissauer)', 'anterior fasciculus proprius': 'Fascículo propio anterior', 'lateral fasciculus proprius': 'Fascículo propio lateral',
      'posterior fasciculus proprius': 'Fascículo propio posterior', 'cuneate fasciculus': 'Fascículo cuneiforme (de Burdach)', 'gracile fasciculus': 'Fascículo grácil (de Goll)',
      // brainstem & nuclei
      'medulla oblongata': 'Bulbo raquídeo (médula oblongada)', 'pyramid of medulla oblongata': 'Pirámide bulbar', 'olive': 'Oliva', 'pons': 'Puente (protuberancia)', 'midbrain': 'Mesencéfalo',
      'base of peduncle': 'Base del pedúnculo cerebral', 'interpeduncular fossa': 'Fosa interpeduncular', 'aqueduct of midbrain': 'Acueducto del mesencéfalo (de Silvio)', 'red nucleus': 'Núcleo rojo',
      'superior colliculus': 'Colículo superior', 'inferior colliculus': 'Colículo inferior', 'nucleus ambiguus': 'Núcleo ambiguo', 'nucleus of abducens nerve': 'Núcleo del nervio abducens',
      'nucleus of accessory nerve': 'Núcleo del nervio accesorio', 'nucleus of hypoglossal nerve': 'Núcleo del nervio hipogloso', 'nucleus of oculomotor nerve': 'Núcleo del nervio oculomotor',
      'accessory nucleus of oculomotor nerve': 'Núcleo accesorio del nervio oculomotor (de Edinger-Westphal)', 'nucleus of trochlear nerve': 'Núcleo del nervio troclear',
      'motor nucleus of facial nerve': 'Núcleo motor del nervio facial', 'posterior nucleus of vagus nerve': 'Núcleo posterior (dorsal) del nervio vago', 'inferior salivatory nucleus': 'Núcleo salival inferior',
      'superior salivatory nucleus': 'Núcleo salival superior', 'anterior cochlear nucleus': 'Núcleo coclear anterior', 'posterior cochlear nucleus': 'Núcleo coclear posterior', 'vestibular nuclei': 'Núcleos vestibulares',
      'fourth ventricle': 'Cuarto ventrículo', 'third ventricle': 'Tercer ventrículo', 'lateral ventricle': 'Ventrículo lateral', 'choroid plexus': 'Plexo coroideo',
      // cerebellum
      'superior cerebellar peduncle': 'Pedúnculo cerebeloso superior', 'lingula of cerebellum': 'Língula del cerebelo', 'central lobule': 'Lóbulo central', 'wing of central lobule': 'Ala del lóbulo central',
      'culmen': 'Culmen', 'declive': 'Declive', 'folium of vermis': 'Folium del vermis', 'tuber of vermis': 'Túber del vermis', 'pyramis of vermis': 'Pirámide del vermis', 'uvula of vermis': 'Úvula del vermis',
      'nodule of vermis': 'Nódulo del vermis', 'anterior quadrangular lobule': 'Lóbulo cuadrangular anterior', 'posterior quadrangular lobule': 'Lóbulo cuadrangular posterior (simple)',
      'superior semilunar lobule': 'Lóbulo semilunar superior', 'inferior semilunar lobule': 'Lóbulo semilunar inferior', 'gracile lobule': 'Lóbulo grácil', 'biventral lobule': 'Lóbulo biventral',
      'tonsil of cerebellum': 'Tonsila (amígdala) cerebelosa', 'flocculus': 'Flóculo', 'peduncle of flocculus': 'Pedúnculo del flóculo', 'tentorium cerebelli': 'Tienda del cerebelo',
      // diencephalon & basal nuclei
      'thalamus': 'Tálamo', 'hypothalamus': 'Hipotálamo', 'habenula': 'Habénula', 'stria medullaris thalami': 'Estría medular del tálamo', 'lateral geniculate body': 'Cuerpo geniculado lateral',
      'medial geniculate body': 'Cuerpo geniculado medial', 'mamillary body': 'Cuerpo mamilar', 'optic chiasm': 'Quiasma óptico', 'optic tract': 'Tracto (cintilla) óptico',
      'caudate nucleus': 'Núcleo caudado', 'lentiform nucleus': 'Núcleo lenticular', 'putamen': 'Putamen', 'globus pallidus': 'Globo pálido', 'amygdaloid body': 'Cuerpo amigdalino (amígdala cerebral)',
      'septal nuclei': 'Núcleos septales', 'stria terminalis': 'Estría terminal', 'hippocampus': 'Hipocampo', 'fornix': 'Fórnix (trígono cerebral)', 'septum pellucidum': 'Septo pelúcido',
      'corpus callosum': 'Cuerpo calloso', 'anterior commissure': 'Comisura anterior', 'posterior commissure': 'Comisura posterior', 'hippocampal commissure': 'Comisura del hipocampo (del fórnix)',
      'white matter of telencephalon': 'Sustancia blanca del telencéfalo', 'falx cerebri': 'Hoz del cerebro',
      // cerebral cortex (gyri & sulci)
      'angular gyrus': 'Giro (circunvolución) angular', 'supramarginal gyrus': 'Giro (circunvolución) supramarginal', 'precentral gyrus': 'Giro (circunvolución) precentral',
      'postcentral gyrus': 'Giro (circunvolución) poscentral', 'superior frontal gyrus': 'Giro frontal superior', 'middle frontal gyrus': 'Giro frontal medio',
      'opercular part of inferior frontal gyrus': 'Porción opercular del giro frontal inferior', 'triangular part of inferior frontal gyrus': 'Porción triangular del giro frontal inferior',
      'orbital part of  inferior frontal gyrus': 'Porción orbitaria del giro frontal inferior', 'superior temporal gyrus (Lateral part)': 'Giro temporal superior (porción lateral)',
      'middle temporal gyrus': 'Giro temporal medio', 'inferior temporal gyrus': 'Giro temporal inferior', 'transverse temporal gyri': 'Giros temporales transversos (de Heschl)', 'temporal plane': 'Plano temporal',
      'temporal pole': 'Polo temporal', 'occipital pole': 'Polo occipital', 'superior occipital gyri': 'Giros occipitales superiores', 'lateral occipital gyrus (Middle occipital gyrus*)': 'Giro occipital lateral (giro occipital medio*)',
      'inferior occipital gyrus and sulcus*': 'Giro y surco occipital inferior*', 'lingual gyrus': 'Giro lingual', 'cuneus': 'Cuña (cuneus)', 'precuneus': 'Precuña (precuneus)',
      'lateral occipitotemporal gyrus': 'Giro occipitotemporal lateral (fusiforme)', 'medial occipitotemporal gyrus (Parahippocampal*)': 'Giro occipitotemporal medial (parahipocampal*)',
      'superior parietal lobule': 'Lobulillo parietal superior', 'cingulate gyrus (Posteroventral part*)': 'Giro del cíngulo (porción posteroventral*)',
      'cingulate gyrus and sulcus (Middle anterior part)': 'Giro y surco del cíngulo (porción media anterior)', 'cingulate gyrus and sulcus (Middle posterior part)': 'Giro y surco del cíngulo (porción media posterior)',
      'cingulate gyrus and sulcus (Posterior dorsal part)': 'Giro y surco del cíngulo (porción dorsal posterior)', 'cingulate sulcus (Marginal part*)': 'Surco del cíngulo (porción marginal*)',
      'orbital gyri': 'Giros orbitarios', 'orbital gyri (Frontomarginal gyrus and sulcus*)': 'Giros orbitarios (giro y surco frontomarginal*)', 'straight gyrus (Gyrus rectus)': 'Giro recto (gyrus rectus)',
      'orbital sulci (H-shaped orbital sulci*)': 'Surcos orbitarios (en H*)', 'orbital sulci (Lateral Orbital sulcus*)': 'Surcos orbitarios (surco orbitario lateral*)',
      'paracentral gyrus and sulcus*': 'Giro y surco paracentral*', 'paracentral sulcus': 'Surco paracentral', 'transverse frontopolar gyrus and sulcus*': 'Giro y surco frontopolar transverso*',
      'insula (Subcentral gyrus and ant. and post. sulci*)': 'Ínsula (giro subcentral y surcos anterior y posterior*)', 'circular sulcus of insula': 'Surco circular de la ínsula',
      'central sulcus': 'Surco central (de Rolando)', 'precentral sulcus (Superior part)*': 'Surco precentral (porción superior)*', 'precentral sulcus (inferior part)*': 'Surco precentral (porción inferior)*',
      'postcentral sulcus': 'Surco poscentral', 'superior frontal sulcus': 'Surco frontal superior', 'inferior frontal sulcus': 'Surco frontal inferior', 'olfactory sulcus': 'Surco olfatorio',
      'superior temporal sulcus': 'Surco temporal superior', 'inferior temporal sulcus': 'Surco temporal inferior', 'intraparietal sulcus': 'Surco intraparietal', 'subparietal sulcus': 'Surco subparietal',
      'parieto-occipital sulcus': 'Surco parietooccipital', 'calcarine sulcus': 'Surco calcarino', 'collateral sulcus': 'Surco colateral', 'posterior transverse collateral sulcus': 'Surco colateral transverso posterior',
      'lunate sulcus': 'Surco semilunar (lunatus)', 'transverse occipital sulcus': 'Surco occipital transverso', 'anterior occipital sulcus*': 'Surco occipital anterior*',
      'occipitotemporal sulcus (Lateral part*)': 'Surco occipitotemporal (porción lateral*)', 'sulcus interm_prim-Jensen': 'Surco intermedio primario (de Jensen)',
      'lat_Fis-ant-Horizont': 'Rama horizontal anterior del surco lateral (cisura de Silvio)', 'lat_Fis-ant-Vertical': 'Rama ascendente anterior del surco lateral (cisura de Silvio)',
      'lat_Fis-post': 'Rama posterior del surco lateral (cisura de Silvio)',
      // eye, ear & lacrimal apparatus (filed under this layer in Z-Anatomy)
      'anterior chamber of eyeball': 'Cámara anterior del ojo', 'anterior segment of eyeball': 'Segmento anterior del globo ocular', 'posterior segment of eyeball': 'Segmento posterior del globo ocular',
      'cornea': 'Córnea', 'iris': 'Iris', 'lens': 'Cristalino', 'retina': 'Retina', 'sclera': 'Esclerótica', 'vitreous body': 'Cuerpo vítreo', 'zonular fibres': 'Fibras zonulares (zónula de Zinn)',
      'suspensory ligament of eyeball': 'Ligamento suspensorio del globo ocular (de Lockwood)', 'lacrimal gland': 'Glándula lagrimal', 'lacrimal canaliculus': 'Canalículo lagrimal',
      'ampulla of lacrimal canaliculus': 'Ampolla del canalículo lagrimal', 'lacrimal sac': 'Saco lagrimal', 'nasolacrimal duct': 'Conducto nasolagrimal', 'auditory tube': 'Tuba auditiva (trompa de Eustaquio)',
      'tympanic membrane': 'Membrana timpánica (tímpano)',
    };
    module.exports = make(BASE);
  });

  define('es-lymph', (module, require) => {
    // Spanish names for the lymphatic layer of Z-Anatomy (Terminologia Anatomica).
    // TA "nodi lymphoidei" = "nódulos linfáticos"; clinically also "ganglios linfáticos".
    // Each node name gives the TA form; the system label carries both.
    const { make } = require('./es-make');
    const N = 'Nódulos linfáticos ', N1 = 'Nódulo linfático ';
    const NODES = {
      'anterior tibial': [1, 'tibial anterior'], 'fibular': [1, 'peroneo (fibular)'], 'intermediate deep inguinal': [1, 'inguinal profundo intermedio'],
      'lateral lacunar': [1, 'lacunar lateral'], 'posterior tibial': [1, 'tibial posterior'], 'proximal deep inguinal': [1, 'inguinal profundo proximal (de Cloquet/Rosenmüller)'],
      'retropyloric': [0, 'retropilóricos'], 'subpyloric': [0, 'subpilóricos'], 'suprapyloric': [1, 'suprapilórico'],
      'anterior axillary': [0, 'axilares anteriores (pectorales)'], 'anterior inferior jugular': [0, 'yugulares anteriores inferiores'], 'apical axillary': [0, 'axilares apicales'],
      'appendicular': [0, 'apendiculares'], 'brachial': [0, 'braquiales'], 'brachiocephalic': [0, 'braquiocefálicos'], 'bucinator': [1, 'buccinador'],
      'central axillary': [0, 'axilares centrales'], 'central superior mesenteric': [0, 'mesentéricos superiores centrales'], 'coeliac': [0, 'celíacos'], 'colic': [0, 'cólicos'],
      'cubital': [0, 'cubitales (supratrocleares)'], 'cystic': [1, 'cístico'], 'deep popliteal': [0, 'poplíteos profundos'], 'gastric': [0, 'gástricos'],
      'gastro-omental': [0, 'gastroomentales (gastroepiploicos)'], 'ileocolic': [0, 'ileocólicos'], 'inferior deep lateral cervical': [0, 'cervicales laterales profundos inferiores'],
      'inferior diaphragmatic': [0, 'frénicos inferiores'], 'inferior epigastric': [0, 'epigástricos inferiores'], 'inferior gluteal': [0, 'glúteos inferiores'],
      'inferior pancreatic': [0, 'pancreáticos inferiores'], 'inferior superficial inguinal': [0, 'inguinales superficiales inferiores'],
      'inferior tracheobronchial': [0, 'traqueobronquiales inferiores (subcarinales)'], 'infra-auricular': [0, 'infraauriculares'], 'infraclavicular': [0, 'infraclaviculares (deltopectorales)'],
      'intercostal': [0, 'intercostales'], 'intermediate common iliac': [0, 'ilíacos comunes intermedios'], 'intermediate external iliac': [0, 'ilíacos externos intermedios'],
      'intermediate lumbar': [0, 'lumbares intermedios'], 'interpectoral': [0, 'interpectorales (de Rotter)'], 'intraglandular parotid': [0, 'parotídeos intraglandulares'],
      'intrapulmonary': [0, 'intrapulmonares'], 'jugulodigastric': [1, 'yugulodigástrico'], 'juxta-intestinal mesenteric': [0, 'mesentéricos yuxtaintestinales'],
      'juxta-oesophageal': [0, 'yuxtaesofágicos'], 'lateral aortic': [0, 'aórticos laterales'], 'lateral axillary': [0, 'axilares laterales (humerales)'], 'lateral caval': [0, 'cavos laterales'],
      'lateral common iliac': [0, 'ilíacos comunes laterales'], 'lateral pericardial': [0, 'pericárdicos laterales'], 'lateral sacral': [0, 'sacros laterales'],
      'lateral superior jugular': [1, 'yugular lateral superior'], 'lateral vesical': [0, 'vesicales laterales'], 'mandibular': [1, 'mandibular'], 'mastoid': [0, 'mastoideos (retroauriculares)'],
      'medial common iliac': [0, 'ilíacos comunes mediales'], 'medial external iliac': [0, 'ilíacos externos mediales'], 'middle colic': [0, 'cólicos medios'], 'nasolabial': [1, 'nasolabial'],
      'obturator': [0, 'obturadores'], 'occipital': [0, 'occipitales'], 'paracolic superior mesenteric': [0, 'mesentéricos superiores paracólicos'], 'pararectal': [0, 'pararrectales (anorrectales)'],
      'parasternal': [0, 'paraesternales'], 'paratracheal cervical': [0, 'paratraqueales cervicales'], 'paratracheal thoracic': [0, 'paratraqueales torácicos'],
      'posterior axillary': [0, 'axilares posteriores (subescapulares)'], 'postvesical': [0, 'retrovesicales'], 'pre-aortic': [0, 'preaórticos'], 'pre-auricular': [0, 'preauriculares'],
      'precaecal': [0, 'prececales'], 'precaval': [0, 'precavos'], 'prepericardial': [0, 'prepericárdicos'], 'pretracheal': [0, 'pretraqueales'], 'prevertebral': [0, 'prevertebrales'],
      'prevesical': [0, 'prevesicales'], 'retro-aortic': [0, 'retroaórticos'], 'retrocaecal': [0, 'retrocecales'], 'retrocaval': [0, 'retrocavos'], 'retropharyngeal': [0, 'retrofaríngeos'],
      'sigmoid': [0, 'sigmoideos'], 'splenic': [0, 'esplénicos'], 'subaortic': [0, 'subaórticos'], 'submandibular': [0, 'submandibulares'], 'submental': [0, 'submentonianos'],
      'superficial anterior cervical': [0, 'cervicales anteriores superficiales'], 'superficial lateral cervical': [0, 'cervicales laterales superficiales'],
      'superficial parotid': [0, 'parotídeos superficiales'], 'superficial popliteal': [0, 'poplíteos superficiales'], 'superior diaphragmatic': [0, 'frénicos superiores'],
      'superior gluteal': [0, 'glúteos superiores'], 'superior pancreatic': [0, 'pancreáticos superiores'], 'superior pancreaticoduodenal': [0, 'pancreaticoduodenales superiores'],
      'superior tracheobronchial': [0, 'traqueobronquiales superiores'], 'superolateral superficial inguinal': [0, 'inguinales superficiales superolaterales'],
      'superomedial superficial inguinal': [0, 'inguinales superficiales superomediales'], 'supraclavicular': [0, 'supraclaviculares'], 'supratrochlear': [0, 'supratrocleares'], 'thyroid': [0, 'tiroideos'],
    };
    const BASE = {
      'left colic nodes': 'Nódulos linfáticos cólicos izquierdos', 'right colic nodes': 'Nódulos linfáticos cólicos derechos', 'left gastric nodes': 'Nódulos linfáticos gástricos izquierdos',
      'right gastric nodes': 'Nódulos linfáticos gástricos derechos', 'left gastro-omental nodes': 'Nódulos linfáticos gastroomentales izquierdos', 'right gastro-omental nodes': 'Nódulos linfáticos gastroomentales derechos',
      'human body': 'Cuerpo humano', 'lymphatic system': 'Sistema linfático', 'lobe of thymus': 'Lóbulo del timo', 'palatine tonsil': 'Amígdala (tonsila) palatina', 'spleen': 'Bazo',
      'node of arch of azygos vein': 'Nódulo linfático del arco de la vena ácigos', 'node of ligamentum arteriosum': 'Nódulo linfático del ligamento arterioso',
    };
    module.exports = make(BASE, [[/^(.+) nodes?$/i, r => { const k = NODES[r[1].toLowerCase()]; return k && (k[0] ? N1 : N) + k[1]; }]]);
  });

  define('es-ligaments', (module, require) => {
    // Spanish names for the "ligaments & joints" layer of Z-Anatomy (Terminologia Anatomica).
    const { make } = require('./es-make');
    const BASE = {
      'human body': 'Cuerpo humano', 'joints and ligaments': 'Articulaciones y ligamentos', 'ligaments, fasciae and joints': 'Ligamentos, fascias y articulaciones',
      'muscles and tendons': 'Músculos y tendones', 'muscular system': 'Sistema muscular', 'external abdominal oblique muscle': 'Músculo oblicuo externo del abdomen',
      'acetabular labrum': 'Labrum (rodete) acetabular', 'glenoid labrum': 'Labrum (rodete) glenoideo', 'acromioclavicular ligament': 'Ligamento acromioclavicular',
      'annular ligament of radius': 'Ligamento anular del radio', 'anterior cruciate ligament': 'Ligamento cruzado anterior', 'posterior cruciate ligament': 'Ligamento cruzado posterior',
      'anterior ligament of fibular head': 'Ligamento anterior de la cabeza del peroné', 'posterior ligament of fibular head': 'Ligamento posterior de la cabeza del peroné',
      'anterior longitudinal ligament': 'Ligamento longitudinal anterior', 'posterior longitudinal ligament': 'Ligamento longitudinal posterior',
      'anterior meniscotibial ligament (Lateral meniscus)': 'Ligamento meniscotibial anterior (menisco lateral)', 'anterior meniscotibial ligament (Medial meniscus)': 'Ligamento meniscotibial anterior (menisco medial)',
      'posterior meniscotibial ligament (Lateral meniscus)': 'Ligamento meniscotibial posterior (menisco lateral)', 'posterior meniscotibial ligament (Medial meniscus)': 'Ligamento meniscotibial posterior (menisco medial)',
      'anterior sacro-iliac ligament': 'Ligamento sacroilíaco anterior', 'posterior sacro-iliac ligament': 'Ligamento sacroilíaco posterior', 'interosseous sacro-iliac ligament': 'Ligamento sacroilíaco interóseo',
      'anterior sternoclavicular ligament': 'Ligamento esternoclavicular anterior', 'posterior sternoclavicular ligament': 'Ligamento esternoclavicular posterior',
      'anterior talocalcaneal ligament': 'Ligamento astragalocalcáneo (talocalcáneo) anterior', 'lateral talocalcaneal ligament': 'Ligamento astragalocalcáneo (talocalcáneo) lateral',
      'medial talocalcaneal ligament': 'Ligamento astragalocalcáneo (talocalcáneo) medial', 'posterior talocalcaneal ligament': 'Ligamento astragalocalcáneo (talocalcáneo) posterior',
      'talocalcaneal interosseous ligament': 'Ligamento astragalocalcáneo (talocalcáneo) interóseo', 'talonavicular ligament': 'Ligamento astragaloescafoideo (talonavicular)',
      'anterior tibiofibular ligament': 'Ligamento tibioperoneo (tibiofibular) anterior', 'posterior tibiofibular ligament': 'Ligamento tibioperoneo (tibiofibular) posterior',
      'transverse tibiofibular ligament': 'Ligamento tibioperoneo (tibiofibular) transverso', 'arcuate popliteal ligament': 'Ligamento poplíteo arqueado', 'oblique popliteal ligament': 'Ligamento poplíteo oblicuo',
      'articular capsule of acromioclavicular joint': 'Cápsula articular de la articulación acromioclavicular', 'articular capsule of elbow joint': 'Cápsula articular del codo',
      'articular capsule of glenohumeral joint': 'Cápsula articular del hombro (glenohumeral)', 'articular capsule of hip joint': 'Cápsula articular de la cadera (coxofemoral)',
      'articular capsule of interphalangeal joint of great toe': 'Cápsula articular interfalángica del dedo gordo', 'articular capsule of knee joint': 'Cápsula articular de la rodilla',
      'articular capsule of radiocarpal joint': 'Cápsula articular radiocarpiana (de la muñeca)', 'articular capsule of sternoclavicular joint': 'Cápsula articular esternoclavicular',
      'articular capsule of superior tibiofibular joint': 'Cápsula articular tibioperonea (tibiofibular) superior', 'articular capsule of temporomandibular joint': 'Cápsula articular temporomandibular',
      'articular capsules of distal interphalangeal joints': 'Cápsulas articulares interfalángicas distales de la mano', 'articular capsules of distal interphalangeal joints of foot': 'Cápsulas articulares interfalángicas distales del pie',
      'articular capsules of metacarpophalangeal joints': 'Cápsulas articulares metacarpofalángicas', 'articular capsules of metatarsophalangeal joints': 'Cápsulas articulares metatarsofalángicas',
      'articular capsules of proximal interphalangeal joints': 'Cápsulas articulares interfalángicas proximales de la mano', 'articular capsules of proximal interphalangeal joints of foot': 'Cápsulas articulares interfalángicas proximales del pie',
      'calcaneocuboid ligament': 'Ligamento calcaneocuboideo', 'calcaneonavicular ligament': 'Ligamento calcaneonavicular (calcaneoescafoideo)', 'plantar calcaneocuboid ligament': 'Ligamento calcaneocuboideo plantar',
      'collateral interphalangeal ligaments of foot': 'Ligamentos colaterales interfalángicos del pie', 'collateral interphalangeal ligaments of hand': 'Ligamentos colaterales interfalángicos de la mano',
      'collateral metacarpophalangeal ligaments': 'Ligamentos colaterales metacarpofalángicos', 'collateral metatarsophalangeal ligaments': 'Ligamentos colaterales metatarsofalángicos',
      'conoid ligament': 'Ligamento conoide', 'trapezoid ligament': 'Ligamento trapezoide', 'coracohumeral ligament': 'Ligamento coracohumeral', 'costotransverse ligament': 'Ligamento costotransverso',
      'cricopharyngeal ligament': 'Ligamento cricofaríngeo', 'cuneocuboid interosseous ligament': 'Ligamento cuneocuboideo interóseo', 'cuneometatarsal interosseous ligaments': 'Ligamentos cuneometatarsianos interóseos',
      'deep part of tibial collateral ligament': 'Porción profunda del ligamento colateral tibial (medial)', 'superficial part of tibial collateral ligament': 'Porción superficial del ligamento colateral tibial (medial)',
      'deep transverse metacarpal ligament': 'Ligamento metacarpiano transverso profundo', 'deep transverse metatarsal ligament': 'Ligamento metatarsiano transverso profundo',
      'superficial transverse metacarpal ligament': 'Ligamento metacarpiano transverso superficial', 'superficial transverse metatarsal ligament': 'Ligamento metatarsiano transverso superficial',
      'descending part of iliofemoral ligament': 'Porción descendente del ligamento iliofemoral', 'transverse part of iliofemoral ligament': 'Porción transversa del ligamento iliofemoral',
      'dorsal carpometacarpal ligaments': 'Ligamentos carpometacarpianos dorsales', 'dorsal cuneonavicular ligaments': 'Ligamentos cuneonaviculares dorsales', 'dorsal intercarpal ligaments': 'Ligamentos intercarpianos dorsales',
      'dorsal intercuneiform ligaments': 'Ligamentos intercuneiformes dorsales', 'dorsal metacarpal ligaments': 'Ligamentos metacarpianos dorsales', 'dorsal metatarsal ligaments': 'Ligamentos metatarsianos dorsales',
      'dorsal radiocarpal ligament': 'Ligamento radiocarpiano dorsal', 'dorsal scaphotriquetral ligament': 'Ligamento escafopiramidal dorsal', 'dorsal tarsometatarsal ligaments': 'Ligamentos tarsometatarsianos dorsales',
      'dorsal ulnocarpal ligament': 'Ligamento cubitocarpiano dorsal', 'external intercostal membrane': 'Membrana intercostal externa', 'internal intercostal membrane': 'Membrana intercostal interna',
      'fibular collateral ligament': 'Ligamento colateral peroneo (lateral)', 'frenula capsulae': 'Frenillos capsulares (frenula capsulae)', 'iliolumbar ligament': 'Ligamento iliolumbar',
      'inferior glenohumeral ligament': 'Ligamento glenohumeral inferior', 'middle glenohumeral ligament': 'Ligamento glenohumeral medio', 'superior glenohumeral ligament': 'Ligamento glenohumeral superior',
      'inferior pubic ligament': 'Ligamento púbico inferior (arqueado)', 'superior pubic ligament': 'Ligamento púbico superior', 'infrapatellar fat pad': 'Cuerpo adiposo infrarrotuliano (de Hoffa)',
      'inguinal ligament': 'Ligamento inguinal', 'interclavicular ligament': 'Ligamento interclavicular', 'intercornual ligament': 'Ligamento intercornual',
      'intercuneiform interosseous ligaments': 'Ligamentos intercuneiformes interóseos', 'interosseous membrane of forearm': 'Membrana interósea del antebrazo', 'interosseous membrane of leg': 'Membrana interósea de la pierna',
      'interosseous metacarpal ligaments': 'Ligamentos metacarpianos interóseos', 'metatarsal interosseous ligaments': 'Ligamentos metatarsianos interóseos', 'interpubic disc': 'Disco interpúbico',
      'intersesamoid ligament': 'Ligamento intersesamoideo', 'interspinous ligaments': 'Ligamentos interespinosos', 'intra-articular ligament of head of rib': 'Ligamento intraarticular de la cabeza de la costilla',
      'ischiofemoral ligament': 'Ligamento isquiofemoral', 'pubofemoral ligament': 'Ligamento pubofemoral', 'lateral meniscus': 'Menisco lateral (externo)', 'medial meniscus': 'Menisco medial (interno)',
      'lateral temporomandibular ligament': 'Ligamento lateral temporomandibular', 'lateral thyrohyoid ligament': 'Ligamento tirohioideo lateral', 'median thyrohyoid ligament': 'Ligamento tirohioideo medio',
      'median cricothyroid ligament': 'Ligamento cricotiroideo medio', 'ligament of head of femur': 'Ligamento de la cabeza del fémur (redondo)', 'ligamenta flava': 'Ligamentos amarillos',
      'long plantar ligament': 'Ligamento plantar largo', 'meniscopatellar ligament': 'Ligamento meniscorrotuliano', 'nuchal ligament': 'Ligamento nucal', 'obturator membrane': 'Membrana obturatriz',
      'palmar carpometacarpal ligaments': 'Ligamentos carpometacarpianos palmares', 'palmar interphalangeal ligaments': 'Ligamentos interfalángicos palmares', 'palmar metacarpal ligaments': 'Ligamentos metacarpianos palmares',
      'palmar radio-ulnar ligament': 'Ligamento radiocubital palmar', 'palmar scaphotriquetral ligament': 'Ligamento escafopiramidal palmar', 'pisotriquetral ligament': 'Ligamento pisopiramidal',
      'plantar cuneocuboid ligament': 'Ligamento cuneocuboideo plantar', 'plantar cuneonavicular ligaments': 'Ligamentos cuneonaviculares plantares', 'plantar intercuneiform ligaments': 'Ligamentos intercuneiformes plantares',
      'plantar interphalangeal ligaments': 'Ligamentos interfalángicos plantares', 'plantar metatarsal ligaments': 'Ligamentos metatarsianos plantares', 'plantar metatarsophalangeal ligaments': 'Ligamentos metatarsofalángicos plantares',
      'plantar tarsometatarsal ligaments': 'Ligamentos tarsometatarsianos plantares', 'popliteofibular ligament': 'Ligamento popliteoperoneo (popliteofibular)', 'posterior tibiotalar ligament': 'Ligamento tibioastragalino (tibiotalar) posterior',
      'tibiocalcaneal ligament': 'Ligamento tibiocalcáneo', 'tibionavicular ligament': 'Ligamento tibionavicular (tibioescafoideo)', 'pubic symphysis': 'Sínfisis del pubis', 'sacrococcygeal symphysis': 'Sínfisis (articulación) sacrococcígea',
      'quadrangular membrane': 'Membrana cuadrangular', 'radial collateral ligament': 'Ligamento colateral radial (del codo)', 'radial collateral ligament of wrist joint': 'Ligamento colateral radial de la muñeca',
      'ulnar collateral ligament': 'Ligamento colateral cubital (del codo)', 'ulnar collateral ligament of wrist joint': 'Ligamento colateral cubital de la muñeca', 'radiate carpal ligament': 'Ligamento radiado del carpo',
      'radiate ligament of head of rib': 'Ligamento radiado de la cabeza de la costilla', 'radioscaphocapitate ligament': 'Ligamento radioescafogrande (radioescafocapitado)',
      'sacrospinous ligament': 'Ligamento sacroespinoso (sacrociático menor)', 'sacrotuberous ligament': 'Ligamento sacrotuberoso (sacrociático mayor)', 'scaphotrapeziotrapezoidal ligament': 'Ligamento escafotrapeciotrapezoideo',
      'sphenomandibular ligament': 'Ligamento esfenomandibular', 'stylohyoid ligament': 'Ligamento estilohioideo', 'stylomandibular ligament': 'Ligamento estilomandibular', 'supraspinous ligament': 'Ligamento supraespinoso',
      'transverse acetabular ligament': 'Ligamento transverso del acetábulo', 'transverse humeral ligament': 'Ligamento humeral transverso', 'transverse ligament of knee': 'Ligamento transverso de la rodilla',
      'triquetrocapitate ligament': 'Ligamento piramidogrande (triquetrocapitado)', 'ulnocapitate ligament': 'Ligamento cubitogrande (ulnocapitado)', 'ulnolunate ligament': 'Ligamento cubitosemilunar',
      'ulnotriquetral ligament': 'Ligamento cubitopiramidal',
    };
    module.exports = make(BASE, [[/^nucleus pulposus ([CTLS]\d+)-([CTLS]\d+)$/, r => `Núcleo pulposo ${r[1]}-${r[2]}`]]);
  });

  define('es-cartilage', (module, require) => {
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
  });

  define('es-fascia', (module, require) => {
    // Spanish names for the "fasciae" layer of Z-Anatomy (Terminologia Anatomica).
    const { make } = require('./es-make');
    const BASE = {
      'human body': 'Cuerpo humano', 'muscular system': 'Sistema muscular', 'fasciae': 'Fascias',
      'antebrachial fascia': 'Fascia antebraquial', 'brachial fascia': 'Fascia braquial', 'clavipectoral fascia': 'Fascia clavipectoral', 'crural fascia': 'Fascia crural (de la pierna)',
      'deltoid fascia': 'Fascia deltoidea', 'diaphragmatic fascia': 'Fascia diafragmática', 'dorsal fascia of hand': 'Fascia dorsal de la mano', 'fascia lata': 'Fascia lata',
      'anterior layer of thoracolumbar fascia': 'Hoja anterior de la fascia toracolumbar', 'middle layer of thoracolumbar fascia': 'Hoja media de la fascia toracolumbar',
      'posterior layer of thoracolumbar fascia': 'Hoja posterior de la fascia toracolumbar', 'iliopsoas fascia': 'Fascia iliopsoas (fascia ilíaca)',
      'investing abdominal fascia': 'Fascia de revestimiento abdominal', 'masseteric fascia': 'Fascia maseterina', 'pectoral fascia': 'Fascia pectoral',
      'piriformis fascia': 'Fascia del piriforme', 'popliteal fascia': 'Fascia poplítea', 'superficial investing cervical fascia': 'Lámina superficial de la fascia cervical',
      'superficial layer of temporal fascia': 'Lámina superficial de la fascia temporal', 'tensor fasciae latae': 'Músculo tensor de la fascia lata', 'transversalis fascia': 'Fascia transversal',
    };
    module.exports = make(BASE);
  });

  const tables = ["es-bones","es-muscles","es-organs","es-arteries","es-veins","es-nerves","es-lymph","es-ligaments","es-cartilage","es-fascia"].map(id => modules[id]);
  const es = (name) => { for (const t of tables) { const v = t.toSpanish(name); if (v) return v; } return null; };
  (window.OAA_NAMES = window.OAA_NAMES || {}).es = es;
})();
