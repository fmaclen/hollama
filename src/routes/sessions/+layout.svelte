<script lang="ts">
	import { onMount } from 'svelte';

	import LL from '$i18n/i18n-svelte';
	import { getLastUsedModels } from '$lib/chat';
	import { OllamaStrategy } from '$lib/chat/ollama';
	import { OpenAIStrategy } from '$lib/chat/openai';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import { ConnectionType } from '$lib/connections';
	import { serversStore, sessionsStore, settingsStore } from '$lib/localStorage';
	import { formatSessionMetadata, getSessionTitle } from '$lib/sessions';
	import { type Model } from '$lib/settings';
	import { Sitemap } from '$lib/sitemap';

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

<Section sitemap={Sitemap.SESSIONS}>
	<svelte:fragment slot="list-items">
		{#if $sessionsStore && $sessionsStore.length > 0}
			{#each $sessionsStore as session}
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
	</svelte:fragment>

	<slot />
</Section>
