# Learner profile — the forgetting curve (TEST MODE)

> **About you, not about the story.** Your French: what you look up, click, mistype and forget, and when
> it's due again. For what a reader of the *story* knows and suspects, see `STORY-READER.md`.
>
> **Observation only.** Built by `tools/learner-profile.mjs` from what the page logged in Learn mode
> (`learning/*.jsonl`) and from `questions.md`. `/new-entries` reads it and **reports what it would
> have done**, but does **not** change any brief because of it yet (CLAUDE.md §8c). Regenerate any time:
> `node tools/learner-profile.mjs`.

**Built:** 2026-09-29 21:42 UTC · **Events:** 133 (view 25, sent 38, ask 28, hard 17, lookup 25) · **Reading sessions:** 21 · **From** 2026-09-26 **to** 2026-09-29 · **Questions:** 26 · **Items tracked:** 41

## Due for repetition
Recall estimated below 50 %: the items the next entries would bring back, most urgent first.

_Nothing yet._

## Fading soon
Recall between 50 and 80 %: worth a touch in the next week.

| Item | Type | Lapses (struggles) | Clean meetings | Last | Half-life | Recall now |
|---|---|---|---|---|---|---|
| étais | mot | 2 (2) | 0 | 2026-09-29 | 12 h | 57 % |
| écrit | mot | 1 (1) | 0 | 2026-09-29 | 1.0 j | 66 % |
| répondu | prononciation · son | 1 (1) | 2 | 2026-09-28 | 4.0 j | 75 % |

## Solid
Met again cleanly at least twice, half-life of two weeks or more: no need to repeat on purpose.

_Nothing yet._

## Hardest sentences
Played again in Lire or opened in Simplifier the most: a sign the sentence's structure, not one word, is the hurdle.

- #4 (bertrand) — Lire ×3, Simplifier ×0, 3 session(s): « Ce sont des hommes dont la modestie n'est pas une politesse : c'est une méthode. »
- #6 (crochues) — Lire ×3, Simplifier ×0, 3 session(s): « Il s'arrêtait au mauvais moment pour prendre des photos, il posait des questions idiotes sur l'altitude, il s'asseyait sur les vires pour souffler, et une fois, sur le premier gendarme, il a fait semblant d'avoir peur du vide. »
- #4 (bertrand) — Lire ×2, Simplifier ×0, 2 session(s): « On passe, si la montagne veut bien, et on redescend. »
- #4 (bertrand) — Lire ×2, Simplifier ×0, 2 session(s): « Mon grand-père disait la même chose, avec d'autres mots. »
- #6 (crochues) — Lire ×2, Simplifier ×0, 2 session(s): « Mais je ne l'avais jamais grimpée en tenant quelqu'un au bout d'une corde courte, en choisissant chaque relais pour lui et non pour moi, en me retournant tous les trois mètres. »
- #4 (bertrand) — Lire ×2, Simplifier ×0, 1 session(s): « En partant, il m'a serré la main et il a regardé le ciel. »
- #4 (bertrand) — Lire ×1, Simplifier ×0, 1 session(s): « Ensuite il a lu. »
- #4 (bertrand) — Lire ×1, Simplifier ×0, 1 session(s): « J'ai appris ça au Canada, avec Eric : quand un homme lit ta liste, tu ne commentes pas ta liste. »
- #4 (bertrand) — Lire ×1, Simplifier ×0, 1 session(s): « Au bout de dix minutes, il a replié la feuille en quatre et il a dit : « Le rocher, ça va. »
- #4 (bertrand) — Lire ×1, Simplifier ×0, 1 session(s): « Ce n'était pas une question, alors je n'ai pas répondu. »
- #4 (bertrand) — Lire ×1, Simplifier ×0, 1 session(s): « Il a continué : il faut que je fasse des goulottes cet hiver, du mixte, deux ou trois courses sérieuses en glace avant que le probatoire arrive, et quelques descentes que je n'aurais pas choisies moi-même. »
- #4 (bertrand) — Lire ×1, Simplifier ×0, 1 session(s): « Entre les deux, il a dit « on verra », et chez lui, c'est une phrase complète. »

## Dictation: most-missed words

_Nothing yet._

## Questions asked (latest 20)
Raw, for the planner to group by topic (a tense, a construction, a sound): repeated topics count as lapses too.

- 2026-09-29 · #6 · « déjà par terre » — And what about 'déjà par terre'
- 2026-09-29 · #6 · « deuxième gendarme » — Explain 'deuxième gendarme' to me
- 2026-09-29 · #5 · « aimait » — explain celle pour laquelle
- 2026-09-29 · #5 · « moitié » — je ne comprenais qu'à moitié: explain the qu'à here
- 2026-09-29 · #5 · « appris » — l'a appris: is l here 'it', and a 'avoir'?
- 2026-09-29 · #5 · « appris » — explain 'qui me l'a appris'
- 2026-09-29 · #5 · « étais » — compare j'étais monté and je suis monté
- 2026-09-29 · #5 · « nette » — explain d'un coupt
- 2026-09-29 · #5 · « nette » — ...que je connais par cœur. Is ..que..par a sentence structure?
- 2026-09-29 · #5 · « c't'hiver » — is c't'hiver unique to Quebec? Because winter is a big thing there?
- 2026-09-29 · #5 — why is it a in stead of à in m'a envoyé
- 2026-09-29 · #5 — explain m'a envoyé here
- 2026-09-27 · #4 — Explain the structure of the sentence, 'Ce sont... dont la.. n'est pas une..'
- 2026-09-27 · #4 — what does 'une arête aux' here mean
- 2026-09-27 · #4 — What is 'Ce sont... dont la... n'est pas...' sentence structure here?
- 2026-09-27 · #4 — what does si mean here
- 2026-09-27 · #4 — what does si mean here
- 2026-09-27 · #4 — my example is mot était mauvais. why is there no liaison on mot était
- 2026-09-27 · #4 — No liaison from a singular noun: is this an universal rule?
- 2026-09-27 · #4 — why is conquérir used here

## How this is computed
A **struggle** is a hard spot clicked in Lire, a word looked up, a word missed in a dictation, or a
question about a highlighted expression; the struggles of one reading session make one **lapse**. A
**clean meeting** is an entry that contains the item, on screen for 20 s in Learn mode, in a session
with no struggle on it. Each item has a memory **half-life**: 1 day after the first lapse (half a day
if it was clicked three times or more), **doubled** by a clean meeting at least half a half-life
later, **halved** by a new lapse. **Recall now** ≈ 2^(−days since the last event ÷ half-life).
