<script lang="ts">
	import Trash_2 from 'lucide-svelte/icons/trash-2';
	import { type Writable } from 'svelte/store';

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

	$: isOpenAiFamily = ['openai', 'openai-compatible'].includes($server.connectionType);
	$: if ($server) $settingsStore.servers.splice(index, 1, $server);

	async function verifyServer() {
		strategy = isOpenAiFamily ? new OpenAIStrategy($server) : new OllamaStrategy($server);
		$server.isVerified = (await strategy.verifyServer()) ? new Date() : null;
		if ($server.isVerified) $server.isEnabled = true;
	}

	function deleteServer() {
		$settingsStore.servers = $settingsStore.servers.filter((s) => s.id !== $server.id);
	}
</script>

<fieldset class="connection">
	<legend class="connection__legend">
		{#if ['openai', 'ollama'].includes($server.connectionType)}
			<Badge variant={$server.connectionType === 'openai' ? 'openai' : 'ollama'} />
		{/if}
		<Badge>{$server.name ? $server.name : $server.connectionType?.toUpperCase()}</Badge>
	</legend>
	<Fieldset>
		<nav class="connection__nav">
			<FieldCheckbox label={$LL.useModelsFromThisServer()} bind:checked={$server.isEnabled} />
			<Button
				class="max-h-full"
				variant="outline"
				on:click={deleteServer}
				aria-label={$LL.deleteServer()}
			>
				<Trash_2 class="base-icon" />
			</Button>
			<Button variant={!$server.isVerified ? 'default' : 'outline'} on:click={verifyServer}>
				{$server.isVerified ? $LL.reVerify() : $LL.verify()}
			</Button>
		</nav>

		<div class="connection__grid">
			<div class="connection__host" class:connection__host--openai={isOpenAiFamily}>
				<FieldInput
					name={`server-${index}`}
					label={$LL.baseUrl()}
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
				label={$LL.modelsFilter()}
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
	.connection {
		@apply rounded-md border border-shade-4 p-4;
	}

	.connection__legend {
		@apply flex h-full items-stretch gap-x-2;
	}

	.connection__nav {
		@apply flex items-stretch gap-x-2;
	}

	.connection__grid {
		@apply grid grid-cols-2 gap-2;
	}

	.connection__host {
		@apply col-span-2;

		&--openai {
			@apply grid grid-cols-2 gap-2;
		}
	}
</style>
