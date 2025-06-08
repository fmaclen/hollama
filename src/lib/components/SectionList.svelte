<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<nav class="overflow-scrollbar flex h-full flex-col">
	{@render children?.()}
</nav>
