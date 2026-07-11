/* app.js — routeur + écrans (design rose/clair, style maquette Figma) */

const App = document.getElementById('app');

/* ---------- helpers ---------- */
function h(html) {
  const t = document.createElement('template'); t.innerHTML = html.trim();
  return t.content.children.length === 1 ? t.content.firstElementChild : t.content;
}
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function todayISO() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function fmtDate(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }); }
function fmtDateFull(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); }
function go(hash) { location.hash = hash; }
function daysAgo(iso) { const [y, m, d] = iso.split('-').map(Number); return Math.floor((Date.now() - new Date(y, m - 1, d).getTime()) / 86400000); }
function fmtNum(n) { return Math.round(n).toLocaleString('fr-FR'); }

let _toastTimer;
function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false; clearTimeout(_toastTimer); _toastTimer = setTimeout(() => (t.hidden = true), 1900); }
function setTab(name) { document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name)); }

/* en-tête d'écran réutilisable */
function head(title, opts = {}) {
  const back = opts.back ? `<button class="back" aria-label="Retour">‹</button>` : '';
  const action = opts.action ? `<button class="head-action">${esc(opts.action)}</button>` : '';
  const el = h(`<div class="screen-head">${back}<h1>${esc(title)}</h1>${action}</div>`);
  if (opts.back) el.querySelector('.back').onclick = () => history.back();
  if (opts.action && opts.onAction) el.querySelector('.head-action').onclick = opts.onAction;
  return el;
}

/* petites icônes SVG (stroke) pour tiles & lignes */
const ICO = {
  flame: '<path d="M12 3c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4 0 2 2 2 2 4"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  bolt: '<path d="M13 3 5 13h5l-1 8 8-11h-5z"/>',
  fire: '<path d="M12 3c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4 0 2 2 2 2 4"/>',
  cal: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M4 9h16M8 3v4M16 3v4"/>',
  trophy: '<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M12 13v4M9 21h6M7 5H4v2a4 4 0 0 0 3 3M17 5h3v2a4 4 0 0 1-3 3"/>',
  up: '<path d="M4 15l6-6 4 4 6-7"/>',
  weight: '<path d="M4 9v6M20 9v6M7 7v10M17 7v10M8 12h8"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  dl: '<path d="M12 4v10m0 0 4-4m-4 4-4-4M5 20h14"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  moon: '<path d="M20 14a8 8 0 1 1-9-9 6 6 0 0 0 9 9z"/>',
  bell: '<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0"/>',
  edit: '<path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M13 5l4 4"/>',
};
function svgIco(name, cls = '') { return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px">${ICO[name] || ''}</svg>`; }

/* silhouette du corps avec muscle actif surligné */
function silhouette(group) {
  const g = (group || '').toLowerCase();
  const on = (keys) => keys.some((k) => g.includes(k)) ? 'var(--pink)' : 'var(--pink-soft)';
  const chest = on(['pect']); const arms = on(['tricep', 'bicep', 'bras']);
  const sh = on(['épaul', 'epaul']); const legs = on(['jambe', 'quad', 'ischio', 'mollet', 'fessier']);
  const abs = on(['abdo']); const back = on(['dos']);
  const torso = back !== 'var(--pink-soft)' ? back : 'var(--pink-soft)';
  return `<svg class="silhouette" viewBox="0 0 60 96" fill="none">
    <circle cx="30" cy="12" r="9" fill="var(--pink-soft)"/>
    <rect x="14" y="23" width="10" height="9" rx="4" fill="${sh}"/>
    <rect x="36" y="23" width="10" height="9" rx="4" fill="${sh}"/>
    <rect x="22" y="24" width="16" height="14" rx="5" fill="${chest !== 'var(--pink-soft)' ? chest : torso}"/>
    <rect x="23" y="39" width="14" height="13" rx="5" fill="${abs}"/>
    <rect x="13" y="33" width="8" height="22" rx="4" fill="${arms}"/>
    <rect x="39" y="33" width="8" height="22" rx="4" fill="${arms}"/>
    <rect x="23" y="53" width="7" height="30" rx="3.5" fill="${legs}"/>
    <rect x="30" y="53" width="7" height="30" rx="3.5" fill="${legs}"/>
  </svg>`;
}

/* ---------- routeur ---------- */
const routes = [];
function route(pattern, handler) {
  const keys = [];
  const rx = new RegExp('^' + pattern.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$');
  routes.push({ rx, keys, handler });
}
async function render() {
  const path = (location.hash || '#/home').slice(1);
  for (const r of routes) {
    const m = path.match(r.rx);
    if (m) {
      const params = {}; r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      App.innerHTML = ''; window.scrollTo(0, 0);
      try { await r.handler(params); } catch (e) { console.error(e); App.appendChild(h(`<div class="empty">Erreur : ${esc(e.message)}</div>`)); }
      return;
    }
  }
  go('#/home');
}
window.addEventListener('hashchange', render);

/* ============================================================
   agrégats
   ============================================================ */
async function loadAll() {
  const [allWorkouts, sets, exercises] = await Promise.all([Repo.allWorkouts(), DB.getAll('sets'), Repo.allExercises()]);
  const exById = Object.fromEntries(exercises.map((e) => [e.id, e]));
  // on ignore les séances sans aucune série loggée (démarrées puis abandonnées)
  const withSets = new Set(sets.map((s) => s.workout_id));
  const workouts = allWorkouts.filter((w) => withSets.has(w.id));
  const wById = Object.fromEntries(allWorkouts.map((w) => [w.id, w]));
  return { workouts, allWorkouts, sets, exercises, exById, wById };
}
function workoutStats(wid, sets) {
  const ws = sets.filter((s) => s.workout_id === wid);
  const volume = ws.reduce((a, s) => a + s.weight_kg * s.reps, 0);
  const exCount = new Set(ws.map((s) => s.exercise_id)).size;
  return { volume, exCount, setCount: ws.length, sets: ws };
}
/* séance(s) détenant le record de charge pour chaque exercice → badge "Nouveau record" */
function prWorkouts(sets) {
  const bestByEx = {}; // exId -> {weight, wid}
  for (const s of sets) {
    const b = bestByEx[s.exercise_id];
    if (!b || s.weight_kg > b.weight) bestByEx[s.exercise_id] = { weight: s.weight_kg, wid: s.workout_id };
  }
  return new Set(Object.values(bestByEx).map((b) => b.wid));
}
function weekStart(d = new Date()) { const day = (d.getDay() + 6) % 7; const m = new Date(d); m.setDate(d.getDate() - day); m.setHours(0, 0, 0, 0); return m; }

/* ============================================================
   ACCUEIL
   ============================================================ */
route('/home', async () => {
  setTab('home');
  const { workouts, sets, exById } = await loadAll();
  const goal = getSettings().goal;

  // salutation
  const name = getSettings().name || 'toi';
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  App.appendChild(h(`<div class="row-between" style="margin-bottom:18px">
    <div><div class="greet-date" style="text-transform:capitalize">${dateStr}</div>
    <div class="greet-name">Bonjour, ${esc(name)} <span style="font-weight:400">👋</span></div></div>
    <div class="avatar">${esc((name[0] || 'B').toUpperCase())}</div></div>`));

  // hero : séance suggérée
  const sug = await suggestTemplate(workouts);
  const heroSub = sug.template
    ? `${sug.count} exercice${sug.count > 1 ? 's' : ''}${sug.muscles ? ' · ' + sug.muscles : ''}`
    : 'Démarre quand tu veux';
  const hero = h(`<div class="hero">
    <div class="h-label">SÉANCE DU JOUR</div>
    <div class="h-title">${esc(sug.template ? sug.template.name : 'Séance libre')}</div>
    <div class="h-sub">${esc(heroSub)}</div>
    <button class="h-btn">▶  Commencer l'entraînement</button></div>`);
  hero.querySelector('.h-btn').onclick = () => createWorkout(sug.template);
  App.appendChild(hero);

  // stats de la semaine
  const wkStart = weekStart();
  const inWeek = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) >= wkStart; };
  const weekWorkouts = workouts.filter((w) => inWeek(w.date));
  const weekVol = sets.filter((s) => weekWorkouts.some((w) => w.id === s.workout_id)).reduce((a, s) => a + s.weight_kg * s.reps, 0);
  const weekSetCount = sets.filter((s) => weekWorkouts.some((w) => w.id === s.workout_id)).length;
  const streak = computeStreak(workouts);

  App.appendChild(h(`<div class="tiles">
    <div class="tile"><div class="ico">${svgIco('cal')}</div><div class="t-label">Séances</div><div class="t-val">${weekWorkouts.length} <small>/ ${goal}</small></div></div>
    <div class="tile"><div class="ico">${svgIco('weight')}</div><div class="t-label">Volume (semaine)</div><div class="t-val">${fmtNum(weekVol)} <small>kg</small></div></div>
    <div class="tile"><div class="ico">${svgIco('bolt')}</div><div class="t-label">Séries (semaine)</div><div class="t-val">${weekSetCount}</div></div>
    <div class="tile"><div class="ico">${svgIco('fire')}</div><div class="t-label">Série consécutive</div><div class="t-val">${streak} <small>${streak > 1 ? 'sem.' : 'sem.'}</small></div></div>
  </div>`));

  // progression hebdo (volume/jour)
  const dayVols = [0, 0, 0, 0, 0, 0, 0];
  for (const w of weekWorkouts) { const [y, m, d] = w.date.split('-').map(Number); const idx = (new Date(y, m - 1, d).getDay() + 6) % 7; dayVols[idx] += workoutStats(w.id, sets).volume; }
  const chartCard = h(`<div class="card" style="margin-top:16px">
    <div class="row-between"><div class="card-title">Progression hebdomadaire</div><div class="card-sub">Cette semaine</div></div>
    <div class="ch"></div></div>`);
  chartCard.querySelector('.ch').appendChild(lineChart(dayVols, ['L', 'M', 'M', 'J', 'V', 'S', 'D'], { area: true }));
  App.appendChild(chartCard);

  // conseil du jour
  const tips = [
    'Bois 500 ml d\'eau 30 min avant ta séance pour une performance optimale.',
    'En sèche, vise à garder tes charges : c\'est le meilleur signal de préservation musculaire.',
    'Note ton RPE : au-delà de 9 sur les séries de base, la fatigue s\'accumule vite.',
    'Priorise le sommeil : la récupération fait la progression, surtout en déficit.',
    'Échauffe-toi avec 1-2 séries légères avant ta série lourde.',
  ];
  const tip = tips[new Date().getDate() % tips.length];
  App.appendChild(h(`<div class="card" style="background:var(--pink-soft);display:flex;gap:14px;align-items:flex-start;box-shadow:none">
    <div class="ico" style="width:36px;height:36px;border-radius:50%;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;flex:none">★</div>
    <div><div class="card-title" style="font-size:15px">Conseil du jour</div><div class="card-sub" style="color:var(--pink-text);opacity:.85">${esc(tip)}</div></div>
  </div>`));

  // accès calendrier
  const calBtn = h(`<button class="btn secondary" style="margin-top:4px">📅  Voir le calendrier</button>`);
  calBtn.onclick = () => go('#/calendar');
  App.appendChild(calBtn);
});

