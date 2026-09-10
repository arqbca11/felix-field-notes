---
name: new-entries
description: Write the next N Felix Field Notes entries. The main agent plans the arc and writes one brief per entry, delegates each brief to the entry-writer subagent (Opus), reviews the result against the bible, registers it, validates, and commits. Usage: /new-entries 5
---
# /new-entries N — the batch workflow

You are the main agent (the planner, editor, and engineer). The **writing** of each entry is
delegated to the `entry-writer` subagent; the **review** may be delegated to
`continuity-reviewer`. You keep the story, the bible, and the engine.

## 1. Plan the batch
- Read `CLAUDE.md` §3 (entry log + **open threads**) and the last three entries in `notes/`.
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
   apply fixes, send the writer back if needed, until the entry is accepted.
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
4. `node tools/validate.mjs` must print `ALL DATA CHECKS PASS`.
5. Commit (one commit for the batch, listing the entries) and push.
