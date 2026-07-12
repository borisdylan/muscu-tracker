<script lang="ts">
  import { router } from '../lib/router.svelte';

  const groups: Record<string, string[]> = {
    home: ['/home'],
    train: ['/train', '/workout'],
    stats: ['/stats'],
    history: ['/history', '/calendar'],
    profile: ['/profile', '/exercise', '/exercises', '/templates', '/template', '/export'],
  };

  const activeTab = $derived.by(() => {
    const p = router.path;
    for (const [tab, prefixes] of Object.entries(groups)) {
      if (prefixes.some((pre) => p === pre || p.startsWith(pre + '/'))) return tab;
    }
    return 'home';
  });
</script>

<nav id="tabbar">
  <div class="tabbar-inner">
    <a href="#/home" class="tab" class:active={activeTab === 'home'}>
      <svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg><span>Accueil</span>
    </a>
    <a href="#/train" class="tab" class:active={activeTab === 'train'}>
      <svg viewBox="0 0 24 24"><path d="M6.5 6.5 17.5 17.5" /><path d="M4 8l2-2 2 2-2 2z" /><path d="M16 16l2-2 2 2-2 2z" /><path d="M8.5 4.5 4.5 8.5" /><path d="M19.5 15.5 15.5 19.5" /></svg><span>Entraîn.</span>
    </a>
    <a href="#/stats" class="tab" class:active={activeTab === 'stats'}>
      <svg viewBox="0 0 24 24"><path d="M6 20V10" /><path d="M12 20V4" /><path d="M18 20v-7" /></svg><span>Stats</span>
    </a>
    <a href="#/history" class="tab" class:active={activeTab === 'history'}>
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg><span>Historique</span>
    </a>
    <a href="#/profile" class="tab" class:active={activeTab === 'profile'}>
      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg><span>Profil</span>
    </a>
  </div>
</nav>
