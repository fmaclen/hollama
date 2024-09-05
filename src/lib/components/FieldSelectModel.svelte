<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { settingsStore } from '$lib/store';

	import FieldSelect from './FieldSelect.svelte';

	export let disabled: boolean = false;

	let value: string = $settingsStore.ollamaModel || '';
	$: $settingsStore.ollamaModel = value;
</script>

<FieldSelect
	label={$LL.availableModels()}
	name="model"
	options={$settingsStore.ollamaModels.map((m) => ({ value: m.name, option: m.name }))}
	disabled={disabled || !$settingsStore.ollamaModels.length}
	bind:value
/>
