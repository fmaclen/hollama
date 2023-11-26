<script lang="ts">
	import { settingsStore } from '$lib/store';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	export let ollamaURL: URL | null = null;
	let modelList: ModelList | null = null;

	const DETAULT_OLLAMA_SERVER = 'http://localhost:11434';
	let ollamaServer = $settingsStore?.ollamaServer || DETAULT_OLLAMA_SERVER;
	let ollamaModel = $settingsStore?.ollamaModel || '';
	let serverStatus: 'connected' | 'disconnected' = 'connected';

	$: settingsStore.set({
		ollamaServer,
		ollamaModel
	});

	$: if ($settingsStore?.ollamaServer) getModelsList();

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

<div class="menu">
	<header class="menu__header">
		<a href="/" title="Main menu">
			<img class="menu__logo" src="/favicon.png" alt="Ollama" width="96" height="96" />
		</a>
		<div class="menu__app">
			<p class="menu__app-name">Hollama</p>
		</div>
	</header>

	<form class="menu__form">
		<fieldset class="menu__fieldset">
			<legend>Sessions</legend>
			<a href={`/${Math.random().toString(36).substring(2, 8)}`}>New session</a>
		</fieldset>

		<fieldset class="menu__fieldset">
			<legend>Ollama settings</legend>
			<label class="menu__label menu__label--{serverStatus}">
				<strong>Server</strong>
				<input type="text" placeholder={DETAULT_OLLAMA_SERVER} bind:value={ollamaServer} />

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

			</label>
			<label class="menu__label">
				<strong>Available models</strong>
				<select bind:value={ollamaModel} disabled={!modelList || modelList.models.length === 0}>
					{#if modelList}
						{#each modelList.models as model}
							<option value={model.name}>{model.name}</option>
						{/each}
					{:else}
						<option value="">No models available</option>
					{/if}
				</select>
			</label>
		</fieldset>

		<fieldset class="menu__fieldset menu__fieldset--about">
			<legend>About</legend>
			<span>
				<strong>Hollama</strong> is a minimalistic web interface for
				<a href="https://github.com/jmorganca/ollama/" target="_blank">Ollama</a>
				servers. Code is available on
				<a href="https://github.com/fmaclen/hollama" target="_blank">Github</a>.
				<br /><br />Made by <a href="https://fernando.is" target="_blank">@fmaclen</a>
			</span>
		</fieldset>
	</form>
</div>

<style lang="scss">
	.menu {
		--color-border: rgba(0, 0, 0, 0.1);
		--color-active: #007aff;

		display: grid;
		width: 100%;
		height: 100dvh;
		grid-template-rows: max-content auto max-content;
		background-color: var(--color-background);

		&__header {
			padding-block: 16px;
			padding-inline: 24px;
			display: flex;
			gap: 16px;
			align-items: center;
			border-bottom: 1px solid var(--color-border);
			background-color: white;
			position: sticky;
			top: 0;
		}

		&__logo {
			display: block;
		}

		&__app-name {
			font-size: 20px;
			margin-block: unset;
			font-weight: 600;
		}

		&__form {
			margin-inline: auto;
		}

		&__fieldset {
			font-size: 14px;
			margin-block: 48px;
			margin-inline: 48px;
			padding-block: 24px;
			padding-inline: 24px;
			display: flex;
			flex-direction: column;
			gap: 24px;
			border-color: var(--color-border);

			&--about {
				gap: 16px;
			}

			legend {
				opacity: 0.5;
			}

			a {
				color: #333;
			}
		}

		&__label {
			display: flex;
			flex-direction: column;
			gap: 8px;
			font-size: 14px;
			--color-server-status: #666;

			select,
			input {
				padding: 8px;
				font-size: 14px;
				outline-color: var(--color-server-status);
				border: 1px solid var(--color-server-status);
			}

			select:disabled {
				background-color: var(--color-border);
			}

			&--connected {
				--color-server-status: #14b8a6;
			}

			&--disconnected {
				--color-server-status: #f59e0b;
			}
		}
	}

	.footnote {
		margin: unset;
		color: #999;
		line-height: 1.5em;

		code {
			color: #666;
			background-color: #e2e2e2;
			padding-block: 2px;
			padding-inline: 4px;
		}
	}
</style>
