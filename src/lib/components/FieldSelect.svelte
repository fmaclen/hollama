<script lang="ts">
	// HACK: `svelte-select` doesn't have type definitions for the no-styles version
	// REF https://github.com/rob-balfre/svelte-select/pull/665
	// @ts-ignore
	import Select from 'svelte-select/no-styles/Select.svelte';
	import type { LocalizedString } from 'typesafe-i18n';

	import Field from './Field.svelte';

	export let name: string;
	export let label: LocalizedString;
	export let disabled: boolean | undefined = false;
	export let items: { value: string; label: string; group?: string }[] = [];
	export let value: string | null = null;

	function groupBy(item: { value: string; label: string; group?: string }) {
		return item.group;
	}
</script>

<Field {name} {disabled} hasNav={$$slots.nav}>
	<svelte:fragment slot="label">{label}</svelte:fragment>
	<Select id={name} {items} {disabled} {groupBy} showChevron={true} bind:value />

	<svelte:fragment slot="nav">
		<slot name="nav" />
	</svelte:fragment>
</Field>

<style lang="postcss">
	:global(.svelte-select) {
		@apply flex;
	}

	:global(.svelte-select .value-container) {
		@apply relative w-full;
	}

	:global(.svelte-select .value-container .selected-item) {
		@apply base-input;
	}

	:global(.svelte-select .value-container .hide-selected-item) {
		@apply opacity-0;
	}

	:global(.svelte-select .value-container input) {
		@apply base-input absolute inset-0 w-full;
	}

	:global(.svelte-select .indicators) {
		@apply flex items-start gap-x-4 px-3 pb-2;
	}

	:global(.svelte-select .indicators .icon svg) {
		@apply h-5 w-5 opacity-50;
	}

	:global(.svelte-select .a11y-text) {
		@apply hidden;
	}

	:global(.svelte-select .svelte-select-list) {
		@apply focused-outline max-h-[33dvh] overflow-y-auto rounded-md border border-shade-4 bg-shade-0;
	}

	:global(.svelte-select .list-item) {
		@apply list-none;
	}

	:global(.svelte-select .empty) {
		@apply w-full text-muted;
	}

	:global(.svelte-select .empty),
	:global(.svelte-select .item),
	:global(.svelte-select .group-item) {
		@apply cursor-pointer px-3 py-1.5;
	}

	:global(.svelte-select .hover) {
		@apply bg-shade-1;
	}

	:global(.svelte-select .list-group-title) {
		@apply border-b border-shade-2 px-3 py-2 text-xs font-medium text-muted;
	}
</style>
