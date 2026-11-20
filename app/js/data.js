// Data loading for the GTA VI trophy guide.
// The app is static and offline once loaded: two JSON files under app/data/
// carry every trophy, the roadmap, the source matrix and the disagreements.
const DATA_DIR = new URL("../data/", import.meta.url);

async function loadJson(name) {
  const res = await fetch(new URL(name, DATA_DIR));
  if (!res.ok) {
    throw new Error(`Could not load ${name} (${res.status})`);
  }
  return res.json();
}

export async function loadData() {
  const [trophiesDoc, meta] = await Promise.all([
    loadJson("trophies.json"),
    loadJson("meta.json"),
  ]);
  // The guide is only complete with all 55 trophies — fail loudly instead
  // of rendering a partial list.
  if (!Array.isArray(trophiesDoc.trophies) || trophiesDoc.trophies.length !== 55) {
    throw new Error(
      `Expected 55 trophies, got ${trophiesDoc.trophies?.length ?? 0}`,
    );
  }
  return { trophies: trophiesDoc.trophies, meta };
}
