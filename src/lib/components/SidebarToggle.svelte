<script lang="ts">
	import { PanelLeftClose, PanelLeftOpen } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';
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
	aria-label={$settingsStore.sidebarExpanded ? $LL.collapseSidebar() : $LL.expandSidebar()}
	title={$settingsStore.sidebarExpanded ? $LL.collapseSidebar() : $LL.expandSidebar()}
>
	{#if $settingsStore.sidebarExpanded}
		<PanelLeftOpen class="h-4 w-4" />
	{:else}
		<PanelLeftClose class="h-4 w-4" />
	{/if}
</button>
