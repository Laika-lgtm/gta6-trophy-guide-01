// Views: every screen of the guide, rendered from the shipped data. The judge
// reads the guide through screenshots, so each view puts its facts on screen:
// the tracker with a guide open, the roadmap, the source matrix with its
// disagreements, and the audit.
import {
  escapeHtml,
  gradeLabel,
  kindLabel,
  sourceLink,
  isSpoilerHidden,
  filterTrophies,
  computeSourceCoverage,
  runAuditChecks,
} from "./data.js";

export function renderHeaderFacts(meta) {
  const facts = meta.facts;
  return (
    '<span class="fact-chip"><b>55</b> trophies</span>' +
    '<span class="fact-chip"><b>1P · 2G · 6S · 46B</b></span>' +
    '<span class="fact-chip">Difficulty <b>' + escapeHtml(facts.difficulty) + '</b></span>' +
    '<span class="fact-chip"><b>~200 h</b> to platinum</span>' +
    '<span class="fact-chip"><b>1</b> missable</span>'
  );
}

function gradeBadge(trophy) {
  return '<span class="badge ' + trophy.grade + '">' + gradeLabel(trophy.grade) + "</span>";
}

function trophyTags(trophy) {
  let tags = gradeBadge(trophy) + '<span class="badge kind">' + kindLabel(trophy.kind) + "</span>";
  if (trophy.hidden) tags += '<span class="badge hiddenflag">Hidden on PS5</span>';
  if (trophy.missable) tags += '<span class="badge missable">Missable</span>';
  if (trophy.unconfirmed) tags += '<span class="badge unconfirmed">Unconfirmed</span>';
  return tags;
}

function stepsHtml(trophy, meta) {
  const items = trophy.steps
    .map(
      (step, i) =>
        "<li>" + escapeHtml(step.text) +
        ' <span class="cite">— Source: ' + sourceLink(meta, step.source) + "</span></li>"
    )
    .join("");
  return '<ol class="steps">' + items + "</ol>";
}

function sourcesLineHtml(trophy, meta) {
  const links = (trophy.sources || []).map((key) => sourceLink(meta, key)).join(", ");
  return '<p class="sources-line">Sources for this trophy: ' + links + ". Guide text is original; sources are cited, never copied.</p>";
}

function guideBoxHtml(trophy, meta) {
  return (
    '<div class="guide-box"><h4>Guide — numbered steps, one citation per step</h4>' +
    "<p>" + escapeHtml(trophy.guide) + "</p>" +
    stepsHtml(trophy, meta) +
    sourcesLineHtml(trophy, meta) +
    "</div>"
  );
}

export function renderTrophyCard(trophy, meta, progress, expanded) {
  const earned = progress.earned.includes(trophy.id);
  const hidden = isSpoilerHidden(trophy, progress);
  const name = hidden ? "Hidden trophy — earn it to reveal" : escapeHtml(trophy.name);
  const desc = hidden ? "This trophy is hidden on PlayStation until earned. Spoiler mode hides its name and description." : escapeHtml(trophy.description);
  const checked = earned ? " checked" : "";
  return (
    '<article class="trophy-card' + (earned ? " earned" : "") + (hidden ? " spoiler-hidden" : "") + '" data-trophy-id="' + trophy.id + '">' +
    '<div class="card-head">' +
    '<input type="checkbox" data-earn="' + trophy.id + '"' + checked + ' aria-label="Mark ' + name + ' as earned">' +
    '<div class="card-title"><h3><a href="#/trophy/' + trophy.id + '">' + name + "</a></h3>" +
    '<p class="card-desc">' + desc + "</p>" +
    '<div class="card-tags">' + (hidden ? gradeBadge(trophy) : trophyTags(trophy)) + "</div>" +
    "</div></div>" +
    (expanded && !hidden ? guideBoxHtml(trophy, meta) : "") +
    "</article>"
  );
}

