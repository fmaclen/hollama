<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<nav class="section-list">
	{@render children?.()}
</nav>

<style lang="postcss">
	.section-list {
		@apply overflow-scrollbar flex h-full flex-col;
	}
</style>
