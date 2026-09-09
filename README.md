# Felix — Notes de terrain 🏔️📓

### 👉 Read it live: **https://arqbca11.github.io/felix-field-notes/**

The sequel to [*Felix · Carnet de voyage*](https://arqbca11.github.io/felix-carnet-de-voyage/), a
French-learning app you read for **comprehensible input**. The summer blog is over. Felix has gone home
to Chamonix to train as a mountain guide, and this is his **private notebook**: training days, the
people he meets, plans, and memories of three winters working in the mountains of British Columbia.

Not a blog. He writes for himself, so the entries are as long or as short as the day was: one sentence,
a page, a full trip report, a portrait of a mentor, a memory. Each one comes in natural French with an
English translation, vocabulary, grammar notes, read-aloud audio, and a map.

Built for a learner heading toward **TCF Canada (B2)**. Entries sit between **B1 and B2** depending on
the topic; each one carries a level tag.

---

## ✨ What you get

- **Entries in French, varied in length and kind** — *note*, *journal*, *compte rendu*, *portrait*,
  *souvenir*, *projet*. A real diary voice: named routes, named people, opinions, regrets.
- **Side-by-side English** — tap **Traduction (EN)** and the entry splits into two columns, French
  left, English right, paragraph-aligned.
- **Vocabulary & grammar notes** — tap **Notes de français**. Verbs open a full conjugation panel
  (présent, passé composé, imparfait, futur simple). Grammar notes build on the blog's keystone
  (*passé composé vs imparfait*) and push into B1–B2: *plus-que-parfait*, *subjonctif*, *conditionnel
  passé*, reported speech, *dont / lequel*, *si* clauses.
- **Read aloud** — a play button on every paragraph, plus **▶ Lire** for the whole entry with the
  current line highlighted. Adjustable speed. Optional ElevenLabs voices; the browser's French voice
  works with no setup.
- **Select-to-translate** — highlight any word or phrase in the French text for a quick gloss, with a
  🔊 button to hear it. The entry's own vocabulary answers first; anything else goes to a free online
  dictionary.
- **Dictation practice** — the ✎ button on any paragraph hides the text and opens a typing box. Play
  the audio, write what you hear, and **Vérifier** scores you word by word.
- **Map** — a pin for every entry that has a place. Green pins are now (Chamonix and around); brown
  pins are memories (Canada, elsewhere). **Ici** fits the map to the present, **Tout** shows everything.
- **Calendar** — pick a day to see the ten most recent entries as of that date.

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
| 5 | 11 Oct 2026 | Souvenir | *Revelstoke, première neige* — a photo from Eric; Canada; a message unanswered |

*The page shows the ten most recent entries.*

---

## ➕ Adding an entry

Each entry is a small, self-contained file — you don't touch `index.html`.

1. Copy a file in `notes/` of the same kind (e.g. `notes/01-bath-cuisine.js` for a short note) to
   `notes/06-yourslug.js` and edit the content: French paragraphs (`fr`), English (`en`), `vocab`,
   `gram`, optional `place` and `lat`/`lng`.
2. Add one line to `notes/manifest.js`, at the **bottom** (newest last), with the entry's ISO date.
3. Run `node tools/validate.mjs`, then reopen `index.html`.

Full schema, the character bible, and the writing rules are in [`CLAUDE.md`](CLAUDE.md).

---

## 📁 Project structure

```
index.html           The app — open this. Engine only: layout, map, audio, reading UI.
notes/
  manifest.js        Index of all entries, oldest → newest. The last ten are displayed.
  01-bath-cuisine.js One file per entry: text + translation + vocab + grammar + optional location.
  02-decision.js
  …
tools/validate.mjs   Syntax + data checks for the engine and every entry.
CLAUDE.md            Author/maintainer guide (voice, timeline, people, schema).
```
