#!/usr/bin/env node
/* Print the sentence split of one entry, paragraph by paragraph, exactly as the page will
   see it:   node tools/split.ts notes/01-bath-cuisine.js
   Use it before writing an entry's `simple` block: one {fr,en} per printed sentence. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const file = process.argv[2];
if (!file) { console.error('usage: node tools/split.ts notes/NN-slug.js'); process.exit(2); }
const POSTS: Entry[] = [];
const sb: Record<string, any> = { window: {} as Partial<Window>, console, FelixNotes: { register: (p: Entry) => POSTS.push(p), verb: () => ({}) } };   // the vm sandbox
sb.window.FelixNotes = sb.FelixNotes; sb.globalThis = sb;
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(process.cwd(), 'engine/sentences.js'), 'utf8'), sb);
vm.runInContext(fs.readFileSync(path.join(process.cwd(), file), 'utf8'), sb);
const p = POSTS[0];
if (!p) { console.error('no entry registered in', file); process.exit(1); }
console.log(`${p.id} — ${p.fr.length} paragraph(s)`);
p.fr.forEach((para, i) => {
  const s: string[] = sb.window.splitSentences(para);
  console.log(`\n¶ ${i}  (${s.length} sentence${s.length > 1 ? 's' : ''})`);
  s.forEach((t, j) => console.log(`  ${i}:${j}  ${t}`));
});
