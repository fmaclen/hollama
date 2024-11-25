<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { Writable } from 'svelte/store';

	import LL from '$i18n/i18n-svelte';
	import { serversStore, settingsStore } from '$lib/localStorage';
	import type { Session } from '$lib/sessions';
	import { type Model } from '$lib/settings';

	import FieldSelect from './FieldSelect.svelte';

	export let session: Writable<Session>;
	export let isLabelVisible: boolean | undefined = true;

	type ModelOption = {
		value: string;
		label: string;
		badge?: string | string[];
	};

	let modelName: string | undefined;
	let disabled: boolean;
	let models: ModelOption[] = [];
	let lastUsedModels: ModelOption[] = [];
	let otherModels: ModelOption[] = [];

	function formatModelToSelectOption(model: Model): ModelOption {
		const badges: string[] = [];
		const modelServer = $serversStore.find((s) => s.id === model.serverId);
		if (model.parameterSize) badges.push(model.parameterSize);
		badges.push(modelServer?.label || modelServer?.connectionType || '');
		return { value: model.name, label: model.name, badge: badges };
	}

	beforeUpdate(() => {
		modelName = $session.model?.name || undefined;
	});

	$: $session.model = $settingsStore.models.find((m) => m.name === modelName);
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
	bind:value={modelName}
/>
