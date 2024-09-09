<script lang="ts">
	import { Combobox, Label, type Selected } from 'bits-ui';
	import { Check, ChevronDown, ChevronsUpDown } from 'lucide-svelte';

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

<Combobox.Root
	bind:touchedInput
	bind:inputValue
	{selected}
	items={filteredModels}
	disabled={!$settingsStore.ollamaModels}
>
	<Label.Root
		for={INPUT_ID}
		class="relative flex w-full flex-col gap-y-1 rounded-md border bg-shade-0 text-sm"
	>
		<div class="flex items-center gap-x-2 px-3 pb-0.5 pt-3 text-xs font-medium leading-none">
			{$LL.availableModels()}
		</div>

		<div class="relative flex items-center">
			<Combobox.Input
				id={INPUT_ID}
				class="base-input text-sm"
				placeholder="Search a model"
				aria-label="Search a model"
			/>
			<div class="absolute bottom-3 right-2.5">
				<ChevronsUpDown class="h-4 w-4" />
			</div>
		</div>

		<Combobox.Content
			sideOffset={4}
			class="z-10 max-h-64 overflow-y-auto rounded-md bg-shade-0 shadow-md py-1 -translate-x-[1px]"
		>
			{#each filteredModels as model}
				<Combobox.Item
					value={model.value}
					class="flex w-full flex-row py-1 pl-8 pr-2 text-sm data-[highlighted]:bg-warning-muted relative"
				>
					<div class="absolute left-2 top-1/2 -translate-y-1/2">
						<Combobox.ItemIndicator>
							<Check class="h-4 w-4" />
						</Combobox.ItemIndicator>
					</div>

					<div class="w-full">
						{model.label}
					</div>
				</Combobox.Item>
			{:else}
				<span>No results found</span>
			{/each}
		</Combobox.Content>
		<Combobox.HiddenInput name={INPUT_ID} />
	</Label.Root>
</Combobox.Root>
