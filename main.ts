// Entry program for gta6-trophy-guide-01 (Node 22, standard library only).
//
// It hands the guide in: the static app in app/ and the screenshots in
// screenshots/ are copied into the output directory, and dossier.json is
// written there with the vendored make.fun library, which is the summary the
// judge reads. The output directory is /output in the grader; outside it,
// MAKEFUN_OUTPUT_DIR stands in for it:
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Nothing here is read over the network and nothing is generated: the files
// are copied byte for byte, so running it twice produces the same output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
