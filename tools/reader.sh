#!/usr/bin/env bash
# Rebuild STORY-READER.md — "the reader's memory" — from the entries alone.
# A fresh `claude -p` run from a scratch directory (no CLAUDE.md, no bible, no briefs) reads
# only the French + English text of every entry and writes what a reader knows after each one.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)
WORK=$(mktemp -d)
node -e '
const fs=require("fs"),vm=require("vm");
const P=[],sb={window:{},console,FelixNotes:{register:p=>P.push(p),verb:()=>({})}};sb.window.FelixNotes=sb.FelixNotes;
vm.createContext(sb);vm.runInContext(fs.readFileSync("notes/manifest.js","utf8"),sb);
sb.window.NOTES_MANIFEST.forEach(e=>vm.runInContext(fs.readFileSync(e.file,"utf8"),sb));
P.sort((a,b)=>a.no-b.no);
let out="";
for(const p of P){
  out+=`\n\n==================== ENTRY ${p.no} — ${p.date}${p.title?" — "+p.title:""} ====================\n\n`;
  out+=p.fr.join("\n\n");
  out+=`\n\n--- English translation ---\n\n`+p.en.join("\n\n");
}
fs.writeFileSync(process.argv[1],out.trim()+"\n");
' "$WORK/entries.txt"
cp "$ROOT/tools/reader-prompt.md" "$WORK/prompt.md"
cd "$WORK"
claude -p --model "${READER_MODEL:-opus}" "$(cat prompt.md)" < entries.txt > out.md
# Keep the title line first, then the note that tells this file apart from LEARNER-PROFILE.md.
{ head -n 1 out.md; echo; cat "$ROOT/tools/story-reader-note.md"; tail -n +2 out.md; } > "$ROOT/STORY-READER.md"
echo "STORY-READER.md rebuilt from $(grep -c '^==================== ENTRY' entries.txt) entries."
rm -rf "$WORK"
