#!/usr/bin/env node
// Rebuilds index.html from index.template.html + landing-text.txt.
// Usage (inside /workspace/so-plus-landing):  node apply-text.js
// Optional: node apply-text.js <text-file> <template> <output>
'use strict';
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const [textFile, tplFile, outFile] = [
  process.argv[2] || path.join(dir, 'landing-text.txt'),
  process.argv[3] || path.join(dir, 'index.template.html'),
  process.argv[4] || path.join(dir, 'index.html'),
];

// 1. Read the text file (strip a BOM if an editor added one; accept Windows line endings).
const raw = fs.readFileSync(textFile, 'utf8').replace(/^\uFEFF/, '');
const values = {};
const problems = [];
raw.split(/\r?\n/).forEach((line, i) => {
  const t = line.trim();
  if (!t || t.startsWith('#') || t.startsWith('===')) return;
  const m = /^([A-Za-z0-9_.]+)\s*:\s?(.*)$/.exec(t);
  if (!m) { problems.push(`line ${i + 1}: not "key: text" -> ${t.slice(0, 60)}`); return; }
  if (m[1] in values) problems.push(`line ${i + 1}: key "${m[1]}" appears twice (last one wins)`);
  values[m[1]] = m[2].trim();
});

// 2. Fill the template.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const render = (key, s) => {
  if (key.startsWith('meta.')) return esc(s.replace(/\*/g, ''));     // title / description: plain text only
  return esc(s).replace(/\*([^*]+)\*/g, '<b>$1</b>');                 // *text* -> bold
};
const tpl = fs.readFileSync(tplFile, 'utf8');
const used = new Set();
const missing = [];
const html = tpl.replace(/\{\{([A-Za-z0-9_.]+)\}\}/g, (all, key) => {
  used.add(key);
  if (!(key in values)) { missing.push(key); return all; }
  return render(key, values[key]);
});
Object.keys(values).filter((k) => !used.has(k))
  .forEach((k) => problems.push(`unknown key "${k}" (not used on the page; was it renamed?)`));

problems.forEach((p) => console.warn('WARNING: ' + p));
if (missing.length) {
  console.error('ERROR: these keys are missing from ' + path.basename(textFile) + ':\n  ' + missing.join('\n  '));
  console.error(path.basename(outFile) + ' was NOT changed.');
  process.exit(1);
}
fs.writeFileSync(outFile, html, 'utf8');
console.log(`OK: wrote ${outFile} (${used.size} keys filled)`);
