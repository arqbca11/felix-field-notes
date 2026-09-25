/* Local API keys for Felix · Notes de terrain.
   Copy this file to secrets.js (same folder) and fill in what you use. secrets.js is in
   .gitignore: it never goes to GitHub, so the published site falls back to the key fields
   on the page. Keys here take priority over keys pasted into the page. Leave a value ''
   to use the page's own field for that service. */
window.FELIX_SECRETS = {
  claudeKey:     '',   // Anthropic API key (sk-ant-…) — console.anthropic.com, set a spending limit
  elevenlabsKey: '',   // ElevenLabs API key — voices for read-aloud
  githubToken:   '',   // GitHub fine-grained token, this repo only, Contents read/write (for saving questions — not used yet)
};
