<script lang="ts">
	import i18n from '$lib/i18n';
	import { settingsStore } from '$lib/store';
	import FieldSelect from './FieldSelect.svelte';

	export let disabled: boolean = false;

	let value: string = $settingsStore.ollamaModel || '';
	$: $settingsStore.ollamaModel = value;
</script>

<FieldSelect
	label={$i18n.t('settingsPage.availableModels')}
	name="model"
	options={$settingsStore.ollamaModels.map((m) => ({ value: m.name, option: m.name }))}
	disabled={disabled || !$settingsStore.ollamaModels.length}
	bind:value
/>
