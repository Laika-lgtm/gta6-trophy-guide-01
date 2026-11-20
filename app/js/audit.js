// Audit: every number in the header strip and the title is computed here,
// straight from the loaded data — never typed by hand.
import { sourceDomain } from "./data.js";
import { earnedCount, loggedTotal } from "./store.js";

const UNCONFIRMED_RE = /UNCONFIRMED|reported, not settled|still being mapped|still being confirmed/i;

export function computeAudit(data, state) {
  const trophies = data.trophies.trophies;
  let claims = 0;
  let twoPlus = 0;
  const cited = new Set();
  const unconfirmedTrophies = new Set();

  for (const t of trophies) {
    for (const c of t.claims) {
      claims += 1;
      if (c.sources.length >= 2) twoPlus += 1;
      for (const n of c.sources) cited.add(n);
      if (UNCONFIRMED_RE.test(c.text)) unconfirmedTrophies.add(t.id);
    }
  }
  for (const stage of data.roadmap.stages) {
    for (const step of stage.steps) for (const n of step.sources) cited.add(n);
  }
  for (const row of data.missables.rows) {
    for (const n of row.sources) cited.add(n);
  }
  for (const d of data.disputes.disputes) {
    for (const n of [...d.sideA.sources, ...d.sideB.sources, ...d.verdictSources]) cited.add(n);
  }

  const pages = cited.size;
  const sites = new Set([...cited].map((n) => sourceDomain(data, n)).filter(Boolean)).size;
  const atRisk = data.missables.rows.filter((r) => r.status === "watch").length;
  const missable = trophies.filter((t) => t.missable).length;

  return {
    claims,
    twoPlus,
    pages,
    sites,
    disputes: data.disputes.disputes.length,
    missable,
    atRisk,
    unconfirmed: unconfirmedTrophies.size,
    earned: earnedCount(state),
    total: trophies.length,
    logged: loggedTotal(state),
  };
}

export function auditStripHtml(a) {
  return (
    `<b>${a.claims} claims cited</b> · <b>${a.twoPlus}</b> backed by 2+ sources · ` +
    `<b>${a.pages} sources</b> cited across <b>${a.sites} sites</b> · ` +
    `<b>${a.disputes} disputes</b> on record · ` +
    `<span class="warn">${a.missable} possibly missable</span> · ` +
    `<span class="warn">${a.atRisk} at-risk watch items</span> · ` +
    `<span class="warn">${a.unconfirmed} unconfirmed methods</span> · ` +
    `<span class="ok">${a.earned}/${a.total} trophies earned</span> · ` +
    `${a.logged} collectibles logged`
  );
}
