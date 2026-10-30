<script lang="ts">
	import { PanelLeftClose, PanelLeftOpen } from '@lucide/svelte';

	import { settingsStore } from '#lib/localStorage.js';
	import { m } from '#lib/paraglide/messages.js';

	function toggleExpanded() {
		$settingsStore.sidebarExpanded = !$settingsStore.sidebarExpanded;
	}
</script>

<button
	onclick={toggleExpanded}
	class="absolute left-4 top-4 z-30 rounded-lg border bg-shade-1 p-2 transition-colors hover:bg-shade-2"
	aria-label={$settingsStore.sidebarExpanded ? m.collapseSidebar() : m.expandSidebar()}
	title={$settingsStore.sidebarExpanded ? m.collapseSidebar() : m.expandSidebar()}
>
	{#if $settingsStore.sidebarExpanded}
		<PanelLeftOpen class="h-4 w-4" />
	{:else}
		<PanelLeftClose class="h-4 w-4" />
	{/if}
</button>
