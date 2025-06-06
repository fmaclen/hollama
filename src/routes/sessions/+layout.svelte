<script lang="ts">
	import { type Snippet } from 'svelte';

	import { browser } from '$app/environment';
	import { getLastUsedModels } from '$lib/chat';
	import { OllamaStrategy } from '$lib/chat/ollama';
	import { OpenAIStrategy } from '$lib/chat/openai';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import SidebarToggle from '$lib/components/SidebarToggle.svelte';
	import { ConnectionType } from '$lib/connections';
	import { serversStore, settingsStore } from '$lib/localStorage';
	import { type Model } from '$lib/settings';

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
			return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
		});
	}

	$effect(() => {
		if (browser) {
			listModels().then((models) => {
				$settingsStore.models = models;
				$settingsStore.lastUsedModels = getLastUsedModels();
			});
		}
	});
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
