<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';

	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import FieldModels from '$lib/components/FieldModels.svelte';
	import Field from '$lib/components/Field.svelte';
	import type { OllamaTagResponse } from '$lib/ollama';
	import { sessionsStore, settingsStore } from '$lib/store';
	import { Settings } from 'lucide-svelte';
	import { generateStorageId } from '$lib/utils';

	export let ollamaURL: URL | null = null;

	const DETAULT_OLLAMA_SERVER = 'http://localhost:11434';
	let serverStatus: 'connected' | 'disconnected' = 'connected';

	let ollamaServer = $settingsStore?.ollamaServer || DETAULT_OLLAMA_SERVER;
	let ollamaModel = $settingsStore?.ollamaModel || '';
	let ollamaTagResponse: OllamaTagResponse | null = null;
	let newSessionId: string;

	$: settingsStore.set({
		ollamaServer,
		ollamaModels: ollamaTagResponse?.models || [],
		ollamaModel
	});

	function setSessionId() {
		newSessionId = generateStorageId();
	}

	onMount(setSessionId);

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
		// Get the current URL
		ollamaURL = new URL(window.location.href);
		if (ollamaURL.port) {
			ollamaURL = new URL(
				`${ollamaURL.protocol}//${ollamaURL.hostname}${ollamaURL.pathname}${ollamaURL.search}${ollamaURL.hash}`
			);
		}

		await getModelsList();
	});
</script>

<aside class="flex h-screen flex-col">
	<div class="flex gap-x-2 p-6">
		<Button title="Settings" variant="outline" size="icon" href="/">
			<Settings class="h-4 w-4" />
		</Button>
		<Button
			data-testid="new-session"
			class="w-full"
			variant="outline"
			href={`/${newSessionId}`}
			on:click={setSessionId}
		>
			New session
		</Button>
	</div>

	<Separator />

	<div class="flex h-full flex-col overflow-y-auto py-3">
		{#if $sessionsStore && $sessionsStore.length > 0}
			<!-- Using slice() to reverse $sessionsStore without affecting the original array -->
			{#each $sessionsStore.slice().reverse() as session (session.id)}
				<a
					data-testid="session-item"
					href={`/${session.id}`}
					class="
						flex
						flex-col
						px-6
						py-3
						{$page.url.pathname.includes(session.id) ? 'bg-accent' : 'hover:bg-accent'}
					"
					aria-label={`Session ${session.id}`}
					transition:slide
				>
					<p class="max-w-full truncate whitespace-nowrap text-sm font-bold text-foreground">
						{session.messages[0].content}
					</p>
					<p
						class="flex max-w-full gap-x-2 truncate whitespace-nowrap text-sm text-muted-foreground"
					>
						{session.model}
					</p>
				</a>
			{/each}
		{:else}
			<p
				transition:slide
				class="flex h-full w-full items-center justify-center text-sm text-muted-foreground"
			>
				No sessions in history
			</p>
		{/if}
	</div>
</aside>

<Separator orientation="vertical" />

<div class="flex w-full flex-col bg-secondary">
	<div class="justify-content-center m-auto max-w-[40ch] p-6">
		<div class="fieldset">
			<Field name="server">
				<span slot="title" class="flex w-full items-center justify-between">
					Server
					<Badge variant={serverStatus === 'disconnected' ? 'warning' : 'positive'}>
						{serverStatus}
					</Badge>
				</span>
				<input
					placeholder={DETAULT_OLLAMA_SERVER}
					class="input"
					id="server"
					bind:value={ollamaServer}
					on:keyup={getModelsList}
				/>
			</Field>

			{#if ollamaURL && serverStatus === 'disconnected'}
				<div transition:slide class="help">
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
				</div>
			{/if}
		</div>

		<div class="fieldset">
			<FieldModels />
		</div>

		<Separator class="mb-8 mt-8" />

		<div class="fieldset">
			<Field name="danger-zone">
				<span slot="title">Danger zone</span>
				<Button variant="outline" on:click={deleteSessions}>Delete all sessions</Button>
				<Button variant="outline" on:click={deleteSettings}>Delete server settings</Button>
			</Field>
		</div>

		<Separator class="mb-8 mt-8" />

		<div class="fieldset">
			<p class="p"><strong>About</strong></p>
			<p class="p">
				<strong>Hollama</strong> is a minimalistic web interface for
				<Button
					variant="link"
					size="link"
					href="https://github.com/jmorganca/ollama/"
					target="_blank">Ollama</Button
				>
				servers. Code is available on
				<Button
					variant="link"
					size="link"
					href="https://github.com/fmaclen/hollama"
					target="_blank"
				>
					Github
				</Button>.
			</p>
			<p class="p">
				Made by
				<Button variant="link" size="link" href="https://fernando.is" target="_blank">
					@fmaclen
				</Button>
			</p>
		</div>
	</div>
</div>

<style lang="scss">
	.fieldset {
		@apply mb-6 mt-6 flex flex-col gap-y-3;
	}

	.help {
		@apply flex flex-col gap-y-3;
	}

	.code {
		@apply text-neutral-800;
	}

	.input {
		@apply flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
	}

	.p {
		@apply text-sm text-neutral-500;

		strong {
			@apply font-medium leading-none text-primary;
		}
	}
</style>