async function suggestTemplate(workouts) {
  const templates = await Repo.allTemplates();
  if (!templates.length) return { template: null };
  // template le moins récemment fait
  const lastByTpl = {};
  for (const w of workouts) if (w.template_id) lastByTpl[w.template_id] = Math.max(lastByTpl[w.template_id] || 0, w.date.localeCompare('') ? Date.parse(w.date) : 0);
  templates.sort((a, b) => (lastByTpl[a.id] || 0) - (lastByTpl[b.id] || 0));
  const t = templates[0];
  const exos = await Promise.all((t.exercise_ids || []).map((id) => Repo.getExercise(id)));
  const muscles = [...new Set(exos.filter(Boolean).map((e) => e.muscle_group))].slice(0, 2).join(' & ');
  return { template: t, count: (t.exercise_ids || []).length, muscles };
}
function computeStreak(workouts) {
  // nombre de semaines consécutives (jusqu'à cette semaine) avec ≥1 séance
  if (!workouts.length) return 0;
  const weeks = new Set(workouts.map((w) => { const [y, m, d] = w.date.split('-').map(Number); return +weekStart(new Date(y, m - 1, d)); }));
  let streak = 0; let cur = +weekStart();
  while (weeks.has(cur)) { streak++; cur -= 7 * 86400000; }
  return streak;
}

async function createWorkout(template) {
  const w = { date: todayISO(), template_id: template ? template.id : null, name: template ? template.name : 'Séance libre', notes: '' };
  await Repo.saveWorkout(w);
  if (template && template.exercise_ids) localStorage.setItem('planned:' + w.id, JSON.stringify(template.exercise_ids));
  go('#/workout/' + w.id);
}

/* ============================================================
   ENTRAÎNEMENT (hub : reprendre / démarrer)
   ============================================================ */
route('/train', async () => {
  setTab('train');
  App.appendChild(head('Entraînement'));
  const workouts = await Repo.allWorkouts();
  const today = workouts.find((w) => w.date === todayISO());

  if (today) {
    const st = workoutStats(today.id, await DB.getAll('sets'));
    const card = h(`<div class="hero">
      <div class="h-label">SÉANCE EN COURS</div>
      <div class="h-title">${esc(today.name || 'Séance libre')}</div>
      <div class="h-sub">${st.exCount} exercice${st.exCount > 1 ? 's' : ''} · ${st.setCount} série${st.setCount > 1 ? 's' : ''} loggée${st.setCount > 1 ? 's' : ''}</div>
      <button class="h-btn">Reprendre la séance</button></div>`);
    card.querySelector('.h-btn').onclick = () => go('#/workout/' + today.id);
    App.appendChild(card);
  }

  App.appendChild(h(`<div class="section-title">Nouvelle séance</div>`));
  const free = h(`<button class="btn secondary" style="margin-bottom:14px">➕  Séance libre</button>`);
  free.onclick = () => createWorkout(null);
  App.appendChild(free);

  const templates = await Repo.allTemplates();
  App.appendChild(h(`<div class="section-title">Depuis un modèle</div>`));
  if (!templates.length) {
    App.appendChild(h(`<div class="empty">Aucun modèle.<br><a href="#/template-edit/new">Créer un modèle</a> (Push, Pull, Legs…)</div>`));
  } else {
    const rows = h(`<div class="rows"></div>`);
    for (const t of templates) {
      const row = h(`<div class="row"><div class="r-ico">${svgIco('list')}</div><div class="grow"><div class="r-title">${esc(t.name)}</div><div class="r-sub">${(t.exercise_ids || []).length} exercice(s)</div></div><span class="chev">›</span></div>`);
      row.onclick = () => createWorkout(t);
      rows.appendChild(row);
    }
    App.appendChild(rows);
  }
});

