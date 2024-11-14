<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { settingsStore } from '$lib/localStorage';
	import type { Server } from '$lib/settings';

	import Connection from './Connection.svelte';

	const SUPPORTED_PROVIDERS = [
		{ value: 'ollama', label: 'Ollama' },
		{ value: 'openai', label: 'OpenAI: Official API' },
		{ value: 'openai-compatible', label: 'OpenAI: Compatible servers (i.e. llama.cpp)' }
	];

	let newProvider: 'ollama' | 'openai' | 'openai-compatible' | undefined;

	function addServer() {
		if (!newProvider) return;

		const newServer: Server = {
			id: crypto.randomUUID(),
			provider: newProvider,
			baseUrl: getDefaultBaseUrl(),
			isEnabled: false,
			isVerified: null,
			modelFilter: newProvider === 'openai' ? 'gpt' : ''
		};

		$settingsStore.servers = [...($settingsStore.servers || []), newServer];

		newProvider = undefined;
	}

	function getDefaultBaseUrl(): string {
		switch (newProvider) {
			case 'ollama':
				return 'http://localhost:11434';
			case 'openai':
				return 'https://api.openai.com/v1';
			case 'openai-compatible':
				return 'http://localhost:8080';
			default:
				return '';
		}
	}
</script>

<Fieldset>
	<P>
		<strong>Servers</strong>
	</P>

	<div class="servers__add">
		<FieldSelect
			name="provider"
			isLabelVisible={false}
			label={'FIXME: label should be an optional prop, isLabelVisible should be removed'}
			placeholder="Connection type"
			options={SUPPORTED_PROVIDERS}
			bind:value={newProvider}
		/>
		<Button variant="outline" on:click={addServer}>Add</Button>
	</div>

	<div class="servers">
		{#each $settingsStore.servers as server}
			<Connection {server} />
		{/each}
	</div>
</Fieldset>

<style lang="postcss">
	.servers {
		@apply flex flex-col gap-y-4;
	}

	.servers__add {
		@apply grid grid-cols-[auto_max-content] gap-2 mb-4;
	}
</style>
