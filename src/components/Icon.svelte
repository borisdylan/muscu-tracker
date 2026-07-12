<script lang="ts">
  import { ICONS } from '../lib/icons';
  let { name, size = 18 }: { name: string; size?: number } = $props();
</script>

<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  style="width:{size}px;height:{size}px"
>
  {@html ICONS[name] ?? ''}
</svg>
