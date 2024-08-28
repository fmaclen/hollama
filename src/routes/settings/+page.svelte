<script lang="ts">
	import { onMount } from 'svelte';
	import { version } from '$app/environment';
	import { CloudDownload } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type {
		ListResponse,
		ErrorResponse,
		ProgressResponse,
		StatusResponse
	} from 'ollama/browser';

	import { ollamaPull, ollamaTags } from '$lib/ollama';
	import { LOCAL_STORAGE_PREFIX, settingsStore, StorageKey } from '$lib/store';
	import i18n from '$lib/i18n';

	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import Head from '$lib/components/Head.svelte';

	export let ollamaURL: URL | null = null;

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
		const toastId = toast.message($i18n.t('pullingModel'), { description: modelTag });

		try {
			await ollamaPull(
				{ model: modelTag, stream: true },
				(response: ProgressResponse | StatusResponse | ErrorResponse) => {
					if ('status' in response && response.status === 'success') {
						toast.success($i18n.t('success'), {
							id: toastId,
							description: $i18n.t('modelWasDownloaded', { model: modelTag })
						});
						modelTag = '';
						return;
					}

					if ('error' in response) {
						toast.error($i18n.t('error'), { id: toastId, description: response.error });
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
					? $i18n.t('errors.couldntConnectToOllamaServer')
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

	function deleteStorage(item: StorageKey): void {
		if (
			confirm(
				$i18n.t('dialogs.areYouSureYouWantToDeleteAll', {
					type: item.replace(`${LOCAL_STORAGE_PREFIX}-`, '')
				})
			)
		) {
			localStorage.removeItem(item);
			location.reload();
		}
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

<Head title={$i18n.t('settings')} />
<section class="settings">
	<div class="settings__container">
		<Fieldset>
			<p class="p"><strong>Ollama</strong></p>
			<FieldInput
				name="server"
				label={$i18n.t('settingsPage.server')}
				placeholder={DETAULT_OLLAMA_SERVER}
				bind:value={ollamaServer}
				on:keyup={getModelsList}
			>
				<svelte:fragment slot="status">
					<Badge variant={serverStatus === 'disconnected' ? 'warning' : 'positive'}>
						{$i18n.t(`settingsPage.${serverStatus}`)}
					</Badge>
				</svelte:fragment>

				<svelte:fragment slot="help">
					{#if ollamaURL && serverStatus === 'disconnected'}
						<div class="field-help">
							<p class="p">
								{$i18n.t('settingsPage.allowConnections')}
								<Badge capitalize={false}>{ollamaURL.origin}</Badge>,
								<Button
									variant="link"
									href="https://github.com/jmorganca/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama"
									target="_blank"
								>
									{$i18n.t('settingsPage.seeDocs')}
								</Button>. {$i18n.t('settingsPage.checkBrowserExtensions')}.
							</p>
							{#if ollamaURL.protocol === 'https:'}
								<p class="p">
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html $i18n.t('settingsPage.tryingToConnectNotLocalhost')}
									<a
										href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/"
										target="_blank"
									>
										{$i18n.t('settingsPage.createTunnel')}
									</a>
									{$i18n.t('settingsPage.or')}
									<a
										href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#loading_locally_delivered_mixed-resources"
										target="_blank"
									>
										{$i18n.t('settingsPage.allowMixedContent')}
									</a>.
								</p>
							{/if}
						</div>
					{/if}
				</svelte:fragment>
			</FieldInput>

			<FieldSelectModel />

			<FieldInput
				name="pull-model"
				label={$i18n.t('settingsPage.pullModel')}
				placeholder={$i18n.t('settingsPage.pullModelPlaceholder')}
				bind:value={modelTag}
				disabled={isPullInProgress || serverStatus === 'disconnected'}
			>
				<svelte:fragment slot="nav">
					<Button
						aria-label={$i18n.t('settingsPage.downloadModel')}
						class="h-full text-muted"
						isLoading={isPullInProgress}
						disabled={!modelTag || isPullInProgress || serverStatus === 'disconnected'}
						on:click={pullModel}
					>
						<CloudDownload class="h-4 w-4" />
					</Button>
				</svelte:fragment>
				<svelte:fragment slot="help">
					<div class="field-help">
						<p class="p">
							{$i18n.t('settingsPage.browseModels')}
							<a href="https://ollama.com/library" target="_blank"
								>{$i18n.t('settingsPage.ollamaLibrary')}</a
							>
						</p>
					</div>
				</svelte:fragment>
			</FieldInput>
		</Fieldset>

		<div class="about">
			<p class="p"><strong>{$i18n.t('settingsPage.dangerZone')}</strong></p>
			<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaSessions)}>
				{$i18n.t('settingsPage.deleteAllSessions')}
			</Button>
			<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaKnowledge)}>
				{$i18n.t('settingsPage.deleteAllKnowledge')}
			</Button>
			<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaSettings)}>
				{$i18n.t('settingsPage.deleteServerSettings')}
			</Button>
		</div>

		<div class="version">
			<p class="p">
				<strong>{$i18n.t('settingsPage.version')}</strong>
				<Button variant="icon" href="https://github.com/fmaclen/hollama/releases" target="_blank">
					<Badge>{version}</Badge>
				</Button>
			</p>
		</div>
	</div>
</section>

<style lang="postcss">
	.settings {
		@apply base-section;
		@apply flex border-spacing-1 flex-col bg-shade-1;
	}

	.settings__container {
		@apply my-auto flex flex-col gap-y-4;
	}

	.about,
	.version {
		@apply container mx-auto flex max-w-[80ch] flex-col gap-y-2 p-4;
		@apply lg:p-6;
	}

	.version {
		@apply last:py-0 last:text-muted;
	}

	.code {
		@apply rounded-md p-1 text-active;
	}

	.p {
		@apply text-sm;

		strong {
			@apply font-medium leading-none;
		}
	}

	.field-help {
		@apply my-2 flex flex-col gap-y-3 px-0.5 text-muted;
	}

	a {
		@apply text-link;
	}
</style>
