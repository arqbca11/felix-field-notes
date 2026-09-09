# CLAUDE.md — Felix · Notes de terrain (Felix's Field Notes)

A single-file French-learning web app, the **sequel** to *Felix · Carnet de voyage* (the parent folder's
blog, `../felix_blog.html`). Same engine idea (French text + English translation + vocab/grammar notes,
text-to-speech, dictation, select-to-translate), but this is **Felix's private notebook**, not a
blog: entries of any length, written for himself, after the summer journey ended.

`index.html` is an engine-only **template**. Each entry lives in its own `notes/NN-slug.js` resource
file, indexed by `notes/manifest.js`. The page shows **every entry, oldest first**, in one plain column. No build step — open
the HTML directly. This folder is its **own git repo** (remote: `felix-field-notes`); the parent repo
ignores it.

> Built for a learner targeting **TCF Canada (CLB 7 / B2)**, now moving from A2 into **B1–B2**, who
> learns by high-volume varied input. French goes in the *examples*; explanations stay in English.
> Concise explanations, no over-explaining, no condescension.

---

## 1. Golden rules (inherited from the blog, plus the diary's own)

1. **Felix is an experienced mountain person, not a beginner.** Strong ski tourer, multi-pitch climber
   since his teens, paddler. Competence is the baseline. Never scared, hesitant, or "daring".
2. **This is a private notebook.** No greeting, no reader ("Salut à tous" is banned). He writes for
   himself: to think, to remember, to plan. He can be blunter, sadder, funnier, and more unfinished
   than in the blog. Fragments and one-liners are allowed. He never explains who people are for a
   reader — continuity carries that (a short parenthesis at most).
3. **Length follows the day.** A one-sentence note, a paragraph, a five-paragraph trip report, a
   portrait of a person, a memory. Vary the `kind` across neighbouring entries; don't write three
   long reports in a row, don't write five notes in a row.
4. **Concrete, specific detail.** Named summits, real routes and cols, real hut names, gear, snow,
   food, named people with personality. Opinions, humor, a point of view.
5. **Realistic geography, calendar, and season.** Entries are dated; conditions follow the date
   (October in Chamonix = rock still dry low down, first snow high; November = waiting for snow;
   December onward = ski). Training plans follow the real French guide pathway (§2d).
6. **Level = B1 to B2, by topic.** Notes and daily entries sit at B1; reports and reflections may
   run B2. Each entry carries a `level` tag (`'B1'`, `'B1+'`, `'B2'`). One or two "stretch" elements
   per entry, left transparent.
