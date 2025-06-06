<script lang="ts">
	import { type Snippet } from 'svelte';

	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import SidebarToggle from '$lib/components/SidebarToggle.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<RobotsNoIndex />

<div class="flex h-full w-full">
	<main class="flex min-w-0 flex-1 flex-col bg-shade-1 lg:rounded-xl lg:border">
		<div class="flex items-center gap-2 border-b p-4 lg:border-b-0">
			<SidebarToggle />
		</div>

		<div class="flex-1 overflow-auto">
			{@render children()}
		</div>
	</main>
</div>
