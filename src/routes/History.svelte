<script lang="ts">
  import { observe } from '../lib/live';
  import { db } from '../lib/db';
  import { fmtDate, fmtNum, daysAgo, todayISO } from '../lib/format';
  import { workoutStats, prWorkouts } from '../lib/stats';
  import { go } from '../lib/router.svelte';
  import Header from '../components/Header.svelte';
  import type { Workout, SetEntry, Exercise } from '../lib/types';

  const data = observe(
    async () => {
      const [workouts, sets, exercises] = await Promise.all([
        db.workouts.orderBy('date').reverse().toArray(), db.sets.toArray(), db.exercises.toArray(),
      ]);
      return { workouts, sets, exercises };
    },
    { workouts: [] as Workout[], sets: [] as SetEntry[], exercises: [] as Exercise[] },
  );

  const exById = $derived(Object.fromEntries($data.exercises.map((e) => [e.id, e])));
  const withSets = $derived(new Set($data.sets.map((s) => s.workout_id)));
  const shown = $derived($data.workouts.filter((w) => withSets.has(w.id)));
  const prs = $derived(prWorkouts($data.sets));

  function whenLabel(iso: string) {
    if (iso === todayISO()) return "Aujourd'hui";
    if (daysAgo(iso) === 1) return 'Hier';
    return fmtDate(iso);
  }
</script>

<div class="screen">
  <Header title="Historique" action="Calendrier" onAction={() => go('/calendar')} />

  {#if !shown.length}
    <div class="empty">Aucune séance enregistrée.</div>
  {:else}
    {#each shown as w (w.id)}
      {@const st = workoutStats(w.id, $data.sets)}
      {@const muscles = [...new Set(st.sets.map((s) => exById[s.exercise_id]?.muscle_group).filter(Boolean))]}
      <div class="card" role="button" tabindex="0" onclick={() => go('/workout/' + w.id)} onkeydown={(e) => e.key === 'Enter' && go('/workout/' + w.id)}>
        <div class="row-between" style="margin-bottom:12px">
          <div>
            <div class="card-title" style="display:inline-flex;align-items:center;gap:8px">
              {w.name}{#if prs.has(w.id)}<span class="badge pr">🏆 Nouveau record</span>{/if}
            </div>
            <div class="card-sub" style="text-transform:capitalize">{whenLabel(w.date)}</div>
          </div>
        </div>
        <div class="tiles three" style="gap:8px">
          <div class="tile center" style="padding:12px"><div class="t-val" style="font-size:18px">{st.exCount}</div><div class="t-label">Exercices</div></div>
          <div class="tile center" style="padding:12px"><div class="t-val" style="font-size:18px">{st.setCount}</div><div class="t-label">Séries</div></div>
          <div class="tile center" style="padding:12px"><div class="t-val" style="font-size:18px">{fmtNum(st.volume)}</div><div class="t-label">Volume kg</div></div>
        </div>
        {#if muscles.length}
          <div style="margin-top:12px;display:flex;gap:14px;flex-wrap:wrap">
            {#each muscles as m}<span class="pill-tag">{m}</span>{/each}
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
