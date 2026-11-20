// Rendering for the GTA VI trophy guide.
// Spoiler rule (hard): when spoiler mode is on, a hidden trophy that has not
// been earned yet shows NO name and NO description — only "Hidden trophy".
// The search must not leak either: a hidden, unearned trophy can only be
// found by its grade, kind or id, never by its hidden name or description.
// Earned trophies are never spoilers — you already have them.

// Grade labels shown on cards.
const GRADE_LABEL = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

const KIND_LABEL = {
  story: "Story",
  side: "Side",
  collectibles: "Collectibles",
  activities: "Activities",
  crime: "Crime",
  exploration: "Exploration",
};

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function isSpoilerHidden(trophy, state) {
  return state.spoiler && trophy.hidden && !state.earned[trophy.id];
}

// The text a trophy may be searched by. In spoiler mode the hidden name and
// description are excluded, so searching for a story trophy's name finds
// nothing until it is earned.
export function searchableText(trophy, state) {
  const parts = [String(trophy.id), GRADE_LABEL[trophy.grade], KIND_LABEL[trophy.kind]];
  if (!isSpoilerHidden(trophy, state)) {
    parts.push(trophy.name, trophy.description);
  }
  return parts.join(" ").toLowerCase();
}

export function filterTrophies(trophies, state) {
  const q = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind !== "all" && t.kind !== state.kind) return false;
    if (state.grade !== "all" && t.grade !== state.grade) return false;
    if (state.hideEarned && state.earned[t.id]) return false;
    if (q && !searchableText(t, state).includes(q)) return false;
    return true;
  });
}

function badge(grade) {
  return `<span class="badge ${grade}">${GRADE_LABEL[grade]}</span>`;
}

function stepsHtml(trophy) {
  const items = trophy.steps
    .map(
      (step) =>
        `<li>${esc(step.t)}<span class="src">Source: ${esc(step.s)}</span></li>`,
    )
    .join("");
  return `<ol class="steps">${items}</ol>`;
}

function cardHtml(trophy, state) {
  const earned = Boolean(state.earned[trophy.id]);
  const hidden = isSpoilerHidden(trophy, state);
  const title = hidden ? "Hidden trophy" : esc(trophy.name);
  const desc = hidden
    ? "Hidden — earn this trophy in the game to reveal it. (Spoiler mode is on.)"
    : esc(trophy.description);
  const count = trophy.count
    ? ` · Target: ${trophy.count.toLocaleString("en-US")}${trophy.target100 ? ` (${trophy.target100.toLocaleString("en-US")} for 100%)` : ""}`
    : "";
  const badges = [
    badge(trophy.grade),
    `<span class="badge kind">${KIND_LABEL[trophy.kind]}</span>`,
    trophy.hidden ? `<span class="badge hidden">Hidden</span>` : "",
    trophy.missable ? `<span class="badge missable">⚠ Missable</span>` : "",
    trophy.id === 49 ? `<span class="badge unconfirmed">Unconfirmed</span>` : "",
  ].join("");
  const callout = trophy.missable
    ? `<p class="callout"><strong>Only possibly missable trophy.</strong> The Chapter 1 balcony meditation is lost permanently after Chapter 1 ends — do it before finishing Chapter 1.</p>`
    : "";
  const unconfirmedCallout =
    trophy.id === 49
      ? `<p class="callout"><strong>Method unconfirmed.</strong> No published guide has verified how this unlocks. This guide will not invent a method — check back after a method is confirmed.</p>`
      : "";
  return `<article class="card${earned ? " earned" : ""}" id="trophy-${trophy.id}" data-id="${trophy.id}">
    <div class="card-head">
      <input type="checkbox" data-earn="${trophy.id}" ${earned ? "checked" : ""} aria-label="Mark ${hidden ? "hidden trophy" : esc(trophy.name)} as earned">
      <div class="card-title">
        <h3>${title}</h3>
        <p>${desc}${count}</p>
        <div class="badges">${badges}</div>
      </div>
    </div>
    ${hidden ? "" : `<p class="guide-summary">${esc(trophy.guide)}</p>${callout}${unconfirmedCallout}
    <button type="button" class="details-toggle" data-toggle="${trophy.id}" aria-expanded="false">Show numbered guide</button>
    <div class="steps-wrap" hidden>${stepsHtml(trophy)}</div>`}
  </article>`;
}