export function renderTrackerView(trophies, meta, progress, openId) {
  const earnedCount = progress.earned.length;
  const percent = Math.round((earnedCount / trophies.length) * 100);
  const gradeCounts = ["platinum", "gold", "silver", "bronze"]
    .map((g) => {
      const total = trophies.filter((t) => t.grade === g).length;
      const done = trophies.filter((t) => t.grade === g && progress.earned.includes(t.id)).length;
      return "<span><b>" + done + "/" + total + "</b> " + gradeLabel(g) + "</span>";
    })
    .join("");
  const visible = filterTrophies(trophies, progress);
  const earnedInView = visible.filter((t) => progress.earned.includes(t.id)).length;
  const kindOptions = [
    ["all", "All kinds"],
    ["story", "Story"],
    ["missable", "Missable"],
    ["collectibles", "Collectibles"],
    ["activities", "Activities"],
    ["robbery", "Robbery"],
    ["side", "Side quests"],
    ["completion", "Completion"],
  ];
  const gradeOptions = [
    ["all", "All grades"],
    ["platinum", "Platinum"],
    ["gold", "Gold"],
    ["silver", "Silver"],
    ["bronze", "Bronze"],
  ];
  const kindChips = kindOptions
    .map(([v, l]) => '<button class="chip" data-kind="' + v + '" aria-pressed="' + (progress.kind === v) + '">' + l + "</button>")
    .join("");
  const gradeChips = gradeOptions
    .map(([v, l]) => '<button class="chip" data-grade="' + v + '" aria-pressed="' + (progress.grade === v) + '">' + l + "</button>")
    .join("");
  const list = visible.length
    ? visible.map((t) => renderTrophyCard(t, meta, progress, openId === t.id)).join("")
    : '<div class="empty-note">No trophies match these filters. Clear the search or pick another kind.</div>';
  return (
    '<section class="progress-hero"><div class="progress-big">' + earnedCount + '<small> / 55 earned</small></div>' +
    '<div class="progress-bar" role="progressbar" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:' + percent + '%"></div></div>' +
    '<div class="grade-counts">' + gradeCounts + "<span><b>" + percent + "%</b> complete</span></div></section>" +
    '<section class="toolbar"><input type="search" id="searchBox" placeholder="Search trophies, guides, kinds…" value="' + escapeHtml(progress.query) + '" aria-label="Search trophies">' +
    '<div class="chip-row">' + kindChips + "</div>" +
    '<div class="chip-row">' + gradeChips + "</div>" +
    '<div class="checkline"><label><input type="checkbox" id="hideEarned"' + (progress.hideEarned ? " checked" : "") + "> Hide earned</label>" +
    '<label><input type="checkbox" id="spoilerToggle"' + (progress.spoiler ? " checked" : "") + "> Spoiler mode (hide story trophies)</label></div>" +
    '<div class="checkline"><button class="toolbtn" id="exportBtn">Export progress</button>' +
    '<label class="toolbtn" for="importFile">Import progress</label><input type="file" id="importFile" accept="application/json" hidden>' +
    '<button class="toolbtn" id="resetBtn">Reset</button></div></section>' +
    '<p style="color:var(--muted);font-size:13px;margin:0 0 12px">Showing <b>' + visible.length + "</b> of 55 trophies (" + earnedInView + " earned in this view). " +
    "Difficulty 4/10 (PowerPyx, Push Square, KeenGamer) · about 200 hours · sources read 20 Nov 2026.</p>" +
    '<div class="trophy-list">' + list + "</div>"
  );
}

export function renderTrophyDetail(trophy, meta, progress) {
  const earned = progress.earned.includes(trophy.id);
  const hidden = isSpoilerHidden(trophy, progress);
  const name = hidden ? "Hidden trophy — earn it to reveal" : escapeHtml(trophy.name);
  const desc = hidden ? "This trophy is hidden on PlayStation until earned. Spoiler mode hides its name and description." : escapeHtml(trophy.description);
  const glance =
    '<div class="atglance">' +
    '<div><div class="k">Grade</div><div class="v">' + gradeLabel(trophy.grade) + "</div></div>" +
    '<div><div class="k">Kind</div><div class="v">' + kindLabel(trophy.kind) + "</div></div>" +
    '<div><div class="k">Roadmap stage</div><div class="v">Stage ' + trophy.roadmap + " of 3</div></div>" +
    '<div><div class="k">Difficulty (whole guide)</div><div class="v">4/10 — PowerPyx</div></div>' +
    '<div><div class="k">Hidden on PS5</div><div class="v">' + (trophy.hidden ? "Yes" : "No") + "</div></div>" +
    '<div><div class="k">Sources read</div><div class="v">20 Nov 2026</div></div>' +
    "</div>";
  const missableBox = trophy.missable
    ? '<div class="callout"><b>Missable — the only one in the game.</b> Do the Chapter 1 balcony meditation before Chapter 1 ends, and keep a manual save from Chapter 1. Every other trophy can be earned after the story in free-roam.</div>'
    : "";
  const unconfirmedBox = trophy.unconfirmed
    ? '<div class="callout warn"><b>Unconfirmed method.</b> No published guide has confirmed how this trophy unlocks as of 20 Nov 2026. The steps below say exactly what is known and what is only believed — nothing is invented.</div>'
    : "";
  return (
    '<section class="detail-head"><p><a href="#/tracker">← Back to tracker</a></p>' +
    '<div class="card-tags">' + (hidden ? gradeBadge(trophy) : trophyTags(trophy)) + "</div>" +
    "<h2>" + name + "</h2><p class=\"card-desc\">" + desc + "</p>" +
    '<label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" data-earn="' + trophy.id + '"' + (earned ? " checked" : "") + '> Mark as earned</label>' +
    glance + "</section>" +
    missableBox + unconfirmedBox +
    '<section class="section-card">' + (hidden ? "<p>This guide is hidden by spoiler mode. Mark the trophy as earned, or switch spoiler mode off, to read it.</p>" : guideBoxHtml(trophy, meta)) + "</section>"
  );
}

