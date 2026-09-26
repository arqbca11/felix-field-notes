# Felix — Notes de terrain 🏔️📓

### 👉 Read it live: **https://arqbca11.github.io/felix-field-notes/**

The sequel to [*Felix · Carnet de voyage*](https://arqbca11.github.io/felix-carnet-de-voyage/), a
French-learning app you read for **comprehensible input**. The summer blog is over. Felix has gone home
to Chamonix to train as a mountain guide, and this is his **private notebook**: training days, the
people he meets, plans, and memories of three winters working in the mountains of British Columbia.

Not a blog. He writes for himself, so the entries are as long or as short as the day was: one sentence,
a page, a full trip report, a portrait of a mentor, a memory. Each one comes in natural French with an
English translation, vocabulary, grammar notes, and read-aloud audio.

Built for a learner heading toward **TCF Canada (B2)**. Entries sit between **B1 and B2** depending on
the topic; each one carries a level tag.

---

## ✨ What you get

- **Entries in French, varied in length and kind** — *note*, *journal*, *compte rendu*, *portrait*,
  *souvenir*, *projet*. A real diary voice: named routes, named people, opinions, regrets.
- **Side-by-side English** — tap **Traduction** and the entry widens into two columns, French left,
  English right, paragraph-aligned.
- **Simplifier** — tap **Simplifier**, then any sentence of the entry: an A1/A2 French version of
  it appears on the right, with its English and a play button. Click as many sentences as you like;
  they stack in paragraph order. Every entry has it.
- **Vocabulary & grammar notes** — tap **Vocabulaire** or **Grammaire** (separate, so long entries stay readable). Verbs open a full conjugation panel
  (présent, passé composé, imparfait, futur simple). Grammar notes build on the blog's keystone
  (*passé composé vs imparfait*) and push into B1–B2: *plus-que-parfait*, *subjonctif*, *conditionnel
  passé*, reported speech, *dont / lequel*, *si* clauses.
- **Read aloud** — a play button on every paragraph. **Lire** makes every sentence clickable: click
  one to hear it, and it comes back on the right with its hard spots underlined (new words, liaisons,
  linked sounds, silent letters, tricky vowels); click a spot to hear just that bit and read a short
  note. **Tout lire** (in that panel) reads the whole entry with the current line highlighted. Adjustable speed. Optional ElevenLabs voices; the browser's French voice
  works with no setup.
- **Select-to-translate** — highlight any word or phrase in the French text for a quick gloss, with a
  🔊 button to hear it. The entry's own vocabulary answers first; single words then go to Wiktionary
  (real senses with part of speech, and "past participle of replier → to fold" for inflected forms);
  phrases go to an online translator.
- **Dictation practice** — the ✎ button on any paragraph hides the text and opens a typing box. Play
  the audio, write what you hear, and **Vérifier** scores you word by word.
- **A plain diary until you ask.** The page opens as text only: white page, black text, one column,
  oldest entry first. Tap **Learn** (top right) to reveal all of the above: voices, level tags, the
  read/translate/notes links, the per-paragraph buttons, and select-to-translate. Tap it again to go
  back to reading. The choice is remembered.
- **A time axis** — a small vertical line on the left, one grey dot per entry placed by date. Drag it
  (or click) to jump to an entry; the black dot follows as you scroll. It grows a little with every
  entry added.

---

## 🚀 Getting started

No installation, no build step, no server.

1. **Download** this project (green **Code → Download ZIP** on GitHub, then unzip — or `git clone`).
2. **Double-click `index.html`** to open it in any modern browser.

> Keep the `notes/` folder next to `index.html` — that's where the entries live.

### Optional: nicer voices 🎙️

Click **Connecter ElevenLabs** in the reading bar, paste an [ElevenLabs](https://elevenlabs.io) API
key, pick a voice. The key stays in your browser only (`localStorage`) and is sent nowhere except
ElevenLabs. If you already connected it on the travel blog, it is picked up here automatically.

---

## 📓 The notebook so far

| # | Date | Kind | Entry |
|---|------|------|-------|
| 1 | 20 Sep 2026 | Note | *Bath, dans la cuisine* — one line, before the decision is said out loud |
| 2 | 26 Sep 2026 | Journal | *La décision* — the dinner table in Bath; Chamonix for good; the guide exam |
| 3 | 2 Oct 2026 | Journal | *Argentière, quatorze mètres carrés* — the studio, first run to Lognan |
| 4 | 6 Oct 2026 | Portrait | *Bertrand* — the old guide reads the list: "La glace, il n'y a rien." |
| 5 | 11 Oct 2026 | Souvenir | *Revelstoke, première neige* — a photo from Eric; the first Canadian winter; Addie, and the line he didn't cross |
| 6 | 14 Oct 2026 | Compte rendu | *Les Crochues, en guide* — Bertrand hands him the rope and plays the client |
| 7 | 19 Oct 2026 | Note | *Une page que je referme* — the Canadian guide-course dates, looked at and closed |
| 8 | 27 Oct 2026 | Journal | *Vingt centimètres* — Toussaint snow, a gear day, the sums until March |
| 9 | 1 Nov 2026 | Portrait | *Théo* — the childhood friend visits; the Vancouver–San Francisco ride remembered |
| 10 | 9 Nov 2026 | Projet | *Le plan pour l'hiver* — Bertrand's winter, month by month; three rules; the open questions |
| 11 | 3 Dec 2026 | Compte rendu | *Cogne, première glace* — first ice of the winter at Lillaz; a bad screw; the thawing fingers; Bertrand on Marcel |
| 12 | 5 Dec 2026 | Note | *Premier samedi au magasin* — eight hours of ski boots; a family from Lyon; "Vous êtes guide ?" — "Pas encore" |
| 13 | 13 Dec 2026 | Journal | *Premières traces* — the Grands Montets open; Bertrand's two corrections to the fiche; Chloé announces Christmas in Argentière |
| 14 | 19 Dec 2026 | Souvenir | *Bay Area* — a San Francisco couple in the shop; Addie, remembered: the two visits of the last winter, what he told her, what he didn't ask, and why Canada keeps coming back |

*Entries appear in order, oldest first.*

---

## ➕ Adding an entry

Each entry is a small, self-contained file — you don't touch `index.html`.

1. Copy a file in `notes/` of the same kind (e.g. `notes/01-bath-cuisine.js` for a short note) to
   `notes/06-yourslug.js` and edit the content: French paragraphs (`fr`), English (`en`), `vocab`,
   `gram`, optional `place`.
2. Add one line to `notes/manifest.js`, at the **bottom** (newest last), with the entry's ISO date.
3. Run `node tools/validate.mjs`, then reopen `index.html`.

Full schema, the character bible, and the writing rules are in [`CLAUDE.md`](CLAUDE.md).

---

## 🎬 How the entries get written — a writers' room of agents

The entries aren't written by hand, and they aren't written by one model in one go either. They
come out of something that grew, over a few months, into a **TV writers' room** — with one human
in charge and a room of agents that each know only what their job needs:

| Role | Who | Knows |
|---|---|---|
| Lead writer & producer | the human | everything; decides what is *true* |
| Series bible | `CLAUDE.md` | the record of what is true — timeline, people, rules, and the *author knowledge* the character must never have |
| Story editor | the main Claude Code session | plans arcs, writes one brief per entry, keeps the bible |
| Episode writer | `entry-writer` agent | the bible + one brief. No memory of anything else. |
| Script supervisor | `continuity-reviewer` agent | the bible + the entry; reports, changes nothing |
| Subtitler | `simplifier` agent | one entry; writes its A1/A2 layer |
| The readers | zero-context agents (`tools/reader.sh`) | **only the entries**, in order, nothing else |

`/new-entries N details…` runs a batch: writers strictly in sequence (each reads the last accepted
entry as canon), the review before the next writer, the simplifier in the background. Details you
hand in are canon whether an entry uses them or not; unused ones wait in `seeds.md`. After the
batch, the readers re-read everything and write [`STORY-READER.md`](STORY-READER.md) — what an audience that
can't see the bible currently knows, suspects, and is waiting for. That's how dramatic irony gets
measured instead of guessed.

Why a room and not a pipeline, what turned out to be different from writing code this way (the
spec is allowed to lie; some facts are hidden from the character but not the writer; validation is
mostly a matter of taste), and what was learned the hard way: [`WRITERS-ROOM.md`](WRITERS-ROOM.md).
None of it was designed up front — every rule in the room is there because of a specific failure
it prevents.

---

## 📁 Project structure

```
index.html           The app — open this. Engine only: layout, audio, reading UI.
notes/
  manifest.js        Index of all entries, oldest → newest. All are displayed, in this order.
  01-bath-cuisine.js One file per entry: text + translation + vocab + grammar.
  02-decision.js
  …
tools/validate.mjs   Syntax + data checks for the engine and every entry.
tools/reader.sh      Rebuilds STORY-READER.md with a zero-context reader agent.
tools/learner-profile.mjs  Builds LEARNER-PROFILE.md from the page's learning log.
tools/knowledge-check.sh   Hook: launches the knowledge scout at most once a day.
tools/brief-template.md  The brief a writer agent gets — the whole interface.
.claude/agents/      entry-writer · continuity-reviewer · simplifier · knowledge-scout
.claude/skills/new-entries/  The batch workflow (/new-entries N details…).
CLAUDE.md            The series bible + maintainer guide (voice, timeline, people, schema).
WRITERS-ROOM.md      How the room works and why it looks like this.
STORY-READER.md      The STORY: what an imaginary reader of the notebook knows and suspects so far.
LEARNER-PROFILE.md   YOU: your forgetting curve — what you look up, click and forget (test mode).
seeds.md             Details supplied for future entries, waiting for their episode.
knowledge_pool.md    The real world around the story: dated, sourced facts (Alps + Canada).
questions.md         Your Demander questions and Claude's answers, saved by the page.
learning/            The page's learning log (one .jsonl per day) + forgetting-curve dry runs.
notes.md             The learner's study questions (sentence, grammar, vocab).
```
