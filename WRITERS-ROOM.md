# The writers' room — how this notebook is written

*Notes on the pattern, not the plot. The plot lives in `CLAUDE.md`. This file says how a serial
piece of fiction gets written by a room of agents and one reader-author, and what turned out to be
different from writing code the same way.*

Written 21 Sep 2026, after the session that added the spine (§2d of the bible).

---

## 1. It's a writers' room, not a pipeline

The system that produces the entries maps onto a TV writers' room almost role for role:

| Room | Here | What it owns |
|---|---|---|
| Series bible | `CLAUDE.md` §2 (character, timeline, people, pathway) | What is **true**. Every writer reads it cold. |
| Showrunner | The main session | Arcs, briefs, **author knowledge**, decisions about new facts, the engine. |
| Episode writer | `entry-writer` agent (Opus) | One entry from one brief. No memory of anything else. |
| Script supervisor | `continuity-reviewer` agent | Facts vs bible, voice, level, French, restraint budgets. |
| Subtitler | `simplifier` agent | The A1/A2 layer, after the French is final. |
| The whiteboard | `seeds.md` | Ideas that haven't found their episode. |
| The reader's memory | `READER.md` | What a reader currently knows, suspects, and hasn't been told. |
| The reader | The user | The only one who decides what is *true*. |

A code pipeline assumes its modules are independent. A room assumes the opposite: **each episode
creates canon for the next one.** That single difference explains most of the design below.

## 2. Rules the room runs on

**The bible is the only shared memory.** Writers have no conversation history. Anything that must
survive from one entry to the next has to be written down — in the bible, in the entry log, in the
open threads, in the previous entry's text. This is a constraint, and it's the useful kind: a serial
stays consistent across months only if the story lives in documents, not in anyone's head.

**Briefs are the whole interface.** A brief (`tools/brief-template.md`) fixes date, kind, level,
beats, people, the reflective-line budget, grammar targets, the ending's direction, the supplied
details. The writer plans nothing. If a brief conflicts with the bible, the writer stops and reports;
it never chooses.

**Writers run in sequence, never in parallel.** Writer N+1 starts only after entry N is written,
reviewed and accepted, because it reads N as canon — voice, last line, what was just spent. Only the
simplifier runs in the background, and only after the French is final. (This was a bug once: the
review had been backgrounded and a writer built on a stale entry.)

**New facts go through the showrunner, on purpose.** A writer may not invent a person, a date, a
message. If an entry asserts something the bible doesn't contain, the reviewer flags it and the
showrunner decides: into the bible, or out of the entry. The reader's own additions (a
conversation, a motive) go into the bible *before* any brief is written, since the writer sees
nothing else.

**Details supplied by the reader are canon whether used or not.** `/new-entries N details…`:
each detail is used where it belongs or banked in `seeds.md`; it is never dropped silently and never
contradicted.

**Restraint is a budget, and budgets are enforced by review.** One or two reflective lines per entry,
*earned by a concrete scene*. Addie in at most one entry in five. No "she'd have loved this" as a
reflex. No motto-ending, no bucket-list line. These are constraints on the **quality of restraint**;
`validate.mjs` can't check them, a reader can.

## 3. Where literature differs from code — and the design has to differ

1. **The spec is allowed to lie.** In code the spec is the truth and the output must match it. Here
   there is a deliberate channel — the brief's `narrator device` line — for the output to contradict
   the spec, because the narrator is unreliable about *himself*. A code reviewer that let this through
   would be broken; a literary reviewer that flagged it would be. So the reviewer has to know *which
   kind* of mismatch it is looking at: facts of the world are never bent; Felix's account of his own
   wants, plans and feelings may be.

2. **Some facts are hidden from the character but not from the writer.** The bible carries
   **author knowledge** (the long arc back to Canada, the fear of attachment underneath the reasonable
   reasons, "pour de bon" is meant to age) marked *NOT character knowledge*. The writer must know it,
   to avoid foreclosing it, and must not let Felix know it. That's a two-level knowledge model, encoded
   in plain text. Nothing in a code pipeline is hidden from a subagent on purpose.

3. **Validation is mostly not mechanical.** `validate.mjs` checks shapes: paragraph counts, six
   persons per tense, escaping. Whether a reflective line is earned, whether a reason "sounds slightly
   too reasonable", whether the French sits at B1+ — only a reader can judge. Review is the test suite.

4. **The reader is in the loop as an author.** The session that changed the story most (the
   last-day conversation, the spine) produced no entry at all. The work was deciding what is true.
   No agent should do that; the system routes it to the reader by design.

5. **Dramatic irony needs bookkeeping.** Irony is the gap between what the reader has seen and what
   the character has admitted. Someone has to track that gap or it drifts. That is what `READER.md`
   is for: a running account of what a reader who has read *only the entries* knows, suspects, and
   is waiting for — rebuilt by an agent with no access to the bible, so it can't cheat.

## 4. The layers (as of entry 14)

1. **Surface** — a training log: ice, the list, Bertrand's corrections, the shop.
2. **What he says about why** — roots, passport, ENSA. All true. Slightly too true.
3. **What Addie saw** — *"You're just…"* — a man building an exit. The sentence nobody finished.
4. **What the year does to him** — he misses the quiet. Not loudly; in what he notices.
5. **What the reader knows** — *« pour de bon »* is going to age; attachment is the subject.

The notebook is the record of someone not quite telling himself the truth, in a language he chose
on purpose to keep his head in France. Even the French is part of the self-persuasion.

## 5. Things the room learned the hard way

- A formula announces itself by the third use ("a new dream every week"; "she'd have loved this").
- One character's memory (the grandfather) is a flavour, not a crutch — carried by someone living
  (Bertrand) it stays alive; used as a reflex it dies.
- Compressed canon is fine. Entries 5 and 14 give the last-day conversation in one line
  (*« elle n'a rien demandé de plus »*); the full exchange was decided later and doesn't contradict
  it. Write the short true version first; you can always open it up.
- The writer must not be able to see the whole plan. A brief that explains the arc produces
  foreshadowing that reads as foreshadowing.
- Sequence beats parallelism. Speed is cheap; continuity is not.

## 6. The reader's memory — how to use it

`READER.md` is rebuilt from the entries alone (no bible, no briefs) by a fresh agent — see
`tools/reader.sh`. It records, entry by entry, what a reader now believes, what they suspect, what
questions are open, and what the writer seems to be avoiding. Before planning a batch, read it: if
the reader already suspects what you're about to reveal, you're late; if they have no idea, you're
early. It is also the honest test of the spine — the fear of attachment should be visible to a
reader before Felix admits it, and `READER.md` says whether it is.
