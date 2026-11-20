// Progress store: earned trophies, spoiler and filter settings in localStorage,
// plus export / import / reset. Nothing leaves the browser.
export const STORAGE_KEY = "leonida-trophy-guide-v2";
export const DEMO_EARNED_IDS = [2, 3, 4, 8, 15, 16, 20, 21, 28, 32, 35, 42, 44];

export function defaultProgress() {
  return { earned: [], spoiler: true, hideEarned: false, kind: "all", grade: "all", query: "" };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    const base = defaultProgress();
    return {
      earned: Array.isArray(parsed.earned) ? [...new Set(parsed.earned.filter((n) => Number.isInteger(n)))] : base.earned,
      spoiler: typeof parsed.spoiler === "boolean" ? parsed.spoiler : base.spoiler,
      hideEarned: typeof parsed.hideEarned === "boolean" ? parsed.hideEarned : base.hideEarned,
      kind: typeof parsed.kind === "string" ? parsed.kind : base.kind,
      grade: typeof parsed.grade === "string" ? parsed.grade : base.grade,
      query: "",
    };
  } catch (err) {
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  const toSave = {
    earned: progress.earned,
    spoiler: progress.spoiler,
    hideEarned: progress.hideEarned,
    kind: progress.kind,
    grade: progress.grade,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

export function seedDemoProgress() {
  const progress = defaultProgress();
  progress.earned = DEMO_EARNED_IDS.slice();
  progress.spoiler = false;
  saveProgress(progress);
  return progress;
}

export function isDemoSeeded() {
  return new URLSearchParams(window.location.search).has("demo");
}

export function exportProgressFile(progress) {
  const payload = { app: "LEONIDA Trophy Guide", version: 2, exportedAt: new Date().toISOString(), earned: progress.earned };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "leonida-trophy-progress.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  const earned = Array.isArray(parsed.earned) ? parsed.earned : parsed;
  if (!Array.isArray(earned)) throw new Error("No earned list found in file.");
  const ids = earned.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
  return ids;
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return defaultProgress();
}
