// LEONIDA Trophy Guide — offline tracker for GTA VI's 55 PS5 trophies.
// Loads data/trophies.json (same origin, no network), renders the checklist,
// and saves progress in localStorage with export / import.

const DATA_URL = "data/trophies.json";
const STORAGE_KEY = "gta6-trophy-guide-v1";

const KIND_LABELS = {
  all: "All",
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
  crime: "Crime",
  money: "Money",
  platinum: "Platinum",
};

let allTrophies = [];
let earnedIds = new Set();
let activeKind = "all";
let activeGrade = "all";
let searchText = "";
let hideEarned = false;
let hideSpoilers = false;

const grid = document.getElementById("trophyGrid");
const statusLine = document.getElementById("listStatus");
const showingCount = document.getElementById("showingCount");

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    return new Set((ids || []).filter((id) => Number.isInteger(id)));
  } catch (err) {
    return new Set();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: [...earnedIds].sort((a, b) => a - b) }));
  } catch (err) {
    // Storage full or blocked: progress still shows until reload.
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gradeBadge(grade) {
  return `<span class="badge badge-${grade}">${grade}</span>`;
}

function kindTag(kind) {
  return `<span class="kind-tag">${KIND_LABELS[kind] || kind}</span>`;
}

function spoilerHidden(trophy) {
  return hideSpoilers && trophy.kind === "story" && !earnedIds.has(trophy.id);
}

function renderTrophyCard(trophy) {
  const earned = earnedIds.has(trophy.id);
  const hidden = spoilerHidden(trophy);
  const card = document.createElement("article");
  card.className = "trophy-card" + (earned ? " earned" : "");
  card.dataset.trophyId = String(trophy.id);

  const name = hidden ? "Hidden story trophy" : escapeHtml(trophy.name);
  const desc = hidden
    ? `<p class="trophy-desc spoiler-hidden">Hidden until earned — turn off “Hide story spoilers” to reveal it.</p>`
    : `<p class="trophy-desc">${escapeHtml(trophy.description)}</p>`;
  const goal = hidden ? "" : `<p class="trophy-goal"><strong>Goal:</strong> ${escapeHtml(trophy.goal)}</p>`;
  const guide = hidden ? "" : `<p class="trophy-guide">${escapeHtml(trophy.guide)}</p>`;
  const sources = hidden
    ? ""
    : `<p class="trophy-sources">Sources: ${trophy.sources
        .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>`)
        .join("")}</p>`;
  const missable = trophy.missable ? `<span class="missable-tag">&#9888; Missable</span>` : "";
  const unconfirmed = trophy.unconfirmed
    ? `<p class="unconfirmed-note">Unconfirmed: no published guide has verified how this unlocks yet — see the guide text and cited sources before chasing it.</p>`
    : "";

  card.innerHTML = `
    <input class="trophy-check" type="checkbox" ${earned ? "checked" : ""} aria-label="Mark ${escapeHtml(trophy.name)} as earned">
    <h3 class="trophy-name">${name}${gradeBadge(trophy.grade)}${kindTag(trophy.kind)}${missable}</h3>
    ${desc}
    ${goal}
    ${guide}
    ${sources}
    ${unconfirmed}`;
  card.querySelector(".trophy-check").addEventListener("change", (event) => {
    toggleEarned(trophy.id, event.target.checked);
  });
  return card;
}

function trophyMatches(trophy) {
  if (activeKind !== "all" && trophy.kind !== activeKind) return false;
  if (activeGrade !== "all" && trophy.grade !== activeGrade) return false;
  if (hideEarned && earnedIds.has(trophy.id)) return false;
  if (searchText) {
    // A spoiler-hidden story trophy must not leak through search: its name,
    // description, goal and guide are hidden, so only its visible grade/kind
    // labels may match.
    if (spoilerHidden(trophy)) {
      const visible = `${trophy.grade} ${trophy.kind}`.toLowerCase();
      if (!visible.includes(searchText)) return false;
    } else {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.goal} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(searchText)) return false;
    }
  }
  return true;
}

