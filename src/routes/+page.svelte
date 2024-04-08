<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	import { settingsStore } from '$lib/store';

	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import Badge from '$lib/components/ui/badge/badge.svelte';

	export let ollamaURL: URL | null = null;
	let modelList: ModelList | null = null;

	const DETAULT_OLLAMA_SERVER = 'http://localhost:11434';
	let ollamaServer = $settingsStore?.ollamaServer || DETAULT_OLLAMA_SERVER;
	let ollamaModel = { value: $settingsStore?.ollamaModel || '' };
	let serverStatus: 'connected' | 'disconnected' = 'connected';

	$: settingsStore.set({
		ollamaServer,
		ollamaModel: ollamaModel.value
	});

	// HACK: triggers function when selecting all and pressing the delete
	// key on the Ollama server input.
	$: typeof ollamaServer === 'string' && getModelsList();

	interface ModelList {
		models: Model[];
	}

	interface Model {
		name: string;
		modified_at: string;
		size: number;
		digest: string;
	}

	async function getModelsList(): Promise<void> {
		try {
			const response = await fetch(`${ollamaServer}/api/tags`);
			const data = await response.json();
			modelList = data;
			serverStatus = 'connected';
		} catch {
			modelList = null;
			serverStatus = 'disconnected';
		}
	}

	onMount(() => {
		// Get the current URL
		ollamaURL = new URL(window.location.href);
		if (ollamaURL.port) {
			ollamaURL = new URL(
				`${ollamaURL.protocol}//${ollamaURL.hostname}${ollamaURL.pathname}${ollamaURL.search}${ollamaURL.hash}`
			);
		}
	});
</script>

<div class="flex w-full flex-col bg-gray-100">
	<div class="justify-content-center m-auto w-1/2">
		<div class="m-4">
			<Label>
				Server
			</Label>
			<Badge variant={serverStatus === 'disconnected' ? 'destructive' : 'default'}>
				{serverStatus}
			</Badge>
			<Input bind:value={ollamaServer} placeholder={DETAULT_OLLAMA_SERVER} />

			{#if ollamaURL && serverStatus === 'disconnected'}
				<div transition:slide>
					<p class="footnote">
						Needs to allow connections from <code>{ollamaURL.origin}</code> in
						<code>OLLAMA_ORIGINS</code>,
						<a
							href="https://github.com/jmorganca/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama"
							target="_blank">see docs</a
						>. Also check no browser extensions are blocking the connection.
					</p>
					{#if ollamaURL.protocol === 'https:'}
						<p class="footnote">
							If trying to connect to an Ollama server that is not available on
							<code>localhost</code> or <code>127.0.0.1</code> you will need to
							<a
								href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/"
								target="_blank">create a tunnel</a
							>
							to your server or
							<a
								href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#loading_locally_delivered_mixed-resources"
								target="_blank">allow mixed content</a
							> in this browser's site settings.
						</p>
					{/if}
				</div>
			{/if}
		</div>

		<div class="m-4">
			<Label>Model</Label>
			<Select.Root bind:selected={ollamaModel} disabled={!modelList || modelList.models.length === 0}>
				<Select.Trigger>
					<Select.Value placeholder={ollamaModel.value} />
				</Select.Trigger>
				<Select.Content>
					{#if modelList}
						{#each modelList.models as model}
							<Select.Item value={model.name}>{model.name}</Select.Item>
						{/each}
					{:else}
						<Select.Item value="">No models available</Select.Item>
					{/if}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="m-4">
			<p>About</p>
			<p>
				<strong>Hollama</strong> is a minimalistic web interface for
				<a href="https://github.com/jmorganca/ollama/" target="_blank">Ollama</a>
				servers. Code is available on
				<a href="https://github.com/fmaclen/hollama" target="_blank">Github</a>.
				<br /><br />Made by <a href="https://fernando.is" target="_blank">@fmaclen</a>
			</p>
		</div>
	</div>
</div>
