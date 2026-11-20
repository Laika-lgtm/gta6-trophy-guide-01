// Data loading: fetches this app's own JSON files, nothing else.
// No network at runtime — every URL below is a relative path inside app/.
const FILES = ["trophies", "sources", "roadmap", "missables", "disputes", "counts"];

export async function loadData() {
  const data = {};
  for (const name of FILES) {
    const res = await fetch(`data/${name}.json`);
    if (!res.ok) throw new Error(`Could not load data/${name}.json`);
    data[name] = await res.json();
  }
  data.sourceById = new Map(data.sources.sources.map((s) => [s.n, s]));
  data.trophyById = new Map(data.trophies.trophies.map((t) => [t.id, t]));
  return data;
}

export function sourceName(data, n) {
  const s = data.sourceById.get(n);
  return s ? s.name : `Source ${n}`;
}

export function sourceUrl(data, n) {
  const s = data.sourceById.get(n);
  return s ? s.url : "";
}

export function sourceDomain(data, n) {
  try {
    return new URL(sourceUrl(data, n)).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Renders [1][7] style markers as small superscript links into the Sources tab.
export function citeMarks(data, sources) {
  return sources
    .map((n) => `<sup class="cite"><a href="#sources" data-src="${n}">[${n}]</a></sup>`)
    .join("");
}

export function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
