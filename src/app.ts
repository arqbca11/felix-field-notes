/* The page engine (was the inline <script> of index.html): loader, feed, Lire / Simplifier /
   Traduction / Vocabulaire / Grammaire / Écrire / Demander, TTS, dictation, select-to-translate,
   GitHub saving and the learning log. Compiled to engine/app.js (npm run build). Plain script, no
   modules: functions are globals, as the inline onclick handlers in index.html expect. */
/* ── ENTRY REGISTRY ─────────────────────────────────────────────────────────
   This file is a TEMPLATE: it carries no entry content. Each entry lives in its
   own resource file under notes/ (text, vocab, grammar) and registers itself by
   calling FelixNotes.register(...). The loader injects every file listed in
   notes/manifest.js and renders ALL entries in chronological order (oldest first).
   See CLAUDE.md §5–§7. */
let POSTS: Entry[] = [];                           // all entries, sorted by `no`
const POST_BY_ID: Record<string, Entry> = {};                    // id -> entry object, filled by FelixNotes.register
const LOADED_FILES = new Set<string>();           // entry files already injected (never inject twice)

window.FelixNotes = {
  register(post){ POST_BY_ID[post.id] = post; },
  // Helper for verb vocab entries: build a conjugation object the notes panel can render.
  // Each tense is an array of the 6 persons (je…ils), already including pronoun + auxiliary.
  verb(inf, pres, pc, imp, fut){
    return { inf, conj:[['Présent',pres],['Passé composé',pc],['Imparfait',imp],['Futur simple',fut]] };
  }
};

const KIND_FR = { note:'Note', entry:'Journal', report:'Compte rendu', portrait:'Portrait', memory:'Souvenir', plan:'Projet' };

// Ensure the given manifest entries' scripts are loaded, then run `done`.
// Uses dynamic <script> tags (NOT fetch) so the page works opened directly via file://.
function ensureLoaded(entries: ManifestEntry[], done: () => void): void {
  const todo = entries.filter(e => !LOADED_FILES.has(e.file));
  if(!todo.length){ done(); return; }
  let pending = todo.length;
  const settle = () => { if(--pending === 0) done(); };
  todo.forEach(entry => {
    LOADED_FILES.add(entry.file);
    const s = document.createElement('script');
    s.src = entry.file;
    s.onload = settle;
    s.onerror = () => { console.error('Could not load entry:', entry.file); LOADED_FILES.delete(entry.file); settle(); };
    document.head.appendChild(s);
  });
}

// Load every entry in the manifest and render them, oldest first.
function showAll(){
  const manifest = Array.isArray(window.NOTES_MANIFEST) ? window.NOTES_MANIFEST : [];
  ensureLoaded(manifest, () => {
    stopAll();
    POSTS = manifest.map(e => POST_BY_ID[e.id]).filter(Boolean).sort((a,b)=>a.no-b.no);
    buildFeed();
    buildAxis();
  });
}

// ── ICONS ──
const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>';
const ICON_STOP = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>';
const ICON_SPIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="animation:spin .8s linear infinite"><path d="M12 3a9 9 0 1 0 9 9"/></svg>';
const ICON_PEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';

// ── SAFE STORAGE ──
// The ElevenLabs key/voice keys are shared with the travel blog on purpose (same origin on GitHub Pages).
const KEY_API='elevenlabs_api_key', KEY_VOICE='elevenlabs_voice_id', KEY_VNAME='elevenlabs_voice_name', KEY_SPEED='felix_notes_speed', KEY_LEARN='felix_notes_learn';
function getLS(k: string): string | null { try{return localStorage.getItem(k);}catch(e){return null;} }
function setLS(k: string, v: string): void { try{localStorage.setItem(k,v);}catch(e){} }
// API keys: the local, git-ignored secrets.js wins; otherwise the key pasted into the page.
// Keys are plain ASCII; copy-paste can drag in invisible or typographic characters (nbsp,
// zero-width, line breaks, “quotes”, …) that make fetch() throw on the header. Keep only visible ASCII.
function cleanKey(k: string | null | undefined): string { return (k || '').replace(/[^\x21-\x7E]/g, ''); }
function fromSecrets(name: keyof FelixSecrets): string { const s = window.FELIX_SECRETS; return (s && typeof s[name] === 'string') ? cleanKey(s[name]) : ''; }
function elevenKey(): string | null { return fromSecrets('elevenlabsKey') || cleanKey(getLS(KEY_API)) || null; }
function claudeKey(): string | null { return fromSecrets('claudeKey') || cleanKey(getLS(KEY_CLAUDE)) || null; }
function githubToken(): string | null { return fromSecrets('githubToken') || cleanKey(getLS(KEY_GH)) || null; }

// ── LEARN MODE ──
// Off = a plain diary page. On = voice controls, level tags, Lire/Traduction/Notes,
// per-paragraph play + dictation, and select-to-translate. Remembered in localStorage.
function setLearn(on: boolean): void {
  document.body.classList.toggle('learn', on);
  setLS(KEY_LEARN, on ? '1' : '0');
  if(!on){
    stopAll(); hideLookup();
    document.querySelectorAll('.en-block.open, .notes.open, .simple-block.open, .read-block.open, .ask-block.open, .write-block.open').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.post.simple-on').forEach(p => clearSimple(p));
    document.querySelectorAll('.post.read-on').forEach(p => clearRead(p));
    document.querySelectorAll('.post.ask-on').forEach(p => p.classList.remove('ask-on'));
    document.querySelectorAll('.sent.asked').forEach(x => x.classList.remove('asked'));
    document.querySelectorAll('.act.on').forEach(b => b.classList.remove('on'));
    document.querySelectorAll('.post.split').forEach(p => p.classList.remove('split'));
    document.querySelectorAll('.article p.dictating').forEach(p => p.classList.remove('dictating'));
    document.querySelectorAll('.dict-btn.on').forEach(b => b.classList.remove('on'));
    document.getElementById('keyEntry')!.style.display='none';
    document.getElementById('voicePicker')!.style.display='none'; pickerOpen=false;
    document.getElementById('ghEntry')!.classList.remove('open');
    document.getElementById('claudeEntry')!.classList.remove('open');
  }
}
function toggleLearn(): void { setLearn(!document.body.classList.contains('learn')); }

// ── DATES ──
const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const DAYS_FR = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
function frFull(isoStr: string): string {                         // "dimanche 20 septembre 2026"
  const [y,mo,d]=isoStr.split('-').map(Number);
  const dow = DAYS_FR[new Date(y,mo-1,d).getDay()];
  return `${dow} ${d}${d===1?'er':''} ${MONTHS_FR[mo-1]} ${y}`;
}

// ── BUILD FEED ──
const feed = document.getElementById('feed')!;
function buildFeed(): void {
  feed.innerHTML = '';
  if(!POSTS.length){
    feed.innerHTML = '<div class="empty-feed">Le carnet est vide.</div>';
    return;
  }
  POSTS.forEach(post => {
  const card = document.createElement('article');
  const kind = post.kind || 'entry';
  card.className = 'post ' + kind; card.id = post.id;
  const hasVocab = !!(post.vocab && post.vocab.length), hasGram = !!(post.gram && post.gram.length);
  const hasWrite = !!(post.write && post.write.length);

  // Every sentence is wrapped (Lire plays sentences on click; Simplifier rewrites them).
  // The Simplifier button only shows when the entry's `simple` block matches the split.
  const simpleOK = hasSimple(post);
  const ptext = (p: string, i: number) => splitSentences(p).map((t,j) => `<span class="sent" data-sent="${i}:${j}">${t}</span>`).join(' ');
  const frHTML = post.fr.map((p,i) =>
    `<p>`+
      `<button class="pp-btn learn-only" data-play="para" data-id="${post.id}" data-i="${i}" aria-label="Lire">${ICON_PLAY}</button>`+
      `<button class="dict-btn learn-only" data-dict="${post.id}:${i}" aria-label="Dictée" title="Dictée — écouter et écrire">${ICON_PEN}</button>`+
      `<span class="ptext">${ptext(p,i)}</span>`+
      `<span class="dictation">`+
        `<textarea class="dict-input" rows="3" placeholder="Écoutez (▶) et écrivez ce que vous entendez…"></textarea>`+
        `<span class="dict-actions">`+
          `<button class="dict-check" data-check="${post.id}:${i}">Vérifier</button>`+
          `<button class="dict-reveal" data-reveal="${post.id}:${i}">Afficher le texte</button>`+
        `</span>`+
        `<span class="dict-result"></span>`+
      `</span>`+
    `</p>`).join('');
  const enHTML = post.en.map(p => `<p>${p}</p>`).join('');
  const vocabRows = (post.vocab||[]).map((v,vi) => {
    const conj = v[2];                                 // present only on verb entries
    const btn = conj ? ` <button class="conj-btn" data-conj="${post.id}:${vi}" aria-label="Voir la conjugaison" title="Conjugaison">▾</button>` : '';
    let row = `<tr><td class="fr">${v[0]}${btn}</td><td class="en">${v[1]}</td></tr>`;
    if(conj){
      const tenses = conj.conj.map(t =>
        `<div class="conj-tense"><div class="conj-tname">${t[0]}</div><ul>${t[1].map(f=>`<li>${f}</li>`).join('')}</ul></div>`).join('');
      row += `<tr class="conj-row" id="conj-${post.id}-${vi}"><td colspan="2">`+
             `<div class="conj-inf">${conj.inf}</div><div class="conj-grid">${tenses}</div></td></tr>`;
    }
    return row;
  }).join('');
  const gramHTML = (post.gram||[]).map(g => `<div class="gram"><h4>${g.h}</h4><p>${g.p}</p></div>`).join('');

  const titleHTML = post.title
    ? `<h2>${post.title}${post.titleEn ? `<span class="en-title learn-only">${post.titleEn}</span>` : ''}</h2>` : '';
  const actionsHTML = `
      <div class="post-actions learn-only">
        <button class="act" data-toggle="read" data-id="${post.id}">Lire</button>
        <button class="act" data-toggle="en" data-id="${post.id}">Traduction</button>
        ${simpleOK ? `<button class="act" data-toggle="simple" data-id="${post.id}">Simplifier</button>` : ''}
        ${hasVocab ? `<button class="act" data-toggle="vocab" data-id="${post.id}">Vocabulaire</button>` : ''}
        ${hasGram ? `<button class="act" data-toggle="gram" data-id="${post.id}">Grammaire</button>` : ''}
        ${hasWrite ? `<button class="act" data-toggle="write" data-id="${post.id}">Écrire</button>` : ''}
        <button class="act" data-toggle="ask" data-id="${post.id}">Demander</button>
      </div>`;

  card.innerHTML = `
    <div class="post-head">
      <div class="post-meta">
        <span>${post.no}</span>
        <span class="pdate">${frFull(post.date)}</span>
        ${post.place ? `<span class="learn-only">${post.place}</span>` : ''}
        <span class="learn-only">${KIND_FR[kind] || kind}</span>
        ${post.level ? `<span class="learn-only">${post.level}</span>` : ''}
      </div>
      ${titleHTML}
      ${actionsHTML}
    </div>
    <div class="article">${frHTML}</div>
    <aside class="post-side">
      <div class="side-top">
      <div class="read-block" id="read-${post.id}">
          <p class="read-top"><button class="read-all" data-play="all" data-id="${post.id}">Tout lire</button>
            <span class="read-hint">Cliquez une phrase pour l\'écouter.</span></p>
          <p class="read-slot"></p>
      </div>
      ${simpleOK ? `<div class="simple-block" id="simple-${post.id}">
          <p class="simple-hint">Cliquez une phrase à gauche pour lire une version plus simple.</p>
          ${post.fr.map((_,i) => `<p class="simp-para" data-i="${i}"></p>`).join('')}
      </div>` : ''}
      <div class="ask-block" id="ask-${post.id}">
        <div class="nsec-label">Demander à Claude</div>
        <div class="ask-compose">
          <div class="ask-ctx"></div>
          <textarea class="ask-input" rows="2" placeholder="Une question sur une expression, une phrase, la grammaire…"></textarea>
          <div class="ask-row">
            <button class="ask-send" data-ask="send">Envoyer</button>
          </div>
          <div class="ask-thread"></div>
        </div>
      </div>
      </div>
      <div class="en-block" id="en-${post.id}">${enHTML}</div>
      ${hasVocab ? `<div class="notes" id="vocab-${post.id}"><div class="nsec-label">Vocabulaire</div><table>${vocabRows}</table></div>` : ''}
      ${hasGram ? `<div class="notes" id="gram-${post.id}"><div class="nsec-label">Grammaire</div>${gramHTML}</div>` : ''}
      ${hasWrite ? `<div class="write-block" id="write-${post.id}"><div class="nsec-label">Écrire</div>${writeHTML(post)}</div>` : ''}
    </aside>`;
  feed.appendChild(card);
  viewObserver.observe(card);
}); }