7. **Reinforce grammar across entries** (puzzle-piece effect). The keystone stays *passé composé vs
   imparfait*; the diary layers *plus-que-parfait*, *conditionnel (passé)*, *subjonctif*, *futur*
   /*futur antérieur*, *discours indirect*, *dont / lequel*, hypothetical *si*. See §4.
8. **Three threads run underneath and never become formulas:** the guide training (present),
   Canada/Eric (memory), and Addie (memory, and an open door). Most entries touch **one**, some none.
   Never all three in one entry. Never a "she'd have loved this" line as a reflex.

### 1a. Reflective register (unchanged from the blog)

Felix's reflective sentences quietly draw on two travel writers, as **sensibility**, never quotation:
**Nicolas Bouvier** (slow travel works on you; small moments and ordinary people over monuments) and
**Antoine de Saint-Exupéry** (meaning through effort, solitude, comradeship; the land tests and shapes
you). Guardrails: **one or two reflective sentences per entry, max**, always **earned by a concrete
scene**; stay understated and a touch dry; **never quote or name these authors**; if a line needs
fancier French than the entry's level, it is the wrong line. In a private diary these lines may be
more personal than in the blog, but not more decorated.

---

## 2. Felix — character bible (source of truth for the sequel)

### 2a. Who he is
- **Felix**, 24 (born 2002). British-born, French-raised, bilingual. Grew up in **Lyon** (father's
  job) with **every summer and many winters in the Chamonix valley**, where his **French mother** is
  from (Les Houches). Father English, an engineer. A younger sister, **Chloé** (20), at university in
  Edinburgh. His parents moved back to **England (near Bath)** in 2020 when he finished school; he
  went to Chamonix instead.
- His **grandfather, Marcel** (mother's father, a Chamonix man) put him on skis at four and taught him the
  mountains. He **died in 2021**, before Canada. He appears only as memory, warm and formative; his
  line: *« La peur, ça se respecte, mais ça ne décide pas pour toi. »* Felix still collects a small
  stone from places that matter (light thread; don't make it a ritual every entry).
- **Skills:** strong ski tourer (glacier travel, roped, reads snow), multi-pitch rock since his
  teens (places gear, calm with exposure), ice/mixed at a solid amateur level (this is what his guide
  list lacks most), experienced paddler, decent on a bike.
- **Voice:** loves the uphill and the silence; sociable with locals; dry self-aware humor (his
  Italian is *catastrophique*; his Canadian colleagues called him *"the French guy"* and the French
  call him *l'Anglais*); reflective in short bursts; allergic to grand words about conquering
  mountains. Writes the notebook in French **on purpose**, to keep his head in French now that he's
  chosen this life.

### 2b. Timeline (keep every entry consistent with this)
| When | What |
|---|---|
| 2002 | Born in England. Family moves to Lyon when he is small. |
| 2006 | Grandfather puts him on skis in Chamonix. |
| 2014–2020 | Teenage climbing (Aiguilles Rouges, Mont-Blanc granite with grandfather's friends), ski touring. Bac in Lyon, 2020. Parents return to England; Felix moves to Chamonix. |
| 2020–2022 | Two winters as a Chamonix *saisonnier* (rental shop, lift work), summers climbing. Grandfather dies in 2021. |
| **Dec 2022 – Apr 2023** | **Canada, season 1.** Revelstoke Mountain Resort, BC. CSIA Level 1 then 2; ski instructor. Meets **Eric**. Takes AST 1 / AST 2 (avalanche courses). Rogers Pass touring. |
| Summer 2023 | Back in Chamonix; alpine climbing. |
| **Dec 2023 – Apr 2024** | **Canada, season 2.** Private-lesson instructor. **Addie** is his client: three days in early Feb 2024, two more days in March 2024. |
| **Aug–Sep 2024** | **Bikepacking Vancouver → San Francisco** (~3 weeks, the Pacific coast: Vancouver Island ferry, Olympic Peninsula, the Oregon coast, Highway 1, the redwoods, Big Sur is *south* of SF so not on route) with childhood friend **Théo**. Ends in San Francisco, where he sees Addie **once**, one evening (Sep 2024). |
| **Dec 2024 – Apr 2025** | **Canada, season 3.** Addie comes back for one week in Feb 2025, including a touring day with Eric. Last time they see each other. Work permit ends; leaves Canada April 2025. |
| Summer 2025 – Apr 2026 | Chamonix. Shop work, a lot of climbing and, in winter, ski touring. Saving. |
| May – 13 Sep 2026 | **The blog journey** (18 weekly posts, see `../CLAUDE.md` §3): Chamonix → Dolomites → Slovenia → Croatia → Bosnia → Lofoten → Lapland → Sweden → Saxony → Bavaria → Austria → Slovenia → Montenegro → home → Tour du Mont-Blanc. |
| **~16 Sep 2026** | Train to England (Bath). Family. |
| **Late Sep 2026** | **The decision:** move to Chamonix full time and train to become a *guide de haute montagne* (ski mountaineering is the heart of it). |
| **~1 Oct 2026 →** | Back in Chamonix. Rents a studio in **Argentière**. **The notebook begins.** |

### 2c. People
- **Eric** — Canadian, from Québec originally (so French is natural between them; his French is
  Québécois, Felix's Lyonnais — a running source of jokes: *char*, *tuque*, *tabarnak*, *c'est correct*).
  ACMG mountain guide, ~55, based in Revelstoke; runs backcountry days out of Rogers Pass and taught
  the AST courses Felix took. Big, calm, unhurried, deadly serious about snow. **He is the one who
  said Felix should do this properly** (become a guide), the first person to say it out loud.
  Fond of *« La montagne, elle te dit non. Toi, tu l'écoutes. »* Present only in memory; an email or
  a message from him is allowed, rarely.
- **Addie** — **A.B.**; he mostly writes *Addie*, sometimes just *A.* He knows her Chinese name,
  **Anyu**, and uses it almost never (maybe once, when it matters). Chinese, grew up in China, came to
  California for graduate school, works in the Bay Area. Late twenties. Intermediate skier who wanted
  to learn off-piste properly: methodical, unafraid of steep terrain but wants to understand it, asks
  real questions, quietly funny, photographs trees and snow textures rather than views. Client of
  his three times at Revelstoke (Feb 2024, Mar 2024, Feb 2025) and one evening in San Francisco
  (Sep 2024). **Mutual feelings, never a relationship**: wrong sides of an ocean, a work permit
  ending, and two people who were careful. They still message, rarely; the last one was months ago.
  **Rules:** restraint. She appears in maybe one entry in five, triggered by something concrete (a
  photo, a snow texture, a message, a song in a café). Never sentimental narration, never a plot
  twist without the user asking. The door stays open, not pushed.
- **Théo** — childhood friend from the Chamonix summers, son of a family friend, now in Lyon. The
  Vancouver–SF bikepacking partner (Aug–Sep 2024). Talker, mechanic, terrible navigator.
- **Bertrand** — Chamonix guide, 63, Compagnie des Guides since 1988, lives in Les Praz. **Knew
  Felix's grandfather** (they climbed together in the 80s). Dry, exact, few words; says *« on verra »*
  as a complete sentence; dislikes the verb *conquérir*. Agrees to take Felix out and vet his list.
  **The mentor of the present.** Not a father figure — a professional who is watching whether Felix
  can do the job.
- **Josiane** — his landlady in Argentière, 72, knew Marcel ("Tu as ses mains"). Background
  presence: a word on the stairs, a remark about the weather, never a scene of her own.
- **Family:** mother (Marianne, Chamoniarde, quietly pleased about the decision), father (David,
  practical, asks about money and insurance), sister Chloé (the one Felix actually talks to).
- **Blog-era friends** (Marco, Anže, Ivana, Jure, Karin, Lutz, Sepp, etc., see `../CLAUDE.md` §3)
  exist and may be mentioned in passing. Marco (Italian guide, old friend) is the most likely to recur.

### 2d. The guide pathway (French reality, kept plausible)
- The diploma: **diplôme d'État d'alpinisme – guide de haute montagne**, taught at the **ENSA**
  (École nationale de ski et d'alpinisme) in Chamonix.
- Entry is by the **examen probatoire** (spring). Candidates submit a **liste de courses**: a list of
  climbs and ski tours done in recent years, across rock, snow/ice, mixed, and ski mountaineering,
  with minimum grades and numbers. The exam itself tests ski (off-piste + touring), rock, ice, and
  general mountain craft.
- After the probatoire come the training cycles; the **aspirant guide** stage lets him work under
  supervision. It's a multi-year road. Felix's plan: **probatoire in spring 2027** if the list is
  ready (Bertrand: *« C'est juste. On verra. »*), otherwise 2028.
- His list's gaps: **ice and mixed routes** and a few graded **ski descents**; rock is strong;
  glacier ski touring is strong. Autumn = rock and dry-tooling and running; winter = ski list.
- Money: he has savings; picks up some ski-shop/rental shifts, and later some hut or race-marshal
  work. Don't over-detail finances; one honest line now and then is enough.

---

## 3. Entry log (continuity — append one line per entry)

| # | Date | Kind | Title | Thread | Level |
|---|------|------|-------|--------|-------|
| 1 | 2026-09-20 | note | Bath, dans la cuisine | family | B1 |
| 2 | 2026-09-26 | entry | La décision | family / guide | B1+ |
| 3 | 2026-10-02 | entry | Argentière, quatorze mètres carrés | guide (move, studio, first run up to Lognan) | B1 |
| 4 | 2026-10-06 | portrait | Bertrand | guide (the list, "on verra") — grandfather link | B2 |
| 5 | 2026-10-11 | memory | Revelstoke, première neige (a photo from Eric) | Canada / Addie first appears, lightly | B1+ |

**Open threads to pick up next:** first real training outing with Bertrand (an Aiguilles Rouges
ridge or a granite route while it's still dry); dry-tooling at the Crèmerie/Argentière ice park when
it forms; a message to or from Addie (not yet answered); Théo visiting; first snow on the Grands
Montets; shop shifts; the December start of the ski list; a full trip report (`report`) around
mid/late October.

---

## 4. Grammar arc (B1 → B2)

Keystone throughout: **passé composé (events) vs imparfait (backdrop, habits, states)**. The diary
pulls the next layers forward naturally — assign them by what the entry is *about*:

- **Memories (Canada, Addie):** `plus-que-parfait` (*elle était déjà venue*), `imparfait` for habits
  (*on skiait tôt*), time markers (*à l'époque, ce jour-là, la veille, deux ans plus tôt*).
- **What didn't happen:** `conditionnel passé` (*j'aurais dû lui dire*), hypothetical `si` +
  `plus-que-parfait` (*si j'étais resté*), `si` + `imparfait` → `conditionnel` (*si elle venait*).
- **Plans and doubt:** `futur simple`, `futur antérieur` (*quand j'aurai fini ma liste*),
  `subjonctif` after *il faut que / avant que / bien que / pour que / je ne pense pas que*.
- **What people said:** `discours indirect` (*Bertrand a dit qu'il verrait*), tense backshift.
- **Density and precision:** `dont`, `lequel/laquelle`, `ce qui / ce que`, the passive, the
  `gérondif`, `de` + plural adjective (*de longues journées*), `ne … que`, `ne … plus`, `venir de`.
- **Per entry:** `note` → 1–2 grammar points, 3–6 vocab; `entry`/`memory`/`portrait` → 3–4 points,
  10–16 vocab; `report` → 4–5 points, 16–22 vocab. Every entry reuses at least one earlier pattern.
  English explanation + French examples in `<span class="ex">…</span>`, glosses after
  `<span class="arrow">→</span>`.

---

## 5. Technical architecture

Forked from the blog engine (`../felix_blog.html`), then **stripped to the minimum** (user request,
8 Sep 2026): white page, black text, one column, no masthead, **no map, no calendar**. Everything the
blog could do for *reading* still works: ElevenLabs TTS with browser `speechSynthesis` fallback,
per-paragraph play + "Lire" sequential reader with highlight, voice picker with previews, speed
cycle, in-memory audio cache with prefetch, select-to-translate (curated vocab → Wiktionary senses for single words, following
"form of" links → Google Translate endpoint for phrases → MyMemory last, echoes rejected), per-paragraph dictation with diff scoring, translation and notes toggles (the entry widens
to two columns), per-verb conjugation panels.

**Learn toggle (fixed to the top-right corner of the viewport, `.controls`, stays put on scroll; the voice/speed bar and the key/voice panels drop down under it).** The page opens as a **plain diary**: name, number + date, title, French
text. Nothing else (place and kind are learning-mode metadata too). Clicking **Learn** (`body.learn`, remembered in
`localStorage` as `felix_notes_learn`) reveals everything language-related: voice/speed controls,
level tag, English subtitle, Lire/Traduction/Notes de français, per-paragraph play + dictation,
select-to-translate. Anything learning-related must carry the `learn-only` class (or be gated in JS
like `runLookup`) so plain mode stays plain. Turning Learn off closes open panels and stops audio.

**How it differs from the blog:**
- **Registry:** `window.FelixNotes` (`register`, `verb`) and `window.NOTES_MANIFEST`. Different
  globals from the blog so files can never collide.
- **All entries, oldest first.** `showAll()` injects every file in the manifest and renders them
  sorted by `no` ascending. No "latest N" cap, no date navigation. (If the notebook grows large,
  add a "load older" control then; don't pre-build it.)
- **`kind` per entry** drives the card: `note` renders compact (meta line, text, actions below);
  the other kinds render meta, title, actions, text. Chrome only shows what exists (no "Notes"
  link if `gram` and `vocab` are empty). `lat`/`lng` are kept in the data but **not rendered**.
- **Identity:** deliberately none. `Newsreader` for all reading text, the system sans for the small
  UI labels. Hairline rules between entries. Buttons are underlined text, not pills. The only
  non-grey colour is the dictation red for mistakes.
- Load order, `file://` compatibility (injected `<script>` tags, never `fetch` for local files),
  delegation on `#feed` (`data-play`, `data-toggle`, `data-conj`, `data-dict`, `data-check`,
  `data-reveal`), `getLS/setLS` try/catch wrappers — all as in the blog.

### Design tokens (`:root`)
```
--ink:#000000  --soft:#4a4a4a  --muted:#8a8a8a
--line:#e6e6e6  --wash:#f4f4f4          /* hairlines; the "speaking" paragraph highlight */
--serif: Newsreader   --sans: system sans
```
Keep it this way: no accent colour, no cards, no shadows, no rounded pills.

---

## 6. Entry resource-file schema (`notes/NN-slug.js`)

```js
FelixNotes.register({
  id:'bath-cuisine',                 // unique slug, used for element IDs + manifest
  no:1,                              // entry number (pin label + render sort key)
  date:'2026-09-20',                 // ISO; the page prints it in French
  kind:'note',                       // note | entry | report | portrait | memory | plan
  level:'B1',                        // 'B1' | 'B1+' | 'B2'
  title:'Bath, dans la cuisine',     // optional for `note`, required otherwise
  titleEn:'Bath, in the kitchen',    // optional
  place:'Bath, Angleterre',          // optional, shown in the meta line
  lat:51.3811, lng:-2.3590,          // optional; kept for the record, not rendered (no map)
  fr:[ "…", … ],                     // 1..N paragraphs
  en:[ "…", … ],                     // 1:1 translation (same length)
  vocab:[ ['mot fr','gloss'], ['verbe','to …', FelixNotes.verb('verbe', pres, pc, imp, fut)], … ],
  gram:[ {h:'Heading', p:'Explanation with <span class="ex">…</span>'}, … ]
});
```
`FelixNotes.verb(inf, présent, passéComposé, imparfait, futur)`: each tense is an array of the **6
persons** with pronoun and auxiliary baked in (`"j'ai skié"`, `"je suis parti(e)"`). Double-quote the
form strings. Mark a vocab entry as a verb only when you give real conjugations.

Manifest line (`notes/manifest.js`, chronological, newest last):
```js
{ id:'bath-cuisine', file:'notes/01-bath-cuisine.js', date:'2026-09-20' },
```

## 7. How to add an entry
1. Create `notes/NN-slug.js` (copy a previous one of the same `kind`). Follow §1–§2, pick the date
   and season honestly, give it the next `no`.
2. Append one line to `notes/manifest.js` (bottom). It renders at the bottom of the page.
3. `fr` and `en` same length. Vocab and grammar sized by kind (§4). Keep one future-tense or
   subjunctive beat in play across neighbouring entries.
4. Append a line to the **entry log** (§3) and update *open threads*.
5. Run `node tools/validate.mjs` (§10).

## 8. String-escaping gotchas
- `fr`/`en` paragraphs: **double quotes** → apostrophes are safe.
- `vocab` French keys are single-quoted → escape apostrophes: `'l\'arête'`.
- `gram` `h`/`p`: single-quoted HTML strings → **escape every apostrophe** (`don\'t`, `c\'est`).
- Never put French text into inline `onclick`. Handlers use `data-*` attributes.

## 9. Other gotchas
- `localStorage` via `getLS/setLS` only (try/catch). Keep it that way.
- `notes/*.js` are plain scripts (no `import`/`export`), registering via `FelixNotes.register`.

## 10. Validate
```bash
node tools/validate.mjs     # syntax-checks index.html's inline script + every notes file,
                            # then asserts fr/en alignment, kinds, levels, conj shapes, manifest order
```
Run it after every edit. A `node --check` failure is almost always an unescaped apostrophe in a
`gram` string.
