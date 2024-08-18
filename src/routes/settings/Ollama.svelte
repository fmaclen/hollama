<script lang="ts">
	import { onMount } from 'svelte';
	import type { ErrorResponse, ListResponse, ProgressResponse, StatusResponse } from 'ollama/browser';
	import { toast } from 'svelte-sonner';
	import { CloudDownload } from 'lucide-svelte';

	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';

	import { settingsStore } from '$lib/store';
	import { ollamaPull, ollamaTags } from '$lib/ollama';
	import FieldHelp from '$lib/components/FieldHelp.svelte';

	let ollamaURL: URL | null = null;

	const DETAULT_OLLAMA_SERVER = 'http://localhost:11434';
	let serverStatus: 'connected' | 'disconnected' = 'connected';

	let ollamaServer = $settingsStore?.ollamaServer || DETAULT_OLLAMA_SERVER;
	let ollamaModel = $settingsStore?.ollamaModel || '';
	let ollamaTagResponse: ListResponse | null = null;
	let modelTag: string | undefined;
	let isPullInProgress = false;

	$: settingsStore.update((settings) => ({
		...settings,
		ollamaServer,
		ollamaModels: ollamaTagResponse?.models || [],
		ollamaModel
	}));

	async function getModelsList(): Promise<void> {
		try {
			ollamaTagResponse = await ollamaTags();
			serverStatus = 'connected';
		} catch {
			ollamaTagResponse = null;
			serverStatus = 'disconnected';
		}
	}

	async function pullModel() {
		if (!modelTag) return;
		isPullInProgress = true;
		const toastId = toast.message('Pulling model', { description: modelTag });

		try {
			await ollamaPull(
				{ model: modelTag, stream: true },
				(response: ProgressResponse | StatusResponse | ErrorResponse) => {
					if ('status' in response && response.status === 'success') {
						toast.success('Success', {
							id: toastId,
							description: `${modelTag} was downloaded`
						});
						modelTag = '';
						return;
					}

					if ('error' in response) {
						toast.error('Error', { id: toastId, description: response.error });
						return;
					}

					if ('completed' in response && 'total' in response) {
						const progress = (response.completed / response.total) * 100;
						toast.loading(response.status, {
							id: toastId,
							description: `${progress.toFixed(0)}%`
						});
					}
				}
			);
			await getModelsList();
		} catch (error) {
			const typedError = error instanceof Error ? error : new Error(String(error));

			toast.error(
				typedError.message === 'Failed to fetch'
					? "Couldn't connect to Ollama server"
					: typedError.message,
				{
					id: toastId,
					description: ''
				}
			);
			ollamaTagResponse = null;
			serverStatus = 'disconnected';
		}
		isPullInProgress = false;
	}

	onMount(async () => {
		// Get the current URL and set the default server
		ollamaURL = new URL(window.location.href);
		if (ollamaURL.port) {
			ollamaURL = new URL(
				`${ollamaURL.protocol}//${ollamaURL.hostname}${ollamaURL.pathname}${ollamaURL.search}${ollamaURL.hash}`
			);
		}

		await getModelsList();
	});
</script>

<Fieldset>
	<P><strong>Ollama</strong></P>
	<FieldInput
		name="server"
		label="Server"
		placeholder={DETAULT_OLLAMA_SERVER}
		bind:value={ollamaServer}
		on:keyup={getModelsList}
	>
		<svelte:fragment slot="status">
			<Badge variant={serverStatus === 'disconnected' ? 'warning' : 'positive'}>
				{serverStatus}
			</Badge>
		</svelte:fragment>

		<svelte:fragment slot="help">
			{#if ollamaURL && serverStatus === 'disconnected'}
				<FieldHelp>
					<P>
						Needs to allow connections from
						<Badge capitalize={false}>{ollamaURL.origin}</Badge>
						in
						<Badge capitalize={false}>OLLAMA_ORIGINS</Badge>,
						<Button
							variant="link"
							href="https://github.com/jmorganca/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama"
							target="_blank"
						>
							see docs
						</Button>. Also check no browser extensions are blocking the connection.
					</P>
					{#if ollamaURL.protocol === 'https:'}
						<P>
							If trying to connect to an Ollama server that is not available on
							<code class="code">localhost</code> or <code class="code">127.0.0.1</code> you will
							need to
							<a
								href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/"
								target="_blank"
							>
								create a tunnel
							</a>
							to your server or
							<Button
								href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#loading_locally_delivered_mixed-resources"
								target="_blank"
							>
								allow mixed content
							</Button> in this browser's site settings.
						</P>
					{/if}
				</FieldHelp>
			{/if}
		</svelte:fragment>
	</FieldInput>

	<FieldSelectModel />

	<FieldInput
		name="pull-model"
		label="Pull model"
		placeholder="Model tag (e.g. llama3.1)"
		bind:value={modelTag}
		disabled={isPullInProgress || serverStatus === 'disconnected'}
	>
		<svelte:fragment slot="nav">
			<Button
				aria-label="Download model"
				class="h-full text-muted"
				isLoading={isPullInProgress}
				disabled={!modelTag || isPullInProgress || serverStatus === 'disconnected'}
				on:click={pullModel}
			>
				<CloudDownload class="h-4 w-4" />
			</Button>
		</svelte:fragment>
		<svelte:fragment slot="help">
			<FieldHelp>
				<P>
					Browse the list of available models in
					<Button href="https://ollama.com/library" variant="link" target="_blank">Ollama's library</Button>
				</P>
			</FieldHelp>
		</svelte:fragment>
	</FieldInput>
</Fieldset>
