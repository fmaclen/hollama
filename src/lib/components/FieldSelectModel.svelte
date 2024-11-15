<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { type Model } from '$lib/chat';
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

	function formatModelToSelectOption(model: Model): ModelOption {
		const badges: string[] = [];
		if (model.parameterSize) badges.push(model.parameterSize);
		badges.push($settingsStore.servers.find((s) => s.id === model.serverId)?.connectionType || '');

		return { value: model.name, label: model.name, badge: badges };
	}

	$: disabled = !$settingsStore.models?.length;
	$: models = $settingsStore.models?.map(formatModelToSelectOption);
	$: lastUsedModels = $settingsStore.lastUsedModels?.map(formatModelToSelectOption);
	$: otherModels = models?.filter((m) => !lastUsedModels?.some((lm) => lm.value === m.value)) || [];
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
