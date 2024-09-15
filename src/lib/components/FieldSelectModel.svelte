<script lang="ts">
	import type { Selected } from 'bits-ui';

	import LL from '$i18n/i18n-svelte';
	import { settingsStore } from '$lib/localStorage';

	import FieldSelect from './FieldSelect.svelte';

	let value: string | undefined = $settingsStore.ollamaModel || '';

	$: disabled = !$settingsStore.ollamaModels.length;
	$: models = $settingsStore.ollamaModels.map((m) => ({ value: m.name, label: m.name }));

	function handleChange(e: Selected<string>) {
		$settingsStore.ollamaModel = e.value;
	}
</script>

<FieldSelect
	name="model"
	{disabled}
	placeholder={$LL.search()}
	label={$LL.availableModels()}
	options={models}
	onChange={handleChange}
	bind:value
/>