/* ============================================================
   SÉANCE ACTIVE — paginée, un exercice à la fois
   ============================================================ */
route('/workout/:id', (p) => renderWorkout(p.id, 0));
route('/workout/:id/:idx', (p) => renderWorkout(p.id, parseInt(p.idx, 10) || 0));

async function renderWorkout(wid, idx) {
  setTab('train');
  const w = await Repo.getWorkout(wid);
  if (!w) { App.appendChild(h(`<div class="empty">Séance introuvable.</div>`)); return; }
  const allSets = await DB.getAllByIndex('sets', 'workout_id', wid);
  const planned = getPlanned(wid);
  const used = [...new Set(allSets.map((s) => s.exercise_id))];
  const order = [...planned]; for (const id of used) if (!order.includes(id)) order.push(id);

  // en-tête + progression
  const total = Math.max(order.length, 1);
  const hd = h(`<div class="screen-head"><button class="back">‹</button><h1 style="font-size:22px">${esc(w.name || 'Séance')}</h1>
    <span class="muted" style="font-weight:700">${order.length ? (idx + 1) + ' / ' + total : ''}</span></div>`);
  hd.querySelector('.back').onclick = () => go('#/home');
  App.appendChild(hd);
  App.appendChild(h(`<div class="progress"><i style="width:${order.length ? ((idx + 1) / total) * 100 : 0}%"></i></div>`));

  if (!order.length) {
    App.appendChild(h(`<div class="empty">Aucun exercice.<br>Ajoute ton premier exercice.</div>`));
    const add = h(`<button class="btn">➕  Ajouter un exercice</button>`);
    add.onclick = () => pickExercise(async (exId) => { await addPlanned(wid, exId); renderScreen(); });
    App.appendChild(add);
    finishRow();
    return;
  }

  idx = Math.min(Math.max(idx, 0), order.length - 1);
  const exId = order[idx];
  const ex = await Repo.getExercise(exId);
  const exSets = allSets.filter((s) => s.exercise_id === exId).sort((a, b) => a.set_number - b.set_number);
  const last = await Repo.lastSessionOfExercise(exId, wid);

  // carte exercice
  const card = h(`<div class="card">
    <div class="exo-card-head">
      <div class="grow"><div class="label">${esc(ex.muscle_group || '')}</div>
        <div class="card-title" style="font-size:20px;margin-top:2px">${esc(ex.name)}</div>
        <div class="card-sub">${exSets.length ? exSets.length + ' série(s) faite(s)' : (last ? 'Dernière fois : ' + last.sets.map((s) => s.weight_kg + '×' + s.reps).join(', ') : 'Premier passage 💪')}</div>
      </div>
      ${silhouette(ex.muscle_group)}
    </div>
    <div class="steppers"></div>
    <div class="set-list"></div>
  </div>`);
  App.appendChild(card);

  // pré-remplissage
  let pw = 20, pr = 8;
  if (exSets.length) { const l = exSets[exSets.length - 1]; pw = l.weight_kg; pr = l.reps; }
  else if (last && last.sets.length) { const l = last.sets[last.sets.length - 1]; pw = l.weight_kg; pr = l.reps; }

  const steppers = card.querySelector('.steppers');
  steppers.appendChild(makeStepper('Poids (kg)', pw, 2.5, 0));
  steppers.appendChild(makeStepper('Répétitions', pr, 1, 0));
  const wVal = steppers.children[0].querySelector('.s-val');
  const rVal = steppers.children[1].querySelector('.s-val');

  // liste des séries loggées
  const setList = card.querySelector('.set-list');
  exSets.forEach((s) => {
    const t = last ? trendVsLast(s, last) : { cls: 'flat', sym: '' };
    const pill = h(`<div class="set-pill done ${s.failed ? 'failed' : ''}">
      <span class="radio"></span><span class="s-name">Série ${s.set_number}</span>
      <span class="trend ${t.cls}">${t.sym}</span>
      <span class="s-perf">${s.weight_kg} kg × ${s.reps}</span>
      <button class="del">✕</button></div>`);
    pill.querySelector('.del').onclick = async () => { await Repo.deleteSet(s.id); renderScreen(); };
    setList.appendChild(pill);
  });
  // bouton ajouter série
  const addSet = h(`<button class="btn" style="margin-top:6px">＋  Ajouter la série ${exSets.length + 1}</button>`);
  addSet.onclick = async () => {
    const weight = parseFloat(wVal.value), reps = parseInt(rVal.value, 10);
    if (isNaN(weight) || isNaN(reps)) { toast('Renseigne poids et reps'); return; }
    const s = { workout_id: wid, exercise_id: exId, set_number: exSets.length + 1, weight_kg: weight, reps, rpe: null, failed: false };
    await Repo.saveSet(s);
    if (last) { const t = trendVsLast(s, last); toast(t.cls === 'up' ? '📈 Progression !' : t.cls === 'down' ? '📉 En baisse' : '➡️ Stable'); } else toast('Série enregistrée');
    renderScreen();
  };
  card.appendChild(addSet);

  // navigation exercices
  const nav = h(`<div class="btn-row" style="margin-top:8px"></div>`);
  if (idx > 0) { const prev = h(`<button class="btn outline">Précédent</button>`); prev.onclick = () => go(`#/workout/${wid}/${idx - 1}`); nav.appendChild(prev); }
  if (idx < order.length - 1) { const next = h(`<button class="btn">Exercice suivant</button>`); next.onclick = () => go(`#/workout/${wid}/${idx + 1}`); nav.appendChild(next); }
  else { const fin = h(`<button class="btn">✅  Terminer la séance</button>`); fin.onclick = () => go('#/home'); nav.appendChild(fin); }
  App.appendChild(nav);

  const addExo = h(`<button class="btn secondary" style="margin-top:12px">➕  Ajouter un exercice</button>`);
  addExo.onclick = () => pickExercise(async (id) => { await addPlanned(wid, id); go(`#/workout/${wid}/${order.length}`); });
  App.appendChild(addExo);

  const delBtn = h(`<button class="btn danger" style="margin-top:12px">🗑️  Supprimer la séance</button>`);
  delBtn.onclick = async () => { if (confirm('Supprimer cette séance et ses séries ?')) { await Repo.deleteWorkout(wid); go('#/home'); } };
  App.appendChild(delBtn);

  function renderScreen() { App.innerHTML = ''; renderWorkout(wid, idx); }
  function finishRow() { const fin = h(`<button class="btn secondary" style="margin-top:12px">Retour à l'accueil</button>`); fin.onclick = () => go('#/home'); App.appendChild(fin); }
}

