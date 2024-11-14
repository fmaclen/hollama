<script lang="ts">
	import { writable, type Writable } from 'svelte/store';

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

	export let server: Writable<Server>;
	export let index: number;

	let strategy: OllamaStrategy | OpenAIStrategy;

	$: isOpenAiFamily = ['openai', 'openai-compatible'].includes($server.provider);
	$: if ($server) $settingsStore.servers.splice(index, 1, $server);

	async function verifyServer() {
		strategy = isOpenAiFamily ? new OpenAIStrategy($server) : new OllamaStrategy($server);
		$server.isVerified = (await strategy.verifyServer()) ? new Date() : null;
	}

	function deleteServer() {
		$settingsStore.servers = $settingsStore.servers.filter((s) => s.id !== $server.id);
	}
</script>

<fieldset class="server">
	<legend class="flex h-full items-stretch gap-x-2">
		{#if ['openai', 'ollama'].includes($server.provider)}
			<Badge variant={$server.provider} />
		{/if}
		<Badge>{$server.name ? $server.name : $server.provider?.toUpperCase()}</Badge>
	</legend>
	<Fieldset>
		<nav class="server__nav">
			<Button variant={!$server.isVerified ? 'default' : 'outline'} on:click={verifyServer}>
				Verify
			</Button>
			<FieldCheckbox label={'Use models from this server'} bind:checked={$server.isEnabled} />
			<Button variant="outline" on:click={deleteServer}>Delete</Button>
		</nav>

		<div class="server__grid">
			<div class="server__host" class:server__host--openai={isOpenAiFamily}>
				<FieldInput
					name={`server-${index}`}
					label={'Base URL'}
					placeholder={$server.baseUrl}
					bind:value={$server.baseUrl}
				/>
				{#if isOpenAiFamily}
					<FieldInput
						type="password"
						name={`apiKey-${index}`}
						label={$LL.apiKey()}
						bind:value={$server.apiKey}
					/>
				{/if}
			</div>
			<FieldInput
				name={`modelsFilter-${index}`}
				label={'Models filter'}
				placeholder="gpt"
				bind:value={$server.modelFilter}
			/>
			<FieldInput
				name={`name-${index}`}
				label={$LL.name()}
				bind:value={$server.name}
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
