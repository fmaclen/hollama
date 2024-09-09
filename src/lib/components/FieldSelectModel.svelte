<script lang="ts">
	import { Combobox, type Selected } from 'bits-ui';
	import { Check, ChevronsUpDown } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';
	import { settingsStore } from '$lib/localStorage';

	import Field from './Field.svelte';

	const MODEL_FIELD_NAME = 'model';
	let inputValue = '';
	let selected: Selected<string> | undefined;
	let touchedInput = false;

	$: disabled = !$settingsStore.ollamaModels.length;

	$: models = $settingsStore.ollamaModels.map((m) => ({ value: m.name, label: m.name }));

	// Filter the models based on the input value
	$: filteredModels =
		inputValue && touchedInput && models
			? models.filter((m) => m.value.includes(inputValue))
			: models;

	// Set the selected model when the component loads and there is no selected model
	$: if ($settingsStore.ollamaModel && !selected) selected = { value: $settingsStore.ollamaModel };

	// Updates the current model in the store
	function handleUpdateModel(model: string) {
		inputValue = model;
		$settingsStore.ollamaModel = model;
	}
</script>

<Field name={MODEL_FIELD_NAME}>
	<svelte:fragment slot="label">
		{$LL.availableModels()}
	</svelte:fragment>
	<Combobox.Root
		bind:touchedInput
		bind:inputValue
		{selected}
		{disabled}
		items={filteredModels}
		onSelectedChange={(e) => e && handleUpdateModel(e.value)}
	>
		<div class="relative flex items-center">
			<Combobox.Input
				id={MODEL_FIELD_NAME}
				spellcheck="false"
				class="base-input text-sm"
				placeholder={$LL.search()}
				aria-label={$LL.search()}
			/>
			<div class="absolute bottom-3 right-2.5">
				<ChevronsUpDown class="h-4 w-4" />
			</div>
		</div>

		<Combobox.Content
			sideOffset={4}
			class="relative z-10 max-h-64 max-w-full overflow-y-auto rounded-md bg-shade-0 py-1 shadow-md"
		>
			{#each filteredModels as model}
				<Combobox.Item
					value={model.value}
					label={model.label}
					class="relative flex w-full flex-row px-8 py-1 text-sm data-[highlighted]:bg-shade-1"
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
				<span class="px-3 text-sm text-muted">{$LL.searchEmpty()}</span>
			{/each}
		</Combobox.Content>
		<Combobox.HiddenInput name={MODEL_FIELD_NAME} />
	</Combobox.Root>
</Field>
