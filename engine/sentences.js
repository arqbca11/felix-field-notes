/* Shared sentence splitter — loaded by index.html (static <script>) AND by tools/validate.mjs
   and tools/split.mjs (in a vm sandbox), so the page and the checks always agree on where a
   paragraph's sentences begin and end. Plain script, no modules.
   A sentence ends at . ! ? … (optionally followed by a closing quote/bracket, French spacing
   allowed: "descend. »"), then whitespace, then an opener: a capital letter, a digit, an
   opening quote/bracket, or a dash. Semicolons and colons never split. */
(function (root) {
  function splitSentences(text) {
    const out = [];
    const re = /([.!?…]+(?:\s*[»”"’)\]])*)(\s+)(?=[«“"(\[—–A-ZÀ-ÖØ-Þ0-9])/g;
    let start = 0, m;
    while ((m = re.exec(text))) {
      const end = m.index + m[1].length;
      out.push(text.slice(start, end).trim());
      start = end + m[2].length;
    }
    const rest = text.slice(start).trim();
    if (rest) out.push(rest);
    return out;
  }
  root.splitSentences = splitSentences;
})(typeof window !== 'undefined' ? window : globalThis);
