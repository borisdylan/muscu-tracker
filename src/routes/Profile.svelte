<script lang="ts">
  import { observe } from '../lib/live';
  import { db } from '../lib/db';
  import { settings, saveSettings } from '../lib/settings.svelte';
  import { fmtNum } from '../lib/format';
  import { prWorkouts } from '../lib/stats';
  import { go } from '../lib/router.svelte';
  import Header from '../components/Header.svelte';
  import Icon from '../components/Icon.svelte';
  import type { Workout, SetEntry } from '../lib/types';

  const data = observe(
    async () => {
      const [workouts, sets] = await Promise.all([db.workouts.toArray(), db.sets.toArray()]);
      return { workouts, sets };
    },
    { workouts: [] as Workout[], sets: [] as SetEntry[] },
  );

  const withSets = $derived(new Set($data.sets.map((s) => s.workout_id)));
  const nbWorkouts = $derived($data.workouts.filter((w) => withSets.has(w.id)).length);
  const volTotal = $derived($data.sets.reduce((a, s) => a + s.weight_kg * s.reps, 0));
  const prs = $derived(prWorkouts($data.sets).size);

  function toggleDark() {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    saveSettings();
  }
  function editGoal() {
    const v = parseInt(prompt('Objectif de séances par semaine ?', String(settings.goal)) || '', 10);
    if (v > 0) { settings.goal = v; saveSettings(); }
  }
  function editName() {
    const v = prompt('Ton prénom ?', settings.name);
    if (v != null) { settings.name = v.trim() || 'Boris'; saveSettings(); }
  }
</script>

<div class="screen">
  <Header title="Profil" />

  <div style="text-align:center;margin-bottom:18px">
    <div class="avatar" style="width:76px;height:76px;font-size:30px;margin:0 auto 12px">{(settings.name[0] || 'B').toUpperCase()}</div>
    <div style="font-size:22px;font-weight:800">{settings.name}</div>
    <div class="badge blue" style="margin-top:8px">Objectif {settings.goalLabel}</div>
  </div>

  <div class="hero" style="box-shadow:var(--shadow-sm)">
    <div class="h-label">OBJECTIF</div>
    <div class="h-title">{settings.goalLabel}</div>
    <div class="h-sub">{settings.goal} séances / semaine</div>
  </div>

  <div class="tiles three">
    <div class="tile center"><div class="t-val">{nbWorkouts}</div><div class="t-label">Séances</div></div>
    <div class="tile center"><div class="t-val">{fmtNum(volTotal)}</div><div class="t-label">Volume total</div></div>
    <div class="tile center"><div class="t-val">{prs}</div><div class="t-label">Records</div></div>
  </div>

  <div class="section-title">Préférences</div>
  <div class="rows">
    <div class="row" role="button" tabindex="0" onclick={toggleDark} onkeydown={(e) => e.key === 'Enter' && toggleDark()}>
      <div class="r-ico"><Icon name="moon" /></div>
      <div class="grow"><div class="r-title">Mode sombre</div></div>
      <div class="toggle" class:on={settings.theme === 'dark'}><i></i></div>
    </div>
    <div class="row" role="button" tabindex="0" onclick={editGoal} onkeydown={(e) => e.key === 'Enter' && editGoal()}>
      <div class="r-ico"><Icon name="target" /></div>
      <div class="grow"><div class="r-title">Objectif hebdomadaire</div><div class="r-sub">{settings.goal} séances / semaine</div></div>
      <span class="chev">›</span>
    </div>
    <div class="row" role="button" tabindex="0" onclick={editName} onkeydown={(e) => e.key === 'Enter' && editName()}>
      <div class="r-ico"><Icon name="edit" /></div>
      <div class="grow"><div class="r-title">Ton prénom</div><div class="r-sub">{settings.name}</div></div>
      <span class="chev">›</span>
    </div>
  </div>

  <div class="section-title">Données & paramètres</div>
  <div class="rows">
    <div class="row" role="button" tabindex="0" onclick={() => go('/export')} onkeydown={(e) => e.key === 'Enter' && go('/export')}>
      <div class="r-ico"><Icon name="dl" /></div>
      <div class="grow"><div class="r-title">Exporter les données</div><div class="r-sub">CSV / Markdown pour le projet Claude</div></div>
      <span class="chev">›</span>
    </div>
    <div class="row" role="button" tabindex="0" onclick={() => go('/exercises')} onkeydown={(e) => e.key === 'Enter' && go('/exercises')}>
      <div class="r-ico"><Icon name="weight" /></div>
      <div class="grow"><div class="r-title">Gérer les exercices</div></div>
      <span class="chev">›</span>
    </div>
    <div class="row" role="button" tabindex="0" onclick={() => go('/templates')} onkeydown={(e) => e.key === 'Enter' && go('/templates')}>
      <div class="r-ico"><Icon name="list" /></div>
      <div class="grow"><div class="r-title">Gérer les modèles</div></div>
      <span class="chev">›</span>
    </div>
  </div>
</div>
