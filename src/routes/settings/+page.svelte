<script lang="ts">
	import { onMount } from 'svelte';
	import { version } from '$app/environment';

	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';

	import { ollamaTags, type OllamaTagResponse } from '$lib/ollama';
	import { LOCAL_STORAGE_PREFIX, settingsStore, StorageKey } from '$lib/store';
	import Head from '$lib/components/Head.svelte';

	export let ollamaURL: URL | null = null;

	const DETAULT_OLLAMA_SERVER = 'http://localhost:11434';
	let serverStatus: 'connected' | 'disconnected' = 'connected';

	let ollamaServer = $settingsStore?.ollamaServer || DETAULT_OLLAMA_SERVER;
	let ollamaModel = $settingsStore?.ollamaModel || '';
	let ollamaTagResponse: OllamaTagResponse | null = null;

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

	function deleteStorage(item: StorageKey): void {
		if (
			confirm(
				`Are you sure you want to delete all ${item.replace(`${LOCAL_STORAGE_PREFIX}-`, '')}?`
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

<Head title="Settings" />
<section class="settings">
	<div class="settings__container">
		<Fieldset>
			<p class="p"><strong>Ollama</strong></p>
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
						<p class="p">
							Needs to allow connections from
							<code class="code">{ollamaURL.origin}</code>
							in
							<code class="code">OLLAMA_ORIGINS</code>,
							<Button
								variant="link"
								href="https://github.com/jmorganca/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama"
								target="_blank"
							>
								see docs
							</Button>. Also check no browser extensions are blocking the connection.
						</p>
						{#if ollamaURL.protocol === 'https:'}
							<p class="p">
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
								<a
									href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#loading_locally_delivered_mixed-resources"
									target="_blank"
								>
									allow mixed content
								</a> in this browser's site settings.
							</p>
						{/if}
					{/if}
				</svelte:fragment>
			</FieldInput>
			<FieldSelectModel />
		</Fieldset>

		<div class="about">
			<p class="p"><strong>Danger zone</strong></p>
			<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaSessions)}
				>Delete all sessions</Button
			>
			<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaKnowledge)}
				>Delete all knowledge</Button
			>
			<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaSettings)}
				>Delete server settings</Button
			>
		</div>

		<div class="about">
			<p class="p"><strong>About</strong></p>
			<p class="p">
				<strong>Hollama</strong> is a minimalistic web interface for
				<Button variant="link" href="https://github.com/jmorganca/ollama/" target="_blank">
					Ollama
				</Button>
				servers. Code is available on
				<Button variant="link" href="https://github.com/fmaclen/hollama" target="_blank">
					Github
				</Button>
			</p>
			<p class="p">
				Made by
				<Button variant="link" href="https://fernando.is" target="_blank">@fmaclen</Button>
			</p>
		</div>
		<div class="version">
			<p class="p">
				<strong>Version</strong>
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
</style>
