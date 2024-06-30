<script lang="ts">
	import { settingsStore } from '$lib/store';
	import Field from './Field.svelte';

	export let disabled: boolean = false;

	let value: string = $settingsStore?.ollamaModel || '';
	$: if ($settingsStore) $settingsStore.ollamaModel = value;
</script>

<Field name="model">
	<span slot="title">Model</span>
	<select id="model" class="select" disabled={disabled || !$settingsStore?.ollamaModels.length} bind:value>
		{#if $settingsStore}
			{#each $settingsStore.ollamaModels as model}
				<option value={model.name}>{model.name}</option>
			{/each}
		{/if}
	</select>
</Field>

<style lang="scss">
	.select {
		@apply flex h-10 w-full rounded-md border border-input bg-elevation-50 focus:bg-elevation-0 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
	}
</style>
