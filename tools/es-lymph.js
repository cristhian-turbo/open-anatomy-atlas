'use strict';
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
