<script lang="ts">
	import { settingsStore } from '$lib/store';
	import FieldSelect from './FieldSelect.svelte';

	export let disabled: boolean = false;

	let value: string = $settingsStore?.ollamaModel || '';
	$: if ($settingsStore) $settingsStore.ollamaModel = value;
</script>

<FieldSelect
	label="Available models"
	name="model"
	options={$settingsStore?.ollamaModels.map((m) => ({ value: m.name, option: m.name }))}
	disabled={disabled || !$settingsStore?.ollamaModels.length}
	bind:value
/>