function renderTrophyList() {
  grid.innerHTML = "";
  const visible = allTrophies.filter(trophyMatches);
  if (visible.length === 0) {
    grid.innerHTML = `<p class="empty-state">No trophies match this filter. Try clearing the search or choosing another kind.</p>`;
  } else {
    for (const trophy of visible) grid.appendChild(renderTrophyCard(trophy));
  }
  statusLine.textContent = `Showing ${visible.length} of 55 trophies.`;
  showingCount.textContent = `${earnedIds.size} / 55 earned`;
}

function updateProgress() {
  const total = allTrophies.length || 55;
  const earned = earnedIds.size;
  document.getElementById("earnedCount").textContent = String(earned);
  document.getElementById("progressFill").style.width = `${(earned / total) * 100}%`;
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of allTrophies) {
    if (earnedIds.has(trophy.id)) counts[trophy.grade] += 1;
  }
  document.getElementById("gradeCounts").textContent =
    `${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`;
}

function renderKindChips() {
  const container = document.getElementById("kindChips");
  container.innerHTML = "";
  const kinds = ["all", "story", "missable", "collectibles", "activities", "crime", "money", "platinum"];
  for (const kind of kinds) {
    const count = kind === "all" ? allTrophies.length : allTrophies.filter((t) => t.kind === kind).length;
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = `${KIND_LABELS[kind]} ${count}`;
    chip.setAttribute("aria-pressed", String(kind === activeKind));
    chip.addEventListener("click", () => {
      activeKind = kind;
      renderKindChips();
      renderTrophyList();
    });
    container.appendChild(chip);
  }
}

function toggleEarned(id, checked) {
  if (checked) earnedIds.add(id);
  else earnedIds.delete(id);
  saveProgress();
  updateProgress();
  renderTrophyList();
}

function downloadFile(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportProgress() {
  downloadFile(
    "gta6-trophy-progress.json",
    JSON.stringify({ game: "Grand Theft Auto VI", earned: [...earnedIds].sort((a, b) => a - b) }, null, 2),
  );
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error("no earned list");
      const valid = new Set(allTrophies.map((t) => t.id));
      earnedIds = new Set(ids.filter((id) => valid.has(id)));
      saveProgress();
      updateProgress();
      renderTrophyList();
    } catch (err) {
      alert("That file is not a progress export from this guide.");
    }
  };
  reader.readAsText(file);
}

function resetProgress() {
  if (window.confirm("Clear all earned trophies?")) {
    earnedIds = new Set();
    saveProgress();
    updateProgress();
    renderTrophyList();
  }
}

function bindControls() {
  document.getElementById("searchBox").addEventListener("input", (event) => {
    searchText = event.target.value.trim().toLowerCase();
    renderTrophyList();
  });
  document.getElementById("gradeFilter").addEventListener("change", (event) => {
    activeGrade = event.target.value;
    renderTrophyList();
  });
  document.getElementById("hideEarned").addEventListener("change", (event) => {
    hideEarned = event.target.checked;
    renderTrophyList();
  });
  document.getElementById("hideSpoilers").addEventListener("change", (event) => {
    hideSpoilers = event.target.checked;
    renderTrophyList();
  });
  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importProgress(file);
    event.target.value = "";
  });
  document.getElementById("resetBtn").addEventListener("click", resetProgress);
}

async function loadTrophies() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`could not load ${DATA_URL}`);
  const data = await response.json();
  allTrophies = data.trophies || data;
  earnedIds = loadProgress();
  renderKindChips();
  bindControls();
  updateProgress();
  renderTrophyList();
}

loadTrophies().catch((err) => {
  grid.innerHTML = `<p class="empty-state">Could not load the trophy list (${escapeHtml(err.message)}). Check that data/trophies.json is present and reload.</p>`;
});
