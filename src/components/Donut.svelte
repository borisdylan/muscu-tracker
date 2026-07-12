<script lang="ts">
  let { segs }: { segs: Array<[string, number]> } = $props();

  const COLORS = ['#3b82f6', '#60a5fa', '#38bdf8', '#2563eb', '#22d3ee', '#93c5fd'];
  const R = 42;
  const C = 2 * Math.PI * R;

  const arcs = $derived.by(() => {
    const total = segs.reduce((a, s) => a + s[1], 0) || 1;
    let off = 0;
    return segs.map((s, i) => {
      const len = (s[1] / total) * C;
      const arc = { color: COLORS[i % COLORS.length], dash: `${len.toFixed(1)} ${(C - len).toFixed(1)}`, offset: (-off).toFixed(1) };
      off += len;
      return arc;
    });
  });
</script>

<svg viewBox="0 0 110 110" style="width:120px;height:120px">
  {#if arcs.length}
    {#each arcs as a}
      <circle cx="55" cy="55" r={R} fill="none" stroke={a.color} stroke-width="16" stroke-dasharray={a.dash} stroke-dashoffset={a.offset} transform="rotate(-90 55 55)" />
    {/each}
  {:else}
    <circle cx="55" cy="55" r={R} fill="none" stroke="var(--tile2)" stroke-width="16" />
  {/if}
</svg>
