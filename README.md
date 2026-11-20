[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Laika-lgtm/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Laika-lgtm/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# LEONIDA Trophy Guide: 55 trophies, 263 cited claims, 258 backed by 2+ sources, 51 sources read, count trackers, chapter missable grid

A complete, offline, fully sourced trophy guide for Grand Theft Auto VI on PlayStation 5 — every trophy with its own guide, a five-stage roadmap to the platinum, a chapter-by-chapter missables grid, 30 interactive count trackers, and a Sources tab that shows every citation, a trophy × source heatmap, and 28 disputes where the guides disagree.

Competition: https://make.fun/bounty/gta6-trophy-guide-01

## What it is

- **Tracker** — all 55 trophies (names, descriptions and grades exactly as PlayStation lists them) with a checkbox per trophy, kind/grade filters, search, hide-earned, and a spoiler-safe mode that hides un-earned story trophies. Each trophy opens a guide written in this entry's own words, every step cited `[n]` to the Sources tab.
- **Roadmap** — five stages in order: Chapter 1, the story, the 100% Completion Checklist, the Strangers & Freaks finales, then cleanup and the platinum. Every step carries its sources.
- **Missables** — a chapter grid (Chapter 1–5 + Post) of the watch items, story gates showing where each trophy pops, and the one possibly missable step (the Chapter 1 balcony meditation) flagged clearly.
- **Sources & Disputes** — 65 sources in the register, 51 cited, read 20–21 Nov 2026, a trophy × source heatmap, and 28 disputes with both sides shown and this guide's call on each.

## Audit (computed from the data files, not typed by hand)

- 263 claims cited, 258 of them backed by 2+ sources
- 51 sources cited, across 24 sites
- 28 disputes on record
- 1 possibly missable trophy (Positive Mental Attitude), 3 at-risk watch items
- 9 methods still unconfirmed (shown as reported, never as settled)
- 30 count trackers; progress persists in localStorage with export/import
- Hidden trophies: 28 (27 Bronze + 1 Gold). Grades: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze.

## Run it offline

The app is plain static files — no build step, no network at runtime. It fetches only its own `app/data/*.json` files.

```sh
python3 -m http.server 8000 --directory app   # serves app/ at http://localhost:8000
```

Or open `app/index.html` directly in a browser (ES modules need a local server in some browsers). Add `?demo=1` to the URL to load a seeded mid-game state (13 of 55 earned, meditations 6/18).

## Build the entry

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` into the output directory and writes `output/dossier.json` with the kit's make.fun library.
