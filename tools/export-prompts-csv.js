#!/usr/bin/env node
/**
 * Exports docs/prompts.csv — the whole deck as a spreadsheet, which is a far
 * better surface for reviewing 800+ prompts than the TypeScript literal is.
 *
 * src/lib/prompts.ts stays the single source of truth; this is a generated
 * view of it, and CI fails if the two drift.
 *
 * Run it after editing prompts.ts:  npm run export:deck
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const promptsPath = path.join(root, 'src', 'lib', 'prompts.ts');
const csvPath = path.join(root, 'docs', 'prompts.csv');

const source = fs.readFileSync(promptsPath, 'utf8');
const declaration = source.indexOf('export const PROMPTS');
if (declaration === -1) {
  throw new Error('Could not find the PROMPTS export in ' + promptsPath);
}

const arrayLiteral = source.slice(source.indexOf('[', declaration), source.lastIndexOf('];') + 1);
// The literal is plain data (no types inside), so it evaluates as JS as-is.
const prompts = eval(arrayLiteral);

const csvEscape = (value) => '"' + String(value).replace(/"/g, '""') + '"';
const csv =
  'id,nsfwLevel,scope,text\n' +
  prompts.map((p) => [p.id, p.nsfwLevel, p.scope ?? 'player', csvEscape(p.text)].join(',')).join('\n') +
  '\n';
fs.writeFileSync(csvPath, csv);

const byLevel = prompts.reduce((acc, p) => {
  acc[p.nsfwLevel] = (acc[p.nsfwLevel] || 0) + 1;
  return acc;
}, {});
console.log(
  'Wrote ' + path.relative(root, csvPath) + ' with ' + prompts.length + ' prompts ' +
  '(' + Object.entries(byLevel).map(([k, v]) => k + ': ' + v).join(', ') + ')'
);