function makeStepper(label, value, step, min) {
  const el = h(`<div class="stepper"><div class="s-label">${esc(label)}</div>
    <div class="s-row"><button class="s-btn minus">−</button>
    <input class="s-val" type="number" inputmode="decimal" value="${value}">
    <button class="s-btn plus">＋</button></div></div>`);
  const val = el.querySelector('.s-val');
  el.querySelector('.minus').onclick = () => { const v = Math.max(min, (parseFloat(val.value) || 0) - step); val.value = trimNum(v); };
  el.querySelector('.plus').onclick = () => { const v = (parseFloat(val.value) || 0) + step; val.value = trimNum(v); };
  return el;
}
function trimNum(v) { return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100); }

function trendVsLast(set, last) {
  if (!last || !last.sets.length) return { cls: 'flat', sym: '' };
  const same = last.sets.filter((s) => s.reps === set.reps && !s.failed);
  let cur, ref;
  if (same.length) { ref = Math.max(...same.map((s) => s.weight_kg)); cur = set.weight_kg; }
  else { ref = Math.max(...last.sets.filter((s) => !s.failed).map((s) => e1RM(s.weight_kg, s.reps))); cur = e1RM(set.weight_kg, set.reps); }
  const eps = 0.01;
  if (cur > ref + eps) return { cls: 'up', sym: '▲' };
  if (cur < ref - eps) return { cls: 'down', sym: '▼' };
  return { cls: 'flat', sym: '=' };
}

function getPlanned(wid) { try { return JSON.parse(localStorage.getItem('planned:' + wid)) || []; } catch { return []; } }
async function addPlanned(wid, exId) { const list = getPlanned(wid); if (!list.includes(exId)) { list.push(exId); localStorage.setItem('planned:' + wid, JSON.stringify(list)); } }

/* ============================================================
   STATS
   ============================================================ */
route('/stats', async () => {
  setTab('stats');
  App.appendChild(head('Statistiques'));
  const { workouts, sets, exById } = await loadAll();
  if (!sets.length) { App.appendChild(h(`<div class="empty">Pas encore de données.<br>Logge quelques séances pour voir tes stats 📊</div>`)); return; }

  const volTotal = sets.reduce((a, s) => a + s.weight_kg * s.reps, 0);
  const chargeMax = Math.max(...sets.map((s) => s.weight_kg));
  const oneRM = Math.max(...sets.map((s) => e1RM(s.weight_kg, s.reps)));
  App.appendChild(h(`<div class="tiles three">
    <div class="tile center"><div class="ico">${svgIco('up')}</div><div class="t-val">${fmtNum(volTotal)}</div><div class="t-label">Volume total (kg)</div></div>
    <div class="tile center"><div class="ico">${svgIco('bolt')}</div><div class="t-val">${trimNum(chargeMax)}</div><div class="t-label">Charge max (kg)</div></div>
    <div class="tile center"><div class="ico">${svgIco('trophy')}</div><div class="t-val">${Math.round(oneRM)}</div><div class="t-label">1RM estimé (kg)</div></div>
  </div>`));

  // volume mensuel (6 derniers mois)
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), label: d.toLocaleDateString('fr-FR', { month: 'short' }), v: 0 }); }
  for (const s of sets) { const w = workouts.find((x) => x.id === s.workout_id); if (!w) continue; const key = w.date.slice(0, 7); const mo = months.find((m) => m.key === key); if (mo) mo.v += s.weight_kg * s.reps; }
  const withData = months.filter((m) => m.v > 0);
  const baseline = withData.length ? withData[0].v : 0;
  const lastM = months[months.length - 1].v;
  let badge = '';
  if (withData.length >= 2 && baseline > 0) {
    const pct = ((lastM - baseline) / baseline) * 100;
    badge = `<span class="badge ${pct >= 0 ? 'green' : ''}">${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct).toFixed(0)}%</span>`;
  }
  const volCard = h(`<div class="card">
    <div class="row-between"><div><div class="card-title">Volume mensuel</div><div class="card-sub">Progression sur 6 mois</div></div>
    ${badge}</div>
    <div class="ch"></div></div>`);
  volCard.querySelector('.ch').appendChild(lineChart(months.map((m) => m.v), months.map((m) => m.label), { area: true }));
  App.appendChild(volCard);

  // volume hebdomadaire (par jour, cette semaine)
  const wkStart = weekStart();
  const dayVols = [0, 0, 0, 0, 0, 0, 0];
  for (const s of sets) { const w = workouts.find((x) => x.id === s.workout_id); if (!w) continue; const [y, mm, dd] = w.date.split('-').map(Number); const dt = new Date(y, mm - 1, dd); if (dt >= wkStart) dayVols[(dt.getDay() + 6) % 7] += s.weight_kg * s.reps; }
  const barCard = h(`<div class="card"><div class="card-title">Volume hebdomadaire</div><div class="card-sub">${fmtNum(dayVols.reduce((a, b) => a + b, 0))} kg cette semaine</div><div class="ch"></div></div>`);
  barCard.querySelector('.ch').appendChild(barChart(dayVols, ['L', 'M', 'M', 'J', 'V', 'S', 'D']));
  App.appendChild(barCard);

  // répartition par muscle + objectif
  const byMuscle = {};
  for (const s of sets) { const ex = exById[s.exercise_id]; const g = ex ? ex.muscle_group : 'Autre'; byMuscle[g] = (byMuscle[g] || 0) + s.weight_kg * s.reps; }
  const segs = Object.entries(byMuscle).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const goal = getSettings().goal;
  const weekCount = workouts.filter((w) => { const [y, m, d] = w.date.split('-').map(Number); return new Date(y, m - 1, d) >= wkStart; }).length;

  const twoUp = h(`<div class="tiles" style="align-items:stretch"></div>`);
  const muscleCard = h(`<div class="card" style="margin:0"><div class="card-title" style="font-size:15px;margin-bottom:8px">Muscles</div><div class="dn" style="display:flex;justify-content:center"></div></div>`);
  muscleCard.querySelector('.dn').appendChild(donut(segs));
  const goalCard = h(`<div class="card" style="margin:0"><div class="card-title" style="font-size:15px;margin-bottom:8px">Objectif</div><div class="rg" style="display:flex;flex-direction:column;align-items:center"></div></div>`);
  goalCard.querySelector('.rg').appendChild(ring(weekCount, goal));
  goalCard.querySelector('.rg').appendChild(h(`<div class="card-sub" style="margin-top:6px">séances cette semaine</div>`));
  twoUp.appendChild(muscleCard); twoUp.appendChild(goalCard);
  App.appendChild(twoUp);
});

/* ============================================================
   HISTORIQUE
   ============================================================ */
