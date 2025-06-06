<script lang="ts">
	import { PanelLeftClose, PanelLeftOpen } from 'lucide-svelte';

	import { settingsStore } from '$lib/localStorage';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	function toggleExpanded() {
		$settingsStore.sidebarExpanded = !$settingsStore.sidebarExpanded;
	}
</script>

<button
	onclick={toggleExpanded}
	class="rounded-lg border bg-shade-1 p-2 transition-colors hover:bg-shade-2 {className}"
	title={$settingsStore.sidebarExpanded ? 'Expand sidebar' : 'Collapse sidebar'}
>
	{#if $settingsStore.sidebarExpanded}
		<PanelLeftOpen class="h-4 w-4" />
	{:else}
		<PanelLeftClose class="h-4 w-4" />
	{/if}
</button>
