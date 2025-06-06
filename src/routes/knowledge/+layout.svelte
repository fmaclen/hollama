<script lang="ts">
	import { type Snippet } from 'svelte';

	import LL from '$i18n/i18n-svelte';
	import CollapsibleSidebar from '$lib/components/CollapsibleSidebar.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import { knowledgeStore, sessionsStore } from '$lib/localStorage';
	import { formatSessionMetadata, getSessionTitle } from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';
	import { formatTimestampToNow } from '$lib/utils';

	let { children }: { children: Snippet } = $props();
</script>

<RobotsNoIndex />

<CollapsibleSidebar>
	{#snippet sessionsContent()}
		{#if $sessionsStore && $sessionsStore.length > 0}
			{#each $sessionsStore as session (session.id)}
				<SectionListItem
					sitemap={Sitemap.SESSIONS}
					id={session.id}
					title={getSessionTitle(session)}
					subtitle={formatSessionMetadata(session)}
				/>
			{/each}
		{:else}
			<EmptyMessage>{$LL.emptySessions()}</EmptyMessage>
		{/if}
	{/snippet}

	{#snippet knowledgeContent()}
		{#if $knowledgeStore && $knowledgeStore.length > 0}
			{#each $knowledgeStore as knowledge (knowledge.id)}
				<SectionListItem
					sitemap={Sitemap.KNOWLEDGE}
					id={knowledge.id}
					title={knowledge.name}
					subtitle={formatTimestampToNow(knowledge.updatedAt)}
				/>
			{/each}
		{:else}
			<EmptyMessage>{$LL.emptyKnowledge()}</EmptyMessage>
		{/if}
	{/snippet}
</CollapsibleSidebar>

<main class="flex-1 overflow-auto bg-shade-1 lg:rounded-xl lg:border">
	{@render children()}
</main>