route('/history', async () => {
  setTab('history');
  App.appendChild(head('Historique', { action: 'Calendrier', onAction: () => go('#/calendar') }));
  const { workouts, sets, exById } = await loadAll();
  if (!workouts.length) { App.appendChild(h(`<div class="empty">Aucune séance enregistrée.</div>`)); return; }
  const prs = prWorkouts(sets);

  for (const w of workouts) {
    const st = workoutStats(w.id, sets);
    const muscles = [...new Set(st.sets.map((s) => (exById[s.exercise_id] || {}).muscle_group).filter(Boolean))];
    const when = w.date === todayISO() ? "Aujourd'hui" : daysAgo(w.date) === 1 ? 'Hier' : fmtDate(w.date);
    const card = h(`<div class="card">
      <div class="row-between" style="margin-bottom:12px">
        <div><div class="card-title" style="display:inline-flex;align-items:center;gap:8px">${esc(w.name || 'Séance libre')}
          ${prs.has(w.id) ? '<span class="badge pr">🏆 Nouveau record</span>' : ''}</div>
          <div class="card-sub" style="text-transform:capitalize">${when}</div></div>
      </div>
      <div class="tiles three" style="gap:8px">
        <div class="tile center" style="padding:12px"><div class="t-val" style="font-size:18px">${st.exCount}</div><div class="t-label">Exercices</div></div>
        <div class="tile center" style="padding:12px"><div class="t-val" style="font-size:18px">${st.setCount}</div><div class="t-label">Séries</div></div>
        <div class="tile center" style="padding:12px"><div class="t-val" style="font-size:18px">${fmtNum(st.volume)}</div><div class="t-label">Volume kg</div></div>
      </div>
      ${muscles.length ? `<div style="margin-top:12px;display:flex;gap:14px;flex-wrap:wrap">${muscles.map((m) => `<span class="pill-tag">${esc(m)}</span>`).join('')}</div>` : ''}
    </div>`);
    card.onclick = () => go('#/workout/' + w.id);
    App.appendChild(card);
  }
});

/* ============================================================
   PROFIL / RÉGLAGES
   ============================================================ */
route('/profile', async () => {
  setTab('profile');
  App.appendChild(head('Profil'));
  const s = getSettings();
  const { workouts, sets } = await loadAll();
  const volTotal = sets.reduce((a, x) => a + x.weight_kg * x.reps, 0);
  const prs = prWorkouts(sets).size;

  // en-tête profil
  App.appendChild(h(`<div style="text-align:center;margin-bottom:18px">
    <div class="avatar" style="width:76px;height:76px;font-size:30px;margin:0 auto 12px">${esc((s.name || 'B')[0].toUpperCase())}</div>
    <div style="font-size:22px;font-weight:800">${esc(s.name || 'Boris')}</div>
    <div class="badge pink" style="margin-top:8px">Objectif ${esc(s.goalLabel || 'Sèche 2026')}</div>
  </div>`));

  // bannière objectif
  App.appendChild(h(`<div class="hero" style="box-shadow:var(--shadow-sm)">
    <div class="h-label">OBJECTIF</div>
    <div class="h-title">${esc(s.goalLabel || 'Sèche & force')}</div>
    <div class="h-sub">${s.goal} séances / semaine</div></div>`));

  // stats
  App.appendChild(h(`<div class="tiles three">
    <div class="tile center"><div class="t-val">${workouts.length}</div><div class="t-label">Séances</div></div>
    <div class="tile center"><div class="t-val">${fmtNum(volTotal)}</div><div class="t-label">Volume total</div></div>
    <div class="tile center"><div class="t-val">${prs}</div><div class="t-label">Records</div></div>
  </div>`));

  // préférences
  App.appendChild(h(`<div class="section-title">Préférences</div>`));
  const prefs = h(`<div class="rows">
    <div class="row"><div class="r-ico">${svgIco('moon')}</div><div class="grow"><div class="r-title">Mode sombre</div></div>
      <div class="toggle ${s.dark ? 'on' : ''}" id="tgDark"><i></i></div></div>
    <div class="row" id="rowGoal"><div class="r-ico">${svgIco('target')}</div><div class="grow"><div class="r-title">Objectif hebdomadaire</div><div class="r-sub">${s.goal} séances / semaine</div></div><span class="chev">›</span></div>
    <div class="row" id="rowName"><div class="r-ico">${svgIco('edit')}</div><div class="grow"><div class="r-title">Ton prénom</div><div class="r-sub">${esc(s.name || 'Boris')}</div></div><span class="chev">›</span></div>
  </div>`);
  App.appendChild(prefs);
  prefs.querySelector('#tgDark').onclick = () => { s.dark = !s.dark; saveSettings(s); applyTheme(s.dark); render(); };
  prefs.querySelector('#rowGoal').onclick = () => { const v = parseInt(prompt('Objectif de séances par semaine ?', s.goal), 10); if (v > 0) { s.goal = v; saveSettings(s); render(); } };
  prefs.querySelector('#rowName').onclick = () => { const v = prompt('Ton prénom ?', s.name || 'Boris'); if (v != null) { s.name = v.trim(); saveSettings(s); render(); } };

  // données & paramètres
  App.appendChild(h(`<div class="section-title">Données & paramètres</div>`));
  const rows = h(`<div class="rows">
    <div class="row" data-go="#/export"><div class="r-ico">${svgIco('dl')}</div><div class="grow"><div class="r-title">Exporter les données</div><div class="r-sub">CSV / Markdown pour le projet Claude</div></div><span class="chev">›</span></div>
    <div class="row" data-go="#/exercises"><div class="r-ico">${svgIco('weight')}</div><div class="grow"><div class="r-title">Gérer les exercices</div></div><span class="chev">›</span></div>
    <div class="row" data-go="#/templates"><div class="r-ico">${svgIco('list')}</div><div class="grow"><div class="r-title">Gérer les modèles</div></div><span class="chev">›</span></div>
  </div>`);
  rows.querySelectorAll('[data-go]').forEach((r) => (r.onclick = () => go(r.dataset.go)));
  App.appendChild(rows);
});

