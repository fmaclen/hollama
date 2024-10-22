<script lang="ts">
	import { RefreshCw } from 'lucide-svelte';
	import { onMount } from 'svelte';
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

	let openai: OpenAIStrategy;
	let openaiServer = $settingsStore.openaiServer || DEFAULT_OPENAI_SERVER;
	let openaiApiKey = $settingsStore.openaiApiKey || '';
	let openaiServerStatus: 'success' | 'error' | 'loading';

	$: settingsStore.update((settings) => ({ ...settings, openaiServer, openaiApiKey }));

	onMount(() => {
		const server = $settingsStore.openaiServer;
		const apiKey = $settingsStore.openaiApiKey;
		if (!server || !apiKey) return;
		openai = new OpenAIStrategy({ server, apiKey });
	});

	async function getModelsList(): Promise<void> {
		openaiServerStatus = 'loading';
		const toastId = toast.loading($LL.connecting());
		try {
			await openai.getModels();
			openaiServerStatus = 'success';
			toast.success($LL.openaiSyncSuccessful(), { id: toastId });
		} catch {
			openaiServerStatus = 'error';
			toast.error($LL.openaiSyncFailed(), { id: toastId });
		}
	}

	async function updateOpenAIConfig() {
		if (!openaiServer || !openaiApiKey) return;

		const credentials = { server: openaiServer, apiKey: openaiApiKey };
		if (!openai) openai = new OpenAIStrategy(credentials);
		else openai.config(credentials);

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
				isLoading={openaiServerStatus === 'loading'}
				disabled={openaiServerStatus === 'loading' || !openaiServer || !openaiApiKey}
				on:click={updateOpenAIConfig}
			>
				<RefreshCw class="base-icon" />
			</Button>
		</svelte:fragment>

		<svelte:fragment slot="help">
			{#if openaiApiKey === 'ollama' || openaiServerStatus === 'error'}
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
