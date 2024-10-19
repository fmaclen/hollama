<script lang="ts">
	import { CloudDownload } from 'lucide-svelte';
	import type {
		ErrorResponse,
		ListResponse,
		ProgressResponse,
		StatusResponse
	} from 'ollama/browser';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import LL from '$i18n/i18n-svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldHelp from '$lib/components/FieldHelp.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { settingsStore } from '$lib/localStorage';
	import { ollamaPull, ollamaTags } from '$lib/ollama';

	let ollamaURL: URL | null = null;

	const DETAULT_OLLAMA_SERVER = 'http://localhost:11434';

	let ollamaServer = $settingsStore.ollamaServer || DETAULT_OLLAMA_SERVER;
	let ollamaModel = $settingsStore.ollamaModel || '';
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
			$settingsStore.ollamaServerStatus = 'connected';
		} catch {
			ollamaTagResponse = null;
			$settingsStore.ollamaServerStatus = 'disconnected';
		}
	}

	async function pullModel() {
		if (!modelTag) return;
		isPullInProgress = true;
		const toastId = toast.loading($LL.pullingModel(), { description: modelTag });

		try {
			await ollamaPull(
				{ model: modelTag, stream: true },
				(response: ProgressResponse | StatusResponse | ErrorResponse) => {
					if ('status' in response && response.status === 'success') {
						toast.success($LL.success(), {
							id: toastId,
							// HACK: `modelTag` is inferred as `string | undefined`
							// but it should be a `string` based on the guard clause above
							description: $LL.modelWasDownloaded({ model: modelTag as string })
						});
						modelTag = '';
						return;
					}

					if ('error' in response) {
						toast.error($LL.genericError(), { id: toastId, description: response.error });
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

			toast.error($LL.genericError(), {
				id: toastId,
				description:
					typedError.message === 'Failed to fetch'
						? $LL.couldntConnectToOllamaServer()
						: typedError.message
			});
			ollamaTagResponse = null;
			$settingsStore.ollamaServerStatus = 'disconnected';
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
		label={$LL.server()}
		placeholder={DETAULT_OLLAMA_SERVER}
		bind:value={ollamaServer}
		on:keyup={getModelsList}
	>
		<svelte:fragment slot="status">
			{#if $settingsStore.ollamaServerStatus === 'disconnected'}
				<Badge variant="warning">{$LL.disconnected()}</Badge>
			{:else}
				<Badge variant="positive">{$LL.connected()}</Badge>
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="help">
			{#if ollamaURL && $settingsStore.ollamaServerStatus === 'disconnected'}
				<FieldHelp>
					<P>
						{$LL.allowConnections()}
						<Badge>{ollamaURL.origin}</Badge>
						<Button
							variant="link"
							href="https://github.com/jmorganca/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama"
							target="_blank"
						>
							{$LL.seeDocs()}
						</Button>
					</P>
					<P>
						{$LL.checkBrowserExtensions()}
					</P>
					{#if ollamaURL.protocol === 'https:'}
						<P>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html $LL.tryingToConnectNotLocalhost({
								hostname: '<code class="badge">localhost</code>',
								ip: '<code class="badge">127.0.0.1</code>'
							})}
							<a
								href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/"
								target="_blank"
							>
								{$LL.creatingTunnel()}
							</a>
							<a
								href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#loading_locally_delivered_mixed-resources"
								target="_blank"
							>
								{$LL.allowMixedContent()}
							</a>.
						</P>
					{/if}
				</FieldHelp>
			{/if}
		</svelte:fragment>
	</FieldInput>

	<FieldSelectModel />

	<FieldInput
		name="pull-model"
		label={$LL.pullModel()}
		placeholder={$LL.pullModelPlaceholder()}
		bind:value={modelTag}
		disabled={isPullInProgress || $settingsStore.ollamaServerStatus === $LL.disconnected()}
	>
		<svelte:fragment slot="nav">
			<Button
				aria-label="Download model"
				class="h-full text-muted"
				isLoading={isPullInProgress}
				disabled={!modelTag ||
					isPullInProgress ||
					$settingsStore.ollamaServerStatus === $LL.disconnected()}
				on:click={pullModel}
			>
				<CloudDownload class="base-icon" />
			</Button>
		</svelte:fragment>
		<svelte:fragment slot="help">
			<FieldHelp>
				<P>
					{$LL.browseModels()}
					<Button href="https://ollama.com/library" variant="link" target="_blank">
						{$LL.ollamaLibrary()}
					</Button>
				</P>
			</FieldHelp>
		</svelte:fragment>
	</FieldInput>
</Fieldset>
