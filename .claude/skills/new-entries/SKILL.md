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

## 3. Delegate
For each brief, call the Agent tool with `subagent_type: "entry-writer"` and the brief as the
prompt. Entries that do not reference each other may run **in parallel**; entries that build
on one another run in order so the later writer can read the earlier file.

## 4. Review
For each returned file: run `continuity-reviewer` on it (or review yourself against the bible).
Fix small things directly (a wrong form, an escaping slip). Send the writer back for anything
structural (a bible conflict, wrong level, an invented fact). Never let a new fact into an
entry without adding it to the bible on purpose.

## 4b. Simplify
For each accepted file, run the `simplifier` subagent on it (`subagent_type: "simplifier"`, prompt
= the file path) so the entry ships with its `simple` block (the Simplifier layer). Files that do
not depend on each other can run in parallel. The validator checks the block; if it reports
`SIMPLE ¶n` mismatches, send the simplifier back with the message.

## 5. Register and ship
1. Append one line per entry to `notes/manifest.js` (chronological, newest last).
2. Append the entries to the **entry log** in `CLAUDE.md` §3 and rewrite **open threads**.
3. Add the rows to the README table.
4. `node tools/validate.mjs` must print `ALL DATA CHECKS PASS`.
5. Commit (one commit for the batch, listing the entries) and push.
