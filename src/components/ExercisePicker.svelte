<script lang="ts">
  import { observe } from '../lib/live';
  import { db } from '../lib/db';
  import type { Exercise } from '../lib/types';

  let { onPick, onClose }: { onPick: (id: string) => void; onClose: () => void } = $props();

  let search = $state('');
  const exos = observe(async () => (await db.exercises.toArray()).sort((a, b) => a.name.localeCompare(b.name, 'fr')), [] as Exercise[]);
  const shown = $derived(
    $exos.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.muscle_group.toLowerCase().includes(search.toLowerCase())),
  );
</script>

<div class="overlay" onclick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="presentation">
  <div class="sheet">
    <div class="grab"></div>
    <div class="row-between"><h2 style="font-size:18px">Choisir un exercice</h2><button class="btn small secondary" onclick={onClose}>Fermer</button></div>
    <!-- svelte-ignore a11y_autofocus -->
    <input class="inp" placeholder="Rechercher…" bind:value={search} style="margin:12px 0" autofocus />
    <div class="rows">
      {#each shown as e (e.id)}
        <div class="row" role="button" tabindex="0" onclick={() => onPick(e.id)} onkeydown={(ev) => ev.key === 'Enter' && onPick(e.id)}>
          <div class="grow"><div class="r-title">{e.name}</div><div class="r-sub">{e.muscle_group}</div></div>
        </div>
      {/each}
    </div>
    {#if !shown.length}<div class="empty">Aucun exercice. <a href="#/exercise-edit/new" onclick={onClose}>En créer un</a></div>{/if}
  </div>
</div>
