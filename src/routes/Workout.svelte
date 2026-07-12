<script lang="ts">
  import { observe } from '../lib/live';
  import { db } from '../lib/db';
  import { lastSessionOf, trendVsLast } from '../lib/stats';
  import { addSet, deleteWorkout, addPlanned } from '../lib/actions';
  import { go } from '../lib/router.svelte';
  import { toast } from '../lib/toast.svelte';
  import Stepper from '../components/Stepper.svelte';
  import Silhouette from '../components/Silhouette.svelte';
  import ExercisePicker from '../components/ExercisePicker.svelte';
  import type { Workout, SetEntry, Exercise } from '../lib/types';

  let { id, idx = 0 }: { id: string; idx?: number } = $props();

  const data = observe(
    async () => {
      const [workout, sets, exercises, workouts] = await Promise.all([
        db.workouts.get(id), db.sets.toArray(), db.exercises.toArray(), db.workouts.toArray(),
      ]);
      return { workout: workout ?? null, sets, exercises, workouts };
    },
    { workout: null as Workout | null, sets: [] as SetEntry[], exercises: [] as Exercise[], workouts: [] as Workout[] },
  );

  const w = $derived($data.workout);
  const wSets = $derived($data.sets.filter((s) => s.workout_id === id));
  const order = $derived.by(() => {
    if (!w) return [] as string[];
    const used = [...new Set(wSets.map((s) => s.exercise_id))];
    const o = [...w.planned];
    for (const eid of used) if (!o.includes(eid)) o.push(eid);
    return o;
  });
  const cur = $derived(order.length ? Math.min(Math.max(idx, 0), order.length - 1) : 0);
  const curExId = $derived(order[cur]);
  const ex = $derived($data.exercises.find((e) => e.id === curExId) ?? null);
  const exSets = $derived(wSets.filter((s) => s.exercise_id === curExId).sort((a, b) => a.set_number - b.set_number));
  const last = $derived(curExId ? lastSessionOf(curExId, $data.sets, $data.workouts, id) : null);

  let weight = $state(20);
  let reps = $state(8);
  let showPicker = $state(false);

  // pré-remplissage à chaque changement d'exercice courant
  $effect(() => {
    void curExId;
    if (exSets.length) { const l = exSets[exSets.length - 1]; weight = l.weight_kg; reps = l.reps; }
    else if (last && last.sets.length) { const l = last.sets[last.sets.length - 1]; weight = l.weight_kg; reps = l.reps; }
    else { weight = 20; reps = 8; }
  });

  async function doAdd() {
    if (!curExId) return;
    if (Number.isNaN(weight) || Number.isNaN(reps)) { toast('Renseigne poids et reps'); return; }
    const s = { workout_id: id, exercise_id: curExId, set_number: exSets.length + 1, weight_kg: weight, reps, rpe: null, failed: false };
    await addSet(s);
    if (last) {
      const t = trendVsLast({ ...s, id: '', created_at: '' } as SetEntry, last.sets);
      toast(t.cls === 'up' ? '📈 Progression !' : t.cls === 'down' ? '📉 En baisse' : '➡️ Stable');
    } else toast('Série enregistrée');
  }

  async function onPickExo(exId: string) {
    const target = order.length;
    await addPlanned(id, exId);
    showPicker = false;
    go(`/workout/${id}/${target}`);
  }

  async function removeWorkout() {
    if (confirm('Supprimer cette séance et ses séries ?')) { await deleteWorkout(id); go('/home'); }
  }
</script>

<div class="screen">
  {#if !w}
    <div class="empty">Séance introuvable.</div>
  {:else}
    <div class="screen-head">
      <button class="back" aria-label="Retour" onclick={() => go('/home')}>‹</button>
      <h1 style="font-size:22px">{w.name}</h1>
      {#if order.length}<span class="muted" style="font-weight:700">{cur + 1} / {order.length}</span>{/if}
    </div>
    <div class="progress"><i style="width:{order.length ? ((cur + 1) / order.length) * 100 : 0}%"></i></div>

    {#if !order.length}
      <div class="empty">Aucun exercice.<br />Ajoute ton premier exercice.</div>
      <button class="btn" onclick={() => (showPicker = true)}>➕&nbsp;&nbsp;Ajouter un exercice</button>
    {:else if ex}
      <div class="card">
        <div class="exo-card-head">
          <div class="grow">
            <div class="label">{ex.muscle_group}</div>
            <div class="card-title" style="font-size:20px;margin-top:2px">{ex.name}</div>
            <div class="card-sub">
              {#if exSets.length}{exSets.length} série(s) faite(s){:else if last}Dernière fois : {last.sets.map((s) => s.weight_kg + '×' + s.reps).join(', ')}{:else}Premier passage 💪{/if}
            </div>
          </div>
          <Silhouette group={ex.muscle_group} />
        </div>

        <div class="steppers">
          <Stepper label="Poids (kg)" bind:value={weight} step={2.5} />
          <Stepper label="Répétitions" bind:value={reps} step={1} />
        </div>

        <div class="set-list">
          {#each exSets as s (s.id)}
            {@const t = last ? trendVsLast(s, last.sets) : { cls: 'flat', sym: '' }}
            <div class="set-pill done" class:failed={s.failed}>
              <span class="radio"></span>
              <span class="s-name">Série {s.set_number}</span>
              <span class="trend {t.cls}">{t.sym}</span>
              <span class="s-perf">{s.weight_kg} kg × {s.reps}</span>
              <button class="del" aria-label="Supprimer" onclick={() => db.sets.delete(s.id)}>✕</button>
            </div>
          {/each}
        </div>

        <button class="btn" style="margin-top:6px" onclick={doAdd}>＋&nbsp;&nbsp;Ajouter la série {exSets.length + 1}</button>
      </div>

      <div class="btn-row" style="margin-top:8px">
        {#if cur > 0}<button class="btn outline" onclick={() => go(`/workout/${id}/${cur - 1}`)}>Précédent</button>{/if}
        {#if cur < order.length - 1}
          <button class="btn" onclick={() => go(`/workout/${id}/${cur + 1}`)}>Exercice suivant</button>
        {:else}
          <button class="btn" onclick={() => go('/home')}>✅&nbsp;&nbsp;Terminer la séance</button>
        {/if}
      </div>
      <button class="btn secondary" style="margin-top:12px" onclick={() => (showPicker = true)}>➕&nbsp;&nbsp;Ajouter un exercice</button>
      <button class="btn danger" style="margin-top:12px" onclick={removeWorkout}>🗑️&nbsp;&nbsp;Supprimer la séance</button>
    {/if}
  {/if}
</div>

{#if showPicker}
  <ExercisePicker onPick={onPickExo} onClose={() => (showPicker = false)} />
{/if}
