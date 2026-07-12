<script lang="ts">
  let { values, labels }: { values: number[]; labels: string[] } = $props();

  const W = 320, H = 140, pad = 8, padB = 20, gap = 10;
  const bars = $derived.by(() => {
    const max = Math.max(...values, 1);
    const bw = (W - 2 * pad - gap * (values.length - 1)) / values.length;
    return values.map((v, i) => {
      const bh = (v / max) * (H - padB - pad);
      return {
        x: (pad + i * (bw + gap)).toFixed(1),
        y: (H - padB - bh).toFixed(1),
        w: bw.toFixed(1),
        h: Math.max(bh, 2).toFixed(1),
        op: v ? 1 : 0.25,
      };
    });
  });
</script>

<svg class="chart" viewBox="0 0 {W} {H}">
  {#each bars as b}
    <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="4" fill="var(--accent)" opacity={b.op} />
  {/each}
</svg>
<div class="chart-x">{#each labels as l}<span>{l}</span>{/each}</div>
