<script lang="ts">
  import { observe } from '../lib/live';
  import { db, e1RM } from '../lib/db';
  import { settings } from '../lib/settings.svelte';
  import { weekStart, fmtNum, trimNum } from '../lib/format';
  import Header from '../components/Header.svelte';
  import Icon from '../components/Icon.svelte';
  import LineChart from '../components/LineChart.svelte';
  import BarChart from '../components/BarChart.svelte';
  import Donut from '../components/Donut.svelte';
  import Ring from '../components/Ring.svelte';
  import type { Workout, SetEntry, Exercise } from '../lib/types';

  const data = observe(
    async () => {
      const [workouts, sets, exercises] = await Promise.all([db.workouts.toArray(), db.sets.toArray(), db.exercises.toArray()]);
      return { workouts, sets, exercises };
    },
    { workouts: [] as Workout[], sets: [] as SetEntry[], exercises: [] as Exercise[] },
  );

  const wById = $derived(Object.fromEntries($data.workouts.map((w) => [w.id, w])));
  const exById = $derived(Object.fromEntries($data.exercises.map((e) => [e.id, e])));
  const withSets = $derived(new Set($data.sets.map((s) => s.workout_id)));

  const volTotal = $derived($data.sets.reduce((a, s) => a + s.weight_kg * s.reps, 0));
  const chargeMax = $derived($data.sets.length ? Math.max(...$data.sets.map((s) => s.weight_kg)) : 0);
  const oneRM = $derived($data.sets.length ? Math.max(...$data.sets.map((s) => e1RM(s.weight_kg, s.reps))) : 0);

  const months = $derived.by(() => {
    const arr: Array<{ key: string; label: string; v: number }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push({ key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), label: d.toLocaleDateString('fr-FR', { month: 'short' }), v: 0 });
    }
    for (const s of $data.sets) {
      const w = wById[s.workout_id];
      if (!w) continue;
      const mo = arr.find((m) => m.key === w.date.slice(0, 7));
      if (mo) mo.v += s.weight_kg * s.reps;
    }
    return arr;
  });
  const monthBadge = $derived.by(() => {
    const wd = months.filter((m) => m.v > 0);
    if (wd.length < 2) return null;
    const base = wd[0].v;
    return { pct: ((months[months.length - 1].v - base) / base) * 100 };
  });

  const weekBars = $derived.by(() => {
    const v = [0, 0, 0, 0, 0, 0, 0];
    const ws = weekStart();
    for (const s of $data.sets) {
      const w = wById[s.workout_id];
      if (!w) continue;
      const [y, m, d] = w.date.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      if (dt >= ws) v[(dt.getDay() + 6) % 7] += s.weight_kg * s.reps;
    }
    return v;
  });

  const muscleSegs = $derived.by(() => {
    const by: Record<string, number> = {};
    for (const s of $data.sets) {
      const g = exById[s.exercise_id]?.muscle_group || 'Autre';
      by[g] = (by[g] || 0) + s.weight_kg * s.reps;
    }
    return Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 6) as Array<[string, number]>;
  });

  const weekCount = $derived(
    $data.workouts.filter((w) => {
      const [y, m, d] = w.date.split('-').map(Number);
      return new Date(y, m - 1, d) >= weekStart() && withSets.has(w.id);
    }).length,
  );
</script>

<div class="screen">
  <Header title="Statistiques" />

  {#if !$data.sets.length}
    <div class="empty">Pas encore de données.<br />Logge quelques séances pour voir tes stats 📊</div>
  {:else}
    <div class="tiles three">
      <div class="tile center"><div class="ico"><Icon name="up" /></div><div class="t-val">{fmtNum(volTotal)}</div><div class="t-label">Volume total (kg)</div></div>
      <div class="tile center"><div class="ico"><Icon name="bolt" /></div><div class="t-val">{trimNum(chargeMax)}</div><div class="t-label">Charge max (kg)</div></div>
      <div class="tile center"><div class="ico"><Icon name="trophy" /></div><div class="t-val">{Math.round(oneRM)}</div><div class="t-label">1RM estimé (kg)</div></div>
    </div>

    <div class="card">
      <div class="row-between">
        <div><div class="card-title">Volume mensuel</div><div class="card-sub">Progression sur 6 mois</div></div>
        {#if monthBadge}<span class="badge {monthBadge.pct >= 0 ? 'green' : ''}">{monthBadge.pct >= 0 ? '↑' : '↓'} {Math.abs(monthBadge.pct).toFixed(0)}%</span>{/if}
      </div>
      <LineChart values={months.map((m) => m.v)} labels={months.map((m) => m.label)} area />
    </div>

    <div class="card">
      <div class="card-title">Volume hebdomadaire</div>
      <div class="card-sub">{fmtNum(weekBars.reduce((a, b) => a + b, 0))} kg cette semaine</div>
      <BarChart values={weekBars} labels={['L', 'M', 'M', 'J', 'V', 'S', 'D']} />
    </div>

    <div class="tiles">
      <div class="card" style="margin:0"><div class="card-title" style="font-size:15px;margin-bottom:8px">Muscles</div><div style="display:flex;justify-content:center"><Donut segs={muscleSegs} /></div></div>
      <div class="card" style="margin:0"><div class="card-title" style="font-size:15px;margin-bottom:8px">Objectif</div><div style="display:flex;flex-direction:column;align-items:center"><Ring value={weekCount} goal={settings.goal} /><div class="card-sub" style="margin-top:6px">séances cette semaine</div></div></div>
    </div>
  {/if}
</div>
