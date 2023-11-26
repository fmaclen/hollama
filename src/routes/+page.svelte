<script lang="ts">
	import { settingsStore } from '$lib/store';
	import { onMount } from 'svelte';

	export let ollamaURL: URL | null = null;

	const DETAULT_OLLAMA_SERVER = 'http://localhost:11434';
	let ollamaServer = $settingsStore?.ollamaServer || DETAULT_OLLAMA_SERVER;
	let ollamaModel = $settingsStore?.ollamaModel || '';

	$: settingsStore.set({
		ollamaServer,
		ollamaModel
	});

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
			<label class="menu__label">
				<strong>Server</strong>
				<input type="text" placeholder={DETAULT_OLLAMA_SERVER} bind:value={ollamaServer} />
				<p class="footnote">
					Needs to allow {#if ollamaURL}<code>{ollamaURL.origin}</code>{/if} in
					<code>OLLAMA_ORIGINS</code>.
					<a
						href="https://github.com/jmorganca/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama"
					>
						Docs
					</a>
				</p>
			</label>
			<label class="menu__label">
				<strong>Model</strong>
				<input type="text" placeholder="yarn-mistral" bind:value={ollamaModel} />
			</label>
		</fieldset>
		<fieldset class="menu__fieldset menu__fieldset--about">
			<legend>About</legend>
			<span>
				<strong>Hollama</strong> is a minimalistic web interface for
				<a href="https://github.com/jmorganca/ollama/">Ollama</a>
				servers. Code is available on <a href="https://github.com/fmaclen/hollama">Github</a>.
				<br/><br/>Made by <a href="https://fernando.is">@fmaclen</a>
			</span>
		</fieldset>
	</form>
</div>

<style lang="scss">
	.menu {
		--color-border: rgba(0, 0, 0, 0.1);
		--color-active: #007aff;

		display: grid;
		width: 100dvw;
		height: 100dvh;
		grid-template-rows: max-content auto max-content;

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
			place-self: center;
			max-width: 640px;
			margin-inline: auto;
		}

		&__fieldset {
			font-size: 14px;
			margin-block: 32px;
			margin-inline: 32px;
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

			input {
				padding: 8px;
				font-size: 14px;
			}
		}
	}

	.footnote {
		margin: unset;
		color: #999;

		code {
			color: #666;
			background-color: #e2e2e2;
			padding-block: 3px;
			padding-inline: 8px;
		}
	}
</style>
