<script lang="ts">
	import type { Selected } from 'bits-ui';

	import LL from '$i18n/i18n-svelte';
	import { settingsStore } from '$lib/localStorage';
	import { getLastUsedModels } from '$lib/sessions';

	import FieldSelect from './FieldSelect.svelte';

	let value: string | undefined = $settingsStore.ollamaModel || '';

	$: disabled = !$settingsStore.ollamaModels.length;
	$: models = $settingsStore.ollamaModels.map((m) => ({
		value: m.name,
		label: m.name,
		extra: m.details.parameter_size
	}));
	$: lastUsedModels = getLastUsedModels().map((m) => ({
		value: m,
		label: m,
		extra: models.find((model) => model.value === m)?.extra
	}));

	function handleChange(e: Selected<string>) {
		$settingsStore.ollamaModel = e.value;
	}
</script>

<FieldSelect
	name="model"
	{disabled}
	placeholder={$LL.search()}
	label={$LL.availableModels()}
	options={[
		{ label: $LL.lastUsedModels(), options: lastUsedModels },
		{ label: $LL.allModels(), options: models }
	]}
	onChange={handleChange}
	bind:value
/>
