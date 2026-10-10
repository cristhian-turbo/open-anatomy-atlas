'use strict';
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
