<script lang="ts">
	import { Combobox, Label, type Selected } from 'bits-ui';
	import { Check, ChevronDown } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';
	import { settingsStore } from '$lib/localStorage';

	import Fruits from './Fruits.svelte';

	const INPUT_ID = 'model';
	let inputValue = '';
	let selected: Selected<string> | undefined;
	let touchedInput = false;

	// $: console.log('ollamaModels', $settingsStore.ollamaModels);
	// $: console.log('ollamaModel', $settingsStore.ollamaModel);
	$: console.log('selected', selected);
	$: console.log('$settingsStore.ollamaModel', $settingsStore.ollamaModel);

	$: models = $settingsStore.ollamaModels.map((m) => ({ value: m.name, label: m.name }));
	$: if ($settingsStore.ollamaModel)
		selected = { value: $settingsStore.ollamaModel, label: $settingsStore.ollamaModel };
	$: filteredModels =
		inputValue && touchedInput && models
			? models.filter((m) => m.value.includes(inputValue))
			: models;
	$: $settingsStore.ollamaModel = inputValue.trim();
</script>

<Label.Root
	for={INPUT_ID}
	class="flex w-full flex-col gap-y-1 rounded-md border bg-shade-0 text-sm"
>
	<div class="flex items-center gap-x-2 px-3 pb-0.5 pt-3 text-xs font-medium leading-none">
		{$LL.availableModels()}
	</div>

	<Combobox.Root
		bind:touchedInput
		bind:inputValue
		onOpenChange={(isOpening) => (inputValue = isOpening ? '' : $settingsStore.ollamaModel ?? '')}
		{selected}
		items={filteredModels}
		disabled={!$settingsStore.ollamaModels.length}
	>
		<div class="flex pr-4">
			<Combobox.Input
				id={INPUT_ID}
				class="base-input text-sm"
				placeholder="Search a model"
				aria-label="Search a model"
			/>
			<ChevronDown class="h-4 w-4" />
		</div>

		<Combobox.Content
			sideOffset={4}
			class="max-h-96 overflow-y-auto rounded-md bg-shade-0 shadow-md"
		>
			{#each filteredModels as model (model.value)}
				<Combobox.Item
					value={model}
					class="flex w-full flex-row px-3 py-1 text-sm data-[highlighted]:bg-warning-muted"
				>
					<div class="w-full">
						{model.label}
					</div>
					<Combobox.ItemIndicator>
						<Check class="h-4 w-4" />
					</Combobox.ItemIndicator>
				</Combobox.Item>
			{:else}
				<span>No results found</span>
			{/each}
		</Combobox.Content>
	</Combobox.Root>
</Label.Root>

