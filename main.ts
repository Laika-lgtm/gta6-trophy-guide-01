// LEONIDA Trophy Guide — entry program (Node 22, standard library only).
// It hands the guide in: it copies this repository's app/ folder and
// screenshots/ folder to the output directory and writes dossier.json with
// the vendored make.fun library. The library's copy under vendor/ is the
// kit's own file and is left exactly as it is.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const appDir = join(repoRoot, "app");
const shotsDir = join(repoRoot, "screenshots");

if (!existsSync(appDir)) throw new Error("app/ folder is missing next to main.ts; nothing to hand in.");
if (!existsSync(shotsDir)) throw new Error("screenshots/ folder is missing next to main.ts; the entry needs 3 or 4 screenshots.");

mkdirSync(outputDir, { recursive: true });
cpSync(appDir, join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, "screenshots"), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots of at most 256 KiB each,
// at most 993 files and 48 MiB in app/, and the dossier text capped at
// 160 KiB. Anything past those limits is refused here first, exactly as
// the scorer would refuse it.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossierText);
