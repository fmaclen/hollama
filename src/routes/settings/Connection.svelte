<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { OllamaStrategy } from '$lib/chat/ollama';
	import { OpenAIStrategy } from '$lib/chat/openai';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldCheckbox from '$lib/components/FieldCheckbox.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import { settingsStore } from '$lib/localStorage';
	import type { Server } from '$lib/settings';

	export let server: Server;

	let ollama = new OllamaStrategy(server);
	// let openai = new OpenAIStrategy();

	$: isOpenAiFamily = ['openai', 'openai-compatible'].includes(server.provider);

	async function verifyServer() {
		switch (server.provider) {
			// case 'openai':
			// 	server.isVerified = await openai.verifyServer();
			case 'ollama':
				server.isVerified = (await ollama.verifyServer()) ? new Date() : null;
		}
	}

	function deleteServer() {
		$settingsStore.servers = $settingsStore.servers.filter((s) => s.id !== server.id);
	}
</script>

<fieldset class="server">
	<legend class="flex h-full items-stretch gap-x-2">
		{#if ['openai', 'ollama'].includes(server.provider)}
			<Badge variant={server.provider} />
		{/if}
		<Badge>{server.name ? server.name : server.provider?.toUpperCase()}</Badge>
	</legend>
	<Fieldset>
		<nav class="server__nav">
			<Button variant={!server.isVerified ? 'default' : 'outline'} on:click={verifyServer}>
				Verify
			</Button>
			<FieldCheckbox label={'Use models from this server'} bind:checked={server.isEnabled} />
			<Button variant="outline" on:click={deleteServer}>Delete</Button>
		</nav>

		<div class="server__grid">
			<div class="server__host" class:server__host--openai={isOpenAiFamily}>
				<FieldInput
					name="server"
					label={'Base URL'}
					placeholder={server.baseUrl}
					bind:value={server.baseUrl}
				/>
				{#if isOpenAiFamily}
					<FieldInput name="apiKey" label={$LL.apiKey()} bind:value={server.apiKey} />
				{/if}
			</div>
			<FieldInput
				name="modelsFilter"
				label={'Models filter'}
				placeholder="gpt"
				bind:value={server.modelFilter}
			/>
			<FieldInput
				name="name"
				label={$LL.name()}
				bind:value={server.name}
				placeholder={'my-llama-server'}
			/>
		</div>
	</Fieldset>
</fieldset>

<style lang="postcss">
	.server {
		@apply rounded-md border border-shade-4 p-4;
	}

	.server__nav {
		@apply flex items-center gap-x-2;
	}

	.server__grid {
		@apply grid grid-cols-2 gap-2;
	}

	.server__host {
		@apply col-span-2;

		&--openai {
			@apply grid grid-cols-2 gap-2;
		}
	}
</style>
