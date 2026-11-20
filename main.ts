// GTA VI trophy guide + tracker — the entrypoint the make.fun grader runs.
// It is a plain Node script (standard library only, no build step): it copies
// the static app and its screenshots into the output folder, then writes
// dossier.json — the summary the judge reads — with the vendored make.fun
// library. The dossier is computed from the files themselves, so the scorer's
// own copy of buildDossier must produce byte-identical output from the same
// input; that is why the dossier is generated here, never hand-written.
//
// Run it outside the grader's container with MAKEFUN_OUTPUT_DIR set:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Without it, the output folder defaults to /output, the grader's path.)

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// The caps come from the competition's gate: only text_max_bytes shapes the
// dossier's bytes; the rest refuse an entry the scorer would refuse — more
// than 4 screenshots or one over 256 KiB, more than 993 files and
// directories in app/, or more than 48 MiB of app files.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
};

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outDir, { recursive: true });

// The app is static files a browser opens at app/index.html — copy it whole.
cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });

// Screenshots: 1280x800 captures of the running app, the first by name the
// cover. The folder may not exist yet on a fresh checkout; the dossier
// refuses an entry with no screenshots, so a missing folder fails loudly.
mkdirSync(join(outDir, "screenshots"), { recursive: true });
if (existsSync(join(repoRoot, "screenshots"))) {
  cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), {
    recursive: true,
  });
}

writeFileSync(join(outDir, "dossier.json"), buildDossier(outDir, DOSSIER_CAPS));
