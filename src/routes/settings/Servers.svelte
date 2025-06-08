<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { ConnectionType, getDefaultServer } from '$lib/connections';
	import { serversStore } from '$lib/localStorage';

	import Connection from './Connection.svelte';

	let newConnectionType: ConnectionType | undefined = $state();

	function addServer() {
		if (!newConnectionType) return;
		const server = getDefaultServer(newConnectionType);
		serversStore.update((servers) => [...servers, server]);
		newConnectionType = undefined;
	}
</script>

<Fieldset>
	<P>
		<strong>{$LL.servers()}</strong>
	</P>

	<div class="connections">
		<div class="connections__add">
			{#key newConnectionType}
				<FieldSelect
					name="connectionType"
					isLabelVisible={false}
					label={$LL.connectionType()}
					placeholder={$LL.connectionType()}
					options={[
						{ value: ConnectionType.Ollama, label: $LL.ollama() },
						{ value: ConnectionType.OpenAI, label: $LL.openAIOfficialAPI() },
						{ value: ConnectionType.OpenAICompatible, label: $LL.openAICompatible() }
					]}
					bind:value={newConnectionType}
				/>
			{/key}
			<Button disabled={!newConnectionType} on:click={addServer}>
				{$LL.addConnection()}
			</Button>
		</div>
	</div>

	<div class="servers">
		{#if !$serversStore.length}
			<div
				class="col-span-full -mt-3 flex text-balance rounded-md border border-shade-3 text-center"
			>
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
</style>