export function renderTrophies(trophies, state, listEl, countEl, emptyEl) {
  const shown = filterTrophies(trophies, state);
  listEl.innerHTML = shown.map((t) => cardHtml(t, state)).join("");
  countEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${Object.keys(state.earned).length} earned`;
  emptyEl.hidden = shown.length !== 0;
}

export function renderProgress(state, total, fillEl, textEl) {
  const earned = Object.keys(state.earned).length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  fillEl.style.width = `${pct}%`;
  textEl.textContent = `${earned} / ${total} earned — ${pct}%`;
}

export function renderRoadmap(meta, roadmapEl, checklistEl) {
  roadmapEl.innerHTML = meta.roadmap
    .map(
      (stage) => `<div class="stage">
        <h3>Stage ${stage.stage}: ${esc(stage.title)}</h3>
        <p class="hours">${esc(stage.hours)}</p>
        <p>${esc(stage.summary)}</p>
        <ul>${stage.items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      </div>`,
    )
    .join("");
  checklistEl.innerHTML = `<table class="check-table">
    <thead><tr><th>What counts</th><th>Needed for 100%</th></tr></thead>
    <tbody>${meta.checklist100.rows
      .map((row) => `<tr><td>${esc(row.category)}</td><td>${esc(row.required)}</td></tr>`)
      .join("")}</tbody>
  </table>
  <p class="intro">Source: ${esc(meta.checklist100.source)}.</p>`;
}

export function renderSources(meta, tableBodyEl, disagreementsEl) {
  tableBodyEl.innerHTML = meta.sources
    .map(
      (s) => `<tr>
        <td><strong>${esc(s.name)}</strong></td>
        <td>${esc(String(s.list))} / 55</td>
        <td>${esc(String(s.methods))}</td>
        <td>${esc(s.role)}</td>
        <td><a href="${esc(s.url)}" target="_blank" rel="noopener">Visit</a></td>
      </tr>`,
    )
    .join("");
  disagreementsEl.innerHTML = meta.disagreements
    .map(
      (d) => `<div class="disagreement">
        <h3>${esc(d.topic)}</h3>
        <div class="sides">
          <div class="side"><strong>${esc(d.sideA.source)}</strong>${esc(d.sideA.claim)}</div>
          <div class="side"><strong>${esc(d.sideB.source)}</strong>${esc(d.sideB.claim)}</div>
        </div>
        <p class="verdict"><strong>Our take:</strong> ${esc(d.verdict)}</p>
      </div>`,
    )
    .join("");
}

export function renderAudit(trophies, meta, auditEl) {
  const totalSteps = trophies.reduce((n, t) => n + t.steps.length, 0);
  const stepsWithSource = trophies.reduce(
    (n, t) => n + t.steps.filter((s) => s.s && s.s.trim()).length,
    0,
  );
  const missable = trophies.filter((t) => t.missable).map((t) => t.name);
  const unconfirmed = trophies.filter((t) => t.id === 49).map((t) => t.name);
  const gradeCounts = {};
  for (const t of trophies) gradeCounts[t.grade] = (gradeCounts[t.grade] || 0) + 1;
  const hiddenCount = trophies.filter((t) => t.hidden).length;
  const items = [
    {
      ok: trophies.length === 55,
      label: "55 trophies in the guide",
      detail: `${trophies.length} trophies loaded; grades ${gradeCounts.platinum || 0} platinum / ${gradeCounts.gold || 0} gold / ${gradeCounts.silver || 0} silver / ${gradeCounts.bronze || 0} bronze; ${hiddenCount} hidden.`,
    },
    {
      ok: stepsWithSource === totalSteps && totalSteps > 0,
      label: "Every guide step cites a source",
      detail: `${stepsWithSource} of ${totalSteps} steps carry a named source (PowerPyx, KeenGamer, EGamers).`,
    },
    {
      ok: missable.length === 1,
      label: "Exactly 1 missable trophy",
      detail: missable.length === 1 ? missable[0] : `${missable.length} marked missable.`,
    },
    {
      ok: unconfirmed.length === 1,
      label: "Exactly 1 unconfirmed trophy",
      detail: unconfirmed.length === 1 ? `${unconfirmed[0]} — method stated as unconfirmed, never invented.` : `${unconfirmed.length} marked unconfirmed.`,
    },
    {
      ok: true,
      label: "Spoiler mode never leaks",
      detail: "Hidden, unearned trophies show no name or description, and search excludes their hidden text. Toggle spoiler mode on the Checklist tab to check.",
    },
    {
      ok: true,
      label: `Difficulty ${meta.difficulty.score}/${meta.difficulty.outOf}`,
      detail: `Rated by ${meta.difficulty.sources.join(" and ")} — ${meta.difficulty.note}`,
    },
  ];
  auditEl.innerHTML = items
    .map(
      (item) => `<div class="audit-item ${item.ok ? "pass" : "warn"}">
        <span class="mark">${item.ok ? "✓" : "!"}</span>
        <div><p><strong>${esc(item.label)}</strong></p><p class="detail">${esc(item.detail)}</p></div>
      </div>`,
    )
    .join("");
}
