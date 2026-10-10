#!/usr/bin/env node
'use strict';
// Derives a bones-only atlas from a built atlas (index.json + meshes.bin).
//   node tools/bones-only.js <srcBuildDir> <dstBuildDir>
// Also used by build-site.js --bones-es.
const fs = require('fs'), path = require('path');
const { toSpanish } = require('./es-bones');
const keepT = new Set(['bone']);
function bonesOnly(idx, bin) {
const [po] = idx.buffers.positions, [no] = idx.buffers.normals, [io, il] = idx.buffers.indices;
const I = new Uint32Array(bin.buffer.slice(bin.byteOffset + io, bin.byteOffset + io + il));
const elMap = new Map(), els = [], pos = [], nor = [], ind = [];
let vo = 0, ioOut = 0;
idx.elements.forEach((e, i) => {
  if (!keepT.has(e.t)) return;
  let lo = Infinity, hi = -1;
  for (let k = e.o; k < e.o + e.n; k++) { const v = I[k]; if (v < lo) lo = v; if (v > hi) hi = v; }
  const nv = hi - lo + 1;
  pos.push(bin.subarray(po + lo * 12, po + (hi + 1) * 12));
  nor.push(bin.subarray(no + lo * 6, no + (hi + 1) * 6));
  const out = new Uint32Array(e.n);
  for (let k = 0; k < e.n; k++) out[k] = I[e.o + k] - lo + vo;
  ind.push(Buffer.from(out.buffer));
  elMap.set(i, els.length);
  els.push({ ...e, o: ioOut, n: e.n });
  vo += nv; ioOut += e.n;
});
// Keep concepts that contain kept meshes, plus their ancestors.
const C = idx.concepts, keepC = new Set();
const up = ci => { if (keepC.has(ci)) return; keepC.add(ci); for (const p of [...(C[ci].pp || []), ...(C[ci].ip || [])]) up(p); };
C.forEach((c, ci) => { if (c.el.some(e => elMap.has(e))) up(ci); });
const order = [...keepC].sort((a, b) => a - b), cMap = new Map(order.map((c, i) => [c, i]));
const mapL = l => (l || []).filter(x => cMap.has(x)).map(x => cMap.get(x));
const concepts = order.map(ci => { const c = C[ci]; return { ...c, pp: mapL(c.pp), pc: mapL(c.pc), ip: mapL(c.ip), ic: mapL(c.ic), el: c.el.filter(e => elMap.has(e)).map(e => elMap.get(e)) }; });
els.forEach(e => { e.c = cMap.get(e.c); });
const P = Buffer.concat(pos), X = Buffer.concat(ind);
let N = Buffer.concat(nor);
if (N.length % 4) N = Buffer.concat([N, Buffer.alloc(4 - (N.length % 4))]); // index buffer must start 4-byte aligned
const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
for (const e of els) for (let a = 0; a < 3; a++) { b[a] = Math.min(b[a], e.b[a]); b[a + 3] = Math.max(b[a + 3], e.b[a + 3]); }
const out = { ...idx, name: idx.name + ' (huesos)', categories: { bone: { ...idx.categories.bone, label: 'Huesos y dientes' } }, bbox: b,
  counts: { ...idx.counts, elements: els.length, concepts: concepts.length, triangles: ioOut / 3, vertices: vo },
  buffers: { positions: [0, P.length], normals: [P.length, N.length], indices: [P.length + N.length, X.length] },
  elements: els, concepts, roots: { partof: mapL(idx.roots.partof), isa: mapL(idx.roots.isa) } };
// Spanish names: keep the English one as `en`, drop English definitions so
// descriptions come from Spanish Wikipedia instead.
for (const c of concepts) {
  const es = toSpanish(c.name);
  c.en = c.name.trim();
  if (es) c.name = es; else console.warn(`No Spanish name for "${c.en}"`);
  delete c.def;
}
return { index: out, bin: Buffer.concat([P, N, X]) };
}
module.exports = { bonesOnly };
if (require.main === module) {
  const [src, dst] = process.argv.slice(2);
  const r = bonesOnly(JSON.parse(fs.readFileSync(path.join(src, 'index.json'), 'utf8')), fs.readFileSync(path.join(src, 'meshes.bin')));
  fs.mkdirSync(dst, { recursive: true });
  fs.writeFileSync(path.join(dst, 'index.json'), JSON.stringify(r.index));
  fs.writeFileSync(path.join(dst, 'meshes.bin'), r.bin);
  console.log(`bones-only: ${r.index.elements.length} meshes, ${r.index.concepts.length} concepts, ${(r.bin.length / 1048576).toFixed(1)} MB`);
}
