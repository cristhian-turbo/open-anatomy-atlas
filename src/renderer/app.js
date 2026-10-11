// Open Anatomy Atlas - UI controller.
/* global AtlasRenderer, Atlas, buildProceduralAtlas, wikiSummary */
(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const host = window.atlasHost || null;
  const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/></svg>';
  const el = (tag, attrs = {}, kids = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const c of [].concat(kids)) if (c) n.appendChild(c);
    return n;
  };
  const cssColor = (rgb) => `rgb(${rgb.map(v => Math.round(v * 255)).join(',')})`;
  const plural = (n, w) => `${n.toLocaleString()} ${n === 1 ? w : (w.endsWith('l') ? w + 'es' : w + 's')}`;

  // Layers that cover everything else start switched off.
  const HIDDEN_BY_DEFAULT = new Set(['skin', 'fascia']);
  let renderer = null;
  let atlas = null;
  let catOn = {};
  let userHidden = new Uint8Array(0);
  let selection = -1;
  let treeKind = 'partof';
  let mode = 'explore';
  const treeRows = new Map();

  // ======================= loading =======================

  function showLoading(text, frac) {
    const box = $('#loading');
    box.hidden = false;
    $('#loadingText').textContent = text;
    $('#loadingBar').style.width = frac == null ? '0%' : `${Math.round(frac * 100)}%`;
  }

  // Reads a response body while reporting bytes received.
  async function readBody(res, onBytes) {
    if (!res.body || !res.body.getReader) return new Uint8Array(await res.arrayBuffer());
    const reader = res.body.getReader();
    const chunks = [];
    let n = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); n += value.length; onBytes(value.length);
    }
    const out = new Uint8Array(n);
    let o = 0;
    for (const c of chunks) { out.set(c, o); o += c.length; }
    return out;
  }

  async function fetchAtlas(base) {
    const r = await fetch(base + 'index.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('No atlas at ' + base);
    const index = await r.json();
    // Large atlases on static hosting are split into parts (GitHub limits single files).
    const parts = index.parts || [{ file: 'meshes.bin', size: index.buffers.indices[0] + index.buffers.indices[1] }];
    const total = parts.reduce((t, p) => t + p.size, 0);
    let got = 0;
    const tick = (k) => { got += k; showLoading(`Cargando ${index.name}: ${(got / 1048576).toFixed(0)} de ${(total / 1048576).toFixed(0)} MB`, got / total); };
    tick(0);
    const pieces = await Promise.all(parts.map(async (p) => {
      const res = await fetch(base + p.file, { cache: 'no-cache' });
      if (!res.ok) throw new Error('Atlas mesh file is missing: ' + p.file);
      return readBody(res, tick);
    }));
    let bin;
    if (pieces.length === 1) bin = pieces[0].buffer.byteLength === pieces[0].length ? pieces[0].buffer : pieces[0].slice().buffer;
    else {
      const all = new Uint8Array(pieces.reduce((t, x) => t + x.length, 0));
      let o = 0;
      for (const x of pieces) { all.set(x, o); o += x.length; }
      bin = all.buffer;
    }
    let glossary = null;
    try { const g = await fetch(base + 'glossary.json', { cache: 'no-cache' }); if (g.ok) glossary = await g.json(); } catch (_) { /* optional */ }
    return { index, bin, glossary };
  }

  // ---- static hosting (GitHub Pages): data/atlases.json lists the published atlases ----
  let site = null;
  let siteAtlas = null;
  async function loadSiteManifest() {
    if (host || !location.protocol.startsWith('http')) return null;
    try { const r = await fetch('data/atlases.json', { cache: 'no-cache' }); if (r.ok) return r.json(); } catch (_) { /* not a static build */ }
    return null;
  }
  function pickSiteAtlas() {
    const ids = site.atlases.map(a => a.id);
    const fromHash = (/[#&]atlas=([\w-]+)/.exec(location.hash) || [])[1];
    if (ids.includes(fromHash)) return fromHash;
    let saved = null;
    try { saved = localStorage.getItem('oaa.atlas'); } catch (_) { /* storage blocked */ }
    if (ids.includes(saved)) return saved;
    return ids.includes(site.default) ? site.default : ids[0];
  }
  async function loadSiteAtlas(id) {
    siteAtlas = id;
    try { localStorage.setItem('oaa.atlas', id); } catch (_) { /* storage blocked */ }
    if (location.hash !== '#atlas=' + id) history.replaceState(null, '', '#atlas=' + id);
    return fetchAtlas(`data/${id}/`);
  }

  // ---- body systems on the static site: the default atlas (bones) loads first;
  // every other system is a separate atlas merged in when its layer is switched on.
  // Merging only appends, so element and concept numbers already in use stay valid.
  let loadedSystems = [];
  const loadingSystems = new Set();
  function mergeAtlases(list) {
    if (list.length === 1) return { index: list[0].index, bin: list[0].bin };
    let nv = 0, ni = 0;
    for (const { index: x } of list) { nv += x.buffers.positions[1] / 4; ni += x.buffers.indices[1] / 4; }
    const nn = nv; // 3 normal components per vertex, like positions
    const nBytes = Math.ceil(nn * 2 / 4) * 4;
    const buf = new ArrayBuffer(nv * 4 + nBytes + ni * 4);
    const P = new Float32Array(buf, 0, nv), N = new Int16Array(buf, nv * 4, nn), I = new Uint32Array(buf, nv * 4 + nBytes, ni);
    const first = list[0].index;
    const out = { ...first, categories: {}, elements: [], concepts: [], roots: { partof: [], isa: [] },
      bbox: [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity], counts: { elements: 0, concepts: 0, triangles: 0, vertices: 0, mirrored: 0 } };
    let vo = 0, io = 0, co = 0;
    for (const { index: x, bin } of list) {
      const [po, pl] = x.buffers.positions, [nO] = x.buffers.normals, [iO, il] = x.buffers.indices;
      P.set(new Float32Array(bin, po, pl / 4), vo * 3);
      N.set(new Int16Array(bin, nO, pl / 4), vo * 3); // source normals may carry 2 bytes of padding
      const src = new Uint32Array(bin, iO, il / 4), base = vo;
      for (let k = 0; k < src.length; k++) I[io + k] = src[k] + base;
      Object.assign(out.categories, x.categories);
      const eo = out.elements.length, cOff = co, io0 = io;
      for (const e of x.elements) out.elements.push({ ...e, o: e.o + io0, c: e.c + cOff });
      const sh = l => (l || []).map(v => v + cOff);
      for (const c of x.concepts) out.concepts.push({ ...c, pp: sh(c.pp), pc: sh(c.pc), ip: sh(c.ip), ic: sh(c.ic), el: (c.el || []).map(v => v + eo) });
      out.roots.partof.push(...sh(x.roots.partof)); out.roots.isa.push(...sh(x.roots.isa));
      for (let a = 0; a < 3; a++) { out.bbox[a] = Math.min(out.bbox[a], x.bbox[a]); out.bbox[a + 3] = Math.max(out.bbox[a + 3], x.bbox[a + 3]); }
      for (const k of Object.keys(out.counts)) out.counts[k] += (x.counts && x.counts[k]) || 0;
      vo += pl / 12; io += il / 4; co += x.concepts.length;
    }
    out.buffers = { positions: [0, nv * 4], normals: [nv * 4, nn * 2], indices: [nv * 4 + nBytes, ni * 4] };
    delete out.parts;
    return { index: out, bin: buf };
  }
  async function addSystem(id) {
    if (loadingSystems.has(id) || loadedSystems.some(s => s.id === id)) return;
    loadingSystems.add(id);
    buildLayers();
    try {
      const data = await fetchAtlas(`data/${id}/`);
      loadedSystems.push({ id, ...data });
      const merged = mergeAtlases(loadedSystems);
      const cam = { ...renderer.camera, target: renderer.camera.target.slice() };
      const sel = selection, oldHidden = userHidden, oldSelected = renderer.selected;
      atlas = new Atlas(merged.index);
      renderer.setAtlas(merged.index, merged.bin);
      Object.assign(renderer.camera, cam); renderer.anim = null;
      userHidden = new Uint8Array(atlas.elements.length); userHidden.set(oldHidden);
      renderer.selected.set(oldSelected);
      for (const k of Object.keys(data.index.categories)) catOn[k] = true;
      colorize();
      selection = sel;
      buildLayers(); buildTree(); applyVisibility(); updateStatus();
      if (sel < 0) showInspector();
    } catch (e) {
      console.error(e);
      showLoading('No se pudo cargar el sistema: ' + e.message, null);
      setTimeout(() => { $('#loading').hidden = true; }, 4000);
    } finally {
      loadingSystems.delete(id);
      $('#loading').hidden = true;
      buildLayers();
    }
  }

  async function loadBest() {
    site = await loadSiteManifest();
    if (site) {
      try {
        const id = site.atlases.some(a => a.id === site.default) ? site.default : site.atlases[0].id;
        const data = await fetchAtlas(`data/${id}/`);
        siteAtlas = id;
        loadedSystems = [{ id, ...data }];
            return data;
      } catch (e) { console.error(e); }
    }
    const bases = host ? [host.dataBase] : (location.protocol.startsWith('http') ? ['data/'] : []);
    for (const base of bases) {
      try { return await fetchAtlas(base); } catch (_) { /* fall through to demo */ }
    }
    return buildProceduralAtlas();
  }

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }

  // Per-system wording on the static site: the bones strings in index.html are the
  // defaults; other systems override a few labels from data/atlases.json (`ui`).
  let uiDefaults = null;
  function applySystemUi() {
    const tab = $('.tab[data-tab="tree"]'), prompt = $('#inspectEmpty h2'), search = $('#search');
    if (!uiDefaults) uiDefaults = { tab: tab.textContent, prompt: prompt && prompt.textContent, search: search.placeholder, title: document.title };
    const a = site && site.atlases.find(x => x.id === siteAtlas), u = (a && a.ui) || uiDefaults;
    tab.textContent = u.tab; if (prompt) prompt.textContent = u.prompt; search.placeholder = u.search; search.setAttribute('aria-label', u.search);
    document.title = u.title; $('.brand span') && ($('.brand span').textContent = u.title);
    $('#btnData').hidden = true; // systems are switched on from the layer list
  }

  function colorize() {
    const fallback = { color: [0.80, 0.50, 0.52] };
    atlas.elements.forEach((e, i) => {
      const base = (atlas.categories[e.t] || atlas.categories.organ || fallback).color;
      const spread = e.t === 'artery' || e.t === 'vein' || e.t === 'nervous' ? 0.06 : 0.13;
      const f = 1 - spread + 2 * spread * hash(e.k);
      renderer.setColor(i, base.map(v => Math.min(1, v * f)));
    });
    renderer.requestRender();
  }

  function useAtlas(data) {
    if (mode === 'quiz') quizReset();
    applySystemUi();
    atlas = new Atlas(data.index);
    renderer.setAtlas(data.index, data.bin);
    userHidden = new Uint8Array(atlas.elements.length);
    catOn = {};
    const solo = Object.keys(atlas.categories).length === 1; // a one-layer atlas (e.g. fascias) shows its layer
    for (const k of Object.keys(atlas.categories)) catOn[k] = solo || !HIDDEN_BY_DEFAULT.has(k);
    colorize();
    selection = -1;
    renderer.selected.fill(0);
    $('#mirrorToggleRow').hidden = !atlas.elements.some(e => e.m);
    $('#mirrorToggle').checked = true;
    if (data.glossary) atlas.glossary = data.glossary;
    buildLayers();
    buildTree();
    applyVisibility();
    showInspector();
    setPlane('none');
    updateStatus();
    buildLandmarks();
    $('#loading').hidden = true;
  }

  // ======================= visibility =======================

  function applyVisibility() {
    const v = renderer.visible;
    let hidden = 0;
    const mirrorsOn = $('#mirrorToggle').checked;
    atlas.elements.forEach((e, i) => {
      const on = catOn[e.t] !== false && (mirrorsOn || !e.m);
      v[i] = on && !userHidden[i] ? 1 : 0;
      if (on && userHidden[i]) hidden++;
    });
    renderer.requestRender();
    $('#hiddenNote').textContent = hidden ? `Ocultaste ${plural(hidden, 'estructura')}.` : 'Haz clic en una capa para mostrarla u ocultarla.';
    $('#btnShowHidden').hidden = !hidden;
    $('#qbShowAll').hidden = !hidden;
    refreshEyes();
    $$('#layerList input[data-cat]').forEach(cb => { cb.checked = catOn[cb.dataset.cat] !== false; });
  }

  function ensureVisible(els) {
    for (const e of els) { userHidden[e] = 0; catOn[atlas.elements[e].t] = true; }
  }

  function buildLayers() {
    const list = $('#layerList');
    list.innerHTML = '';
    for (const [k, cat] of Object.entries(atlas.categories)) {
      const n = atlas.catCount[k] || 0;
      if (!n) continue;
      const id = 'layer-' + k;
      const cb = el('input', { type: 'checkbox', class: 'toggle', id, 'data-cat': k });
      cb.checked = catOn[k] !== false;
      cb.addEventListener('change', () => { catOn[k] = cb.checked; applyVisibility(); });
      const solo = el('button', { class: 'solo', text: 'Solo', title: `Mostrar solo ${cat.label.toLowerCase()}`, onclick: () => {
        for (const c of Object.keys(catOn)) catOn[c] = c === k;
        applyVisibility();
      } });
      const sw = el('span', { class: 'swatch' }); sw.style.background = cssColor(cat.color);
      list.appendChild(el('li', {}, [cb, el('label', { for: id, class: 'name' }, [sw, document.createTextNode(' ' + cat.label)]), el('span', { class: 'count', text: n.toLocaleString() }), solo]));
    }
    // Systems not downloaded yet: switching one on downloads it and adds it to the view.
    if (site) for (const a of site.atlases) {
      if (loadedSystems.some(s => s.id === a.id)) continue;
      const busy = loadingSystems.has(a.id);
      const id = 'sys-' + a.id;
      const cb = el('input', { type: 'checkbox', class: 'toggle', id });
      cb.checked = busy; cb.disabled = busy;
      cb.addEventListener('change', () => { if (cb.checked) addSystem(a.id); });
      list.appendChild(el('li', { class: 'pending' }, [cb, el('label', { for: id, class: 'name', text: a.title }),
        el('span', { class: 'size', text: busy ? 'cargando…' : a.size })]));
    }
  }

  // ======================= tree =======================

  function buildTree() {
    const ul = $('#tree');
    ul.innerHTML = '';
    treeRows.clear();
    const roots = atlas.roots(treeKind);
    for (const r of roots) ul.appendChild(treeNode(r));
    if (roots.length <= 2) ul.querySelectorAll(':scope > li').forEach(li => expandNode(li));
    markTree();
  }

  function treeNode(ci) {
    const c = atlas.concepts[ci];
    const kids = atlas.children(ci, treeKind);
    const li = el('li', { role: 'treeitem', 'data-ci': ci });
    const caret = el('button', { class: 'caret' + (kids.length ? '' : ' leaf'), text: '▸', 'aria-label': 'Expandir', tabindex: kids.length ? '0' : '-1' });
    const eye = el('button', { class: 'eye', html: EYE, title: 'Mostrar u ocultar' });
    const label = el('button', { class: 'label', text: atlas.displayName(ci), title: atlas.displayName(ci) });
    const row = el('div', { class: 'row' }, [caret, eye, label, el('span', { class: 'cnt', text: c.el.length > 1 ? c.el.length : '' })]);
    li.appendChild(row);
    if (kids.length) {
      li.setAttribute('aria-expanded', 'false');
      caret.addEventListener('click', () => (li.getAttribute('aria-expanded') === 'true' ? collapseNode(li) : expandNode(li)));
    }
    eye.addEventListener('click', () => toggleConcept(ci));
    label.addEventListener('click', () => select(ci, { focus: true, reveal: false }));
    if (!treeRows.has(ci)) treeRows.set(ci, []);
    treeRows.get(ci).push({ row, eye });
    updateEye(ci, eye);
    return li;
  }

  function expandNode(li) {
    const ci = +li.dataset.ci;
    if (!li.querySelector(':scope > ul')) {
      const ul = el('ul', { role: 'group' });
      for (const k of atlas.children(ci, treeKind)) ul.appendChild(treeNode(k));
      li.appendChild(ul);
      markTree();
    }
    li.querySelector(':scope > ul').hidden = false;
    li.setAttribute('aria-expanded', 'true');
    li.querySelector(':scope > .row .caret').textContent = '▾';
  }
  function collapseNode(li) {
    const ul = li.querySelector(':scope > ul');
    if (ul) ul.hidden = true;
    li.setAttribute('aria-expanded', 'false');
    li.querySelector(':scope > .row .caret').textContent = '▸';
  }

  function updateEye(ci, eye) {
    const els = atlas.concepts[ci].el;
    let vis = 0;
    for (const e of els) vis += renderer.visible[e];
    eye.classList.toggle('off', vis === 0);
    eye.classList.toggle('part', vis > 0 && vis < els.length);
  }
  function refreshEyes() { for (const [ci, rows] of treeRows) for (const r of rows) updateEye(ci, r.eye); }

  function toggleConcept(ci) {
    const els = atlas.concepts[ci].el;
    const anyVisible = els.some(e => renderer.visible[e]);
    if (anyVisible) for (const e of els) userHidden[e] = 1;
    else ensureVisible(els);
    applyVisibility();
  }

  function markTree() {
    $$('#tree .row.sel').forEach(r => r.classList.remove('sel'));
    const rows = treeRows.get(selection);
    if (rows) rows.forEach(r => r.row.classList.add('sel'));
  }

  function revealInTree(ci) {
    const path = atlas.breadcrumb(ci, treeKind);
    let scope = $('#tree');
    let last = null;
    for (const p of path) {
      const li = scope.querySelector(`:scope > li[data-ci="${p}"]`);
      if (!li) break;
      last = li;
      if (p !== ci && atlas.children(p, treeKind).length) { expandNode(li); scope = li.querySelector(':scope > ul'); }
    }
    markTree();
    if (last && !$('[data-pane="tree"]').hidden) last.querySelector('.row').scrollIntoView({ block: 'nearest' });
  }

  // ======================= selection & inspector =======================

  function select(ci, { focus = false, reveal = true } = {}) {
    if (ci < 0 || ci == null) { clearSelection(); return; }
    selection = ci;
    $('#hoverTip').hidden = true;
    const els = atlas.concepts[ci].el;
    if (els.some(e => !renderer.visible[e])) { ensureVisible(els); applyVisibility(); }
    renderer.selected.fill(0);
    for (const e of els) renderer.selected[e] = 1;
    renderer.requestRender();
    showInspector();
    if (reveal) revealInTree(ci); else markTree();
    if (focus) focusSelection();
  }

  function clearSelection() {
    selection = -1;
    renderer.selected.fill(0);
    renderer.requestRender();
    markTree();
    showInspector();
  }

  function focusSelection() {
    const els = selection >= 0 ? atlas.concepts[selection].el.filter(e => renderer.visible[e]) : [];
    if (!els.length) { renderer.frame(atlas.index.bbox); return; }
    frameWithContext(els, 1.4);
  }

  function showInspector() {
    $('#qbHide').hidden = !(mode === 'explore' && selection >= 0);
    const quizOn = mode === 'quiz';
    $('#quiz').hidden = !quizOn;
    const has = !quizOn && selection >= 0;
    $('#inspectEmpty').hidden = quizOn || has;
    $('#tag').hidden = !has;
    $('#wiki').hidden = !has;
    $('#pin').hidden = !has;
    if (!has) return;

    const ci = selection;
    const c = atlas.concepts[ci];
    $('#tagName').textContent = atlas.displayName(ci);
    const fma = atlas.fmaLabel(ci);
    $('#tagId').textContent = fma ? `ID en Foundational Model of Anatomy: ${fma.slice(4)}` : (atlas.isDemo ? 'Demo mannequin part' : '');
    $('#tagId').hidden = !$('#tagId').textContent;
    const gl = atlas.glossaryOf(ci);
    $('#tagLatin').textContent = gl && gl.la ? gl.la : '';
    $('#tagLatin').hidden = !(gl && gl.la);
    const note = atlas.mirrorNote(ci);
    $('#tagNote').textContent = note || '';
    $('#tagNote').hidden = !note;
    const cat = atlas.categoryOf(ci);
    $('#tagSwatch').style.background = cssColor(atlas.categories[cat].color);
    $('#tagCat').textContent = atlas.categories[cat].label;
    $('#tagCount').textContent = c.el.length > 1 ? `(${plural(c.el.length, 'parte')})` : '';
    const path = $('#tagPath');
    path.innerHTML = '';
    for (const p of atlas.breadcrumb(ci, 'partof')) {
      path.appendChild(el('li', {}, el('button', { text: atlas.displayName(p), onclick: () => select(p, { focus: true }) })));
    }
    $('#pin span').textContent = atlas.displayName(ci);
    loadWiki(ci);
    positionPin();
  }

  let wikiToken = 0;
  async function loadWiki(ci) {
    const tok = ++wikiToken;
    const text = $('#wikiText'), link = $('#wikiLink'), img = $('#wikiImg'), src = $('#wikiSource');
    img.hidden = true; link.hidden = true; src.textContent = '';
    const gl = atlas.glossaryOf(ci);
    if (gl && gl.def && gl.def.text) {
      // Offline definition shipped with Z-Anatomy (from Wikipedia, CC BY-SA).
      text.textContent = gl.def.text;
      if (gl.def.url) { link.href = gl.def.url; link.textContent = 'Leer el artículo completo en Wikipedia'; link.hidden = false; }
      src.textContent = 'Definición del glosario de Z-Anatomy (texto de Wikipedia, CC BY-SA).';
      return;
    }
    text.textContent = 'Buscando una descripción\u2026';
    try {
      const s = await wikiSummary(atlas.concepts[ci].name, atlas.concepts[ci].en);
      if (tok !== wikiToken) return;
      if (!s) { text.textContent = 'Wikipedia no tiene un resumen para esta estructura.'; return; }
      text.textContent = s.extract;
      link.href = s.url;
      link.textContent = `Leer \u201C${s.title}\u201D en Wikipedia (texto CC BY-SA)`;
      link.hidden = false;
      if (s.thumb) { img.src = s.thumb; img.alt = s.title; img.hidden = false; }
    } catch (_) {
      if (tok === wikiToken) text.textContent = 'Conéctate a internet para ver una descripción de Wikipedia.';
    }
  }

  function positionPin() {
    const pin = $('#pin');
    if (selection < 0 || mode !== 'explore') { pin.hidden = true; return; }
    const els = atlas.concepts[selection].el.filter(e => renderer.visible[e]);
    const b = els.length ? atlas.bbox(els) : null;
    const p = b && renderer.project([(b[0] + b[3]) / 2, b[4], (b[2] + b[5]) / 2]);
    const stage = $('.stage');
    if (!p || p[0] < 0 || p[1] < 0 || p[0] > stage.clientWidth || p[1] > stage.clientHeight) { pin.hidden = true; return; }
    pin.hidden = false;
    pin.style.left = p[0] + 'px';
    pin.style.top = p[1] + 'px';
  }

  // ======================= landmark pins =======================
  // Bony landmarks (window.LANDMARKS): a dot on a point of a bone mesh. A pin is
  // shown only while its bone is visible and that point is not covered by
  // anything else; tapping it shows the name and a short description.

  let pins = [], pinsOn = true, pinOpen = null, occTimer = 0, occOk = new Set();
  function buildLandmarks() {
    const layer = $('#lmLayer');
    layer.textContent = '';
    pinOpen = null; $('#lmCard').hidden = true;
    const byKey = new Map(atlas.elements.map((e, i) => [e.k, i]));
    pins = (window.LANDMARKS || []).filter(l => byKey.has(l.k)).map(l => {
      const b = el('button', { type: 'button', class: 'lm', 'aria-label': l.name, title: l.name });
      b.hidden = true;
      const pin = { ...l, e: byKey.get(l.k), b, xy: null };
      b.addEventListener('click', (ev) => { ev.stopPropagation(); openPin(pin); });
      b.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      layer.append(b);
      return pin;
    });
    occOk = new Set();
    $('#qbPins').hidden = !pins.length;
    scheduleOcclusion();
  }
  function openPin(pin) {
    if (pinOpen) pinOpen.b.classList.remove('on');
    pinOpen = pin;
    pin.b.classList.add('on');
    const card = $('#lmCard');
    card.querySelector('h3').textContent = pin.name;
    const ci = atlas.elements[pin.e].c;
    card.querySelector('.lm-bone').textContent = atlas.displayName(ci);
    card.querySelector('.lm-desc').textContent = pin.desc;
    card.hidden = false;
  }
  function closePin() {
    if (pinOpen) pinOpen.b.classList.remove('on');
    pinOpen = null;
    $('#lmCard').hidden = true;
  }
  const pinsActive = () => pinsOn && mode === 'explore' && pins.length;
  function positionLandmarks(settled = false) {
    if (!pins.length) return;
    const stage = $('.stage'), W = stage.clientWidth, H = stage.clientHeight;
    for (const p of pins) {
      const show = pinsActive() && renderer.visible[p.e];
      p.xy = show ? renderer.project(p.p) : null;
      const ok = p.xy && p.xy[0] >= 0 && p.xy[1] >= 0 && p.xy[0] <= W && p.xy[1] <= H;
      const vis = !!(ok && occOk.has(p.id));
      p.b.hidden = !vis;
      if (ok) p.b.style.transform = `translate(${p.xy[0]}px, ${p.xy[1]}px)`;
      if (!vis && pinOpen === p) closePin();
    }
    if (!settled) scheduleOcclusion();
  }
  // Which pins are in front: one ID render, once the view has settled.
  function scheduleOcclusion() {
    clearTimeout(occTimer);
    occTimer = setTimeout(() => {
      if (!pinsActive()) return;
      const cand = pins.filter(p => renderer.visible[p.e]);
      const front = renderer.visibleMask(cand.map(p => p.p));
      const next = new Set();
      cand.forEach((p, i) => { if (front[i]) next.add(p.id); });
      const changed = next.size !== occOk.size || [...next].some(id => !occOk.has(id));
      occOk = next;
      if (changed) positionLandmarks(true);
    }, 140);
  }
  function setPins(on) {
    pinsOn = on;
    const b = $('#qbPins');
    b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? 'Puntos: sí' : 'Puntos: no';
    if (!on) closePin();
    positionLandmarks();
  }

  // ======================= search =======================

  let results = [], active = -1;
  function renderResults() {
    const ul = $('#searchResults');
    const q = $('#search').value.trim();
    ul.innerHTML = '';
    if (!q) { ul.hidden = true; $('#search').setAttribute('aria-expanded', 'false'); return; }
    results = atlas.search(q, 60);
    if (!results.length) ul.appendChild(el('li', { class: 'none', text: 'Ningún hueso con ese nombre' }));
    results.forEach((ci, i) => {
      const cat = atlas.categories[atlas.categoryOf(ci)];
      const li = el('li', { role: 'option', 'aria-selected': i === active ? 'true' : 'false' }, [
        el('span', { class: 'n', text: atlas.displayName(ci) }),
        el('span', { class: 'c', text: cat.label }),
      ]);
      li.addEventListener('mousedown', (ev) => { ev.preventDefault(); pickResult(i); });
      ul.appendChild(li);
    });
    ul.hidden = false;
    $('#search').setAttribute('aria-expanded', 'true');
  }
  function pickResult(i) {
    const ci = results[i];
    if (ci === undefined) return;
    $('#search').value = '';
    renderResults();
    $('#search').blur();
    if (mode === 'quiz') setMode('explore');
    select(ci, { focus: true });
  }

  // ======================= sections =======================

  function setPlane(kind) {
    $$('input[name="plane"]').forEach(r => { r.checked = r.value === kind; });
    const off = kind === 'none';
    $('#planePos').disabled = off;
    $('#planeFlip').disabled = off;
    if (!off) {
      $('#planePos').value = 500;
      renderer.view(kind === 'sagittal' ? 'left' : 'front');
      if (kind === 'axial') renderer._animateTo({ yaw: 0.35, pitch: 0.75, dist: renderer.camera.dist, target: renderer.camera.target.slice() });
    }
    updatePlane();
  }
  function updatePlane() {
    const kind = ($$('input[name="plane"]').find(r => r.checked) || {}).value || 'none';
    if (kind === 'none' || !atlas) { renderer.clip.on = false; renderer.requestRender(); return; }
    const axis = { axial: 1, coronal: 2, sagittal: 0 }[kind];
    const b = atlas.index.bbox;
    const t = $('#planePos').value / 1000;
    const pos = b[axis] + (b[axis + 3] - b[axis]) * t;
    const s = $('#planeFlip').checked ? -1 : 1;
    const n = [0, 0, 0]; n[axis] = s;
    renderer.clip.plane = [n[0], n[1], n[2], -s * pos];
    renderer.clip.on = true;
    renderer.requestRender();
  }

  // ======================= quiz =======================

  const quiz = { type: 'find', total: 0, i: 0, score: 0, pool: [], missed: [], cur: -1, answered: false, userXray: false };
  // While a quiz shows a target, everything else turns translucent so deep structures stay visible.
  const quizXray = (on) => { renderer.xray = on || quiz.userXray; renderer.requestRender(); };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function quizPool() {
    const vis = renderer.visible;
    const out = [];
    atlas.concepts.forEach((c, ci) => {
      if (c.synthetic || c.orphan || !c.el.length || c.el.length > 4 || /\bskin\b/i.test(c.name) || /^FJ\d+$/.test(c.name)) return;
      if (!c.el.every(e => vis[e])) return;
      if (!c.el.some(e => atlas.elements[e].c === ci)) return; // only the most specific names
      out.push(ci);
    });
    return out;
  }

  function quizReset() {
    if (renderer.xray !== quiz.userXray) quizXray(false);
    $('#quizSetup').hidden = false; $('#quizRun').hidden = true; $('#quizDone').hidden = true;
    $('#quizSetupMsg').textContent = '';
    renderer.selected.fill(0);
    renderer.requestRender();
  }

  function quizStart() {
    const pool = quizPool();
    if (pool.length < 4) { $('#quizSetupMsg').textContent = 'Muestra al menos cuatro estructuras para empezar el cuestionario.'; return; }
    quiz.type = $$('input[name="qtype"]').find(r => r.checked).value;
    quiz.pool = shuffle(pool);
    quiz.total = Math.min(+$('#qcount').value, pool.length);
    quiz.i = 0; quiz.score = 0; quiz.missed = [];
    $('#quizSetup').hidden = true; $('#quizRun').hidden = false; $('#quizDone').hidden = true;
    quizAsk();
  }

  function quizAsk() {
    quiz.cur = quiz.pool[quiz.i];
    quiz.answered = false;
    const name = atlas.displayName(quiz.cur);
    $('#quizProgress').textContent = `Pregunta ${quiz.i + 1} de ${quiz.total}, ${quiz.score} correctas hasta ahora`;
    $('#quizFeedback').textContent = ''; $('#quizFeedback').className = 'quiz-feedback';
    $('#quizNext').hidden = true; $('#quizSkip').hidden = false;
    renderer.selected.fill(0);
    const opts = $('#quizOptions');
    opts.innerHTML = '';
    if (quiz.type === 'find') {
      $('#quizPrompt').textContent = `Haz clic en: ${name}`;
      quizXray(false);
      renderer.frame(atlas.index.bbox);
    } else {
      $('#quizPrompt').textContent = '¿Cuál es la estructura resaltada?';
      for (const e of atlas.concepts[quiz.cur].el) renderer.selected[e] = 1;
      quizXray(true);
      frameWithContext(atlas.concepts[quiz.cur].el, 2);
      const cat = atlas.categoryOf(quiz.cur);
      const others = quiz.pool.filter(c => c !== quiz.cur);
      const same = shuffle(others.filter(c => atlas.categoryOf(c) === cat));
      const pick = same.slice(0, 3);
      for (const c of shuffle(others.slice())) { if (pick.length >= 3) break; if (!pick.includes(c)) pick.push(c); }
      for (const c of shuffle([quiz.cur, ...pick])) {
        opts.appendChild(el('button', { text: atlas.displayName(c), 'data-ci': c, onclick: (ev) => quizAnswerName(c, ev.currentTarget) }));
      }
    }
    renderer.requestRender();
  }

  function frameWithContext(els, k = 1) {
    const b = atlas.bbox(els);
    const c = [(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2];
    const sb = atlas.index.bbox;
    const minR = Math.max(sb[4] - sb[1], 0.1) * 0.07;
    const r = Math.max(minR, (Math.hypot(b[3] - b[0], b[4] - b[1], b[5] - b[2]) / 2) * k);
    renderer.frame([c[0] - r, c[1] - r, c[2] - r, c[0] + r, c[1] + r, c[2] + r]);
  }

  function quizResolve(correct, wrongText) {
    quiz.answered = true;
    const fb = $('#quizFeedback');
    const name = atlas.displayName(quiz.cur);
    if (correct) { quiz.score++; fb.textContent = `¡Correcto! Es: ${name}.`; fb.className = 'quiz-feedback right'; }
    else { quiz.missed.push(quiz.cur); fb.textContent = wrongText; fb.className = 'quiz-feedback wrong'; }
    renderer.selected.fill(0);
    for (const e of atlas.concepts[quiz.cur].el) renderer.selected[e] = 1;
    quizXray(true);
    if (!correct) frameWithContext(atlas.concepts[quiz.cur].el, 2);
    renderer.requestRender();
    $('#quizProgress').textContent = `Pregunta ${quiz.i + 1} de ${quiz.total}, ${quiz.score} correctas hasta ahora`;
    $('#quizNext').hidden = false; $('#quizSkip').hidden = true;
    $('#quizNext').textContent = quiz.i + 1 >= quiz.total ? 'Ver resultados' : 'Siguiente pregunta';
    $('#quizNext').focus();
  }

  function quizPick(elIdx) {
    if (quiz.answered || quiz.type !== 'find' || $('#quizRun').hidden) return;
    if (elIdx < 0) { $('#quizFeedback').textContent = 'Haz clic directamente sobre un hueso.'; return; }
    const correct = atlas.concepts[quiz.cur].el.includes(elIdx);
    const clicked = atlas.displayName(atlas.conceptOf(elIdx)).toLowerCase();
    quizResolve(correct, `Eso es: ${clicked}. Ahora se resalta: ${atlas.displayName(quiz.cur)}.`);
  }

  function quizAnswerName(ci, btn) {
    if (quiz.answered) return;
    const correct = ci === quiz.cur;
    $$('#quizOptions button').forEach(b => {
      b.disabled = true;
      if (+b.dataset.ci === quiz.cur) b.classList.add('right');
    });
    if (!correct) btn.classList.add('wrong');
    quizResolve(correct, `Not quite: it is the ${atlas.displayName(quiz.cur).toLowerCase()}.`);
  }

  function quizNext() {
    quiz.i++;
    if (quiz.i >= quiz.total) return quizFinish();
    quizAsk();
  }

  function quizFinish() {
    $('#quizRun').hidden = true; $('#quizDone').hidden = false;
    const asked = Math.min(quiz.total, quiz.i + (quiz.answered && quiz.i < quiz.total ? 1 : 0));
    const pct = asked ? Math.round((quiz.score / asked) * 100) : 0;
    $('#quizScore').textContent = `${quiz.score} de ${asked} correctas (${pct}%)`;
    quizXray(false);
    const ul = $('#quizMissed');
    ul.innerHTML = '';
    if (!quiz.missed.length) ul.appendChild(el('li', { text: 'Nada que repasar. ¡Muy bien!' }));
    for (const ci of [...new Set(quiz.missed)]) {
      ul.appendChild(el('li', {}, el('button', { text: atlas.displayName(ci), onclick: () => { setMode('explore'); select(ci, { focus: true }); } })));
    }
    renderer.selected.fill(0);
    renderer.requestRender();
  }

  // ======================= modes, status, data =======================

  function setMode(m) {
    mode = m;
    $('#modeExplore').classList.toggle('on', m === 'explore');
    $('#modeQuiz').classList.toggle('on', m === 'quiz');
    $('#modeExplore').setAttribute('aria-selected', m === 'explore');
    $('#modeQuiz').setAttribute('aria-selected', m === 'quiz');
    $('#hoverTip').hidden = true;
    if (m === 'quiz') { selection = -1; markTree(); quizReset(); }
    else { renderer.selected.fill(0); setXray(quiz.userXray); }
    showInspector();
    renderer.requestRender();
  }

  function updateStatus() {
    const i = atlas.index;
    if (atlas.isDemo) {
      $('#statusData').textContent = 'Maniquí de demostración: formas simplificadas, no es anatomía real.';
      $('#statusGet').hidden = false;
      $('#statusAttr').textContent = '';
    } else {
      $('#statusData').textContent = `${i.name}: ${plural(i.counts.elements, 'pieza')} 3D, ${plural(i.counts.concepts, 'estructura')} con nombre`;
      $('#statusGet').hidden = true;
      $('#statusAttr').innerHTML = '';
      $('#statusAttr').appendChild(el('a', { href: i.licenseUrl || i.sourceUrl, target: '_blank', rel: 'noopener', text: `${i.attribution}${i.license && /NC/.test(i.license) ? '. Non-commercial use only' : ''}` }));
    }
  }

  const isWeb = !host && location.protocol.startsWith('http');
  const CMD = { bp3d43: 'npm run fetch-data:43', bp3d40: 'npm run fetch-data', zanatomy: 'npm run fetch-data:zanatomy' };

  async function getStatus() {
    if (host) return host.status();
    if (site) return { active: siteAtlas, atlases: site.atlases.map(a => ({ ...a, ready: true })) };
    if (isWeb) { try { const r = await fetch('api/status', { cache: 'no-store' }); if (r.ok) return r.json(); } catch (_) { /* old server */ } }
    return null;
  }
  async function setActiveAtlas(id) {
    if (site) { $('#dataDialog').close(); useAtlas(await loadSiteAtlas(id)); return; }
    if (host) await host.setActive(id);
    else { const r = await fetch('api/active?id=' + encodeURIComponent(id), { method: 'POST' }); if (!r.ok) throw new Error((await r.json()).error); }
    useAtlas(await fetchAtlas(host ? host.dataBase : 'data/'));
  }

  async function openDataDialog() {
    $('#dlError').textContent = '';
    if (site) $('#dataLead').textContent = `Elige un sistema del cuerpo. Cada uno se descarga solo cuando lo abres.`;
    $('#optMirrorRow').hidden = !host;
    $('#optCommercialRow').hidden = !host;
    $('#dlImport').hidden = !host;
    $('#dlFolder').hidden = !host;
    const dlg = $('#dataDialog');
    if (!dlg.open) {
      try { dlg.showModal(); } catch (_) { dlg.setAttribute('open', ''); } // very old browsers
    }
    try { await renderAtlasList(); } catch (e) { $('#dlError').textContent = 'Could not read the installed atlases: ' + e.message; }
  }

  async function renderAtlasList() {
    const ul = $('#atlasList');
    const st = await getStatus();
    ul.innerHTML = '';
    if (!st) {
      ul.appendChild(el('li', {}, el('p', { text: 'Run "npm run web" from the project folder to manage atlases here, or use the commands in SETUP.md.' })));
      return;
    }
    for (const a of st.atlases) {
      const active = a.id === st.active && !atlas.isDemo;
      const li = el('li', { class: active ? 'active' : '' });
      li.appendChild(el('div', { class: 'head' }, [
        el('span', { class: 'title', text: a.title }),
        el('span', { class: 'state', text: active ? (site ? 'Abierto ahora' : 'Showing now') : a.ready ? (site ? `Disponible, ${a.size}` : 'Installed') : a.size }),
      ]));
      li.appendChild(el('p', { text: a.summary }));
      if (a.ready && site) li.appendChild(el('p', { text: `${a.counts.concepts.toLocaleString()} estructuras con nombre. Licencia: ${a.license}.` }));
      else if (a.ready) li.appendChild(el('p', { text: `${a.counts.elements.toLocaleString()} meshes${a.counts.mirrored ? ` (${a.counts.mirrored} mirrored)` : ''}, ${a.counts.concepts.toLocaleString()} named structures, ${a.counts.triangles.toLocaleString()} triangles. Licence: ${a.license}.` }));
      const actions = el('div', { class: 'row-actions' });
      if (a.ready && !active) actions.appendChild(el('button', { type: 'button', class: 'primary', text: site ? 'Abrir' : 'Show this atlas', onclick: () => runSafe(() => setActiveAtlas(a.id)) }));
      if (host) {
        const opts = () => ({ source: a.id, mirror: $('#optMirror').checked, commercialSafe: $('#optCommercial').checked });
        actions.appendChild(el('button', { type: 'button', class: a.ready ? '' : 'primary', text: a.ready ? 'Download again' : `Download (${a.size})`, onclick: () => runDataJob((p) => host.prepare(opts(), p)) }));
        if (a.ready) actions.appendChild(el('button', { type: 'button', text: 'Rebuild', title: 'Rebuild from the downloaded files with the options above', onclick: () => runDataJob((p) => host.rebuild(opts(), p)) }));
        if (a.id === 'bp3d40' && !a.ready) actions.appendChild(el('button', { type: 'button', text: 'Regional set only (62 MB)', onclick: () => runDataJob((p) => host.prepare({ ...opts(), variant: 'core' }, p)) }));
        if (a.ready) actions.appendChild(el('button', { type: 'button', text: 'Remove', onclick: () => removeAtlas(a.id) }));
      } else if (!a.ready) {
        actions.appendChild(el('p', {}, [document.createTextNode('Install from the project folder with '), el('code', { text: CMD[a.id] }), document.createTextNode(', then reload.')]));
      }
      li.appendChild(actions);
      ul.appendChild(li);
    }
  }

  async function runSafe(fn) {
    try { await fn(); await renderAtlasList(); } catch (e) { $('#dlError').textContent = e.message; }
  }

  async function removeAtlas(id) {
    if (!window.confirm('Remove this atlas from this computer? You can download it again later.')) return;
    await host.remove(id);
    const st = await host.status();
    useAtlas(st.ready ? await fetchAtlas(host.dataBase) : buildProceduralAtlas());
    await renderAtlasList();
  }

  async function runDataJob(job) {
    const btns = $$('#atlasList button, #dlImport');
    btns.forEach(b => { b.disabled = true; });
    $('#dlError').textContent = '';
    $('#dlProgress').hidden = false;
    $('#dlBar').style.width = '0%';
    $('#dlMsg').textContent = 'Starting…';
    const mb = (n) => (n / 1048576).toFixed(1);
    try {
      const res = await job((p) => {
        if (p.phase === 'warn') { $('#dlError').textContent = p.message; return; }
        const pct = p.total ? (p.loaded / p.total) * 100 : null;
        let msg = p.message || '';
        if (p.phase === 'download' && p.file && p.total > 1) msg += `: ${mb(p.loaded)} of ${mb(p.total)} MB`;
        if (pct !== null) $('#dlBar').style.width = pct.toFixed(1) + '%';
        $('#dlMsg').textContent = msg;
      });
      if (res && res.canceled) { $('#dlProgress').hidden = true; return; }
      $('#dlMsg').textContent = 'Loading the atlas…';
      useAtlas(await fetchAtlas(host.dataBase));
      $('#dlBar').style.width = '100%';
      $('#dlMsg').textContent = `Ready: ${atlas.index.name} ${atlas.index.version}, ${atlas.index.counts.elements.toLocaleString()} meshes, ${atlas.index.counts.concepts.toLocaleString()} named structures.`;
      $('#dlError').textContent = '';
    } catch (e) {
      $('#dlError').textContent = `${e.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, '')} Check your internet connection and try again; finished downloads are kept and reused.`;
    } finally {
      await renderAtlasList();
    }
  }

  // ======================= input =======================

  function bindStage() {
    const canvas = $('#viewport');
    let drag = null;
    let hoverTimer = 0;
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    // Touch: one finger rotates (or moves, with the pad in "Mover" mode), two fingers pinch to zoom and drag to move.
    const touches = new Map();
    let pinch = null;
    const pinchState = () => {
      const [a, b] = [...touches.values()];
      return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') {
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (touches.size === 2) { pinch = pinchState(); drag = null; canvas.setPointerCapture(e.pointerId); return; }
        if (touches.size > 2) return;
      }
      canvas.focus({ preventScroll: true });
      drag = { x: e.clientX, y: e.clientY, btn: e.button, pan: e.button !== 0 || e.shiftKey || (e.pointerType === 'touch' && padPan), moved: false };
      canvas.setPointerCapture(e.pointerId);
      $('#hoverTip').hidden = true;
    });
    canvas.addEventListener('pointermove', (e) => {
      if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && touches.size === 2) {
        const now = pinchState();
        if (pinch.d > 0 && now.d > 0) renderer.zoom(pinch.d / now.d);
        renderer.pan(now.x - pinch.x, now.y - pinch.y);
        pinch = now;
        return;
      }
      if (e.pointerType === 'touch' && !drag) return;
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 3) return;
        drag.moved = true;
        canvas.classList.add('dragging');
        drag.x = e.clientX; drag.y = e.clientY;
        if (drag.pan) renderer.pan(dx, dy); else renderer.orbit(dx, dy);
        return;
      }
      if (mode === 'quiz') return; // hovering would give answers away
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        const i = renderer.pick(e.clientX, e.clientY);
        const tip = $('#hoverTip');
        if (i < 0) { tip.hidden = true; return; }
        const r = canvas.getBoundingClientRect();
        tip.textContent = atlas.displayName(atlas.conceptOf(i));
        tip.style.left = (e.clientX - r.left) + 'px';
        tip.style.top = (e.clientY - r.top) + 'px';
        tip.hidden = false;
      }, atlas.index.counts.triangles > 4e6 ? 220 : 80);
    });
    canvas.addEventListener('pointerleave', () => { clearTimeout(hoverTimer); $('#hoverTip').hidden = true; });
    const endTouch = (e) => {
      touches.delete(e.pointerId);
      if (pinch && touches.size < 2) { pinch = null; drag = null; return true; }
      return false;
    };
    canvas.addEventListener('pointercancel', (e) => { endTouch(e); drag = null; canvas.classList.remove('dragging'); });
    canvas.addEventListener('pointerup', (e) => {
      if (endTouch(e)) return;
      canvas.classList.remove('dragging');
      if (drag && !drag.moved && drag.btn === 0) {
        const i = renderer.pick(e.clientX, e.clientY);
        if (mode === 'quiz') quizPick(i);
        else if (i < 0) clearSelection();
        else select(atlas.conceptOf(i));
      }
      drag = null;
    });
    canvas.addEventListener('dblclick', (e) => {
      if (mode === 'quiz') return;
      const i = renderer.pick(e.clientX, e.clientY);
      if (i >= 0) select(atlas.conceptOf(i), { focus: true }); else renderer.frame(atlas.index.bbox);
    });
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); renderer.zoom(Math.exp(e.deltaY * 0.0012)); }, { passive: false });
  }

  let padPan = false;
  function bindCamPad() {
    const step = 0.06; // fraction of the view per tick
    const act = (k) => {
      const h = Math.max(1, renderer.canvas.clientHeight), px = h * step;
      if (k === 'in') renderer.zoom(0.9);
      else if (k === 'out') renderer.zoom(1 / 0.9);
      else if (padPan) renderer.pan({ left: px, right: -px }[k] || 0, { up: px, down: -px }[k] || 0);
      else renderer.orbit({ left: -px * 0.5, right: px * 0.5 }[k] || 0, { up: px * 0.5, down: -px * 0.5 }[k] || 0);
    };
    $$('#camPad [data-cam]').forEach(b => {
      const k = b.dataset.cam;
      if (k === 'reset') { b.addEventListener('click', () => { renderer.camera.yaw = 0; renderer.camera.pitch = 0.05; renderer.frame(atlas.index.bbox); }); return; }
      let timer = 0, rep = 0;
      const stop = () => { clearTimeout(timer); clearInterval(rep); timer = rep = 0; };
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault(); stop(); act(k);
        timer = setTimeout(() => { rep = setInterval(() => act(k), 50); }, 300); // hold to keep moving
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, stop));
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    });
    $('#camMode').addEventListener('click', () => {
      padPan = !padPan;
      $('#camMode').textContent = padPan ? 'Mover' : 'Girar';
      $('#camMode').setAttribute('aria-pressed', padPan ? 'true' : 'false');
    });
  }

  // Phones: the side panels become bottom sheets opened from the bar under the view.
  function openSheet(name) {
    const cur = document.body.dataset.sheet;
    if (!name || cur === name) { delete document.body.dataset.sheet; name = null; }
    else {
      document.body.dataset.sheet = name;
      if (name !== 'info') $(`.tab[data-tab="${name}"]`).click();
    }
    $$('.mobile-bar [data-sheet]').forEach(b => b.classList.toggle('on', b.dataset.sheet === name));
  }
  function bindSheets() {
    $$('.mobile-bar [data-sheet]').forEach(b => b.addEventListener('click', () => openSheet(b.dataset.sheet)));
    $$('.sheet-close').forEach(b => b.addEventListener('click', () => openSheet(null)));
  }

  function resetAll() {
    userHidden.fill(0);
    if (!site) for (const k of Object.keys(catOn)) catOn[k] = Object.keys(catOn).length === 1 || !HIDDEN_BY_DEFAULT.has(k);
    setXray(false);
    setPlane('none');
    if (mode === 'explore') clearSelection();
    applyVisibility();
    renderer.camera.yaw = 0; renderer.camera.pitch = 0.05;
    renderer.frame(atlas.index.bbox);
  }

  function setXray(on) {
    renderer.xray = on;
    quiz.userXray = on;
    $('#btnXray').setAttribute('aria-pressed', on ? 'true' : 'false');
    renderer.requestRender();
  }

  function saveImage() {
    const a = el('a', { href: renderer.snapshot(), download: `anatomy-${selection >= 0 ? atlas.concepts[selection].name.replace(/[^a-z0-9]+/gi, '-') : 'view'}.png` });
    document.body.appendChild(a); a.click(); a.remove();
  }

  function bindUI() {
    $('#modeExplore').addEventListener('click', () => setMode('explore'));
    $('#modeQuiz').addEventListener('click', () => setMode('quiz'));
    $$('[data-view]').forEach(b => b.addEventListener('click', () => renderer.view(b.dataset.view)));
    $('#btnReset').addEventListener('click', resetAll);
    $('#btnXray').addEventListener('click', () => setXray(!renderer.xray));
    $('#btnShot').addEventListener('click', saveImage);
    $('#btnData').addEventListener('click', openDataDialog);
    $('#statusGet').addEventListener('click', openDataDialog);
    $('#btnHelp').addEventListener('click', () => $('#helpDialog').showModal());
    $('#btnAbout').addEventListener('click', openAbout);
    $('#statusLab').addEventListener('click', openAbout);
    $('#statusLab').textContent = window.BRAND && window.BRAND.lab ? `Basado en el trabajo de ${window.BRAND.lab}` : '';
    $('#btnShowHidden').addEventListener('click', () => { userHidden.fill(0); applyVisibility(); });

    $$('.tab').forEach(t => t.addEventListener('click', () => {
      $$('.tab').forEach(x => x.classList.toggle('on', x === t));
      $$('.pane').forEach(p => { p.hidden = p.dataset.pane !== t.dataset.tab; });
      if (t.dataset.tab === 'tree' && selection >= 0) revealInTree(selection);
    }));
    $$('[data-tree]').forEach(b => b.addEventListener('click', () => {
      treeKind = b.dataset.tree;
      $$('[data-tree]').forEach(x => x.classList.toggle('on', x === b));
      buildTree();
      if (selection >= 0) revealInTree(selection);
    }));

    $$('input[name="plane"]').forEach(r => r.addEventListener('change', () => setPlane(r.value)));
    $('#planePos').addEventListener('input', updatePlane);
    $('#planeFlip').addEventListener('change', updatePlane);

    $('#actFocus').addEventListener('click', focusSelection);
    $('#actIsolate').addEventListener('click', isolateSelection);
    $('#actHide').addEventListener('click', hideSelection);
    $('#qbHide').addEventListener('click', hideSelection);
    $('#qbShowAll').addEventListener('click', () => { userHidden.fill(0); applyVisibility(); });
    $('#qbPins').addEventListener('click', () => setPins(!pinsOn));
    $('#lmCard .lm-close').addEventListener('click', closePin);

    const s = $('#search');
    s.addEventListener('input', () => { active = 0; renderResults(); });
    s.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!results.length) return;
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
        renderResults();
        const li = $$('#searchResults li')[active];
        if (li) li.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') { e.preventDefault(); pickResult(Math.max(0, active)); }
      else if (e.key === 'Escape') { s.value = ''; renderResults(); s.blur(); }
    });
    s.addEventListener('blur', () => setTimeout(() => { $('#searchResults').hidden = true; }, 120));
    s.addEventListener('focus', () => { if (s.value.trim()) renderResults(); });

    $('#quizStart').addEventListener('click', quizStart);
    $('#quizNext').addEventListener('click', quizNext);
    $('#quizSkip').addEventListener('click', () => { quiz.missed.push(quiz.cur); quizNext(); });
    $('#quizStop').addEventListener('click', () => (quiz.i > 0 || quiz.answered ? quizFinish() : quizReset()));
    $('#quizAgain').addEventListener('click', quizReset);

    $('#dlImport').addEventListener('click', () => runDataJob((p) => host.importFiles(p)));
    $('#dlFolder').addEventListener('click', () => host.openDataFolder());
    $('#mirrorToggle').addEventListener('change', applyVisibility);

    document.addEventListener('keydown', (e) => {
      const t = e.target;
      if (t.matches && t.matches('input, select, textarea') && t.type !== 'radio' && t.type !== 'checkbox') return;
      if (document.querySelector('dialog[open]')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (k === '/') { e.preventDefault(); $('#search').focus(); }
      else if (k === '?') $('#helpDialog').showModal();
      else if (k === 'Escape') { if (mode === 'explore') clearSelection(); }
      else if (k === 'f' || k === 'F') focusSelection();
      else if ((k === 'i' || k === 'I') && mode === 'explore') isolateSelection();
      else if ((k === 'h' || k === 'H') && mode === 'explore') hideSelection();
      else if (k === 'a' || k === 'A') resetAll();
      else if (k === 'x' || k === 'X') setXray(!renderer.xray);
      else if (k >= '1' && k <= '4') renderer.view(['front', 'back', 'left', 'right'][+k - 1]);
      else if (k === 'Enter' && mode === 'quiz' && !$('#quizNext').hidden) quizNext();
    });
  }

  function openAbout() {
    const B = window.BRAND || {};
    const i = atlas && atlas.index;
    $('#aboutLogo').src = B.logo || 'brand/logo.png';
    $('#aboutLogo').alt = (B.lab || '') + ' logo';
    $('#aboutTitle').textContent = 'Atlas de huesos';
    $('#aboutText').textContent = 'Versión de estudio solo con huesos y nombres en español, derivada de Open Anatomy Atlas (Cognition Lab, Shiv Nadar University Chennai, licencia MIT).';
    $('#aboutWeb').href = B.website || '#'; $('#aboutWeb').textContent = (B.website || '').replace(/^https?:\/\//, '');
    $('#aboutEmail').href = 'mailto:' + (B.email || ''); $('#aboutEmail').textContent = B.email || '';
    $('#aboutRepo').href = B.repository || '#'; $('#aboutRepo').textContent = (B.repository || '').replace(/^https?:\/\//, '');
    $('#aboutRepo').closest('dd').previousElementSibling.hidden = !B.repository;
    $('#aboutRepo').closest('dd').hidden = !B.repository;
    $('#aboutVersion').textContent = B.version || '';
    $('#aboutData').textContent = !i || atlas.isDemo ? 'No hay atlas cargado: estás viendo el maniquí de demostración.'
      : `${i.name} ${i.version}. ${i.attribution}. Licencia: ${i.license}. Nombres en español: traducción propia de esta versión.`;
    $('#aboutDialog').showModal();
  }

  function isolateSelection() {
    if (selection < 0) return;
    const keep = new Set(atlas.concepts[selection].el);
    atlas.elements.forEach((_, i) => { userHidden[i] = keep.has(i) ? 0 : 1; });
    ensureVisible(keep);
    applyVisibility();
    focusSelection();
  }

  function hideSelection() {
    if (selection < 0) return;
    for (const e of atlas.concepts[selection].el) userHidden[e] = 1;
    applyVisibility();
    clearSelection();
  }

  // ======================= boot =======================

  async function boot() {
    try {
      renderer = new AtlasRenderer($('#viewport'));
    } catch (e) {
      $('#loading').textContent = e.message;
      return;
    }
    renderer.onFrame = () => { positionPin(); positionLandmarks(); };
    bindStage();
    bindCamPad();
    bindSheets();
    bindUI();
    const hashAtStart = location.hash;
    useAtlas(await loadBest());
    if (hashAtStart && site) { history.replaceState(null, '', location.pathname + location.search); location.hash = hashAtStart; }
    // #atlas=<id> (old links) switches that system on next to the bones.
    const fromHash = () => {
      if (!site) return;
      const id = (/[#&]atlas=([\w-]+)/.exec(location.hash) || [])[1];
      if (id && site.atlases.some(a => a.id === id)) addSystem(id);
    };
    window.addEventListener('hashchange', fromHash);
    if (host && atlas.isDemo) openDataDialog();
    window.__atlasDebug = { get atlas() { return atlas; }, get renderer() { return renderer; }, select };
  }

  boot();
})();
