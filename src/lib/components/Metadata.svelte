<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		dataTestid?: string;
		children?: Snippet;
	}

	let { dataTestid = undefined, children }: Props = $props();
</script>

<p class="metadata" data-testid={dataTestid}>
	{@render children?.()}
</p>

<style lang="postcss">
	.metadata {
		@apply max-w-full truncate whitespace-nowrap text-xs text-muted;
	}
</style>
