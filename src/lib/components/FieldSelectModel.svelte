<script lang="ts">
	import { Combobox, Label, type Selected } from 'bits-ui';
	import { Check, ChevronDown } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';
	import { settingsStore } from '$lib/localStorage';

	const INPUT_ID = 'model';
	let inputValue = '';
	let selected: Selected<string> | undefined;
	let touchedInput = false;

	$: models = $settingsStore.ollamaModels.map((m) => ({ value: m.name, label: m.name }));

	// Filter the models based on the input value
	$: filteredModels =
		inputValue && touchedInput && models
			? models.filter((m) => m.value.includes(inputValue))
			: models;

	// Set the selected model when the component loads and there is no selected model
	$: if ($settingsStore.ollamaModel && !selected) selected = { value: $settingsStore.ollamaModel };

	// Updates the current model in the store
	$: if ($settingsStore.ollamaModels.some((m) => m.name === inputValue))
		$settingsStore.ollamaModel = inputValue;
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
		{selected}
		items={filteredModels}
		disabled={!$settingsStore.ollamaModels}
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
			class="z-10 max-h-64 overflow-y-auto rounded-md bg-shade-0 shadow-md"
		>
			{#each filteredModels as model}
				<Combobox.Item
					value={model.value}
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
		<Combobox.HiddenInput name={INPUT_ID} />
	</Combobox.Root>
</Label.Root>
