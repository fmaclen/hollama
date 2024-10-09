<script lang="ts">
	import { RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import LL from '$i18n/i18n-svelte';
	import { OpenAIStrategy } from '$lib/chat/openai';
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
		toast.warning($LL.connecting());
		try {
			await openai.getModels();
			openaiServerStatus = 'connected';
			toast.success($LL.connected());
		} catch {
			openaiServerStatus = 'disconnected';
			toast.error($LL.disconnected());
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
	/>

	<FieldInput
		name="apiKey"
		label={$LL.apiKey()}
		bind:value={openaiApiKey}
		placeholder={$LL.noApiKey()}
		type="password"
	>
		<svelte:fragment slot="nav">
			<Button
				variant="outline"
				aria-label={$LL.connect()}
				class="h-full text-muted"
				isLoading={openaiServerStatus === 'connecting'}
				disabled={openaiServerStatus === 'connecting' || !openaiServer || !openaiApiKey}
				on:click={updateOpenAIConfig}
			>
				<RefreshCw class="base-icon" />
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
