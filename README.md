# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Laika-lgtm/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI
(1 platinum, 2 gold, 6 silver, 46 bronze) — built for the
[make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

A static web app that runs entirely offline from its own files. Open `app/index.html`
in a desktop browser and you get:

- **Every trophy** with its official name, description and grade, plus a guide
  written for this project that says what to do, where, how — and when it can be
  missed. Every guide cites its sources by name and link; nothing is copied from
  them.
- **A platinum roadmap** in three stages: story (60–80 hours), the 100% completion
  checklist (~100 hours), and cleanup (~10 hours). About 200 hours all in,
  according to PowerPyx.
- **A tracker**: tick trophies off, progress saves in the browser (localStorage),
  export your progress to a file and import it back.
- **Filters** by kind (story, missable, collectibles, activities, crime, money),
  by grade, and by text search.
- **A spoiler setting** that hides the names and descriptions of story trophies
  until you earn them.
- **The one missable warning**: *Positive Mental Attitude* — one meditation in
  Chapter 1 at Jason's house can disappear after the chapter ends, so the guide
  flags it and tells you exactly when to do it.

All 55 trophies are offline single-player; there are no online trophies, no
difficulty settings, and no mission replay — one playthrough is enough.

## Sources

The trophy list (names, descriptions, grades) is as PlayStation publishes it,
as listed by Exophase and PSNProfiles. The guides draw on PowerPyx, Push Square,
KeenGamer, GamesFuze, GTAScoop, Insider Gaming and EGamers — each guide names
its sources in the app. One trophy, *Bad Luck, I Guess*, is still unconfirmed
by every published guide at the time of writing, and the guide says so instead
of inventing a method.

## Run it

No build step, no network. Serve the `app/` folder with any static server:

```sh
cd app && python3 -m http.server 8080
```

then open http://localhost:8080.

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts` library:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
