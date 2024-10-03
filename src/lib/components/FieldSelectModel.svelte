<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { settingsStore } from '$lib/localStorage';
	import { getLastUsedModels } from '$lib/sessions';

	import FieldSelect from './FieldSelect.svelte';

	export let model: string | undefined;

	type ModelOption = {
		value: string;
		label: string;
		badge?: string | string[];
	};

	let disabled: boolean;
	let models: ModelOption[] = [];
	let lastUsedModels: ModelOption[] = [];
	let otherModels: ModelOption[] = [];

	$: disabled = !$settingsStore.models.length;
	$: models = $settingsStore.models.map((m) => ({
		value: m.name,
		label: m.name,
		badge: m.details.parameter_size
	}));
	$: lastUsedModels = getLastUsedModels().map((m) => ({
		value: m.name,
		label: m.name,
		badge: [m.details.parameter_size, m.api]
	}));
	$: otherModels = models.filter((m) => !lastUsedModels.some((lm) => lm.value === m.value));
</script>

<FieldSelect
	name="model"
	{disabled}
	placeholder={$LL.search()}
	label={$LL.availableModels()}
	options={[
		{ label: $LL.lastUsedModels(), options: lastUsedModels },
		{ label: $LL.otherModels(), options: otherModels }
	]}
	bind:value={model}
/>
