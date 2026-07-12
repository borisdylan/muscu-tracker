<script lang="ts">
  let { group }: { group: string } = $props();
  const SOFT = 'var(--accent-soft)';
  const ON = 'var(--accent)';

  const c = $derived.by(() => {
    const g = (group || '').toLowerCase();
    const on = (keys: string[]) => (keys.some((k) => g.includes(k)) ? ON : SOFT);
    const chest = on(['pect']);
    const back = on(['dos']);
    return {
      chest,
      arms: on(['tricep', 'bicep', 'bras']),
      sh: on(['épaul', 'epaul']),
      legs: on(['jambe', 'quad', 'ischio', 'mollet', 'fessier']),
      abs: on(['abdo']),
      torso: chest !== SOFT ? chest : back,
    };
  });
</script>

<svg class="silhouette" viewBox="0 0 60 96" fill="none">
  <circle cx="30" cy="12" r="9" fill={SOFT} />
  <rect x="14" y="23" width="10" height="9" rx="4" fill={c.sh} />
  <rect x="36" y="23" width="10" height="9" rx="4" fill={c.sh} />
  <rect x="22" y="24" width="16" height="14" rx="5" fill={c.torso} />
  <rect x="23" y="39" width="14" height="13" rx="5" fill={c.abs} />
  <rect x="13" y="33" width="8" height="22" rx="4" fill={c.arms} />
  <rect x="39" y="33" width="8" height="22" rx="4" fill={c.arms} />
  <rect x="23" y="53" width="7" height="30" rx="3.5" fill={c.legs} />
  <rect x="30" y="53" width="7" height="30" rx="3.5" fill={c.legs} />
</svg>
