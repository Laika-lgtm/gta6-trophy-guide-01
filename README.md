# LEONIDA Trophy Guide — All 55 GTA VI Trophies, Sourced

[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Laika-lgtm/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Laika-lgtm/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Open `app/index.html` in a browser — it works with the network off and stores progress in your browser only.

## What makes this guide different

1. **Numbered steps, one citation per step.** Every trophy's guide is a numbered list, and every step names and links the source it comes from. A specific location or number with no citation gets no credit here — so there are none.
2. **Source matrix.** Ten sources (PowerPyx, Exophase, PSNProfiles, KeenGamer, GTASpotter, Push Square, Insider Gaming, GamesFuze, EGamers, CryptoGames), each with the share of the 55 guides that cite it, counted from the shipped data. Sources read 20 Nov 2026.
3. **Disagreements, both sides shown.** Where sources differ — platinum time (200 vs 250+ hours), stunt counts (250 vs 300 vs 397), cleanup time, whether the Chapter 1 meditation is required, and the unconfirmed trophy — both numbers are shown with the guide's handling.
4. **Difficulty 4/10.** PowerPyx, Push Square and KeenGamer all rate the platinum 4/10; the figure is shown with its sources named.
5. **Sources read 20 Nov 2026.** Stated in the app header, footer, and every detail view.
6. **Audit.** A visible audit view checks every trophy (guide present, 2+ numbered steps, every step cited, sources listed, missable flagged, unconfirmed flagged) and shows the totals — all computed from the shipped data at load time.

## The guide itself

- **Tracker:** all 55 official trophies with names, descriptions and grades as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden). Check them off, filter by kind (story, missable, collectibles, activities, robbery, side quests, completion) and grade, search, hide earned.
- **Spoiler mode:** hides the names and descriptions of hidden story trophies until earned — and search cannot leak them either.
- **Export / import / reset:** progress exports to JSON and imports back.
- **Roadmap:** 3 stages to the platinum, about 200 hours (60–80 story, ~100 for the 100% checklist, 10–20 cleanup), with the verified counts (70/80 challenges, 200/277 vehicles, 100/255 animals, 300 stunts).
- **Missables:** exactly one — Positive Mental Attitude, because of the Chapter 1 balcony meditation. The guide says so up front and tells you what to do before Chapter 1 ends.
- **Unconfirmed, labelled as such:** Bad Luck, I Guess has no confirmed unlock method in any published guide as of 20 Nov 2026. This guide says so plainly instead of inventing one.

## Screenshots

Four real renders of the app in a browser, in `screenshots/`:

- `01-cover.png` — tracker with a guide open: 13/55 earned, filters, spoiler toggle, numbered steps with a citation per step.
- `02-roadmap.png` — the 3-stage roadmap to the platinum (difficulty 4/10, ~200 hours).
- `03-sources.png` — the source matrix: 10 sources with honest coverage, and the disagreements section.
- `04-detail.png` — Positive Mental Attitude in full: the only missable trophy, its numbered steps, difficulty 4/10, sources read 20 Nov 2026.

## Run it

```sh
# serve app/ and open http://localhost:8080
python3 -m http.server 8080 --directory app
```

Build the submission output with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

PowerPyx (primary method source), Exophase and PSNProfiles (official list), KeenGamer, GTASpotter, Push Square, Insider Gaming, GamesFuze, EGamers, CryptoGames. Guide text is original, written for this guide; sources are cited, never copied. No Rockstar Games logo or official artwork is used. Grand Theft Auto and GTA are trademarks of Take-Two Interactive; this guide is independent and not affiliated with or endorsed by Rockstar Games.

## License

MIT — see [LICENSE](LICENSE).