/* réglages en localStorage */
function getSettings() { try { return Object.assign({ name: 'Boris', goal: 4, goalLabel: 'Sèche 2026', dark: false }, JSON.parse(localStorage.getItem('settings') || '{}')); } catch { return { name: 'Boris', goal: 4, goalLabel: 'Sèche 2026', dark: false }; } }
function saveSettings(s) { localStorage.setItem('settings', JSON.stringify(s)); }
function applyTheme(dark) { document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light'); }

/* ============================================================
   DÉTAIL EXERCICE
   ============================================================ */
route('/exercise/:id', async (p) => {
  setTab('profile');
  const ex = await Repo.getExercise(p.id);
  if (!ex) { App.appendChild(h(`<div class="empty">Exercice introuvable.</div>`)); return; }
  App.appendChild(head(ex.name, { back: true, action: '✏️', onAction: () => go('#/exercise-edit/' + ex.id) }));
  App.appendChild(h(`<div class="label gray" style="margin:-8px 2px 14px">${esc(ex.muscle_group || '')}</div>`));
  if (ex.notes) App.appendChild(h(`<div class="card">📝 ${esc(ex.notes)}</div>`));

  const allSets = await Repo.setsOfExercise(ex.id);
  if (!allSets.length) { App.appendChild(h(`<div class="empty">Aucune série enregistrée.</div>`)); return; }
  const workouts = await Repo.allWorkouts();
  const wById = Object.fromEntries(workouts.map((w) => [w.id, w]));
  const byW = {}; for (const s of allSets) (byW[s.workout_id] ||= []).push(s);
  const sessions = Object.entries(byW).map(([wid, ss]) => ({ w: wById[wid], sets: ss.sort((a, b) => a.set_number - b.set_number) })).filter((x) => x.w).sort((a, b) => b.w.date.localeCompare(a.w.date));

  const prWeight = Math.max(...allSets.map((s) => s.weight_kg));
  const prVol = Math.max(...allSets.map((s) => s.weight_kg * s.reps));
  const pr1 = Math.max(...allSets.map((s) => e1RM(s.weight_kg, s.reps)));
  App.appendChild(h(`<div class="tiles three">
    <div class="tile center"><div class="t-val">${trimNum(prWeight)}<small> kg</small></div><div class="t-label">Charge max</div></div>
    <div class="tile center"><div class="t-val">${fmtNum(prVol)}</div><div class="t-label">Volume max</div></div>
    <div class="tile center"><div class="t-val">${Math.round(pr1)}</div><div class="t-label">1RM estimé</div></div>
  </div>`));

  const chrono = [...sessions].reverse();
  const card = h(`<div class="card"><div class="card-title">Progression (1RM estimé)</div><div class="ch"></div></div>`);
  card.querySelector('.ch').appendChild(lineChart(chrono.map((s) => Math.max(...s.sets.map((x) => e1RM(x.weight_kg, x.reps)))), chrono.map((s) => fmtDate(s.w.date).slice(0, 6)), { area: true, dots: true }));
  App.appendChild(card);

  App.appendChild(h(`<div class="section-title">Historique</div>`));
  for (const s of sessions) {
    const lines = s.sets.map((x) => `${x.weight_kg}×${x.reps}${x.rpe ? ' @' + x.rpe : ''}${x.failed ? ' ✗' : ''}`).join('  ·  ');
    const vol = s.sets.reduce((a, x) => a + x.weight_kg * x.reps, 0);
    const it = h(`<div class="card" style="padding:14px 16px"><div class="row-between"><div><div style="font-weight:700">${fmtDate(s.w.date)}</div><div class="card-sub">${esc(lines)}</div></div><span class="badge">${fmtNum(vol)} kg</span></div></div>`);
    it.onclick = () => go('#/workout/' + s.w.id);
    App.appendChild(it);
  }
});

/* ============================================================
   EXERCICES (liste + édition)
   ============================================================ */
route('/exercises', async () => {
  setTab('profile');
  App.appendChild(head('Exercices', { back: true, action: '＋ Ajouter', onAction: () => go('#/exercise-edit/new') }));
  const exos = await Repo.allExercises();
  const search = h(`<input class="inp" placeholder="Rechercher un exercice…" style="margin-bottom:14px">`);
  App.appendChild(search);
  const wrap = h(`<div></div>`); App.appendChild(wrap);
  const groups = {}; for (const e of exos) (groups[e.muscle_group || 'Autre'] ||= []).push(e);
  function draw(f = '') {
    wrap.innerHTML = ''; f = f.toLowerCase();
    for (const g of Object.keys(groups).sort((a, b) => a.localeCompare(b, 'fr'))) {
      const items = groups[g].filter((e) => e.name.toLowerCase().includes(f));
      if (!items.length) continue;
      wrap.appendChild(h(`<div class="section-title">${esc(g)}</div>`));
      const rows = h(`<div class="rows"></div>`);
      for (const e of items) {
        const row = h(`<div class="row"><div class="grow"><div class="r-title">${esc(e.name)}</div>${e.notes ? `<div class="r-sub">${esc(e.notes)}</div>` : ''}</div>${e.custom ? '<span class="badge">perso</span>' : ''}<span class="chev">›</span></div>`);
        row.onclick = () => go('#/exercise/' + e.id); rows.appendChild(row);
      }
      wrap.appendChild(rows);
    }
    if (!wrap.children.length) wrap.appendChild(h(`<div class="empty">Aucun exercice trouvé.</div>`));
  }
  draw(); search.oninput = () => draw(search.value);
});

route('/exercise-edit/:id', async (p) => {
  setTab('profile');
  const isNew = p.id === 'new';
  const ex = isNew ? { name: '', muscle_group: 'Pectoraux', notes: '' } : await Repo.getExercise(p.id);
  if (!ex) { App.appendChild(h(`<div class="empty">Introuvable.</div>`)); return; }
  App.appendChild(head(isNew ? 'Nouvel exercice' : 'Modifier', { back: true }));
  const opts = MUSCLE_GROUPS.map((g) => `<option ${g === ex.muscle_group ? 'selected' : ''}>${g}</option>`).join('');
  const form = h(`<div>
    <label class="fld">Nom</label><input class="inp f-name" value="${esc(ex.name)}" placeholder="Ex : Développé couché">
    <label class="fld">Groupe musculaire</label><select class="inp f-group">${opts}</select>
    <label class="fld">Notes (optionnel)</label><textarea class="inp f-notes" placeholder="Ex : prise large, banc incliné 30°">${esc(ex.notes || '')}</textarea>
    <button class="btn" style="margin-top:18px" id="save">Enregistrer</button>
    ${!isNew ? '<button class="btn danger" style="margin-top:10px" id="del">Supprimer</button>' : ''}</div>`);
  App.appendChild(form);
  form.querySelector('#save').onclick = async () => {
    const name = form.querySelector('.f-name').value.trim(); if (!name) { toast('Le nom est requis'); return; }
    ex.name = name; ex.muscle_group = form.querySelector('.f-group').value; ex.notes = form.querySelector('.f-notes').value.trim();
    await Repo.saveExercise(ex); toast('Enregistré'); history.back();
  };
  const del = form.querySelector('#del'); if (del) del.onclick = async () => { if (confirm('Supprimer cet exercice ?')) { await Repo.deleteExercise(ex.id); go('#/exercises'); } };
});

/* ============================================================
   MODÈLES
   ============================================================ */
route('/templates', async () => {
  setTab('profile');
  App.appendChild(head('Modèles', { back: true, action: '＋ Ajouter', onAction: () => go('#/template-edit/new') }));
  const templates = await Repo.allTemplates();
  if (!templates.length) { App.appendChild(h(`<div class="empty">Aucun modèle.<br>Crée tes séances types (Push, Pull, Legs…).</div>`)); return; }
  const rows = h(`<div class="rows"></div>`);
  for (const t of templates) {
    const row = h(`<div class="row"><div class="r-ico">${svgIco('list')}</div><div class="grow"><div class="r-title">${esc(t.name)}</div><div class="r-sub">${(t.exercise_ids || []).length} exercice(s)</div></div><span class="chev">›</span></div>`);
    row.onclick = () => go('#/template-edit/' + t.id); rows.appendChild(row);
  }
  App.appendChild(rows);
});

route('/template-edit/:id', async (p) => {
  setTab('profile');
  const isNew = p.id === 'new';
  const t = isNew ? { name: '', exercise_ids: [] } : await Repo.getTemplate(p.id);
  if (!t) { App.appendChild(h(`<div class="empty">Introuvable.</div>`)); return; }
  t.exercise_ids = t.exercise_ids || [];
  App.appendChild(head(isNew ? 'Nouveau modèle' : 'Modifier', { back: true }));
  App.appendChild(h(`<label class="fld">Nom du modèle</label>`));
  const nameIn = h(`<input class="inp t-name" value="${esc(t.name)}" placeholder="Ex : Push">`); App.appendChild(nameIn);
  App.appendChild(h(`<div class="section-title">Exercices</div>`));
  const listWrap = h(`<div></div>`); App.appendChild(listWrap);
  const addBtn = h(`<button class="btn secondary" style="margin-top:6px">➕  Ajouter un exercice</button>`); App.appendChild(addBtn);
  const saveBtn = h(`<button class="btn" style="margin-top:16px">Enregistrer</button>`); App.appendChild(saveBtn);
  if (!isNew) { const d = h(`<button class="btn danger" style="margin-top:10px">Supprimer le modèle</button>`); App.appendChild(d); d.onclick = async () => { if (confirm('Supprimer ce modèle ?')) { await Repo.deleteTemplate(t.id); go('#/templates'); } }; }

  async function drawList() {
    listWrap.innerHTML = '';
    if (!t.exercise_ids.length) { listWrap.appendChild(h(`<div class="muted" style="padding:6px 2px">Aucun exercice ajouté.</div>`)); return; }
    const rows = h(`<div class="rows"></div>`);
    for (let i = 0; i < t.exercise_ids.length; i++) {
      const ex = await Repo.getExercise(t.exercise_ids[i]); if (!ex) { t.exercise_ids.splice(i, 1); i--; continue; }
      const idx = i;
      const row = h(`<div class="row"><div class="grow"><div class="r-title">${esc(ex.name)}</div><div class="r-sub">${esc(ex.muscle_group || '')}</div></div>
        <button class="btn small secondary up">▲</button><button class="btn small secondary rm">✕</button></div>`);
      row.querySelector('.up').onclick = (e) => { e.stopPropagation(); if (idx > 0) { [t.exercise_ids[idx - 1], t.exercise_ids[idx]] = [t.exercise_ids[idx], t.exercise_ids[idx - 1]]; drawList(); } };
      row.querySelector('.rm').onclick = (e) => { e.stopPropagation(); t.exercise_ids.splice(idx, 1); drawList(); };
      rows.appendChild(row);
    }
    listWrap.appendChild(rows);
  }
  drawList();
  addBtn.onclick = () => pickExercise((exId) => { t.exercise_ids.push(exId); drawList(); });
  saveBtn.onclick = async () => { const name = nameIn.value.trim(); if (!name) { toast('Nom requis'); return; } t.name = name; await Repo.saveTemplate(t); toast('Enregistré'); history.back(); };
});

/* ============================================================
   CALENDRIER
   ============================================================ */
let calCursor = null;
route('/calendar', async () => {
  setTab('history');
  App.appendChild(head('Calendrier', { back: true }));
  const now = new Date();
  if (!calCursor) calCursor = { y: now.getFullYear(), m: now.getMonth() };
  const workouts = await Repo.allWorkouts();
  const trained = {}; for (const w of workouts) (trained[w.date] ||= []).push(w);
  const cnt7 = workouts.filter((w) => daysAgo(w.date) < 7).length;
  const cnt30 = workouts.filter((w) => daysAgo(w.date) < 30).length;
  const card = h(`<div class="card"></div>`); App.appendChild(card);

  function draw() {
    card.innerHTML = '';
    const { y, m } = calCursor;
    const monthName = new Date(y, m, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const head2 = h(`<div class="cal-head"><button class="nav prev">‹</button><strong>${monthName}</strong><button class="nav next">›</button></div>`);
    head2.querySelector('.prev').onclick = () => { calCursor.m--; if (calCursor.m < 0) { calCursor.m = 11; calCursor.y--; } draw(); };
    head2.querySelector('.next').onclick = () => { calCursor.m++; if (calCursor.m > 11) { calCursor.m = 0; calCursor.y++; } draw(); };
    card.appendChild(head2);
    const grid = h(`<div class="cal-grid"></div>`);
    ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((d) => grid.appendChild(h(`<div class="cal-dow">${d}</div>`)));
    const startPad = (new Date(y, m, 1).getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < startPad; i++) grid.appendChild(h(`<div class="cal-day empty"></div>`));
    for (let d = 1; d <= days; d++) {
      const iso = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      const t = trained[iso]; const isToday = iso === todayISO();
      const cell = h(`<div class="cal-day ${t ? 'trained' : ''} ${isToday ? 'today' : ''}">${d}</div>`);
      if (t) cell.onclick = () => go('#/workout/' + t[0].id);
      grid.appendChild(cell);
    }
    card.appendChild(grid);
  }
  draw();
  App.appendChild(h(`<div class="tiles"><div class="tile center"><div class="t-val">${cnt7}</div><div class="t-label">7 derniers jours</div></div><div class="tile center"><div class="t-val">${cnt30}</div><div class="t-label">30 derniers jours</div></div></div>`));
});

/* ============================================================
   EXPORT
   ============================================================ */
route('/export', async () => {
  setTab('profile');
  App.appendChild(head('Export', { back: true }));
  App.appendChild(h(`<div class="card" style="background:var(--pink-soft);box-shadow:none;color:var(--pink-text)">Exporte tes données pour les sauvegarder ou les analyser dans ton projet Claude « Fitness - Sèche 2026 ». Pense à le faire chaque fin de semaine.</div>`));
  App.appendChild(h(`<label class="fld">Période</label>`));
  const sel = h(`<select class="inp"><option value="all">Tout l'historique</option><option value="7">7 derniers jours</option><option value="30">30 derniers jours</option><option value="90">90 derniers jours</option></select>`);
  App.appendChild(sel);
  App.appendChild(h(`<div class="btn-row" style="margin-top:16px"><button class="btn" id="csv">⬇ CSV</button><button class="btn secondary" id="md">⬇ Markdown</button></div>`));
  const copy = h(`<button class="btn ghost" style="margin-top:10px">📋 Copier le Markdown</button>`); App.appendChild(copy);
  App.appendChild(h(`<div class="section-title">Aperçu</div>`));
  const prev = h(`<pre class="card export-prev"></pre>`); App.appendChild(prev);

  async function gather() {
    const days = sel.value === 'all' ? Infinity : parseInt(sel.value, 10);
    const workouts = (await Repo.allWorkouts()).filter((w) => days === Infinity || daysAgo(w.date) < days).sort((a, b) => a.date.localeCompare(b.date));
    const rows = [];
    for (const w of workouts) {
      const ss = (await Repo.setsOfWorkout(w.id)).sort((a, b) => a.set_number - b.set_number);
      for (const s of ss) { const ex = await Repo.getExercise(s.exercise_id); rows.push({ date: w.date, seance: w.name || 'Séance libre', exercice: ex ? ex.name : '(supprimé)', groupe: ex ? ex.muscle_group : '', serie: s.set_number, poids_kg: s.weight_kg, reps: s.reps, rpe: s.rpe ?? '', echec: s.failed ? 'oui' : '', notes: ex && ex.notes ? ex.notes : '' }); }
    }
    return rows;
  }
  function toCSV(rows) { const cols = ['date', 'seance', 'exercice', 'groupe', 'serie', 'poids_kg', 'reps', 'rpe', 'echec', 'notes']; const e = (v) => { v = String(v ?? ''); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }; return cols.join(',') + '\n' + rows.map((r) => cols.map((c) => e(r[c])).join(',')).join('\n'); }
  function toMD(rows) {
    let md = '# Historique musculation\n\nExport du ' + new Date().toLocaleDateString('fr-FR') + '\n\n';
    const byDate = {}; for (const r of rows) (byDate[r.date] ||= []).push(r);
    for (const date of Object.keys(byDate).sort()) { const rs = byDate[date]; md += `## ${fmtDateFull(date)} — ${rs[0].seance}\n\n`; const byEx = {}; for (const r of rs) (byEx[r.exercice] ||= []).push(r); for (const ex of Object.keys(byEx)) { md += `**${ex}**\n\n| Série | Poids (kg) | Reps | RPE | Échec |\n|---|---|---|---|---|\n`; for (const r of byEx[ex]) md += `| ${r.serie} | ${r.poids_kg} | ${r.reps} | ${r.rpe} | ${r.echec} |\n`; md += '\n'; } }
    return md;
  }
  function download(name, text, mime) { const blob = new Blob([text], { type: mime + ';charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  async function refresh() { const rows = await gather(); prev.textContent = rows.length ? toMD(rows).slice(0, 4000) : 'Aucune donnée sur cette période.'; }
  sel.onchange = refresh; refresh();
  document.getElementById('csv').onclick = async () => { const r = await gather(); if (!r.length) return toast('Aucune donnée'); download(`muscu-${todayISO()}.csv`, '﻿' + toCSV(r), 'text/csv'); toast('CSV exporté'); };
  document.getElementById('md').onclick = async () => { const r = await gather(); if (!r.length) return toast('Aucune donnée'); download(`muscu-${todayISO()}.md`, toMD(r), 'text/markdown'); toast('Markdown exporté'); };
  copy.onclick = async () => { const r = await gather(); if (!r.length) return toast('Aucune donnée'); try { await navigator.clipboard.writeText(toMD(r)); toast('Copié !'); } catch { toast('Copie impossible'); } };
});

/* ============================================================
   SÉLECTEUR D'EXERCICE (bottom sheet)
   ============================================================ */
async function pickExercise(onPick) {
  const exos = await Repo.allExercises();
  const overlay = h(`<div class="overlay"><div class="sheet"><div class="grab"></div>
    <div class="row-between"><h2 style="font-size:18px">Choisir un exercice</h2><button class="btn small secondary close">Fermer</button></div>
    <input class="inp search" placeholder="Rechercher…" style="margin:12px 0"><div class="pick"></div></div></div>`);
  document.body.appendChild(overlay);
  const list = overlay.querySelector('.pick'); const search = overlay.querySelector('.search');
  function draw(f = '') {
    list.innerHTML = ''; f = f.toLowerCase();
    const shown = exos.filter((e) => e.name.toLowerCase().includes(f) || (e.muscle_group || '').toLowerCase().includes(f));
    const rows = h(`<div class="rows"></div>`);
    for (const e of shown) { const row = h(`<div class="row"><div class="grow"><div class="r-title">${esc(e.name)}</div><div class="r-sub">${esc(e.muscle_group || '')}</div></div></div>`); row.onclick = () => { document.body.removeChild(overlay); onPick(e.id); }; rows.appendChild(row); }
    list.appendChild(rows);
    if (!shown.length) list.appendChild(h(`<div class="empty">Aucun exercice. <a href="#/exercise-edit/new">En créer un</a></div>`));
  }
  draw(); search.oninput = () => draw(search.value);
  overlay.querySelector('.close').onclick = () => document.body.removeChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };
  setTimeout(() => search.focus(), 50);
}

/* ============================================================
   GRAPHIQUES SVG
   ============================================================ */
function lineChart(values, labels, opts = {}) {
  const W = 320, H = 150, pad = 10, padB = 22;
  const wrap = h(`<div></div>`);
  if (!values.length || values.every((v) => v === 0)) { wrap.appendChild(h(`<div class="muted" style="text-align:center;padding:30px 0">Pas encore de données.</div>`)); return wrap; }
  const max = Math.max(...values), min = Math.min(...values, 0);
  const range = max - min || 1;
  const px = (i) => pad + (values.length === 1 ? (W - 2 * pad) / 2 : (i / (values.length - 1)) * (W - 2 * pad));
  const py = (v) => (H - padB) - ((v - min) / range) * (H - padB - pad);
  let d = '', area = '';
  values.forEach((v, i) => { d += (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(v).toFixed(1) + ' '; });
  area = `M${px(0)} ${H - padB} ` + values.map((v, i) => `L${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ') + ` L${px(values.length - 1)} ${H - padB} Z`;
  const dots = opts.dots ? values.map((v, i) => `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="3.5" fill="var(--pink)"/>`).join('') : '';
  const svg = h(`<svg class="chart" viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--pink)" stop-opacity=".22"/><stop offset="1" stop-color="var(--pink)" stop-opacity="0"/></linearGradient></defs>
    ${opts.area ? `<path d="${area}" fill="url(#lg)"/>` : ''}
    <path d="${d}" fill="none" stroke="var(--pink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg>`);
  wrap.appendChild(svg);
  wrap.appendChild(h(`<div class="chart-x">${labels.map((l) => `<span>${esc(l)}</span>`).join('')}</div>`));
  return wrap;
}
function barChart(values, labels) {
  const W = 320, H = 140, pad = 8, padB = 20, gap = 10;
  const wrap = h(`<div></div>`);
  const max = Math.max(...values, 1);
  const bw = (W - 2 * pad - gap * (values.length - 1)) / values.length;
  let bars = '';
  values.forEach((v, i) => { const bh = (v / max) * (H - padB - pad); const x = pad + i * (bw + gap); const y = (H - padB) - bh; bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(bh, 2).toFixed(1)}" rx="4" fill="var(--pink)" opacity="${v ? 1 : .25}"/>`; });
  wrap.appendChild(h(`<svg class="chart" viewBox="0 0 ${W} ${H}">${bars}</svg>`));
  wrap.appendChild(h(`<div class="chart-x">${labels.map((l) => `<span>${esc(l)}</span>`).join('')}</div>`));
  return wrap;
}
function donut(segs) {
  const total = segs.reduce((a, s) => a + s[1], 0) || 1;
  const colors = ['#FB3F9E', '#FF74B9', '#F91C86', '#FFA6D2', '#D6217A', '#FFC9E4'];
  const R = 42, C = 2 * Math.PI * R; let off = 0; let arcs = '';
  segs.forEach((s, i) => { const frac = s[1] / total; const len = frac * C; arcs += `<circle cx="55" cy="55" r="${R}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="16" stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 55 55)"/>`; off += len; });
  const svg = h(`<svg viewBox="0 0 110 110" style="width:120px;height:120px">${arcs || `<circle cx="55" cy="55" r="${R}" fill="none" stroke="var(--tile2)" stroke-width="16"/>`}</svg>`);
  return svg;
}
function ring(value, goal) {
  const pct = Math.min(value / (goal || 1), 1); const R = 40, C = 2 * Math.PI * R;
  return h(`<svg viewBox="0 0 100 100" style="width:110px;height:110px">
    <circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--tile2)" stroke-width="12"/>
    <circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--pink)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(pct * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)"/>
    <text x="50" y="47" text-anchor="middle" font-size="22" font-weight="800" fill="var(--text)">${value}</text>
    <text x="50" y="63" text-anchor="middle" font-size="12" fill="var(--muted)">/ ${goal}</text></svg>`);
}

/* ============================================================
   INIT
   ============================================================ */
(async function init() {
  await DB.open();
  await Repo.ensureSeed();
  applyTheme(getSettings().dark);
  if (!location.hash) location.hash = '#/home';
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
