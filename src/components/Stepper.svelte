<script lang="ts">
  let {
    label,
    value = $bindable(),
    step = 1,
    min = 0,
  }: { label: string; value: number; step?: number; min?: number } = $props();

  function dec() { value = Math.max(min, Math.round(((value || 0) - step) * 100) / 100); }
  function inc() { value = Math.round(((value || 0) + step) * 100) / 100; }
</script>

<div class="stepper">
  <div class="s-label">{label}</div>
  <div class="s-row">
    <button class="s-btn minus" onclick={dec} aria-label="moins">−</button>
    <input class="s-val" type="number" inputmode="decimal" bind:value />
    <button class="s-btn plus" onclick={inc} aria-label="plus">＋</button>
  </div>
</div>
