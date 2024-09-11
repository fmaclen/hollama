<script lang="ts">
	import { Combobox, type Selected } from 'bits-ui';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import type { LocalizedString } from 'typesafe-i18n';

	import Field from '$lib/components/Field.svelte';

	export let name: string;
	export let label: LocalizedString;
	export let disabled: boolean | undefined = false;
	export let options: Selected<string>[] = [];
	export let value: string | undefined = undefined;
	export let placeholder: string = '';
	export let onChange: (value: Selected<string>) => void = () => {};

	$: isDisabled = disabled || options.length === 0;

	let inputValue = '';
	let selected: Selected<string> | undefined = value ? { value } : undefined;
	let touchedInput = false;

	$: filteredOptions =
		inputValue && touchedInput
			? options.filter((o) => o.label?.toLowerCase().includes(inputValue.toLowerCase()))
			: options;

	$: if (!touchedInput && value) inputValue = value;

	function handleChange(e: Selected<string>) {
		if (e) {
			value = e.value;
			selected = e;
			onChange(e);
		}
	}
</script>

<Field {name} disabled={isDisabled} hasNav={$$slots.nav}>
	<svelte:fragment slot="label">{label}</svelte:fragment>
	<Combobox.Root
		bind:touchedInput
		bind:inputValue
		{selected}
		disabled={isDisabled}
		items={filteredOptions}
		onSelectedChange={(e) => e && handleChange(e)}
	>
		<div class="field-select-input">
			<Combobox.Input
				spellcheck="false"
				class="field-combobox-input"
				{placeholder}
				id={name}
				disabled={isDisabled}
				aria-labelledby={`${name}-label`}
			/>
			<div class="field-select-icon">
				<ChevronsUpDown class="h-4 w-4" />
			</div>
		</div>

		<Combobox.Content sideOffset={4} class="field-combobox-content">
			{#each filteredOptions as option}
				<Combobox.Item value={option.value} label={option.label} class="field-combobox-item">
					<Combobox.ItemIndicator class="field-combobox-item-indicator">
						<Check class="h-4 w-4" />
					</Combobox.ItemIndicator>
					<div class="field-combobox-item-label">
						{option.label}
					</div>
				</Combobox.Item>
			{:else}
				<span class="field-select-empty">No results found</span>
			{/each}
		</Combobox.Content>
	</Combobox.Root>

	<svelte:fragment slot="nav">
		<slot name="nav" />
	</svelte:fragment>
</Field>

<style lang="postcss">
	.field-select-input {
		@apply relative flex items-center;
	}

	.field-select-icon {
		@apply absolute bottom-3 right-2.5;
	}

	.field-select-empty {
		@apply px-3 text-sm text-muted;
	}

	/* Bits UI */

	:global(.field-combobox-input) {
		@apply base-input text-sm;
	}

	:global(.field-combobox-content) {
		@apply relative z-10 max-h-64 max-w-full overflow-y-auto rounded-md bg-shade-0 py-1 shadow-md;
	}

	:global(.field-combobox-item) {
		@apply grid grid-cols-[24px,auto,max-content] items-center px-3 py-1 text-sm;
	}

	:global(.field-combobox-item[data-highlighted]) {
		@apply bg-shade-1;
	}

	:global(.field-combobox-item-label) {
		@apply w-full;
	}
</style>
