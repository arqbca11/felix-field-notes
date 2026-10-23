#!/usr/bin/env node
/* Build LEARNER-PROFILE.md — the learner's forgetting curve — from what the page logged.
   Run from the field-notes/ folder:   node tools/learner-profile.ts
   Inputs : learning/*.jsonl (events logged by index.html in Learn mode), questions.md (Demander),
            the entries (to recognise words and to know where an item was met again).
   Env    : LEARN_DIR (default "learning"), NOW (ISO date, default now), OUT (default LEARNER-PROFILE.md).
   TEST MODE (CLAUDE.md §8c): the profile is observed, not yet used to write entries.

   Model, per item (a pronunciation spot, a word or expression, a dictation word):
   - a STRUGGLE is a click on a hard spot, a lookup, a dictation miss, a question about it, or a
     mistake in a written answer (Écrire — tracked by its rule: "gender", "auxiliary être/avoir"…);
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
const OUT = path.resolve(ROOT, process.env.OUT || 'LEARNER-PROFILE.md');
const DAY = 86400000;

/** One line of learning/*.jsonl (written by the page's logEvent), plus its parsed time. */
interface LogEvent {
  ts: string; s: string; e: string; id: string; no: number; time: number;
  t?: string; kind?: string; i?: number; j?: number; missed?: string[];
  mistakes?: { wrong: string; right: string; rule: string }[];
}
/** One Demander record from questions.md. */
interface Question { date: string; no: number; title: string; expr: string | null; sentence: string | null; q: string }
interface Item {
  key: string; label: string; type: string; kind?: string; entry?: string;
  struggles: { time: number; session: string }[]; where: Set<string>;
}
interface SentenceStat { entry: string; no: number; text?: string; lire: number; simple: number; sessions: Set<string> }
interface WriteMistake { time: number; entry: string; no: number; rule: string; wrong: string; right: string }
interface TimelineEvent { time: number; lapse?: boolean; n?: number; clean?: boolean; entry?: string; session?: string }

// ── entries ──
const POSTS: Entry[] = [];
const sb: Record<string, any> = { window: {} as Partial<Window>, console,   // the vm sandbox
  FelixNotes: { register: (p: Entry) => POSTS.push(p), verb: (inf: string, ...t: Persons[]) => ({ inf, conj: t }) } };
sb.window.FelixNotes = sb.FelixNotes;
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'notes/manifest.js'), 'utf8'), sb);
(sb.window.NOTES_MANIFEST as ManifestEntry[]).forEach(e => vm.runInContext(fs.readFileSync(path.join(ROOT, e.file), 'utf8'), sb));
const byId = Object.fromEntries(POSTS.map(p => [p.id, p]));

