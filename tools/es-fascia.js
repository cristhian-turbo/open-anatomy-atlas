'use strict';
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
