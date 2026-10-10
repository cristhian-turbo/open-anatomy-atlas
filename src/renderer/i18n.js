// Interface language. English is the default and lives in index.html and in EN below;
// other languages override strings by key. The choice is kept in localStorage.
//
// Static text: mark an element with data-i18n="key" (text), data-i18n-title,
// data-i18n-placeholder or data-i18n-aria-label. Dynamic text: I18N.t('key', { n: 3 }).
// A string can be [one, other] to pick by vars.n.

(function () {
  'use strict';

  const LANGS = { en: 'English', es: 'Español' };
  const STORE = 'oaa.lang';

  const EN = {
    loadingAtlas: 'Loading {name} {version}: {got} of {total} MB',
    hiddenByYou: ['{n} structure hidden by you.', '{n} structures hidden by you.'],
    layerHint: 'Click a layer to show or hide it.',
    only: 'Only',
    showOnly: 'Show only {what}',
    expand: 'Expand',
    showOrHide: 'Show or hide',
    fmaId: 'Foundational Model of Anatomy ID {id}',
    demoPart: 'Demo mannequin part',
    parts: ['({n} part)', '({n} parts)'],
    wikiFull: 'Read the full article on Wikipedia',
    wikiGlossary: 'Definition from the Z-Anatomy glossary (text from Wikipedia, CC BY-SA).',
    wikiLooking: 'Looking up a description…',
    wikiNone: 'Wikipedia has no summary matching this structure’s name.',
    wikiRead: 'Read “{title}” on Wikipedia (text CC BY-SA)',
    wikiOffline: 'Connect to the internet to see a short description from Wikipedia.',
    searchNone: 'No structure with that name',
    quizTooFew: 'Show at least four named structures to start a quiz.',
    quizProgress: 'Question {i} of {total}, {score} correct so far',
    quizFind: 'Click the {name}',
    quizName: 'What is the highlighted structure?',
    quizRight: 'Correct, that is the {name}.',
    quizSeeResults: 'See results',
    quizNext: 'Next question',
    quizClickOn: 'Click directly on a structure.',
    quizWrongClick: 'That is the {clicked}. The {name} is now highlighted.',
    quizScore: '{score} of {asked} correct ({pct}%)',
    quizNothing: 'Nothing to review. Well done.',
    demoStatus: 'Demo mannequin: simplified shapes, not real anatomy.',
    meshes: ['{n} mesh', '{n} meshes'],
    mirrored: ' ({n} mirrored)',
    namedStructures: ['{n} named structure', '{n} named structures'],
    nonCommercial: '. Non-commercial use only',
    madeBy: 'Made by {lab}',
  };

  const ES = {
    // index.html
    searchPlaceholder: 'Buscar una estructura (pulsa /)', searchLabel: 'Buscar una estructura',
    explore: 'Explorar', quiz: 'Cuestionario', language: 'Idioma',
    front: 'Frente', back: 'Espalda', left: 'Izquierda', right: 'Derecha',
    frontTitle: 'Vista frontal (1)', backTitle: 'Vista posterior (2)',
    leftTitle: 'Lado izquierdo del paciente (3)', rightTitle: 'Lado derecho del paciente (4)',
    reset: 'Restablecer', resetTitle: 'Mostrar todo y restablecer la vista (A)',
    xrayTitle: 'Rayos X: ver a través de todo excepto la selección (X)',
    saveImage: 'Guardar imagen', saveImageTitle: 'Guardar una imagen de la vista actual',
    atlasData: 'Datos del atlas', about: 'Acerca de', aboutTitle: 'Acerca de este atlas y quién lo hizo',
    shortcutsTitle: 'Atajos de teclado (?)', shortcuts: 'Atajos de teclado',
    tabLayers: 'Capas', tabTree: 'Estructuras', tabSections: 'Cortes',
    showMirrored: 'Mostrar copias reflejadas', showHidden: 'Mostrar estructuras ocultas',
    byRegion: 'Por región', byType: 'Por tipo',
    sectionsNote: 'Corta el cuerpo con un plano para estudiar cortes transversales, como en las imágenes de TC y RM.',
    noCut: 'Sin corte', axial: 'Axial (transversal)', coronal: 'Coronal (frente / espalda)', sagittal: 'Sagital (izquierda / derecha)',
    position: 'Posición', keepOtherSide: 'Conservar el otro lado',
    viewportLabel: 'Vista 3D de anatomía. Arrastra para girar, arrastra con el botón derecho para desplazar, usa la rueda para acercar, haz clic para identificar.',
    loading: 'Cargando el atlas',
    stageHint: 'Arrastra para girar, arrastra con el botón derecho o con Mayús para desplazar, usa la rueda para acercar, haz clic para identificar y doble clic para enfocar',
    emptyTitle: 'Haz clic en cualquier estructura para identificarla',
    emptyText: 'O búscala por su nombre. Usa Capas para retirar planos del cuerpo y Cortes para seccionarlo.',
    locationLabel: 'Ubicación en el cuerpo',
    focus: 'Enfocar', focusTitle: 'Acercar a la estructura (F)',
    isolate: 'Aislar', isolateTitle: 'Ocultar todo lo demás (I)',
    hide: 'Ocultar', hideTitle: 'Ocultarla (H)',
    readMore: 'Leer más en Wikipedia',
    testYourself: 'Ponte a prueba',
    quizSetupNote: 'Las preguntas salen de las estructuras visibles, así que usa Capas o Aislar para elegir antes una región.',
    questionType: 'Tipo de pregunta',
    findIt: 'Encuéntrala: haz clic en la estructura nombrada',
    nameIt: 'Nómbrala: elige el nombre de la estructura resaltada',
    questions: 'Preguntas', startQuiz: 'Empezar el cuestionario',
    skip: 'Saltar', endQuiz: 'Terminar el cuestionario',
    toReview: 'Estructuras para repasar (haz clic en una para estudiarla):', tryAgain: 'Intentar de nuevo',
    getFull: 'Obtener el atlas anatómico completo', close: 'Cerrar',
    findShortcut: 'Buscar una estructura', focusShortcut: 'Enfocar la selección', isolateShortcut: 'Aislar la selección',
    hideShortcut: 'Ocultar la selección', resetShortcut: 'Mostrar todo y restablecer la vista', xrayShortcut: 'Activar o desactivar rayos X',
    viewsShortcut: 'Vistas frontal, posterior, izquierda y derecha', clearShortcut: 'Quitar la selección',

    // app.js
    loadingAtlas: 'Cargando {name} {version}: {got} de {total} MB',
    hiddenByYou: ['Ocultaste {n} estructura.', 'Ocultaste {n} estructuras.'],
    layerHint: 'Haz clic en una capa para mostrarla u ocultarla.',
    only: 'Solo', showOnly: 'Mostrar solo {what}', expand: 'Expandir', showOrHide: 'Mostrar u ocultar',
    fmaId: 'ID en Foundational Model of Anatomy: {id}', demoPart: 'Pieza del maniquí de demostración',
    parts: ['({n} parte)', '({n} partes)'],
    wikiFull: 'Leer el artículo completo en Wikipedia (en inglés)',
    wikiGlossary: 'Definición del glosario de Z-Anatomy (texto de Wikipedia en inglés, CC BY-SA).',
    wikiLooking: 'Buscando una descripción…',
    wikiNone: 'Wikipedia no tiene un resumen para esta estructura.',
    wikiRead: 'Leer “{title}” en Wikipedia (en inglés, texto CC BY-SA)',
    wikiOffline: 'Conéctate a internet para ver una breve descripción de Wikipedia.',
    searchNone: 'Ninguna estructura con ese nombre',
    quizTooFew: 'Muestra al menos cuatro estructuras con nombre para empezar un cuestionario.',
    quizProgress: 'Pregunta {i} de {total}, {score} correctas hasta ahora',
    quizFind: 'Haz clic en: {name}', quizName: '¿Cuál es la estructura resaltada?',
    quizRight: 'Correcto, es: {name}.', quizSeeResults: 'Ver resultados', quizNext: 'Siguiente pregunta',
    quizClickOn: 'Haz clic directamente sobre una estructura.',
    quizWrongClick: 'Eso es: {clicked}. Ahora se resalta: {name}.',
    quizScore: '{score} de {asked} correctas ({pct} %)', quizNothing: 'Nada que repasar. ¡Muy bien!',
    demoStatus: 'Maniquí de demostración: formas simplificadas, no es anatomía real.',
    meshes: ['{n} malla', '{n} mallas'], mirrored: ' ({n} reflejadas)',
    namedStructures: ['{n} estructura con nombre', '{n} estructuras con nombre'],
    nonCommercial: '. Solo para uso no comercial', madeBy: 'Hecho por {lab}',

    // layer names (atlas.js categories)
    cat_bone: 'Huesos y dientes', cat_cartilage: 'Cartílagos y discos', cat_ligament: 'Ligamentos y articulaciones',
    cat_muscle: 'Músculos y tendones', cat_artery: 'Arterias', cat_vein: 'Venas', cat_nervous: 'Sistema nervioso',
    cat_organ: 'Órganos y vísceras', cat_skin: 'Piel', cat_fascia: 'Fascias', cat_lymph: 'Sistema linfático',
  };

  const TABLES = { en: EN, es: ES };
  let lang = 'en';
  try { const s = localStorage.getItem(STORE); if (LANGS[s]) lang = s; } catch (_) { /* storage blocked */ }

  function fill(s, vars) {
    if (Array.isArray(s)) s = vars && vars.n === 1 ? s[0] : s[1];
    return s.replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? (typeof vars[k] === 'number' ? vars[k].toLocaleString(lang) : vars[k]) : m));
  }

  // English for keys only used in index.html is read from the page itself.
  function t(key, vars) {
    const s = (TABLES[lang] && TABLES[lang][key]) || EN[key];
    return s === undefined ? key : fill(s, vars);
  }

  // Structure names come from the atlas in English; translate when a table has them.
  function name(en) {
    if (lang === 'en') return en;
    const f = window.OAA_NAMES && window.OAA_NAMES[lang];
    return (f && f(en)) || en;
  }

  const SIDE = { es: { left: 'lado izquierdo', right: 'lado derecho' } };
  function side(s) { return (SIDE[lang] && SIDE[lang][s]) || s; }

  function category(key, label) { return lang === 'en' ? label : (TABLES[lang]['cat_' + key] || label); }

  const ATTRS = [['i18n', null], ['i18nTitle', 'title'], ['i18nPlaceholder', 'placeholder'], ['i18nAriaLabel', 'aria-label']];
  function apply(root) {
    if (lang === 'en') return;
    for (const [data, attr] of ATTRS) {
      const sel = '[data-' + data.replace(/[A-Z]/g, c => '-' + c.toLowerCase()) + ']';
      for (const n of root.querySelectorAll(sel)) {
        const s = TABLES[lang][n.dataset[data]];
        if (s === undefined) continue;
        if (attr) n.setAttribute(attr, s);
        else {
          // Keep child elements (checkbox inputs inside labels): replace the last text node only.
          const txt = [...n.childNodes].reverse().find(c => c.nodeType === 3 && c.textContent.trim());
          if (txt && n.children.length) txt.textContent = ' ' + s;
          else n.textContent = s;
        }
      }
    }
    document.documentElement.lang = lang;
  }

  function mountSwitcher(sel) {
    for (const [k, v] of Object.entries(LANGS)) {
      const o = document.createElement('option');
      o.value = k; o.textContent = v; o.selected = k === lang;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => {
      try { localStorage.setItem(STORE, sel.value); } catch (_) { /* storage blocked */ }
      location.reload(); // labels, tree and search index are all rebuilt from scratch
    });
  }

  window.I18N = { get lang() { return lang; }, t, name, side, category, apply, mountSwitcher };

  // Loaded at the end of <body>, before app.js, so the page is already parsed.
  apply(document);
  const sel = document.getElementById('langSelect');
  if (sel) mountSwitcher(sel);
})();
