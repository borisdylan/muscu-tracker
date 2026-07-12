<script lang="ts">
  let { value, goal }: { value: number; goal: number } = $props();
  const R = 40;
  const C = 2 * Math.PI * R;
  const dash = $derived(`${(Math.min(value / (goal || 1), 1) * C).toFixed(1)} ${C.toFixed(1)}`);
</script>

<svg viewBox="0 0 100 100" style="width:110px;height:110px">
  <circle cx="50" cy="50" r={R} fill="none" stroke="var(--tile2)" stroke-width="12" />
  <circle cx="50" cy="50" r={R} fill="none" stroke="var(--accent)" stroke-width="12" stroke-linecap="round" stroke-dasharray={dash} transform="rotate(-90 50 50)" />
  <text x="50" y="47" text-anchor="middle" font-size="22" font-weight="800" fill="var(--text)">{value}</text>
  <text x="50" y="63" text-anchor="middle" font-size="12" fill="var(--muted)">/ {goal}</text>
</svg>
