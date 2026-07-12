<script lang="ts">
  let {
    values,
    labels,
    area = false,
    dots = false,
  }: { values: number[]; labels: string[]; area?: boolean; dots?: boolean } = $props();

  const W = 320, H = 150, pad = 10, padB = 22;
  const gid = 'lg' + Math.random().toString(36).slice(2, 7);

  const view = $derived.by(() => {
    if (!values.length || values.every((v) => v === 0)) return { empty: true as const };
    const max = Math.max(...values);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const px = (i: number) => pad + (values.length === 1 ? (W - 2 * pad) / 2 : (i / (values.length - 1)) * (W - 2 * pad));
    const py = (v: number) => (H - padB) - ((v - min) / range) * (H - padB - pad);
    let d = '';
    values.forEach((v, i) => { d += (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(v).toFixed(1) + ' '; });
    const areaD = `M${px(0)} ${H - padB} ` + values.map((v, i) => `L${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ') + ` L${px(values.length - 1)} ${H - padB} Z`;
    const dotsArr = values.map((v, i) => ({ cx: px(i).toFixed(1), cy: py(v).toFixed(1) }));
    return { empty: false as const, d, areaD, dots: dotsArr };
  });
</script>

{#if view.empty}
  <div class="muted" style="text-align:center;padding:30px 0">Pas assez de données pour un graphique.</div>
{:else}
  <svg class="chart" viewBox="0 0 {W} {H}">
    <defs>
      <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--accent)" stop-opacity="0.22" />
        <stop offset="1" stop-color="var(--accent)" stop-opacity="0" />
      </linearGradient>
    </defs>
    {#if area}<path d={view.areaD} fill="url(#{gid})" />{/if}
    <path d={view.d} fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    {#if dots}{#each view.dots as dt}<circle cx={dt.cx} cy={dt.cy} r="3.5" fill="var(--accent)" />{/each}{/if}
  </svg>
  <div class="chart-x">{#each labels as l}<span>{l}</span>{/each}</div>
{/if}
