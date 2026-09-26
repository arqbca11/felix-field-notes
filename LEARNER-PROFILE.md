# Learner profile — the forgetting curve (TEST MODE)

> **About you, not about the story.** Your French: what you look up, click, mistype and forget, and when
> it's due again. For what a reader of the *story* knows and suspects, see `STORY-READER.md`.
>
> **Observation only.** Built by `tools/learner-profile.mjs` from what the page logged in Learn mode
> (`learning/*.jsonl`) and from `questions.md`. `/new-entries` reads it and **reports what it would
> have done**, but does **not** change any brief because of it yet (CLAUDE.md §8c). Regenerate any time:
> `node tools/learner-profile.mjs`.

**Built:** 2026-09-26 08:37 UTC · **Events:** 0 · **Reading sessions:** 0 · **Questions:** 0 · **Items tracked:** 0

## Due for repetition
Recall estimated below 50 %: the items the next entries would bring back, most urgent first.

_Nothing yet._

## Fading soon
Recall between 50 and 80 %: worth a touch in the next week.

_Nothing yet._

## Solid
Met again cleanly at least twice, half-life of two weeks or more: no need to repeat on purpose.

_Nothing yet._

## Hardest sentences
Played again in Lire or opened in Simplifier the most: a sign the sentence's structure, not one word, is the hurdle.

_Nothing yet._

## Dictation: most-missed words

_Nothing yet._

## Questions asked (latest 20)
Raw, for the planner to group by topic (a tense, a construction, a sound): repeated topics count as lapses too.

_None yet._

## How this is computed
A **struggle** is a hard spot clicked in Lire, a word looked up, a word missed in a dictation, or a
question about a highlighted expression; the struggles of one reading session make one **lapse**. A
**clean meeting** is an entry that contains the item, on screen for 20 s in Learn mode, in a session
with no struggle on it. Each item has a memory **half-life**: 1 day after the first lapse (half a day
if it was clicked three times or more), **doubled** by a clean meeting at least half a half-life
later, **halved** by a new lapse. **Recall now** ≈ 2^(−days since the last event ÷ half-life).
