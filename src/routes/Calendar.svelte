<script lang="ts">
  import { observe } from '../lib/live';
  import { db } from '../lib/db';
  import { todayISO, daysAgo } from '../lib/format';
  import { go } from '../lib/router.svelte';
  import Header from '../components/Header.svelte';
  import type { Workout, SetEntry } from '../lib/types';

  const data = observe(
    async () => {
      const [workouts, sets] = await Promise.all([db.workouts.toArray(), db.sets.toArray()]);
      return { workouts, sets };
    },
    { workouts: [] as Workout[], sets: [] as SetEntry[] },
  );

  const withSets = $derived(new Set($data.sets.map((s) => s.workout_id)));
  const trained = $derived.by(() => {
    const map: Record<string, Workout> = {};
    for (const w of $data.workouts) if (withSets.has(w.id)) map[w.date] = w;
    return map;
  });
  const cnt7 = $derived(Object.keys(trained).filter((iso) => daysAgo(iso) < 7).length);
  const cnt30 = $derived(Object.keys(trained).filter((iso) => daysAgo(iso) < 30).length);

  const now = new Date();
  let y = $state(now.getFullYear());
  let m = $state(now.getMonth());
  const monthName = $derived(new Date(y, m, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }));

  const cells = $derived.by(() => {
    const startPad = (new Date(y, m, 1).getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    const arr: Array<{ d: number; iso: string; trained: boolean; today: boolean } | null> = [];
    for (let i = 0; i < startPad; i++) arr.push(null);
    for (let d = 1; d <= days; d++) {
      const iso = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      arr.push({ d, iso, trained: !!trained[iso], today: iso === todayISO() });
    }
    return arr;
  });

  function prev() { m--; if (m < 0) { m = 11; y--; } }
  function next() { m++; if (m > 11) { m = 0; y++; } }
  function open(iso: string) { const w = trained[iso]; if (w) go('/workout/' + w.id); }
</script>

<div class="screen">
  <Header title="Calendrier" back />
  <div class="card">
    <div class="cal-head">
      <button class="nav" onclick={prev} aria-label="Mois précédent">‹</button>
      <strong>{monthName}</strong>
      <button class="nav" onclick={next} aria-label="Mois suivant">›</button>
    </div>
    <div class="cal-grid">
      {#each ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as d}<div class="cal-dow">{d}</div>{/each}
      {#each cells as c}
        {#if !c}
          <div class="cal-day empty"></div>
        {:else if c.trained}
          <div class="cal-day trained" class:today={c.today} role="button" tabindex="0" onclick={() => open(c.iso)} onkeydown={(e) => e.key === 'Enter' && open(c.iso)}>{c.d}</div>
        {:else}
          <div class="cal-day" class:today={c.today}>{c.d}</div>
        {/if}
      {/each}
    </div>
  </div>
  <div class="tiles">
    <div class="tile center"><div class="t-val">{cnt7}</div><div class="t-label">7 derniers jours</div></div>
    <div class="tile center"><div class="t-val">{cnt30}</div><div class="t-label">30 derniers jours</div></div>
  </div>
</div>
