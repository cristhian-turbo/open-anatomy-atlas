#!/usr/bin/env node
'use strict';
// Computes bony landmark pins (processes, foramina, sutures, condyles...) from
// the Z-Anatomy mesh geometry and writes src/renderer/landmarks.js.
//   node tools/compute-landmarks.js [<zanatomy build dir>]
// Each pin is snapped to a real vertex of its bone, so it never floats.
// Axes of the atlas: +x = patient's left, +y = up, +z = anterior (metres).
const fs = require('fs'), path = require('path');
const { defaultDataDir } = require('./fetch-data-paths');
const dir = process.argv[2] || path.join(defaultDataDir(), 'atlases', 'zanatomy', 'build');
const idx = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const bin = fs.readFileSync(path.join(dir, 'meshes.bin'));
const [po] = idx.buffers.positions, [io, il] = idx.buffers.indices;
const P = new Float32Array(bin.buffer, bin.byteOffset + po, idx.buffers.positions[1] / 4);
const I = new Uint32Array(bin.buffer.slice(bin.byteOffset + io, bin.byteOffset + io + il));
const byKey = new Map(idx.elements.map(e => [e.k, e]));
const cache = new Map();
function verts(key) {
  if (cache.has(key)) return cache.get(key);
  const e = byKey.get('ZA:' + key);
  if (!e) throw new Error('missing mesh ' + key);
  const seen = new Set(), out = [];
  for (let k = e.o; k < e.o + e.n; k++) { const v = I[k]; if (!seen.has(v)) { seen.add(v); out.push([P[v * 3], P[v * 3 + 1], P[v * 3 + 2]]); } }
  const b = [0, 1, 2].map(a => [Math.min(...out.map(p => p[a])), Math.max(...out.map(p => p[a]))]);
  const r = { key: 'ZA:' + key, v: out, b, f: (a, t) => b[a][0] + (b[a][1] - b[a][0]) * t };
  cache.set(key, r);
  return r;
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// Vertex furthest along dir, optionally restricted by a filter on (p, bone).
function extreme(key, dir, filter = () => true) {
  const m = verts(key); let best = null, bd = -Infinity;
  for (const p of m.v) if (filter(p, m)) { const d = dot(p, dir); if (d > bd) { bd = d; best = p; } }
  if (!best) throw new Error('no vertex for ' + key);
  return best;
}
// Vertex nearest a point; optional preference to be on the surface facing dir.
function nearest(key, q, filter = () => true) {
  const m = verts(key); let best = null, bd = Infinity;
  for (const p of m.v) if (filter(p, m)) { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (d < bd) { bd = d; best = p; } }
  return best;
}
// In a slab around a level, the vertex furthest along dir (surface point).
const surf = (key, axis, lo, hi, dir, extra = () => true) => extreme(key, dir, (p, m) => p[axis] >= m.f(axis, lo) && p[axis] <= m.f(axis, hi) && extra(p, m));
// Paired bones: pins go on the right side (medial = +x, lateral = -x).
const L = []; // [id, mesh, nombre, descripción, point]
const add = (id, mesh, name, desc, p) => L.push({ id, k: 'ZA:' + mesh, name, desc, p: p.map(x => +x.toFixed(4)) });

// ---------- cráneo ----------
{
  const occ = verts('Occipital bone');
  // Midline profile of the occipital: the biggest antero-posterior gap below the
  // posterior bulge is the foramen magnum; its posterior border is the opisthion.
  const ml = occ.v.filter(p => Math.abs(p[0]) < 0.003 && p[1] < occ.f(1, 0.45)).sort((a, b) => a[2] - b[2]);
  let gap = 0, gi = 0;
  for (let i = 1; i < ml.length; i++) if (ml[i][2] - ml[i - 1][2] > gap) { gap = ml[i][2] - ml[i - 1][2]; gi = i; }
  add('foramen-magno', 'Occipital bone', 'Agujero magno (foramen magnum)', 'Gran orificio del occipital por el que pasan el bulbo raquídeo, las arterias vertebrales y el nervio accesorio. El pin marca su borde posterior (opistion).', ml[gi - 1]);
  add('condilo-occipital', 'Occipital bone', 'Cóndilo occipital', 'Superficie articular a cada lado del agujero magno; se apoya sobre las masas laterales del atlas (articulación atlantooccipital, movimiento de "sí").', extreme('Occipital bone', [0, -1, 0], p => p[0] < -0.008));
  add('lambda', 'Occipital bone', 'Sutura lambdoidea (lambda)', 'Sutura entre el occipital y los dos parietales, en forma de letra lambda. El pin marca el lambda, su vértice superior.', extreme('Occipital bone', [0, 1, 0], p => Math.abs(p[0]) < 0.01));

  const tmp = verts('Temporal bone.r');
  add('mastoides', 'Temporal bone.r', 'Apófisis mastoides', 'Prominencia del temporal detrás de la oreja; contiene celdas aéreas e inserta el esternocleidomastoideo.', extreme('Temporal bone.r', [-0.35, -1, -0.45], p => p[0] < tmp.f(0, 0.45)));
  add('estiloides', 'Temporal bone.r', 'Apófisis estiloides', 'Prolongación fina y puntiaguda del temporal, dirigida hacia abajo y adelante; origen de músculos y ligamentos (estilohioideo, estilofaríngeo, estilogloso).', extreme('Temporal bone.r', [0.15, -1, 0.35], p => p[0] > tmp.f(0, 0.25)));
  add('sutura-escamosa', 'Temporal bone.r', 'Sutura escamosa', 'Une la escama del temporal con el parietal; el pin marca su punto más alto.', extreme('Temporal bone.r', [0, 1, 0]));
  add('arco-cigomatico', 'Zygomatic bone.r', 'Arco cigomático', 'Puente óseo formado por la apófisis temporal del cigomático y la apófisis cigomática del temporal; origen del masetero.', extreme('Zygomatic bone.r', [-1, 0, -0.3]));

  const sph = verts('Sphenoid bone');
  // Sella turcica: lowest point of the upper midline profile of the sphenoid body.
  const sm = sph.v.filter(p => Math.abs(p[0]) < 0.004);
  const bins = new Map();
  for (const p of sm) { const z = Math.round(p[2] / 0.002); if (!bins.has(z) || bins.get(z)[1] < p[1]) bins.set(z, p); }
  const top = [...bins.entries()].sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const zs = top.map(p => p[2]), z0 = Math.min(...zs), z1 = Math.max(...zs);
  fs.writeFileSync('/tmp/lm/sella-profile.json', JSON.stringify(top));
  const inner = top.filter(p => p[2] > z0 + (z1 - z0) * 0.25 && p[2] < z0 + (z1 - z0) * 0.75);
  global.__sellaInner = inner;
  const sella = inner.reduce((a, b) => (b[1] < a[1] ? b : a));
  add('silla-turca', 'Sphenoid bone', 'Silla turca', 'Depresión en la cara superior del cuerpo del esfenoides que aloja la hipófisis (fosa hipofisaria).', sella);
  add('ala-mayor', 'Sphenoid bone', 'Ala mayor del esfenoides', 'Lámina lateral del esfenoides; forma parte de la fosa craneal media, de la órbita y de la fosa temporal (pterion).', extreme('Sphenoid bone', [-1, 0.2, 0]));
  add('ala-menor', 'Sphenoid bone', 'Ala menor del esfenoides', 'Lámina triangular superior y anterior del esfenoides; limita la fosa craneal anterior y contiene el conducto óptico.', extreme('Sphenoid bone', [0, 1, 0], p => p[0] < -0.008 && p[0] > -0.022 && p[2] > sella[2] && p[2] < sella[2] + 0.015 && p[1] < sella[1] + 0.025));

  const fr = verts('Frontal bone');
  add('glabela', 'Frontal bone', 'Glabela', 'Zona lisa del frontal entre las cejas, en la línea media; punto craneométrico más anterior de la frente.', extreme('Frontal bone', [0, 0, 1], p => Math.abs(p[0]) < 0.004 && p[1] < fr.f(1, 0.4)));
  const so = extreme('Frontal bone', [0, 0, 1], p => p[0] < -0.02 && p[0] > -0.03 && p[1] < fr.f(1, 0.33) && p[1] > fr.f(1, 0.15));
  add('supraorbitario', 'Frontal bone', 'Agujero (escotadura) supraorbitario', 'Orificio o escotadura en el borde superior de la órbita; paso del nervio y vasos supraorbitarios (rama del V1).', so);

  const mx = verts('Maxilla.r');
  add('infraorbitario', 'Maxilla.r', 'Agujero infraorbitario', 'Orificio en la cara anterior del maxilar, bajo el borde de la órbita; paso del nervio infraorbitario (V2) y sus vasos.', extreme('Maxilla.r', [0, 0, 1], p => p[0] < -0.02 && p[0] > -0.03 && p[1] > mx.f(1, 0.55) && p[1] < mx.f(1, 0.7)));

  const md = verts('Mandible');
  const ramus = p => p[0] < md.f(0, 0.2);
  add('coronoides', 'Mandible', 'Apófisis coronoides', 'Prolongación anterior de la rama de la mandíbula, en forma de lámina triangular; inserción del músculo temporal.', extreme('Mandible', [0, 1, 0.35], p => ramus(p) && p[2] > md.f(2, 0.3)));
  add('condilo-mandibular', 'Mandible', 'Cóndilo (cabeza) de la mandíbula', 'Extremo posterior de la rama mandibular; se articula con el temporal en la articulación temporomandibular (ATM).', extreme('Mandible', [0, 1, -0.35], p => ramus(p) && p[2] < md.f(2, 0.3)));
  add('mentoniano', 'Mandible', 'Agujero mentoniano', 'Orificio en la cara externa del cuerpo mandibular, bajo el segundo premolar; paso del nervio mentoniano (V3).', nearest('Mandible', [md.f(0, 0.5) - 0.024, md.f(1, 0.18), md.f(2, 0.86)], p => p[0] < md.f(0, 0.4)));

  const par = verts('Parietal bone.r');
  add('sutura-sagital', 'Parietal bone.r', 'Sutura sagital', 'Sutura en la línea media del techo del cráneo, entre los dos parietales; va del bregma al lambda.', extreme('Parietal bone.r', [0.2, 1, 0], p => p[2] < par.f(2, 0.6) && p[2] > par.f(2, 0.4)));
}

// ---------- columna y tronco ----------
add('odontoides', 'Axis (C2)', 'Apófisis odontoides (diente del axis)', 'Prolongación vertical del cuerpo del axis que encaja en el arco anterior del atlas; pivote de la rotación de la cabeza ("no").', extreme('Axis (C2)', [0, 1, 0]));
{
  const v = 'Vertebra L3', m = verts(v);
  add('cuerpo-vertebral', v, 'Cuerpo vertebral (L3)', 'Parte anterior, cilíndrica y maciza de la vértebra; soporta el peso y se une a los discos intervertebrales.', extreme(v, [0, 0, 1], p => Math.abs(p[0]) < 0.004));
  add('espinosa', v, 'Apófisis espinosa (L3)', 'Proyección posterior en la línea media, donde se unen las láminas; inserción de ligamentos (supraespinoso, interespinoso) y músculos.', extreme(v, [0, 0, -1]));
  add('transversa', v, 'Apófisis transversa (L3)', 'Proyección lateral a cada lado de la unión pedículo-lámina; inserción de músculos y ligamento intertransverso.', extreme(v, [-1, 0, 0]));
  add('art-superior', v, 'Apófisis articular superior (L3)', 'Sube desde la unión del pedículo y la lámina y se articula con la apófisis articular inferior de la vértebra de arriba.', extreme(v, [-0.2, 1, 0], p => p[2] < m.f(2, 0.5) && p[0] < -0.008));
  add('art-inferior', v, 'Apófisis articular inferior (L3)', 'Baja desde la lámina y se articula con la apófisis articular superior de la vértebra de abajo (articulación cigapofisaria).', extreme(v, [-0.2, -1, 0], p => p[2] < m.f(2, 0.45) && p[0] < -0.004 && p[2] > m.f(2, 0.12)));
}
add('xifoides', 'Xiphoid process', 'Apófisis xifoides', 'Extremo inferior del esternón, cartilaginoso en el joven; inserción del diafragma y del recto del abdomen (línea alba).', extreme('Xiphoid process', [0, -1, 0]));
{
  const h = verts('Hip bone.r');
  add('cresta-iliaca', 'Hip bone.r', 'Cresta ilíaca', 'Borde superior del ilion; se palpa en la cintura y su punto más alto marca el nivel de L4.', extreme('Hip bone.r', [0, 1, 0]));
}

// ---------- escápula y miembro superior ----------
{
  const s = verts('Scapula.r');
  // The blade is a thin plate that leans forward at the top; the spine shows up,
  // in a vertical strip through the middle of the blade, as the level where the
  // posterior surface jumps backwards. Fossae are placed above / below that level.
  const xmid = s.f(0, 0.55);
  let spineY = 0, best = Infinity;
  for (let y = s.f(1, 0.5); y < s.f(1, 0.9); y += 0.0025) {
    const sl = s.v.filter(p => Math.abs(p[0] - xmid) < 0.003 && Math.abs(p[1] - y) < 0.00125);
    if (!sl.length) continue;
    const mz = Math.min(...sl.map(p => p[2]));
    if (mz < best) { best = mz; spineY = y; }
  }
  const yi = spineY - (spineY - s.b[1][0]) * 0.45;
  add('supraespinosa', 'Scapula.r', 'Fosa supraespinosa', 'Cara posterior de la escápula por encima de la espina; origen del músculo supraespinoso.', extreme('Scapula.r', [0, 0, -1], p => Math.abs(p[0] - (xmid + 0.023)) < 0.004 && Math.abs(p[1] - (spineY + 0.017)) < 0.003));
  add('infraespinosa', 'Scapula.r', 'Fosa infraespinosa', 'Cara posterior de la escápula por debajo de la espina; origen del músculo infraespinoso.', extreme('Scapula.r', [0, 0, -1], p => Math.abs(p[0] - xmid) < 0.003 && Math.abs(p[1] - yi) < 0.003));
  add('subescapular', 'Scapula.r', 'Fosa subescapular', 'Cara anterior (costal) de la escápula, cóncava; origen del músculo subescapular.', extreme('Scapula.r', [0, 0, 1], p => Math.abs(p[0] - xmid) < 0.003 && Math.abs(p[1] - yi) < 0.003));
}
{
  const H = 'Humerus.r', h = verts(H);
  const top = h.b[1][1];
  add('cabeza-humero', H, 'Cabeza del húmero', 'Superficie articular semiesférica que mira hacia medial, arriba y atrás; se articula con la cavidad glenoidea de la escápula.', extreme(H, [1, 0.55, -0.35], p => p[1] > top - 0.05));
  const gt = extreme(H, [-1, 0.25, 0], p => p[1] > top - 0.05);
  add('tuberculo-mayor', H, 'Tubérculo mayor (troquíter)', 'Relieve lateral del extremo proximal; inserción del supraespinoso, infraespinoso y redondo menor.', gt);
  const lt = extreme(H, [0.25, 0, 1], p => p[1] > top - 0.05);
  add('tuberculo-menor', H, 'Tubérculo menor (troquín)', 'Relieve anterior del extremo proximal; inserción del subescapular.', lt);
  add('intertubercular', H, 'Surco intertubercular (corredera bicipital)', 'Canal entre los tubérculos mayor y menor por donde pasa el tendón de la porción larga del bíceps.', extreme(H, [-0.3, 0, 1], p => Math.abs(p[1] - (top - 0.045)) < 0.004 && p[0] < lt[0] - 0.004 && p[0] > gt[0] + 0.008));
  const hc = extreme(H, [1, 0.55, -0.35], p => p[1] > top - 0.05);
  add('cuello-anatomico', H, 'Cuello anatómico', 'Ligero estrechamiento que rodea el borde de la cabeza, donde se inserta la cápsula articular.', extreme(H, [1, -0.6, 0], p => Math.abs(p[1] - (hc[1] - 0.022)) < 0.004));
  add('cuello-quirurgico', H, 'Cuello quirúrgico', 'Zona estrecha bajo los tubérculos, entre la epífisis y la diáfisis; sitio frecuente de fracturas, con riesgo para el nervio axilar.', extreme(H, [-1, 0, 0.2], p => Math.abs(p[1] - (top - 0.075)) < 0.004));
  const low = h.b[1][0];
  add('epicondilo-medial', H, 'Epicóndilo medial (epitróclea)', 'Prominencia medial del extremo distal; origen de los flexores del antebrazo. Detrás pasa el nervio cubital.', extreme(H, [1, 0, 0], p => p[1] < low + 0.06));
  add('epicondilo-lateral', H, 'Epicóndilo lateral', 'Prominencia lateral del extremo distal; origen de los extensores del antebrazo (codo de tenista).', extreme(H, [-1, 0, 0], p => p[1] < low + 0.06));
  const em = extreme(H, [1, 0, 0], p => p[1] < low + 0.06), el = extreme(H, [-1, 0, 0], p => p[1] < low + 0.06);
  const yc = low + 0.035;
  add('fosa-radial', H, 'Fosa radial', 'Pequeña depresión anterior, encima del capítulo (cóndilo), que recibe la cabeza del radio en la flexión máxima del codo.', extreme(H, [0, 0, 1], p => Math.abs(p[1] - yc) < 0.004 && Math.abs(p[0] - (em[0] * 0.28 + el[0] * 0.72)) < 0.004));
  add('fosa-coronoidea', H, 'Fosa coronoidea', 'Depresión anterior, encima de la tróclea, que recibe la apófisis coronoides del cúbito en la flexión.', extreme(H, [0, 0, 1], p => Math.abs(p[1] - yc) < 0.004 && Math.abs(p[0] - (em[0] * 0.6 + el[0] * 0.4)) < 0.004));
}
add('olecranon', 'Ulna.r', 'Olécranon', 'Extremo proximal y posterior del cúbito; forma la punta del codo e inserta el tríceps.', extreme('Ulna.r', [0, 1, -0.4]));
add('gancho-ganchoso', 'Hamate bone.r', 'Gancho del ganchoso', 'Apófisis anterior del hueso ganchoso; límite medial del túnel carpiano y del canal de Guyon.', extreme('Hamate bone.r', [0, 0, 1]));

// ---------- miembro inferior ----------
{
  const F = 'Femur.r', f = verts(F), top = f.b[1][1], low = f.b[1][0];
  const head = extreme(F, [1, 0.3, 0], p => p[1] > top - 0.06);
  add('cabeza-femur', F, 'Cabeza del fémur', 'Superficie articular esférica que se aloja en el acetábulo del coxal; tiene la fóvea para el ligamento redondo.', head);
  const gtr = extreme(F, [-0.3, 1, 0], p => p[0] < f.f(0, 0.4));
  add('trocanter-mayor', F, 'Trocánter mayor', 'Gran prominencia lateral del extremo proximal; inserción de glúteo medio y menor y de los rotadores externos.', gtr);
  add('cuello-femur', F, 'Cuello del fémur', 'Une la cabeza con la diáfisis formando el ángulo cervicodiafisario (~125°); sitio frecuente de fractura en ancianos.', extreme(F, [0, 0, 1], p => Math.abs(p[0] - ((head[0] + gtr[0]) / 2 + 0.006)) < 0.004 && p[1] > head[1] - 0.04));
  add('trocanter-menor', F, 'Trocánter menor', 'Prominencia posteromedial bajo el cuello; inserción del músculo iliopsoas.', extreme(F, [1, 0, -0.7], p => p[1] < top - 0.07 && p[1] > top - 0.14));
  add('condilo-medial-femur', F, 'Cóndilo medial del fémur', 'Masa articular distal medial; se articula con la tibia y el menisco medial.', extreme(F, [0.3, -1, -0.3], p => p[0] > f.f(0, 0.5)));
  add('condilo-lateral-femur', F, 'Cóndilo lateral del fémur', 'Masa articular distal lateral; se articula con la tibia y el menisco lateral.', extreme(F, [-0.3, -1, -0.3], p => p[0] < f.f(0, 0.5)));
  add('epicondilo-medial-femur', F, 'Epicóndilo medial del fémur', 'Relieve en la cara medial del cóndilo medial; arriba está el tubérculo del aductor.', extreme(F, [1, 0, 0], p => p[1] < low + 0.07));
  add('epicondilo-lateral-femur', F, 'Epicóndilo lateral del fémur', 'Relieve en la cara lateral del cóndilo lateral; inserción del ligamento colateral peroneo.', extreme(F, [-1, 0, 0], p => p[1] < low + 0.07));
  const xc = (f.b[0][0] + f.b[0][1]) / 2;
  const notch = extreme(F, [0, -1, 0.9], p => p[1] < low + 0.03 && p[2] < f.f(2, 0.35) && Math.abs(p[0] - (extreme(F, [1, 0, 0], q => q[1] < low + 0.07)[0] + extreme(F, [-1, 0, 0], q => q[1] < low + 0.07)[0]) / 2) < 0.003);
  add('fosa-intercondilea', F, 'Fosa intercondílea', 'Escotadura posterior entre los dos cóndilos; aloja los ligamentos cruzados.', notch);
  add('poplitea', F, 'Cara poplítea', 'Superficie triangular posterior del extremo distal, entre las líneas supracondíleas; suelo de la fosa poplítea.', extreme(F, [0, 0, -1], p => Math.abs(p[1] - (low + 0.1)) < 0.005 && Math.abs(p[0] - xc) < 0.008));
}
add('rotula', 'Patella.r', 'Rótula (cara anterior)', 'Hueso sesamoideo dentro del tendón del cuádriceps; protege la rodilla y mejora la palanca del cuádriceps.', extreme('Patella.r', [0, 0, 1]));
{
  const T = 'Tibia.r', t = verts(T);
  add('condilo-medial-tibia', T, 'Cóndilo medial de la tibia', 'Masa medial del extremo proximal; su cara superior (meseta) se articula con el cóndilo medial del fémur.', extreme(T, [1, 0.3, 0], p => p[1] > t.f(1, 0.9)));
  add('maleolo-medial', T, 'Maléolo medial', 'Prolongación distal y medial de la tibia; forma la pared medial de la mortaja del tobillo.', extreme(T, [0.4, -1, 0], p => p[0] > t.f(0, 0.5)));
}
add('maleolo-lateral', 'Fibula.r', 'Maléolo lateral', 'Extremo distal del peroné; baja más que el medial y forma la pared lateral de la mortaja del tobillo.', extreme('Fibula.r', [0, -1, 0]));

const out = path.join(__dirname, '..', 'src', 'renderer', 'landmarks.js');
fs.writeFileSync(out, `// Bony landmark pins (generated by tools/compute-landmarks.js from the Z-Anatomy\n// meshes; each point is a vertex of its bone, in the bone mesh's own coordinates).\nwindow.LANDMARKS = ${JSON.stringify(L, null, 0).replace(/\},\{/g, '},\n{')};\n`);
console.log(L.length, 'pins ->', out);
