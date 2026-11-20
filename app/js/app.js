// Boot and wiring for the GTA VI trophy guide & tracker.
import { loadData } from "./data.js";
import {
  loadState,
  saveState,
  setEarned,
  exportState,
  importState,
  resetState,
} from "./store.js";
import {
  renderTrophies,
  renderProgress,
  renderRoadmap,
  renderSources,
  renderAudit,
} from "./views.js";

const $ = (id) => document.getElementById(id);

async function main() {
  const { trophies, meta } = await loadData();
  let state = loadState();

  const listEl = $("trophy-list");
  const countEl = $("result-count");
  const emptyEl = $("empty-state");
  const fillEl = $("progress-fill");
  const textEl = $("progress-text");
  const searchEl = $("search");
  const hideEarnedEl = $("hide-earned");
  const spoilerEl = $("spoiler");

  // Restore saved toolbar state into the controls.
  searchEl.value = state.search;
  hideEarnedEl.checked = state.hideEarned;
  spoilerEl.checked = state.spoiler;
  document.querySelectorAll("#kind-chips .chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.kind === state.kind);
  });
  document.querySelectorAll("#grade-chips .chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.grade === state.grade);
  });

  function renderAll() {
    renderTrophies(trophies, state, listEl, countEl, emptyEl);
    renderProgress(state, trophies.length, fillEl, textEl);
  }

  // Tabs.
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".view").forEach((view) => {
        view.hidden = view.id !== `view-${tab.dataset.view}`;
        view.classList.toggle("active", view.id === `view-${tab.dataset.view}`);
      });
    });
  });

  // Toolbar: search, kind and grade chips, hide-earned and spoiler toggles.
  searchEl.addEventListener("input", () => {
    state = { ...state, search: searchEl.value };
    saveState(state);
    renderAll();
  });
  document.querySelectorAll("#kind-chips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#kind-chips .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state = { ...state, kind: chip.dataset.kind };
      saveState(state);
      renderAll();
    });
  });
  document.querySelectorAll("#grade-chips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#grade-chips .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state = { ...state, grade: chip.dataset.grade };
      saveState(state);
      renderAll();
    });
  });
  hideEarnedEl.addEventListener("change", () => {
    state = { ...state, hideEarned: hideEarnedEl.checked };
    saveState(state);
    renderAll();
  });
  spoilerEl.addEventListener("change", () => {
    state = { ...state, spoiler: spoilerEl.checked };
    saveState(state);
    renderAll();
  });

  // Earned checkboxes and "show guide" toggles (event delegation — the list re-renders).
  listEl.addEventListener("change", (event) => {
    const box = event.target.closest("[data-earn]");
    if (!box) return;
    state = setEarned(state, Number(box.dataset.earn), box.checked);
    renderAll();
  });
  listEl.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-toggle]");
    if (!btn) return;
    const card = btn.closest(".card");
    const wrap = card.querySelector(".steps-wrap");
    const open = wrap.hidden;
    wrap.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Hide numbered guide" : "Show numbered guide";
  });

  // Export / import / reset.
  $("export-btn").addEventListener("click", () => exportState(state));
  $("import-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      state = await importState(file);
      searchEl.value = state.search;
      hideEarnedEl.checked = state.hideEarned;
      spoilerEl.checked = state.spoiler;
      renderAll();
    } catch (err) {
      alert(err.message);
    }
    event.target.value = "";
  });
  $("reset-btn").addEventListener("click", () => {
    if (!confirm("Reset all progress? This clears every trophy you marked earned.")) return;
    state = resetState();
    searchEl.value = "";
    hideEarnedEl.checked = false;
    spoilerEl.checked = false;
    document.querySelectorAll("#kind-chips .chip").forEach((c) => {
      c.classList.toggle("active", c.dataset.kind === "all");
    });
    document.querySelectorAll("#grade-chips .chip").forEach((c) => {
      c.classList.toggle("active", c.dataset.grade === "all");
    });
    renderAll();
  });

  renderRoadmap(meta, $("roadmap"), $("checklist100"));
  renderSources(meta, document.querySelector("#source-table tbody"), $("disagreements"));
  renderAudit(trophies, meta, $("audit"));
  renderAll();

  // Deep links: #roadmap, #sources and #audit switch tabs; #trophy-<id>
  // opens that trophy's numbered guide on the checklist and scrolls to it.
  // Useful for sharing a link to one trophy's method.
  const hash = location.hash.replace(/^#/, "");
  if (["roadmap", "sources", "audit"].includes(hash)) {
    document.querySelector(`.tab[data-view="${hash}"]`).click();
    document.querySelector("main").scrollIntoView();
  } else {
    const match = hash.match(/^trophy-(\d+)$/);
    if (match) {
      const card = listEl.querySelector(`.card[data-id="${match[1]}"]`);
      if (card) {
        const wrap = card.querySelector(".steps-wrap");
        const btn = card.querySelector("[data-toggle]");
        if (wrap && btn) {
          wrap.hidden = false;
          btn.setAttribute("aria-expanded", "true");
          btn.textContent = "Hide numbered guide";
        }
        card.scrollIntoView();
      }
    }
  }
}

main().catch((err) => {
  document.getElementById("trophy-list").innerHTML =
    `<p class="empty-state">The guide data could not be loaded: ${err.message}</p>`;
});
