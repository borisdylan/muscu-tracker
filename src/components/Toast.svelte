<script lang="ts">
  import { toastState } from '../lib/toast.svelte';
</script>

{#if toastState.visible}
  <div class="toast">{toastState.msg}</div>
{/if}
