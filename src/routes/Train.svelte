<script lang="ts">
  import { observe } from '../lib/live';
  import { db } from '../lib/db';
  import { todayISO } from '../lib/format';
  import { workoutStats } from '../lib/stats';
  import { createWorkout } from '../lib/actions';
  import { go } from '../lib/router.svelte';
  import Header from '../components/Header.svelte';
  import Icon from '../components/Icon.svelte';
  import type { Workout, SetEntry, WorkoutTemplate } from '../lib/types';

  const data = observe(
    async () => {
      const [workouts, sets, templates] = await Promise.all([
        db.workouts.toArray(),
        db.sets.toArray(),
        db.templates.toArray().then((t) => t.sort((a, b) => a.name.localeCompare(b.name, 'fr'))),
      ]);
      return { workouts, sets, templates };
    },
    { workouts: [] as Workout[], sets: [] as SetEntry[], templates: [] as WorkoutTemplate[] },
  );

  const today = $derived($data.workouts.find((w) => w.date === todayISO()) ?? null);
  const todayStat = $derived(today ? workoutStats(today.id, $data.sets) : null);
</script>

<div class="screen">
  <Header title="Entraînement" />

  {#if today && todayStat}
    <div class="hero">
      <div class="h-label">SÉANCE EN COURS</div>
      <div class="h-title">{today.name}</div>
      <div class="h-sub">{todayStat.exCount} exercice{todayStat.exCount > 1 ? 's' : ''} · {todayStat.setCount} série{todayStat.setCount > 1 ? 's' : ''} loggée{todayStat.setCount > 1 ? 's' : ''}</div>
      <button class="h-btn" onclick={() => go('/workout/' + today.id)}>Reprendre la séance</button>
    </div>
  {/if}

  <div class="section-title">Nouvelle séance</div>
  <button class="btn secondary" onclick={() => createWorkout(null)} style="margin-bottom:14px">➕&nbsp;&nbsp;Séance libre</button>

  <div class="section-title">Depuis un modèle</div>
  {#if !$data.templates.length}
    <div class="empty">Aucun modèle.<br /><a href="#/template-edit/new">Créer un modèle</a> (Push, Pull, Legs…)</div>
  {:else}
    <div class="rows">
      {#each $data.templates as t (t.id)}
        <div class="row" role="button" tabindex="0" onclick={() => createWorkout(t)} onkeydown={(e) => e.key === 'Enter' && createWorkout(t)}>
          <div class="r-ico"><Icon name="list" /></div>
          <div class="grow"><div class="r-title">{t.name}</div><div class="r-sub">{t.exercise_ids.length} exercice(s)</div></div>
          <span class="chev">›</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
