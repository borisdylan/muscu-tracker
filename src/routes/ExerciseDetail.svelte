<script lang="ts">
  import { observe } from '../lib/live';
  import { db, e1RM } from '../lib/db';
  import { fmtDate, fmtNum, trimNum } from '../lib/format';
  import { go } from '../lib/router.svelte';
  import Header from '../components/Header.svelte';
  import LineChart from '../components/LineChart.svelte';
  import type { Workout, SetEntry, Exercise } from '../lib/types';

  let { id }: { id: string } = $props();

  const data = observe(
    async () => {
      const [ex, sets, workouts] = await Promise.all([
        db.exercises.get(id), db.sets.where('exercise_id').equals(id).toArray(), db.workouts.toArray(),
      ]);
      return { ex: ex ?? null, sets, workouts };
    },
    { ex: null as Exercise | null, sets: [] as SetEntry[], workouts: [] as Workout[] },
  );

  const ex = $derived($data.ex);
  const wById = $derived(Object.fromEntries($data.workouts.map((w) => [w.id, w])));
  const sessions = $derived.by(() => {
    const byW: Record<string, SetEntry[]> = {};
    for (const s of $data.sets) (byW[s.workout_id] ||= []).push(s);
    return Object.entries(byW)
      .map(([wid, ss]) => ({ w: wById[wid], sets: ss.sort((a, b) => a.set_number - b.set_number) }))
      .filter((x) => x.w)
      .sort((a, b) => b.w.date.localeCompare(a.w.date));
  });
  const chrono = $derived([...sessions].reverse());
  const prWeight = $derived($data.sets.length ? Math.max(...$data.sets.map((s) => s.weight_kg)) : 0);
  const prVol = $derived($data.sets.length ? Math.max(...$data.sets.map((s) => s.weight_kg * s.reps)) : 0);
  const pr1 = $derived($data.sets.length ? Math.max(...$data.sets.map((s) => e1RM(s.weight_kg, s.reps))) : 0);
</script>

<div class="screen">
  <Header title={ex?.name ?? 'Exercice'} back action="✏️" onAction={() => go('/exercise-edit/' + id)} />
  {#if !ex}
    <div class="empty">Exercice introuvable.</div>
  {:else}
    <div class="label gray" style="margin:-8px 2px 14px">{ex.muscle_group}</div>
    {#if ex.notes}<div class="card">📝 {ex.notes}</div>{/if}

    {#if !$data.sets.length}
      <div class="empty">Aucune série enregistrée.</div>
    {:else}
      <div class="tiles three">
        <div class="tile center"><div class="t-val">{trimNum(prWeight)}<small> kg</small></div><div class="t-label">Charge max</div></div>
        <div class="tile center"><div class="t-val">{fmtNum(prVol)}</div><div class="t-label">Volume max</div></div>
        <div class="tile center"><div class="t-val">{Math.round(pr1)}</div><div class="t-label">1RM estimé</div></div>
      </div>

      <div class="card">
        <div class="card-title">Progression (1RM estimé)</div>
        <LineChart values={chrono.map((s) => Math.max(...s.sets.map((x) => e1RM(x.weight_kg, x.reps))))} labels={chrono.map((s) => fmtDate(s.w.date).slice(0, 6))} area dots />
      </div>

      <div class="section-title">Historique</div>
      {#each sessions as s (s.w.id)}
        {@const vol = s.sets.reduce((a, x) => a + x.weight_kg * x.reps, 0)}
        <div class="card" style="padding:14px 16px" role="button" tabindex="0" onclick={() => go('/workout/' + s.w.id)} onkeydown={(e) => e.key === 'Enter' && go('/workout/' + s.w.id)}>
          <div class="row-between">
            <div>
              <div style="font-weight:700">{fmtDate(s.w.date)}</div>
              <div class="card-sub">{s.sets.map((x) => `${x.weight_kg}×${x.reps}${x.rpe ? ' @' + x.rpe : ''}${x.failed ? ' ✗' : ''}`).join('  ·  ')}</div>
            </div>
            <span class="badge">{fmtNum(vol)} kg</span>
          </div>
        </div>
      {/each}
    {/if}
  {/if}
</div>
