<script lang="ts">
	import { writable, type Writable } from 'svelte/store';

	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { settingsStore } from '$lib/localStorage';
	import type { Server } from '$lib/settings';

	import Connection from './Connection.svelte';

	const SUPPORTED_CONNECTION_TYPES = [
		{ value: 'ollama', label: 'Ollama' },
		{ value: 'openai', label: 'OpenAI: Official API' },
		{ value: 'openai-compatible', label: 'OpenAI: Compatible servers (i.e. llama.cpp)' }
	];

	let newConnectionType: 'ollama' | 'openai' | 'openai-compatible' | undefined = undefined;

	function addServer() {
		if (!newConnectionType) return;

		const newServer: Server = {
			id: crypto.randomUUID(),
			connectionType: newConnectionType,
			baseUrl: getDefaultBaseUrl(),
			isEnabled: false,
			isVerified: null,
			modelFilter: newConnectionType === 'openai' ? 'gpt' : ''
		};

		$settingsStore.servers = [...($settingsStore.servers || []), newServer];
		newConnectionType = undefined;
	}

	function getDefaultBaseUrl(): string {
		switch (newConnectionType) {
			case 'ollama':
				return 'http://localhost:11434';
			case 'openai':
				return 'https://api.openai.com/v1';
			case 'openai-compatible':
				return 'http://localhost:8080/v1';
			default:
				return '';
		}
	}
</script>

<!-- HACK: for some reason FieldSelect and Connection components are not re-rendering when `$settingsStore.servers` or `newConnectionType` changes -->
{#key $settingsStore.servers}
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
			{#if !$settingsStore.servers.length}
				<div class="servers__empty">
					<EmptyMessage>{$LL.noServerConnections()}</EmptyMessage>
				</div>
			{/if}

			{#each $settingsStore.servers as server, index}
				{@const serverStore = writable(server)}
				<Connection server={serverStore} {index} />
			{/each}
		</div>
	</Fieldset>
{/key}

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
