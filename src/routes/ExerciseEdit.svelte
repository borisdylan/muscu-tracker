<script lang="ts">
  import { onMount } from 'svelte';
  import { db, uid } from '../lib/db';
  import { MUSCLE_GROUPS } from '../lib/seed';
  import { go } from '../lib/router.svelte';
  import { toast } from '../lib/toast.svelte';
  import Header from '../components/Header.svelte';
  import type { Exercise } from '../lib/types';

  let { id }: { id: string } = $props();
  const isNew = id === 'new';

  let name = $state('');
  let muscle = $state('Pectoraux');
  let notes = $state('');
  let custom = $state(true);

  onMount(async () => {
    if (!isNew) {
      const e = await db.exercises.get(id);
      if (e) { name = e.name; muscle = e.muscle_group; notes = e.notes; custom = e.custom; }
    }
  });

  async function save() {
    if (!name.trim()) { toast('Le nom est requis'); return; }
    const ex: Exercise = { id: isNew ? uid() : id, name: name.trim(), muscle_group: muscle, notes: notes.trim(), custom: isNew ? true : custom };
    await db.exercises.put(ex);
    toast('Enregistré');
    history.back();
  }
  async function remove() {
    if (confirm('Supprimer cet exercice ?')) { await db.exercises.delete(id); go('/exercises'); }
  }
</script>

<div class="screen">
  <Header title={isNew ? 'Nouvel exercice' : 'Modifier'} back />
  <label class="fld">Nom</label>
  <input class="inp" bind:value={name} placeholder="Ex : Développé couché" />
  <label class="fld">Groupe musculaire</label>
  <select class="inp" bind:value={muscle}>
    {#each MUSCLE_GROUPS as g}<option value={g}>{g}</option>{/each}
  </select>
  <label class="fld">Notes (optionnel)</label>
  <textarea class="inp" bind:value={notes} placeholder="Ex : prise large, banc incliné 30°"></textarea>
  <button class="btn" style="margin-top:18px" onclick={save}>Enregistrer</button>
  {#if !isNew}<button class="btn danger" style="margin-top:10px" onclick={remove}>Supprimer</button>{/if}
</div>
