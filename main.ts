// LEONIDA Trophy Guide — hand-in program for gta6-trophy-guide-01.
//
// Runs on plain Node (standard library only) and does three things:
//   1. Locates the app/ and screenshots/ folders next to this file.
//   2. Copies them into the output directory (MAKEFUN_OUTPUT_DIR, or /output
//      when the grader runs it).
//   3. Writes dossier.json there with the kit's make.fun library, which is
//      the summary the judge reads: the screenshots, the first load's files
//      and bytes, and the app's own source.
//
// The guide itself is static files only — app/index.html, ES modules under
// app/js/, one stylesheet, JSON data under app/data/. At runtime it loads
// nothing from the network; it only fetches its own data files.
//
// Scorer caps, taken from the competition gate: dossier text at most 163840
// bytes; at most 4 screenshots, each at most 262144 bytes; app/ at most 993
// files and directories and at most 50331648 bytes. They are passed through
// below, so this program refuses an entry the scorer would refuse.
//
// vendor/makefun-frontend.ts is the kit library, copied unchanged. The scorer
// needs dossier.json to be exactly what its own copy of that library writes,
// so this file never re-implements that logic — it only calls buildDossier.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The directory this file sits in; app/ and screenshots/ sit beside it.
function repoRoot() {
  return fileURLToPath(new URL('.', import.meta.url));
}

// Destination for the finished entry. Outside the grader's container the
// environment variable stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
function outputDir() {
  return process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
}

function copyEntry(root, out) {
  if (!existsSync(join(root, 'app'))) {
    throw new Error(`copyEntry: no app/ folder beside main.ts in ${root}`);
  }
  mkdirSync(out, { recursive: true });
  cpSync(join(root, 'app'), join(out, 'app'), { recursive: true });
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  if (existsSync(join(root, 'screenshots'))) {
    cpSync(join(root, 'screenshots'), join(out, 'screenshots'), { recursive: true });
  }
}

function writeDossier(out) {
  const caps = {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  };
  writeFileSync(join(out, 'dossier.json'), buildDossier(out, caps));
}

function main() {
  const root = repoRoot();
  const out = outputDir();
  copyEntry(root, out);
  writeDossier(out);
}

main();
