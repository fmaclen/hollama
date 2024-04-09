<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	import { settingsStore } from '$lib/store';

	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

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

	// Styles
	const _help = `
		flex
		flex-col
		gap-y-3
	`;

	const _pHelp = `
		text-sm
		text-neutral-500
	`;

	const _code = `
		text-neutral-800
	`;

	const _pAbout = `
		text-sm
		text-neutral-800
	`;

	const _container = `
		flex
		flex-col
		gap-y-3
		mt-6
		mb-6
	`;

	const _label = `
		flex
		items-center
		gap-x-2
	`;

	const _a = `
		underline
		underline-offset-4
		hover:text-neutral-600
	`;
</script>

<div class="flex w-full flex-col bg-gray-100">
	<div class="justify-content-center m-auto max-w-96">
		<div class={_container}>
			<Label class={_label}>
				Server
				<Badge
					class="capitalize"
					variant={serverStatus === 'disconnected' ? 'warning' : 'positive'}
				>
					{serverStatus}
				</Badge>
			</Label>
			<Input bind:value={ollamaServer} placeholder={DETAULT_OLLAMA_SERVER} />

			<!-- {#if ollamaURL} -->
			{#if ollamaURL && serverStatus === 'disconnected'}
				<div transition:slide class={_help}>
					<p class={_pHelp}>
						Needs to allow connections from
						<code class={_code}>{ollamaURL.origin}</code>
						in
						<code class={_code}>OLLAMA_ORIGINS</code>,
						<a
							class={_a}
							href="https://github.com/jmorganca/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama"
							target="_blank"
						>
							see docs
						</a>
						. Also check no browser extensions are blocking the connection.
					</p>
					{#if ollamaURL.protocol === 'https:'}
						<p class={_pHelp}>
							If trying to connect to an Ollama server that is not available on
							<code class={_code}>localhost</code> or <code class={_code}>127.0.0.1</code> you will
							need to
							<a
								href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/"
								target="_blank"
							>
								create a tunnel
							</a>
							to your server or
							<a
								href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#loading_locally_delivered_mixed-resources"
								target="_blank"
							>
								allow mixed content
							</a> in this browser's site settings.
						</p>
					{/if}
				</div>
			{/if}
		</div>

		<div class={_container}>
			<Label class={_label}>Model</Label>
			<Select.Root
				bind:selected={ollamaModel}
				disabled={!modelList || modelList.models.length === 0}
			>
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

		<Separator class="mb-8 mt-8" />

		<div class={_container}>
			<Label class={_label}>About</Label>
			<p class={_pAbout}>
				<strong>Hollama</strong> is a minimalistic web interface for
				<a class={_a} href="https://github.com/jmorganca/ollama/" target="_blank">Ollama</a>
				servers. Code is available on
				<a class={_a} href="https://github.com/fmaclen/hollama" target="_blank">Github</a>
				. Made by
				<a class={_a} href="https://fernando.is" target="_blank">@fmaclen</a>
			</p>
		</div>
	</div>
</div>
