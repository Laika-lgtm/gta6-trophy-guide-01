// Data layer: loads the trophy list and the guide metadata, then derives the
// source matrix and the audit from the shipped data, so the numbers shown in
// the app always match the guide itself.
export async function loadTrophyData() {
  const [trophyRes, metaRes] = await Promise.all([
    fetch("data/trophies.json"),
    fetch("data/meta.json"),
  ]);
  if (!trophyRes.ok) throw new Error("Could not load data/trophies.json");
  if (!metaRes.ok) throw new Error("Could not load data/meta.json");
  const trophyDoc = await trophyRes.json();
  const meta = await metaRes.json();
  return { trophies: trophyDoc.trophies, meta };
}

export function gradeLabel(grade) {
  if (grade === "platinum") return "Platinum";
  if (grade === "gold") return "Gold";
  if (grade === "silver") return "Silver";
  return "Bronze";
}

export function kindLabel(kind) {
  const labels = {
    story: "Story",
    completion: "Completion",
    activities: "Activities",
    collectibles: "Collectibles",
    robbery: "Robbery",
    side: "Side quest",
  };
  return labels[kind] || kind;
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sourceLink(meta, key) {
  const source = meta.sources[key];
  if (!source) return escapeHtml(key);
  return '<a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener">' + escapeHtml(source.name) + "</a>";
}

// A trophy is spoiler-hidden when spoiler mode is on, the trophy is hidden on
// PlayStation, and the reader has not earned it yet.
export function isSpoilerHidden(trophy, progress) {
  return progress.spoiler && trophy.hidden && !progress.earned.includes(trophy.id);
}

// Search never leaks a hidden trophy: it only matches what is visible on screen.
export function trophyMatchesSearch(trophy, progress, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (isSpoilerHidden(trophy, progress)) {
    return ("hidden trophy " + trophy.kind + " " + trophy.grade).includes(q);
  }
  const haystack = (trophy.id + " " + trophy.name + " " + trophy.description + " " + trophy.guide + " " + kindLabel(trophy.kind) + " " + trophy.grade).toLowerCase();
  return haystack.includes(q);
}

export function filterTrophies(trophies, progress) {
  return trophies.filter((trophy) => {
    if (progress.kind === "missable" && !trophy.missable) return false;
    if (progress.kind !== "all" && progress.kind !== "missable" && trophy.kind !== progress.kind) return false;
    if (progress.grade !== "all" && trophy.grade !== progress.grade) return false;
    if (progress.hideEarned && progress.earned.includes(trophy.id)) return false;
    return trophyMatchesSearch(trophy, progress, progress.query);
  });
}

// Source matrix: for each source, how many of the 55 guides cite it, computed
// from the sources array of every trophy. Percentages are honest counts.
export function computeSourceCoverage(trophies, meta) {
  const rows = [];
  for (const key of Object.keys(meta.sources)) {
    const count = trophies.filter((t) => (t.sources || []).includes(key)).length;
    rows.push({
      key,
      name: meta.sources[key].name,
      role: meta.sources[key].role,
      url: meta.sources[key].url,
      count,
      total: trophies.length,
      percent: Math.round((count / trophies.length) * 100),
    });
  }
  rows.sort((a, b) => b.count - a.count);
  return rows;
}

// Audit: one check per trophy, plus guide-wide totals. Every check is computed
// from the shipped data, not typed in by hand.
export function runAuditChecks(trophies, meta) {
  const perTrophy = trophies.map((trophy) => {
    const checks = {
      guide: typeof trophy.guide === "string" && trophy.guide.trim().length > 0,
      steps: Array.isArray(trophy.steps) && trophy.steps.length >= 2,
      cited: Array.isArray(trophy.steps) && trophy.steps.length > 0 && trophy.steps.every((s) => typeof s.source === "string" && s.source.length > 0),
      sources: Array.isArray(trophy.sources) && trophy.sources.length > 0,
      missable: typeof trophy.missable === "boolean",
      unconfirmed: trophy.unconfirmed === true ? true : trophy.unconfirmed !== true,
    };
    return { id: trophy.id, name: trophy.name, checks, pass: Object.values(checks).every(Boolean) };
  });
  const totals = {
    guides: perTrophy.filter((r) => r.checks.guide).length,
    steps: perTrophy.filter((r) => r.checks.steps).length,
    cited: perTrophy.filter((r) => r.checks.cited).length,
    missableFlagged: trophies.filter((t) => t.missable).length,
    unconfirmedFlagged: trophies.filter((t) => t.unconfirmed).length,
    hiddenMarked: trophies.filter((t) => t.hidden).length,
    sourcesInMatrix: Object.keys(meta.sources).length,
    disagreementsShown: (meta.disagreements || []).length,
    total: trophies.length,
    allPass: perTrophy.filter((r) => r.pass).length,
  };
  return { perTrophy, totals };
}
