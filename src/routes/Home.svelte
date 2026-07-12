<script lang="ts">
  import { observe } from '../lib/live';
  import { db } from '../lib/db';
  import { settings } from '../lib/settings.svelte';
  import { weekStart, fmtNum } from '../lib/format';
  import { workoutStats, computeStreak } from '../lib/stats';
  import { createWorkout } from '../lib/actions';
  import { go } from '../lib/router.svelte';
  import Icon from '../components/Icon.svelte';
  import LineChart from '../components/LineChart.svelte';
  import type { Workout, WorkoutTemplate, SetEntry, Exercise } from '../lib/types';

  const data = observe(
    async () => {
      const [workouts, sets, templates, exercises] = await Promise.all([
        db.workouts.toArray(), db.sets.toArray(), db.templates.toArray(), db.exercises.toArray(),
      ]);
      return { workouts, sets, templates, exercises };
    },
    { workouts: [] as Workout[], sets: [] as SetEntry[], templates: [] as WorkoutTemplate[], exercises: [] as Exercise[] },
  );

  const exById = $derived(Object.fromEntries($data.exercises.map((e) => [e.id, e])));
  const withSets = $derived(new Set($data.sets.map((s) => s.workout_id)));
  const workouts = $derived($data.workouts.filter((w) => withSets.has(w.id)));

  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const wkStart = weekStart();
  const inWeek = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) >= wkStart; };

  const weekWorkouts = $derived(workouts.filter((w) => inWeek(w.date)));
  const weekVol = $derived($data.sets.filter((s) => weekWorkouts.some((w) => w.id === s.workout_id)).reduce((a, s) => a + s.weight_kg * s.reps, 0));
  const weekSets = $derived($data.sets.filter((s) => weekWorkouts.some((w) => w.id === s.workout_id)).length);
  const streak = $derived(computeStreak(workouts.map((w) => w.date), weekStart));

  const suggestion = $derived.by(() => {
    if (!$data.templates.length) return null;
    const last: Record<string, number> = {};
    for (const w of $data.workouts) if (w.template_id) last[w.template_id] = Math.max(last[w.template_id] || 0, Date.parse(w.date));
    const t = [...$data.templates].sort((a, b) => (last[a.id] || 0) - (last[b.id] || 0))[0];
    const muscles = [...new Set(t.exercise_ids.map((id) => exById[id]?.muscle_group).filter(Boolean))].slice(0, 2).join(' & ');
    return { t, count: t.exercise_ids.length, muscles };
  });

  const dayVols = $derived.by(() => {
    const v = [0, 0, 0, 0, 0, 0, 0];
    for (const w of weekWorkouts) {
      const [y, m, d] = w.date.split('-').map(Number);
      v[(new Date(y, m - 1, d).getDay() + 6) % 7] += workoutStats(w.id, $data.sets).volume;
    }
    return v;
  });

  const tips = [
    "Bois 500 ml d'eau 30 min avant ta séance pour une performance optimale.",
    "En sèche, garde tes charges : c'est le meilleur signal de préservation musculaire.",
    "Note ton RPE : au-delà de 9 sur les séries de base, la fatigue s'accumule vite.",
    'Priorise le sommeil : la récupération fait la progression, surtout en déficit.',
    'Échauffe-toi avec 1-2 séries légères avant ta série lourde.',
  ];
  const tip = tips[new Date().getDate() % tips.length];

  function start() { createWorkout(suggestion ? suggestion.t : null); }
</script>

<div class="screen">
  <div class="row-between" style="margin-bottom:18px">
    <div>
      <div class="greet-date">{dateStr}</div>
      <div class="greet-name">Bonjour, {settings.name} <span style="font-weight:400">👋</span></div>
    </div>
    <div class="avatar">{(settings.name[0] || 'B').toUpperCase()}</div>
  </div>

  <div class="hero">
    <div class="h-label">SÉANCE DU JOUR</div>
    <div class="h-title">{suggestion ? suggestion.t.name : 'Séance libre'}</div>
    <div class="h-sub">
      {#if suggestion}{suggestion.count} exercice{suggestion.count > 1 ? 's' : ''}{suggestion.muscles ? ' · ' + suggestion.muscles : ''}{:else}Démarre quand tu veux{/if}
    </div>
    <button class="h-btn" onclick={start}>▶&nbsp;&nbsp;Commencer l'entraînement</button>
  </div>

  <div class="tiles">
    <div class="tile"><div class="ico"><Icon name="cal" /></div><div class="t-label">Séances</div><div class="t-val">{weekWorkouts.length} <small>/ {settings.goal}</small></div></div>
    <div class="tile"><div class="ico"><Icon name="weight" /></div><div class="t-label">Volume (semaine)</div><div class="t-val">{fmtNum(weekVol)} <small>kg</small></div></div>
    <div class="tile"><div class="ico"><Icon name="bolt" /></div><div class="t-label">Séries (semaine)</div><div class="t-val">{weekSets}</div></div>
    <div class="tile"><div class="ico"><Icon name="flame" /></div><div class="t-label">Série consécutive</div><div class="t-val">{streak} <small>sem.</small></div></div>
  </div>

  <div class="card" style="margin-top:16px">
    <div class="row-between"><div class="card-title">Progression hebdomadaire</div><div class="card-sub">Cette semaine</div></div>
    <LineChart values={dayVols} labels={['L', 'M', 'M', 'J', 'V', 'S', 'D']} area />
  </div>

  <div class="card" style="background:var(--accent-soft);box-shadow:none;display:flex;gap:14px;align-items:flex-start">
    <div class="avatar" style="width:36px;height:36px;font-size:16px">★</div>
    <div><div class="card-title" style="font-size:15px">Conseil du jour</div><div class="card-sub" style="color:var(--accent-text)">{tip}</div></div>
  </div>

  <button class="btn secondary" onclick={() => go('/calendar')}>📅&nbsp;&nbsp;Voir le calendrier</button>
</div>