// ── TIME AXIS ──
// Ticks sit on the axis in proportion to their dates; the knob tracks the entry currently in
// view. Dragging snaps the knob to the nearest tick and scrolls the page to that entry.
const axis = document.getElementById('axis')!, axisTicks = document.getElementById('axisTicks')!,
      axisKnob = document.getElementById('axisKnob')!, axisLabel = document.getElementById('axisLabel')!;
interface AxisTick { post: Entry; y: number }
let AXIS: AxisTick[] = [], axisH = 0, axisDragging = false, axisCur: AxisTick | null = null;
function buildAxis(): void {
  axisTicks.innerHTML = ''; AXIS = [];
  if(!POSTS.length){ axis.style.display = 'none'; return; }
  axis.style.display = '';
  // Small at first, a little longer per entry, never more than ~60% of the viewport.
  axisH = Math.min(Math.round(innerHeight * .6), 48 + 16 * POSTS.length);
  axis.style.height = axisH + 'px';
  const t = (p: Entry) => new Date(p.date).getTime();
  const t0 = t(POSTS[0]), span = t(POSTS[POSTS.length-1]) - t0;
  AXIS = POSTS.map(p => ({ post:p, y: span > 0 ? (t(p)-t0)/span*axisH : axisH/2 }));
  // Keep a minimum gap between ticks written a day or two apart, then refit to the axis length.
  for(let i=1;i<AXIS.length;i++) AXIS[i].y = Math.max(AXIS[i].y, AXIS[i-1].y + 4);
  const last = AXIS[AXIS.length-1].y;
  if(last > axisH) AXIS.forEach(a => { a.y = a.y / last * axisH; });
  AXIS.forEach(a => {
    const el = document.createElement('div');
    el.className = 'axis-tick'; el.style.top = a.y + 'px';
    axisTicks.appendChild(el);
  });
  axisCur = null; syncAxis();
}
function setAxisKnob(a: AxisTick): void {
  axisCur = a;
  axisKnob.style.top = a.y + 'px';
  axisLabel.style.top = a.y + 'px';
  axisLabel.textContent = frFull(a.post.date);
}
// Which entry is in view: the last one whose top has passed a third of the viewport.
function syncAxis(): void {
  if(axisDragging || !AXIS.length) return;
  const mark = innerHeight * .35;
  let cur = AXIS[0];
  for(const a of AXIS){
    const el = document.getElementById(a.post.id);
    if(el && el.getBoundingClientRect().top <= mark) cur = a;
  }
  if(cur !== axisCur) setAxisKnob(cur);
}
function axisPick(clientY: number): void {
  const y = Math.min(Math.max(clientY - axis.getBoundingClientRect().top, 0), axisH);
  let best = AXIS[0];
  for(const a of AXIS) if(Math.abs(a.y - y) < Math.abs(best.y - y)) best = a;
  if(best === axisCur) return;
  setAxisKnob(best);
  const el = document.getElementById(best.post.id);
  if(el) window.scrollTo({ top: el.offsetTop - 20, behavior:'instant' });
}
axis.addEventListener('pointerdown', e => {
  if(!AXIS.length) return;
  e.preventDefault();
  axisDragging = true; axis.classList.add('dragging');
  axis.setPointerCapture(e.pointerId);
  axisPick(e.clientY);
});
axis.addEventListener('pointermove', e => { if(axisDragging) axisPick(e.clientY); });
function axisRelease(): void { if(!axisDragging) return; axisDragging = false; axis.classList.remove('dragging'); }
axis.addEventListener('pointerup', axisRelease);
axis.addEventListener('pointercancel', axisRelease);
window.addEventListener('scroll', syncAxis, { passive:true });
window.addEventListener('resize', buildAxis);

// ── SIMPLIFY ──
function hasSimple(post: Entry): boolean {
  if(!Array.isArray(post.simple) || post.simple.length !== post.fr.length) return false;
  return post.fr.every((p,i) => Array.isArray(post.simple![i]) && post.simple![i].length === splitSentences(p).length);
}
function clearSimple(postEl: Element): void {
  postEl.classList.remove('simple-on');
  postEl.querySelectorAll('.sent.on').forEach(s => s.classList.remove('on'));
  postEl.querySelectorAll('.simp-para').forEach(p => { p.innerHTML = ''; });
  const block = postEl.querySelector('.simple-block'); if(block) block.classList.remove('has-items');
}
function renderSimplePara(postEl: Element, post: Entry, i: number): void {
  const slot = postEl.querySelector(`.simp-para[data-i="${i}"]`); if(!slot) return;
  const on = [...postEl.querySelectorAll<HTMLElement>(`.sent.on[data-sent^="${i}:"]`)]
    .map(el => +el.dataset.sent!.split(':')[1]).sort((a,b)=>a-b);
  slot.innerHTML = on.map(j => {
    const it = post.simple![i][j];
    return `<span class="simp" data-sent="${i}:${j}">`+
      `<button class="pp-btn" data-play="simple" data-id="${post.id}" data-i="${i}" data-j="${j}" aria-label="Lire">${ICON_PLAY}</button>`+
      `<span class="simp-fr">${it.fr}</span><span class="simp-en">${it.en}</span></span>`;
  }).join('');
  const block = postEl.querySelector('.simple-block')!;
  block.classList.toggle('has-items', !!postEl.querySelector('.sent.on'));
}

// ── READ (Lire) ──
// Optional `read` data per entry: read[i][j] = the hard spots of sentence j of paragraph i,
// each {t, k, n, say?}: t = exact text inside the sentence, k = kind (READ_KINDS), n = short
// English note, say = what to speak for it if not t. Entries without it still read sentence
// by sentence; they just show no underlines.
const READ_KINDS = { mot:'mot', liaison:'liaison', enchainement:'enchaînement', muet:'lettres muettes', son:'son' };
function readMarks(post: Entry, i: number, j: number): Mark[] { return (post.read && post.read[i] && post.read[i][j]) || []; }
// Sentence HTML with each mark wrapped (in order; a mark not found, or overlapping, is skipped).
function markSentence(sent: string, marks: Mark[]): string {
  const found: { at: number; end: number; k: number }[] = [];
  let pos = 0;
  marks.forEach((m,k) => {
    let at = sent.indexOf(m.t, pos); if(at < 0) at = sent.indexOf(m.t);
    if(at < 0 || found.some(f => at < f.end && at + m.t.length > f.at)) return;
    found.push({at, end: at + m.t.length, k}); pos = at + m.t.length;
  });
  found.sort((a,b) => a.at - b.at);
  let out = '', cur = 0;
  found.forEach(f => {
    out += escHTML(sent.slice(cur, f.at)) + `<span class="hard" data-k="${f.k}">${escHTML(sent.slice(f.at, f.end))}</span>`;
    cur = f.end;
  });
  return out + escHTML(sent.slice(cur));
}
function clearRead(postEl: Element): void {
  postEl.classList.remove('read-on');
  postEl.querySelectorAll('.sent.reading').forEach(s => s.classList.remove('reading'));
  postEl.querySelector('.read-slot')!.innerHTML = '';
  const block = postEl.querySelector('.read-block'); if(block) block.classList.remove('has-items');
}
// Show one sentence (the last one clicked) at the top of the right column, then play it.
function showReadSentence(postEl: Element, post: Entry, i: number, j: number): void {
  postEl.querySelectorAll('.sent.reading').forEach(s => s.classList.remove('reading'));
  const sentEl = postEl.querySelector(`.sent[data-sent="${i}:${j}"]`); if(sentEl) sentEl.classList.add('reading');
  const marks = readMarks(post, i, j);
  const slot = postEl.querySelector('.read-slot')!;
  slot.innerHTML = `<span class="read-card" data-sent="${i}:${j}">`+
    `<button class="pp-btn" data-play="sent" data-id="${post.id}" data-i="${i}" data-j="${j}" aria-label="Lire">${ICON_PLAY}</button>`+
    `<span class="read-fr">${markSentence(splitSentences(post.fr[i])[j], marks)}</span>`+
    (marks.length || !post.read ? '' : '<span class="read-none">Rien de difficile ici.</span>')+
    `<span class="read-note"></span></span>`;
  postEl.querySelector('.read-block')!.classList.add('has-items');
  logEvent('sent', post, { i, j, t: splitSentences(post.fr[i])[j] });
  askFollow(postEl, post, { sentence: splitSentences(post.fr[i])[j] });
  mirrorSimple(postEl, post);
  onPlay(slot.querySelector<HTMLElement>('.pp-btn')!);
}
// With Lire and Simplifier both on, the simplified column follows the sentence being read.
function mirrorSimple(postEl: Element, post: Entry): void {
  if(!postEl.classList.contains('simple-on') || !postEl.classList.contains('read-on')) return;
  const cur = postEl.querySelector('.sent.reading');
  postEl.querySelectorAll('.sent.on').forEach(s => s.classList.remove('on'));
  if(cur) cur.classList.add('on');
  post.fr.forEach((_,i) => renderSimplePara(postEl, post, i));
}
// Click on an underlined spot: show its note, play just that bit.
function onHard(hardEl: HTMLElement): void {
  const card = hardEl.closest<HTMLElement>('.read-card')!, postEl = hardEl.closest('.post')!;
  const post = POSTS.find(x => x.id === postEl.id); if(!post) return;
  const [i,j] = card.dataset.sent!.split(':').map(Number), k = +hardEl.dataset.k!;
  const m = readMarks(post, i, j)[k]; if(!m) return;
  card.querySelectorAll('.hard.on').forEach(h => h.classList.remove('on'));
  hardEl.classList.add('on');
  card.querySelector('.read-note')!.innerHTML =
    `<span class="rn-t">${escHTML(m.t)}</span><span class="rn-k">${READ_KINDS[m.k] || m.k}</span>${m.n}`;
  logEvent('hard', post, { i, j, k, t: m.t, kind: m.k });
  const playerId = `frag:${post.id}:${i}:${j}:${k}`;
  if(activePlayer === playerId){ stopAll(); return; }
  stopAll(); activePlayer = playerId;
  speakSequence([{text: m.say || m.t, para: hardEl}]).then(() => { if(activePlayer === playerId) stopAll(); });
}

