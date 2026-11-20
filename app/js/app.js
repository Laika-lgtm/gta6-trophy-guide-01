// Boot + router + toolbar wiring. Keeps no data of its own.
import { loadData } from "./data.js";
import { loadState, saveState, demoState, toggleEarned, bumpCounter, earnedCount, loggedTotal } from "./store.js";
import { computeAudit, auditStripHtml } from "./audit.js";
import { renderTracker, renderRoadmap, renderMissables, renderSources } from "./views.js";

let data = null;
let state = null;
let selected = 28;
let tab = "tracker";
let query = "";
let kind = "";
let grade = "";

const view = document.getElementById("view");
const auditStrip = document.getElementById("auditStrip");
const earnedCountEl = document.getElementById("earnedCount");
const earnedBarEl = document.getElementById("earnedBar");
const loggedCountEl = document.getElementById("loggedCount");

function refreshChrome() {
  const a = computeAudit(data, state);
  auditStrip.innerHTML = auditStripHtml(a);
  earnedCountEl.textContent = a.earned;
  earnedBarEl.style.width = `${(a.earned / a.total) * 100}%`;
  loggedCountEl.textContent = `${a.logged} collectibles logged`;
  document.title = `LEONIDA Trophy Guide: 55 trophies, ${a.claims} cited claims, ${a.twoPlus} backed by 2+ sources, ${a.pages} sources read, count trackers, chapter missable grid`;
}

function render() {
  document.querySelectorAll(".tab").forEach((el) => el.classList.toggle("active", el.dataset.tab === tab));
  if (tab === "roadmap") view.innerHTML = renderRoadmap(data);
  else if (tab === "missables") view.innerHTML = renderMissables(data);
  else if (tab === "sources") view.innerHTML = renderSources(data);
  else view.innerHTML = renderTracker(data, state, { selected, query, kind, grade });
}

function rerender() {
  refreshChrome();
  render();
}

function goToTab(next, anchor) {
  tab = next;
  location.hash = next;
  rerender();
  if (anchor) {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ block: "center" });
  }
}

function initRouter() {
  const read = () => {
    const h = location.hash.replace(/^#/, "");
    tab = ["tracker", "roadmap", "missables", "sources"].includes(h) ? h : "tracker";
    rerender();
  };
  window.addEventListener("hashchange", read);
  read();
}

function initToolbar() {
  const search = document.getElementById("searchBox");
  const kindSel = document.getElementById("kindFilter");
  const gradeSel = document.getElementById("gradeFilter");
  const hideBox = document.getElementById("hideEarned");
  const spoilerBox = document.getElementById("spoilerToggle");
  hideBox.checked = state.hideEarned;
  spoilerBox.checked = state.spoiler;
  search.addEventListener("input", () => { query = search.value; tab = "tracker"; render(); });
  kindSel.addEventListener("change", () => { kind = kindSel.value; tab = "tracker"; render(); });
  gradeSel.addEventListener("change", () => { grade = gradeSel.value; tab = "tracker"; render(); });
  hideBox.addEventListener("change", () => { state.hideEarned = hideBox.checked; saveState(state); render(); });
  spoilerBox.addEventListener("change", () => { state.spoiler = spoilerBox.checked; saveState(state); render(); });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leonida-trophy-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      state = { ...state, ...parsed, earned: parsed.earned || {}, counters: parsed.counters || {} };
      saveState(state);
      hideBox.checked = state.hideEarned;
      spoilerBox.checked = state.spoiler;
      rerender();
    } catch {
      auditStrip.textContent = "That file was not a valid progress export — nothing was changed.";
    }
    e.target.value = "";
  });
}

function initClicks() {
  view.addEventListener("click", (e) => {
    // Citation links: switch to the Sources tab and jump to the source.
    const cite = e.target.closest("a[data-src]");
    if (cite) {
      e.preventDefault();
      goToTab("sources", `src-${cite.dataset.src}`);
      return;
    }
    // Counter +/- buttons.
    const cb = e.target.closest("button[data-counter]");
    if (cb) {
      bumpCounter(state, cb.dataset.counter, Number(cb.dataset.delta));
      refreshChrome();
      render();
      return;
    }
    // Earned checkboxes inside rows (stop the row click from also selecting).
    const eb = e.target.closest("input[data-earned]");
    if (eb) {
      e.stopPropagation();
      toggleEarned(state, Number(eb.dataset.earned));
      refreshChrome();
      render();
      return;
    }
    // Trophy row selection.
    const row = e.target.closest("[data-trophy]");
    if (row) {
      selected = Number(row.dataset.trophy);
      render();
    }
  });
}

async function boot() {
  try {
    data = await loadData();
  } catch (err) {
    view.innerHTML = `<p>Could not load the guide data. ${err.message} — the app needs its own data files in app/data/.</p>`;
    return;
  }
  state = new URLSearchParams(location.search).get("demo") === "1" ? demoState() : loadState();
  if (new URLSearchParams(location.search).get("demo") === "1") saveState(state);
  initToolbar();
  initClicks();
  initRouter();
}

boot();
