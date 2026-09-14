'use strict';

/**
 * Bundle budget: the 874-card deck must ship only on the play route.
 *
 * The deck (`PROMPTS` in `src/lib/prompts.ts`) is ~104 KB and is the paid
 * product; the home/setup route must not download it (audit finding 1.4). The
 * split that keeps it off `/` is fragile in one specific way: importing a value
 * — `GAME_MODES`, `NHIE_PATTERN` — from `@/lib/prompts` instead of `@/lib/modes`
 * pulls the whole module, and thus the deck, into whatever chunk the importer
 * lands in. On the home path that is a chunk `/` loads, and nothing else would
 * flag it.
 *
 * So this reads Next's build manifest, takes the chunks the home route ('/page')
 * loads, and counts a deck-only signature in them. Every card carries
 * `nsfwLevel`, so the deck chunk shows ~880 references and a deck-free home
 * shows a handful (session/roster code). A generous threshold separates the two
 * and turns a re-leak into a failed build instead of a silent regression.
 *
 * Run after `npm run build`.
 */

const fs = require('node:fs');
const path = require('node:path');

const NEXT = path.join(__dirname, '..', '.next');
const MANIFEST = path.join(NEXT, 'app-build-manifest.json');

// Home is deck-free today at 12 references; the deck route sits near 890. A
// re-leak would move hundreds of references onto the home route at once, so a
// ceiling of 100 flags that without tripping on ordinary growth.
const DECK_SIGNATURE = /nsfwLevel/g;
const MAX_HOME_DECK_REFS = 100;

function fail(message) {
  console.error(`check-bundle: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(MANIFEST)) {
  fail('no build manifest found — run `npm run build` first.');
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const homeFiles = (manifest.pages && manifest.pages['/page']) || [];
if (homeFiles.length === 0) {
  fail('the home route has no chunks in the manifest — did the build change?');
}

let refs = 0;
let checked = 0;
for (const file of homeFiles) {
  if (!file.endsWith('.js')) continue;
  const full = path.join(NEXT, file);
  if (!fs.existsSync(full)) continue;
  refs += (fs.readFileSync(full, 'utf8').match(DECK_SIGNATURE) || []).length;
  checked += 1;
}

if (refs > MAX_HOME_DECK_REFS) {
  fail(
    `the deck appears to ship on the home route (${refs} deck references across its chunks, ceiling ${MAX_HOME_DECK_REFS}).\n` +
      '  Import GAME_MODES / GameMode / NHIE_PATTERN from "@/lib/modes", not "@/lib/prompts",\n' +
      '  which pulls the whole 874-card deck. See tools/check-bundle.js.',
  );
}

console.log(`check-bundle: home route is deck-free (${refs} deck references across ${checked} chunks, ceiling ${MAX_HOME_DECK_REFS}).`);
