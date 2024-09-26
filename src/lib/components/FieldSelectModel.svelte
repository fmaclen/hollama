<script lang="ts">
	import type { Selected } from 'bits-ui';

	import LL from '$i18n/i18n-svelte';
	import { sessionsStore, settingsStore } from '$lib/localStorage';

	import FieldSelect from './FieldSelect.svelte';

	export let model: string | undefined = $settingsStore.ollamaModel || '';

	type ModelOption = {
		value: string;
		label: string;
		badge?: string;
	};

	$: disabled = !$settingsStore.ollamaModels.length;
	$: models = $settingsStore.ollamaModels.map((m) => ({
		value: m.name,
		label: m.name,
		badge: m.details.parameter_size
	}));
	$: lastUsedModels = (() => {
		const currentSessions = $sessionsStore;
		const lastUsedModels: ModelOption[] = [];

		for (const session of currentSessions) {
			if (!lastUsedModels.find((m) => m.value === session.model))
				lastUsedModels.push({
					value: session.model,
					label: session.model,
					badge: models.find((model) => model.value === session.model)?.badge
				});

			if (lastUsedModels.length >= 5) break;
		}

		return lastUsedModels;
	})();
	$: otherModels = models.filter((m) => !lastUsedModels.some((lm) => lm.value === m.value));

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
		{ label: $LL.otherModels(), options: otherModels }
	]}
	onChange={handleChange}
	bind:value={model}
/>
