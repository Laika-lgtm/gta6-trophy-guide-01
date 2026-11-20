// Progress state: earned trophies + count-tracker values + view prefs.
// Kept in localStorage only; export/import move the same JSON around.
const KEY = "leonida-progress-v1";

export function blankState() {
  return { earned: {}, counters: {}, hideEarned: false, spoiler: false };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    return { ...blankState(), ...parsed, earned: parsed.earned || {}, counters: parsed.counters || {} };
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — progress just won't persist this session.
  }
}

// A realistic mid-game state for screenshots and demos (?demo=1).
export function demoState() {
  const state = blankState();
  for (const id of [2, 3, 8, 9, 15, 16, 20, 21, 24, 33, 35, 36, 47]) state.earned[id] = true;
  state.counters = {
    meditations: 6, vehicles: 42, stunts: 87, waink: 34, cardsets: 1,
    challenges: 12, rangeGolds: 5, droneTrials: 3, racesWon: 4, videogames: 2,
  };
  return state;
}

export function toggleEarned(state, id) {
  if (state.earned[id]) delete state.earned[id];
  else state.earned[id] = true;
  saveState(state);
}

export function bumpCounter(state, id, delta) {
  const cur = state.counters[id] || 0;
  state.counters[id] = Math.max(0, cur + delta);
  saveState(state);
}

export function setCounter(state, id, value) {
  state.counters[id] = Math.max(0, Math.round(value) || 0);
  saveState(state);
}

export function earnedCount(state) {
  return Object.keys(state.earned).length;
}

export function loggedTotal(state) {
  return Object.values(state.counters).reduce((a, b) => a + (b || 0), 0);
}