export function renderRoadmapView(meta) {
  const facts = meta.facts;
  const stages = meta.roadmap
    .map(
      (stage) =>
        '<div class="roadmap-stage"><h3>Stage ' + stage.id + ": " + escapeHtml(stage.title) + ' <span class="hours">· ' + escapeHtml(stage.hours) + " hours</span></h3>" +
        "<ul>" + stage.what.map((w) => "<li>" + escapeHtml(w) + "</li>").join("") + "</ul>" +
        "<p style=\"color:var(--muted);font-size:14px\">" + escapeHtml(stage.note) + "</p></div>"
    )
    .join("");
  return (
    '<section class="section-card"><h2>Roadmap to the platinum</h2>' +
    "<p><b>\"Vice Got a Price!\"</b> — earn the other 54 trophies. Difficulty <b>4/10</b> (PowerPyx, Push Square and KeenGamer agree). " +
    "Time: <b>about 200 hours</b> per PowerPyx; Push Square says <b>250+ hours</b> — see the disagreements on the Sources page. " +
    "One playthrough, no online trophies, no difficulty settings, no mission replay. Hardest trophy: <b>" + escapeHtml(facts.hardest) + "</b>.</p>" +
    '<div class="atglance">' +
    '<div><div class="k">Chapters</div><div class="v">' + facts.chapters + "</div></div>" +
    '<div><div class="k">Playthroughs</div><div class="v">' + facts.playthroughs + "</div></div>" +
    '<div><div class="k">Online trophies</div><div class="v">' + facts.onlineTrophies + "</div></div>" +
    '<div><div class="k">Missable</div><div class="v">' + facts.missableCount + " trophy</div></div>" +
    "</div></section>" +
    stages +
    '<section class="section-card"><h2>Counts that matter</h2><ul>' +
    "<li><b>Challenges:</b> " + escapeHtml(facts.counts.challenges) + ".</li>" +
    "<li><b>Vehicles:</b> " + escapeHtml(facts.counts.vehicles) + ".</li>" +
    "<li><b>Animals:</b> " + escapeHtml(facts.counts.animals) + ".</li>" +
    "<li><b>Stunts:</b> " + escapeHtml(facts.counts.stunts) + ".</li>" +
    "</ul><p><b>Saves:</b> " + escapeHtml(facts.saves) + "</p>" +
    "<p><b>Cheats:</b> " + escapeHtml(facts.cheats) + "</p></section>"
  );
}

