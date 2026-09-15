#!/usr/bin/env node
/**
 * Export the anonymous prompt-feedback counters as a spreadsheet you can sort.
 *
 * The client only ever writes to `promptStats/{cardId}` ({ up, down }); reads
 * are denied to it by `firestore.rules`. So this reads with the Firebase Admin
 * SDK (a service credential, which bypasses the rules), joins each counter to
 * the card text from `src/lib/prompts.ts`, and writes a CSV sorted so the cards
 * most worth revisiting — most-disliked, then most-voted — sit at the top.
 *
 *   npm run export:feedback            # writes ./prompt-feedback.csv
 *   npm run export:feedback out.csv    # or a path you name
 *
 * Admin credentials, one of:
 *   gcloud auth application-default login          (simplest; needs gcloud)
 *   set GOOGLE_APPLICATION_CREDENTIALS=<service-account>.json
 *
 * firebase-admin is intentionally NOT a dependency of the app — it is a heavy,
 * occasional owner tool, so this installs it on demand the way the browser
 * suite installs Playwright.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// --- firebase-admin, loaded on demand --------------------------------------
let admin;
try {
  admin = require('firebase-admin');
} catch {
  console.error(
    'This tool needs the Firebase Admin SDK, which is not installed (by design).\n\n' +
      '  npm i -D firebase-admin\n\n' +
      'Then authenticate once, either:\n' +
      '  gcloud auth application-default login\n' +
      '  # or: set GOOGLE_APPLICATION_CREDENTIALS to a service-account key file\n',
  );
  process.exit(1);
}

// --- project id: from .firebaserc, or the env ------------------------------
function resolveProjectId() {
  try {
    const rc = JSON.parse(fs.readFileSync(path.join(root, '.firebaserc'), 'utf8'));
    if (rc.projects && rc.projects.default) return rc.projects.default;
  } catch {
    /* fall through to the env */
  }
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || null;
}

// --- the deck, for joining a card id to its text ---------------------------
// Loaded the same way tools/export-prompts-csv.js does: the PROMPTS literal is
// plain data, so slicing and evaluating it needs no TypeScript loader.
function loadDeck() {
  const source = fs.readFileSync(path.join(root, 'src', 'lib', 'prompts.ts'), 'utf8');
  const declaration = source.indexOf('export const PROMPTS');
  if (declaration === -1) throw new Error('Could not find the PROMPTS export in prompts.ts');
  const literal = source.slice(source.indexOf('[', declaration), source.lastIndexOf('];') + 1);
  // eslint-disable-next-line no-eval
  const prompts = eval(literal);
  return new Map(prompts.map((p) => [p.id, p]));
}

const csvEscape = (value) => '"' + String(value).replace(/"/g, '""') + '"';

async function main() {
  const projectId = resolveProjectId();
  if (!projectId) {
    console.error('No Firebase project id found in .firebaserc or the environment.');
    process.exit(1);
  }

  if (!admin.apps.length) admin.initializeApp({ projectId });
  const db = admin.firestore();

  const snapshot = await db.collection('promptStats').get();
  if (snapshot.empty) {
    console.log('No votes yet — promptStats is empty.');
    return;
  }

  const deck = loadDeck();
  const rows = snapshot.docs.map((doc) => {
    const id = Number(doc.id);
    const { up = 0, down = 0 } = doc.data();
    const total = up + down;
    const card = deck.get(id);
    return {
      id,
      nsfwLevel: card ? card.nsfwLevel : '(not in deck)',
      up,
      down,
      total,
      // Share of votes that were 👎, the signal to sort on. 0 when no votes.
      downPct: total > 0 ? Math.round((down / total) * 100) : 0,
      text: card ? card.text : '',
    };
  });

  // Most-disliked first; ties broken by how many votes back it up.
  rows.sort((a, b) => b.downPct - a.downPct || b.total - a.total || a.id - b.id);

  const header = 'id,nsfwLevel,up,down,total,downPct,text';
  const body = rows
    .map((r) => [r.id, r.nsfwLevel, r.up, r.down, r.total, r.downPct, csvEscape(r.text)].join(','))
    .join('\n');

  const outArg = process.argv[2] || 'prompt-feedback.csv';
  const outPath = path.isAbsolute(outArg) ? outArg : path.join(process.cwd(), outArg);
  fs.writeFileSync(outPath, header + '\n' + body + '\n');

  const votes = rows.reduce((sum, r) => sum + r.total, 0);
  console.log(`Wrote ${outPath} — ${rows.length} cards rated, ${votes} votes total.`);

  // A quick glance without opening the file: the five most-disliked cards.
  const worst = rows.filter((r) => r.total > 0).slice(0, 5);
  if (worst.length) {
    console.log('\nMost-disliked so far:');
    for (const r of worst) {
      const snippet = r.text.length > 60 ? r.text.slice(0, 57) + '…' : r.text;
      console.log(`  ${r.downPct}% 👎  (${r.down}/${r.total})  #${r.id}  ${snippet}`);
    }
  }
}

main().catch((err) => {
  console.error('\nExport failed:', err.message);
  console.error('Check that Firestore exists in the project and your admin credentials are set.');
  process.exit(1);
});