// ── INTERACTIONS ──
feed.addEventListener('click', e => {
  const hard = (e.target as Element).closest<HTMLElement>('.hard');
  if (hard) { onHard(hard); return; }
  const sent = (e.target as Element).closest<HTMLElement>('.sent');
  const sel = window.getSelection();
  if (sent && sel && !sel.isCollapsed) return;           // a text selection is a lookup, not a click
  if (sent && sent.closest('.post.read-on')) {
    const postEl = sent.closest('.post')!, post = POSTS.find(x => x.id === postEl.id);
    const [i,j] = sent.dataset.sent!.split(':').map(Number);
    if (post) showReadSentence(postEl, post, i, j);
    return;
  }
  if (sent && sent.closest('.post.ask-on') && !sent.closest('.post.simple-on')) {
    const postEl = sent.closest('.post')!, post = POSTS.find(x => x.id === postEl.id);
    const [i, j] = sent.dataset.sent!.split(':').map(Number);
    if (post) askFollow(postEl, post, { sentence: splitSentences(post.fr[i])[j] });
    return;
  }
  if (sent && sent.closest('.post.simple-on')) {
    const postEl = sent.closest('.post')!, post = POSTS.find(x => x.id === postEl.id);
    if (post) {
      const on = sent.classList.toggle('on');
      const [i, j] = sent.dataset.sent!.split(':').map(Number);
      if (on) { logEvent('simple', post, { i, j, t: splitSentences(post.fr[i])[j] }); askFollow(postEl, post, { sentence: splitSentences(post.fr[i])[j] }); }
      renderSimplePara(postEl, post, i);
    }
    return;
  }
  const playBtn = (e.target as Element).closest<HTMLElement>('[data-play]');
  if (playBtn) { e.stopPropagation(); onPlay(playBtn); return; }
  const conjBtn = (e.target as Element).closest<HTMLElement>('[data-conj]');
  if (conjBtn) {
    e.stopPropagation();
    const [pid, vi] = conjBtn.dataset.conj!.split(':');
    const row = document.getElementById(`conj-${pid}-${vi}`)!;
    const open = row.classList.toggle('open');
    conjBtn.classList.toggle('open', open);
    conjBtn.textContent = open ? '▴' : '▾';
    return;
  }
  const dictBtn = (e.target as Element).closest('[data-dict]');
  if (dictBtn) {
    e.stopPropagation();
    const p = dictBtn.closest('p')!;
    const on = p.classList.toggle('dictating');
    dictBtn.classList.toggle('on', on);
    if (on) { const ta = p.querySelector<HTMLTextAreaElement>('.dict-input'); if (ta) setTimeout(() => ta.focus(), 0); }
    return;
  }
  const checkBtn = (e.target as Element).closest<HTMLElement>('[data-check]');
  if (checkBtn) {
    e.stopPropagation();
    const [pid, i] = checkBtn.dataset.check!.split(':');
    const post = POSTS.find(x => x.id === pid);
    if (post) {
      const r = checkDictation(checkBtn.closest('.dictation')!, post.fr[+i]);
      if (r) logEvent('dict', post, { i: +i, correct: r.correct, total: r.total, missed: r.missed });
    }
    return;
  }
  const revealBtn = (e.target as Element).closest<HTMLElement>('[data-reveal]');
  if (revealBtn) {
    e.stopPropagation();
    const [pid, i] = revealBtn.dataset.reveal!.split(':');
    const post = POSTS.find(x => x.id === pid);
    if (post) {
      const res = revealBtn.closest('.dictation')!.querySelector('.dict-result')!;
      const showing = revealBtn.classList.toggle('on');     // toggle reveal on/off
      if (showing) {
        res.innerHTML = `<span class="dict-lbl">Texte original</span><span class="dict-line">${escHTML(post.fr[+i])}</span>`;
        res.classList.add('open');
        revealBtn.textContent = 'Masquer le texte';
      } else {
        res.innerHTML = ''; res.classList.remove('open');
        revealBtn.textContent = 'Afficher le texte';
      }
    }
    return;
  }
  const writeBtn = (e.target as Element).closest<HTMLButtonElement>('[data-write]');
  if (writeBtn) { e.stopPropagation(); checkWrite(writeBtn); return; }
  const askBtn = (e.target as Element).closest<HTMLElement>('[data-ask]');
  if (askBtn) { e.stopPropagation(); onAskClick(askBtn); return; }
  const btn = (e.target as Element).closest<HTMLElement>('.act'); if (!btn) return;
  if (btn.dataset.toggle) {
    const block = document.getElementById(`${btn.dataset.toggle}-${btn.dataset.id}`);
    if (!block) return;
    const open = block.classList.toggle('open');
    btn.classList.toggle('on', open);
    const post = btn.closest('.post')!;
    // Lire + Simplifier keep their fixed place in .side-top; other panels go to the bottom when opened.
    if (open && !block.closest('.side-top')) block.parentNode!.appendChild(block);
    if (btn.dataset.toggle === 'simple') {
      if (open) { post.classList.add('simple-on'); const p = POSTS.find(x => x.id === post.id); if (p) mirrorSimple(post, p); }
      else clearSimple(post);
    }
    if (btn.dataset.toggle === 'read') { if (open) post.classList.add('read-on'); else { stopAll(); clearRead(post); } }
    if (btn.dataset.toggle === 'ask') { post.classList.toggle('ask-on', open); if (open) openAsk(post); else post.querySelectorAll('.sent.asked').forEach(x => x.classList.remove('asked')); }
    post.classList.toggle('split', !!post.querySelector('.en-block.open, .notes.open, .simple-block.open, .read-block.open, .ask-block.open, .write-block.open'));
  }
});

// ── AUDIO ENGINE ──
const AUDIO_CACHE = new Map<string, string>();
let curAudio: HTMLAudioElement | null = null, curUtter: SpeechSynthesisUtterance | null = null, seqToken=0, speed=1, activePlayer: string | null = null;
interface SpeakItem { text: string; para?: Element | null; btn?: HTMLElement }

