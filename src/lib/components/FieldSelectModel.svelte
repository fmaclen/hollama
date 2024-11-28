<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { serversStore, settingsStore } from '$lib/localStorage';
	import { type Model } from '$lib/settings';

	import FieldSelect from './FieldSelect.svelte';

	interface Props {
		isLabelVisible?: boolean;
		value?: string;
	}

	let { isLabelVisible = true, value = $bindable() }: Props = $props();

	const disabled = $derived(!$settingsStore.models?.length);
	const models = $derived($settingsStore.models?.map(formatModelToSelectOption));
	const lastUsedModels = $derived($settingsStore.lastUsedModels?.map(formatModelToSelectOption));
	const otherModels = $derived(
		models?.filter((m) => !lastUsedModels?.some((lm) => lm.value === m.value)) || []
	);

	type ModelOption = {
		value: string;
		label: string;
		badge?: string | string[];
	};

	function formatModelToSelectOption(model: Model): ModelOption {
		const badges: string[] = [];
		const modelServer = $serversStore.find((s) => s.id === model.serverId);
		if (model.parameterSize) badges.push(model.parameterSize);
		badges.push(modelServer?.label || modelServer?.connectionType || '');
		return { value: model.name, label: model.name, badge: badges };
	}

	// Auto-select model when there is only one available
	$effect(() => {
		if (!value && otherModels?.length === 1) value = otherModels[0].value;
	});
</script>

<FieldSelect
	name="model"
	{disabled}
	placeholder={isLabelVisible ? $LL.search() : $LL.availableModels()}
	label={$LL.availableModels()}
	{isLabelVisible}
	options={[
		// Only include lastUsedModels if they exist
		...(lastUsedModels?.length ? [{ label: $LL.lastUsedModels(), options: lastUsedModels }] : []),
		{ label: $LL.otherModels(), options: otherModels }
	]}
	bind:value
/>
