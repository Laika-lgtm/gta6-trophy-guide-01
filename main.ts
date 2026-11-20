// LEONIDA Trophy Guide — entry hand-in for gta6-trophy-guide-01 (Node 22, standard library only).
//
// What this program does, in order:
//   1. Finds the app/ folder and the screenshots/ folder sitting next to this file.
//   2. Copies both into the output directory (MAKEFUN_OUTPUT_DIR, or /output inside the grader).
//   3. Writes /output/dossier.json with the make.fun library — the summary the judge reads:
//      the screenshots, the first load's files and bytes, and the app's source.
// The app itself is plain static files: app/index.html, ES modules under app/js/, one
// stylesheet, and JSON data under app/data/. It loads nothing over the network at runtime.
//
// The scorer's caps, from the competition's gate: the dossier text may be at most 163840 bytes;
// at most 4 screenshots, each at most 262144 bytes; app/ may hold at most 993 files and
// directories and at most 50331648 bytes. Those caps are passed straight through below, so
// this program refuses an entry the scorer would refuse.
//
// vendor/makefun-frontend.ts is the kit's library, copied unchanged. The scorer requires
// dossier.json to be byte-for-byte what its own copy of the library writes, so this file
// never re-implements any of that logic — it only calls buildDossier.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The folder this file lives in; the app and screenshots live beside it.
function repoRoot() {
  return fileURLToPath(new URL('.', import.meta.url));
}

// Where the finished entry goes. Outside the grader's container the environment
// variable stands in for /output:
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