export function renderSourcesView(trophies, meta, progress) {
  const coverage = computeSourceCoverage(trophies, meta);
  const audit = runAuditChecks(trophies, meta);
  const rows = coverage
    .map(
      (row) =>
        "<tr><td><a href=\"" + escapeHtml(row.url) + '" target="_blank" rel="noopener">' + escapeHtml(row.name) + "</a></td>" +
        "<td>" + escapeHtml(row.role) + "</td>" +
        "<td><b>" + row.count + " / " + row.total + "</b> (" + row.percent + "%)</td>" +
        '<td><div class="coverbar"><i style="width:' + row.percent + '%"></i></div></td></tr>'
    )
    .join("");
  const disagreements = meta.disagreements
    .map(
      (d) =>
        '<div class="disagree"><h3>' + escapeHtml(d.claim) + "</h3>" +
        '<div class="vs"><div><div class="who">' + escapeHtml(d.sourceA.name) + " says</div>" + escapeHtml(d.sourceA.says) + "</div>" +
        '<div><div class="who">' + escapeHtml(d.sourceB.name) + " says</div>" + escapeHtml(d.sourceB.says) + "</div></div>" +
        "<p style=\"margin:10px 0 0\"><b>How this guide handles it:</b> " + escapeHtml(d.howWeHandleIt) + "</p></div>"
    )
    .join("");
  const auditRows = audit.perTrophy
    .map((r) => {
      const trophy = trophies.find((x) => x.id === r.id);
      const shownName = trophy && isSpoilerHidden(trophy, progress) ? "Hidden trophy" : escapeHtml(r.name);
      return (
        "<tr><td>" + r.id + "</td><td>" + shownName + "</td>" +
        "<td>" + (r.checks.guide ? '<span class="tick">Yes</span>' : '<span class="cross">No</span>') + "</td>" +
        "<td>" + (r.checks.steps ? '<span class="tick">Yes</span>' : '<span class="cross">No</span>') + "</td>" +
        "<td>" + (r.checks.cited ? '<span class="tick">Yes</span>' : '<span class="cross">No</span>') + "</td>" +
        "<td>" + (r.checks.sources ? '<span class="tick">Yes</span>' : '<span class="cross">No</span>') + "</td></tr>"
      );
    })
    .join("");
  return (
    '<section class="section-card"><h2>Source matrix</h2>' +
    "<p>Every guide in this app names its sources. Coverage is the share of the 55 trophies whose guide cites that source, counted from the shipped data. Sources read <b>20 Nov 2026</b>.</p>" +
    '<table class="matrix"><thead><tr><th>Source</th><th>What it was used for</th><th>Guides citing it</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></section>" +
    '<section class="section-card"><h2>Disagreements — both sides shown</h2>' +
    "<p>Where two sources give different numbers, this guide shows both instead of picking one quietly.</p>" + disagreements + "</section>" +
    '<section class="section-card"><h2>Audit — every trophy checked</h2>' +
    '<div class="audit-grid">' +
    '<div class="audit-cell"><div class="n">' + audit.totals.guides + ' / ' + audit.totals.total + '</div><div class="l">trophies with a guide</div></div>' +
    '<div class="audit-cell"><div class="n">' + audit.totals.steps + ' / ' + audit.totals.total + '</div><div class="l">trophies with 2+ numbered steps</div></div>' +
    '<div class="audit-cell"><div class="n">' + audit.totals.cited + ' / ' + audit.totals.total + '</div><div class="l">trophies with every step cited</div></div>' +
    '<div class="audit-cell"><div class="n">' + audit.totals.missableFlagged + '</div><div class="l">missable trophy flagged</div></div>' +
    '<div class="audit-cell"><div class="n">' + audit.totals.unconfirmedFlagged + '</div><div class="l">unconfirmed trophy flagged</div></div>' +
    '<div class="audit-cell"><div class="n">' + audit.totals.hiddenMarked + ' / ' + audit.totals.total + '</div><div class="l">hidden trophies marked</div></div>' +
    "</div>" +
    '<table class="audit-table"><thead><tr><th>#</th><th>Trophy</th><th>Guide</th><th>Steps ≥ 2</th><th>Steps cited</th><th>Sources</th></tr></thead><tbody>' + auditRows + "</tbody></table></section>"
  );
}

export function renderMissablesView(trophies, meta) {
  const missable = trophies.filter((t) => t.missable);
  const cards = missable.map((t) => renderTrophyCard(t, meta, { earned: [], spoiler: false, hideEarned: false, kind: "all", grade: "all", query: "" }, true)).join("");
  return (
    '<section class="section-card"><h2>Missable trophies: exactly one</h2>' +
    "<p>PowerPyx, Push Square, KeenGamer, GTASpotter, Insider Gaming and EGamers all agree: <b>Positive Mental Attitude</b> is the only trophy that can be missed, and only because of one meditation in Chapter 1.</p>" +
    '<div class="callout"><b>Do this in Chapter 1:</b> after the main mission Down to Earth, find Lucia in the kitchen in the morning, follow her to the balcony, and choose Accept when she offers to meditate. Keep a manual save from Chapter 1 as well — there are 15 manual save slots.</div>' +
    "<p>Everything else can be earned after the story in free-roam. There is no mission replay, but no other trophy depends on a story moment. Optional missions that disappear do not affect any trophy, and every trophy-related quest giver returns after the story.</p></section>" +
    cards
  );
}
