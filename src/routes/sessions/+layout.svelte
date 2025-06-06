<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	import LL from '$i18n/i18n-svelte';
	import { getLastUsedModels } from '$lib/chat';
	import { OllamaStrategy } from '$lib/chat/ollama';
	import { OpenAIStrategy } from '$lib/chat/openai';
	import CollapsibleSidebar from '$lib/components/CollapsibleSidebar.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import { ConnectionType } from '$lib/connections';
	import { knowledgeStore, serversStore, sessionsStore, settingsStore } from '$lib/localStorage';
	import { formatSessionMetadata, getSessionTitle } from '$lib/sessions';
	import { type Model } from '$lib/settings';
	import { Sitemap } from '$lib/sitemap';
	import { formatTimestampToNow } from '$lib/utils';

	let { children }: { children: Snippet } = $props();

	async function listModels(): Promise<Model[]> {
		const models: Model[] = [];

		for (const server of $serversStore) {
			if (!server.isEnabled) continue;

			switch (server.connectionType) {
				case ConnectionType.Ollama:
					models.push(...(await new OllamaStrategy(server).getModels().catch(() => [])));
					break;
				case ConnectionType.OpenAI:
				case ConnectionType.OpenAICompatible:
					models.push(...(await new OpenAIStrategy(server).getModels().catch(() => [])));
					break;
			}
		}

		return models.sort((a, b) => {
			const nameA = a.name;
			const nameB = b.name;
			// Compare ignoring case and accents
			return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
		});
	}

	onMount(async () => {
		$settingsStore.models = await listModels();
		$settingsStore.lastUsedModels = getLastUsedModels();
	});
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
