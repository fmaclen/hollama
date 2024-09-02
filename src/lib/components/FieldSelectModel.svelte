<script lang="ts">
	import i18n from '$lib/i18n';
	import { settingsStore } from '$lib/store';
	import FieldSelect from './FieldSelect.svelte';

	export let disabled: boolean = false;
	let items: { value: string; label: string, group?: string }[] = [];
	let initialValue: string = $settingsStore.ollamaModel || '';
	let value: string = initialValue;
	$: $settingsStore.ollamaModel = value;
	$: items = $settingsStore.ollamaModels.map((m) => ({ value: m.name, label: m.name }))
</script>

<FieldSelect
	name="model"
	label={$i18n.t('settingsPage.availableModels')}
	disabled={disabled || !$settingsStore.ollamaModels.length}
	{items}
	bind:value={initialValue}
/>
