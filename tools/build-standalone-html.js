#!/usr/bin/env node
/**
 * Builds game.html — a single-file, dependency-free version of the game.
 *
 * The prompt deck lives in src/lib/prompts.ts and is the single source of
 * truth. This script reads it, embeds it into tools/standalone-template.html
 * and writes the result to game.html at the repo root.
 *
 * Run it after editing prompts.ts:  npm run build:html
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const promptsPath = path.join(root, 'src', 'lib', 'prompts.ts');
const templatePath = path.join(__dirname, 'standalone-template.html');
const outputPath = path.join(root, 'game.html');

const source = fs.readFileSync(promptsPath, 'utf8');
const declaration = source.indexOf('export const PROMPTS');
if (declaration === -1) {
  throw new Error('Could not find the PROMPTS export in ' + promptsPath);
}

const arrayLiteral = source.slice(source.indexOf('[', declaration), source.lastIndexOf('];') + 1);
// The literal is plain data (no types inside), so it evaluates as JS as-is.
const prompts = eval(arrayLiteral);

const json =
  '[\n' +
  prompts
    .map((p) => '  ' + JSON.stringify({ id: p.id, text: p.text, nsfwLevel: p.nsfwLevel }))
    .join(',\n') +
  '\n]';

const template = fs.readFileSync(templatePath, 'utf8');
if (!template.includes('__PROMPTS_JSON__')) {
  throw new Error('Template is missing the __PROMPTS_JSON__ placeholder.');
}

fs.writeFileSync(outputPath, template.replace('__PROMPTS_JSON__', json));

const byLevel = prompts.reduce((acc, p) => {
  acc[p.nsfwLevel] = (acc[p.nsfwLevel] || 0) + 1;
  return acc;
}, {});
console.log(
  'Wrote ' + path.relative(root, outputPath) + ' with ' + prompts.length + ' prompts ' +
  '(' + Object.entries(byLevel).map(([k, v]) => k + ': ' + v).join(', ') + ')'
);
