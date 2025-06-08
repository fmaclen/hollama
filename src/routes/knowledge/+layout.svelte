<script lang="ts">
	import { type Snippet } from 'svelte';

	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<RobotsNoIndex />

<div class="flex h-full w-full">
	<main class="flex min-w-0 flex-1 flex-col bg-shade-1 lg:rounded-xl lg:border">
		<div class="flex-1 overflow-auto">
			{@render children()}
		</div>
	</main>
</div>
