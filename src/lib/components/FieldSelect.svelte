<script lang="ts">
	import { Combobox, type Selected } from 'bits-ui';
	import { Check, ChevronsUpDown, X } from 'lucide-svelte';
	import type { LocalizedString } from 'typesafe-i18n';

	import LL from '$i18n/i18n-svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';

	export let name: string;
	export let label: LocalizedString;
	export let disabled: boolean | undefined = false;
	export let options: OptionOrGroup[] = [];
	export let value: string | undefined = undefined;
	export let placeholder: string = '';
	export let allowClear: boolean = true;
	export let allowSearch: boolean = true;
	export let isLabelVisible: boolean | undefined = true;
	export let onChange: (value: Option) => void = () => {};

	type Option = Selected<string> & { badge?: string | string[] };
	type OptionGroup = { label: string; options: Option[] };
	type OptionOrGroup = Option | OptionGroup;

	const noSelection: Option = { value: '', label: '' };

	let inputValue = '';
	let selected: Option | undefined;
	let touchedInput = false;
	let open = false;

	$: isDisabled = disabled || options.length === 0;
	$: selected = value
		? options.flatMap((o) => ('options' in o ? o.options : o)).find((o) => o.value === value)
		: undefined;

	$: filteredOptions =
		inputValue && touchedInput
			? options
					.map((group) => {
						if ('options' in group) {
							return {
								label: group.label,
								options: group.options.filter((o) =>
									o.label?.toLowerCase().includes(inputValue.toLowerCase())
								)
							};
						}
						return group.label?.toLowerCase().includes(inputValue.toLowerCase()) ? group : null;
					})
					.filter(
						(group): group is NonNullable<typeof group> & OptionOrGroup =>
							group !== null && (!('options' in group) || group.options.length > 0)
					)
			: options;

	function handleOnSelectedChange(e: Option | undefined) {
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
		requestAnimationFrame(() => {
			selected = noSelection;
			onChange(noSelection);
		});
	}
</script>

<Field {name} disabled={isDisabled} hasNav={$$slots.nav} {isLabelVisible}>
	<svelte:fragment slot="label">{label}</svelte:fragment>
	<Combobox.Root
		bind:touchedInput
		bind:inputValue
		bind:open
		{selected}
		disabled={isDisabled}
		items={filteredOptions.flatMap((o) => ('options' in o ? o.options : o))}
		onSelectedChange={handleOnSelectedChange}
		onOpenChange={handleOpenChange}
	>
		<div class="field-select-input">
			<Combobox.Input
				spellcheck="false"
				class="field-combobox-input {isLabelVisible ? '' : 'field-combobox-input--no-label'}"
				placeholder={selected?.value ? selected.label : placeholder}
				id={name}
				disabled={isDisabled}
				aria-labelledby={`${name}-label`}
				readonly={allowSearch ? null : true}
			/>

			<nav class="field-select-nav">
				{#if allowClear && selected?.value}
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
			{#each filteredOptions as group (group.label)}
				{#if 'options' in group}
					<div class="field-combobox-group">
						<div class="field-combobox-group-label">{group.label}</div>
						{#if group.options.length > 0}
							{#each group.options as option (option.value)}
								{#if option.label}
									<Combobox.Item
										value={option.value}
										label={option.label}
										class="field-combobox-item"
									>
										<Combobox.ItemIndicator class="field-combobox-item-indicator">
											<Check class="base-icon" />
										</Combobox.ItemIndicator>
										<div class="field-combobox-item-label">
											<span class="field-combobox-item-label-option" title={option.label}>
												{option.label}
											</span>
											{#if option.badge}
												{#if Array.isArray(option.badge)}
													<div class="field-select-badge">
														{#each option.badge as badge (badge)}
															<Badge
																variant={badge === 'openai' || badge === 'ollama'
																	? badge
																	: undefined}
															>
																{badge}
															</Badge>
														{/each}
													</div>
												{:else}
													<Badge>{option.badge}</Badge>
												{/if}
											{/if}
										</div>
									</Combobox.Item>
								{/if}
							{/each}
						{:else}
							<span class="field-select-empty">{$LL.noRecentModels()}</span>
						{/if}
					</div>
				{:else}
					<Combobox.Item value={group.value} label={group.label} class="field-combobox-item">
						<Combobox.ItemIndicator class="field-combobox-item-indicator">
							<Check class="base-icon" />
						</Combobox.ItemIndicator>
						<div class="field-combobox-item-label">
							{group.label}
							{#if group.badge}
								<Badge>{group.badge}</Badge>
							{/if}
						</div>
					</Combobox.Item>
				{/if}
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

	.field-select-badge {
		@apply flex gap-x-1;
	}

	/* Bits UI */

	:global(.field-combobox-input) {
		@apply base-input pr-14 text-sm;
	}

	:global(.field-combobox-input--no-label) {
		@apply py-2.5;
	}

	:global(.field-combobox-content) {
		@apply overflow-scrollbar relative z-10 max-h-64 max-w-full rounded-md bg-shade-0 shadow-md;
	}

	:global(.field-combobox-item) {
		@apply grid grid-cols-[24px,auto,max-content] items-center px-3 py-1.5 text-sm;
	}

	:global(.field-combobox-item[data-highlighted]) {
		@apply bg-shade-1;
	}

	:global(.field-combobox-item-label) {
		@apply grid w-full cursor-pointer grid-cols-[auto,max-content] gap-x-1;
	}

	:global(.field-combobox-item-label-option) {
		@apply overflow-hidden text-ellipsis text-nowrap;
	}

	:global(.field-combobox-group-label) {
		@apply sticky top-0 border-b border-shade-3 bg-shade-2 px-3 py-2 text-xs font-semibold text-muted;
	}
</style>
