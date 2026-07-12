<script lang="ts">
  let {
    title,
    back = false,
    action = '',
    onAction,
  }: { title: string; back?: boolean; action?: string; onAction?: () => void } = $props();
</script>

<div class="screen-head">
  {#if back}
    <button class="back" aria-label="Retour" onclick={() => history.back()}>‹</button>
  {/if}
  <h1>{title}</h1>
  {#if action}
    <button class="head-action" onclick={onAction}>{action}</button>
  {/if}
</div>
