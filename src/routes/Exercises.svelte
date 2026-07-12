<script lang="ts">
  import { observe } from '../lib/live';
  import { db } from '../lib/db';
  import { go } from '../lib/router.svelte';
  import Header from '../components/Header.svelte';
  import type { Exercise } from '../lib/types';

  const exos = observe(async () => (await db.exercises.toArray()).sort((a, b) => a.name.localeCompare(b.name, 'fr')), [] as Exercise[]);
  let search = $state('');

  const groups = $derived.by(() => {
    const g: Record<string, Exercise[]> = {};
    const f = search.toLowerCase();
    for (const e of $exos) {
      if (f && !e.name.toLowerCase().includes(f)) continue;
      (g[e.muscle_group || 'Autre'] ||= []).push(e);
    }
    return g;
  });
  const groupNames = $derived(Object.keys(groups).sort((a, b) => a.localeCompare(b, 'fr')));
</script>

<div class="screen">
  <Header title="Exercices" back action="＋ Ajouter" onAction={() => go('/exercise-edit/new')} />
  <input class="inp" placeholder="Rechercher un exercice…" bind:value={search} style="margin-bottom:14px" />
  {#each groupNames as g (g)}
    <div class="section-title">{g}</div>
    <div class="rows">
      {#each groups[g] as e (e.id)}
        <div class="row" role="button" tabindex="0" onclick={() => go('/exercise/' + e.id)} onkeydown={(ev) => ev.key === 'Enter' && go('/exercise/' + e.id)}>
          <div class="grow"><div class="r-title">{e.name}</div>{#if e.notes}<div class="r-sub">{e.notes}</div>{/if}</div>
          {#if e.custom}<span class="badge">perso</span>{/if}
          <span class="chev">›</span>
        </div>
      {/each}
    </div>
  {/each}
  {#if !groupNames.length}<div class="empty">Aucun exercice trouvé.</div>{/if}
</div>
