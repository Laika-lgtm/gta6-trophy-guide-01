// View renderers: each tab is pure HTML built from the data.
// Nothing here fetches anything; nothing here knows about localStorage.
import { citeMarks, esc, sourceName, sourceDomain } from "./data.js";

// Trophy id -> count-tracker id (only trophies with a live counter).
const COUNTER_FOR = {
  15: "stunts", 17: "rangeGolds", 18: "droneTrials", 19: "racesWon",
  21: "videogames", 28: "meditations", 30: "cardsets", 31: "waink",
  32: "challenges", 35: "vehicles",
};

// Roadmap order for the Next Up panel: the order a player should earn them.
const NEXT_UP = [28, 2, 20, 23, 8, 24, 29, 54, 55, 26, 27, 22, 3, 9, 10, 11, 12,
  33, 34, 39, 40, 52, 14, 15, 16, 17, 18, 19, 21, 30, 31, 32, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 53, 4, 5, 6, 7, 13, 25];

const KIND_LABEL = {
  story: "Story", strangers: "Strangers", activities: "Activity",
  collectibles: "Collectible", crime: "Crime", money: "Money",
  hidden: "Hidden", platinum: "Platinum",
};

export function spoilerHidden(t, state) {
  return state.spoiler && t.kind === "story" && !state.earned[t.id] && t.grade !== "platinum";
}

