<script lang="ts">
	import { Combobox, type Selected } from 'bits-ui';
	import { Check, ChevronsUpDown, X } from 'lucide-svelte';
	import type { LocalizedString } from 'typesafe-i18n';

	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';

	export let name: string;
	export let label: LocalizedString;
	export let disabled: boolean | undefined = false;
	export let options: Selected<string>[] = [];
	export let value: string | undefined = undefined;
	export let placeholder: string = '';
	export let onChange: (value: Selected<string>) => void = () => {};

	const noSelection = { value: '', label: '' };

	let inputValue = '';
	let selected: Selected<string> | undefined = value
		? { value, label: options.find((o) => o.value === value)?.label }
		: undefined;
	let touchedInput = false;
	let open = false;

	$: isDisabled = disabled || options.length === 0;

	$: filteredOptions =
		inputValue && touchedInput
			? options.filter((o) => o.label?.toLowerCase().includes(inputValue.toLowerCase()))
			: options;

	function handleOnSelectedChange(e: Selected<string> | undefined) {
		if (e) {
			value = e.value;
			selected = e;
			onChange(e);
		}
	}

	function handleOpenChange(wasMenuOpened: boolean) {
		if (!wasMenuOpened) {
			if (inputValue) {
				inputValue = selected?.label ?? '';
			} else {
				handleClear();
			}
		}
	}

	function handleClear() {
		value = undefined;
		selected = noSelection;
		onChange(noSelection);
	}
</script>

<Field {name} disabled={isDisabled} hasNav={$$slots.nav}>
	<svelte:fragment slot="label">{label}</svelte:fragment>
	<Combobox.Root
		bind:touchedInput
		bind:inputValue
		bind:open
		{selected}
		disabled={isDisabled}
		items={filteredOptions}
		onSelectedChange={handleOnSelectedChange}
		onOpenChange={handleOpenChange}
	>
		<div class="field-select-input">
			<Combobox.Input
				spellcheck="false"
				class="field-combobox-input"
				placeholder={selected?.value ? selected.label : placeholder}
				id={name}
				disabled={isDisabled}
				aria-labelledby={`${name}-label`}
			/>

			<nav class="field-select-nav">
				{#if selected?.value}
					<Button
						variant="icon"
						on:click={handleClear}
						title={$LL.clear()}
						class="pointer-events-auto"
					>
						<X class="base-icon" />
					</Button>
				{/if}

				<button class="pointer-events-none py-2 pr-1">
					<ChevronsUpDown class="base-icon text-muted" />
				</button>
			</nav>
		</div>

		<Combobox.Content sideOffset={4} class="field-combobox-content">
			{#each filteredOptions as option}
				<Combobox.Item value={option.value} label={option.label} class="field-combobox-item">
					<Combobox.ItemIndicator class="field-combobox-item-indicator">
						<Check class="base-icon" />
					</Combobox.ItemIndicator>
					<div class="field-combobox-item-label">
						{option.label}
					</div>
				</Combobox.Item>
			{:else}
				<span class="field-select-empty">{$LL.searchEmpty()}</span>
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

	.field-select-nav {
		@apply pointer-events-none absolute bottom-0 right-0 m-1 flex items-center;
	}

	.field-select-empty {
		@apply block w-full px-3 py-1 text-center text-sm text-muted;
	}

	/* Bits UI */

	:global(.field-combobox-input) {
		@apply base-input pr-14 text-sm;
	}

	:global(.field-combobox-content) {
		@apply overflow-scrollbar relative z-10 max-h-64 max-w-full rounded-md bg-shade-0 py-1 shadow-md;
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
