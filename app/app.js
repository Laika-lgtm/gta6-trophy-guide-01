// Leonida Trophy Guide — tracker and renderer. Loads the trophy data, renders
// the checklist, and keeps earned ticks in localStorage. No network beyond the
// app's own files: the only fetch is the local data/trophies.json.

const STORAGE_KEY = 'leonida-trophy-guide-v1';
const KINDS = [
  ['all', 'All'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectible', 'Collectibles'],
  ['activity', 'Activities'],
  ['crime', 'Crime'],
  ['money', 'Money'],
];

const listEl = document.getElementById('trophy-list');
const resultLine = document.getElementById('result-line');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade-filter');
const hideEarnedEl = document.getElementById('hide-earned');
const spoilerEl = document.getElementById('spoiler-toggle');
const chipsEl = document.getElementById('kind-chips');

const state = {
  trophies: [],
  sources: {},
  earned: new Set(loadEarned()),
  kind: 'all',
  query: '',
};

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.earned].sort((a, b) => a - b)));
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function kindLabel(kind) {
  return { story: 'Story', collectible: 'Collectible', activity: 'Activity', crime: 'Crime', money: 'Money', platinum: 'Platinum' }[kind] ?? kind;
}

function trophyMatches(t) {
  if (state.kind === 'missable' && !t.missable) return false;
  if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && state.earned.has(t.id)) return false;
  if (state.query) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.target ?? ''}`.toLowerCase();
    if (!hay.includes(state.query)) return false;
  }
  return true;
}

function sourceLinks(t) {
  return t.src.map((key) => {
    const s = state.sources[key];
    if (!s) return key;
    return s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>` : s.name;
  }).join(', ');
}

function renderChips() {
  chipsEl.replaceChildren();
  for (const [kind, label] of KINDS) {
    const count = kind === 'all'
      ? state.trophies.length
      : kind === 'missable'
        ? state.trophies.filter((t) => t.missable).length
        : state.trophies.filter((t) => t.kind === kind).length;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (state.kind === kind ? ' active' : '');
    b.innerHTML = `${label} <span class="n">${count}</span>`;
    b.addEventListener('click', () => { state.kind = kind; renderChips(); renderList(); });
    chipsEl.append(b);
  }
}

function renderProgress() {
  const earned = state.earned.size;
  const total = state.trophies.length;
  document.getElementById('earned-count').textContent = earned;
  document.getElementById('progress-fill').style.width = total ? `${(earned / total) * 100}%` : '0%';
  document.getElementById('controls-progress').textContent = `${earned} / ${total} earned`;
  const byGrade = (g) => state.trophies.filter((t) => t.grade === g && state.earned.has(t.id)).length;
  document.getElementById('progress-detail').textContent =
    `${byGrade('platinum')} platinum · ${byGrade('gold')} gold · ${byGrade('silver')} silver · ${byGrade('bronze')} bronze`;
}

function renderList() {
  const shown = state.trophies.filter(trophyMatches);
  listEl.replaceChildren();
  resultLine.textContent = shown.length === state.trophies.length
    ? `Showing all ${state.trophies.length} trophies.`
    : `Showing ${shown.length} of ${state.trophies.length} trophies.`;
  if (!shown.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No trophies match these filters.';
    listEl.append(p);
    return;
  }
  for (const t of shown) {
    listEl.append(renderTrophy(t));
  }
}

function renderTrophy(t) {
  const card = document.createElement('article');
  card.className = 'trophy' + (state.earned.has(t.id) ? ' earned' : '') + (t.missable ? ' missable-flag' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} earned`);
  box.addEventListener('change', () => {
    if (box.checked) state.earned.add(t.id); else state.earned.delete(t.id);
    saveEarned();
    renderProgress();
    renderList();
  });
  card.append(box);

  const body = document.createElement('div');
  body.className = 'trophy-body';
  const spoilerHidden = spoilerEl.checked && t.hidden && !state.earned.has(t.id);
  const head = document.createElement('div');
  head.className = 'trophy-head';
  if (spoilerHidden) {
    head.innerHTML = `<h3>Hidden story trophy</h3><span class="grade ${t.grade}">${gradeLabel(t)}</span><span class="tag">Story</span>`;
  } else {
    head.innerHTML = `<h3></h3><span class="grade ${t.grade}">${gradeLabel(t)}</span><span class="tag">${kindLabel(t.kind)}</span>${t.missable ? '<span class="tag missable">⚠ Missable</span>' : ''}`;
    head.querySelector('h3').textContent = t.name;
  }
  body.append(head);

  if (spoilerHidden) {
    const p = document.createElement('p');
    p.className = 'spoiler-hidden';
    p.textContent = 'Name and description hidden until earned — turn off “Hide story spoilers” to reveal it.';
    body.append(p);
  } else {
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = t.description;
    body.append(desc);
    if (t.target) {
      const target = document.createElement('p');
      target.className = 'trophy-target';
      target.textContent = `Goal: ${t.target}`;
      body.append(target);
    }
    const guide = document.createElement('p');
    guide.className = 'trophy-guide';
    guide.textContent = t.guide;
    body.append(guide);
    const src = document.createElement('p');
    src.className = 'sources';
    const unconfirmed = t.id === 49 ? ' <span class="unconfirmed">Method unconfirmed — see source.</span>' : '';
    src.innerHTML = `Sources: ${sourceLinks(t)}${unconfirmed}`;
    body.append(src);
  }
  card.append(body);
  return card;
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ app: 'leonida-trophy-guide', earned: [...state.earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      state.earned = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
      saveEarned();
      renderProgress();
      renderList();
    } catch {
      alert('That file does not look like exported trophy progress.');
    }
  };
  reader.readAsText(file);
}

async function init() {
  const doc = await (await fetch('data/trophies.json')).json();
  state.trophies = doc.trophies;
  state.sources = doc.sources ?? {};
  renderChips();
  renderProgress();
  renderList();
  searchEl.addEventListener('input', () => { state.query = searchEl.value.trim().toLowerCase(); renderList(); });
  gradeEl.addEventListener('change', renderList);
  hideEarnedEl.addEventListener('change', renderList);
  spoilerEl.addEventListener('change', renderList);
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  document.getElementById('import-file').addEventListener('change', (e) => {
    if (e.target.files?.[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Clear all earned ticks?')) {
      state.earned = new Set();
      saveEarned();
      renderProgress();
      renderList();
    }
  });
}

init();
