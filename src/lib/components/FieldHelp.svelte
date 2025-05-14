<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="my-2 flex flex-col gap-y-1 px-0.5 text-muted">
	{@render children()}
</div>