async function fetchTTS(text: string): Promise<string | null | undefined> {
  const key=elevenKey(), vid=getLS(KEY_VOICE);
  if(!key||!vid) return null;
  const ck = vid+'|'+text;
  if(AUDIO_CACHE.has(ck)) return AUDIO_CACHE.get(ck);
  try{
    const res=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`,{method:'POST',
      headers:{'xi-api-key':key,'Content-Type':'application/json'},
      body:JSON.stringify({text,model_id:'eleven_multilingual_v2',voice_settings:{stability:.5,similarity_boost:.75}})});
    if(!res.ok) return null;
    const url=URL.createObjectURL(await res.blob());
    AUDIO_CACHE.set(ck,url);
    return url;
  }catch(e){ return null; }
}

function clearPlayingUI(): void {
  document.querySelectorAll('.pp-btn').forEach(b=>{ b.classList.remove('playing'); b.innerHTML=ICON_PLAY; });
  document.querySelectorAll('.speaking').forEach(p=>p.classList.remove('speaking'));
  document.querySelectorAll<HTMLElement>('.read-all').forEach(b=>{ b.classList.remove('playing'); b.textContent='Tout lire'; });
}
function stopAll(): void {
  seqToken++;
  if(curAudio){ try{curAudio.pause();}catch(e){} curAudio=null; }
  if(window.speechSynthesis){ try{speechSynthesis.cancel();}catch(e){} }
  curUtter=null; activePlayer=null; clearPlayingUI();
}

function playOne(text: string, my: number, btn?: HTMLElement): Promise<void> {
  return new Promise(resolve=>{
    const done=()=>resolve();
    const key=elevenKey(), vid=getLS(KEY_VOICE);
    const fallback=()=>{
      if(my!==seqToken) return done();
      if(!('speechSynthesis' in window)) return done();
      try{speechSynthesis.cancel();}catch(e){}
      const u=new SpeechSynthesisUtterance(text); u.lang='fr-FR'; u.rate=Math.max(.5,Math.min(1.3,speed*0.95));
      const vs=speechSynthesis.getVoices(); const fr=vs.find(v=>v.lang&&v.lang.toLowerCase().startsWith('fr')); if(fr)u.voice=fr;
      if(btn)btn.innerHTML=ICON_STOP;
      u.onend=done; u.onerror=done; curUtter=u; speechSynthesis.speak(u);
    };
    const start=(url: string)=>{
      if(my!==seqToken) return done();
      const a=new Audio(url); a.playbackRate=speed; curAudio=a;
      if(btn)btn.innerHTML=ICON_STOP;
      a.onended=done; a.onerror=()=>fallback();
      a.play().catch(()=>fallback());
    };
    if(key&&vid){ fetchTTS(text).then(url=>{ if(my!==seqToken)return done(); url?start(url):fallback(); }).catch(fallback); }
    else fallback();
  });
}

async function speakSequence(items: SpeakItem[]): Promise<void> {
  const my=++seqToken;
  for(let i=0;i<items.length;i++){
    if(my!==seqToken) return;
    const {text,para,btn}=items[i];
    if(para) para.classList.add('speaking');
    if(btn){ btn.classList.add('playing'); btn.innerHTML=ICON_SPIN; }
    if(items[i+1]) fetchTTS(items[i+1].text);
    await playOne(text,my,btn);
    if(para) para.classList.remove('speaking');
    if(btn){ btn.classList.remove('playing'); btn.innerHTML=ICON_PLAY; }
    if(my!==seqToken) return;
  }
}

function onPlay(btn: HTMLElement): void {
  const kind=btn.dataset.play, id=btn.dataset.id!;
  const playerId = [kind,id,btn.dataset.i,btn.dataset.j].filter(x=>x!=null).join(':');
  if(activePlayer===playerId){ stopAll(); return; }
  stopAll();
  activePlayer=playerId;
  const post=POSTS.find(p=>p.id===id)!;
  const cardEl=document.getElementById(id)!;
  const paras=[...cardEl.querySelectorAll('.article p')];
  const ppBtns=[...cardEl.querySelectorAll<HTMLElement>('.article .pp-btn')];
  let items: SpeakItem[];
  if(kind==='all'){
    items=post.fr.map((t,i)=>({text:t,para:paras[i],btn:ppBtns[i]}));
    btn.classList.add('playing'); btn.textContent='Arrêter';
  } else if(kind==='sent'){
    const i=+btn.dataset.i!, j=+btn.dataset.j!;
    items=[{text:splitSentences(post.fr[i])[j],para:cardEl.querySelector(`.sent[data-sent="${i}:${j}"]`),btn}];
  } else if(kind==='simple'){
    items=[{text:post.simple![+btn.dataset.i!][+btn.dataset.j!].fr,btn}];
  } else {
    const i=+btn.dataset.i!; items=[{text:post.fr[i],para:paras[i],btn:ppBtns[i]}];
  }
  speakSequence(items).then(()=>{ if(activePlayer===playerId) stopAll(); });
}

// ── VOICE / KEY UI ──
let allVoices: Voice[]=[], pickerOpen=false;
interface Voice { voice_id: string; name: string; labels?: Record<string, string> }
const SPEEDS=[0.75,0.9,1.0,1.1];

function refreshReadbar(): void {
  document.getElementById('readbar')!.style.display='flex';
  const key=elevenKey();
  document.getElementById('rbVoice')!.textContent = key ? (getLS(KEY_VNAME)||'ElevenLabs') : 'navigateur';
  document.getElementById('voiceBtn')!.textContent = key ? 'Changer de voix' : 'Connecter ElevenLabs';
  document.getElementById('rbSpeed')!.textContent = speed.toFixed(1)+'×';
  document.getElementById('ghBtn')!.textContent = githubToken() ? 'GitHub ✓' : 'GitHub';
  document.getElementById('claudeBtn')!.textContent = claudeKey() ? 'Claude ✓' : 'Claude';
}
// ── GITHUB TOKEN (for saving questions to the repo) ──
const KEY_GH = 'felix_github_token', KEY_GH_REPO = 'felix_github_repo', GH_DEFAULT_REPO = 'arqbca11/felix-field-notes';
function ghRepo(): string { return cleanKey(getLS(KEY_GH_REPO)) || GH_DEFAULT_REPO; }
function toggleGhEntry(): void {
  const el = document.getElementById('ghEntry')!, open = !el.classList.contains('open');
  el.classList.toggle('open', open);
  if(!open) return;
  const fromFile = !!fromSecrets('githubToken');
  (document.getElementById('ghTokenInput') as HTMLInputElement).value = fromFile ? '' : (getLS(KEY_GH) || '');
  (document.getElementById('ghTokenInput') as HTMLInputElement).placeholder = fromFile ? 'Jeton lu depuis secrets.js' : 'github_pat_…';
  (document.getElementById('ghTokenInput') as HTMLInputElement).disabled = fromFile;
  (document.getElementById('ghRepoInput') as HTMLInputElement).value = ghRepo();
  ghSay(fromFile ? 'Le jeton vient du fichier local secrets.js.' : '');
}
function ghSay(t: string, err?: boolean): void { const m = document.getElementById('ghMsg')!; m.textContent = t; m.classList.toggle('err', !!err); }
function saveGhSettings(): void {
  const repo = cleanKey((document.getElementById('ghRepoInput') as HTMLInputElement).value);
  if(!/^[\w.-]+\/[\w.-]+$/.test(repo)){ ghSay('Dépôt : écrivez-le sous la forme propriétaire/nom.', true); return; }
  setLS(KEY_GH_REPO, repo);
  if(!fromSecrets('githubToken')){
    const t = cleanKey((document.getElementById('ghTokenInput') as HTMLInputElement).value);
    if(t && !/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(t)){ ghSay('Ça ne ressemble pas à un jeton GitHub (github_pat_…).', true); return; }
    setLS(KEY_GH, t);
  }
  ghSay('');
  refreshReadbar();
  // Send anything that was waiting (the learning log too), and say what happened.
  if(githubToken()) flushLog();
  const waiting = readQueue().length;
  if(!githubToken() || !waiting){ document.getElementById('ghEntry')!.classList.remove('open'); return; }
  ghSay(`Envoi de ${waiting} question(s) en attente…`);
  flushQueue().then(r => {
    if(r.ok) ghSay(`${waiting} question(s) enregistrée(s) dans ${GH_FILE} ✓`); else ghSay(`Échec (${r.why}) — vérifiez le jeton et le dépôt.`, true);
  });
}
function voiceBtnClick(): void {
  if(elevenKey()){ toggleVoicePicker(); }
  else { const ke=document.getElementById('keyEntry')!; ke.style.display = ke.style.display==='block'?'none':'block'; }
}
function cycleSpeed(): void {
  let i=SPEEDS.indexOf(speed); i=(i+1)%SPEEDS.length; if(i<0)i=2;
  speed=SPEEDS[i]; setLS(KEY_SPEED,String(speed));
  if(curAudio) curAudio.playbackRate=speed;
  document.getElementById('rbSpeed')!.textContent=speed.toFixed(1)+'×';
}
async function saveKey(): Promise<void> {
  const v=(document.getElementById('keyInput') as HTMLInputElement).value.trim().replace(/[\u200B-\u200D\uFEFF]/g,'');
  if(!v) return;
  document.getElementById('keyMsg')!.textContent='Connexion…';
  const ok=await fetchVoices(v,true);
  if(ok){ setLS(KEY_API,v); AUDIO_CACHE.clear(); document.getElementById('keyEntry')!.style.display='none'; document.getElementById('keyMsg')!.textContent=''; refreshReadbar(); }
  else document.getElementById('keyMsg')!.textContent='Connexion impossible — vérifiez la clé.';
}
async function fetchVoices(key: string, showPicker: boolean): Promise<boolean> {
  try{
    const res=await fetch('https://api.elevenlabs.io/v1/voices',{headers:{'xi-api-key':key}});
    if(!res.ok) return false;
    const data: { voices?: Voice[] }=await res.json(); allVoices=data.voices||[];
    const saved=getLS(KEY_VOICE);
    if(saved){ const v=allVoices.find(x=>x.voice_id===saved); if(v)setLS(KEY_VNAME,v.name); }
    else if(allVoices.length){ setLS(KEY_VOICE,allVoices[0].voice_id); setLS(KEY_VNAME,allVoices[0].name); }
    if(showPicker) renderVoicePicker();
    refreshReadbar();
    return true;
  }catch(e){ return false; }
}
function toggleVoicePicker(): void {
  pickerOpen=!pickerOpen;
  document.getElementById('voicePicker')!.style.display = pickerOpen?'block':'none';
  if(pickerOpen){
    if(allVoices.length) renderVoicePicker();
    else { document.getElementById('vpMsg')!.textContent='Chargement…'; fetchVoices(elevenKey()!,true); }
  }
}
function renderVoicePicker(): void {
  const c=document.getElementById('vpList')!, saved=getLS(KEY_VOICE); c.innerHTML='';
  allVoices.forEach(v=>{
    const sel=v.voice_id===saved;
    const d=document.createElement('div'); d.className='vitem'+(sel?' selected':'');
    const desc=v.labels?Object.values(v.labels).slice(0,2).join(' · '):'';
    d.innerHTML=`<div class="vdot"></div><div class="vinfo"><div class="vname">${v.name}</div>${desc?`<div class="vmeta">${desc.slice(0,52)}</div>`:''}</div><button class="vprev">${ICON_PLAY}</button>`;
    d.querySelector<HTMLElement>('.vinfo')!.onclick=()=>{
      setLS(KEY_VOICE,v.voice_id); setLS(KEY_VNAME,v.name); AUDIO_CACHE.clear();
      document.querySelectorAll('.vitem').forEach(i=>i.classList.remove('selected')); d.classList.add('selected');
      refreshReadbar(); document.getElementById('vpMsg')!.textContent='Voix : '+v.name;
    };
    d.querySelector<HTMLElement>('.vdot')!.onclick=()=>d.querySelector<HTMLElement>('.vinfo')!.click();
    d.querySelector<HTMLElement>('.vprev')!.onclick=async ev=>{
      ev.stopPropagation(); const b=ev.currentTarget as HTMLElement; b.innerHTML=ICON_STOP;
      try{
        const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.voice_id}`,{method:'POST',
          headers:{'xi-api-key':elevenKey()!,'Content-Type':'application/json'},
          body:JSON.stringify({text:"Argentière, un matin d'octobre. J'ouvre le carnet.",model_id:'eleven_multilingual_v2',voice_settings:{stability:.5,similarity_boost:.75}})});
        if(!r.ok) throw 0;
        const a=new Audio(URL.createObjectURL(await r.blob())); a.play();
        a.onended=()=>{ b.innerHTML=ICON_PLAY; };
      }catch(err){ b.innerHTML=ICON_PLAY; }
    };
    c.appendChild(d);
  });
  document.getElementById('vpMsg')!.textContent='';
}

