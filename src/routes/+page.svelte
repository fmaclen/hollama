<script lang="ts">
	import { onMount } from 'svelte';

	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import Field from '$lib/components/Field.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';

	import type { OllamaTagResponse } from '$lib/ollama';
	import { settingsStore } from '$lib/store';

	export let ollamaURL: URL | null = null;

	const DETAULT_OLLAMA_SERVER = 'http://localhost:11434';
	let serverStatus: 'connected' | 'disconnected' = 'connected';

	let ollamaServer = $settingsStore?.ollamaServer || DETAULT_OLLAMA_SERVER;
	let ollamaModel = $settingsStore?.ollamaModel || '';
	let ollamaTagResponse: OllamaTagResponse | null = null;

	$: settingsStore.set({
		ollamaServer,
		ollamaModels: ollamaTagResponse?.models || [],
		ollamaModel
	});

	async function getModelsList(): Promise<void> {
		try {
			if (!ollamaServer) throw new Error('No server provided');

			const response = await fetch(`${ollamaServer}/api/tags`);
			const data = (await response.json()) as OllamaTagResponse;
			ollamaTagResponse = data;
			serverStatus = 'connected';
		} catch {
			ollamaTagResponse = null;
			serverStatus = 'disconnected';
		}
	}

	function deleteSessions(): void {
		if (confirm('Are you sure you want to delete all sessions?')) {
			localStorage.removeItem('hollama-sessions');
			location.reload();
		}
	}

	function deleteSettings(): void {
		if (confirm('Are you sure you want to delete server settings?')) {
			localStorage.removeItem('hollama-settings');
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

<section class="settings">
	<Fieldset>
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
							size="link"
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

	<Fieldset>
		<Field name="danger-zone">
			<svelte:fragment slot="label">Danger zone</svelte:fragment>
			<Button variant="outline" on:click={deleteSessions}>Delete all sessions</Button>
			<Button variant="outline" on:click={deleteSettings}>Delete server settings</Button>
		</Field>
	</Fieldset>

	<div class="about">
		<p class="p"><strong>About</strong></p>
		<p class="p">
			<strong>Hollama</strong> is a minimalistic web interface for
			<Button
				variant="link"
				size="link"
				href="https://github.com/jmorganca/ollama/"
				target="_blank"
			>
				Ollama
			</Button>
			servers. Code is available on
			<Button variant="link" size="link" href="https://github.com/fmaclen/hollama" target="_blank">
				Github
			</Button>
		</p>
		<p class="p">
			Made by
			<Button variant="link" size="link" href="https://fernando.is" target="_blank">
				@fmaclen
			</Button>
		</p>
	</div>
</section>

<style lang="scss">
	@import '$lib/mixins.scss';

	.settings {
		@include base-section;
		@apply flex border-spacing-1 flex-col gap-y-16 p-10;
	}

	.about {
		@apply container mx-auto flex max-w-[80ch] flex-col gap-y-2;
	}

	.code {
		@apply rounded-md p-1 text-active;
	}

	.p {
		strong {
			@apply font-medium leading-none text-active;
		}
	}
</style>
