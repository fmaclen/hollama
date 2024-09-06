<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { settingsStore } from '$lib/localStorage';

	import FieldSelect from './FieldSelect.svelte';

	export let disabled: boolean = false;
	let items: { value: string; label: string; group?: string }[] = [];
	let initialValue: string = $settingsStore.ollamaModel || '';
	let value: string = initialValue;
	$: $settingsStore.ollamaModel = value;
	$: items = $settingsStore.ollamaModels.map((m) => ({ value: m.name, label: m.name }));
</script>

<FieldSelect
	name="model"
	label={$LL.availableModels()}
	disabled={disabled || !$settingsStore.ollamaModels.length}
	{items}
	bind:value={initialValue}
/>
