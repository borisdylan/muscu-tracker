<script lang="ts">
  import { observe } from '../lib/live';
  import { db } from '../lib/db';
  import { go } from '../lib/router.svelte';
  import Header from '../components/Header.svelte';
  import Icon from '../components/Icon.svelte';
  import type { WorkoutTemplate } from '../lib/types';

  const templates = observe(async () => (await db.templates.toArray()).sort((a, b) => a.name.localeCompare(b.name, 'fr')), [] as WorkoutTemplate[]);
</script>

<div class="screen">
  <Header title="Modèles" back action="＋ Ajouter" onAction={() => go('/template-edit/new')} />
  {#if !$templates.length}
    <div class="empty">Aucun modèle.<br />Crée tes séances types (Push, Pull, Legs…).</div>
  {:else}
    <div class="rows">
      {#each $templates as t (t.id)}
        <div class="row" role="button" tabindex="0" onclick={() => go('/template-edit/' + t.id)} onkeydown={(e) => e.key === 'Enter' && go('/template-edit/' + t.id)}>
          <div class="r-ico"><Icon name="list" /></div>
          <div class="grow"><div class="r-title">{t.name}</div><div class="r-sub">{t.exercise_ids.length} exercice(s)</div></div>
          <span class="chev">›</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
