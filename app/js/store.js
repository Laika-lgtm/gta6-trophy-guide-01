// Progress store for the GTA VI trophy tracker.
// Progress lives only in this browser (localStorage) — nothing is sent anywhere.
// Shape: { earned: { [trophyId]: true }, hideEarned: bool, spoiler: bool, search: "", kind: "all", grade: "all" }
const KEY = "gta6-trophy-guide-progress-v1";

function blank() {
  return {
    earned: {},
    hideEarned: false,
    spoiler: false,
    search: "",
    kind: "all",
    grade: "all",
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return blank();
    return { ...blank(), ...parsed, earned: parsed.earned || {} };
  } catch {
    return blank();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode): progress just won't persist.
  }
}

export function setEarned(state, id, earned) {
  const next = { ...state, earned: { ...state.earned } };
  if (earned) {
    next.earned[id] = true;
  } else {
    delete next.earned[id];
  }
  saveState(next);
  return next;
}

export function earnedCount(state) {
  return Object.keys(state.earned).length;
}

// Export: download the current progress as a JSON file. The format marker
// lets import reject files that were never a progress export.
export function exportState(state) {
  const blob = new Blob(
    [JSON.stringify({ format: "gta6-trophy-guide-progress-v1", ...state }, null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gta6-trophy-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Import: read a previously exported JSON file. Returns the parsed state
// or throws a friendly error when the file is not a valid progress export.
export async function importState(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || typeof parsed.earned !== "object") {
    throw new Error("That file is not a GTA VI trophy progress export.");
  }
  if (parsed.format && parsed.format !== "gta6-trophy-guide-progress-v1") {
    throw new Error("That file is a different export format, not a trophy progress export.");
  }
  const state = { ...blank(), ...parsed, earned: {} };
  for (const [id, value] of Object.entries(parsed.earned)) {
    const n = Number(id);
    if (Number.isInteger(n) && n >= 1 && n <= 55 && value === true) {
      state.earned[n] = true;
    }
  }
  saveState(state);
  return state;
}

export function resetState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to remove.
  }
  return blank();
}