export function filteredTrophies(data, state, query, kind, grade) {
  const q = (query || "").toLowerCase();
  return data.trophies.trophies.filter((t) => {
    if (state.hideEarned && state.earned[t.id]) return false;
    if (kind && t.kind !== kind) return false;
    if (grade && t.grade !== grade) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function trophyRow(t, state, selected) {
  const done = !!state.earned[t.id];
  const hidden = spoilerHidden(t, state);
  const name = hidden ? "Story trophy — hidden until earned" : esc(t.name);
  const desc = hidden ? "Spoiler-safe mode is on." : esc(t.description);
  const counter = COUNTER_FOR[t.id];
  return `<button type="button" class="trow${done ? " done" : ""}${selected === t.id ? " sel" : ""}" data-trophy="${t.id}">
    <input type="checkbox" ${done ? "checked" : ""} data-earned="${t.id}" aria-label="Mark ${esc(t.name)} earned" tabindex="-1">
    <span class="tinfo">
      <span class="tname">${name}</span>
      <span class="tdesc">${desc}</span>
      <span class="tmeta">
        <span class="grade ${t.grade}">${t.grade.toUpperCase()}</span>
        <span class="kind">${KIND_LABEL[t.kind] || t.kind}</span>
        ${t.hidden ? '<span class="flag">HIDDEN</span>' : ""}
        ${t.missable ? '<span class="flag">⚠ POSSIBLY MISSABLE</span>' : ""}
        ${counter ? `<span class="cnt">${esc(counterLabel(counter))}</span>` : ""}
      </span>
    </span>
  </button>`;
}

function counterLabel(id) {
  return id.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function renderTracker(data, state, opts) {
  const list = filteredTrophies(data, state, opts.query, opts.kind, opts.grade);
  const selected = data.trophyById.get(opts.selected) || data.trophyById.get(28);
  const rows = list.map((t) => trophyRow(t, state, selected.id)).join("");
  return `<div class="tracker">
    <div class="tlist">
      <div class="tlist-head">${list.length} of ${data.trophies.trophies.length} trophies shown · tick the box when you earn one</div>
      ${rows || '<div class="tlist-head">Nothing matches those filters.</div>'}
    </div>
    <div class="detail">${renderDetail(data, state, selected)}</div>
  </div>`;
}

function renderDetail(data, state, t) {
  const hidden = spoilerHidden(t, state);
  const counterId = COUNTER_FOR[t.id];
  const counter = counterId ? data.counts.counters.find((c) => c.id === counterId) : null;
  const usedSources = [...new Set(t.claims.flatMap((c) => c.sources))].sort((a, b) => a - b);
  const nextUp = NEXT_UP.filter((id) => !state.earned[id]).slice(0, 4)
    .map((id) => data.trophyById.get(id)).filter(Boolean);

  let html = `<h2>${hidden ? "Story trophy — hidden until earned" : esc(t.name)}</h2>`;
  html += `<p class="desc">${hidden ? "Spoiler-safe mode hides story trophies you have not earned yet. Earn it, or turn spoiler-safe off." : esc(t.description)}</p>`;
  html += `<div class="tags"><span class="pill ${t.grade}">${t.grade.toUpperCase()}</span>
    <span class="muted">${KIND_LABEL[t.kind] || t.kind} · ${t.psnCount !== null && t.psnCount !== undefined ? `PSN tracks: ${t.psnCount}` : "no PSN count published"}</span>
    ${t.hidden ? '<span class="flag">HIDDEN TROPHY</span>' : ""}</div>`;
  if (t.missable) {
    html += `<div class="notice danger"><b>⚠ Possibly missable.</b> The Chapter 1 balcony meditation with Lucia may be the one step in the whole game that cannot be redone. Do it the morning after Down to Earth, then save. Whether it is actually required is still unconfirmed — see the Missables tab.</div>`;
  }
  if (hidden) return html + nextUpHtml(nextUp);
  html += `<h3>How to get it</h3><ol class="claims">`;
  for (const c of t.claims) {
    html += `<li><p>${esc(c.text)} ${citeMarks(data, c.sources)}</p></li>`;
  }
  html += `</ol>`;
  if (counter) {
    const cur = state.counters[counter.id] || 0;
    html += `<h3>Count tracker</h3><div class="counter"><span class="clabel"><b>${esc(counter.label)}</b> — game total ${counter.target}${counter.trophyTarget !== null ? `, trophy needs ${counter.trophyTarget}` : ""}</span>
      <span class="cbtns"><button type="button" data-counter="${counter.id}" data-delta="-1" aria-label="Decrease">−</button>
      <span class="cval">${cur} / ${counter.target}</span>
      <button type="button" data-counter="${counter.id}" data-delta="1" aria-label="Increase">+</button></span></div>`;
  }
  html += `<h3>Sources for this guide</h3><ol class="srclist">`;
  for (const n of usedSources) {
    html += `<li>[${n}] ${esc(sourceName(data, n))} — ${esc(sourceDomain(data, n))}</li>`;
  }
  html += `</ol>`;
  html += nextUpHtml(nextUp);
  return html;
}

function nextUpHtml(nextUp) {
  if (!nextUp.length) return `<div class="nextup"><h3>Next up</h3><p>All 55 earned — the platinum is yours.</p></div>`;
  return `<div class="nextup"><h3>Next up</h3><ol>${nextUp.map((t) => `<li><b>${esc(t.name)}</b> <span class="muted">(${KIND_LABEL[t.kind] || t.kind})</span></li>`).join("")}</ol></div>`;
}

export function renderRoadmap(data) {
  const cards = data.roadmap.stages.map((s) => `<section class="card">
    <h3>${esc(s.title)}</h3><div class="hours">${esc(s.hours)}</div>
    <ol>${s.steps.map((st) => `<li>${esc(st.text)} ${citeMarks(data, st.sources)}</li>`).join("")}</ol>
  </section>`).join("");
  return `<div class="roadmap-view"><h2>Roadmap — five stages, in order</h2>
  <p class="muted">Chapter 1 first, then the story, then the 100% checklist, then the stranger finales, then cleanup. Every step carries its sources.</p>
  <div class="cards">${cards}</div></div>`;
}

export function renderMissables(data) {
  const rows = data.missables.rows.map((r) => `<tr class="${r.status}">
    <td><span class="st ${r.status}">${r.status === "possibly missable" ? "POSSIBLY MISSABLE" : r.status === "watch" ? "WATCH" : "SAFE"}</span></td>
    <td><b>${esc(r.trophy)}</b></td><td>${esc(r.chapter)}</td>
    <td>${esc(r.lastChance)}</td><td>${esc(r.note)}</td>
    <td>${citeMarks(data, r.sources)}</td></tr>`).join("");
  const gates = data.missables.gates.map((g) => `<section class="gate"><h4>${esc(g.chapter)}</h4>
    <ul>${g.missions.map((m) => `<li><b>${esc(m.mission)}</b> → ${m.trophies.map(esc).join(", ")}</li>`).join("")}</ul>
    <p class="muted">${esc(g.note)}</p></section>`).join("");
  return `<h2>Missables — the chapter grid</h2>
  <p class="muted">${esc(data.missables.atRiskNote)} The full list of 55 is in the Tracker; this tab is only the watch list.</p>
  <table class="gridtable"><thead><tr><th>Status</th><th>Trophy / item</th><th>Chapter</th><th>Last chance</th><th>What happens</th><th>Sources</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <h3>Story gates — where each trophy pops</h3>
  <div class="gates">${gates}</div>`;
}

export function renderSources(data) {
  // Heatmap: top 12 sources by claim usage, plus an "other" column.
  const usage = new Map();
  for (const t of data.trophies.trophies) {
    for (const c of t.claims) for (const n of c.sources) usage.set(n, (usage.get(n) || 0) + 1);
  }
  const top = [...usage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([n]) => n);
  const otherTotal = [...usage.entries()].filter(([n]) => !top.includes(n)).reduce((a, [, v]) => a + v, 0);

  const head = `<tr><th class="rowh">Trophy</th>${top.map((n) => `<th>[${n}]</th>`).join("")}<th>oth</th></tr>`;
  const body = data.trophies.trophies.map((t) => {
    const cells = top.map((n) => {
      const v = t.claims.reduce((a, c) => a + (c.sources.includes(n) ? 1 : 0), 0);
      return `<td class="c${Math.min(v, 3)}">${v || ""}</td>`;
    }).join("");
    const other = t.claims.reduce((a, c) => a + c.sources.filter((n) => !top.includes(n)).length, 0);
    return `<tr><td class="rowh">${esc(t.name)}</td>${cells}<td class="c${Math.min(other, 3)}">${other || ""}</td></tr>`;
  }).join("");

  // Sources cited anywhere (claims + roadmap + missables + disputes) — mirrors audit.js.
  const citedAnywhere = new Set(usage.keys());
  for (const s of data.roadmap.stages) for (const st of s.steps) for (const n of st.sources) citedAnywhere.add(n);
  for (const r of data.missables.rows) for (const n of r.sources) citedAnywhere.add(n);
  for (const d of data.disputes.disputes) for (const n of [...d.sideA.sources, ...d.sideB.sources, ...d.verdictSources]) citedAnywhere.add(n);

  const list = data.sources.sources.map((s) => {
    const used = usage.get(s.n) || 0;
    const citedNote = used ? `, cited in ${used} claim${used === 1 ? "" : "s"}` : citedAnywhere.has(s.n) ? ", cited in roadmap/disputes" : ", in the register, not cited in any guide";
    const note = s.note ? ` — ${esc(s.note)}` : "";
    return `<li id="src-${s.n}"><span class="num">[${s.n}]</span> <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a> <span class="muted">— ${esc(s.kind)}, read ${esc(data.sources.readDate)}${citedNote}${note}</span></li>`;
  }).join("");

  const disputes = data.disputes.disputes.map((d) => `<section class="dispute"><h4>${esc(d.id)} — ${esc(d.title)}</h4>
    <div class="sides"><div class="sideA"><b>Side A:</b> ${esc(d.sideA.text)} ${citeMarks(data, d.sideA.sources)}</div>
    <div class="sideB"><b>Side B:</b> ${esc(d.sideB.text)} ${citeMarks(data, d.sideB.sources)}</div></div>
    <div class="verdict"><b>What this guide does:</b> ${esc(d.verdict)} ${citeMarks(data, d.verdictSources)}</div></section>`).join("");

  return `<h2>Sources — ${data.sources.sources.length} in the register, ${citedAnywhere.size} cited, numbered in the order they appear</h2>
  <div class="srcwrap">
    <div><ol class="srclist-full">${list}</ol></div>
    <div class="heatmap"><b>Trophy × source heatmap</b>
      <p class="muted">Each cell is how many claims of that trophy cite that source. Top 12 sources shown; ${otherTotal} more citations sit in the "oth" column.</p>
      <table>${head}${body}</table>
      <p class="legend">Shading: blank = 0, light = 1, amber = 2, dark = 3+ claims.</p></div>
  </div>
  <h3>Disputes — ${data.disputes.disputes.length} places the guides disagree</h3>
  <p class="muted">Where the sources conflict, both sides are shown and this guide says what it does and why. Unsettled items stay unsettled.</p>
  ${disputes}`;
}
