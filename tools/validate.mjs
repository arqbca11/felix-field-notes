#!/usr/bin/env node
/* Validate the Field Notes app. Run from the field-notes/ folder:  node tools/validate.mjs
   1) syntax-checks the inline engine script in index.html and every notes/*.js file
   2) loads the manifest + every entry in a sandbox and asserts the data shape:
      fr/en aligned, known kind + level, ISO date matches the manifest, manifest is
      chronological and numbered in order, conjugation objects have 6 persons per tense,
      and an optional `simple` block has one {fr,en} per sentence of engine/sentences.js's split.
   Prints which entries the page would display. Exit code 1 on any failure. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const KINDS = new Set(['note','entry','report','portrait','memory','plan']);
const LEVELS = new Set(['B1','B1+','B2']);
let bad = 0;
const fail = (...m) => { console.log('  ✗', ...m); bad++; };

// ── 1) syntax ──
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const tmp = path.join(ROOT, 'check.js');
fs.writeFileSync(tmp, scripts[scripts.length - 1]);
const engine = spawnSync('node', ['--check', tmp], { encoding: 'utf8' });
fs.unlinkSync(tmp);
if (engine.status !== 0) fail('index.html inline script:', engine.stderr.trim()); else console.log('  index.html engine OK');

const files = ['notes/manifest.js', ...fs.readdirSync(path.join(ROOT, 'notes')).filter(f => f.endsWith('.js') && f !== 'manifest.js').sort().map(f => 'notes/' + f)];
for (const f of files) {
  const r = spawnSync('node', ['--check', path.join(ROOT, f)], { encoding: 'utf8' });
  if (r.status !== 0) fail(f, r.stderr.trim()); else console.log('  ' + f + ' OK');
}
if (bad) { console.log('SYNTAX FAILURES: ' + bad); process.exit(1); }

// ── 2) data ──
const POSTS = [];
const sb = { window: {}, console, FelixNotes: {
  register: p => POSTS.push(p),
  verb: (inf, pres, pc, imp, fut) => ({ inf, conj: [['Présent', pres], ['Passé composé', pc], ['Imparfait', imp], ['Futur simple', fut]] }),
} };
sb.window.FelixNotes = sb.FelixNotes;
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'engine/sentences.js'), 'utf8'), sb);
const splitSentences = sb.window.splitSentences;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'notes/manifest.js'), 'utf8'), sb);
const M = sb.window.NOTES_MANIFEST;
if (!Array.isArray(M) || !M.length) { fail('manifest missing or empty'); process.exit(1); }

const seen = new Set();
M.forEach((e, i) => {
  if (!e.id || !e.file || !e.date) fail('manifest entry incomplete at index', i, JSON.stringify(e));
  if (seen.has(e.id)) fail('duplicate manifest id', e.id); seen.add(e.id);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) fail('bad ISO date in manifest', e.id, e.date);
  if (i > 0 && M[i - 1].date > e.date) fail('manifest not chronological at', e.id);
  if (!fs.existsSync(path.join(ROOT, e.file))) { fail('missing file', e.file); return; }
  vm.runInContext(fs.readFileSync(path.join(ROOT, e.file), 'utf8'), sb);
});

const byId = Object.fromEntries(POSTS.map(p => [p.id, p]));
M.forEach((e, i) => {
  const p = byId[e.id];
  if (!p) { fail('file registered no entry with id', e.id); return; }
  if (p.no !== i + 1) fail('entry `no` should be', i + 1, 'for', p.id, 'got', p.no);
  if (p.date !== e.date) fail('date mismatch', p.id, p.date, 'vs manifest', e.date);
  if (!KINDS.has(p.kind)) fail('unknown kind', p.id, p.kind);
  if (!LEVELS.has(p.level)) fail('unknown level', p.id, p.level);
  if (p.kind !== 'note' && !p.title) fail('title required for kind', p.kind, p.id);
  if (!Array.isArray(p.fr) || !Array.isArray(p.en) || !p.fr.length) fail('fr/en missing', p.id);
  else if (p.fr.length !== p.en.length) fail('FR/EN MISMATCH', p.id, p.fr.length, 'vs', p.en.length);
  if ((p.lat == null) !== (p.lng == null)) fail('lat/lng must come together', p.id);
  if (p.lat != null && (typeof p.lat !== 'number' || typeof p.lng !== 'number')) fail('BAD COORDS', p.id);
  (p.vocab || []).forEach(v => {
    if (!Array.isArray(v) || v.length < 2) { fail('bad vocab row', p.id, JSON.stringify(v)); return; }
    const c = v[2];
    if (c) {
      if (!c.inf || !Array.isArray(c.conj)) fail('BAD CONJ', p.id, v[0]);
      else c.conj.forEach(t => { if (!Array.isArray(t[1]) || t[1].length !== 6) fail('CONJ!=6', p.id, v[0], t[0]); });
    }
  });
  (p.gram || []).forEach((g, gi) => { if (!g.h || !g.p) fail('gram note incomplete', p.id, gi); });
  // `simple` (optional): one array per paragraph, one {fr,en} per sentence of the shared split
  let simpleTag = '  ';
  if (p.simple != null) {
    simpleTag = 'S ';
    if (!Array.isArray(p.simple) || p.simple.length !== p.fr.length) fail('SIMPLE: need one array per paragraph', p.id, (p.simple||[]).length, 'vs', p.fr.length);
    else p.fr.forEach((para, i) => {
      const n = splitSentences(para).length, arr = p.simple[i];
      if (!Array.isArray(arr) || arr.length !== n) { fail(`SIMPLE ¶${i}: ${Array.isArray(arr)?arr.length:'?'} items vs ${n} sentences`, p.id, '— run node tools/split.mjs', p.id); return; }
      arr.forEach((it, j) => { if (!it || typeof it.fr !== 'string' || typeof it.en !== 'string' || !it.fr.trim() || !it.en.trim()) fail(`SIMPLE ${i}:${j} needs {fr,en}`, p.id); });
    });
  }
  const minGram = p.kind === 'note' ? 1 : 3;
  if ((p.gram || []).length < minGram) fail('gram <', minGram, 'for kind', p.kind, p.id);
  const words = p.fr.join(' ').split(/\s+/).length;
  console.log(`  #${String(p.no).padStart(2)} ${p.date} ${p.kind.padEnd(8)} ${p.level.padEnd(3)} ${String(words).padStart(4)} words  ${(p.vocab||[]).length} vocab  ${(p.gram||[]).length} gram  ${simpleTag}${p.lat!=null?'📍':'  '} ${p.title || '(note)'}`);
});

console.log('Displayed (all, oldest first):', M.map(e => e.id).join(', '));
console.log(bad ? 'FAILURES: ' + bad : 'ALL DATA CHECKS PASS');
process.exit(bad ? 1 : 0);