// ── DICTATION ──
// Each paragraph has a ✎ button that hides the text and shows a typing box. The
// learner plays the audio with the paragraph's ▶ button, writes what they hear,
// and "Vérifier" scores it with a word-by-word diff against the original.
function escHTML(s: string): string { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function dictTokenize(s: string): string[] { return s.trim().split(/\s+/).filter(Boolean); }
// Compare-key for a token: lowercase, straight apostrophes, strip edge punctuation
// (accents are kept significant — they're part of learning to spell French).
function dictNorm(t: string): string {
  return t.toLowerCase().replace(/[’]/g,"'")
    .replace(/^[^0-9a-zà-ÿœæ']+|[^0-9a-zà-ÿœæ']+$/gi,'');
}
// Longest-common-subsequence alignment → which expected/typed tokens matched.
function dictAlign(expTok: string[], usrTok: string[]): { expMatch: boolean[]; usrMatch: boolean[] } {
  const a = expTok.map(dictNorm), b = usrTok.map(dictNorm);
  const n = a.length, m = b.length;
  const dp = Array.from({length:n+1}, () => new Array<number>(m+1).fill(0));
  for(let i=n-1;i>=0;i--) for(let j=m-1;j>=0;j--)
    dp[i][j] = a[i]===b[j] ? dp[i+1][j+1]+1 : Math.max(dp[i+1][j], dp[i][j+1]);
  const expMatch = new Array<boolean>(n).fill(false), usrMatch = new Array<boolean>(m).fill(false);
  let i=0, j=0;
  while(i<n && j<m){
    if(a[i]===b[j]){ expMatch[i]=usrMatch[j]=true; i++; j++; }
    else if(dp[i+1][j] >= dp[i][j+1]) i++;
    else j++;
  }
  return {expMatch, usrMatch};
}
function checkDictation(box: Element, expectedText: string): { correct: number; total: number; missed: string[] } | null {
  const res = box.querySelector('.dict-result')!;
  const rb = box.querySelector('.dict-reveal');             // a check result replaces any reveal
  if(rb){ rb.classList.remove('on'); rb.textContent = 'Afficher le texte'; }
  const typed = box.querySelector<HTMLTextAreaElement>('.dict-input')!.value;
  const expTok = dictTokenize(expectedText), usrTok = dictTokenize(typed);
  res.classList.add('open');
  if(!usrTok.length){ res.innerHTML = '<span class="dict-msg">Écrivez d\'abord ce que vous entendez.</span>'; return null; }
  const {expMatch, usrMatch} = dictAlign(expTok, usrTok);
  const correct = expMatch.filter(Boolean).length;
  const pct = Math.round(correct / expTok.length * 100);
  const expHTML = expTok.map((t,k) => `<span class="${expMatch[k]?'w-ok':'w-miss'}">${escHTML(t)}</span>`).join(' ');
  const usrHTML = usrTok.map((t,k) => `<span class="${usrMatch[k]?'w-ok':'w-bad'}">${escHTML(t)}</span>`).join(' ');
  res.innerHTML =
    `<span class="dict-score">${correct} / ${expTok.length} mots · ${pct} %</span>`+
    `<span class="dict-lbl">Texte original</span><span class="dict-line">${expHTML}</span>`+
    `<span class="dict-lbl">Votre réponse</span><span class="dict-line">${usrHTML}</span>`;
  // For the learning log, only misses inside the stretch actually attempted (up to the last word
  // matched): dictating half a paragraph shouldn't count the untyped half as mistakes.
  const lastHit = expMatch.lastIndexOf(true);
  return { correct, total: expTok.length, missed: expTok.filter((t,k) => !expMatch[k] && k < lastHit) };
}

// ── SELECTION DICTIONARY ──
// Select French text inside an entry → a small floating popup gives a quick gloss.
// Sources, in order: the entries' own curated vocab (instant, offline) → English
// Wiktionary's French section for single words (real senses + part of speech, follows
// "form of" links) → Google Translate's public endpoint for phrases → MyMemory as a last
// resort. All are CORS-enabled, keyless, and work when the file is opened via file://.
const LOOKUP_CACHE = new Map<string, LookupResult>();        // normalized term -> {trans, src}
let lookupEl: HTMLDivElement | null = null, lookupSeq = 0;
interface LookupResult { trans: string | null; src: string | null }

// Normalize for matching/caching: lowercase, straighten apostrophes, drop punctuation.
function normTerm(s: string): string {
  return s.toLowerCase()
    .replace(/[’]/g,"'")
    .replace(/[.,;:!?«»"“”()\[\]…]/g,'')
    .replace(/\s+/g,' ').trim();
}

// Gloss map from the vocab of every entry (incl. verb infinitives).
function vocabIndex(): Map<string, string> {
  const idx = new Map<string, string>();
  POSTS.forEach(p => (p.vocab||[]).forEach(v => {
    const k = normTerm(v[0]); if(k && !idx.has(k)) idx.set(k, v[1]);
    if(v[2] && v[2].inf){ const ik = normTerm(v[2].inf); if(ik && !idx.has(ik)) idx.set(ik, v[1]); }
  }));
  return idx;
}

function ensureLookupEl(): HTMLDivElement {
  if(lookupEl) return lookupEl;
  lookupEl = document.createElement('div');
  lookupEl.className = 'lookup';
  document.body.appendChild(lookupEl);
  lookupEl.addEventListener('mousedown', e => e.preventDefault());  // don't drop the selection
  return lookupEl;
}
function hideLookup(): void { lookupSeq++; if(lookupEl) lookupEl.classList.remove('open'); }

function positionLookup(rect: DOMRect): void {
  const el = lookupEl!, w = el.offsetWidth, h = el.offsetHeight;
  let left = rect.left + rect.width/2 - w/2;
  left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
  let top = rect.top - h - 10;                  // prefer above the selection
  if(top < 8) top = rect.bottom + 10;           // flip below if there's no room
  el.style.left = left+'px'; el.style.top = top+'px';
}

function renderLookup(term: string, bodyHTML: string, rect: DOMRect): void {
  const el = ensureLookupEl();
  el.innerHTML =
    `<div class="lk-head"><div class="lk-term">${term}</div>`+
    `<button class="lk-speak" aria-label="Écouter">${ICON_PLAY}</button></div>`+
    `<div class="lk-body">${bodyHTML}</div>`;
  el.classList.add('open');
  positionLookup(rect);
  el.querySelector<HTMLElement>('.lk-speak')!.onclick = () => {
    stopAll();
    const b = el.querySelector('.lk-speak')!; b.classList.add('playing'); b.innerHTML = ICON_STOP;
    speakSequence([{text:term}]).then(() => { b.classList.remove('playing'); b.innerHTML = ICON_PLAY; });
  };
}

// Clean a selection for lookup: straight apostrophes, no surrounding punctuation/quotes.
function cleanTerm(s: string): string {
  return s.replace(/[’]/g,"'")
    .replace(/^[\s.,;:!?«»"“”()\[\]…—–-]+|[\s.,;:!?«»"“”()\[\]…—–-]+$/g,'')
    .replace(/\s+/g,' ').trim();
}
function sameAs(a: string, b: string): boolean { return normTerm(a)===normTerm(b); }
// Wiktionary embeds <style> blocks (TemplateStyles) inside some definitions: drop their content too,
// or the CSS text shows up in the popup (e.g. the second sense of « croire »).
function stripHTML(h: string): string { return h.replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<link[^>]*>/gi,'')
  .replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }
const ELISION = /^(l|d|j|n|s|c|m|t|qu)'(?=\S)/i;
interface WiktSense { partOfSpeech?: string; definitions?: { definition?: string }[] }

// 1) English Wiktionary, French section: real dictionary senses with part of speech.
//    Inflected forms come back as "past participle of replier" → we follow the link once
//    and append the base word's first sense. Tries: as typed, lowercased, without elision.
async function wiktionaryOne(word: string, depth: number): Promise<{ first: string; html: string } | null> {
  try{
    const res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`);
    if(!res.ok) return null;
    const data: { fr?: WiktSense[] } | null = await res.json();
    const fr = data && data.fr; if(!Array.isArray(fr) || !fr.length) return null;
    const senses: { pos: string; line: string }[] = [];
    for(const e of fr.slice(0,2)){
      const defs = (e.definitions||[]).map(d => stripHTML(d.definition||'')).filter(Boolean).slice(0,2);
      if(!defs.length) continue;
      let line = defs.join('; ');
      const m = depth===0 && / of ([^\s,;()]+)$/.exec(defs[0]);
      if(m){ const base = await wiktionaryOne(m[1], 1); if(base && base.first) line += ' → ' + base.first; }
      senses.push({pos:(e.partOfSpeech||'').toLowerCase(), line});
    }
    if(!senses.length) return null;
    return { first: senses[0].line, html: senses.map(x => `<div class="lk-sense"><span class="lk-pos">${escHTML(x.pos)}</span>${escHTML(x.line)}</div>`).join('') };
  }catch(e){ return null; }
}
async function wiktionary(word: string): Promise<LookupResult | null> {
  const tries = [word];
  if(word.toLowerCase()!==word) tries.push(word.toLowerCase());
  const el = word.replace(ELISION,''); if(el!==word){ tries.push(el); tries.push(el.toLowerCase()); }
  for(const w of [...new Set(tries)]){
    const r = await wiktionaryOne(w, 0);
    if(r) return {trans:r.html, src:'Wiktionnaire' + (w!==word ? ` · ${escHTML(w)}` : '')};
  }
  return null;
}
// 2) Google Translate's public endpoint (phrases). Unofficial, so treated as best-effort.
async function googleTranslate(term: string): Promise<LookupResult | null> {
  try{
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=en&dt=t&q=${encodeURIComponent(term)}`);
    if(!res.ok) return null;
    const d: (string | null)[][][] | null = await res.json();
    const t = ((d && d[0]) || []).map(x => x && x[0]).filter(Boolean).join('').trim();
    return (t && !sameAs(t, term)) ? {trans:escHTML(t), src:'Google Traduction'} : null;
  }catch(e){ return null; }
}
// 3) MyMemory translation memory. Rejected when it echoes the source or the match is weak.
async function myMemory(term: string): Promise<LookupResult | null> {
  try{
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(term)}&langpair=fr|en&de=arqbcode2026@gmail.com`);
    const data: { responseData?: { translatedText?: string; match?: number } } | null = await res.json();
    const rd = data && data.responseData; const t = rd && rd.translatedText;
    if(!t || sameAs(t, term) || (typeof rd!.match==='number' && rd!.match < 0.5)) return null;
    return {trans:escHTML(t), src:'MyMemory'};
  }catch(e){ return null; }
}

async function lookupTranslate(raw: string): Promise<LookupResult> {
  const term = cleanTerm(raw); if(!term) return {trans:null, src:null};
  const key = normTerm(term);
  if(LOOKUP_CACHE.has(key)) return LOOKUP_CACHE.get(key)!;
  const remember = (r: LookupResult) => { LOOKUP_CACHE.set(key, r); return r; };
  const hit = vocabIndex().get(key);                                   // 0) curated vocab (offline, instant)
  if(hit) return remember({trans:hit, src:'Vocabulaire de la note'});
  const single = !/\s/.test(term);
  let r: LookupResult | null = null;
  if(single) r = await wiktionary(term);                                // 1) dictionary
  if(!r) r = await googleTranslate(term);                               // 2) translation
  if(!r) r = await myMemory(term);                                      // 3) last resort
  return remember(r || {trans:null, src:null});
}

function runLookup(): void {
  if(!document.body.classList.contains('learn')){ hideLookup(); return; }
  const sel = window.getSelection();
  if(!sel || sel.isCollapsed || !sel.rangeCount){ hideLookup(); return; }
  const raw = sel.toString().trim().replace(/\s+/g,' ');
  if(!raw || raw.length>80 || raw.split(' ').length>10){ hideLookup(); return; }
  const node = sel.anchorNode;
  const host = node && (node.nodeType===1 ? node as Element : node.parentElement);
  if(!host || !host.closest('.article, .simp-fr, .read-fr')){ hideLookup(); return; }   // the French reading text, or a simplified sentence
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  if(!rect || (!rect.width && !rect.height)){ hideLookup(); return; }
  const selPost = host.closest('.post');
  lastSel = selPost ? { postId: selPost.id, text: raw } : null;
  if(selPost){ const sp = POSTS.find(p => p.id === selPost.id); logEvent('lookup', sp, { t: raw }); askFollow(selPost, sp, { expr: raw }); }
  const my = ++lookupSeq;
  renderLookup(raw, '<span class="lk-loading">…</span>', rect);
  lookupTranslate(raw).then(r => {
    if(my!==lookupSeq || !lookupEl) return;
    const body = lookupEl.querySelector('.lk-body')!;
    body.innerHTML = (r.trans
      ? `<div class="lk-trans">${r.trans}</div><div class="lk-src">${r.src}</div>`
      : '<div class="lk-trans none">Pas de traduction trouvée.</div>') +
      '<button class="lk-ask">Demander à Claude</button>';
    const sel = lastSel;
    body.querySelector<HTMLElement>('.lk-ask')!.onclick = () => { hideLookup(); if (sel) askAbout(sel.postId, sel.text); };
    positionLookup(rect);                          // re-measure now that content changed
  });
}

// Desktop reacts on mouse-up. Touch devices don't fire a reliable mouse-up at the
// end of a text selection (you drag the selection handles), so once a touch is seen
// we switch to a debounced `selectionchange` that waits for the handles to settle.
let touchMode = false, selDebounce: number | null = null;
document.addEventListener('mouseup', e => {
  if(lookupEl && lookupEl.contains(e.target as Node)) return;
  if(touchMode) return;                            // touch is handled via selectionchange
  setTimeout(runLookup, 0);                        // let the selection settle first
});
document.addEventListener('mousedown', e => {
  if(lookupEl && lookupEl.contains(e.target as Node)) return;
  hideLookup();
});
document.addEventListener('touchstart', e => {
  touchMode = true;
  if(lookupEl && lookupEl.contains(e.target as Node)) return;   // taps inside the popup keep it open
  hideLookup();
}, {passive:true});
document.addEventListener('selectionchange', () => {
  if(!touchMode) return;
  clearTimeout(selDebounce!);
  selDebounce = setTimeout(runLookup, 420);        // wait out the selection-handle drag
});
document.addEventListener('keydown', e => { if(e.key==='Escape') hideLookup(); });
window.addEventListener('scroll', hideLookup, true);

// ── ASK (Demander à Claude) ──
// A question box per entry. Each question goes to the Claude API straight from the browser,
// with the learner's own key (kept in localStorage, like the ElevenLabs one). The entry's text,
// the sentence open in Lire and any highlighted expression go along as context; the answer
// streams in. The thread is kept per entry until the page reloads.
const KEY_CLAUDE = 'felix_claude_key', KEY_CLAUDE_MODEL = 'felix_claude_model';
interface ClaudeModel { id: string; label: string; fallbacks?: boolean }
// Selectable models (rough cost per question with a whole entry as context). `fallbacks`: the
// server re-runs a declined request on another model — enabled where the API recommends it.
const CLAUDE_MODELS: ClaudeModel[] = [
  { id:'claude-opus-5-5',   label:'Opus 5.5 · ~2 ¢',           fallbacks:true },
  { id:'claude-opus-4-8',   label:'Opus 4.8 · ~3 ¢' },
  { id:'claude-sonnet-5-5', label:'Sonnet 5.5 · plus rapide, ~1 ¢', fallbacks:true },
  { id:'claude-haiku-5-5',  label:'Haiku 5.5 · le plus rapide, < 0,1 ¢' },
  { id:'claude-fable-5-1', label:'Fable 5.1 · le plus fin, ~6 ¢', fallbacks:true },
];
function askModel(): ClaudeModel { const id = getLS(KEY_CLAUDE_MODEL); return CLAUDE_MODELS.find(m => m.id === id) || CLAUDE_MODELS[0]; }
const ANTHROPIC_SDK = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.128.0/+esm';
interface AskCtx { sentence?: string; expr?: string }
interface ClaudeBlock { type: string; text?: string }
interface UserTurn { role: 'user'; content: string }
type AskTurn = UserTurn | { role: 'assistant'; content: ClaudeBlock[]; model: string };
interface AskState { history: AskTurn[]; ctx: AskCtx; busy: boolean }
const ASK: Record<string, AskState> = {};                 // postId -> {history:[{role,content}], ctx:{sentence, expr}, busy}
// anthropicMod: the SDK module imported from the CDN at runtime, so untyped here.
let lastSel: { postId: string; text: string } | null = null, anthropicMod: any = null;

function askState(id: string): AskState { return ASK[id] || (ASK[id] = { history: [], ctx: {}, busy: false }); }
function currentReadSentence(postEl: Element, post: Entry): string | null {
  const s = postEl.querySelector<HTMLElement>('.sent.reading'); if(!s) return null;
  const [i,j] = s.dataset.sent!.split(':').map(Number);
  return splitSentences(post.fr[i])[j];
}
// Open the panel for an entry, picking up the Lire sentence and the last highlighted expression.
function openAsk(postEl: Element): void {
  const post = POSTS.find(x => x.id === postEl.id); if(!post) return;
  const st = askState(post.id);
  const sent = postEl.classList.contains('read-on') ? currentReadSentence(postEl, post) : null;
  if(sent) st.ctx.sentence = sent;
  if(lastSel && lastSel.postId === post.id) st.ctx.expr = lastSel.text;
  renderAskCtx(postEl, st);
  markAsked(postEl, post, st.ctx.sentence);
  if(!claudeKey()) openClaudeEntry('Ajoutez votre clé API Claude pour poser une question.');
  const ta = postEl.querySelector<HTMLTextAreaElement>('.ask-input'); if(ta) setTimeout(() => ta.focus(), 0);
}
// While the panel is open, its context follows what the learner does next: the sentence just
// clicked in Lire or Simplifier becomes the Phrase, the word just highlighted the Expression.
function askFollow(postEl: Element | null, post: Entry | undefined, fields: AskCtx): void {
  if(!postEl || !post || !postEl.querySelector('.ask-block.open')) return;
  const st = askState(post.id);
  Object.assign(st.ctx, fields);
  renderAskCtx(postEl, st);
  if(fields.sentence) markAsked(postEl, post, fields.sentence);
}
function markAsked(postEl: Element, post: Entry, sentence: string | null | undefined): void {
  postEl.querySelectorAll('.sent.asked').forEach(x => x.classList.remove('asked'));
  if(!sentence) return;
  const el = [...postEl.querySelectorAll<HTMLElement>('.article .sent')].find(x => { const [i,j] = x.dataset.sent!.split(':').map(Number); return splitSentences(post.fr[i])[j] === sentence; });
  if(el) el.classList.add('asked');
}
// From the selection popup: open that entry's panel with the expression attached.
function askAbout(postId: string, text: string): void {
  const postEl = document.getElementById(postId); if(!postEl) return;
  lastSel = { postId, text };
  if(!document.getElementById('ask-'+postId)!.classList.contains('open')) postEl.querySelector<HTMLElement>('.act[data-toggle="ask"]')!.click();
  else openAsk(postEl);
  postEl.querySelector('.ask-block')!.scrollIntoView({ block:'nearest', behavior:'smooth' });
}
function renderAskCtx(postEl: Element, st: AskState): void {
  const chip = (k: keyof AskCtx, label: string) => st.ctx[k]
    ? `<div class="ask-chip"><span class="k">${label}</span><span class="v">${escHTML(st.ctx[k])}</span><button data-ask="drop" data-k="${k}" aria-label="Retirer">×</button></div>` : '';
  postEl.querySelector('.ask-ctx')!.innerHTML = chip('expr','Expression') + chip('sentence','Phrase');
}
function onAskClick(b: HTMLElement): void {
  const postEl = b.closest('.post')!, post = POSTS.find(x => x.id === postEl.id); if(!post) return;
  const st = askState(post.id), act = b.dataset.ask;
  if(act === 'drop'){ delete st.ctx[b.dataset.k as keyof AskCtx]; renderAskCtx(postEl, st); if(b.dataset.k === 'sentence') markAsked(postEl, post, null); }
  else if(act === 'send') sendAsk(postEl, post);
}
// The key and the model live in the "Claude" panel at the top right, shared by Demander and Écrire.
function openClaudeEntry(msg?: string): void {
  const el = document.getElementById('claudeEntry')!;
  el.classList.add('open');
  const fromFile = !!fromSecrets('claudeKey'), inp = document.getElementById('claudeKeyInput') as HTMLInputElement;
  inp.value = fromFile ? '' : (getLS(KEY_CLAUDE) || '');
  inp.placeholder = fromFile ? 'Clé lue depuis secrets.js' : 'sk-ant-…';
  inp.disabled = fromFile;
  const cur = askModel().id;
  document.getElementById('claudeModel')!.innerHTML =
    CLAUDE_MODELS.map(m => `<option value="${m.id}"${m.id === cur ? ' selected' : ''}>${m.label}</option>`).join('');
  claudeSay(msg || (fromFile ? 'La clé vient du fichier local secrets.js (ignoré par git).' : ''));
}
function toggleClaudeEntry(): void {
  if(document.getElementById('claudeEntry')!.classList.contains('open')) document.getElementById('claudeEntry')!.classList.remove('open');
  else openClaudeEntry();
}
function claudeSay(t: string, err?: boolean): void { const m = document.getElementById('claudeMsg')!; m.textContent = t; m.classList.toggle('err', !!err); }
function setClaudeModel(id: string): void { setLS(KEY_CLAUDE_MODEL, id); }
function saveClaudeKey(): void {
  if(!fromSecrets('claudeKey')){
    const k = cleanKey((document.getElementById('claudeKeyInput') as HTMLInputElement).value);
    if(k && !/^sk-ant-[A-Za-z0-9_-]{20,}$/.test(k)){ claudeSay('Ça ne ressemble pas à une clé Anthropic (sk-ant-…). Recopiez-la depuis la console.', true); return; }
    setLS(KEY_CLAUDE, k);
  }
  refreshReadbar();
  document.getElementById('claudeEntry')!.classList.remove('open');
}
// Enter sends, Shift+Enter makes a new line.
feed.addEventListener('keydown', e => {
  if(!((e.target as HTMLElement).classList && (e.target as HTMLElement).classList.contains('ask-input')) || e.key !== 'Enter' || e.shiftKey) return;
  e.preventDefault();
  const postEl = (e.target as HTMLElement).closest('.post')!, post = POSTS.find(x => x.id === postEl.id);
  if(post) sendAsk(postEl, post);
});

function askSystem(post: Entry): string {
  return [
    'You are a French tutor inside a reading app. The learner is an English speaker, around B1, preparing for the TCF Canada (target CLB 7 / B2), who learns through lots of varied reading.',
    'They are reading a private diary entry written in French by Felix, a fictional young mountain guide in training in Chamonix. The entry is below; their questions are about its language.',
    'How to answer: explain in English, give French in the examples. Be concise and concrete: answer the question asked, then at most one useful extra (a contrast, a second example, a pronunciation point). No over-explaining, no condescension. Plain text with light Markdown only (*italics* for French words, short "- " lists when they help). No headings, no tables.',
    '',
    `Entry #${post.no}, ${post.date}, ${post.kind}, level ${post.level}: ${post.title || '(note)'}`,
    'French:', post.fr.join('\n\n'),
    '', 'English translation:', post.en.join('\n\n'),
    ...(window.FELIX_LEARNER_SUMMARY ? ['', 'About this learner (approximate, from their reading log and past questions — use it lightly: connect an answer to something they struggled with before when it genuinely helps, never recite it or comment on it):', window.FELIX_LEARNER_SUMMARY] : []),
  ].join('\n');
}
function askUserText(q: string, ctx: AskCtx): string {
  const parts = [];
  if(ctx.sentence) parts.push(`Sentence I'm looking at: « ${ctx.sentence} »`);
  if(ctx.expr) parts.push(`Expression I highlighted: « ${ctx.expr} »`);
  parts.push(q);
  return parts.join('\n');
}
// Tiny, safe Markdown: escape first, then **bold**, *italics*, "- " lists, paragraphs.
function mdLite(t: string): string {
  const inline = (s: string) => escHTML(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<em>$1</em>');
  return t.trim().split(/\n{2,}/).map(block => {
    const lines = block.split('\n');
    if(lines.every(l => /^\s*[-•]\s+/.test(l))) return '<ul>' + lines.map(l => `<li>${inline(l.replace(/^\s*[-•]\s+/,''))}</li>`).join('') + '</ul>';
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}

interface ClaudeMessage { content: ClaudeBlock[]; stop_reason: string | null; model: string }
interface ClaudeStreamEvent { type: string; delta: { type: string; text: string } }
interface ClaudeStream extends AsyncIterable<ClaudeStreamEvent> { finalMessage(): Promise<ClaudeMessage> }
interface ClaudeClient { beta: { messages: { stream(params: object): ClaudeStream } } }
// The official SDK, loaded on first use from the CDN (the page has no build step).
async function getAnthropic(): Promise<ClaudeClient> {
  if(!anthropicMod) anthropicMod = await import(ANTHROPIC_SDK);
  const Anthropic = anthropicMod.default || anthropicMod.Anthropic;
  return new Anthropic({ apiKey: claudeKey(), dangerouslyAllowBrowser: true });
}

async function sendAsk(postEl: Element, post: Entry): Promise<void> {
  const st = askState(post.id);
  const ta = postEl.querySelector<HTMLTextAreaElement>('.ask-input')!, q = ta.value.trim();
  if(!q || st.busy) return;
  if(!claudeKey()){ openClaudeEntry('Ajoutez votre clé API Claude pour poser une question.'); return; }
  st.busy = true;
  const sendBtn = postEl.querySelector<HTMLButtonElement>('.ask-send[data-ask="send"]')!; sendBtn.disabled = true;
  const item = document.createElement('div');
  item.innerHTML = `<div class="ask-q">${escHTML(q)}</div><div class="ask-a"><span class="lk-loading">Claude réfléchit…</span></div>`;
  const thread = postEl.querySelector('.ask-thread')!;
  thread.innerHTML = ''; thread.appendChild(item); thread.scrollTop = 0;   // one answer at a time, the latest
  const ansEl = item.querySelector('.ask-a')!;
  ta.value = '';
  const model = askModel();
  const userMsg: UserTurn = { role:'user', content: askUserText(q, st.ctx) };
  // Earlier answers go back unchanged to the model that wrote them (thinking blocks included);
  // to any other model, as plain text only.
  const messages = [...st.history.map(h => h.role === 'user' ? h
    : { role:'assistant', content: h.model === model.id ? h.content
        : h.content.filter(b => b.type === 'text').map(b => ({ type:'text', text:b.text })) }), userMsg];
  let text = '';
  try{
    const client = await getAnthropic();
    const stream = client.beta.messages.stream({
      model: model.id,
      max_tokens: 64000,
      system: askSystem(post),
      messages,
      cache_control: { type:'ephemeral' },
      ...(model.fallbacks ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
    });
    for await (const ev of stream){
      if(ev.type === 'content_block_delta' && ev.delta.type === 'text_delta'){
        text += ev.delta.text; ansEl.innerHTML = mdLite(text);
      }
    }
    const final = await stream.finalMessage();
    if(final.stop_reason === 'refusal' || !text.trim()){
      ansEl.innerHTML = '<span class="err">Pas de réponse pour cette question. Reformulez-la ?</span>';
      item.classList.add('ask-failed');
    } else {
      if(final.stop_reason === 'max_tokens') ansEl.innerHTML += '<p class="err">(réponse coupée)</p>';
      st.history = [...st.history, userMsg, { role:'assistant', content: final.content, model: final.model }];
      // A question that went through clears the failed attempts shown before it (they were never in the history).
      const saved = document.createElement('div'); saved.className = 'ask-saved'; item.appendChild(saved);
      saveAsk(post, q, st.ctx, text, model.id, saved);
      logEvent('ask', post, { t: q, expr: st.ctx.expr || null, sentence: st.ctx.sentence || null });
    }
  }catch(err: any){                                   // SDK/network errors: status, error, message
    const status = err && err.status;
    const apiMsg = err && err.error && err.error.error && err.error.error.message;   // Anthropic's own explanation
    const msg = (status === 401 || status === 403) ? `Clé API refusée — vérifiez-la (Claude, en haut à droite).${apiMsg ? ' Anthropic : « ' + apiMsg + ' »' : ''}`
      : status === 429 ? 'Trop de requêtes pour le moment — réessayez dans un instant.'
      : 'Erreur : ' + ((err && err.message) || err);
    ansEl.innerHTML = `<span class="err">${escHTML(msg)}</span>`;
    item.classList.add('ask-failed');
    ta.value = q;
  }finally{
    st.busy = false; sendBtn.disabled = false;
  }
}

// ── WRITE (Écrire) ──
// Each entry may carry 2–3 questions (`write`, CLAUDE.md §6) answered in a sentence or two.
// "Corriger" sends the answer to Claude (same key and model as Demander) for a structured
// correction: the corrected text, each mistake with a short rule tag, a more natural version,
// and a word on the content. Answers and corrections stay in this browser; each correction is
// logged ('write', with the mistakes) so tools/learner-profile.ts can follow them on the curve.
const KEY_WRITE = 'felix_write';
interface WriteMistake { wrong: string; right: string; rule: string; note: string }
interface WriteResult { corrected: string; mistakes: WriteMistake[]; better: string; comment: string }
interface SavedWrite { a: string; r: WriteResult; ts: string }
function readWrites(): Record<string, SavedWrite> { try{ return JSON.parse(getLS(KEY_WRITE) || '{}'); }catch(e){ return {}; } }
function saveWrite(key: string, val: SavedWrite): void { const w = readWrites(); w[key] = val; setLS(KEY_WRITE, JSON.stringify(w)); }
function writeHTML(post: Entry): string {
  const saved = readWrites();
  return post.write!.map((w, k) => {
    const s = saved[`${post.id}:${k}`];
    return `<div class="wq" data-k="${k}">`+
      `<div class="wq-q">${w.q}</div>`+
      (w.en ? `<div class="wq-en">${w.en}</div>` : '')+
      (w.try ? `<div class="wq-try">Essayez : <i>${w.try}</i></div>` : '')+
      `<textarea class="ask-input wq-input" rows="2" placeholder="Une ou deux phrases…">${s ? escHTML(s.a) : ''}</textarea>`+
      `<div class="ask-row"><button class="ask-send" data-write="check" data-k="${k}">Corriger</button></div>`+
      `<div class="wq-result">${s && s.r ? renderCorrection(s.a, s.r) : ''}</div>`+
    `</div>`;
  }).join('');
}
// Word-level diff of the learner's answer against the corrected one (the dictation's alignment).
function diffHTML(mine: string, fixed: string): string {
  const a = dictTokenize(fixed), b = dictTokenize(mine), { expMatch, usrMatch } = dictAlign(a, b);
  const out: string[] = []; let i = 0, j = 0;
  while(i < a.length || j < b.length){
    if(i < a.length && j < b.length && expMatch[i] && usrMatch[j]){ out.push(escHTML(a[i])); i++; j++; }
    else {
      if(j < b.length && !usrMatch[j]){ out.push(`<del>${escHTML(b[j])}</del>`); j++; continue; }
      if(i < a.length && !expMatch[i]){ out.push(`<ins>${escHTML(a[i])}</ins>`); i++; continue; }
      break;                                              // can't happen with an LCS alignment; never loop
    }
  }
  return out.join(' ');
}
function renderCorrection(mine: string, r: WriteResult): string {
  const inline = (s: string) => escHTML(s).replace(/\*(.+?)\*/g,'<em>$1</em>');
  const clean = !r.mistakes.length;
  return (clean ? `<span class="wq-lbl">Aucune faute ✓</span>`
      : `<span class="wq-lbl">Version corrigée</span><div class="wq-fixed">${diffHTML(mine, r.corrected)}</div>`+
        `<ul class="wq-mis">${r.mistakes.map(m => `<li><span class="w">${escHTML(m.wrong)}</span> → <span class="r">${escHTML(m.right)}</span><span class="k">${escHTML(m.rule)}</span>${inline(m.note)}</li>`).join('')}</ul>`)+
    (r.better && r.better.trim() !== r.corrected.trim() ? `<span class="wq-lbl">Plus naturel</span><div class="wq-better">${escHTML(r.better)}</div>` : '')+
    (r.comment ? `<span class="wq-lbl">Commentaire</span><div class="wq-comment">${inline(r.comment)}</div>` : '');
}
const WRITE_SCHEMA = {
  type:'object', additionalProperties:false,
  required:['corrected','mistakes','better','comment'],
  properties:{
    corrected:{ type:'string' },
    mistakes:{ type:'array', items:{ type:'object', additionalProperties:false,
      required:['wrong','right','rule','note'],
      properties:{ wrong:{type:'string'}, right:{type:'string'}, rule:{type:'string'}, note:{type:'string'} } } },
    better:{ type:'string' },
    comment:{ type:'string' },
  },
};
const WRITE_RULES = ['gender','agreement','article','preposition','tense choice','conjugation','auxiliary être/avoir',
  'past participle agreement','subjunctive','conditional','pronoun','word order','negation','elision','spelling/accents',
  'word choice','anglicism','missing word'];
function writeSystem(post: Entry): string {
  return [
    'You correct short written answers in a French reading app. The learner is an English speaker, around B1, preparing for the TCF Canada (target B2). They just read a diary entry by Felix (a fictional young mountain guide in training in Chamonix) and answered a question about it in French, in a sentence or two.',
    'Correct like a good teacher: fix real errors (grammar, agreement, spelling and accents, wrong word, anglicisms), keep their meaning, their ideas and their own words wherever they are correct. Do not rewrite for style in "corrected".',
    '- corrected: their answer with only the necessary fixes. If there is nothing to fix, repeat it exactly.',
    `- mistakes: one item per error, in order. wrong = the exact words they wrote (short span), right = the fix, rule = a short English label (prefer one of: ${WRITE_RULES.join(', ')}), note = one short English line explaining why (French in *asterisks*). Empty array if none.`,
    '- better: the same idea as a natural native speaker would write it at B1–B2 (one or two sentences, still simple). Empty string if theirs is already natural.',
    '- comment: one or two short English sentences on the content: for a question about the entry, whether the answer fits what Felix wrote (gently say what they missed); for an opinion or imagination question, respond to the idea itself like an interested reader. Warm, never condescending, no generic praise. If they wrote in English or off-topic, say so kindly and still correct what is there.',
    '',
    `Entry #${post.no}, ${post.date}, level ${post.level}: ${post.title || '(note)'}`,
    'French:', post.fr.join('\n\n'),
    '', 'English translation:', post.en.join('\n\n'),
    ...(window.FELIX_LEARNER_SUMMARY ? ['', 'About this learner (approximate; use lightly, e.g. if a mistake is one they keep making, the note may say so briefly):', window.FELIX_LEARNER_SUMMARY] : []),
  ].join('\n');
}
async function checkWrite(btn: HTMLButtonElement): Promise<void> {
  const postEl = btn.closest('.post')!, post = POSTS.find(x => x.id === postEl.id); if(!post) return;
  const box = btn.closest<HTMLElement>('.wq')!, k = +box.dataset.k!, w = post.write![k];
  const ta = box.querySelector<HTMLTextAreaElement>('.wq-input')!, mine = ta.value.trim(), res = box.querySelector('.wq-result')!;
  if(!mine || btn.disabled) return;
  if(!claudeKey()){ res.innerHTML = '<span class="err">Il faut une clé API Claude (Claude, en haut à droite).</span>'; openClaudeEntry('Ajoutez votre clé API Claude pour la correction.'); return; }
  btn.disabled = true; res.innerHTML = '<span class="lk-loading">Claude corrige…</span>';
  const model = askModel();
  try{
    const client = await getAnthropic();
    const stream = client.beta.messages.stream({
      model: model.id,
      max_tokens: 16000,
      system: writeSystem(post),
      messages: [{ role:'user', content: `Question: « ${w.q} » (${w.en || ''})\nMy answer: ${mine}` }],
      output_config: { format: { type:'json_schema', schema: WRITE_SCHEMA } },
      cache_control: { type:'ephemeral' },
      ...(model.fallbacks ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
    });
    const final = await stream.finalMessage();
    const text = final.content.filter(b => b.type === 'text').map(b => b.text).join('');
    if(final.stop_reason === 'refusal' || !text.trim()) throw new Error('pas de réponse — réessayez ?');
    const r: WriteResult = JSON.parse(text);
    res.innerHTML = renderCorrection(mine, r);
    saveWrite(`${post.id}:${k}`, { a: mine, r, ts: new Date().toISOString() });
    logEvent('write', post, { k, q: w.q, t: mine, fixed: r.corrected,
      mistakes: r.mistakes.map(m => ({ wrong: m.wrong, right: m.right, rule: m.rule })) });
  }catch(err: any){                                   // SDK/network errors: status, message
    const status = err && err.status;
    const msg = (status === 401 || status === 403) ? 'Clé API refusée — vérifiez-la (Claude, en haut à droite).'
      : status === 429 ? 'Trop de requêtes pour le moment — réessayez dans un instant.'
      : 'Erreur : ' + ((err && err.message) || err);
    res.innerHTML = `<span class="err">${escHTML(msg)}</span>`;
  }finally{ btn.disabled = false; }
}
// Cmd/Ctrl+Enter corrects (plain Enter is a new line: it's writing, not chat).
feed.addEventListener('keydown', e => {
  if(!((e.target as HTMLElement).classList && (e.target as HTMLElement).classList.contains('wq-input')) || e.key !== 'Enter' || !(e.metaKey || e.ctrlKey)) return;
  e.preventDefault();
  checkWrite((e.target as HTMLElement).closest('.wq')!.querySelector<HTMLButtonElement>('[data-write]')!);
});

// ── SAVE Q&A TO THE REPO ──
// Each finished question + answer is appended to questions.md in the learner's GitHub repo
// (GitHub's contents API allows browser calls; the token is theirs, limited to that repo).
// Records wait in a localStorage queue first, so nothing is lost if a save fails: the queue is
// flushed on the next answer, or when the GitHub settings are saved. /new-entries reads the file.
const KEY_ASK_QUEUE = 'felix_ask_queue', GH_FILE = 'questions.md';
const GH_HEADER = '# Questions\n\nQuestions asked from the page (Demander), appended automatically after each answer.\n'+
  'Read by /new-entries to shape the next entries. Newest at the bottom.\n\n';
function readQueue(): string[] { try{ return JSON.parse(getLS(KEY_ASK_QUEUE) || '[]'); }catch(e){ return []; } }
function writeQueue(q: string[]): void { setLS(KEY_ASK_QUEUE, JSON.stringify(q)); }
function askRecord(post: Entry, q: string, ctx: AskCtx, answer: string, model: string): string {
  const lines = [`## ${new Date().toISOString().slice(0,10)} · #${post.no} ${post.title || '(note)'} · ${model}`];
  if(ctx.sentence) lines.push(`**Phrase :** « ${ctx.sentence} »`);
  if(ctx.expr) lines.push(`**Expression :** « ${ctx.expr} »`);
  lines.push(`**Q :** ${q}`, '', answer.trim(), '', '---', '');
  return lines.join('\n');
}
// UTF-8-safe base64 (the contents API speaks base64; the file is full of accents).
function b64encode(str: string): string { let s = ''; new TextEncoder().encode(str).forEach(b => { s += String.fromCharCode(b); }); return btoa(s); }
function b64decode(b64: string): string { const s = atob(b64.replace(/\s/g,'')); return new TextDecoder().decode(Uint8Array.from(s, c => c.charCodeAt(0))); }

interface FlushResult { ok: boolean; why?: string; pending: number; saved?: number }
interface GhFile { content: string; sha: string }
let ghFlushing: Promise<FlushResult> | null = null;
async function flushQueue(): Promise<FlushResult> {
  if(ghFlushing) return ghFlushing;                    // one flush at a time
  ghFlushing = (async (): Promise<FlushResult> => {
    const token = githubToken(), pending = readQueue();
    if(!token) return { ok:false, why:'nokey', pending: pending.length };
    if(!pending.length) return { ok:true, pending: 0 };
    const url = `https://api.github.com/repos/${ghRepo()}/contents/${GH_FILE}`;
    const headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' };
    for(let attempt = 0; attempt < 3; attempt++){        // a 409 means the file moved on: re-read and retry
      const cur = await fetch(url, { headers, cache:'no-store' });
      if(!cur.ok && cur.status !== 404) return { ok:false, why:'http ' + cur.status, pending: pending.length };
      const file: GhFile | null = cur.ok ? await cur.json() : null;
      const body = (file ? b64decode(file.content) : GH_HEADER).replace(/\n*$/, '\n\n') + pending.join('\n');
      const put = await fetch(url, { method:'PUT', headers, body: JSON.stringify({
        message: `questions: ${pending.length} new`, content: b64encode(body), ...(file ? { sha: file.sha } : {}) }) });
      if(put.ok){ writeQueue(readQueue().slice(pending.length)); return { ok:true, pending: 0, saved: pending.length }; }
      if(put.status !== 409) return { ok:false, why:'http ' + put.status, pending: pending.length };
    }
    return { ok:false, why:'conflit', pending: pending.length };
  })().catch(e => ({ ok:false, why: e.message, pending: readQueue().length }))
     .finally(() => { ghFlushing = null; });
  return ghFlushing;
}
async function saveAsk(post: Entry, q: string, ctx: AskCtx, answer: string, model: string, statusEl: HTMLElement | null): Promise<void> {
  writeQueue([...readQueue(), askRecord(post, q, ctx, answer, model)]);
  const r = await flushQueue();
  if(!statusEl) return;
  statusEl.textContent = r.ok ? `Enregistrée dans ${GH_FILE} ✓`
    : r.why === 'nokey' ? 'Gardée dans ce navigateur (pas de jeton GitHub).'
    : (r.why === 'http 401' || r.why === 'http 403' || r.why === 'http 404')
      ? `Pas enregistrée : jeton refusé ou dépôt introuvable (${r.why}). Vérifiez GitHub en haut à droite.`
      : `Pas encore enregistrée (${r.why}) — nouvel essai à la prochaine question.`;
}

// ── LEARNING LOG (the forgetting curve — TEST MODE, see CLAUDE.md §8c) ──
// In Learn mode, each learning action is recorded with a timestamp: a hard spot clicked, a
// sentence played in Lire or opened in Simplifier, a word looked up, a dictation checked, a
// question asked, and an entry "met" (on screen ≥ 20 s — the exposures that tell remembering
// from forgetting). Events queue in localStorage and are appended in batches to
// learning/YYYY-MM-DD.jsonl in the repo (every few minutes, when the tab is hidden, and on the
// next visit if a save failed). tools/learner-profile.ts turns the log into LEARNER-PROFILE.md.
const KEY_LOG = 'felix_learn_log', LOG_SESSION = Math.random().toString(36).slice(2, 8);
interface LogEvent { ts: string; s: string; e: string; id: string; no: number; [field: string]: unknown }
function readLog(): LogEvent[] { try{ return JSON.parse(getLS(KEY_LOG) || '[]'); }catch(e){ return []; } }
function logEvent(e: string, post: Entry | undefined, fields?: Record<string, unknown>): void {
  if(!document.body.classList.contains('learn') || !post) return;
  const q = readLog();
  q.push({ ts: new Date().toISOString(), s: LOG_SESSION, e, id: post.id, no: post.no, ...fields });
  if(q.length > 5000) q.splice(0, q.length - 5000);     // never let the local queue grow unbounded
  setLS(KEY_LOG, JSON.stringify(q));
  if(!logTimer) logTimer = setTimeout(() => { logTimer = null; flushLog(); }, 3 * 60 * 1000);
}
let logTimer: number | null = null, logFlushing: Promise<void> | null = null;
// Append text to a repo file through the contents API (re-read and retry on a 409).
async function ghAppend(path: string, header: string, text: string, message: string): Promise<{ ok: boolean; why?: string }> {
  const token = githubToken(); if(!token) return { ok:false, why:'nokey' };
  const url = `https://api.github.com/repos/${ghRepo()}/contents/${path}`;
  const headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' };
  for(let attempt = 0; attempt < 3; attempt++){
    const cur = await fetch(url, { headers, cache:'no-store' });
    if(!cur.ok && cur.status !== 404) return { ok:false, why:'http ' + cur.status };
    const file: GhFile | null = cur.ok ? await cur.json() : null;
    const body = (file ? b64decode(file.content) : header) + text;
    const put = await fetch(url, { method:'PUT', headers, body: JSON.stringify({
      message, content: b64encode(body), ...(file ? { sha: file.sha } : {}) }) });
    if(put.ok) return { ok:true };
    if(put.status !== 409) return { ok:false, why:'http ' + put.status };
  }
  return { ok:false, why:'conflit' };
}
// Send the oldest day's events (one file per day keeps each file small).
function flushLog(): Promise<void> {
  if(logFlushing) return logFlushing;
  logFlushing = (async () => {
    const q = readLog(); if(!q.length || !githubToken()) return;
    const day = q[0].ts.slice(0, 10), batch = q.filter(ev => ev.ts.slice(0, 10) === day);
    const r = await ghAppend(`learning/${day}.jsonl`, '', batch.map(ev => JSON.stringify(ev)).join('\n') + '\n',
                             `learning: ${batch.length} events (${day})`);
    if(!r.ok) return;
    // Remove what was sent (events logged meanwhile were appended after it, so keep those).
    setLS(KEY_LOG, JSON.stringify(readLog().filter((ev, n) => !(n < q.length && q[n].ts.slice(0, 10) === day))));
    if(readLog().length) setTimeout(flushLog, 2000);   // another day still waiting
  })().catch(() => {}).finally(() => { logFlushing = null; });
  return logFlushing;
}
document.addEventListener('visibilitychange', () => { if(document.hidden) flushLog(); });

// Exposure: an entry counts as "met" once per visit, after 20 s in the middle of the screen in Learn mode.
const VIEW_MS = 20000, viewSeen = new Set<string>(), viewTime: Record<string, number> = {}, viewVisible = new Set<string>();
const viewObserver = new IntersectionObserver(items => items.forEach(it => {
  if(it.isIntersecting) viewVisible.add(it.target.id); else viewVisible.delete(it.target.id);
}), { rootMargin: '-40% 0px -40% 0px', threshold: 0 });   // crossing the middle of the screen
setInterval(() => {
  if(document.hidden || !document.body.classList.contains('learn')) return;
  viewVisible.forEach(id => {
    viewTime[id] = (viewTime[id] || 0) + 5000;
    if(viewTime[id] >= VIEW_MS && !viewSeen.has(id)){ viewSeen.add(id); logEvent('view', POSTS.find(p => p.id === id)); }
  });
}, 5000);

// ── INIT ──
window.addEventListener('load', () => {
  setLearn(getLS(KEY_LEARN)==='1');   // plain diary by default
  showAll();                  // load + render every entry, oldest first
  const s=parseFloat(getLS(KEY_SPEED)!); if(!isNaN(s)) speed=s;
  if(window.speechSynthesis) speechSynthesis.getVoices();
  const key=elevenKey();
  if(key) fetchVoices(key,false);
  refreshReadbar();
  setTimeout(flushLog, 4000);        // events left from an earlier visit
});
