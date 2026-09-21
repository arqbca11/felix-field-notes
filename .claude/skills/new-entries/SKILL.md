---
name: new-entries
description: Write the next N Felix Field Notes entries. The main agent plans the arc and writes one brief per entry, delegates each brief to the entry-writer subagent (Opus), reviews the result against the bible, registers it, validates, and commits. Optional free text after N = details the user wants considered (used now or banked in seeds.md for later; never contradicted). Usage: /new-entries 5  |  /new-entries 3 Chloé brings a broken binding; Eric emails a photo of the new Rogers Pass hut
---
# /new-entries N [details…] — the batch workflow

You are the main agent (the planner, editor, and engineer). The **writing** of each entry is
delegated to the `entry-writer` subagent; the **review** may be delegated to
`continuity-reviewer`. You keep the story, the bible, and the engine.

## 0. Read the arguments and the seed bank
The arguments are **N** (first token) and, optionally, **details**: free text the user wants
considered in the next entries — a beat, a fact, an object, a person's remark, a mood, a place.
Split the text into separate details (one idea each). Then read **`seeds.md`** (repo root): the
bank of details supplied in earlier runs that no entry has used yet. The working set for this
batch is **new details + banked details**.

Rules for details (both new and banked):
- Each detail is **canon from the moment it's supplied**, whether or not an entry uses it. Nothing
  written may contradict it. If a detail is a *fact* about the world or a person (not just a
  beat), add it to the bible §2 now, before any brief — the writer only knows the bible + brief.
- A detail is **used** when an entry gives it a real place (a beat, a line, a prop), not a
  glancing mention. Use a detail only where it belongs; don't force the whole set into one batch.
- What isn't used is **banked**: it stays in `seeds.md` for a later batch (§5). Never drop a
  detail silently; if one has become impossible (overtaken by events), say so to the user and
  mark it retired with the reason.
- **The one licensed "conflict":** the notebook is unreliable about Felix's own wants, plans and
  feelings (bible §2d, the spine). An entry may have Felix *write* something at odds with a
  supplied detail about what he really wants / plans / feels — that is the device, not a
  contradiction. Facts of the world (who, when, where, what happened, what someone said) are never
  bent this way. When a brief uses the device, it must say so explicitly (see the template's
  `Supplied details` block) so the reviewer doesn't flag it.

## 1. Plan the batch
- Read `CLAUDE.md` §3 (entry log + **open threads**) and the last three entries in `notes/`.
- Lay the working set of details against the N slots: which detail lands in which entry (and
  how — as a beat, a prop, a remembered remark), which are held for later. Details shape the
  plan; they don't replace it (the calendar, the kinds, the threads, the one-in-five Addie rule
  still govern).
- Decide the next N entries: **date** (realistic gaps, season-true), **kind** (vary them; never
  three long ones or three notes in a row), **level** (B1 / B1+ / B2 by topic), which **thread**
  each touches (guide / Canada / Addie / family / friend / daily), and which **grammar** each
  carries forward and introduces (§4). Addie in at most one entry in five.
- Mind the calendar: shop shifts are weekends + school holidays from 5 Dec 2026; the Aiguille
  du Midi lift reopens mid-December; ice forms late Nov–Dec; the probatoire is in spring.

## 2. Write one brief per entry
Use `tools/brief-template.md`. A brief must be **self-contained**: the writer has no memory of
this conversation. Give concrete beats, names only from the bible, the reflective-line budget,
the grammar targets, the vocab count, the length, and the ending's direction.

Fill the **`Supplied details`** block in every brief: the details this entry **uses** (and how),
and the details that are **canon but not for this entry** (so the writer doesn't contradict them
or spend them early). If the entry deliberately has Felix misreport a supplied detail about his
own wants/plans/feelings, write `narrator device: …` there, naming the detail and what he writes
instead.

## 3. Delegate — a pipeline, writers in sequence
The **writers run one at a time, in story order**: writer N+1 starts only after entry N has
been written, **reviewed, and accepted**, so it reads the finished file as canon (voice, open
threads, the last line's direction). Never run two writers at once, even if the briefs look
independent.

Only the **simplifier** runs in the background. The review is not backgrounded: if it finds a
structural problem, entry N changes, and a writer N+1 already running would have built on a
stale version. So, for each brief in order:

1. `Agent(subagent_type: "entry-writer", prompt: brief N)` — **wait** for it.
2. Review entry N (§4): `continuity-reviewer` and/or your own read against the bible — **wait**,
   apply fixes, send the writer back if needed, until the entry is accepted. Pass the reviewer the
   brief's `Supplied details` block verbatim in its prompt, so it checks them too.
3. `Agent(subagent_type: "simplifier", prompt: "Add the `simple` block to notes/N-slug.js …")`
   — **don't wait**; it only edits its own file and needs the French to be final, which it now is.
4. Go to step 1 with brief N+1 while the simplifier for N works.

Collect the simplifier results as their notifications arrive (they may land while a later writer
is still working). The batch is done when the last writer has returned, every entry is accepted,
and every simplifier has reported `ALL DATA CHECKS PASS`.

## 4. Review
For each returned file: run `continuity-reviewer` on it (or review yourself against the bible).
Fix small things directly (a wrong form, an escaping slip). Send the writer back for anything
structural (a bible conflict, wrong level, an invented fact). Never let a new fact into an
entry without adding it to the bible on purpose. The review of entry N (including the
`continuity-reviewer` run, if used) finishes **before** writer N+1 starts, because N+1 reads N's
file as canon; and it finishes before N's simplifier starts, because the block must match the
final French.

## 4b. Simplify
The `simplifier` subagent (`subagent_type: "simplifier"`, prompt = the file path) writes the
entry's `simple` block (the Simplifier layer). It is launched per entry from step 3 above, in the
background, right after that entry is accepted. If a simplifier is sent back (the validator
reports `SIMPLE ¶n` mismatches), re-run it with the validator's message; if you edited an entry's
French **after** its simplifier ran, run the simplifier again on that file (its block must match
the final sentence split).

## 5. Register and ship
1. Append one line per entry to `notes/manifest.js` (chronological, newest last).
2. Append the entries to the **entry log** in `CLAUDE.md` §3 and rewrite **open threads**.
3. Add the rows to the README table.
4. Update **`seeds.md`**: move each detail this batch used to its *Used* table (with the entry
   number and a few words on how); add every new detail that wasn't used to *Waiting* (with the
   date supplied); leave banked-and-still-unused details where they are; retired ones go to
   *Retired* with the reason. Tell the user, in one line, which details were used where and
   which are banked.
5. `node tools/validate.mjs` must print `ALL DATA CHECKS PASS`.
6. Commit (one commit for the batch, listing the entries) and push.
