// gta6-trophy-guide-01 entry program (Node 22, standard library only).
// Hands in the guide: copies the static app/ and the screenshots/ this repo
// holds into /output (or MAKEFUN_OUTPUT_DIR outside the grader), then writes
// /output/dossier.json with the kit's vendored buildDossier library, which the
// scorer runs again and compares byte for byte — so vendor/ stays untouched.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoDir = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const MAX_SCREENSHOT_BYTES = 262144;

function fail(message) {
  throw new Error(`gta6-trophy-guide-01: ${message}`);
}

function checkScreenshots() {
  const shotsDir = join(repoDir, "screenshots");
  if (!existsSync(shotsDir)) fail("screenshots/ is missing");
  const shots = readdirSync(shotsDir).filter((name) => !name.startsWith("."));
  if (shots.length < 3 || shots.length > 4) {
    fail(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
  }
  for (const name of shots) {
    const size = statSync(join(shotsDir, name)).size;
    if (size > MAX_SCREENSHOT_BYTES) {
      fail(`screenshot ${name} is ${size} bytes, over the 256 KiB cap`);
    }
  }
  return shots;
}

function copyEntry() {
  mkdirSync(outDir, { recursive: true });
  cpSync(join(repoDir, "app"), join(outDir, "app"), { recursive: true });
  mkdirSync(join(outDir, "screenshots"), { recursive: true });
  cpSync(join(repoDir, "screenshots"), join(outDir, "screenshots"), { recursive: true });
}

function main() {
  const shots = checkScreenshots();
  copyEntry();
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: MAX_SCREENSHOT_BYTES },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  const dossierPath = join(outDir, "dossier.json");
  writeFileSync(dossierPath, dossier);
  const dossierBytes = statSync(dossierPath).size;
  if (dossierBytes > 1572864) fail(`dossier.json is ${dossierBytes} bytes, over the 1.5 MiB cap`);
  console.log(`handed in ${shots.length} screenshots (${shots.join(", ")}), dossier ${dossierBytes} bytes -> ${outDir}`);
}

main();
