<script lang="ts">
	import { onMount } from 'svelte';

	import LL from '$i18n/i18n-svelte';
	import { OpenAIStrategy } from '$lib/chat/openai';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldHelp from '$lib/components/FieldHelp.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { settingsStore } from '$lib/localStorage';

	let openaiURL: URL | null = null;

	const DEFAULT_OPENAI_SERVER = 'https://api.openai.com/v1';

	let openai = new OpenAIStrategy();
	let openaiServer = $settingsStore.openaiServer || DEFAULT_OPENAI_SERVER;
	let openaiApiKey = $settingsStore.openaiApiKey || '';
	let openaiServerStatus: 'connected' | 'disconnected' = 'disconnected';

	$: settingsStore.update((settings) => ({ ...settings, openaiServer, openaiApiKey }));

	async function getModelsList(): Promise<void> {
		try {
			await openai.getModels();
			openaiServerStatus = 'connected';
		} catch {
			openaiServerStatus = 'disconnected';
		}
	}

	onMount(async () => {
		// Get the current URL and set the default server
		openaiURL = new URL(window.location.href);
		if (openaiURL.port) {
			openaiURL = new URL(
				`${openaiURL.protocol}//${openaiURL.hostname}${openaiURL.pathname}${openaiURL.search}${openaiURL.hash}`
			);
		}

		await getModelsList();
	});
</script>

<Fieldset>
	<P><strong>OpenAI</strong></P>
	<FieldInput
		name="baseUrl"
		label={$LL.baseUrl()}
		placeholder={DEFAULT_OPENAI_SERVER}
		bind:value={openaiServer}
		on:keyup={getModelsList}
	>
		<svelte:fragment slot="status">
			{#if openaiServerStatus === 'disconnected'}
				<Badge variant="warning">{$LL.disconnected()}</Badge>
			{:else}
				<Badge variant="positive">{$LL.connected()}</Badge>
			{/if}
		</svelte:fragment>
	</FieldInput>

	<FieldInput
		name="apiKey"
		label={$LL.apiKey()}
		bind:value={openaiApiKey}
		placeholder={$LL.noApiKey()}
	>
		<svelte:fragment slot="help">
			{#if openaiApiKey === 'ollama' || openaiServerStatus === 'disconnected'}
				<FieldHelp>
					<P>
						<Button
							variant="link"
							href="https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key"
							target="_blank"
						>
							{$LL.howToObtainOpenAIKey()}
						</Button>
					</P>
				</FieldHelp>
			{/if}
		</svelte:fragment>
	</FieldInput>
</Fieldset>
