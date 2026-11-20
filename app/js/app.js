// App boot: loads the data, routes by hash, and wires the tracker controls.
// Routes: #/tracker (default), #/trophy/<id>, #/roadmap, #/sources, #/missables.
import { loadTrophyData } from "./data.js";
import {
  renderHeaderFacts,
  renderTrackerView,
  renderTrophyDetail,
  renderRoadmapView,
  renderSourcesView,
  renderMissablesView,
} from "./views.js";
import {
  loadProgress,
  saveProgress,
  seedDemoProgress,
  isDemoSeeded,
  exportProgressFile,
  parseImportedProgress,
  resetProgress,
} from "./store.js";

const viewEl = document.getElementById("view");
const headerFactsEl = document.getElementById("headerFacts");
let trophies = [];
let meta = null;
let progress = loadProgress();
let openGuideId = null;

function setActiveNav(route) {
  document.querySelectorAll(".mainnav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === route);
  });
}

function render() {
  const hash = window.location.hash || "#/tracker";
  const parts = hash.replace(/^#\//, "").split("/");
  const route = parts[0] || "tracker";
  if (route === "trophy") {
    const id = Number(parts[1]);
    const trophy = trophies.find((t) => t.id === id);
    setActiveNav("tracker");
    if (!trophy) {
      viewEl.innerHTML = '<div class="error-box"><h2>Trophy not found</h2><p><a href="#/tracker">Back to tracker</a></p></div>';
      return;
    }
    viewEl.innerHTML = renderTrophyDetail(trophy, meta, progress);
    return;
  }
  if (route === "roadmap") {
    setActiveNav("roadmap");
    viewEl.innerHTML = renderRoadmapView(meta);
    return;
  }
  if (route === "sources") {
    setActiveNav("sources");
    viewEl.innerHTML = renderSourcesView(trophies, meta, progress);
    return;
  }
  if (route === "missables") {
    setActiveNav("missables");
    viewEl.innerHTML = renderMissablesView(trophies, meta);
    return;
  }
  setActiveNav("tracker");
  viewEl.innerHTML = renderTrackerView(trophies, meta, progress, openGuideId);
}

function rerender() {
  saveProgress(progress);
  render();
}

function toggleEarned(id, checked) {
  if (checked) {
    if (!progress.earned.includes(id)) progress.earned.push(id);
  } else {
    progress.earned = progress.earned.filter((n) => n !== id);
  }
  rerender();
}

function bindGlobalEvents() {
  viewEl.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches("[data-earn]")) {
      toggleEarned(Number(target.dataset.earn), target.checked);
      return;
    }
    if (target.id === "hideEarned") {
      progress.hideEarned = target.checked;
      rerender();
      return;
    }
    if (target.id === "spoilerToggle") {
      progress.spoiler = target.checked;
      rerender();
      return;
    }
    if (target.id === "importFile" && target.files && target.files[0]) {
      const file = target.files[0];
      file.text().then((text) => {
        try {
          progress.earned = parseImportedProgress(text);
          rerender();
        } catch (err) {
          alert("Could not import that file: " + err.message);
        }
      });
    }
  });
  viewEl.addEventListener("input", (event) => {
    if (event.target.id === "searchBox") {
      progress.query = event.target.value;
      render();
      const box = document.getElementById("searchBox");
      if (box) {
        box.focus();
        box.setSelectionRange(box.value.length, box.value.length);
      }
    }
  });
  viewEl.addEventListener("click", (event) => {
    const kindBtn = event.target.closest("[data-kind]");
    if (kindBtn) {
      progress.kind = kindBtn.dataset.kind;
      rerender();
      return;
    }
    const gradeBtn = event.target.closest("[data-grade]");
    if (gradeBtn) {
      progress.grade = gradeBtn.dataset.grade;
      rerender();
      return;
    }
    if (event.target.id === "exportBtn") {
      exportProgressFile(progress);
      return;
    }
    if (event.target.id === "resetBtn") {
      if (confirm("Reset all progress? This clears every earned trophy.")) {
        progress = resetProgress();
        rerender();
      }
    }
  });
  window.addEventListener("hashchange", render);
}

async function bootLeonidaGuide() {
  try {
    if (isDemoSeeded()) progress = seedDemoProgress();
    const params = new URLSearchParams(window.location.search);
    const guideParam = Number(params.get("guide"));
    if (Number.isInteger(guideParam) && guideParam >= 1 && guideParam <= 55) openGuideId = guideParam;
    const data = await loadTrophyData();
    trophies = data.trophies;
    meta = data.meta;
    headerFactsEl.innerHTML = renderHeaderFacts(meta);
    bindGlobalEvents();
    render();
  } catch (err) {
    viewEl.innerHTML =
      '<div class="error-box"><h2>The guide could not load its data</h2><p>' +
      String(err.message || err).replace(/</g, "&lt;") +
      "</p><p>Open this app from its own folder (app/index.html served over http) so data/trophies.json can load.</p></div>";
  }
}

bootLeonidaGuide();
