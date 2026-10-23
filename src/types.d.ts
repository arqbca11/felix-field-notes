/* Shared types: the entry schema (CLAUDE.md §6) and the globals the page's plain <script>s share.
   Used by the page engine (src/), the tools (tools/*.ts, which import the types from here), and the
   type-check of the entry files themselves (tsconfig.notes.json checks notes/*.js against Entry). */

type Kind = 'note' | 'entry' | 'report' | 'portrait' | 'memory' | 'plan';
type Level = 'B1' | 'B1+' | 'B2';
type MarkKind = 'mot' | 'liaison' | 'enchainement' | 'muet' | 'son';

/** Six persons, pronoun and auxiliary baked in ("j'ai skié"). */
type Persons = [string, string, string, string, string, string] | string[];
/** What FelixNotes.verb() builds: the infinitive and four [tense name, persons] pairs. */
interface Conj { inf: string; conj: [string, Persons][] }
/** A vocab row: [french, english] or [french, english, conjugation]. */
type VocabRow = [string, string] | [string, string, Conj];

interface GramNote { h: string; p: string }
/** Simplifier: an A1/A2 rewrite of one sentence and its gloss. */
interface SimpleSentence { fr: string; en: string }
/** Lire: a hard spot inside one sentence. */
interface Mark { t: string; k: MarkKind; n: string; say?: string }
/** Écrire: a question answered in 1–2 sentences. */
interface WriteQ { q: string; en: string; try?: string }

interface Entry {
  id: string;
  no: number;
  date: string;              // ISO yyyy-mm-dd
  kind: Kind;
  level: Level;
  title?: string;
  titleEn?: string;
  place?: string;
  lat?: number;
  lng?: number;
  fr: string[];
  en: string[];
  write?: WriteQ[];
  simple?: SimpleSentence[][];   // per paragraph, per sentence
  read?: Mark[][][];             // per paragraph, per sentence, marks
  vocab?: VocabRow[];
  gram?: GramNote[];
}

interface ManifestEntry { id: string; file: string; date: string }

interface FelixNotesApi {
  register(entry: Entry): void;
  verb(inf: string, present: Persons, passeCompose: Persons, imparfait: Persons, futur: Persons): Conj;
}

interface FelixSecrets { claudeKey?: string; elevenlabsKey?: string; githubToken?: string }

interface Window {
  FelixNotes: FelixNotesApi;
  NOTES_MANIFEST: ManifestEntry[];
  FELIX_SECRETS?: FelixSecrets;
  FELIX_LEARNER_SUMMARY?: string;
  splitSentences(text: string): string[];
}
declare var FelixNotes: FelixNotesApi;
declare function splitSentences(text: string): string[];
