<script lang="ts">
  import { onMount } from 'svelte';
  import { observe } from '../lib/live';
  import { db, uid } from '../lib/db';
  import { go } from '../lib/router.svelte';
  import { toast } from '../lib/toast.svelte';
  import Header from '../components/Header.svelte';
  import ExercisePicker from '../components/ExercisePicker.svelte';
  import type { Exercise, WorkoutTemplate } from '../lib/types';

  let { id }: { id: string } = $props();
  const isNew = id === 'new';

  let name = $state('');
  let exIds = $state<string[]>([]);
  let showPicker = $state(false);

  const exos = observe(async () => db.exercises.toArray(), [] as Exercise[]);
  const exById = $derived(Object.fromEntries($exos.map((e) => [e.id, e])));

  onMount(async () => {
    if (!isNew) {
      const t = await db.templates.get(id);
      if (t) { name = t.name; exIds = [...t.exercise_ids]; }
    }
  });

  function moveUp(i: number) {
    if (i > 0) { const a = [...exIds]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; exIds = a; }
  }
  function removeAt(i: number) { exIds = exIds.filter((_, j) => j !== i); }
  function onPick(exId: string) { exIds = [...exIds, exId]; showPicker = false; }

  async function save() {
    if (!name.trim()) { toast('Nom requis'); return; }
    const t: WorkoutTemplate = { id: isNew ? uid() : id, name: name.trim(), exercise_ids: exIds };
    await db.templates.put(t);
    toast('Enregistré');
    history.back();
  }
  async function remove() {
    if (confirm('Supprimer ce modèle ?')) { await db.templates.delete(id); go('/templates'); }
  }
</script>

<div class="screen">
  <Header title={isNew ? 'Nouveau modèle' : 'Modifier'} back />
  <label class="fld">Nom du modèle</label>
  <input class="inp" bind:value={name} placeholder="Ex : Push" />

  <div class="section-title">Exercices</div>
  {#if !exIds.length}
    <div class="muted" style="padding:6px 2px">Aucun exercice ajouté.</div>
  {:else}
    <div class="rows">
      {#each exIds as exId, i (exId + i)}
        <div class="row">
          <div class="grow"><div class="r-title">{exById[exId]?.name ?? '(supprimé)'}</div><div class="r-sub">{exById[exId]?.muscle_group ?? ''}</div></div>
          <button class="btn small secondary" onclick={() => moveUp(i)} aria-label="Monter">▲</button>
          <button class="btn small secondary" onclick={() => removeAt(i)} aria-label="Retirer">✕</button>
        </div>
      {/each}
    </div>
  {/if}
  <button class="btn secondary" style="margin-top:6px" onclick={() => (showPicker = true)}>➕&nbsp;&nbsp;Ajouter un exercice</button>
  <button class="btn" style="margin-top:16px" onclick={save}>Enregistrer</button>
  {#if !isNew}<button class="btn danger" style="margin-top:10px" onclick={remove}>Supprimer le modèle</button>{/if}
</div>

{#if showPicker}
  <ExercisePicker {onPick} onClose={() => (showPicker = false)} />
{/if}