const norm = (s: string | null | undefined): string => (s || '').toLowerCase().replace(/[’]/g, "'").replace(/[.,;:!?«»"“”()\[\]…—–]/g, ' ').replace(/\s+/g, ' ').trim();
// Word → lemma, from the entries' vocab (keys, infinitives and every conjugated form).
const LEMMA = new Map<string, string>();
const bare = (k: string) => k.replace(/^(un|une|des|le|la|les|du|de la|de l'|l')\s*/, '').trim();   // "des cailloux" → "cailloux"
POSTS.forEach(p => (p.vocab || []).forEach(v => {
  const key = norm(v[0].replace(/\(.*?\)/g, '')); if (!key) return;
  const lemma = v[2] && v[2].inf ? norm(v[2].inf) : bare(key.split(' / ')[0]);
  [key, ...key.split(' / ')].forEach(k => [k, bare(k)].forEach(x => { if (x && !LEMMA.has(x)) LEMMA.set(x, lemma); }));
  if (v[2] && v[2].conj) v[2].conj.flat(2).forEach((form: string | Persons) => {
    const f = norm(String(form)); if (!f) return;
    if (!LEMMA.has(f)) LEMMA.set(f, lemma);
    const last = f.split(/[ ']/).pop(); if (last && last.length > 3 && !LEMMA.has(last)) LEMMA.set(last, lemma);
  });
}));
const lemmaOf = (t: string): string => LEMMA.get(norm(t)) || LEMMA.get(norm(t).replace(/^(l|d|j|n|s|c|m|t|qu)'/, '')) || norm(t);
const entryText = Object.fromEntries(POSTS.map(p => [p.id, ' ' + norm(p.fr.join(' ')) + ' ']));
const STOP = new Set('le la les un une des de du d l j à au aux et ou en y ne pas que qui ce se sa son ses mon ma mes il elle on je tu nous vous ils elles a est'.split(' '));

// ── events ──
const events: LogEvent[] = [];
if (fs.existsSync(LEARN_DIR)) for (const f of fs.readdirSync(LEARN_DIR).filter(f => f.endsWith('.jsonl')).sort()) {
  for (const line of fs.readFileSync(path.join(LEARN_DIR, f), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { const e: LogEvent = JSON.parse(line); e.time = new Date(e.ts).getTime(); if (!isNaN(e.time)) events.push(e); } catch { /* skip a bad line */ }
  }
}
// Demander questions (questions.md): each is a struggle on its highlighted expression, dated by day.
const questions: Question[] = [];
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
const items = new Map<string, Item>();
function struggle(key: string, label: string, type: string, time: number, session: string, extra: { kind?: string; entry?: string } = {}) {
  if (!items.has(key)) items.set(key, { key, label, type, struggles: [], where: new Set(), ...extra });
  const it = items.get(key)!; it.struggles.push({ time, session });
  if (extra.entry) it.where.add(extra.entry);
}
const sentences = new Map<string, SentenceStat>();   // hard sentences, by id:i:j
const dictMiss = new Map<string, number>();
const writeMistakes: WriteMistake[] = [];
for (const e of events) {
  const entry = e.id;
  if (e.e === 'hard' && e.t) struggle('pron|' + norm(e.t), e.t, 'prononciation', e.time, e.s, { kind: e.kind, entry });
  else if (e.e === 'lookup' && e.t) { const l = lemmaOf(e.t); struggle('word|' + l, l === norm(e.t) ? e.t : `${e.t} → ${l}`, 'mot', e.time, e.s, { entry }); }
  else if (e.e === 'dict') (e.missed || []).map(w => norm(w)).filter(w => w && !STOP.has(w)).forEach(w => {
    struggle('spell|' + w, w, 'dictée', e.time, e.s, { entry });
    dictMiss.set(w, (dictMiss.get(w) || 0) + 1);
  });
  else if (e.e === 'write') (e.mistakes || []).filter(m => m && m.rule).forEach(m => {
    struggle('write|' + norm(m.rule), m.rule, 'écriture', e.time, e.s, { entry });
    writeMistakes.push({ time: e.time, entry, no: e.no, rule: m.rule, wrong: m.wrong, right: m.right });
  });
  else if (e.e === 'sent' || e.e === 'simple') {
    const k = `${entry}:${e.i}:${e.j}`, s = sentences.get(k) || { entry, no: e.no, text: e.t, lire: 0, simple: 0, sessions: new Set() };
    s[e.e === 'sent' ? 'lire' : 'simple']++; s.sessions.add(e.s); sentences.set(k, s);
  }
}
for (const q of questions) if (q.expr) {
  const t = new Date(q.date + 'T12:00:00Z').getTime();
  struggle('word|' + lemmaOf(q.expr), q.expr, 'question', t, 'q-' + q.date, { entry: POSTS.find(p => p.no === q.no)?.id });
}
const views = events.filter(e => e.e === 'view');
const writes = events.filter(e => e.e === 'write');

// ── the curve ──
function curve(it: Item) {
  const struggleSessions = new Set(it.struggles.map(s => s.session));
  const lapses: { time: number; session: string; n: number }[] = [];
  for (const s of it.struggles) {
    const last = lapses[lapses.length - 1];
    if (last && last.session === s.session) last.n++; else lapses.push({ time: s.time, session: s.session, n: 1 });
  }
  const needle = ' ' + norm(it.label.split(' → ')[0]) + ' ';
  // A writing rule is met cleanly by a later written answer without that mistake; anything else by
  // an entry on screen that contains it.
  const clean = it.type === 'écriture'
    ? writes.filter(w => !struggleSessions.has(w.s)).map(w => ({ time: w.time, clean: true, entry: w.id }))
    : views.filter(v => !struggleSessions.has(v.s) && entryText[v.id] && entryText[v.id].includes(needle))
                     .map(v => ({ time: v.time, clean: true, entry: v.id }));
  const timeline: TimelineEvent[] = [...lapses.map(l => ({ ...l, lapse: true })), ...clean].sort((a, b) => a.time - b.time);
  let h: number | null = null, tLast = 0, nLapses = 0, nClean = 0;
  for (const ev of timeline) {
    if (ev.lapse) {
      h = h === null ? (ev.n! >= 3 ? 0.5 : 1) : Math.max(0.25, h * 0.5);
      tLast = ev.time; nLapses++;
    } else if (h !== null && (ev.time - tLast) / DAY >= h / 2) {
      h = Math.min(120, h * 2); tLast = ev.time; nClean++;
    }
  }
  const half = h ?? 1;   // every item has at least one lapse, so h is set
  const since = (NOW.getTime() - tLast) / DAY, recall = Math.pow(2, -since / half);
  const intensity = lapses.reduce((a, l) => a + l.n, 0);
  return { h: half, tLast, since, recall, nLapses, nClean, intensity,
           score: (1 - recall) * (1 + 0.5 * (nLapses - 1)) * Math.min(2, 1 + (intensity - 1) * 0.15) };
}
const rows = [...items.values()].map(it => ({ it, ...curve(it) }));
const due = rows.filter(r => r.recall < 0.5).sort((a, b) => b.score - a.score);
const fading = rows.filter(r => r.recall >= 0.5 && r.recall < 0.8).sort((a, b) => a.recall - b.recall);
const solid = rows.filter(r => r.nClean >= 2 && r.h >= 14).sort((a, b) => b.h - a.h);

// ── write LEARNER-PROFILE.md ──
const fmtD = (t: number) => new Date(t).toISOString().slice(0, 10);
const pct = (x: number) => Math.round(x * 100) + ' %';
const days = (x: number) => x < 1 ? `${Math.round(x * 24)} h` : `${x.toFixed(x < 10 ? 1 : 0)} j`;
const cell = (s: unknown) => String(s).replace(/\|/g, '\\|');
type Row = ReturnType<typeof curve> & { it: Item };
const would = (r: Row) => (({
  prononciation: `reuse « ${r.it.label} » (or the same ${r.it.kind || 'pattern'}) in a new sentence, and mark it in \`read\``,
  mot: `reuse « ${r.it.label.split(' → ').pop()} » in a fresh context; vocab row again`,
  dictée: `put « ${r.it.label} » in a short, dictation-friendly sentence`,
  question: `a grammar/usage note on « ${r.it.label} » from a new angle, plus one example`,
  écriture: `a writing question that invites the "${r.it.label}" pattern again, and a gram note on it`,
} as Record<string, string>)[r.it.type] || 'reuse it');
const table = (list: Row[], withWould: boolean) => list.length ? [
  `| Item | Type | Lapses (struggles) | Clean meetings | Last | Half-life | Recall now${withWould ? ' | What a brief would do' : ''} |`,
  `|---|---|---|---|---|---|---|${withWould ? '---|' : ''}`,
  ...list.map(r => `| ${cell(r.it.label)} | ${r.it.type}${r.it.kind ? ' · ' + r.it.kind : ''} | ${r.nLapses} (${r.intensity}) | ${r.nClean} | ${fmtD(r.tLast)} | ${days(r.h)} | ${pct(r.recall)}${withWould ? ' | ' + cell(would(r)) : ''} |`)
].join('\n') : '_Nothing yet._';

const byType = events.reduce((m, e) => (m[e.e] = (m[e.e] || 0) + 1, m), {} as Record<string, number>);
const sessions = new Set(events.map(e => e.s));
const hardSent = [...sentences.values()].map(s => ({ ...s, n: s.lire + s.simple * 1.5 + (s.sessions.size - 1) }))
  .sort((a, b) => b.n - a.n).slice(0, 12);

const md = `# Learner profile — the forgetting curve (TEST MODE)

> **About you, not about the story.** Your French: what you look up, click, mistype and forget, and when
> it's due again. For what a reader of the *story* knows and suspects, see \`STORY-READER.md\`.
>
> **Observation only.** Built by \`tools/learner-profile.ts\` from what the page logged in Learn mode
> (\`learning/*.jsonl\`) and from \`questions.md\`. \`/new-entries\` reads it and **reports what it would
> have done**, but does **not** change any brief because of it yet (CLAUDE.md §8c). Regenerate any time:
> \`node tools/learner-profile.ts\`.

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

## Writing: latest corrections
Mistakes Claude corrected in the learner's own answers (Écrire), newest first; the rule is the item on the curve.

${writeMistakes.length ? writeMistakes.slice(-20).reverse().map(m => `- ${fmtD(m.time)} · #${m.no} · ${m.rule}: « ${m.wrong} » → « ${m.right} »`).join('\n') : '_Nothing yet._'}

## Questions asked (latest 20)
Raw, for the planner to group by topic (a tense, a construction, a sound): repeated topics count as lapses too.

${questions.length ? questions.slice(-20).reverse().map(q => `- ${q.date} · #${q.no}${q.expr ? ` · « ${q.expr} »` : ''} — ${q.q}`).join('\n') : '_None yet._'}

## How this is computed
A **struggle** is a hard spot clicked in Lire, a word looked up, a word missed in a dictation, or a
question about a highlighted expression, or a mistake in a written answer (by its rule); the struggles of one reading session make one **lapse**. A
**clean meeting** is an entry that contains the item, on screen for 20 s in Learn mode, in a session
with no struggle on it (for a writing rule: a later written answer without that mistake). Each item has a memory **half-life**: 1 day after the first lapse (half a day
if it was clicked three times or more), **doubled** by a clean meeting at least half a half-life
later, **halved** by a new lapse. **Recall now** ≈ 2^(−days since the last event ÷ half-life).
`;
fs.writeFileSync(OUT, md);

// ── A short, approximate summary for the page's Demander (learning/summary.js) ──
// A few plain lines, so Claude on the page can connect an answer to what the learner has struggled
// with before. Approximate on purpose: it only needs to feel like "it knows me".
// Recency-weighted, with age counted in READING DAYS (days the learner actually used the app), not
// calendar days: ten days away don't fade anything, ten days of daily reading do. Each occurrence
// counts 2^(−reading days since / 7) and repeats add up, so what keeps coming back stays on top: a
// one-off drops out after ~12 reading days, a topic asked three times after ~3 weeks of reading
// without coming back to it.
const HALF = 7, KEEP = 0.3;                                    // weight below KEEP = not worth mentioning
const dayOf = (t: number) => new Date(t).toISOString().slice(0, 10);
const READING_DAYS = [...new Set([...events.map(e => dayOf(e.time)), ...questions.map(q => q.date)])].sort();
const age = (t: number) => { const d = dayOf(t); return READING_DAYS.filter(x => x > d && x <= dayOf(NOW.getTime())).length; };   // reading days since
const ago = (t: number) => { const d = age(t); return d === 0 ? 'latest reading day' : d === 1 ? '1 reading day ago' : `${d} reading days ago`; };
interface Faded { label: string; n: number; last: number; w: number }
function faded<T>(list: T[], keyOf: (x: T) => string | undefined, labelOf: (x: T) => string, timeOf: (x: T) => number): Faded[] {                  // → [{label, n, last, w}] by weight
  const g = new Map<string, Faded>();
  for (const x of list) {
    const k = keyOf(x); if (!k) continue;
    const w = Math.pow(2, -age(timeOf(x)) / HALF);
    const cur = g.get(k) || { label: labelOf(x), n: 0, last: 0, w: 0 };
    cur.n++; cur.w += w; if (timeOf(x) >= cur.last) { cur.last = timeOf(x); cur.label = labelOf(x); }
    g.set(k, cur);
  }
  return [...g.values()].filter(v => v.w >= KEEP).sort((a, b) => b.w - a.w);
}
const tag = (v: Faded) => `${v.n > 1 ? `×${v.n}, last ` : ''}${ago(v.last)}`;
const qTime = (q: Question) => new Date(q.date + 'T12:00:00Z').getTime();
const qTopics = faded(questions, q => q.expr ? 'e|' + lemmaOf(q.expr) : 'q|' + norm(q.q).slice(0, 40),
  q => q.expr ? `« ${q.expr} »${q.q ? ` (${q.q.slice(0, 60)})` : ''}` : q.q.slice(0, 70), qTime).slice(0, 8);
const lookups = faded(events.filter(e => e.e === 'lookup'), e => lemmaOf(e.t!), e => e.t!, e => e.time).slice(0, 10);
const hardSpots = faded(events.filter(e => e.e === 'hard'), e => norm(e.t), e => e.t!, e => e.time).slice(0, 8);
const writeSlips = faded(writeMistakes, m => norm(m.rule), m => `${m.rule} (« ${m.wrong} » → « ${m.right} »)`, m => m.time).slice(0, 6);
const recentDue = due.filter(r => age(r.tLast) <= 10).slice(0, 6);
const replays = [...sentences.values()].filter(s => s.lire + s.simple >= 2).length;
const readNos = [...new Set(events.filter(e => e.e === 'view').map(e => e.no))].sort((a, b) => a - b);
const lines = [
  `Approximate, from the learner's reading log and saved questions (updated ${NOW.toISOString().slice(0, 10)}). Ages are in reading days (days they used the app): recent and repeated things weigh most; what they haven't come back to over ~2 weeks of reading has been dropped; time away doesn't count.`,
  qTopics.length ? `- On their mind lately (questions): ${qTopics.map(v => `${v.label} [${tag(v)}]`).join('; ')}.` : '',
  lookups.length ? `- Words they've been looking up: ${lookups.map(v => `${v.label} [${tag(v)}]`).join(', ')}.` : '',
  hardSpots.length ? `- Pronunciation spots they clicked: ${hardSpots.map(v => `${v.label} [${tag(v)}]`).join(', ')}.` : '',
  recentDue.length ? `- Probably fading (struggled within the last ~10 reading days, not met again since): ${recentDue.map(r => r.it.label.split(' → ').pop()).join(', ')}.` : '',
  solid.length ? `- Solid by now: ${solid.slice(0, 6).map(r => r.it.label.split(' → ').pop()).join(', ')}.` : '',
  replays ? `- Replays or simplifies long sentences fairly often (${replays} sentence${replays > 1 ? 's' : ''} more than once).` : '',
  writeSlips.length ? `- Mistakes in their own written answers: ${writeSlips.map(v => `${v.label} [${tag(v)}]`).join('; ')}.` : '',
  dictMiss.size ? `- Dictation slips: ${[...dictMiss.keys()].slice(0, 8).join(', ')}.` : '',
  readNos.length ? `- Has read entries ${readNos.join(', ')} in Learn mode.` : '',
].filter(Boolean);
const summary = lines.length > 1 ? lines.join('\n') : '';
const SUMMARY_JS = path.resolve(ROOT, process.env.SUMMARY_OUT || 'learning/summary.js');
fs.mkdirSync(path.dirname(SUMMARY_JS), { recursive: true });
fs.writeFileSync(SUMMARY_JS, `/* Generated by tools/learner-profile.ts — a short, approximate learner summary that the page's
   Demander sends to Claude as background. Don't edit by hand; rerun the script. */
window.FELIX_LEARNER_SUMMARY = ${JSON.stringify(summary)};
`);
console.log(`${path.relative(ROOT, OUT)}: ${events.length} events, ${rows.length} items — ${due.length} due, ${fading.length} fading, ${solid.length} solid, ${questions.length} questions`);
