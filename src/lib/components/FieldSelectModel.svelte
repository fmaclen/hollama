<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { getLastUsedModels } from '$lib/chat';
	import { settingsStore } from '$lib/localStorage';

	import FieldSelect from './FieldSelect.svelte';

	export let model: string | undefined;
	export let isLabelVisible: boolean | undefined = true;

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
		badge: [m.details.parameter_size, m.api]
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
	placeholder={isLabelVisible ? $LL.search() : $LL.availableModels()}
	label={$LL.availableModels()}
	{isLabelVisible}
	options={[
		{ label: $LL.lastUsedModels(), options: lastUsedModels },
		{ label: $LL.otherModels(), options: otherModels }
	]}
	bind:value={model}
/>
