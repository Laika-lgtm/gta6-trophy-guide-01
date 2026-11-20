# LEONIDA — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/gta6-trophy-guide-01/Laika-lgtm/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/gta6-trophy-guide-01/Laika-lgtm/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01) on make.fun.

## What it is

- **Every trophy** with its official name, description and grade as PlayStation publishes it (1 platinum, 2 gold, 6 silver, 46 bronze).
- **A guide for each trophy in original words**, with its sources cited beside it — what to do, where, how, and when it can be missed. Sources: PowerPyx, Push Square, KeenGamer, GTASpotter; the list itself via Exophase and PSNProfiles.
- **A roadmap to the platinum** (~200 hours, 3 stages) built from the official descriptions, and the **one missable trophy flagged** (Positive Mental Attitude — the Chapter 1 meditation).
- **A tracker**: checklist saved in localStorage, export to a file and import back, filters by kind (story, missable, collectibles, activities, crime, money, platinum) and grade, search, hide-earned, and a spoiler setting that hides story trophies until earned.
- **Fully offline**: static files under `app/`, no build step, no network request at runtime. One trophy (Bad Luck, I Guess) is still unconfirmed by every published guide — the entry says so instead of inventing a method.

No Rockstar artwork, logos or game screenshots are used anywhere.

## Run it

Serve `app/` with any static server and open `app/index.html`, for example:

```sh
python3 -m http.server 8080 --directory app
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library.

## License

MIT — see [LICENSE](LICENSE).
