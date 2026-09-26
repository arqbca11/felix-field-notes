#!/usr/bin/env node
/* Build LEARNER.md — the learner's forgetting curve — from what the page logged.
   Run from the field-notes/ folder:   node tools/learner-profile.mjs
   Inputs : learning/*.jsonl (events logged by index.html in Learn mode), questions.md (Demander),
            the entries (to recognise words and to know where an item was met again).
   Env    : LEARN_DIR (default "learning"), NOW (ISO date, default now), OUT (default LEARNER.md).
   TEST MODE (CLAUDE.md §8c): the profile is observed, not yet used to write entries.

   Model, per item (a pronunciation spot, a word or expression, a dictation word):
   - a STRUGGLE is a click on a hard spot, a lookup, a dictation miss, or a question about it;
     all struggles in one reading session count as one LAPSE (with an intensity = how many);
   - a CLEAN MEETING is an entry containing the item, on screen ≥ 20 s in Learn mode, in a
     session with no struggle on that item;
   - a memory half-life h (days) starts at 1 (0.5 if the first lapse was intense); a clean
     meeting at least h/2 after the last event doubles it (max 120), a new lapse halves it
     (min 0.25). Recall now ≈ 2^(-days since last event / h). Due when recall < 50 %. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const LEARN_DIR = path.resolve(ROOT, process.env.LEARN_DIR || 'learning');
const NOW = process.env.NOW ? new Date(process.env.NOW) : new Date();
const OUT = path.resolve(ROOT, process.env.OUT || 'LEARNER.md');
const DAY = 86400000;

// ── entries ──
const POSTS = [];
const sb = { window: {}, console, FelixNotes: { register: p => POSTS.push(p), verb: (inf, ...t) => ({ inf, conj: t }) } };
sb.window.FelixNotes = sb.FelixNotes;
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'notes/manifest.js'), 'utf8'), sb);
sb.window.NOTES_MANIFEST.forEach(e => vm.runInContext(fs.readFileSync(path.join(ROOT, e.file), 'utf8'), sb));
const byId = Object.fromEntries(POSTS.map(p => [p.id, p]));

const norm = s => (s || '').toLowerCase().replace(/[’]/g, "'").replace(/[.,;:!?«»"“”()\[\]…—–]/g, ' ').replace(/\s+/g, ' ').trim();
// Word → lemma, from the entries' vocab (keys, infinitives and every conjugated form).
const LEMMA = new Map();
const bare = k => k.replace(/^(un|une|des|le|la|les|du|de la|de l'|l')\s*/, '').trim();   // "des cailloux" → "cailloux"
POSTS.forEach(p => (p.vocab || []).forEach(v => {
  const key = norm(v[0].replace(/\(.*?\)/g, '')); if (!key) return;
  const lemma = v[2] && v[2].inf ? norm(v[2].inf) : bare(key.split(' / ')[0]);
  [key, ...key.split(' / ')].forEach(k => [k, bare(k)].forEach(x => { if (x && !LEMMA.has(x)) LEMMA.set(x, lemma); }));
  if (v[2] && v[2].conj) v[2].conj.flat(2).forEach(form => {
    const f = norm(String(form)); if (!f) return;
    if (!LEMMA.has(f)) LEMMA.set(f, lemma);
    const last = f.split(/[ ']/).pop(); if (last && last.length > 3 && !LEMMA.has(last)) LEMMA.set(last, lemma);
  });
}));
const lemmaOf = t => LEMMA.get(norm(t)) || LEMMA.get(norm(t).replace(/^(l|d|j|n|s|c|m|t|qu)'/, '')) || norm(t);
const entryText = Object.fromEntries(POSTS.map(p => [p.id, ' ' + norm(p.fr.join(' ')) + ' ']));
const STOP = new Set('le la les un une des de du d l j à au aux et ou en y ne pas que qui ce se sa son ses mon ma mes il elle on je tu nous vous ils elles a est'.split(' '));

// ── events ──
const events = [];
if (fs.existsSync(LEARN_DIR)) for (const f of fs.readdirSync(LEARN_DIR).filter(f => f.endsWith('.jsonl')).sort()) {
  for (const line of fs.readFileSync(path.join(LEARN_DIR, f), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { const e = JSON.parse(line); e.time = new Date(e.ts).getTime(); if (!isNaN(e.time)) events.push(e); } catch { /* skip a bad line */ }
  }
}
// Demander questions (questions.md): each is a struggle on its highlighted expression, dated by day.
const questions = [];
const qPath = path.join(ROOT, 'questions.md');
if (fs.existsSync(qPath)) {
  for (const block of fs.readFileSync(qPath, 'utf8').split(/\n(?=## \d{4}-\d{2}-\d{2})/)) {
    const h = /^## (\d{4}-\d{2}-\d{2}) · #(\d+) (.*?)(?: · ([\w.-]+))?$/m.exec(block); if (!h) continue;
    const expr = /\*\*Expression :\*\* « (.*?) »/.exec(block), sentence = /\*\*Phrase :\*\* « (.*?) »/.exec(block);
    const q = /\*\*Q :\*\* (.*)/.exec(block);
    questions.push({ date: h[1], no: +h[2], title: h[3], expr: expr && expr[1], sentence: sentence && sentence[1], q: q ? q[1].trim() : '' });
  }
}
events.sort((a, b) => a.time - b.time);

// ── items ──
const items = new Map();   // key -> {label, type, kind, struggles:[{time, session}], where:Set}
function struggle(key, label, type, time, session, extra = {}) {
  if (!items.has(key)) items.set(key, { key, label, type, struggles: [], where: new Set(), ...extra });
  const it = items.get(key); it.struggles.push({ time, session });
  if (extra.entry) it.where.add(extra.entry);
}
const sentences = new Map();   // hard sentences: id:i:j -> {text, lire, simple, sessions}
const dictMiss = new Map();
for (const e of events) {
  const entry = e.id;
  if (e.e === 'hard' && e.t) struggle('pron|' + norm(e.t), e.t, 'prononciation', e.time, e.s, { kind: e.kind, entry });
  else if (e.e === 'lookup' && e.t) { const l = lemmaOf(e.t); struggle('word|' + l, l === norm(e.t) ? e.t : `${e.t} → ${l}`, 'mot', e.time, e.s, { entry }); }
  else if (e.e === 'dict') (e.missed || []).map(norm).filter(w => w && !STOP.has(w)).forEach(w => {
    struggle('spell|' + w, w, 'dictée', e.time, e.s, { entry });
    dictMiss.set(w, (dictMiss.get(w) || 0) + 1);
  });
  else if (e.e === 'sent' || e.e === 'simple') {
    const k = `${entry}:${e.i}:${e.j}`, s = sentences.get(k) || { entry, no: e.no, text: e.t, lire: 0, simple: 0, sessions: new Set() };
    s[e.e === 'sent' ? 'lire' : 'simple']++; s.sessions.add(e.s); sentences.set(k, s);
  }
}
for (const q of questions) if (q.expr) {
  const t = new Date(q.date + 'T12:00:00Z').getTime();
  struggle('word|' + lemmaOf(q.expr), q.expr, 'question', t, 'q-' + q.date, { entry: (POSTS.find(p => p.no === q.no) || {}).id });
}
const views = events.filter(e => e.e === 'view');

// ── the curve ──
function curve(it) {
  const struggleSessions = new Set(it.struggles.map(s => s.session));
  const lapses = [];
  for (const s of it.struggles) {
    const last = lapses[lapses.length - 1];
    if (last && last.session === s.session) last.n++; else lapses.push({ time: s.time, session: s.session, n: 1 });
  }
  const needle = ' ' + norm(it.label.split(' → ')[0]) + ' ';
  const clean = views.filter(v => !struggleSessions.has(v.s) && entryText[v.id] && entryText[v.id].includes(needle))
                     .map(v => ({ time: v.time, clean: true, entry: v.id }));
  const timeline = [...lapses.map(l => ({ ...l, lapse: true })), ...clean].sort((a, b) => a.time - b.time);
  let h = null, tLast = null, nLapses = 0, nClean = 0;
  for (const ev of timeline) {
    if (ev.lapse) {
      h = h === null ? (ev.n >= 3 ? 0.5 : 1) : Math.max(0.25, h * 0.5);
      tLast = ev.time; nLapses++;
    } else if (h !== null && (ev.time - tLast) / DAY >= h / 2) {
      h = Math.min(120, h * 2); tLast = ev.time; nClean++;
    }
  }
  const since = (NOW - tLast) / DAY, recall = Math.pow(2, -since / h);
  const intensity = lapses.reduce((a, l) => a + l.n, 0);
  return { h, tLast, since, recall, nLapses, nClean, intensity,
           score: (1 - recall) * (1 + 0.5 * (nLapses - 1)) * Math.min(2, 1 + (intensity - 1) * 0.15) };
}
const rows = [...items.values()].map(it => ({ it, ...curve(it) }));
const due = rows.filter(r => r.recall < 0.5).sort((a, b) => b.score - a.score);
const fading = rows.filter(r => r.recall >= 0.5 && r.recall < 0.8).sort((a, b) => a.recall - b.recall);
const solid = rows.filter(r => r.nClean >= 2 && r.h >= 14).sort((a, b) => b.h - a.h);

// ── write LEARNER.md ──
const fmtD = t => new Date(t).toISOString().slice(0, 10);
const pct = x => Math.round(x * 100) + ' %';
const days = x => x < 1 ? `${Math.round(x * 24)} h` : `${x.toFixed(x < 10 ? 1 : 0)} j`;
const cell = s => String(s).replace(/\|/g, '\\|');
const would = r => ({
  prononciation: `reuse « ${r.it.label} » (or the same ${r.it.kind || 'pattern'}) in a new sentence, and mark it in \`read\``,
  mot: `reuse « ${r.it.label.split(' → ').pop()} » in a fresh context; vocab row again`,
  dictée: `put « ${r.it.label} » in a short, dictation-friendly sentence`,
  question: `a grammar/usage note on « ${r.it.label} » from a new angle, plus one example`,
}[r.it.type] || 'reuse it');
const table = (list, withWould) => list.length ? [
  `| Item | Type | Lapses (struggles) | Clean meetings | Last | Half-life | Recall now${withWould ? ' | What a brief would do' : ''} |`,
  `|---|---|---|---|---|---|---|${withWould ? '---|' : ''}`,
  ...list.map(r => `| ${cell(r.it.label)} | ${r.it.type}${r.it.kind ? ' · ' + r.it.kind : ''} | ${r.nLapses} (${r.intensity}) | ${r.nClean} | ${fmtD(r.tLast)} | ${days(r.h)} | ${pct(r.recall)}${withWould ? ' | ' + cell(would(r)) : ''} |`)
].join('\n') : '_Nothing yet._';

const byType = events.reduce((m, e) => (m[e.e] = (m[e.e] || 0) + 1, m), {});
const sessions = new Set(events.map(e => e.s));
const hardSent = [...sentences.values()].map(s => ({ ...s, n: s.lire + s.simple * 1.5 + (s.sessions.size - 1) }))
  .sort((a, b) => b.n - a.n).slice(0, 12);

const md = `# Learner profile — the forgetting curve (TEST MODE)

> **Observation only.** Built by \`tools/learner-profile.mjs\` from what the page logged in Learn mode
> (\`learning/*.jsonl\`) and from \`questions.md\`. \`/new-entries\` reads it and **reports what it would
> have done**, but does **not** change any brief because of it yet (CLAUDE.md §8c). Regenerate any time:
> \`node tools/learner-profile.mjs\`.

**Built:** ${NOW.toISOString().slice(0, 16).replace('T', ' ')} UTC · **Events:** ${events.length}${events.length ? ` (${Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(', ')})` : ''} · **Reading sessions:** ${sessions.size}${events.length ? ` · **From** ${fmtD(events[0].time)} **to** ${fmtD(events[events.length - 1].time)}` : ''} · **Questions:** ${questions.length} · **Items tracked:** ${rows.length}

## Due for repetition
Recall estimated below 50 %: the items the next entries would bring back, most urgent first.

${table(due.slice(0, 20), true)}

## Fading soon
Recall between 50 and 80 %: worth a touch in the next week.

${table(fading.slice(0, 15), false)}

## Solid
Met again cleanly at least twice, half-life of two weeks or more: no need to repeat on purpose.

${table(solid.slice(0, 15), false)}

## Hardest sentences
Played again in Lire or opened in Simplifier the most: a sign the sentence's structure, not one word, is the hurdle.

${hardSent.length ? hardSent.map(s => `- #${s.no} (${s.entry}) — Lire ×${s.lire}, Simplifier ×${s.simple}, ${s.sessions.size} session(s): « ${s.text || '?'} »`).join('\n') : '_Nothing yet._'}

## Dictation: most-missed words

${dictMiss.size ? [...dictMiss.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([w, n]) => `« ${w} » ×${n}`).join(' · ') : '_Nothing yet._'}

## Questions asked (latest 20)
Raw, for the planner to group by topic (a tense, a construction, a sound): repeated topics count as lapses too.

${questions.length ? questions.slice(-20).reverse().map(q => `- ${q.date} · #${q.no}${q.expr ? ` · « ${q.expr} »` : ''} — ${q.q}`).join('\n') : '_None yet._'}

## How this is computed
A **struggle** is a hard spot clicked in Lire, a word looked up, a word missed in a dictation, or a
question about a highlighted expression; the struggles of one reading session make one **lapse**. A
**clean meeting** is an entry that contains the item, on screen for 20 s in Learn mode, in a session
with no struggle on it. Each item has a memory **half-life**: 1 day after the first lapse (half a day
if it was clicked three times or more), **doubled** by a clean meeting at least half a half-life
later, **halved** by a new lapse. **Recall now** ≈ 2^(−days since the last event ÷ half-life).
`;
fs.writeFileSync(OUT, md);
console.log(`${path.relative(ROOT, OUT)}: ${events.length} events, ${rows.length} items — ${due.length} due, ${fading.length} fading, ${solid.length} solid, ${questions.length} questions`);
