<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { serversStore } from '$lib/localStorage';
	import { ConnectionType, type Server } from '$lib/connections';

	import Connection from './Connection.svelte';

	const SUPPORTED_CONNECTION_TYPES = [
		{ value: ConnectionType.Ollama, label: 'Ollama' },
		{ value: ConnectionType.OpenAI, label: 'OpenAI: Official API' },
		{ value: ConnectionType.OpenAICompatible, label: 'OpenAI: Compatible servers (i.e. llama.cpp)' }
	];

	let newConnectionType: ConnectionType | undefined = $state();

	function addServer() {
		if (!newConnectionType) return;

		const newServer: Server = {
			id: crypto.randomUUID(),
			connectionType: newConnectionType,
			baseUrl: getDefaultBaseUrl(),
			isEnabled: false,
			isVerified: null,
			modelFilter: newConnectionType === ConnectionType.OpenAI ? 'gpt' : undefined
		};

		serversStore.update((servers) => [...servers, newServer]);
		newConnectionType = undefined;
	}

	function getDefaultBaseUrl(): string {
		switch (newConnectionType) {
			case ConnectionType.Ollama:
				return 'http://localhost:11434';
			case ConnectionType.OpenAI:
				return 'https://api.openai.com/v1';
			case ConnectionType.OpenAICompatible:
				return 'http://localhost:8080/v1';
			default:
				return '';
		}
	}
</script>

<Fieldset>
	<P>
		<strong>{$LL.servers()}</strong>
	</P>

	<div class="connections">
		<div class="connections__add">
			<FieldSelect
				name="connectionType"
				isLabelVisible={false}
				label={$LL.connectionType()}
				placeholder={$LL.connectionType()}
				options={SUPPORTED_CONNECTION_TYPES}
				bind:value={newConnectionType}
			/>
			<Button disabled={!newConnectionType} on:click={addServer}>
				{$LL.addConnection()}
			</Button>
		</div>
	</div>

	<div class="servers">
		{#if !$serversStore}
			<div class="servers__empty">
				<EmptyMessage>{$LL.noServerConnections()}</EmptyMessage>
			</div>
		{/if}

		{#each $serversStore as server, index (server.id)}
			<Connection {index} />
		{/each}
	</div>
</Fieldset>

<style lang="postcss">
	.connections {
		@apply mb-4 flex flex-col gap-y-2;
	}

	.connections__add {
		@apply grid grid-cols-[auto_max-content] gap-2;
	}

	.servers {
		@apply flex flex-col gap-y-4;
	}

	.servers__empty {
		@apply col-span-full flex justify-center rounded-md border border-shade-3 p-4;
	}
</style>
