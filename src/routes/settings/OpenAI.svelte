<script lang="ts">
	import { MonitorUp } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';
	import { OpenAIStrategy } from '$lib/chat/openai';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldHelp from '$lib/components/FieldHelp.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { settingsStore } from '$lib/localStorage';

	const DEFAULT_OPENAI_SERVER = 'https://api.openai.com/v1';

	let openai = new OpenAIStrategy();
	let openaiServer = $settingsStore.openaiServer || DEFAULT_OPENAI_SERVER;
	let openaiApiKey = $settingsStore.openaiApiKey || '';
	let openaiServerStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

	$: settingsStore.update((settings) => ({ ...settings, openaiServer, openaiApiKey }));

	async function getModelsList(): Promise<void> {
		openaiServerStatus = 'connecting';
		try {
			await openai.getModels();
			openaiServerStatus = 'connected';
		} catch {
			openaiServerStatus = 'disconnected';
		}
	}

	async function updateOpenAIConfig() {
		openai.config({ server: openaiServer, apiKey: openaiApiKey });
		await getModelsList();
	}
</script>

<Fieldset>
	<P><strong>OpenAI</strong></P>
	<FieldInput
		name="baseUrl"
		label={$LL.baseUrl()}
		placeholder={DEFAULT_OPENAI_SERVER}
		bind:value={openaiServer}
	>
		<svelte:fragment slot="status">
			{#if openaiServerStatus === 'disconnected'}
				<Badge variant="warning">{$LL.disconnected()}</Badge>
			{:else if openaiServerStatus === 'connecting'}
				<Badge variant="warning">{$LL.connecting()}</Badge>
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
		type="password"
	>
		<svelte:fragment slot="nav">
			<Button
				aria-label="Connect"
				class="h-full text-muted"
				isLoading={openaiServerStatus === 'connecting'}
				disabled={openaiServerStatus === 'connecting' || !openaiServer || !openaiApiKey}
				on:click={updateOpenAIConfig}
			>
				<MonitorUp class="base-icon" />
			</Button>
		</svelte:fragment>

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
