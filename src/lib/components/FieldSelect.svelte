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
			? options.filter((o) => o.value.toLowerCase().includes(inputValue.toLowerCase()))
			: options;

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
		<div class="relative flex items-center">
			<Combobox.Input
				spellcheck="false"
				class="base-input text-sm"
				{placeholder}
				id={name}
				disabled={isDisabled}
				aria-labelledby={`${name}-label`}
			/>
			<div class="absolute bottom-3 right-2.5">
				<ChevronsUpDown class="h-4 w-4" />
			</div>
		</div>

		<Combobox.Content
			sideOffset={4}
			class="relative z-10 max-h-64 max-w-full overflow-y-auto rounded-md bg-shade-0 py-1 shadow-md"
		>
			{#each filteredOptions as option}
				<Combobox.Item
					value={option.value}
					label={option.label}
					class="relative flex w-full flex-row px-8 py-1 text-sm data-[highlighted]:bg-shade-1"
				>
					<div class="absolute left-2 top-1/2 -translate-y-1/2">
						<Combobox.ItemIndicator>
							<Check class="h-4 w-4" />
						</Combobox.ItemIndicator>
					</div>

					<div class="w-full">
						{option.label}
					</div>
				</Combobox.Item>
			{:else}
				<span class="px-3 text-sm text-muted">No results found</span>
			{/each}
		</Combobox.Content>
	</Combobox.Root>

	<svelte:fragment slot="nav">
		<slot name="nav" />
	</svelte:fragment>
</Field>
