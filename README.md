[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Laika-lgtm/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Laika-lgtm/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# GTA VI Trophy Guide & Tracker — All 55 Trophies

A complete, honest trophy guide for **Grand Theft Auto VI** (PlayStation 5) plus an offline progress tracker. Built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden, 0 online.
- **A numbered, cited method for every trophy** — 148 steps in total, and every step names its source.
- **A 3-stage roadmap to the platinum** (~200 hours, difficulty 4/10) with the full 100% checklist behind **A Long Road**.
- **A source matrix** of 10 sources with honest coverage, plus **6 disagreements** between sources, each with our take.
- **An audit view** that checks the guide against its own data (trophy counts, sourced steps, missable count, unconfirmed count).
- **An offline tracker** — localStorage progress, kind + grade filters, search, hide-earned, spoiler mode, JSON export/import, reset.

## Honest limits

- **Exactly 1 trophy is missable:** *Positive Mental Attitude* — the Chapter 1 balcony meditation at Jason's house is lost permanently after Chapter 1 ends.
- **Exactly 1 method is unconfirmed:** *Bad Luck, I Guess* — no published guide has verified how it unlocks. The guide says so instead of inventing a method.
- **Difficulty 4/10** (PowerPyx, KeenGamer), ~200 hours to platinum (PowerPyx and KeenGamer say ~200h; Push Square says 250–300h+ — see the Disagreements section).
- **Sources read 20 Nov 2026.**

## Sources

| Source | Role |
| --- | --- |
| [PowerPyx](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) | Primary method source — full 55/55 guide + roadmap, read in full |
| [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-ps5/trophies/) | Official trophy list (names, descriptions, grades) |
| [PSNProfiles](https://psnprofiles.com/trophies/grand-theft-auto-vi) | Official trophy list + PSN counts and rarity |
| [KeenGamer](https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/) | Cross-check — full list + roadmap + 100% checklist; 4 trophies marked unconfirmed |
| [Push Square](https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap) | Cross-check — full list; guide still in progress |
| [GamesFuze](https://gamesfuze.com/gta-6-wiki/achievements/) | Cross-check — full list + roadmap |
| [GTASpotter](https://gtaspotter.com/en/guides/gta-6-trophies-and-achievements/) | Cross-check — full list |
| [Insider Gaming](https://insider-gaming.com/complete-gta-6-trophy-list-how-to-get-all-trophies-achievements/) | Cross-check — full list |
| [EGamers](https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/) | Cross-check — full list + 100% guide |
| [CryptoGames](https://cryptogames.gg/gta-6-trophies-achievements-full-list/) | Cross-check — full list + 100% checklist |

All 55 trophy names, descriptions and grades match the official list exactly.

## Verification (20 Nov 2026)

Checked before this commit:

- **Kit check:** `node cli/makefun.mjs check --repo . --worktree` — 4 passed, 0 failed, 17 skipped, 5 checked at submission.
- **Official list:** all 55 trophy names, descriptions and grades match the kit starter exactly (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden).
- **Citations:** 148 guide steps, every one naming its source.
- **Spoiler mode:** verified in a headless browser — with spoiler mode on, all 28 hidden, unearned trophies show only "Hidden trophy"; searching for a hidden trophy's name ("paradise", "gone fishing") returns 0 results; earning one reveals it.
- **Determinism:** two `MAKEFUN_OUTPUT_DIR=… node main.ts` runs produce byte-identical output (dossier.json 791,373 bytes, schema `makefun/dossier/v1`).
- **Screenshots:** 4 PNGs, all 1280×800 — 01-cover 126,783 bytes, 02-roadmap 142,979 bytes, 03-sources 117,085 bytes, 04-detail 135,995 bytes (each under the 256 KiB cap).

## Run it

The app is a static site under `app/` — no build step, no server needed:

```sh
# serve it (any static server works)
python3 -m http.server 8000 -d app
# open http://localhost:8000/
```

Or open `app/index.html` directly in a browser (data loads from `app/data/*.json`).

## Spoiler mode

Turn on **Spoiler mode** in the toolbar and every hidden trophy you haven't earned yet shows only "Hidden trophy" — no name, no description — and search can't find it by its hidden text either. Earned trophies are never spoilers.

## Structure

```
app/
  index.html          — page shell, tabs, toolbar
  css/style.css       — light paper theme
  js/app.js           — boot + wiring
  js/data.js          — loads trophies.json + meta.json
  js/store.js         — localStorage progress, export/import, reset
  js/views.js         — rendering, spoiler logic, search
  data/trophies.json  — the 55 trophies, guides and cited steps
  data/meta.json      — roadmap, source matrix, disagreements, audit
main.ts               — make.fun entrypoint (copies app/ + screenshots/, writes the dossier)
screenshots/         — 4 screenshots, 1280×800, first by name is the cover
```

## License

MIT — see [LICENSE](LICENSE). Unofficial fan guide; not affiliated with or endorsed by Rockstar Games or Take-Two Interactive.
